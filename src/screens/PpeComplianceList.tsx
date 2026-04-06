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
import { Text } from '../components';
import { useTheme } from '../hooks';
import { usePpeCompliance } from '../context/PpeComplianceContext';
import { sizes, colors } from '../constants';

const PpeComplianceList = ({ navigation }: any) => {
  const theme = useTheme();
  const {
    logs,
    loading,
    error,
    refreshLogs,
    getLogsByStatus,
    removeLog,
  } = usePpeCompliance();

  const [refreshing, setRefreshing] = useState(false);
  const [complianceFilter, setComplianceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLogs();
    setRefreshing(false);
  };

  useEffect(() => {
    if (complianceFilter !== 'all') {
      getLogsByStatus(complianceFilter);
    } else {
      refreshLogs();
    }
  }, [complianceFilter]);

  const filteredLogs = logs.filter((log) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (log.patient?.name?.toLowerCase().includes(query) || '') ||
      (log.ppe_type?.toLowerCase().includes(query) || '') ||
      (log.patient?.id?.toLowerCase().includes(query) || '');

    return matchesSearch;
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete PPE Compliance Log',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeLog(id);
              Alert.alert('Success', 'Log deleted successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete log');
            }
          },
        },
      ]
    );
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return colors.success;
      case 'non-compliant':
        return colors.danger;
      case 'partial':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  const renderPpeLogCard = ({ item }: any) => {
    const complianceColor = getComplianceColor(item.compliance_status);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ViewPpeLog', { id: item.id })}
        style={[styles.card, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text bold>{item.patient?.name || 'Unknown Patient'}</Text>
            <Text color={theme.colors.gray} size={12}>
              {new Date(item.recorded_at).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: complianceColor }]}>
            <Text white size={11} bold>
              {item.compliance_status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.ppeTypeContainer}>
          {item.ppe_used ? (
            <View
              style={{
                backgroundColor: (colors.success as any) + '20',
                paddingHorizontal: sizes.padding * 0.75,
                paddingVertical: sizes.padding * 0.5,
                borderRadius: sizes.buttonRadius,
                marginBottom: sizes.padding * 0.5,
              }}
            >
              <Text size={12} bold style={{ color: colors.success }}>
                ✓ PPE Used: {item.ppe_type.toUpperCase()}
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: (colors.danger as any) + '20',
                paddingHorizontal: sizes.padding * 0.75,
                paddingVertical: sizes.padding * 0.5,
                borderRadius: sizes.buttonRadius,
                marginBottom: sizes.padding * 0.5,
              }}
            >
              <Text size={12} bold style={{ color: colors.danger }}>
                ✗ PPE Not Used
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              Recorded By:
            </Text>
            <Text size={12} bold>
              {item.nurse?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              PPE Type:
            </Text>
            <Text size={12}>{item.ppe_type}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              Time:
            </Text>
            <Text size={12}>{new Date(item.recorded_at).toLocaleTimeString()}</Text>
          </View>
          {item.notes && (
            <View style={styles.detailRow}>
              <Text color={theme.colors.gray} size={12}>
                Notes:
              </Text>
              <Text size={11}>{item.notes.substring(0, 40)}...</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditPpeLog', { id: item.id })}
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
          PPE Compliance Tracking
        </Text>
        <Text color={theme.colors.gray} size={12}>
          Monitor and log personal protective equipment usage
        </Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddPpeLog')}
      >
        <Text white bold>
          + Log PPE Compliance
        </Text>
      </TouchableOpacity>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          { borderColor: theme.colors.light, color: theme.colors.text },
        ]}
        placeholder="Search by patient name, ID, or PPE type..."
        placeholderTextColor={theme.colors.gray}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Compliance Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {['all', 'compliant', 'partial', 'non-compliant'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              complianceFilter === status && styles.filterButtonActive,
              {
                borderColor:
                  complianceFilter === status ? colors.primary : theme.colors.light,
                backgroundColor:
                  complianceFilter === status ? (colors.primary as any) + '20' : 'transparent',
              },
            ]}
            onPress={() => setComplianceFilter(status)}
          >
            <Text
              bold
              size={12}
              style={{
                color: complianceFilter === status ? colors.primary : theme.colors.gray,
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

      {/* Logs List */}
      {!loading && (
        <FlatList
          data={filteredLogs}
          renderItem={renderPpeLogCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text color={theme.colors.gray}>No PPE compliance logs found</Text>
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
  ppeTypeContainer: {
    marginBottom: sizes.padding * 0.75,
  },
  cardDetails: {
    marginBottom: sizes.padding * 0.75,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sizes.padding * 0.5,
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

export default PpeComplianceList;



