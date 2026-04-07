import React, { useState } from 'react';
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
import {
  getDeletedInfectionLogs,
  restoreInfectionLog,
  forceDeleteInfectionLog,
} from '../../api/infectionLogs';

const TrashInfectionLogs = () => {
  const navigation = useNavigation<any>();
  const { sizes } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('📥 Fetching deleted infection logs...');
      const data = await getDeletedInfectionLogs();
      console.log('✅ Deleted logs response type:', typeof data);
      console.log('✅ Is array?', Array.isArray(data));
      console.log('✅ Deleted logs response:', JSON.stringify(data, null, 2));
      console.log('📊 Number of deleted logs:', Array.isArray(data) ? data.length : 'N/A');
      if (Array.isArray(data)) {
        console.log('📝 Logs content:', data.map(l => ({ id: l.id, patient: l.patient?.first_name })));
      }
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.log('❌ Error fetching deleted infection logs:');
      console.log('   - Error message:', err?.message);
      console.log('   - Response status:', err?.response?.status);
      console.log('   - Response data:', JSON.stringify(err?.response?.data));
      console.log('   - Full error:', JSON.stringify(err));
      // Show error to user instead of silently failing
      Alert.alert('Error', `Failed to load deleted logs: ${err?.response?.data?.message || err?.message}`);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (id: string) => {
    Alert.alert(
      'Restore Log',
      'Restore this infection log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'default',
          onPress: async () => {
            try {
              await restoreInfectionLog(id);
              Alert.alert('Restored', 'Log restored successfully');
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to restore');
            }
          },
        },
      ]
    );
  };

  const handlePermanentDelete = (id: string) => {
    Alert.alert(
      'Permanently Delete',
      'This action cannot be undone. Delete permanently?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await forceDeleteInfectionLog(id);
              Alert.alert('Deleted', 'Log permanently removed');
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const filtered = logs.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.patient?.first_name || '').toLowerCase().includes(q) ||
      (item.patient?.last_name || '').toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text bold size={15}>
        {item.patient?.first_name || ''} {item.patient?.last_name || ''}
      </Text>
      <Text gray size={12} style={{ marginTop: 4 }}>
        {item.infection_type || '-'}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]}
          onPress={() => handleRestore(item.id)}
        >
          <Text size={12} color="#2e7d32" bold>Restore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#ffcdd2' }]}
          onPress={() => handlePermanentDelete(item.id)}
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
          <Text bold size={20}>Deleted Logs</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search deleted logs..."
            onChangeText={setSearchQuery}
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
            <Text gray size={14}>No deleted logs</Text>
          </View>
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: { marginVertical: 16 },
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
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 4, alignItems: 'center' },
});

export default TrashInfectionLogs;
