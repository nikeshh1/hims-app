import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNurseReports } from '../../context/NurseReportsContext';
import { useTheme } from '../../hooks';
import { Block, Text } from '../../components';

const MedicationReport = () => {
  console.log('[MedicationReport] Component rendering');
  const { medicationsReport, loading, fetchMedicationsReport } = useNurseReports();
  const { sizes, colors } = useTheme();

  const [patientId, setPatientId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  console.log('[MedicationReport] Context data:', { medicationsReport: medicationsReport?.length, loading });

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          await fetchMedicationsReport();
        } catch (err: any) {
          console.error('Error fetching medications report:', err);
        }
      };
      fetch();
    }, []),
  );

  const filtered = useMemo(() => {
    let result = medicationsReport;
    if (patientId) {
      result = result.filter((med) => med.patient_id === patientId);
    }
    if (statusFilter !== 'All') {
      result = result.filter((med) => med.status === statusFilter);
    }
    console.log('[MedicationReport] Filtered data:', { totalMeds: medicationsReport.length, filtered: result.length, patientId, statusFilter });
    return result;
  }, [medicationsReport, patientId, statusFilter]);

  useEffect(() => {
    console.log('[MedicationReport] Render - loading:', loading, 'filtered length:', filtered.length);
  }, [loading, filtered]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchMedicationsReport(patientId, statusFilter !== 'All' ? statusFilter : undefined)
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [patientId, statusFilter]);

  const handleFilter = async () => {
    try {
      await fetchMedicationsReport(patientId, statusFilter !== 'All' ? statusFilter : undefined);
    } catch (err: any) {
      console.error('Error filtering:', err);
    }
  };

  const handleReset = async () => {
    setPatientId('');
    setStatusFilter('All');
    try {
      await fetchMedicationsReport();
    } catch (err: any) {
      console.error('Error resetting:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'administered':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'skipped':
      case 'refused':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'administered':
        return '#e8f5e9';
      case 'pending':
        return '#fff3e0';
      case 'skipped':
      case 'refused':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Block flex={0} style={styles.header} safe>
        <Text h5 style={{ color: colors.text }}>
          Medication Report
        </Text>
        <Text gray>Nurse</Text>
      </Block>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filters */}
        <Block style={[styles.filterSection, { backgroundColor: colors.card }]}>
          <Text bold style={{ marginBottom: sizes.sm }}>
            Patient
          </Text>
          <TextInput
            placeholder="Patient ID"
            placeholderTextColor={colors.gray}
            style={[styles.filterInput, { borderColor: colors.light, color: colors.text }]}
            value={patientId}
            onChangeText={setPatientId}
          />

          <Text bold style={{ marginTop: sizes.md, marginBottom: sizes.sm }}>
            Status
          </Text>
          <TouchableOpacity
            style={[styles.filterInput, { borderColor: colors.light, backgroundColor: colors.background }]}
          >
            <Text>{statusFilter}</Text>
          </TouchableOpacity>

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
            <Text gray>No medication records found</Text>
          </View>
        ) : (
          <Block style={[styles.tableSection, { backgroundColor: colors.card }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.medicationTableContent}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.light }]}>
              <Text bold size={12} color="#666" style={styles.patientCol}>PATIENT</Text>
              <Text bold size={12} color="#666" style={styles.medicationCol}>MEDICATION</Text>
              <Text bold size={12} color="#666" style={styles.statusCol}>STATUS</Text>
              <Text bold size={12} color="#666" style={styles.timeCol}>TIME</Text>
            </View>

            {/* Table Rows */}
            {filtered.map((medication, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.tableRow, 
                  { borderBottomColor: colors.light },
                  idx === filtered.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View style={styles.patientCol}>
                  <Text bold size={13}>{medication.patient_name}</Text>
                </View>
                <Text size={12} style={styles.medicationCol} numberOfLines={2}>
                  {medication.medication_name}
                </Text>
                <View style={styles.statusCol}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBgColor(medication.status) },
                    ]}
                  >
                    <Text
                      bold
                      size={11}
                      style={{ color: getStatusColor(medication.status) }}
                    >
                      {medication.status}
                    </Text>
                  </View>
                </View>
                <Text size={12} style={{ ...styles.timeCol, color: colors.gray }}>
                  {formatDateTime(medication.administered_time)}
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
  medicationTableContent: {
    minWidth: 640,
  },
  patientCol: {
    width: 140,
    paddingRight: 12,
  },
  medicationCol: {
    width: 160,
    paddingRight: 12,
  },
  statusCol: {
    width: 150,
    paddingRight: 16,
  },
  timeCol: {
    width: 166,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default MedicationReport;
