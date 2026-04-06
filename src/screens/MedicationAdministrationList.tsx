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
import { useMedicationAdministration } from '../context/MedicationAdministrationContext';
import { sizes, colors } from '../constants';

const MedicationAdministrationList = ({ navigation }: any) => {
  const theme = useTheme();
  const {
    medications,
    loading,
    error,
    refreshMedications,
    getMedicationsByStatus,
    removeMedication,
  } = useMedicationAdministration();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshMedications();
    setRefreshing(false);
  };

  useEffect(() => {
    if (selectedStatus !== 'all') {
      getMedicationsByStatus(selectedStatus);
    } else {
      refreshMedications();
    }
  }, [selectedStatus]);

  const filteredMedications = medications.filter((med) => {
    const query = searchQuery.toLowerCase();
    return (
      (med.patient?.name?.toLowerCase().includes(query) || '') ||
      (med.prescription_item_id?.toLowerCase().includes(query) || '')
    );
  });

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Medication Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMedication(id);
              Alert.alert('Success', 'Medication record deleted successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete medication record');
            }
          },
        },
      ]
    );
  };

  const renderMedicationCard = ({ item }: any) => {
    const statusColor: string = ({
      administered: colors.success,
      pending: colors.warning,
      skipped: colors.gray,
      refused: colors.danger,
    } as any)[item.status] || colors.primary;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ViewMedication', { id: item.id })}
        style={[styles.card, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitle}>
            <Text bold>{item.patient?.name || 'Unknown Patient'}</Text>
            <Text color={theme.colors.gray} size={12}>
              {new Date(item.administered_time).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text white size={12} bold>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              Nurse:
            </Text>
            <Text size={12}>{item.nurse?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text color={theme.colors.gray} size={12}>
              Prescription:
            </Text>
            <Text size={12}>{item.prescription_item_id}</Text>
          </View>
          {item.notes && (
            <View style={styles.detailRow}>
              <Text color={theme.colors.gray} size={12}>
                Notes:
              </Text>
              <Text size={12}>{item.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditMedication', { id: item.id })}
          >
            <Text primary size={12}>
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <Text danger size={12}>
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
          Medication Administration
        </Text>
        <Text color={theme.colors.gray} size={12}>
          Track medication administration to patients
        </Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddMedication')}
      >
        <Text white bold>
          + Add Medication
        </Text>
      </TouchableOpacity>

      {/* Search Bar */}
      <TextInput
        style={[
          styles.searchInput,
          { borderColor: theme.colors.light, color: theme.colors.text },
        ]}
        placeholder="Search by patient or prescription..."
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
        {['all', 'pending', 'administered', 'skipped', 'refused'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.filterButtonActive,
              {
                borderColor: selectedStatus === status ? colors.primary : theme.colors.light,
                backgroundColor:
                  selectedStatus === status ? (colors.primary as any) + '20' : 'transparent',
              },
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              bold
              size={12}
              style={{
                color: selectedStatus === status ? colors.primary : theme.colors.gray,
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

      {/* Medications List */}
      {!loading && (
        <FlatList
          data={filteredMedications}
          renderItem={renderMedicationCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text color={theme.colors.gray}>No medications found</Text>
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

export default MedicationAdministrationList;



