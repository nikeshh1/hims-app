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
  createPpeLog,
  updatePpeLog,
  getPpeLog,
} from '../../api/ppeCompliance';

const AddPpeCompliance = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sizes } = useTheme();
  const editData = route.params?.editData;

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientId, setPatientId] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  
  const [ppeUsed, setPpeUsed] = useState('Yes');
  const [showPpeUsedDropdown, setShowPpeUsedDropdown] = useState(false);
  
  const [ppeType, setPpeType] = useState('Select');
  const [showPpeTypeDropdown, setShowPpeTypeDropdown] = useState(false);
  
  const [status, setStatus] = useState('Compliant');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);

  const ppeTypes = ['Select', 'Mask', 'Gloves', 'Face Shield', 'Full Kit'];
  const ppeUsedOptions = ['Yes', 'No', 'Select'];
  const complianceStatuses = ['Compliant', 'Non-compliant'];

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (editData && patients.length > 0) {
      loadData();
    }
  }, [editData, patients]);

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
      const data = await getPpeLog(editData.id);
      console.log('Loaded PPE Log data:', JSON.stringify(data, null, 2));
      
      setPatientId(data?.patient_id?.toString() || '');
      
      // Try to use patient from response first, then search in patients list
      let foundPatient = data?.patient;
      if (!foundPatient && data?.patient_id) {
        foundPatient = patients.find(p => p.id === data.patient_id);
      }
      if (foundPatient) {
        console.log('Found patient:', foundPatient);
        setSelectedPatient(foundPatient);
      }
      
      setPpeUsed(data?.ppe_used ? 'Yes' : 'No');
      setPpeType(data?.ppe_type || 'Select');
      
      // Handle compliance_status with proper capitalization
      if (data?.compliance_status) {
        const capitalizedStatus = data.compliance_status.charAt(0).toUpperCase() + data.compliance_status.slice(1);
        setStatus(capitalizedStatus);
      } else {
        setStatus('Compliant');
      }
      
      setNotes(data?.notes || '');
    } catch (err: any) {
      console.log('Error loading data:', err);
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
    if (!patientId || ppeType === 'Select' || ppeUsed === 'Select') {
      Alert.alert('Validation', 'Please fill all required fields (Patient, PPE Used, PPE Type)');
      return;
    }

    setSavingRecord(true);
    try {
      const payload = {
        patient_id: patientId,
        ppe_used: ppeUsed === 'Yes',
        ppe_type: ppeType,
        compliance_status: status.toLowerCase(),
        notes,
      };

      console.log('Saving PPE log with payload:', JSON.stringify(payload, null, 2));

      if (editData?.id) {
        await updatePpeLog(editData.id, payload);
        console.log('Record updated successfully');
        Alert.alert('Success', 'Record updated');
      } else {
        await createPpeLog(payload);
        console.log('Record created successfully');
        Alert.alert('Success', 'Record created');
      }
      navigation.goBack();
    } catch (err: any) {
      console.log('Error saving record:', err?.response?.data || err?.message);
      Alert.alert('Error', err?.response?.data?.message || 'Failed to save');
    } finally {
      setSavingRecord(false);
    }
  };

  if (loading && editData) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <Block safe>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: sizes.padding, paddingBottom: 20 }}
      >
        <Text bold size={20} style={{ marginVertical: 16 }}>
          {editData ? 'Edit PPE Record' : 'Add PPE Compliance Record'}
        </Text>

        {/* Patient Selection */}
        <Text bold size={14} color="#666" style={{ marginTop: 16, marginBottom: 8 }}>
          Patient
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setShowPatientDropdown(!showPatientDropdown);
            setShowPpeUsedDropdown(false);
            setShowPpeTypeDropdown(false);
            setShowStatusDropdown(false);
          }}
        >
          <Text size={14} style={{ flex: 1 }}>
            {selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : 'Select Patient'}
          </Text>
          <Text>▼</Text>
        </TouchableOpacity>
        {showPatientDropdown && (
          <View style={[styles.dropdownOptions, { maxHeight: 300 }]}>
            <ScrollView scrollEnabled={true}>
              {patients.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.option}
                  activeOpacity={0.7}
                  onPress={() => handlePatientSelect(item)}
                >
                  <Text color={selectedPatient?.id === item.id ? colors.primary : '#000'}>
                    {item.first_name} {item.last_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* PPE Used */}
        <Text bold size={14} color="#666" style={{ marginTop: 16, marginBottom: 8 }}>
          PPE Used
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setShowPpeUsedDropdown(!showPpeUsedDropdown);
            setShowPpeTypeDropdown(false);
            setShowStatusDropdown(false);
          }}
        >
          <Text size={14}>{ppeUsed}</Text>
          <Text>▼</Text>
        </TouchableOpacity>
        {showPpeUsedDropdown && (
          <View style={styles.dropdownOptions}>
            {ppeUsedOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  setPpeUsed(option);
                  setShowPpeUsedDropdown(false);
                }}
              >
                <Text color={ppeUsed === option ? colors.primary : '#000'}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PPE Type */}
        <Text bold size={14} color="#666" style={{ marginTop: 16, marginBottom: 8 }}>
          PPE Type
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setShowPpeTypeDropdown(!showPpeTypeDropdown);
            setShowPpeUsedDropdown(false);
            setShowStatusDropdown(false);
          }}
        >
          <Text size={14}>{ppeType}</Text>
          <Text>▼</Text>
        </TouchableOpacity>
        {showPpeTypeDropdown && (
          <View style={styles.dropdownOptions}>
            {ppeTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.option}
                activeOpacity={0.7}
                onPress={() => {
                  setPpeType(type);
                  setShowPpeTypeDropdown(false);
                }}
              >
                <Text color={ppeType === type ? colors.primary : '#000'}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Compliance Status */}
        <Text bold size={14} color="#666" style={{ marginTop: 16, marginBottom: 8 }}>
          Compliance Status
        </Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => {
            setShowStatusDropdown(!showStatusDropdown);
            setShowPpeUsedDropdown(false);
            setShowPpeTypeDropdown(false);
          }}
        >
          <Text size={14}>{status}</Text>
          <Text>▼</Text>
        </TouchableOpacity>
        {showStatusDropdown && (
          <View style={styles.dropdownOptions}>
            {complianceStatuses.map((s) => (
              <TouchableOpacity
                key={s}
                activeOpacity={0.7}
                style={styles.option}
                onPress={() => {
                  setStatus(s);
                  setShowStatusDropdown(false);
                }}
              >
                <Text color={status === s ? colors.primary : '#000'}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Notes */}
        <Text bold size={14} color="#666" style={{ marginTop: 16, marginBottom: 8 }}>
          Notes
        </Text>
        <Input
          placeholder="Additional notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={savingRecord}
        >
          <Text bold color="#fff" size={14}>
            {savingRecord ? 'SAVING...' : 'SAVE'}
          </Text>
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          disabled={savingRecord}
        >
          <Text bold color="#666" size={14}>
            CANCEL
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  dropdownList: {
    marginTop: 50,
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
});

export default AddPpeCompliance;
