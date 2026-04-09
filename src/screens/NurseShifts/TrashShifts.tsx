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
import {getDeletedShifts, restoreShift, forceDeleteShift} from '../../api/nurseShifts';
import {useNurseShifts} from '../../context/NurseShiftsContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const TrashShifts = () => {
  const {refreshShifts} = useNurseShifts();
  const {sizes} = useTheme();

  const [deleted, setDeleted] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDeletedShifts();
      setDeleted(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load deleted shifts:', err);
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
    return deleted.filter((s) =>
      (s.shift_name || '').toLowerCase().includes(q),
    );
  }, [deleted, searchQuery]);

  const handleRestore = (item: any) => {
    Alert.alert('Restore', `Restore "${item.shift_name}" shift?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Restore',
        onPress: async () => {
          try {
            await restoreShift(item.id);
            await fetchDeleted();
            await refreshShifts();
            Alert.alert('Done', 'Shift restored');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Restore failed');
          }
        },
      },
    ]);
  };

  const handleForceDelete = (item: any) => {
    Alert.alert(
      'Permanent Delete',
      `Permanently delete "${item.shift_name}"? This cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            try {
              await forceDeleteShift(item.id);
              await fetchDeleted();
              Alert.alert('Done', 'Shift permanently deleted');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Delete failed');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text bold size={15}>
            {item.shift_name}
          </Text>
          <Text gray size={12} style={{marginTop: 4}}>
            🕐 {item.start_time?.substring(0, 5)} - {item.end_time?.substring(0, 5)}
          </Text>
        </View>
      </View>

      {item.grace_minutes && (
        <Text gray size={12} style={{marginTop: 8}}>
          ⏰ Grace: {item.grace_minutes} mins
        </Text>
      )}

      {item.break_minutes && (
        <Text gray size={12} style={{marginTop: 2}}>
          ☕ Break: {item.break_minutes} mins
        </Text>
      )}

      <Text gray size={11} style={{marginTop: 8}}>
        🗑️ Deleted {item.deleted_at?.substring(0, 10)}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#e8f5e9'}]}
          onPress={() => handleRestore(item)}>
          <Text size={12} color="#2e7d32" bold>
            Restore
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#ffebee'}]}
          onPress={() => handleForceDelete(item)}>
          <Text size={12} color="#d32f2f" bold>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.header}>
          <Text bold size={20}>Deleted Shifts</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search deleted shifts..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>
              Loading...
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No deleted shifts</Text>
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
  searchContainer: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
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
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});

export default TrashShifts;
