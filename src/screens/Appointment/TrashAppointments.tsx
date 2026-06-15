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
import {
  getDeletedAppointments,
  restoreAppointment,
  forceDeleteAppointment,
} from '../../api/appointment';
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
      console.error(
        'Failed to load deleted appointments:',
        err,
      );
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
    if (!searchQuery.trim()) {
      return deleted;
    }

    const q = searchQuery.toLowerCase();

    return deleted.filter(
      a =>
        (a.patient?.first_name || '')
          .toLowerCase()
          .includes(q) ||
        (a.patient?.last_name || '')
          .toLowerCase()
          .includes(q) ||
        (a.doctor?.name || '')
          .toLowerCase()
          .includes(q),
    );
  }, [deleted, searchQuery]);

  const handleRestore = (item: any) => {
    Alert.alert(
      'Restore',
      'Restore this appointment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await restoreAppointment(
                item.id,
              );

              await fetchDeleted();
              await refreshAppointments();

              Alert.alert(
                'Done',
                'Appointment restored',
              );
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data
                  ?.message ||
                  'Restore failed',
              );
            }
          },
        },
      ],
    );
  };

  const handleForceDelete = (
    item: any,
  ) => {
    Alert.alert(
      'Permanent Delete',
      'This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await forceDeleteAppointment(
                item.id,
              );

              await fetchDeleted();

              Alert.alert(
                'Done',
                'Appointment permanently deleted',
              );
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data
                  ?.message ||
                  'Delete failed',
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent:
            'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text
            bold
            size={16}
            style={{
              color: '#2d3748',
            }}>
            {item.patient
              ?.first_name || ''}{' '}
            {item.patient
              ?.last_name || ''}
          </Text>

          <Text style={styles.infoText}>
            Doctor:{' '}
            {item.doctor?.name ||
              '-'}
          </Text>

          <Text style={styles.infoText}>
            Date:{' '}
            {item.appointment_date ||
              '-'}
          </Text>

          <Text style={styles.infoText}>
            Time:{' '}
            {item.appointment_time ||
              '-'}
          </Text>

          <Text style={styles.infoText}>
            Status:{' '}
            {item.appointment_status ||
              '-'}
          </Text>
        </View>

        <View
          style={
            styles.actionColumn
          }>
          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#e8f5e9',
              },
            ]}
            onPress={() =>
              handleRestore(item)
            }>
            <Text
              bold
              color="#2e7d32">
              RESTORE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#fce4ec',
                marginTop: 4,
              },
            ]}
            onPress={() =>
              handleForceDelete(
                item,
              )
            }>
            <Text
              bold
              color="#c62828">
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block
        scroll={false}
        paddingHorizontal={
          sizes.padding
        }
        style={{flex: 1}}>
        <View style={styles.header}>
          <Text
            bold
            size={20}>
            Deleted Appointments
          </Text>
        </View>

        <View
          style={
            styles.searchContainer
          }>
          <Input
            search
            placeholder="Search deleted appointments..."
            onChangeText={(
              text: string,
            ) =>
              setSearchQuery(
                text,
              )
            }
            value={
              searchQuery
            }
          />
        </View>

        {loading ? (
          <View
            style={
              styles.center
            }>
            <ActivityIndicator
              size="large"
              color="#cb0c9f"
            />
          </View>
        ) : filtered.length ===
          0 ? (
          <View
            style={
              styles.center
            }>
            <Text
              gray
              size={16}>
              No deleted appointments
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item =>
              String(
                item.id,
              )
            }
            renderItem={
              renderItem
            }
            showsVerticalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingBottom: 40,
            }}
          />
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
  },

  searchContainer: {
    marginVertical: 12,
  },

  center: {
    flex: 1,
    justifyContent:
      'center',
    alignItems: 'center',
    paddingTop: 60,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },

  infoText: {
    marginTop: 6,
    color: '#4a5568',
    fontSize: 14,
  },

  actionColumn: {
    justifyContent:
      'center',
  },

  verticalBtn: {
    width: 90,
    height: 38,
    justifyContent:
      'center',
    alignItems: 'center',
    borderRadius: 6,
  },
});

export default TrashAppointments;