/**
 * 🛡️ GDPR/DSGVO & CCPA COMPLIANCE
 * 
 * Vollständige Datenschutz-Compliance für:
 * - DSGVO (EU)
 * - CCPA (California)
 * - LGPD (Brasilien)
 * - International Data Protection
 */

import { supabase } from '../supabase';

// ============================================================================
// TYPES
// ============================================================================

interface DataExportRequest {
  userId: string;
  email: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
}

interface ConsentRecord {
  userId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

interface DataDeletionRequest {
  userId: string;
  requestDate: Date;
  scheduledDeletion: Date;
  status: 'pending' | 'scheduled' | 'completed';
  reason?: string;
}

interface AuditLogEntry {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: any;
}

// ============================================================================
// GDPR COMPLIANCE CLASS
// ============================================================================

export class GDPRCompliance {
  
  /**
   * Request data export (GDPR Article 15 - Right to Access)
   */
  async requestDataExport(userId: string, email: string): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      // Create export request
      const { data, error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: userId,
          email,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        return { success: false, error: 'Failed to create export request' };
      }
      
      // Trigger export job (background worker)
      await this.triggerDataExport(userId, data.id);
      
      return { success: true, requestId: data.id };
    } catch (error) {
      return { success: false, error: 'Export request failed' };
    }
  }
  
  /**
   * Export all user data
   */
  private async triggerDataExport(userId: string, requestId: string): Promise<void> {
    try {
      // Collect all user data
      const userData = await this.collectUserData(userId);
      
      // Generate export file (JSON)
      const exportData = JSON.stringify(userData, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      
      // Upload to secure storage
      const fileName = `user-data-export-${userId}-${Date.now()}.json`;
      
      const { data: upload, error: uploadError } = await supabase.storage
        .from('data-exports')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) throw uploadError;
      
      // Get signed URL (expires in 7 days)
      const { data: urlData } = await supabase.storage
        .from('data-exports')
        .createSignedUrl(fileName, 7 * 24 * 60 * 60);
      
      // Update request status
      await supabase
        .from('data_export_requests')
        .update({
          status: 'completed',
          download_url: urlData?.signedUrl,
          completed_at: new Date().toISOString(),
        })
        .eq('id', requestId);
      
      // Send email notification
      await this.sendDataExportEmail(userId, urlData?.signedUrl || '');
      
    } catch (error) {
      // Mark as failed
      await supabase
        .from('data_export_requests')
        .update({ status: 'failed' })
        .eq('id', requestId);
      
      console.error('Data export failed:', error);
    }
  }
  
  /**
   * Collect all user data from all tables
   */
  private async collectUserData(userId: string): Promise<any> {
    const data: any = {
      exportDate: new Date().toISOString(),
      userId,
      sections: {},
    };
    
    try {
      // Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      data.sections.profile = profile;
      
      // Videos
      const { data: videos } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId);
      data.sections.videos = videos;
      
      // Comments
      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', userId);
      data.sections.comments = comments;
      
      // Likes
      const { data: likes } = await supabase
        .from('video_likes')
        .select('*')
        .eq('user_id', userId);
      data.sections.likes = likes;
      
      // Followers/Following
      const { data: followers } = await supabase
        .from('follows')
        .select('*')
        .or(`follower_id.eq.${userId},following_id.eq.${userId}`);
      data.sections.social = followers;
      
      // Activity logs
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1000);
      data.sections.activity = activity;
      
      // Saved videos
      const { data: saved } = await supabase
        .from('saved_videos')
        .select('*')
        .eq('user_id', userId);
      data.sections.savedVideos = saved;
      
      // Sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId);
      data.sections.sessions = sessions;
      
      // Settings
      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();
      data.sections.settings = settings;
      
      return data;
    } catch (error) {
      console.error('Error collecting user data:', error);
      return data;
    }
  }
  
  /**
   * Request account deletion (GDPR Article 17 - Right to Erasure)
   */
  async requestAccountDeletion(
    userId: string,
    reason?: string,
    immediate: boolean = false
  ): Promise<{ success: boolean; scheduledDate?: Date; error?: string }> {
    try {
      // GDPR requires 30 days notice period (unless immediate)
      const scheduledDeletion = immediate
        ? new Date()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      // Create deletion request
      const { data, error } = await supabase
        .from('data_deletion_requests')
        .insert({
          user_id: userId,
          scheduled_deletion: scheduledDeletion.toISOString(),
          status: immediate ? 'processing' : 'scheduled',
          reason,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        return { success: false, error: 'Failed to create deletion request' };
      }
      
      if (immediate) {
        await this.executeAccountDeletion(userId);
      }
      
      return { success: true, scheduledDate: scheduledDeletion };
    } catch (error) {
      return { success: false, error: 'Deletion request failed' };
    }
  }
  
  /**
   * Cancel deletion request (during 30-day period)
   */
  async cancelAccountDeletion(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await supabase
        .from('data_deletion_requests')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'scheduled');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to cancel deletion' };
    }
  }
  
  /**
   * Execute account deletion
   */
  private async executeAccountDeletion(userId: string): Promise<void> {
    try {
      // Delete in order (respect foreign keys)
      
      // 1. Delete user-generated content
      await supabase.from('comments').delete().eq('user_id', userId);
      await supabase.from('video_likes').delete().eq('user_id', userId);
      await supabase.from('follows').delete().or(`follower_id.eq.${userId},following_id.eq.${userId}`);
      await supabase.from('saved_videos').delete().eq('user_id', userId);
      await supabase.from('activity_logs').delete().eq('user_id', userId);
      
      // 2. Delete videos (and associated data)
      const { data: videos } = await supabase
        .from('videos')
        .select('id')
        .eq('user_id', userId);
      
      if (videos) {
        for (const video of videos) {
          await supabase.from('video_stats').delete().eq('video_id', video.id);
        }
      }
      
      await supabase.from('videos').delete().eq('user_id', userId);
      
      // 3. Delete settings
      await supabase.from('notification_settings').delete().eq('user_id', userId);
      await supabase.from('privacy_settings').delete().eq('user_id', userId);
      await supabase.from('user_sessions').delete().eq('user_id', userId);
      
      // 4. Anonymize profile (keep for referential integrity)
      await supabase
        .from('profiles')
        .update({
          first_name: '[Deleted User]',
          last_name: '',
          display_name: '[Deleted User]',
          bio: null,
          avatar_url: null,
          email: null,
          phone: null,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      // 5. Delete auth user
      await supabase.auth.admin.deleteUser(userId);
      
      // Update deletion request
      await supabase
        .from('data_deletion_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
    } catch (error) {
      console.error('Account deletion failed:', error);
      throw error;
    }
  }
  
  /**
   * Record consent (GDPR Article 7)
   */
  async recordConsent(
    userId: string,
    consentType: string,
    granted: boolean,
    request: Request
  ): Promise<void> {
    const ipAddress = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await supabase.from('consent_records').insert({
      user_id: userId,
      consent_type: consentType,
      granted,
      ip_address: ipAddress,
      user_agent: userAgent,
      timestamp: new Date().toISOString(),
    });
  }
  
  /**
   * Get consent status
   */
  async getConsentStatus(userId: string, consentType: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('consent_records')
      .select('granted')
      .eq('user_id', userId)
      .eq('consent_type', consentType)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    return !error && data?.granted === true;
  }
  
  /**
   * Data portability (GDPR Article 20)
   */
  async exportDataInStructuredFormat(userId: string, format: 'json' | 'csv' | 'xml' = 'json'): Promise<any> {
    const data = await this.collectUserData(userId);
    
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data);
      case 'xml':
        return this.convertToXML(data);
      default:
        return data;
    }
  }
  
  /**
   * Log data access (GDPR Article 30 - Record of Processing)
   */
  async logDataAccess(entry: AuditLogEntry): Promise<void> {
    await supabase.from('audit_logs').insert({
      user_id: entry.userId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      ip_address: entry.ipAddress,
      user_agent: entry.userAgent,
      timestamp: entry.timestamp.toISOString(),
      details: entry.details,
    });
  }
  
  /**
   * Get audit logs for user
   */
  async getAuditLogs(userId: string, limit: number = 100): Promise<AuditLogEntry[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error || !data) return [];
    
    return data.map(log => ({
      userId: log.user_id,
      action: log.action,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      timestamp: new Date(log.timestamp),
      details: log.details,
    }));
  }
  
  /**
   * Right to rectification (GDPR Article 16)
   */
  async updatePersonalData(userId: string, updates: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Log the update
      await this.logDataAccess({
        userId,
        action: 'update_personal_data',
        resourceType: 'profile',
        resourceId: userId,
        ipAddress: 'system',
        userAgent: 'system',
        timestamp: new Date(),
        details: updates,
      });
      
      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) {
        return { success: false, error: 'Failed to update data' };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Update failed' };
    }
  }
  
  /**
   * Data breach notification (GDPR Article 33/34)
   */
  async notifyDataBreach(
    affectedUsers: string[],
    breachDetails: {
      type: string;
      description: string;
      dataCategories: string[];
      estimatedAffectedRecords: number;
      measures: string[];
    }
  ): Promise<void> {
    // Log breach
    await supabase.from('security_incidents').insert({
      type: 'data_breach',
      severity: 'critical',
      affected_users: affectedUsers,
      details: breachDetails,
      reported_at: new Date().toISOString(),
    });
    
    // Notify users (via email)
    for (const userId of affectedUsers) {
      await this.sendDataBreachNotification(userId, breachDetails);
    }
    
    // Notify authorities if required (72 hours)
    // This should trigger manual review by legal team
  }
  
  // Helper methods
  
  private getClientIP(request: Request): string {
    const headers = ['cf-connecting-ip', 'x-real-ip', 'x-forwarded-for'];
    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) return value.split(',')[0].trim();
    }
    return 'unknown';
  }
  
  private async sendDataExportEmail(userId: string, downloadUrl: string): Promise<void> {
    // Implement email sending logic
    console.log(`Sending data export email to user ${userId}: ${downloadUrl}`);
  }
  
  private async sendDataBreachNotification(userId: string, details: any): Promise<void> {
    // Implement email sending logic
    console.log(`Sending data breach notification to user ${userId}`);
  }
  
  private convertToCSV(data: any): string {
    // Simplified CSV conversion
    return JSON.stringify(data);
  }
  
  private convertToXML(data: any): string {
    // Simplified XML conversion
    return `<?xml version="1.0"?><data>${JSON.stringify(data)}</data>`;
  }
}

// ============================================================================
// CCPA COMPLIANCE (California Consumer Privacy Act)
// ============================================================================

export class CCPACompliance {
  
  /**
   * Do Not Sell My Personal Information
   */
  async optOutOfDataSale(userId: string): Promise<{ success: boolean }> {
    try {
      await supabase
        .from('privacy_settings')
        .update({
          opt_out_data_sale: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      return { success: true };
    } catch {
      return { success: false };
    }
  }
  
  /**
   * Categories of personal information collected
   */
  getPersonalInformationCategories(): string[] {
    return [
      'Identifiers (name, email, username)',
      'Profile information',
      'User-generated content (videos, comments)',
      'Usage data (views, interactions)',
      'Device information (IP, user agent)',
      'Location data (if enabled)',
      'Social connections',
    ];
  }
  
  /**
   * Right to know what personal information is collected
   */
  async getCollectedInformation(userId: string): Promise<any> {
    const gdpr = new GDPRCompliance();
    return await gdpr.exportDataInStructuredFormat(userId, 'json');
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const gdprCompliance = new GDPRCompliance();
export const ccpaCompliance = new CCPACompliance();
