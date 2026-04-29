import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../hooks';
import { Block, Text } from '../../components';

const CriticalPatients = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sizes } = useTheme();
  const { patients = [] } = route.params || {};

  const getCriticalReason = (patient: any) => {
    const reasons = [];
    if (patient.spo2 && patient.spo2 < 92) {
      reasons.push(`SpO₂ ${patient.spo2}% (Low)`);
    }
    if (patient.temperature && patient.temperature > 102) {
      reasons.push(`Temp ${patient.temperature}°F (High)`);
    }
    if (patient.blood_pressure_systolic && patient.blood_pressure_systolic > 180) {
      reasons.push(`BP Systolic ${patient.blood_pressure_systolic} (High)`);
    }
    if (patient.pulse_rate && patient.pulse_rate > 130) {
      reasons.push(`Pulse ${patient.pulse_rate} bpm (High)`);
    }
    return reasons;
  };

  const renderPatientCard = ({ item }: { item: any }) => {
    const reasons = getCriticalReason(item);
    return (
      <TouchableOpacity
        style={styles.patientCard}
        onPress={() => navigation.navigate('VitalsList')}>
        <View style={styles.patientHeader}>
          <View style={styles.patientInfo}>
            <Text bold size={14} style={{ color: '#333' }}>
              {item.first_name} {item.last_name}
            </Text>
            <Text gray size={11} style={{ marginTop: 2 }}>
              {item.patient_code}
            </Text>
          </View>
          <View style={styles.criticalBadge}>
            <Text bold size={11} style={{ color: '#fff' }}>
              🚨 CRITICAL
            </Text>
          </View>
        </View>

        {/* Vital Signs */}
        <View style={styles.vitalsGrid}>
          {item.spo2 && (
            <View style={[styles.vitalBox, item.spo2 < 92 && styles.vitalBoxCritical]}>
              <Text gray size={10}>SpO₂</Text>
              <Text bold size={13} style={{ marginTop: 2, color: item.spo2 < 92 ? '#f44336' : '#333' }}>
                {item.spo2}%
              </Text>
            </View>
          )}
          {item.temperature && (
            <View style={[styles.vitalBox, item.temperature > 102 && styles.vitalBoxCritical]}>
              <Text gray size={10}>Temp</Text>
              <Text bold size={13} style={{ marginTop: 2, color: item.temperature > 102 ? '#f44336' : '#333' }}>
                {item.temperature}°F
              </Text>
            </View>
          )}
          {item.blood_pressure_systolic && (
            <View style={[styles.vitalBox, item.blood_pressure_systolic > 180 && styles.vitalBoxCritical]}>
              <Text gray size={10}>BP (Sys)</Text>
              <Text bold size={13} style={{ marginTop: 2, color: item.blood_pressure_systolic > 180 ? '#f44336' : '#333' }}>
                {item.blood_pressure_systolic}
              </Text>
            </View>
          )}
          {item.pulse_rate && (
            <View style={[styles.vitalBox, item.pulse_rate > 130 && styles.vitalBoxCritical]}>
              <Text gray size={10}>Pulse</Text>
              <Text bold size={13} style={{ marginTop: 2, color: item.pulse_rate > 130 ? '#f44336' : '#333' }}>
                {item.pulse_rate}
              </Text>
            </View>
          )}
        </View>

        {/* Critical Reasons */}
        {reasons.length > 0 && (
          <View style={styles.reasonsContainer}>
            {reasons.map((reason, idx) => (
              <View key={idx} style={styles.reasonBadge}>
                <Text size={10} style={{ color: '#f44336' }}>
                  ⚠️ {reason}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action */}
        <TouchableOpacity
          style={styles.actionLink}
          onPress={() => navigation.navigate('VitalsList')}>
          <Text bold size={12} color="#cb0c9f">
            View Details →
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <Block safe>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text bold size={14} color="#cb0c9f">← Back</Text>
          </TouchableOpacity>
          <Text bold size={18} style={{ marginLeft: 12, flex: 1, color: '#333' }}>
            Critical Patients
          </Text>
        </View>

        {/* Content */}
        {patients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text size={16} gray style={{ marginBottom: 8 }}>
              ✅ No critical patients
            </Text>
            <Text size={12} gray>
              All monitored patients are stable
            </Text>
          </View>
        ) : (
          <FlatList
            data={patients}
            renderItem={renderPatientCard}
            keyExtractor={(item, idx) => idx.toString()}
            contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 12, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientInfo: {
    flex: 1,
  },
  criticalBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  vitalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vitalBox: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  vitalBoxCritical: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  reasonsContainer: {
    marginBottom: 12,
  },
  reasonBadge: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 6,
  },
  actionLink: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CriticalPatients;
