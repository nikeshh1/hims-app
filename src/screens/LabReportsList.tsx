import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useLabReports } from '../context/LabReportsContext';
import { useTheme } from '../hooks';
import { Block, Text, Input } from '../components';

const LabReportsList = () => {
  const navigation = useNavigation<any>();
  const { labReports, loading, removeLabReport, refreshLabReports } = useLabReports();
  const { sizes, colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          setError(null);
          await refreshLabReports();
        } catch (err: any) {
          console.error('Error fetching lab reports:', err);
          setError(err?.message || 'Failed to fetch lab reports');
        }
      };
      fetch();
    }, []),
  );

  const filtered = useMemo(() => {
    let result = labReports;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (report) =>
          (report.patient?.first_name || '').toLowerCase().includes(q) ||
          (report.patient?.last_name || '').toLowerCase().includes(q) ||
          (report.test_type || '').toLowerCase().includes(q) ||
          (report.test_name || '').toLowerCase().includes(q),
      );
    }
    if (filterStatus) {
      result = result.filter((report) => report.status === filterStatus);
    }
    return result;
  }, [labReports, searchQuery, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return '#4caf50';
      case 'in progress':
      case 'processing':
        return '#ff9800';
      case 'pending':
      case 'requested':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return '#e8f5e9';
      case 'in progress':
      case 'processing':
        return '#fff3e0';
      case 'pending':
      case 'requested':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Lab Report',
      `Delete report for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeLabReport(item.id);
              Alert.alert('Deleted', 'Lab report removed');
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Cannot delete');
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <Text bold size={12} color="#666" style={{ flex: 1.5 }}>PATIENT</Text>
      <Text bold size={12} color="#666" style={{ flex: 1 }}>TYPE</Text>
      <Text bold size={12} color="#666" style={{ flex: 1 }}>STATUS</Text>
      <Text bold size={12} color="#666" style={{ flex: 1 }}>DATE</Text>
      <Text bold size={12} color="#666" style={{ flex: 0.8, textAlign: 'center' }}>ACTION</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.tableRow}>
      <View style={{ flex: 1.5 }}>
        <Text bold size={13}>
          {item.patient?.first_name || ''} {item.patient?.last_name || ''}
        </Text>
        <Text gray size={11}>{item.patient?.patient_code || '-'}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text size={13}>
          {item.test_type || item.test_name || 'Report'}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(item.status) },
          ]}>
          <Text
            bold
            size={11}
            style={{ color: getStatusColor(item.status) }}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <Text size={12} gray>{formatDate(item.created_at || item.entered_at)}</Text>
      </View>

      <View style={{ flex: 0.8, alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={styles.viewBtn}
          onPress={() => navigation.navigate('ViewLabReport', { report: item })}>
          <Text bold size={12} color="#fff">View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const statusOptions = [
    { label: 'All', value: null },
    { label: 'Pending', value: 'Pending' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Approved', value: 'Approved' },
  ];

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text bold size={20}>Lab & Report View</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search patient or test type..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value || 'all'}
              style={[
                styles.filterBtn,
                filterStatus === option.value && styles.filterBtnActive,
              ]}
              onPress={() => setFilterStatus(option.value)}>
              <Text
                bold
                size={12}
                color={filterStatus === option.value ? '#fff' : '#666'}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{ marginTop: 10 }}>Loading lab reports...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={{ color: '#f44336', fontSize: 14, marginBottom: 10 }}>
              ❌ Error: {error}
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => refreshLabReports()}>
              <Text bold color="#fff" size={14}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No lab reports found</Text>
            <Text gray size={12} style={{ marginTop: 8 }}>
              ({labReports.length} total reports available)
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {renderTableHeader()}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              scrollEnabled={true}
            />
          </View>
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
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterBtnActive: {
    backgroundColor: '#cb0c9f',
    borderColor: '#cb0c9f',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  viewBtn: {
    backgroundColor: '#cb0c9f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LabReportsList;
