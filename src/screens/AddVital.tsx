import React, {useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useVitals} from '../context/VitalsContext';
import {getPatients, getNurses} from '../api/vitals';
import {useTheme} from '../hooks';
import {Block, Text} from '../components';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const formatDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatTime = (d: Date) => {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

const parseDateTime = (s: string) => {
  if (!s) return new Date();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
};

const AddVital = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {addVital, editVital} = useVitals();
  const {sizes} = useTheme();

  const editData = route.params?.editData;
  const isEdit = !!editData;

  const [patientId, setPatientId] = useState(editData?.patient_id || '');
  const [nurseId, setNurseId] = useState(editData?.nurse_id || '');
  const [temperature, setTemperature] = useState(editData?.temperature?.toString() || '');
  const [sysBP, setSysBP] = useState(editData?.blood_pressure_systolic?.toString() || '');
  const [diaBP, setDiaBP] = useState(editData?.blood_pressure_diastolic?.toString() || '');
  const [pulseRate, setPulseRate] = useState(editData?.pulse_rate?.toString() || '');
  const [respRate, setRespRate] = useState(editData?.respiratory_rate?.toString() || '');
  const [spo2, setSpo2] = useState(editData?.spo2?.toString() || '');
  const [bloodSugar, setBloodSugar] = useState(editData?.blood_sugar?.toString() || '');
  const [weight, setWeight] = useState(editData?.weight?.toString() || '');
  const [recordedAt, setRecordedAt] = useState(editData?.recorded_at ? editData.recorded_at.substring(0, 19) : new Date().toISOString().substring(0, 19));

  const [patients, setPatients] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, nRes] = await Promise.all([getPatients(), getNurses()]);
        setPatients(pRes.data?.data || []);
        setNurses(nRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDateTime = new Date(recordedAt);
      newDateTime.setFullYear(selectedDate.getFullYear());
      newDateTime.setMonth(selectedDate.getMonth());
      newDateTime.setDate(selectedDate.getDate());
      setRecordedAt(newDateTime.toISOString().substring(0, 19));
    }
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDateTime = new Date(recordedAt);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setRecordedAt(newDateTime.toISOString().substring(0, 19));
    }
  };

  const validate = () => {
    if (!patientId) return 'Please select a patient';
    if (!nurseId) return 'Please select a nurse';
    if (!temperature) return 'Please enter temperature';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    const payload = {
      patient_id: patientId,
      nurse_id: nurseId,
      temperature: Number(temperature),
      blood_pressure_systolic: sysBP ? Number(sysBP) : null,
      blood_pressure_diastolic: diaBP ? Number(diaBP) : null,
      pulse_rate: pulseRate ? Number(pulseRate) : null,
      respiratory_rate: respRate ? Number(respRate) : null,
      spo2: spo2 ? Number(spo2) : null,
      blood_sugar: bloodSugar ? Number(bloodSugar) : null,
      weight: weight ? Number(weight) : null,
      recorded_at: recordedAt,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await editVital(editData.id, payload);
        Alert.alert('Success', 'Vital record updated');
      } else {
        await addVital(payload);
        Alert.alert('Success', 'Vital record created');
      }
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save vital record';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <Block safe>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#cb0c9f" />
          <Text gray style={{marginTop: 10}}>Loading form...</Text>
        </View>
      </Block>
    );
  }

  const dateObj = parseDateTime(recordedAt);

  return (
    <Block safe>
      <ScrollView
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80}}>

        <View style={styles.card}>

          {/* Patient */}
          <Text style={styles.label}>Patient *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={patientId}
              onValueChange={setPatientId}
              style={styles.picker}
              dropdownIconColor="#555">
              <Picker.Item label="-- Select Patient --" value="" color="#999" />
              {patients.map((p: any) => (
                <Picker.Item
                  key={p.id}
                  label={`${p.first_name} ${p.last_name} (${p.blood_group || 'N/A'})`}
                  value={p.id}
                />
              ))}
            </Picker>
          </View>

          {/* Nurse */}
          <Text style={styles.label}>Nurse *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={nurseId}
              onValueChange={setNurseId}
              style={styles.picker}
              dropdownIconColor="#555">
              <Picker.Item label="-- Select Nurse --" value="" color="#999" />
              {nurses.map((n: any) => (
                <Picker.Item key={n.id} label={n.name} value={n.id} />
              ))}
            </Picker>
          </View>

          {/* Temperature */}
          <Text style={styles.label}>Temperature (°C) *</Text>
          <TextInput
            placeholder="37.5"
            placeholderTextColor="#aaa"
            keyboardType="decimal-pad"
            value={temperature}
            onChangeText={setTemperature}
            style={styles.textInput}
          />

          {/* Blood Pressure */}
          <Text style={styles.label}>Blood Pressure (Systolic)</Text>
          <TextInput
            placeholder="120"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={sysBP}
            onChangeText={setSysBP}
            style={styles.textInput}
          />

          <Text style={styles.label}>Blood Pressure (Diastolic)</Text>
          <TextInput
            placeholder="80"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={diaBP}
            onChangeText={setDiaBP}
            style={styles.textInput}
          />

          {/* Pulse Rate */}
          <Text style={styles.label}>Pulse Rate (bpm)</Text>
          <TextInput
            placeholder="72"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={pulseRate}
            onChangeText={setPulseRate}
            style={styles.textInput}
          />

          {/* Respiratory Rate */}
          <Text style={styles.label}>Respiratory Rate (breaths/min)</Text>
          <TextInput
            placeholder="16"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={respRate}
            onChangeText={setRespRate}
            style={styles.textInput}
          />

          {/* SpO2 */}
          <Text style={styles.label}>SpO2 (%)</Text>
          <TextInput
            placeholder="98"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            value={spo2}
            onChangeText={setSpo2}
            style={styles.textInput}
          />

          {/* Blood Sugar */}
          <Text style={styles.label}>Blood Sugar (mg/dL)</Text>
          <TextInput
            placeholder="120.5"
            placeholderTextColor="#aaa"
            keyboardType="decimal-pad"
            value={bloodSugar}
            onChangeText={setBloodSugar}
            style={styles.textInput}
          />

          {/* Weight */}
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            placeholder="70.5"
            placeholderTextColor="#aaa"
            keyboardType="decimal-pad"
            value={weight}
            onChangeText={setWeight}
            style={styles.textInput}
          />

          {/* Date & Time */}
          <Text style={styles.label}>Recorded Date & Time</Text>
          <View style={{flexDirection: 'row', gap: 8}}>
            <TouchableOpacity
              style={[styles.dateBtn, {flex: 1}]}
              onPress={() => setShowDatePicker(true)}>
              <Text size={14} color={recordedAt ? '#1a1a2e' : '#999'}>
                {recordedAt.substring(0, 10)}
              </Text>
              <Text size={16}>📅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateBtn, {flex: 1}]}
              onPress={() => setShowTimePicker(true)}>
              <Text size={14} color={recordedAt ? '#1a1a2e' : '#999'}>
                {recordedAt.substring(11, 16)}
              </Text>
              <Text size={16}>⏰</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dateObj}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dateObj}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
              is24Hour={true}
              onChange={onTimeChange}
            />
          )}

        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && {opacity: 0.6}]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text bold color="#fff" size={15}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Record'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text bold color="#555" size={15}>Cancel</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#444',
    marginBottom: 6,
    marginTop: 14,
  },
  pickerWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 56,
  },
  picker: {
    height: 56,
    color: '#1a1a2e',
    fontSize: 14,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 48,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#1a1a2e',
  },
  dateBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 20,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#cb0c9f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginRight: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddVital;

