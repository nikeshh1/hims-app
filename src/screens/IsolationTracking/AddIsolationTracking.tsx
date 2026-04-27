import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks';
import { Block, Text, Input, Button } from '../../components';
import { colors } from '../../constants';
import { getPatients } from '../../api/vitals';
import { getPatientDisplayName } from '../../utils/patientDisplay';
import {
  createIsolationRecord,
  updateIsolationRecord,
  getIsolationRecord,
} from '../../api/isolationRecords';

const AddIsolationTracking = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sizes } = useTheme();
  const editData = route.params?.editData;

  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientId, setPatientId] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [isolationType, setIsolationType] = useState('Airborne');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const isolationTypes = ['Airborne', 'Contact', 'Droplet', 'Bloodborne', 'Protective'];

  // Convert dd-mm-yyyy to Date object (for date picker)
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [day, month, year] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Convert Date object to dd-mm-yyyy format
  const formatDateToDDMMYYYY = (date: Date): string => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  };

  // Validate date format dd-mm-yyyy
  const isValidDateFormat = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const regex = /^(\d{2})-(\d{2})-(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    const [day, month, year] = dateStr.split('-');
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    return true;
  };

  const openStartDatePicker = () => {
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    setShowEndDatePicker(true);
  };

  const handleStartDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setStartDate(formatDateToDDMMYYYY(selectedDate));
    }
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setEndDate(formatDateToDDMMYYYY(selectedDate));
    }
    setShowEndDatePicker(false);
  };

  useEffect(() => {
    loadPatients();
    if (editData) {
      loadData();
    }
  }, [editData]);

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data.data || []);
    } catch (err: any) {
      console.log('Failed to load patients');
    }
  };

  const loadData = async () => {
    if (!editData?.id) return;
    setLoading(true);
    try {
      const data = await getIsolationRecord(editData.id);
      setPatientId(data?.patient_id?.toString() || '');
      const patient = patients.find(p => p.id === data?.patient_id);
      if (patient) setSelectedPatient(patient);
      setIsolationType(data?.isolation_type || 'Airborne');
      setStartDate(data?.start_date || '');
      setEndDate(data?.end_date || '');
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
    if (!patientId || !isolationType || !startDate) {
      Alert.alert('Validation', 'Please fill all required fields (Patient, Isolation Type, Start Date)');
      return;
    }

    setSavingRecord(true);
    try {
      // Convert dd-mm-yyyy to YYYY-MM-DD format
      const convertDate = (dateStr: string) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('-');
        return `${year}-${month}-${day}`;
      };

      const payload = {
        patient_id: patientId,
        isolation_type: isolationType,
        start_date: convertDate(startDate),
        end_date: endDate ? convertDate(endDate) : null,
        status: status.toLowerCase(), // Convert "Active" -> "active"
        notes,
      };

      if (editData?.id) {
        await updateIsolationRecord(editData.id, payload);
        Alert.alert('Success', 'Record updated');
      } else {
        await createIsolationRecord(payload);
        Alert.alert('Success', 'Record created');
      }
      navigation.goBack();
    } catch (err: any) {
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
        style={{ paddingHorizontal: sizes.padding }}
      >
        <Text bold size={20} style={{ marginVertical: 16 }}>
          {editData ? 'Edit Isolation Record' : 'New Isolation Record'}
        </Text>

        {/* Patient Selector */}
        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          👤 Select Patient *
        </Text>
        <TouchableOpacity
          style={[styles.dropdown, { borderColor: colors.primary }]}
          onPress={() => setShowPatientDropdown(!showPatientDropdown)}
        >
          <Text bold color={selectedPatient ? '#333' : '#999'}>
            {selectedPatient ? getPatientDisplayName(selectedPatient) : 'Choose a patient...'}
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
                  <Text>{getPatientDisplayName(patient)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Isolation Type Dropdown */}
        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          Isolation Type *
        </Text>
        <TouchableOpacity
          style={[styles.dropdown, { borderColor: colors.primary }]}
          onPress={() => setShowTypeDropdown(!showTypeDropdown)}
        >
          <Text bold color={isolationType ? '#333' : '#999'}>
            {isolationType}
          </Text>
        </TouchableOpacity>
        {showTypeDropdown && (
          <View style={[styles.dropdownList, { borderColor: colors.primary }]}>
            <ScrollView>
              {isolationTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setIsolationType(type);
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Start Date */}
        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          Start Date *
        </Text>
        <TouchableOpacity
          style={[styles.datePickerBtn, { borderColor: colors.primary }]}
          onPress={openStartDatePicker}
        >
          <Text bold color={startDate ? '#333' : '#999'}>
            {startDate || 'dd-mm-yyyy'}
          </Text>
        </TouchableOpacity>

        {/* Start Date Picker */}
        {showStartDatePicker && (
          <DateTimePicker
            value={parseDate(startDate)}
            mode="date"
            display="spinner"
            onChange={handleStartDateChange}
            textColor="#000"
          />
        )}

        {/* End Date */}
        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          End Date
        </Text>
        <TouchableOpacity
          style={[styles.datePickerBtn, { borderColor: colors.primary }]}
          onPress={openEndDatePicker}
        >
          <Text bold color={endDate ? '#333' : '#999'}>
            {endDate || 'dd-mm-yyyy'}
          </Text>
        </TouchableOpacity>

        {/* End Date Picker */}
        {showEndDatePicker && (
          <DateTimePicker
            value={parseDate(endDate)}
            mode="date"
            display="spinner"
            onChange={handleEndDateChange}
            textColor="#000"
          />
        )}

        {/* Status */}
        <Text bold size={14} style={{ marginTop: 16, marginBottom: 8 }}>
          Status
        </Text>
        <View style={styles.statusRow}>
          {['Active', 'Completed'].map((s) => (
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

        {/* Notes */}
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
          disabled={savingRecord}
          primary
          style={{ marginVertical: 30, marginBottom: 40 }}
        >
          <Text bold color="#fff">
            {savingRecord ? 'Saving...' : 'Save Record'}
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
  datePickerBtn: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
});

export default AddIsolationTracking;
