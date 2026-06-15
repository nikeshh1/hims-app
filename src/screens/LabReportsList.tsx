import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {useLabReports} from '../context/LabReportsContext';
import {useTheme} from '../hooks';
import {Block, Text, Input} from '../components';
const LabReportsList = () => {
  const navigation = useNavigation<any>();
  const {labReports, loading, refreshLabReports} =
    useLabReports();
  const {sizes} = useTheme();

  const [searchQuery, setSearchQuery] =
    useState('');
  const [error, setError] =
    useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          setError(null);
          await refreshLabReports();
        } catch (err: any) {
          setError(
            err?.message ||
              'Failed to fetch lab reports',
          );
        }
      };

      fetch();
    }, []),
  );

  const filtered = useMemo(() => {
    let result = labReports;

    if (searchQuery.trim()) {
      const q =
        searchQuery.toLowerCase();

      result = result.filter(
        report =>
          (
            report.patient
              ?.first_name || ''
          )
            .toLowerCase()
            .includes(q) ||
          (
            report.patient
              ?.last_name || ''
          )
            .toLowerCase()
            .includes(q) ||
          (
            report.test_type || ''
          )
            .toLowerCase()
            .includes(q) ||
          (
            report.test_name || ''
          )
            .toLowerCase()
            .includes(q),
      );
    }

    return result;
  }, [labReports, searchQuery]);

  const formatDate = (
    value?: string,
  ) => {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return value;
    }

    return parsed
      .toLocaleDateString('en-GB')
      .replace(/\//g, '-');
  };

  const getStatusColor = (
    status: string,
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case 'completed':
      case 'approved':
        return '#40c8bd';

      case 'pending':
      case 'requested':
        return '#ef4444';

      case 'processing':
      case 'in progress':
        return '#f59e0b';

      default:
        return '#64748b';
    }
  };

  const renderReport = ({
    item,
  }: {
    item: any;
  }) => (
    <View
      style={
        styles.reportRow
      }>
      <View
        style={
          styles.reportInfo
        }>
        <Text
          style={
            styles.patient
          }>
          {item.patient
            ?.first_name || ''}{' '}
          {item.patient
            ?.last_name || ''}
        </Text>

        <Text
          style={styles.meta}>
          {item.test_type ||
            item.test_name ||
            'Lab Report'}
        </Text>

        <Text
          style={styles.meta}>
          Status:{' '}
          {item.status}
        </Text>

        <Text
          style={styles.date}>
          {formatDate(
            item.created_at ||
              item.entered_at,
          )}
        </Text>
      </View>

      <View
        style={
          styles.statusColumn
        }>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                getStatusColor(
                  item.status,
                ),
            },
          ]}>
          <Text
            style={
              styles.statusText
            }>
            {item.status}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.viewButton
          }
          onPress={() =>
            navigation.navigate(
              'ViewLabReport',
              {
                report: item,
              },
            )
          }>
          <Text
            white
            style={
              styles.viewButtonText
            }>
            View
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
    return (
    <View style={styles.container}>
      <View style={styles.pageHeader}>
        <View>
          <Text style={styles.title}>
            Lab & Report View
          </Text>

          <Text style={styles.breadcrumb}>
            Nurse / Lab Reports
          </Text>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Input
          search
          placeholder="Search patient or test type..."
          onChangeText={(text: string) =>
            setSearchQuery(text)
          }
          value={searchQuery}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Lab Reports
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#cd1b83"
          />
        ) : error ? (
          <View style={styles.center}>
            <Text
              style={{
                color: '#ef4444',
                fontSize: 14,
              }}>
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) =>
              String(item.id)
            }
            renderItem={renderReport}
            contentContainerStyle={
              styles.listContent
            }
            ListEmptyComponent={
              <Text
                style={
                  styles.emptyText
                }>
                No Lab Reports Found
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    padding: 14,
  },

  pageHeader: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f2f4a',
  },

  breadcrumb: {
    marginTop: 4,
    color: '#8a98b3',
    fontWeight: '600',
  },

  searchCard: {
    marginBottom: 16,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },

  cardHeader: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },

  cardTitle: {
    color: '#5f6f80',
    fontWeight: '700',
    fontSize: 16,
  },

  loader: {
    marginTop: 40,
  },

  listContent: {
    padding: 14,
  },

  reportRow: {
    borderWidth: 1,
    borderColor: '#e1e6ee',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },

  reportInfo: {
    flex: 1,
    paddingRight: 10,
  },

  patient: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f2f4a',
  },

  meta: {
    color: '#0f2f4a',
    marginTop: 6,
  },

  date: {
    color: '#5f6f80',
    marginTop: 6,
  },

  statusColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },

  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },

  viewButton: {
    backgroundColor: '#cd1b83',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 14,
  },

  viewButtonText: {
    color: '#fff',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 12,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#64748b',
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
});

export default LabReportsList;