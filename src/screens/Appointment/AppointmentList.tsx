import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {useAppointments} from '../../context/AppointmentContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const AppointmentList = () => {
  const navigation = useNavigation<any>();
  const {appointments, loading, removeAppointment, refreshAppointments} = useAppointments();
  const {sizes} = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshAppointments();
    }, []),
  );

  const filtered = useMemo(() => {
    let result = appointments;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          (a.patient?.first_name || '').toLowerCase().includes(q) ||
          (a.patient?.last_name || '').toLowerCase().includes(q) ||
          (a.doctor?.name || '').toLowerCase().includes(q) ||
          (a.department?.department_name || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [appointments, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Appointment',
      `Delete appointment for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAppointment(item.id);
              Alert.alert('Deleted', 'Appointment removed');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Cannot delete');
            }
          },
        },
      ],
    );
  };

  const statusColor = (status: string) => {
    if (status === 'Scheduled') return {bg: '#e3f2fd', text: '#1565c0'};
    if (status === 'Completed') return {bg: '#e6f4ea', text: '#1e8e3e'};
    return {bg: '#fce8e6', text: '#d93025'};
  };

  const renderItem = ({item}: {item: any}) => {
    const sc = statusColor(item.appointment_status);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text bold size={15} style={{flex: 1}}>
            {item.patient?.first_name || ''} {item.patient?.last_name || ''}
          </Text>
          <View style={[styles.statusBadge, {backgroundColor: sc.bg}]}>
            <Text size={11} bold color={sc.text}>
              {item.appointment_status}
            </Text>
          </View>
        </View>

        <Text gray size={13} style={{marginTop: 4}}>
          👨‍⚕️ Dr. {item.doctor?.name || '-'}
        </Text>
        <Text gray size={13} style={{marginTop: 2}}>
          🏥 {item.department?.department_name || '-'}
        </Text>
        <Text gray size={13} style={{marginTop: 2}}>
          📅 {item.appointment_date}  ⏰ {item.appointment_time}
        </Text>
        {item.consultation_fee > 0 && (
          <Text gray size={13} style={{marginTop: 2}}>
            💰 ₹{item.consultation_fee}
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#e8f5e9'}]}
            onPress={() => navigation.navigate('ViewAppointment', {id: item.id})}>
            <Text size={12} color="#2e7d32" bold>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#e3f2fd'}]}
            onPress={() => navigation.navigate('AddAppointment', {editData: item})}>
            <Text size={12} color="#1565c0" bold>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#fce4ec'}]}
            onPress={() => handleDelete(item)}>
            <Text size={12} color="#c62828" bold>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.header}>
          <Text bold size={20}>Appointments</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.addBtn, {backgroundColor: '#6c757d'}]}
            onPress={() => navigation.navigate('TrashAppointments')}>
            <Text bold color="#fff" size={14}>Deleted List</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddAppointment')}>
            <Text bold color="#fff" size={14}>+ Add Appointment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient, doctor, department..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>Loading appointments...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No appointments found</Text>
            <TouchableOpacity
              style={[styles.addBtn, {marginTop: 16}]}
              onPress={() => navigation.navigate('AddAppointment')}>
              <Text bold color="#fff" size={14}>+ Add First Appointment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 40}}
          />
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  addBtn: {
    backgroundColor: '#cb0c9f',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchContainer: {marginBottom: 8},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});

export default AppointmentList;
