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
import { getPpeLogs, deletePpeLog } from '../../api/ppeCompliance';

const PpeComplianceList = () => {
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
      const data = await getPpeLogs();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load PPE compliance records');
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
          (r.compliance_status || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [records, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Record',
      `Delete PPE compliance record for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePpeLog(item.id);
              Alert.alert('Deleted', 'Record removed');
              refreshData();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Cannot delete');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
        return '#388e3c';
      case 'non-compliant':
        return '#d32f2f';
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
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.compliance_status) }]}>
          <Text size={11} color="#fff" bold>{item.compliance_status}</Text>
        </View>
      </View>

      <Text gray size={13} style={{ marginTop: 4 }}>
        🛡️ {item.ppe_type || '-'}
      </Text>

      <Text gray size={12} style={{ marginTop: 4, fontStyle: 'italic' }}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]}
          onPress={() => navigation.navigate('ViewPpeCompliance', { id: item.id })}
        >
          <Text size={12} color="#2e7d32" bold>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]}
          onPress={() => navigation.navigate('AddPpeCompliance', { editData: item })}
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
          <Text bold size={20}>PPE Compliance</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#6c757d' }]}
            onPress={() => navigation.navigate('TrashPpeCompliance')}
          >
            <Text bold color="#fff" size={14}>Deleted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddPpeCompliance')}
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
            <Text gray size={14}>No PPE compliance records found</Text>
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

export default PpeComplianceList;
