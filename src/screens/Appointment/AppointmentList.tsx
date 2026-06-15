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
  const {
    appointments,
    loading,
    removeAppointment,
    refreshAppointments,
  } = useAppointments();

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
        a =>
          (a.patient?.first_name || '')
            .toLowerCase()
            .includes(q) ||
          (a.patient?.last_name || '')
            .toLowerCase()
            .includes(q) ||
          (a.doctor?.name || '')
            .toLowerCase()
            .includes(q) ||
          (
            a.department
              ?.department_name || ''
          )
            .toLowerCase()
            .includes(q),
      );
    }

    return result;
  }, [appointments, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Appointment',
      `Delete appointment for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAppointment(item.id);

              Alert.alert(
                'Deleted',
                'Appointment removed',
              );
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message ||
                  'Cannot delete',
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
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text
            bold
            size={16}
            style={{color: '#2d3748'}}>
            {item.patient?.first_name || ''}{' '}
            {item.patient?.last_name || ''}
          </Text>

          <Text style={styles.infoText}>
            Doctor:{' '}
            {item.doctor?.name || '-'}
          </Text>

          <Text style={styles.infoText}>
            Department:{' '}
            {item.department
              ?.department_name || '-'}
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

          {item.consultation_fee >
            0 && (
            <Text
              style={
                styles.infoText
              }>
              Fee: ₹
              {
                item.consultation_fee
              }
            </Text>
          )}
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
              navigation.navigate(
                'ViewAppointment',
                {
                  id: item.id,
                },
              )
            }>
            <Text
              bold
              color="#2e7d32">
              VIEW
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#e3f2fd',
                marginTop: 4,
              },
            ]}
            onPress={() =>
              navigation.navigate(
                'AddAppointment',
                {
                  editData:
                    item,
                },
              )
            }>
            <Text
              bold
              color="#1565c0">
              EDIT
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
              handleDelete(item)
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
        {/* HEADER */}
        <View
          style={
            styles.pageHeader
          }>
          <View>
            <Text
              style={
                styles.pageTitle
              }>
              Appointments
            </Text>

            <Text
              style={
                styles.breadcrumb
              }>
              Nurse /
              Appointments
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.primaryButton
            }
            onPress={() =>
              navigation.navigate(
                'AddAppointment',
              )
            }>
            <Text
              color="#fff"
              bold>
              + ADD
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View
          style={
            styles.searchContainer
          }>
          <Input
            search
            placeholder="Search by patient, doctor or department..."
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

        {/* DELETED BUTTON */}
        <TouchableOpacity
          style={
            styles.deletedButton
          }
          onPress={() =>
            navigation.navigate(
              'TrashAppointments',
            )
          }>
          <Text
            bold
            color="#fff"
            size={15}>
            Deleted Records
          </Text>
        </TouchableOpacity>

        {loading ? (
          <View
            style={
              styles.center
            }>
            <ActivityIndicator
              size="large"
              color="#cb0c9f"
            />
            <Text
              gray
              style={{
                marginTop: 10,
              }}>
              Loading appointments...
            </Text>
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
              No appointments found
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
  pageHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    elevation: 2,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },

  breadcrumb: {
    marginTop: 6,
    color: '#4a5568',
  },

  primaryButton: {
    backgroundColor: '#cb0c9f',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },

  searchContainer: {
    marginVertical: 12,
  },

  deletedButton: {
    backgroundColor: '#6c757d',
    height: 40,
    borderRadius: 10,
    justifyContent:
      'center',
    alignItems: 'center',
    marginBottom: 16,
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

export default AppointmentList;