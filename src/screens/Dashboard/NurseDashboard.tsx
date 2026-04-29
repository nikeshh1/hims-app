import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks';
import { Block, Text } from '../../components';
import { useDashboard } from '../../context/DashboardContext';

const NurseDashboard = () => {
  const navigation = useNavigation<any>();
  const { sizes, colors } = useTheme();
  const { metrics, loading, error, fetchDashboardMetrics } = useDashboard();
  const [retryCount, setRetryCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          await fetchDashboardMetrics();
        } catch (err) {
          console.error('Error loading dashboard:', err);
        }
      };
      fetch();
    }, []),
  );

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    await fetchDashboardMetrics();
  };

  const getStatusColor = (value: number, type: 'critical' | 'pending') => {
    if (type === 'critical' && value > 0) return '#f44336';
    if (type === 'pending' && value > 0) return '#ff9800';
    return '#4caf50';
  };

  return (
    <Block safe>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <Block paddingHorizontal={sizes.padding} paddingTop={sizes.padding}>
          {/* Header */}
          <View style={styles.header}>
            <Text bold size={24} style={{ color: '#333' }}>
              Dashboard
            </Text>
            <Text gray size={12} style={{ marginTop: 4 }}>
              Real-time patient monitoring
            </Text>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#cb0c9f" />
              <Text gray style={{ marginTop: 12 }}>
                Loading dashboard...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={{ color: '#f44336', fontSize: 14, marginBottom: 12, textAlign: 'center' }}>
                ❌ {error}
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={handleRetry}>
                <Text bold color="#fff" size={13}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Critical Patients Alert */}
              {metrics.criticalPatients && metrics.criticalPatients > 0 && (
                <View style={[styles.alertCard, { borderLeftColor: '#f44336' }]}>
                  <View style={styles.alertContent}>
                    <Text bold size={14} style={{ color: '#f44336' }}>
                      🚨 {metrics.criticalPatients} Critical Patient{metrics.criticalPatients !== 1 ? 's' : ''}
                    </Text>
                    <Text gray size={11} style={{ marginTop: 4 }}>
                      Requires immediate attention
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.alertAction}
                    onPress={() => navigation.navigate('CriticalPatients', { patients: metrics.criticalList })}>
                    <Text bold size={12} color="#f44336">
                      View →
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                {/* Assigned Patients */}
                <TouchableOpacity
                  style={styles.metricCard}
                  onPress={() => navigation.navigate('VitalsList')}>
                  <View style={styles.metricIcon}>
                    <Text size={28}>👥</Text>
                  </View>
                  <View style={styles.metricContent}>
                    <Text bold size={20} style={{ color: '#333' }}>
                      {metrics.patients?.length || 0}
                    </Text>
                    <Text gray size={11}>
                      Assigned Patients
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Pending Vitals */}
                <TouchableOpacity
                  style={styles.metricCard}
                  onPress={() => navigation.navigate('VitalsList')}>
                  <View style={[
                    styles.metricIcon,
                    { backgroundColor: getStatusColor(metrics.pendingVitals || 0, 'pending') + '20' }
                  ]}>
                    <Text size={28}>📊</Text>
                  </View>
                  <View style={styles.metricContent}>
                    <Text bold size={20} style={{ color: getStatusColor(metrics.pendingVitals || 0, 'pending') }}>
                      {metrics.pendingVitals || 0}
                    </Text>
                    <Text gray size={11}>
                      Pending Vitals
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.metricsGrid}>
                {/* Pending Medications */}
                <TouchableOpacity
                  style={styles.metricCard}
                  onPress={() => navigation.navigate('MedicationAdministrationList')}>
                  <View style={[
                    styles.metricIcon,
                    { backgroundColor: getStatusColor(metrics.pendingMedications || 0, 'pending') + '20' }
                  ]}>
                    <Text size={28}>💊</Text>
                  </View>
                  <View style={styles.metricContent}>
                    <Text bold size={20} style={{ color: getStatusColor(metrics.pendingMedications || 0, 'pending') }}>
                      {metrics.pendingMedications || 0}
                    </Text>
                    <Text gray size={11}>
                      Pending Medications
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Ready for Discharge */}
                <TouchableOpacity
                  style={styles.metricCard}
                  onPress={() => navigation.navigate('DischargePreparationList')}>
                  <View style={[
                    styles.metricIcon,
                    { backgroundColor: '#4caf5020' }
                  ]}>
                    <Text size={28}>✅</Text>
                  </View>
                  <View style={styles.metricContent}>
                    <Text bold size={20} style={{ color: '#4caf50' }}>
                      {metrics.discharges || 0}
                    </Text>
                    <Text gray size={11}>
                      Ready for Discharge
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Quick Actions */}
              <View style={{ marginTop: 24, marginBottom: 32 }}>
                <Text bold size={14} style={{ marginBottom: 12, color: '#333' }}>
                  Quick Actions
                </Text>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('AddVital')}>
                  <Text size={14}>📋</Text>
                  <Text bold size={13} style={{ marginLeft: 10, flex: 1, color: '#333' }}>
                    Record Patient Vital
                  </Text>
                  <Text size={14}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => navigation.navigate('DischargePreparationList')}>
                  <Text size={14}>🏥</Text>
                  <Text bold size={13} style={{ marginLeft: 10, flex: 1, color: '#333' }}>
                    Discharge Preparation
                  </Text>
                  <Text size={14}>→</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Block>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    justifyContent: 'space-between',
  },
  alertContent: {
    flex: 1,
  },
  alertAction: {
    paddingHorizontal: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricContent: {
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  retryBtn: {
    backgroundColor: '#cb0c9f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default NurseDashboard;
