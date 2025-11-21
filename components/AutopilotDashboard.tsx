/**
 * 🤖 AUTOPILOT DASHBOARD
 * 
 * Admin Dashboard für Autopilot System Monitoring
 * 
 * Features:
 * - Real-time Autopilot Status
 * - Job Logs & History
 * - System Health Metrics
 * - Performance Charts
 * - Manual Job Triggers
 * - Configuration Management
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

interface AutopilotLog {
  id: string;
  job_id: string;
  job_name: string;
  success: boolean;
  duration: number;
  actions_count: number;
  metrics: any;
  errors?: string[];
  warnings?: string[];
  timestamp: string;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    database: ServiceStatus;
    api: ServiceStatus;
    storage: ServiceStatus;
  };
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'down';
  latency: number;
  errorRate: number;
}

interface AutopilotStats {
  totalJobs: number;
  successRate: number;
  avgDuration: number;
  actionsLast24h: number;
  lastRun?: string;
}

export function AutopilotDashboard() {
  const [logs, setLogs] = useState<AutopilotLog[]>([]);
  const [stats, setStats] = useState<AutopilotStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // Fetch recent logs
      const { data: logsData, error: logsError } = await supabase
        .from('autopilot_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // Calculate stats
      const last24h = logsData?.filter(
        log => new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ) || [];

      const statsData: AutopilotStats = {
        totalJobs: last24h.length,
        successRate: last24h.length > 0
          ? (last24h.filter(l => l.success).length / last24h.length) * 100
          : 0,
        avgDuration: last24h.length > 0
          ? last24h.reduce((sum, l) => sum + l.duration, 0) / last24h.length
          : 0,
        actionsLast24h: last24h.reduce((sum, l) => sum + l.actions_count, 0),
        lastRun: logsData?.[0]?.timestamp,
      };
      setStats(statsData);

      // Mock health data (in production, would call actual health endpoint)
      setHealth({
        overall: 'healthy',
        services: {
          database: { status: 'operational', latency: 45, errorRate: 0 },
          api: { status: 'operational', latency: 120, errorRate: 0.001 },
          storage: { status: 'operational', latency: 200, errorRate: 0 },
        },
      });

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const triggerJob = async (jobId: string) => {
    try {
      // In production, would call Edge Function to trigger job
      alert(`Triggering job: ${jobId}`);
    } catch (error) {
      console.error('Error triggering job:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading Autopilot Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🤖 Autopilot Dashboard</Text>
        <TouchableOpacity onPress={loadDashboardData} style={styles.refreshButton}>
          <Text style={styles.refreshText}>
            {refreshing ? '⟳ Refreshing...' : '↻ Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* System Health */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Health</Text>
        <View style={styles.healthCard}>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Overall Status:</Text>
            <View style={[
              styles.healthStatus,
              health?.overall === 'healthy' && styles.statusHealthy,
              health?.overall === 'warning' && styles.statusWarning,
              health?.overall === 'critical' && styles.statusCritical,
            ]}>
              <Text style={styles.healthStatusText}>
                {health?.overall === 'healthy' && '✅ HEALTHY'}
                {health?.overall === 'warning' && '⚠️  WARNING'}
                {health?.overall === 'critical' && '🚨 CRITICAL'}
              </Text>
            </View>
          </View>

          <View style={styles.servicesGrid}>
            {health && Object.entries(health.services).map(([name, status]) => (
              <View key={name} style={styles.serviceCard}>
                <Text style={styles.serviceName}>{name.toUpperCase()}</Text>
                <Text style={[
                  styles.serviceStatus,
                  status.status === 'operational' && styles.statusOperational,
                  status.status === 'degraded' && styles.statusDegraded,
                  status.status === 'down' && styles.statusDown,
                ]}>
                  {status.status.toUpperCase()}
                </Text>
                <Text style={styles.serviceMetric}>Latency: {status.latency}ms</Text>
                <Text style={styles.serviceMetric}>
                  Errors: {(status.errorRate * 100).toFixed(2)}%
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats (Last 24h)</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalJobs || 0}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.successRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.avgDuration.toFixed(0)}ms</Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.actionsLast24h}</Text>
            <Text style={styles.statLabel}>Actions Taken</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => triggerJob('seo-optimization')}
          >
            <Text style={styles.actionIcon}>🔍</Text>
            <Text style={styles.actionText}>Run SEO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => triggerJob('security-scan')}
          >
            <Text style={styles.actionIcon}>🛡️</Text>
            <Text style={styles.actionText}>Security Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => triggerJob('content-analysis')}
          >
            <Text style={styles.actionIcon}>🎥</Text>
            <Text style={styles.actionText}>Content Check</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => triggerJob('trend-detection')}
          >
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionText}>Detect Trends</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Jobs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Jobs</Text>
        {logs.map(log => (
          <View
            key={log.id}
            style={[
              styles.logCard,
              log.success ? styles.logSuccess : styles.logError,
            ]}
          >
            <View style={styles.logHeader}>
              <Text style={styles.logName}>{log.job_name}</Text>
              <Text style={styles.logTime}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            
            <View style={styles.logMetrics}>
              <Text style={styles.logMetric}>
                ⚡ {log.duration}ms
              </Text>
              <Text style={styles.logMetric}>
                ✅ {log.actions_count} actions
              </Text>
              <Text style={styles.logMetric}>
                {log.success ? '✓ Success' : '✗ Failed'}
              </Text>
            </View>

            {log.errors && log.errors.length > 0 && (
              <View style={styles.logErrors}>
                {log.errors.map((error, i) => (
                  <Text key={i} style={styles.errorText}>
                    ⚠️  {error}
                  </Text>
                ))}
              </View>
            )}

            {log.metrics && Object.keys(log.metrics).length > 0 && (
              <View style={styles.logDetails}>
                <Text style={styles.detailsText}>
                  {JSON.stringify(log.metrics, null, 2)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#8b5cf6',
  },
  refreshText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  healthCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthLabel: {
    color: '#888',
    fontSize: 16,
  },
  healthStatus: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  healthStatusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusHealthy: {
    backgroundColor: '#10b981',
  },
  statusWarning: {
    backgroundColor: '#f59e0b',
  },
  statusCritical: {
    backgroundColor: '#ef4444',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
    padding: 12,
  },
  serviceName: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  serviceStatus: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  statusOperational: {
    color: '#10b981',
  },
  statusDegraded: {
    color: '#f59e0b',
  },
  statusDown: {
    color: '#ef4444',
  },
  serviceMetric: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  logSuccess: {
    borderLeftColor: '#10b981',
  },
  logError: {
    borderLeftColor: '#ef4444',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logTime: {
    color: '#666',
    fontSize: 14,
  },
  logMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  logMetric: {
    color: '#888',
    fontSize: 14,
  },
  logErrors: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#ef444420',
    borderRadius: 8,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 4,
  },
  logDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#0f0f0f',
    borderRadius: 8,
  },
  detailsText: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'monospace',
  },
});

export default AutopilotDashboard;
