import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { useNurseReports } from '../../context/NurseReportsContext';
import { useTheme } from '../../hooks';
import { Block, Text } from '../../components';

const VitalsTrendsReport = () => {
  const { vitalsReport, loading, vitalsPatients, fetchVitalsReport } = useNurseReports();
  const { sizes, colors } = useTheme();

  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const patientOptions = useMemo(
    () => Object.entries(vitalsPatients).sort(([, a], [, b]) => a.localeCompare(b)),
    [vitalsPatients],
  );

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          await fetchVitalsReport();
        } catch (err: any) {
          console.error('Error fetching vitals report:', err);
        }
      };
      fetch();
    }, []),
  );

  const filtered = useMemo(() => {
    let result = vitalsReport;
    if (selectedPatient) {
      result = result.filter((vital) => vital.patient_id === selectedPatient);
    }
    if (fromDate && toDate) {
      const from = new Date(fromDate).getTime();
      const to = new Date(toDate).getTime();
      result = result.filter((vital) => {
        const recordedTime = new Date(vital.recorded_at).getTime();
        return recordedTime >= from && recordedTime <= to;
      });
    }
    console.log('[VitalsTrendsReport] Filtered data:', { totalVitals: vitalsReport.length, filtered: result.length, selectedPatient, fromDate, toDate });
    return result;
  }, [vitalsReport, selectedPatient, fromDate, toDate]);

  const handleFilter = async () => {
    try {
      await fetchVitalsReport(selectedPatient, fromDate, toDate);
    } catch (err: any) {
      console.error('Error filtering:', err);
    }
  };

  const handleReset = async () => {
    setSelectedPatient('');
    setFromDate('');
    setToDate('');
    try {
      await fetchVitalsReport();
    } catch (err: any) {
      console.error('Error resetting:', err);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchVitalsReport()
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, []);

  const formatDateTime = (dateString: string) => {
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
          Vital Trends Report
        </Text>
        <Text gray>Nurse</Text>
      </Block>

      {/* Filters */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Block style={[styles.filterSection, { backgroundColor: colors.card }]}>
          <Text bold style={{ marginBottom: sizes.sm }}>
            Patient
          </Text>
          <View
            style={[
              styles.pickerWrapper,
              { borderColor: colors.light, backgroundColor: colors.background },
            ]}>
            <Picker
              selectedValue={selectedPatient}
              onValueChange={(value) => setSelectedPatient(value)}
              style={[styles.picker, { color: colors.text }]}
              dropdownIconColor={colors.gray}>
              <Picker.Item label="-- Select Patient --" value="" color="#999" />
              {patientOptions.map(([id, name]) => (
                <Picker.Item key={id} label={name} value={id} />
              ))}
            </Picker>
          </View>

          <Text bold style={{ marginTop: sizes.md, marginBottom: sizes.sm }}>
            Date
          </Text>
          <View style={styles.dateRow}>
            <TextInput
              placeholder="dd-mm-yyyy"
              placeholderTextColor={colors.gray}
              style={[styles.dateInput, { borderColor: colors.light, color: colors.text }]}
              value={fromDate}
              onChangeText={setFromDate}
            />
            <Text style={{ marginHorizontal: sizes.sm }}>to</Text>
            <TextInput
              placeholder="dd-mm-yyyy"
              placeholderTextColor={colors.gray}
              style={[styles.dateInput, { borderColor: colors.light, color: colors.text }]}
              value={toDate}
              onChangeText={setToDate}
            />
          </View>

          {/* Filter and Reset Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: colors.primary }]}
              onPress={handleFilter}
            >
              <Text white bold>FILTER</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.resetBtn, { backgroundColor: colors.background, borderColor: colors.light }]}
              onPress={handleReset}
            >
              <Text bold style={{ color: colors.text }}>RESET</Text>
            </TouchableOpacity>
          </View>
        </Block>

        {/* Table Section */}
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerContent}>
            <Text gray>No vital records found</Text>
          </View>
        ) : (
          <Block style={[styles.tableSection, { backgroundColor: colors.card }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.vitalsTableContent}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.light }]}>
              <Text bold size={12} color="#666" style={{ flex: 1.2 }}>PATIENT</Text>
              <Text bold size={12} color="#666" style={{ flex: 0.8 }}>TEMPERATURE</Text>
              <Text bold size={12} color="#666" style={{ flex: 0.9 }}>BP</Text>
              <Text bold size={12} color="#666" style={{ flex: 0.7 }}>PULSE</Text>
              <Text bold size={12} color="#666" style={{ flex: 0.7 }}>SPO2</Text>
              <Text bold size={12} color="#666" style={{ flex: 1.6 }}>RECORDED AT</Text>
            </View>

            {/* Table Rows */}
            {filtered.map((vital, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.tableRow, 
                  { borderBottomColor: colors.light },
                  idx === filtered.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View style={{ flex: 1.2 }}>
                  <Text bold size={13}>{vital.patient_name}</Text>
                  <Text gray size={11}>{vital.nurse_name}</Text>
                </View>
                <Text size={13} style={{ flex: 0.8 }}>{vital.temperature}°C</Text>
                <Text size={13} style={{ flex: 0.9 }}>{getBloodPressure(vital)}</Text>
                <Text size={13} style={{ flex: 0.7 }}>{getPulse(vital)}</Text>
                <Text size={13} style={{ flex: 0.7 }}>{vital.spo2}%</Text>
                <Text size={12} style={{ flex: 1.6, color: colors.gray }}>
                  {formatDateTime(vital.recorded_at)}
                </Text>
              </View>
            ))}
              </View>
            </ScrollView>
          </Block>
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
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 4,
    height: 48,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    height: 48,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  tableSection: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  vitalsTableContent: {
    minWidth: 760,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default VitalsTrendsReport;
