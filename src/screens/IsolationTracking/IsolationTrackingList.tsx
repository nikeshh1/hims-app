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
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text bold size={16} style={{ color: '#2d3748' }}>
          {item.patient?.first_name || ''}{' '}
          {item.patient?.last_name || ''}
        </Text>

        <Text style={styles.infoText}>
          Isolation: {item.isolation_type || '-'}
        </Text>

        <Text style={styles.infoText}>
          Status: {item.status || '-'}
        </Text>

        <Text style={styles.infoText}>
          Start Date: {item.start_date || '-'}
        </Text>

        {item.end_date && (
          <Text style={styles.infoText}>
            End Date: {item.end_date}
          </Text>
        )}

        <Text style={styles.dateText}>
          {item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : '-'}
        </Text>
      </View>

      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={[styles.verticalBtn, { backgroundColor: '#e8f5e9' }]}
          onPress={() =>
            navigation.navigate('ViewIsolationTracking', {
              id: item.id,
            })
          }>
          <Text bold color="#2e7d32">
            VIEW
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalBtn,
            {
              backgroundColor: '#e3f2fd',
              marginTop: 4,
            },
          ]}
          onPress={() =>
            navigation.navigate('AddIsolationTracking', {
              editData: item,
            })
          }>
          <Text bold color="#1565c0">
            EDIT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verticalBtn,
            {
              backgroundColor: '#fce4ec',
              marginTop: 4,
            },
          ]}
          onPress={() => handleDelete(item)}>
          <Text bold color="#c62828">
            DELETE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{ flex: 1 }}>
        <View style={styles.pageHeader}>
  <View>
    <Text style={styles.pageTitle}>Isolation Tracking</Text>
    <Text style={styles.breadcrumb}>
      Nurse / Isolation Tracking
    </Text>
  </View>

  <TouchableOpacity
    style={styles.primaryButton}
    onPress={() => navigation.navigate('AddIsolationTracking')}>
    <Text color="#fff" bold>
      + NEW RECORD
    </Text>
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
        <TouchableOpacity
  style={styles.deletedButton}
  onPress={() => navigation.navigate('TrashIsolationTracking')}>
  <Text bold color="#fff" size={15}>
    Deleted Records
  </Text>
</TouchableOpacity>
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
  searchContainer: { marginVertical: 12 },
  center: { justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  card: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 14,
  marginBottom: 16,
  elevation: 2,
},
  pageHeader: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 18,
  marginTop: 12,
  marginBottom: 12,
  flexDirection: 'row',
  justifyContent: 'space-between',
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

deletedButton: {
  backgroundColor: '#6c757d',
  height: 40,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,
},

infoText: {
  marginTop: 8,
  color: '#4a5568',
  fontSize: 14,
},

dateText: {
  marginTop: 12,
  color: '#4a5568',
  fontSize: 14,
},

actionColumn: {
  justifyContent: 'center',
},

verticalBtn: {
  width: 90,
  height: 38,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 6,
},
});

export default IsolationTrackingList;
