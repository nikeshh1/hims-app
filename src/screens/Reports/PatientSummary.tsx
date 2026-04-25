import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useNurseReports } from '../../context/NurseReportsContext';
import { useTheme } from '../../hooks';
import { Block, Text } from '../../components';

const PatientSummary = () => {
  console.log('[PatientSummary] Component rendering');
  const { patientSummary, loading, vitalsPatients, fetchPatientSummary } = useNurseReports();
  const { sizes, colors } = useTheme();

  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const patientOptions = useMemo(
    () => Object.entries(vitalsPatients).sort(([, a], [, b]) => a.localeCompare(b)),
    [vitalsPatients],
  );

  console.log('[PatientSummary] Context data:', { patientSummary, loading });

  useEffect(() => {
    console.log('[PatientSummary] Render - loading:', loading, 'patientSummary:', patientSummary);
  }, [loading, patientSummary]);

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          await fetchPatientSummary();
        } catch (err: any) {
          console.error('Error fetching patient summary:', err);
        }
      };
      fetch();
    }, []),
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchPatientSummary(selectedPatient)
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [selectedPatient]);

  const handleSelectPatient = async (patientId?: string) => {
    try {
      await fetchPatientSummary(patientId);
    } catch (err: any) {
      console.error('Error fetching:', err);
    }
  };

  const handlePatientChange = async (patientId: string) => {
    setSelectedPatient(patientId);

    try {
      await fetchPatientSummary(patientId || undefined);
    } catch (err: any) {
      console.error('Error fetching:', err);
    }
  };

  const handleReset = async () => {
    setSelectedPatient('');
    try {
      await fetchPatientSummary();
    } catch (err: any) {
      console.error('Error resetting:', err);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBloodPressure = (vital: any) => {
    if (vital.blood_pressure) return vital.blood_pressure;
    if (vital.blood_pressure_systolic && vital.blood_pressure_diastolic) {
      return `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`;
    }
    if (vital.systolic && vital.diastolic) {
      return `${vital.systolic}/${vital.diastolic}`;
    }
    return '-';
  };

  const getPulse = (vital: any) => vital.pulse ?? vital.pulse_rate ?? '-';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Block flex={0} style={styles.header} safe>
        <Text h5 style={{ color: colors.text }}>
          Patient Summary
        </Text>
        <Text gray>Nurse</Text>
      </Block>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Patient Selection */}
        <Block style={[styles.filterSection, { backgroundColor: colors.card }]}>
          <Text bold style={{ marginBottom: sizes.sm }}>
            Patient
          </Text>
          <View
            style={[
              styles.pickerWrapper,
              {
                borderColor: colors.light,
                backgroundColor: colors.background,
              },
            ]}>
            <Picker
              selectedValue={selectedPatient}
              onValueChange={handlePatientChange}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.gray}>
              <Picker.Item label="-- Select Patient --" value="" color="#999" />
              {patientOptions.map(([id, name]) => (
                <Picker.Item key={id} label={name} value={id} />
              ))}
            </Picker>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: colors.primary }]}
              onPress={() => handleSelectPatient(selectedPatient || undefined)}
            >
              <Text white bold>VIEW SUMMARY</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.resetBtn, { backgroundColor: colors.background, borderColor: colors.light }]}
              onPress={handleReset}
            >
              <Text bold style={{ color: colors.text }}>RESET</Text>
            </TouchableOpacity>
          </View>
        </Block>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : !patientSummary.patient ? (
          <View style={[styles.messageBox, { backgroundColor: colors.background, borderColor: colors.light }]}>
            <Text gray style={{ textAlign: 'center' }}>
              Please select a patient to view summary.
            </Text>
          </View>
        ) : (
          <>
            {/* Recent Vitals Section */}
            <Block style={[styles.section, { backgroundColor: colors.card }]}>
              <Text bold h5 style={{ marginBottom: sizes.md }}>
                Recent Vitals
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.summaryVitalsTableContent}>
              <View style={[styles.tableHeader, { borderBottomColor: colors.light }]}>
                <Text bold size={12} style={{ flex: 0.8 }}>TEMP</Text>
                <Text bold size={12} style={{ flex: 0.8 }}>BP</Text>
                <Text bold size={12} style={{ flex: 0.8 }}>PULSE</Text>
                <Text bold size={12} style={{ flex: 0.8 }}>SPO2</Text>
                <Text bold size={12} style={{ flex: 1.6 }}>DATE</Text>
              </View>
              {patientSummary.vitals && patientSummary.vitals.length > 0 ? (
                patientSummary.vitals.map((vital: any, idx: number) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.tableRow, 
                      { borderBottomColor: colors.light },
                      idx === patientSummary.vitals!.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <Text size={12} style={{ flex: 0.8 }}>{vital.temperature}°C</Text>
                    <Text size={12} style={{ flex: 0.8 }}>{getBloodPressure(vital)}</Text>
                    <Text size={12} style={{ flex: 0.8 }}>{getPulse(vital)}</Text>
                    <Text size={12} style={{ flex: 0.8 }}>{vital.spo2}%</Text>
                    <Text size={11} style={{ flex: 1.6, color: colors.gray }}>
                      {formatDate(vital.recorded_at)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text gray style={{ paddingVertical: 12, textAlign: 'center' }}>No vitals available</Text>
              )}
                </View>
              </ScrollView>
            </Block>

            {/* Recent Medications Section */}
            <Block style={[styles.section, { backgroundColor: colors.card }]}>
              <Text bold h5 style={{ marginBottom: sizes.md }}>
                Recent Medications
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.summaryMedicationTableContent}>
              <View style={[styles.tableHeader, { borderBottomColor: colors.light }]}>
                <Text bold size={12} style={styles.summaryStatusCol}>STATUS</Text>
                <Text bold size={12} style={styles.summaryTimeCol}>TIME</Text>
              </View>
              {patientSummary.medications && patientSummary.medications.length > 0 ? (
                patientSummary.medications.map((med: any, idx: number) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.tableRow, 
                      { borderBottomColor: colors.light },
                      idx === patientSummary.medications!.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View style={styles.summaryStatusCol}>
                      <View
                        style={[
                          styles.statusBadge,
                          { 
                            backgroundColor: med.status?.toLowerCase() === 'administered' 
                              ? '#e8f5e9' 
                              : med.status?.toLowerCase() === 'pending'
                              ? '#fff3e0'
                              : '#ffebee'
                          },
                        ]}
                      >
                        <Text
                          bold
                          size={11}
                          style={{ 
                            color: med.status?.toLowerCase() === 'administered' 
                              ? '#4caf50' 
                              : med.status?.toLowerCase() === 'pending'
                              ? '#ff9800'
                              : '#f44336'
                          }}
                        >
                          {med.status}
                        </Text>
                      </View>
                    </View>
                    <Text size={11} style={{ ...styles.summaryTimeCol, color: colors.gray }}>
                      {formatDate(med.administered_time)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text gray style={{ paddingVertical: 12, textAlign: 'center' }}>No medications available</Text>
              )}
                </View>
              </ScrollView>
            </Block>

            {/* Nursing Notes Section */}
            <Block style={[styles.section, { backgroundColor: colors.card }]}>
              <Text bold h5 style={{ marginBottom: sizes.md }}>
                Nursing Notes
              </Text>
              {patientSummary.notes && patientSummary.notes.length > 0 ? (
                patientSummary.notes.map((note: any, idx: number) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.noteItem,
                      { 
                        backgroundColor: colors.background,
                        borderColor: colors.light,
                        marginBottom: idx < patientSummary.notes!.length - 1 ? sizes.sm : 0
                      }
                    ]}
                  >
                    <Text bold size={12}>{note.notes || 'Note'}</Text>
                    <Text gray size={10} style={{ marginTop: 4 }}>
                      {formatDate(note.created_at)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text gray style={{ paddingVertical: 12, textAlign: 'center' }}>No notes available</Text>
              )}
            </Block>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  filterSection: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 4,
    height: 48,
    justifyContent: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  messageBox: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    borderColor: '#E9ECEF',
  },
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  summaryVitalsTableContent: {
    minWidth: 520,
  },
  summaryMedicationTableContent: {
    minWidth: 500,
  },
  summaryStatusCol: {
    width: 240,
    paddingRight: 24,
  },
  summaryTimeCol: {
    width: 220,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteItem: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default PatientSummary;
