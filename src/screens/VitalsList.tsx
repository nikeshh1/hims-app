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
              Alert.alert('Error', err?.response?.data?.message || 'Cannot delete');
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
      <View style={styles.cardHeader}>
        <Text bold size={15} style={{flex: 1}}>
          {item.patient?.first_name || ''} {item.patient?.last_name || ''}
        </Text>
      </View>

      <Text gray size={13} style={{marginTop: 4}}>
        👨‍⚕️ {item.nurse?.name || '-'}
      </Text>
      
      <View style={styles.vitalsRow}>
        <Text gray size={12}>🌡️ {formatTemp(item.temperature)}</Text>
        <Text gray size={12}>💓 {item.blood_pressure_systolic ? `${item.blood_pressure_systolic}/${item.blood_pressure_diastolic}` : '-'}</Text>
        <Text gray size={12}>🫁 {item.pulse_rate || '-'}</Text>
      </View>

      <Text gray size={12} style={{marginTop: 4}}>
        📅 {item.recorded_at?.substring(0, 10)} ⏰ {item.recorded_at?.substring(11, 16)}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#e8f5e9'}]}
          onPress={() => navigation.navigate('ViewVital', {id: item.id})}>
          <Text size={12} color="#2e7d32" bold>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#e3f2fd'}]}
          onPress={() => navigation.navigate('AddVital', {editData: item})}>
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

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.header}>
          <Text bold size={20}>Patient Monitoring</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.addBtn, {backgroundColor: '#6c757d'}]}
            onPress={() => navigation.navigate('TrashVitals')}>
            <Text bold color="#fff" size={14}>Deleted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddVital')}>
            <Text bold color="#fff" size={14}>+ Record Vital</Text>
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

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>Loading vitals...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No vitals records found</Text>
            <TouchableOpacity
              style={[styles.addBtn, {marginTop: 16}]}
              onPress={() => navigation.navigate('AddVital')}>
              <Text bold color="#fff" size={14}>+ Record First Vital</Text>
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
});

export default VitalsList;

