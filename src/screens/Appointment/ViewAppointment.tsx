import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getAppointment} from '../../api/appointment';
import {useTheme} from '../../hooks';
import {Block, Text} from '../../components';

const ViewAppointment = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {sizes} = useTheme();
  const {id} = route.params;

  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAppointment(id);
        setAppointment(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to load appointment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <Block safe>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#cb0c9f" />
        </View>
      </Block>
    );
  }

  if (!appointment) {
    return (
      <Block safe>
        <View style={styles.center}>
          <Text gray size={16}>Appointment not found</Text>
        </View>
      </Block>
    );
  }

  const statusColor = () => {
    if (appointment.appointment_status === 'Scheduled') return {bg: '#e3f2fd', text: '#1565c0'};
    if (appointment.appointment_status === 'Completed') return {bg: '#e6f4ea', text: '#1e8e3e'};
    return {bg: '#fce8e6', text: '#d93025'};
  };
  const sc = statusColor();

  return (
    <Block safe>
      <View style={{flex: 1, padding: sizes.padding}}>
        <Text bold size={20} style={{marginBottom: 16}}>
          Appointment Details
        </Text>

        <View style={styles.card}>
          <DetailRow
            label="Patient"
            value={`${appointment.patient?.first_name || ''} ${appointment.patient?.last_name || ''}`}
          />
          <DetailRow label="Doctor" value={`Dr. ${appointment.doctor?.name || '-'}`} />
          <DetailRow label="Department" value={appointment.department?.department_name || '-'} />
          <DetailRow label="Date" value={appointment.appointment_date} />
          <DetailRow label="Time" value={appointment.appointment_time} />
          <DetailRow label="Fee" value={`₹ ${appointment.consultation_fee || 0}`} />

          <View style={styles.row}>
            <Text bold size={14} style={{width: 100}}>Status</Text>
            <View style={[styles.statusBadge, {backgroundColor: sc.bg}]}>
              <Text size={12} bold color={sc.text}>
                {appointment.appointment_status}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AddAppointment', {editData: appointment})}>
            <Text bold color="#fff" size={14}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Text bold size={14}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Block>
  );
};

const DetailRow = ({label, value}: {label: string; value: string}) => (
  <View style={styles.row}>
    <Text bold size={14} style={{width: 100}}>{label}</Text>
    <Text size={14} style={{flex: 1}}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#1565c0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewAppointment;
