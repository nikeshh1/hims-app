import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../components';
import { useTheme } from '../hooks';
import { sizes, colors } from '../constants';
import apiClient from '../api/apiClient';

const MedicationAdministrationList = ({ navigation, route }: any) => {
  const theme = useTheme();
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [nurseId, setNurseId] = useState<string | null>(route?.params?.nurseId || null);

  // Load nurse ID and patients on mount
  useEffect(() => {
    if (!nurseId) {
      getNurseId();
    }
    loadPatients();
  }, []);

  const getNurseId = async () => {
    try {
      // Try multiple keys that might store the nurse ID
      let id = await AsyncStorage.getItem('userId');
      if (!id) id = await AsyncStorage.getItem('nurse_id');
      if (!id) id = await AsyncStorage.getItem('user_id');
      if (!id) id = await AsyncStorage.getItem('currentUserId');
      
      if (id) {
        setNurseId(id);
      } else {
        // Fallback: use default nurse ID (1 is usually the first user/nurse)
        console.warn('No nurse ID found in storage, using default ID: 1');
        setNurseId('1');
      }
    } catch (err) {
      console.log('Error retrieving nurse ID:', err);
      setNurseId('1'); // Fallback to default user ID
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/medication-administration/patients-list');
      setPatients(res.data.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const loadMedications = async (patientId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/medication-administration/prescriptions/${patientId}`);
      setMedications(res.data.data || []);
      setLoading(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to load medications');
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientDropdown(false);
    loadMedications(patient.id);
  };

  const handleStatusUpdate = async (prescriptionItemId: string, status: 'administered' | 'missed') => {
    try {
      if (!nurseId) {
        Alert.alert('Error', 'Nurse ID not found. Please login again.');
        return;
      }

      // Format timestamp for Laravel (YYYY-MM-DD HH:MM:SS)
      const now = new Date();
      const isoString = now.toISOString();
      const administeredTime = isoString.slice(0, 19).replace('T', ' '); // Convert to "YYYY-MM-DD HH:MM:SS"

      // Create or update medication administration record
      await apiClient.post('/medication-administration', {
        patient_id: selectedPatient.id,
        prescription_item_id: prescriptionItemId,
        status: status,
        nurse_id: nurseId,
        administered_time: administeredTime,
      });

      Alert.alert('Success', `Medication marked as ${status}`);
      loadMedications(selectedPatient.id);
    } catch (err) {
      Alert.alert('Error', `Failed to mark medication as ${status}`);
    }
  };

  const renderMedicationRow = ({ item, index }: any) => {
    const statusColor: string = ({
      pending: '#f59e0b',
      administered: '#10b981',
      missed: '#ef4444',
      skipped: '#9ca3af',
      refused: '#ef4444',
    } as any)[item.status] || colors.primary;

    return (
      <View style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}>
        <View style={styles.medicineCell}>
          <Text bold numberOfLines={1}>{item.medicine_name || 'N/A'}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text numberOfLines={1}>{item.dosage || 'N/A'}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text numberOfLines={1}>{item.frequency || 'N/A'}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text numberOfLines={1}>{item.duration || 'N/A'}</Text>
        </View>
        <View style={styles.tableCell}>
          <Text numberOfLines={2}>{item.instructions || 'N/A'}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor }
            ]}
          >
            <Text white size={10} bold>
              {(item.status || 'pending').toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.timeCell}>
          {item.administered_time ? (
            <>
              <Text size={10} numberOfLines={1}>
                {new Date(item.administered_time).toLocaleDateString()}
              </Text>
              <Text size={10} numberOfLines={1}>
                {new Date(item.administered_time).toLocaleTimeString()}
              </Text>
            </>
          ) : (
            <Text size={10}>-</Text>
          )}
        </View>
        <View style={styles.actionCell}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: item.status === 'administered' || item.status === 'missed' 
                  ? '#d1d5db' 
                  : '#10b981',
                opacity: item.status === 'administered' || item.status === 'missed' 
                  ? 0.65 
                  : 1,
              }
            ]}
            onPress={() => {
              if (item.status !== 'administered' && item.status !== 'missed') {
                handleStatusUpdate(item.prescription_item_id, 'administered');
              }
            }}
            disabled={item.status === 'administered' || item.status === 'missed'}
          >
            <Text white size={9} bold>
              ✓ ADMINISTER
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: item.status === 'administered' || item.status === 'missed' 
                  ? '#d1d5db' 
                  : '#ef4444',
                opacity: item.status === 'administered' || item.status === 'missed' 
                  ? 0.65 
                  : 1,
              }
            ]}
            onPress={() => {
              if (item.status !== 'administered' && item.status !== 'missed') {
                handleStatusUpdate(item.prescription_item_id, 'missed');
              }
            }}
            disabled={item.status === 'administered' || item.status === 'missed'}
          >
            <Text white size={9} bold>
              ✕ MISSED
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text h3 bold style={{ color: colors.primary }}>
          💊 Medication Administration
        </Text>
        <Text size={12} color={theme.colors.gray} style={{ marginTop: sizes.base * 0.5 }}>
          Manage patient medications
        </Text>
      </View>

      {/* Patient Selector */}
      <View style={styles.patientSelector}>
        <Text bold size={13} style={{ marginBottom: sizes.base * 0.75, color: '#333' }}>
          👤 Select Patient
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdown,
            { borderColor: colors.primary }
          ]}
          onPress={() => setShowPatientDropdown(!showPatientDropdown)}
        >
          <Text bold color={selectedPatient?.name ? '#333' : theme.colors.gray}>
            {selectedPatient?.name || 'Choose a patient...'}
          </Text>
        </TouchableOpacity>

        {showPatientDropdown && (
          <View style={[styles.dropdownList, { backgroundColor: theme.colors.card }]}>
            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
              {patients.map((patient) => (
                <TouchableOpacity
                  key={patient.id}
                  style={styles.dropdownItem}
                  onPress={() => handlePatientSelect(patient)}
                >
                  <Text>{patient.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Medications Table */}
      {selectedPatient && (
        <View style={styles.tableContainer}>
          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : medications.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={true} nestedScrollEnabled={true}>
              <View>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <View style={styles.medicineCell}>
                    <Text style={styles.headerText} bold>MEDICINE</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerText} bold>DOSAGE</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerText} bold>FREQUENCY</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerText} bold>DURATION</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text style={styles.headerText} bold>INSTRUCTIONS</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    <Text style={styles.headerText} bold>STATUS</Text>
                  </View>
                  <View style={styles.timeCell}>
                    <Text style={styles.headerText} bold>TIME</Text>
                  </View>
                  <View style={styles.actionCell}>
                    <Text style={styles.headerText} bold>ACTIONS</Text>
                  </View>
                </View>

                {/* Table Rows */}
                <FlatList
                  data={medications}
                  renderItem={renderMedicationRow}
                  keyExtractor={(item) => item.prescription_item_id}
                  scrollEnabled={false}
                />
              </View>
            </ScrollView>
          ) : (
            <View style={styles.centerContent}>
              <Text color={theme.colors.gray}>No medications found for this patient</Text>
            </View>
          )}
        </View>
      )}

      {!selectedPatient && !loading && (
        <View style={styles.centerContent}>
          <Text color={theme.colors.gray}>Select a patient to view medications</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: sizes.padding,
  },
  header: {
    marginBottom: sizes.padding * 1.2,
    paddingBottom: sizes.base * 1.2,
    paddingHorizontal: sizes.base * 0.5,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  patientSelector: {
    marginBottom: sizes.padding,
    paddingHorizontal: sizes.base,
    paddingVertical: sizes.base * 1.2,
    borderRadius: sizes.radius,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdown: {
    borderWidth: 2,
    borderRadius: sizes.radius,
    paddingHorizontal: sizes.base,
    paddingVertical: sizes.base * 0.85,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  dropdownList: {
    marginTop: sizes.base * 0.75,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
    paddingVertical: 0,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  dropdownItem: {
    paddingHorizontal: sizes.base,
    paddingVertical: sizes.base * 0.9,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableContainer: {
    flex: 1,
    marginTop: sizes.base * 1.2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: sizes.radius,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: sizes.base * 0.9,
    paddingHorizontal: sizes.base * 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  tableRowAlt: {
    backgroundColor: '#f9fafb',
  },
  tableHeader: {
    backgroundColor: '#f0f7ff',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(59, 130, 246, 0.4)',
  },
  headerText: {
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  medicineCell: {
    width: 120,
    paddingHorizontal: sizes.base * 0.75,
    paddingRight: sizes.base,
  },
  tableCell: {
    width: 100,
    paddingHorizontal: sizes.base * 0.5,
    fontSize: 12,
  },
  statusContainer: {
    width: 90,
    paddingHorizontal: sizes.base * 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeCell: {
    width: 110,
    paddingHorizontal: sizes.base * 0.5,
    fontSize: 11,
  },
  actionCell: {
    width: 140,
    paddingHorizontal: sizes.base * 0.5,
    flexDirection: 'column',
    justifyContent: 'center',
    gap: sizes.base * 0.35,
  },
  actionButton: {
    paddingHorizontal: sizes.base * 0.6,
    paddingVertical: sizes.base * 0.5,
    borderRadius: sizes.radius * 0.75,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: sizes.base * 0.85,
    paddingVertical: sizes.base * 0.45,
    borderRadius: sizes.radius * 0.75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MedicationAdministrationList;



