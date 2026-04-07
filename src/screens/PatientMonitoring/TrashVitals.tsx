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
import {getDeletedVitals, restoreVital, forceDeleteVital} from '../../api/vitals';
import {useVitals} from '../../context/VitalsContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const TrashVitals = () => {
  const {refreshVitals} = useVitals();
  const {sizes} = useTheme();

  const [deleted, setDeleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDeletedVitals();
      setDeleted(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load deleted vitals:', err);
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
      (v) =>
        (v.patient?.first_name || '').toLowerCase().includes(q) ||
        (v.patient?.last_name || '').toLowerCase().includes(q),
    );
  }, [deleted, searchQuery]);

  const handleRestore = (item: any) => {
    Alert.alert('Restore', 'Restore this vital record?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Restore',
        onPress: async () => {
          try {
            await restoreVital(item.id);
            await fetchDeleted();
            await refreshVitals();
            Alert.alert('Done', 'Vital record restored');
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
            await forceDeleteVital(item.id);
            await fetchDeleted();
            Alert.alert('Done', 'Vital record permanently deleted');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Delete failed');
          }
        },
      },
    ]);
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <Text bold size={14}>
        {item.patient?.first_name || ''} {item.patient?.last_name || ''}
      </Text>
      <Text gray size={12} style={{marginTop: 4}}>
        🌡️ {item.temperature ? `${item.temperature}°C` : '-'}
      </Text>
      <Text gray size={12} style={{marginTop: 2}}>
        👨‍⚕️ {item.nurse?.name || '-'}
      </Text>
      <Text gray size={12} style={{marginTop: 2}}>
        📅 {item.recorded_at?.substring(0, 10)}  ⏰ {item.recorded_at?.substring(11, 16)}
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
          <Text bold size={20}>Deleted Vitals</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search deleted vitals..."
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
            <Text gray size={16}>No deleted vitals</Text>
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
  header: {marginTop: 16, marginBottom: 12},
  searchContainer: {marginBottom: 12},
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
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
    marginTop: 10,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 5,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});

export default TrashVitals;
