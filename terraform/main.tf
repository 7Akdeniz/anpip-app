# ========================================
# TERRAFORM - MULTI-REGION INFRASTRUCTURE
# ========================================
# AWS, GCP, Azure Multi-Cloud Deployment

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }

  backend "s3" {
    bucket = "anpip-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

# ==================== AWS REGIONS ====================
provider "aws" {
  alias  = "us-east"
  region = "us-east-1"
}

provider "aws" {
  alias  = "eu-west"
  region = "eu-west-1"
}

provider "aws" {
  alias  = "ap-southeast"
  region = "ap-southeast-1"
}

# ==================== CDN - CLOUDFLARE ====================
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

resource "cloudflare_zone" "anpip" {
  zone = "anpip.com"
  plan = "enterprise"
}

resource "cloudflare_record" "root" {
  zone_id = cloudflare_zone.anpip.id
  name    = "@"
  value   = aws_lb.global.dns_name
  type    = "CNAME"
  proxied = true
}

# ==================== GLOBAL LOAD BALANCER ====================
resource "aws_lb" "global" {
  provider           = aws.us-east
  name               = "anpip-global-lb"
  internal           = false
  load_balancer_type = "application"
  
  enable_deletion_protection = true
  enable_http2              = true
  enable_cross_zone_load_balancing = true

  subnets = [
    aws_subnet.us_east_1a.id,
    aws_subnet.us_east_1b.id,
    aws_subnet.us_east_1c.id,
  ]
}

# ==================== AUTO-SCALING GROUPS ====================
resource "aws_autoscaling_group" "web_us_east" {
  provider = aws.us-east
  
  name                = "anpip-web-us-east"
  min_size            = 10
  max_size            = 100
  desired_capacity    = 20
  health_check_type   = "ELB"
  
  vpc_zone_identifier = [
    aws_subnet.us_east_1a.id,
    aws_subnet.us_east_1b.id,
    aws_subnet.us_east_1c.id,
  ]

  launch_template {
    id      = aws_launch_template.web.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "anpip-web-instance"
    propagate_at_launch = true
  }
}

# ==================== VIDEO CDN - CLOUDFRONT ====================
resource "aws_cloudfront_distribution" "video_cdn" {
  provider = aws.us-east
  
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "ANPIP Video CDN"
  price_class         = "PriceClass_All"

  origin {
    domain_name = aws_s3_bucket.videos.bucket_regional_domain_name
    origin_id   = "S3-Videos"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.videos.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Videos"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = false
    acm_certificate_arn           = aws_acm_certificate.cdn.arn
    ssl_support_method            = "sni-only"
    minimum_protocol_version      = "TLSv1.2_2021"
  }
}

# ==================== GPU INSTANCES ====================
resource "aws_instance" "gpu_transcoding" {
  provider      = aws.us-east
  count         = 10
  
  ami           = "ami-xxxxxxxxx" # Deep Learning AMI
  instance_type = "p3.2xlarge"    # 1x V100 GPU
  
  tags = {
    Name = "anpip-gpu-transcoding-${count.index}"
    Type = "video-processing"
  }

  user_data = <<-EOF
    #!/bin/bash
    nvidia-smi
    docker run -d --gpus all anpip/video-transcoding:latest
  EOF
}

# ==================== DATABASE - MULTI-REGION ====================
resource "aws_rds_cluster" "postgres" {
  provider = aws.us-east
  
  cluster_identifier      = "anpip-postgres-global"
  engine                  = "aurora-postgresql"
  engine_version          = "15.3"
  database_name           = "anpip"
  master_username         = var.db_username
  master_password         = var.db_password
  
  global_cluster_identifier = aws_rds_global_cluster.global.id
  
  backup_retention_period = 30
  preferred_backup_window = "03:00-04:00"
  
  db_subnet_group_name    = aws_db_subnet_group.postgres.name
  vpc_security_group_ids  = [aws_security_group.postgres.id]
  
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  serverlessv2_scaling_configuration {
    min_capacity = 2
    max_capacity = 128
  }
}

resource "aws_rds_global_cluster" "global" {
  global_cluster_identifier = "anpip-global-db"
  engine                    = "aurora-postgresql"
  engine_version            = "15.3"
  database_name             = "anpip"
}

# ==================== OUTPUTS ====================
output "cdn_domain" {
  value = aws_cloudfront_distribution.video_cdn.domain_name
}

output "load_balancer_dns" {
  value = aws_lb.global.dns_name
}

output "database_endpoint" {
  value = aws_rds_cluster.postgres.endpoint
}

# ==================== VARIABLES ====================
variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "Database Master Username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database Master Password"
  type        = string
  sensitive   = true
}
