import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  RefreshControl,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Modal, Button } from '../components';
import { useTheme } from '../hooks';
import { useIsolationRecords } from '../context/IsolationRecordsContext';
import { sizes, colors } from '../constants';

const IsolationTrackingList = ({ navigation }: any) => {
  const theme = useTheme();
  const {
    records,
    loading,
    error,
    refreshRecords,
    getActiveRecords,
    removeRecord,
  } = useIsolationRecords();

  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    if (filterStatus !== 'all') {
      await getActiveRecords();
    } else {
      await refreshRecords();
    }
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, [filterStatus]);

  const filteredRecords = records.filter((record) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (record.patient?.name?.toLowerCase().includes(query) || '') ||
      (record.isolation_type?.toLowerCase().includes(query) || '') ||
      (record.patient?.id?.toLowerCase().includes(query) || '');

    const matchesStatus =
      filterStatus === 'all' || record.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Isolation Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeRecord(id);
              Alert.alert('Success', 'Record deleted successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  const renderIsolationCard = ({ item }: any) => {
    const statusColor: string = ({
      active: colors.warning,
      completed: colors.success,
      discontinued: colors.danger,
    } as any)[item.status] || colors.primary;

    const daysSince = Math.floor(
      (new Date().getTime() - new Date(item.start_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ViewIsolation', { id: item.id })}
        style={[styles.card, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text bold>{item.patient?.name || 'Unknown Patient'}</Text>
            <Text color={theme.colors.gray} size={12}>
              Patient ID: {item.patient?.id || 'N/A'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text white size={11} bold>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.isolationTypeTag}>
          <Text
            size={12}
            bold
            style={{
              color: colors.primary,
              backgroundColor: (colors.primary as any) + '20',
              paddingHorizontal: sizes.padding * 0.5,
              paddingVertical: sizes.padding * 0.25,
              borderRadius: sizes.buttonRadius,
              textAlign: 'center',
            }}
          >
            {item.isolation_type.toUpperCase()}
          </Text>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              Nurse:
            </Text>
            <Text size={12} bold>
              {item.nurse?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              Start Date:
            </Text>
            <Text size={12}>{new Date(item.start_date).toLocaleDateString()}</Text>
          </View>
          {item.end_date && (
            <View style={styles.detailRow}>
              <Text color={theme.colors.gray} size={12}>
                End Date:
              </Text>
              <Text size={12}>{new Date(item.end_date).toLocaleDateString()}</Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              Duration:
            </Text>
            <Text size={12} bold>
              {daysSince} days
            </Text>
          </View>
          {item.notes && (
            <View style={styles.detailRow}>
              <Text color={theme.colors.gray} size={12}>
                Notes:
              </Text>
              <Text size={11}>{item.notes.substring(0, 50)}...</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditIsolation', { id: item.id })}
          >
            <Text primary size={12} bold>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text danger size={12} bold>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text h3 bold>
          Isolation Tracking
        </Text>
        <Text color={theme.colors.gray} size={12}>
          Monitor patient isolation status and compliance
        </Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddIsolation')}
      >
        <Text white bold>
          + Add Isolation Record
        </Text>
      </TouchableOpacity>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          { borderColor: theme.colors.light, color: theme.colors.text },
        ]}
        placeholder="Search by patient name, ID, or type..."
        placeholderTextColor={theme.colors.gray}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'active', 'completed', 'discontinued'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
              {
                borderColor: filterStatus === status ? colors.primary : theme.colors.light,
                backgroundColor:
                  filterStatus === status ? (colors.primary as any) + '20' : 'transparent',
              },
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              bold
              size={12}
              style={{
                color: filterStatus === status ? colors.primary : theme.colors.gray,
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading State */}
      {loading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: (colors.danger as any) + '20' }]}>
          <Text danger bold>
            Error: {error}
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text primary>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Records List */}
      {!loading && (
        <FlatList
          data={filteredRecords}
          renderItem={renderIsolationCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text color={theme.colors.gray}>No isolation records found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.padding,
  },
  header: {
    marginVertical: sizes.padding,
  },
  addButton: {
    paddingVertical: sizes.padding * 0.75,
    paddingHorizontal: sizes.padding,
    borderRadius: sizes.buttonRadius,
    alignItems: 'center',
    marginBottom: sizes.padding,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: sizes.buttonRadius,
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.5,
    marginBottom: sizes.padding,
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: sizes.padding,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: sizes.buttonRadius,
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.5,
    marginRight: sizes.padding * 0.5,
  },
  filterButtonActive: {
    borderWidth: 2,
  },
  card: {
    borderRadius: sizes.buttonRadius,
    padding: sizes.padding,
    marginBottom: sizes.padding,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: sizes.padding * 0.75,
  },
  cardTitle: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.5,
    borderRadius: sizes.buttonRadius,
    marginLeft: sizes.padding,
  },
  isolationTypeTag: {
    marginBottom: sizes.padding * 0.5,
  },
  cardDetails: {
    marginBottom: sizes.padding * 0.75,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sizes.padding * 0.5,
    alignItems: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: sizes.padding,
  },
  actionButton: {
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.5,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: sizes.padding,
    borderRadius: sizes.buttonRadius,
    marginBottom: sizes.padding,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  retryButton: {
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: sizes.padding * 2,
  },
  listContent: {
    paddingBottom: sizes.padding,
  },
});

export default IsolationTrackingList;



