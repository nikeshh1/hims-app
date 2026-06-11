import React, {useEffect, useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useAppointments} from '../../context/AppointmentContext';
import {getPatients, getDepartments, getDoctorsByDepartment} from '../../api/appointment';
import {useTheme} from '../../hooks';
import {Block, Text} from '../../components';
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

const parseDate = (s: string) => {
  if (!s) return new Date();
  const parts = s.split('-');
  if (parts.length === 3) return new Date(+parts[0], +parts[1] - 1, +parts[2]);
  return new Date();
};

const parseTime = (s: string) => {
  const d = new Date();
  if (!s) return d;
  const parts = s.split(':');
  if (parts.length >= 2) {
    d.setHours(+parts[0], +parts[1], 0, 0);
  }
  return d;
};

const AddAppointment = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {addAppointment, editAppointment} = useAppointments();
  const {sizes} = useTheme();

  const editData = route.params?.editData;
  const isEdit = !!editData;

  const [patientId, setPatientId] = useState(editData?.patient_id || '');
  const [departmentId, setDepartmentId] = useState(editData?.department_id || '');
  const [doctorId, setDoctorId] = useState(editData?.doctor_id?.toString() || '');
  const [appointmentDate, setAppointmentDate] = useState(editData?.appointment_date || '');
  const [appointmentTime, setAppointmentTime] = useState(
    editData?.appointment_time ? editData.appointment_time.substring(0, 5) : '',
  );
  const [consultationFee, setConsultationFee] = useState(
    editData?.consultation_fee?.toString() || '',
  );
  const [status, setStatus] = useState(editData?.appointment_status || 'Scheduled');

  const [patients, setPatients] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, dRes] = await Promise.all([getPatients(), getDepartments()]);
        setPatients(pRes.data?.data || []);
        setDepartments(dRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (departmentId) {
      getDoctorsByDepartment(departmentId)
        .then((res) => setDoctors(res.data?.data || []))
        .catch(() => setDoctors([]));
    } else {
      setDoctors([]);
    }
  }, [departmentId]);

  const onDateChange = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setAppointmentDate(formatDate(selectedDate));
  };

  const onTimeChange = (_event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) setAppointmentTime(formatTime(selectedTime));
  };

  const validate = () => {
    if (!patientId) return 'Please select a patient';
    if (!departmentId) return 'Please select a department';
    if (!doctorId) return 'Please select a doctor';
    if (!appointmentDate) return 'Please select appointment date';
    if (!appointmentTime) return 'Please select appointment time';
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
      department_id: departmentId,
      doctor_id: Number(doctorId),
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      consultation_fee: consultationFee ? parseFloat(consultationFee) : 0,
      appointment_status: status,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await editAppointment(editData.id, payload);
        Alert.alert('Success', 'Appointment updated');
      } else {
        await addAppointment(payload);
        Alert.alert('Success', 'Appointment created');
      }
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to save appointment';
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
          <Text gray style={{marginTop: 10}}>Loading form data...</Text>
        </View>
      </Block>
    );
  }

  return (
    <Block safe>
      <ScrollView
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80}}>

        {/* ── Card wrapper ── */}
        <View style={styles.card}>

          {/* Patient */}
          <Text style={styles.label}>Patient *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={patientId}
              onValueChange={(v) => setPatientId(v)}
              style={styles.picker}
              dropdownIconColor="#555">
              <Picker.Item label="-- Select Patient --" value="" color="#999" />
              {patients.map((p: any) => (
                <Picker.Item
                  key={p.id}
                  label={`${p.first_name} ${p.last_name}`}
                  value={p.id}
                />
              ))}
            </Picker>
          </View>

          {/* Department */}
          <Text style={styles.label}>Department *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={departmentId}
              onValueChange={(v) => {
                setDepartmentId(v);
                setDoctorId('');
              }}
              style={styles.picker}
              dropdownIconColor="#555">
              <Picker.Item label="-- Select Department --" value="" color="#999" />
              {departments.map((d: any) => (
                <Picker.Item key={d.id} label={d.name || d.department_name} value={d.id} />
              ))}
            </Picker>
          </View>

          {/* Doctor */}
          <Text style={styles.label}>Doctor *</Text>
          <View style={[styles.pickerWrapper, !departmentId && {opacity: 0.5}]}>
            <Picker
              selectedValue={doctorId}
              onValueChange={(v) => setDoctorId(v)}
              style={styles.picker}
              dropdownIconColor="#555"
              enabled={!!departmentId && doctors.length > 0}>
              <Picker.Item
                label={departmentId ? '-- Select Doctor --' : '-- Select department first --'}
                value=""
                color="#999"
              />
              {doctors.map((d: any) => (
                <Picker.Item key={d.id} label={`Dr. ${d.name}`} value={d.id.toString()} />
              ))}
            </Picker>
          </View>

          {/* Consultation Fee */}
          <Text style={styles.label}>Consultation Fee</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={consultationFee}
            onChangeText={setConsultationFee}
            style={styles.textInput}
          />

          {/* Appointment Date */}
          <Text style={styles.label}>Appointment Date *</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}>
            <Text size={15} color={appointmentDate ? '#1a1a2e' : '#999'}>
              {appointmentDate || 'Tap to select date'}
            </Text>
            <Text size={18}>📅</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={parseDate(appointmentDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Appointment Time */}
          <Text style={styles.label}>Appointment Time *</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}>
            <Text size={15} color={appointmentTime ? '#1a1a2e' : '#999'}>
              {appointmentTime || 'Tap to select time'}
            </Text>
            <Text size={18}>⏰</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={parseTime(appointmentTime)}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'clock'}
              is24Hour={false}
              onChange={onTimeChange}
            />
          )}

          {/* Status */}
          <Text style={styles.label}>Status</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={status}
              onValueChange={(v) => setStatus(v)}
              style={styles.picker}
              dropdownIconColor="#555">
              <Picker.Item label="Scheduled" value="Scheduled" />
              <Picker.Item label="Cancelled" value="Cancelled" />
              <Picker.Item label="Completed" value="Completed" />
            </Picker>
          </View>
        </View>

        {/* ── Buttons ── */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && {opacity: 0.6}]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text bold color="#fff" size={15}>
              {submitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
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
    marginTop: 16,
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
    height: 50,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1a1a2e',
  },
  dateBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    marginBottom: 20,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#cb0c9f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginRight: 6,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 16,
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

export default AddAppointment;
