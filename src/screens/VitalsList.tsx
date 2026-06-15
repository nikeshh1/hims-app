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
import {useVitals} from '../context/VitalsContext';
import {useTheme} from '../hooks';
import {Block, Text, Input} from '../components';

const VitalsList = () => {
  const navigation = useNavigation<any>();
  const {vitals, loading, removeVital, refreshVitals} = useVitals();
  const {sizes} = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshVitals();
    }, []),
  );

  const filtered = useMemo(() => {
    let result = vitals;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          (v.patient?.first_name || '').toLowerCase().includes(q) ||
          (v.patient?.last_name || '').toLowerCase().includes(q) ||
          (v.nurse?.name || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [vitals, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Vital Record',
      `Delete record for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeVital(item.id);
              Alert.alert('Deleted', 'Vital record removed');
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message || 'Cannot delete',
              );
            }
          },
        },
      ],
    );
  };

  const formatTemp = (temp: any) => {
    if (!temp) return '-';
    return `${temp}°C`;
  };

  const formatBP = (sys: any, dia: any) => {
    if (!sys || !dia) return '-';
    return `${sys}/${dia}`;
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View style={{flex: 1}}>
        <Text bold size={16}>
          {item.patient?.first_name || ''} {item.patient?.last_name || ''}
        </Text>

        <Text
          style={{
            marginTop: 6,
            color: '#334155',
            fontSize: 14,
            fontWeight: '500',
          }}>
          Nurse: {item.nurse?.name || '-'}
        </Text>

        <Text
          style={{
            marginTop: 6,
            color: '#334155',
            fontSize: 14,
            fontWeight: '500',
          }}>
          Temperature: {formatTemp(item.temperature)}
        </Text>

        <Text
          style={{
            marginTop: 6,
            color: '#334155',
            fontSize: 14,
            fontWeight: '500',
          }}>
          BP:{' '}
          {formatBP(
            item.blood_pressure_systolic,
            item.blood_pressure_diastolic,
          )}
        </Text>

        <Text
          style={{
            marginTop: 6,
            color: '#334155',
            fontSize: 14,
            fontWeight: '500',
          }}>
          Pulse: {item.pulse_rate || '-'}
        </Text>

        <Text
          style={{
            marginTop: 8,
            color: '#475569',
            fontSize: 13,
            fontWeight: '500',
          }}>
          {item.recorded_at?.substring(0, 10)}
        </Text>
      </View>

      <View style={styles.statusColumn}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('ViewVital', {id: item.id})}>
          <Text bold color="#2e7d32">
            VIEW
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddVital', {editData: item})}>
          <Text bold color="#1565c0">
            EDIT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}>
          <Text bold color="#c62828">
            DELETE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.title}>Patient Monitoring</Text>
            <Text style={styles.breadcrumb}>Nurse / Patient Monitoring</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('AddVital')}>
            <Text white style={styles.primaryButtonText}>
              Record Vital
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient or nurse..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#6c757d',
            paddingVertical: 10,
            borderRadius: 6,
            alignItems: 'center',
            marginBottom: 12,
          }}
          onPress={() => navigation.navigate('TrashVitals')}>
          <Text bold color="#fff">
            Deleted Records
          </Text>
          
        </TouchableOpacity>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>
              Loading vitals...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>
              No vitals records found
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, {marginTop: 16}]}
              onPress={() => navigation.navigate('AddVital')}>
              <Text bold color="#fff" size={14}>
                + Record First Vital
              </Text>
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
    paddingVertical: 6,
    borderRadius: 8,
  },
  searchContainer: {marginBottom: 8},
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e6ee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
  pageHeader: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f2f4a',
  },

  breadcrumb: {
    marginTop: 4,
    color: '#8a98b3',
    fontWeight: '600',
  },

  primaryButton: {
    backgroundColor: '#cd1b83',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusColumn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  viewButton: {
    backgroundColor: '#e8f5e9',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    minWidth: 90,
    alignItems: 'center',
  },

  editButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-end',
    minWidth: 90,
    alignItems: 'center',
  },

  deleteButton: {
    backgroundColor: '#fce4ec',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 8,
    alignSelf: 'flex-end',
    minWidth: 90,
    alignItems: 'center',
  },
});

export default VitalsList;
