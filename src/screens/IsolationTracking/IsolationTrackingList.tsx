import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks';
import { Block, Text, Input } from '../../components';
import { getIsolationRecords, deleteIsolationRecord } from '../../api/isolationRecords';

const IsolationTrackingList = () => {
  const navigation = useNavigation<any>();
  const { sizes, colors } = useTheme();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [])
  );

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await getIsolationRecords();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load isolation records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = records;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          (r.patient?.first_name || '').toLowerCase().includes(q) ||
          (r.patient?.last_name || '').toLowerCase().includes(q) ||
          (r.status || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Record',
      `Delete isolation record for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`Deleting record ID: ${item.id}`);
              await deleteIsolationRecord(item.id);
              console.log(`Record deleted successfully: ${item.id}`);
              Alert.alert('Deleted', 'Record removed');
              // Wait a moment to ensure database write completes
              setTimeout(() => {
                refreshData();
              }, 500);
            } catch (err: any) {
              console.log('Delete error:', err?.response?.data || err?.message);
              Alert.alert('Error', err?.response?.data?.message || 'Cannot delete');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#d32f2f';
      case 'completed':
        return '#388e3c';
      case 'pending':
        return '#f57c00';
      default:
        return '#757575';
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text bold size={15} style={{ flex: 1 }}>
          {item.patient?.first_name || ''} {item.patient?.last_name || ''}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text size={11} color="#fff" bold>{item.status}</Text>
        </View>
      </View>

      <Text gray size={13} style={{ marginTop: 4 }}>
        🏥 {item.isolation_type || '-'}
      </Text>

      <View style={styles.detailsRow}>
        <Text gray size={12}>Start Date: {item.start_date || '-'}</Text>
        {item.end_date && <Text gray size={12}>End Date: {item.end_date}</Text>}
      </View>

      <Text gray size={12} style={{ marginTop: 4, fontStyle: 'italic' }}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]}
          onPress={() => navigation.navigate('ViewIsolationTracking', { id: item.id })}
        >
          <Text size={12} color="#2e7d32" bold>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]}
          onPress={() => navigation.navigate('AddIsolationTracking', { editData: item })}
        >
          <Text size={12} color="#1565c0" bold>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#fce4ec' }]}
          onPress={() => handleDelete(item)}
        >
          <Text size={12} color="#c62828" bold>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text bold size={20}>Isolation Tracking</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#6c757d' }]}
            onPress={() => navigation.navigate('TrashIsolationTracking')}
          >
            <Text bold color="#fff" size={14}>Deleted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddIsolationTracking')}
          >
            <Text bold color="#fff" size={14}>+ New Record</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient or status..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filtered.length > 0 ? (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View style={styles.center}>
            <Text gray size={14}>No isolation records found</Text>
          </View>
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: { marginVertical: 16 },
  actionRow: { flexDirection: 'row', gap: 10, marginVertical: 10 },
  addBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  searchContainer: { marginVertical: 12 },
  center: { justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  detailsRow: { marginTop: 8, gap: 8 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
});

export default IsolationTrackingList;
