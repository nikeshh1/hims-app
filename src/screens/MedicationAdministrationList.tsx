import React, {useEffect, useState} from 'react';
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
import {Text} from '../components';
import {useTheme} from '../hooks';
import {colors} from '../constants';
import apiClient from '../api/apiClient';
import {getPatients} from '../api/vitals';
import {getPatientDisplayName} from '../utils/patientDisplay';

const MedicationAdministrationList = ({navigation, route}: any) => {
  const theme = useTheme();

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [nurseId, setNurseId] = useState<string | null>(
    route?.params?.nurseId || null,
  );

  useEffect(() => {
    if (!nurseId) {
      getNurseId();
    }

    loadPatients();
  }, []);

  const getNurseId = async () => {
    try {
      let id = await AsyncStorage.getItem('userId');

      if (!id) id = await AsyncStorage.getItem('nurse_id');
      if (!id) id = await AsyncStorage.getItem('user_id');
      if (!id) id = await AsyncStorage.getItem('currentUserId');

      setNurseId(id || '1');
    } catch (err) {
      setNurseId('1');
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);

      const res = await getPatients();

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

      const res = await apiClient.get(
        `/medication-administration/prescriptions/${patientId}`,
      );

      setMedications(res.data.data || []);
    } catch (err) {
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setShowPatientDropdown(false);
    loadMedications(patient.id);
  };

  const handleStatusUpdate = async (
    prescriptionItemId: string,
    status: 'administered' | 'missed',
  ) => {
    try {
      if (!nurseId) {
        Alert.alert('Error', 'Nurse ID not found');
        return;
      }

      const now = new Date();
      const administeredTime = now
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      await apiClient.post('/medication-administration', {
        patient_id: selectedPatient.id,
        prescription_item_id: prescriptionItemId,
        status,
        nurse_id: nurseId,
        administered_time: administeredTime,
      });

      Alert.alert('Success', `Medication marked as ${status}`);

      loadMedications(selectedPatient.id);
    } catch (err) {
      Alert.alert('Error', `Failed to mark medication as ${status}`);
    }
  };

  const renderMedicationCard = ({item}: any) => {
    const status = item.status || 'pending';

    const badgeColor =
      status === 'administered'
        ? '#40c8bd'
        : status === 'missed'
        ? '#ef4444'
        : '#f59e0b';

    return (
      <View style={styles.medicationCard}>
        <View style={styles.medicationInfo}>
          <Text style={styles.patientName}>
            {item.medicine_name ||
              item.medication_name ||
              item.prescription_item?.medicine_name ||
              'N/A'}
          </Text>

          <Text style={styles.infoText}>
            Dosage:{' '}
            {item.dosage ||
              item.prescription_item?.dosage ||
              '-'}
          </Text>

          <Text style={styles.infoText}>
            Frequency:{' '}
            {item.frequency ||
              item.prescription_item?.frequency ||
              '-'}
          </Text>

          <Text style={styles.infoText}>
            Duration:{' '}
            {item.duration ||
              item.prescription_item?.duration ||
              '-'}
          </Text>

          <Text style={styles.infoText}>
            Status: {status}
          </Text>

          <Text style={styles.infoText}>
            {item.administered_time
              ? new Date(
                  item.administered_time,
                ).toLocaleDateString()
              : '-'}
          </Text>
        </View>

        <View style={styles.statusColumn}>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: badgeColor},
            ]}>
            <Text style={styles.statusText}>
              {status.toUpperCase()}
            </Text>
          </View>

          {status === 'pending' && (
            <>
              <TouchableOpacity
                style={styles.administerBtn}
                onPress={() =>
                  handleStatusUpdate(
                    item.prescription_item_id,
                    'administered',
                  )
                }>
                <Text style={styles.buttonText}>
                  ADMINISTER
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.missedBtn}
                onPress={() =>
                  handleStatusUpdate(
                    item.prescription_item_id,
                    'missed',
                  )
                }>
                <Text style={styles.buttonText}>
                  MISSED
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };
    return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.title}>
            Medication Administration
          </Text>

          <Text style={styles.breadcrumb}>
            Nurse / Medication Administration
          </Text>
        </View>
      </View>

      {/* PATIENT SELECTOR CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Select Patient
          </Text>
        </View>

        <View style={styles.cardBody}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() =>
              setShowPatientDropdown(
                !showPatientDropdown,
              )
            }>
            <Text>
              {selectedPatient
                ? getPatientDisplayName(
                    selectedPatient,
                  )
                : 'Choose Patient'}
            </Text>
          </TouchableOpacity>

          {showPatientDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView
                nestedScrollEnabled
                style={{
                  maxHeight: 200,
                }}>
                {patients.map(patient => (
                  <TouchableOpacity
                    key={patient.id}
                    style={
                      styles.dropdownItem
                    }
                    onPress={() =>
                      handlePatientSelect(
                        patient,
                      )
                    }>
                    <Text>
                      {getPatientDisplayName(
                        patient,
                      )}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* MEDICATIONS */}
      {selectedPatient && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              Patient Medications
            </Text>
          </View>

          {loading ? (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color="#cd1b83"
            />
          ) : (
            <FlatList
              data={medications}
              keyExtractor={item =>
                String(
                  item.id ||
                    item.prescription_item_id,
                )
              }
              renderItem={
                renderMedicationCard
              }
              contentContainerStyle={
                styles.listContent
              }
              ListEmptyComponent={
                <Text
                  style={
                    styles.emptyText
                  }>
                  No medications found
                </Text>
              }
            />
          )}
        </View>
      )}

      {!selectedPatient &&
        !loading && (
          <View
            style={
              styles.emptyContainer
            }>
            <Text
              style={
                styles.emptyText
              }>
              Select a patient to
              view medications
            </Text>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 14,
  },

  pageHeader: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f2f4a',
  },

  breadcrumb: {
    marginTop: 4,
    color: '#8a98b3',
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },

  cardHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  cardTitle: {
    color: '#5f6f80',
    fontWeight: '700',
    fontSize: 16,
  },

  cardBody: {
    padding: 18,
  },

  dropdown: {
    borderWidth: 1,
    borderColor: '#d9dee8',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },

  dropdownList: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  loader: {
    marginTop: 40,
  },

  listContent: {
    padding: 14,
  },

  medicationCard: {
    borderWidth: 1,
    borderColor: '#e1e6ee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    backgroundColor: '#fff',
  },

  medicationInfo: {
    flex: 1,
    paddingRight: 10,
  },

  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f2f4a',
  },

  infoText: {
    color: '#0f2f4a',
    marginTop: 6,
  },

  statusColumn: {
    alignItems: 'flex-end',
    justifyContent:
      'space-between',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },

  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  administerBtn: {
    backgroundColor: '#4bc840',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },

  missedBtn: {
    backgroundColor: '#fd1010',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#64748b',
  },
});

export default MedicationAdministrationList;