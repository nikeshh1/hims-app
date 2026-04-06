import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getVital} from '../api/vitals';
import {useTheme} from '../hooks';
import {Block, Text} from '../components';

const ViewVital = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {sizes} = useTheme();
  const {id} = route.params;

  const [vital, setVital] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getVital(id);
        setVital(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to load vital:', err);
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

  if (!vital) {
    return (
      <Block safe>
        <View style={styles.center}>
          <Text gray size={16}>Vital record not found</Text>
        </View>
      </Block>
    );
  }

  return (
    <Block safe>
      <View style={{flex: 1, padding: sizes.padding}}>
        <Text bold size={20} style={{marginBottom: 16}}>
          Vital Details
        </Text>

        <View style={styles.card}>
          <DetailRow
            label="Patient"
            value={`${vital.patient?.first_name || ''} ${vital.patient?.last_name || ''}`}
          />
          <DetailRow label="Patient Code" value={vital.patient?.patient_code || '-'} />
          <DetailRow label="Nurse" value={vital.nurse?.name || '-'} />
          <DetailRow label="Temperature" value={vital.temperature ? `${vital.temperature}°C` : '-'} />
          <DetailRow
            label="Blood Pressure"
            value={vital.blood_pressure_systolic && vital.blood_pressure_diastolic
              ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
              : '-'}
          />
          <DetailRow label="Pulse Rate" value={vital.pulse_rate ? `${vital.pulse_rate} bpm` : '-'} />
          <DetailRow label="Respiratory Rate" value={vital.respiratory_rate ? `${vital.respiratory_rate} breaths/min` : '-'} />
          <DetailRow label="SpO2" value={vital.spo2 ? `${vital.spo2}%` : '-'} />
          <DetailRow label="Blood Sugar" value={vital.blood_sugar ? `${vital.blood_sugar} mg/dL` : '-'} />
          <DetailRow label="Weight" value={vital.weight ? `${vital.weight} kg` : '-'} />
          <DetailRow label="Recorded At" value={vital.recorded_at} />
        </View>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AddVital', {editData: vital})}>
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
    <Text bold size={13} style={{width: 120, color: '#666'}}>{label}</Text>
    <Text size={13} style={{flex: 1}}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#1565c0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewVital;

