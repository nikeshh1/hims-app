import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks';
import { Block, Text, Input, Button } from '../../components';
import { colors } from '../../constants';
import apiClient from '../../api/apiClient';
import {
  createInfectionLog,
  updateInfectionLog,
  getInfectionLog,
} from '../../api/infectionLogs';

const AddInfectionLog = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sizes } = useTheme();
  const editData = route.params?.editData;

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientId, setPatientId] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [infectionType, setInfectionType] = useState('');
  const [severity, setSeverity] = useState('Low');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    loadPatients();
    if (editData) {
      loadData();
    }
  }, [editData]);

  const loadPatients = async () => {
    try {
      const res = await apiClient.get('/medication-administration/patients-list');
      setPatients(res.data.data || []);
    } catch (err: any) {
      console.log('Failed to load patients');
    }
  };

  const loadData = async () => {
    if (!editData?.id) return;
    setLoading(true);
    try {
      const data = await getInfectionLog(editData.id);
      setPatientId(data?.patient_id?.toString() || '');
      const patient = patients.find(p => p.id === data?.patient_id);
      if (patient) setSelectedPatient(patient);
      setInfectionType(data?.infection_type || '');
      setSeverity(data?.severity || 'Low');
      setStatus(data?.status || 'Active');
      setNotes(data?.notes || '');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load record');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setPatientId(patient.id);
    setShowPatientDropdown(false);
  };

  const handleSave = async () => {
    if (!patientId || !infectionType) {
      Alert.alert('Validation', 'Please select a patient and fill all required fields');
      return;
    }

    setSavingLog(true);
    try {
      const payload = {
        patient_id: patientId,
        infection_type: infectionType,
        severity,
        status,
        notes,
      };

      if (editData?.id) {
        await updateInfectionLog(editData.id, payload);
        Alert.alert('Success', 'Log updated');
      } else {
        await createInfectionLog(payload);
        Alert.alert('Success', 'Log created');
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save');
    } finally {
      setSavingLog(false);
    }
  };

  if (loading && editData) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <Block safe>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: sizes.padding }}
      >
        <Text bold size={20} style={{ marginVertical: 16 }}>
          {editData ? 'Edit Infection Log' : 'New Infection Log'}
        </Text>

        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          👤 Select Patient *
        </Text>
        <TouchableOpacity
          style={[styles.dropdown, { borderColor: colors.primary }]}
          onPress={() => setShowPatientDropdown(!showPatientDropdown)}
        >
          <Text bold color={selectedPatient ? '#333' : '#999'}>
            {selectedPatient?.name || 'Choose a patient...'}
          </Text>
        </TouchableOpacity>
        {showPatientDropdown && (
          <View style={[styles.dropdownList, { borderColor: colors.primary }]}>
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

        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          Infection Type *
        </Text>
        <Input
          placeholder="e.g., COVID-19, Influenza, Bacterial"
          value={infectionType}
          onChangeText={setInfectionType}
        />

        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          Severity
        </Text>
        <View style={styles.severityRow}>
          {['Low', 'Medium', 'High'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.severityBtn,
                { backgroundColor: severity === s ? colors.primary : '#f0f0f0' },
              ]}
              onPress={() => setSeverity(s)}
            >
              <Text bold color={severity === s ? '#fff' : '#000'} size={11}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          Status
        </Text>
        <View style={styles.statusRow}>
          {['Active', 'Recovered', 'Under-Observation'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.statusBtn,
                { backgroundColor: status === s ? colors.primary : '#f0f0f0' },
              ]}
              onPress={() => setStatus(s)}
            >
              <Text bold color={status === s ? '#fff' : '#000'} size={12}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          Notes
        </Text>
        <Input
          placeholder="Additional notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        <Button
          onPress={handleSave}
          disabled={savingLog}
          primary
          style={{ marginVertical: 30, marginBottom: 40 }}
        >
          <Text bold color="#fff">
            {savingLog ? 'Saving...' : 'Save Log'}
          </Text>
        </Button>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    paddingVertical: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  severityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  severityBtn: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
});

export default AddInfectionLog;
