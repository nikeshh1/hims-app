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
import { colors } from '../../constants';
import { getInfectionLogs, deleteInfectionLog } from '../../api/infectionLogs';

const InfectionLogsList = () => {
  const navigation = useNavigation<any>();
  const { sizes } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
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
      const data = await getInfectionLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load infection logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = logs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          (l.patient?.first_name || '').toLowerCase().includes(q) ||
          (l.patient?.last_name || '').toLowerCase().includes(q) ||
          (l.infection_type || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [logs, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Log',
      `Delete infection log for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInfectionLog(item.id);
              Alert.alert('Deleted', 'Log removed');
              refreshData();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Cannot delete');
            }
          },
        },
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#388e3c';
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
        <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text size={11} color="#fff" bold>{item.severity}</Text>
        </View>
      </View>

      <Text gray size={13} style={{ marginTop: 4 }}>
        🦠 {item.infection_type || '-'}
      </Text>

      <View style={styles.detailsRow}>
        <Text gray size={12}>Status: {item.status || '-'}</Text>
      </View>

      {item.symptoms && (
        <Text gray size={12} style={{ marginTop: 4 }}>
          Symptoms: {item.symptoms.substring(0, 50)}...
        </Text>
      )}

      <Text gray size={12} style={{ marginTop: 4, fontStyle: 'italic' }}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : '-'}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]}
          onPress={() => navigation.navigate('ViewInfectionLog', { id: item.id })}
        >
          <Text size={12} color="#2e7d32" bold>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]}
          onPress={() => navigation.navigate('AddInfectionLog', { editData: item })}
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
          <Text bold size={20}>Infection Logs</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#6c757d' }]}
            onPress={() => navigation.navigate('TrashInfectionLogs')}
          >
            <Text bold color="#fff" size={14}>Deleted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddInfectionLog')}
          >
            <Text bold color="#fff" size={14}>+ New Log</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient or infection..."
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
            <Text gray size={14}>No infection logs found</Text>
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
    borderLeftColor: '#d32f2f',
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  detailsRow: { marginTop: 8 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
});

export default InfectionLogsList;
