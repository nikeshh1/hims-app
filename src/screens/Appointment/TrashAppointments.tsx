import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getDeletedAppointments, restoreAppointment, forceDeleteAppointment} from '../../api/appointment';
import {useAppointments} from '../../context/AppointmentContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const TrashAppointments = () => {
  const {refreshAppointments} = useAppointments();
  const {sizes} = useTheme();

  const [deleted, setDeleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDeletedAppointments();
      setDeleted(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load deleted appointments:', err);
      setDeleted([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDeleted();
    }, [fetchDeleted]),
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return deleted;
    const q = searchQuery.toLowerCase();
    return deleted.filter(
      (a) =>
        (a.patient?.first_name || '').toLowerCase().includes(q) ||
        (a.patient?.last_name || '').toLowerCase().includes(q) ||
        (a.doctor?.name || '').toLowerCase().includes(q),
    );
  }, [deleted, searchQuery]);

  const handleRestore = (item: any) => {
    Alert.alert('Restore', 'Restore this appointment?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Restore',
        onPress: async () => {
          try {
            await restoreAppointment(item.id);
            await fetchDeleted();
            await refreshAppointments();
            Alert.alert('Done', 'Appointment restored');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Restore failed');
          }
        },
      },
    ]);
  };

  const handleForceDelete = (item: any) => {
    Alert.alert('Permanent Delete', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete Forever',
        style: 'destructive',
        onPress: async () => {
          try {
            await forceDeleteAppointment(item.id);
            await fetchDeleted();
            Alert.alert('Done', 'Appointment permanently deleted');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <Text bold size={15}>
        {item.patient?.first_name || ''} {item.patient?.last_name || ''}
      </Text>
      <Text gray size={13} style={{marginTop: 4}}>
        👨‍⚕️ Dr. {item.doctor?.name || '-'}
      </Text>
      <Text gray size={13} style={{marginTop: 2}}>
        📅 {item.appointment_date}  ⏰ {item.appointment_time}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#e8f5e9'}]}
          onPress={() => handleRestore(item)}>
          <Text size={12} color="#2e7d32" bold>Restore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#fce4ec'}]}
          onPress={() => handleForceDelete(item)}>
          <Text size={12} color="#c62828" bold>Delete Forever</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.header}>
          <Text bold size={20}>Deleted Appointments</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search deleted appointments..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No deleted appointments</Text>
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
  header: {marginTop: 16, marginBottom: 8},
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

export default TrashAppointments;
