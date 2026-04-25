import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNurseReports } from '../../context/NurseReportsContext';
import { useTheme } from '../../hooks';
import { Block, Text } from '../../components';

const ShiftReport = () => {
  console.log('[ShiftReport] Component rendering');
  const { shiftReport, loading, fetchShiftReport } = useNurseReports();
  const { sizes, colors } = useTheme();

  const [entryTypeFilter, setEntryTypeFilter] = useState<string>('All');
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('All');
  const [refreshing, setRefreshing] = useState(false);

  console.log('[ShiftReport] Context data:', { shiftReport: shiftReport?.length, loading });

  useFocusEffect(
    React.useCallback(() => {
      const fetch = async () => {
        try {
          await fetchShiftReport();
        } catch (err: any) {
          console.error('Error fetching shift report:', err);
        }
      };
      fetch();
    }, []),
  );

  const filtered = useMemo(() => {
    let result = shiftReport;
    if (entryTypeFilter !== 'All') {
      result = result.filter((shift) => shift.entry_type === entryTypeFilter);
    }
    if (taskStatusFilter !== 'All') {
      result = result.filter((shift) => shift.task_status === taskStatusFilter);
    }
    console.log('[ShiftReport] Filtered data:', { totalShifts: shiftReport.length, filtered: result.length, entryTypeFilter, taskStatusFilter });
    return result;
  }, [shiftReport, entryTypeFilter, taskStatusFilter]);

  useEffect(() => {
    console.log('[ShiftReport] Render - loading:', loading, 'filtered length:', filtered.length);
  }, [loading, filtered]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchShiftReport(
      entryTypeFilter !== 'All' ? entryTypeFilter : undefined,
      taskStatusFilter !== 'All' ? taskStatusFilter : undefined
    )
      .then(() => setRefreshing(false))
      .catch(() => setRefreshing(false));
  }, [entryTypeFilter, taskStatusFilter]);

  const handleFilter = async () => {
    try {
      await fetchShiftReport(
        entryTypeFilter !== 'All' ? entryTypeFilter : undefined,
        taskStatusFilter !== 'All' ? taskStatusFilter : undefined
      );
    } catch (err: any) {
      console.error('Error filtering:', err);
    }
  };

  const handleReset = async () => {
    setEntryTypeFilter('All');
    setTaskStatusFilter('All');
    try {
      await fetchShiftReport();
    } catch (err: any) {
      console.error('Error resetting:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#e8f5e9';
      case 'pending':
        return '#fff3e0';
      default:
        return '#f5f5f5';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Block flex={0} style={styles.header} safe>
        <Text h5 style={{ color: colors.text }}>
          Shift Report
        </Text>
        <Text gray>Nurse</Text>
      </Block>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Filters */}
        <Block style={[styles.filterSection, { backgroundColor: colors.card }]}>
          <Text bold style={{ marginBottom: sizes.sm }}>
            Entry Type: {entryTypeFilter}
          </Text>
          <View style={styles.filterOptions}>
            {['All', 'note', 'task'].map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: entryTypeFilter === type ? colors.primary : colors.background,
                    borderColor: colors.light
                  }
                ]}
                onPress={() => setEntryTypeFilter(type)}
              >
                <Text bold color={entryTypeFilter === type ? '#fff' : colors.text}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text bold style={{ marginTop: sizes.md, marginBottom: sizes.sm }}>
            Task Status: {taskStatusFilter}
          </Text>
          <View style={styles.filterOptions}>
            {['All', 'completed', 'pending'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  {
                    backgroundColor: taskStatusFilter === status ? colors.primary : colors.background,
                    borderColor: colors.light
                  }
                ]}
                onPress={() => setTaskStatusFilter(status)}
              >
                <Text bold color={taskStatusFilter === status ? '#fff' : colors.text}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Filter and Reset Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.filterBtn, { backgroundColor: colors.primary }]}
              onPress={handleFilter}
            >
              <Text white bold>FILTER</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.resetBtn, { backgroundColor: colors.background, borderColor: colors.light }]}
              onPress={handleReset}
            >
              <Text bold style={{ color: colors.text }}>RESET</Text>
            </TouchableOpacity>
          </View>
        </Block>

        {/* Table Section */}
        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerContent}>
            <Text gray>No shift records found</Text>
          </View>
        ) : (
          <Block style={[styles.tableSection, { backgroundColor: colors.card }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.shiftTableContent}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { borderBottomColor: colors.light }]}>
              <Text bold size={12} color="#666" style={{ flex: 1 }}>NURSE</Text>
              <Text bold size={12} color="#666" style={{ flex: 1 }}>SHIFT</Text>
              <Text bold size={12} color="#666" style={{ flex: 0.9 }}>TYPE</Text>
              <Text bold size={12} color="#666" style={{ flex: 1.2 }}>DESCRIPTION</Text>
              <Text bold size={12} color="#666" style={{ flex: 0.9 }}>STATUS</Text>
              <Text bold size={12} color="#666" style={{ flex: 1 }}>DATE</Text>
            </View>

            {/* Table Rows */}
            {filtered.map((shift, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.tableRow, 
                  { borderBottomColor: colors.light },
                  idx === filtered.length - 1 && { borderBottomWidth: 0 }
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text bold size={12}>{shift.nurse_name}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text size={12}>{shift.shift_name}</Text>
                  <Text gray size={11}>
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </Text>
                </View>
                <Text size={12} style={{ flex: 0.9 }}>{shift.entry_type}</Text>
                <Text size={11} style={{ flex: 1.2, color: colors.gray }} numberOfLines={1}>
                  {shift.description}
                </Text>
                <View style={{ flex: 0.9 }}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBgColor(shift.task_status) },
                    ]}
                  >
                    <Text
                      bold
                      size={11}
                      style={{ color: getStatusColor(shift.task_status) }}
                    >
                      {shift.task_status}
                    </Text>
                  </View>
                </View>
                <Text size={11} style={{ flex: 1, color: colors.gray }}>
                  {formatDate(shift.created_at)}
                </Text>
              </View>
            ))}
              </View>
            </ScrollView>
          </Block>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  filterSection: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    height: 48,
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 1,
  },
  tableSection: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  shiftTableContent: {
    minWidth: 720,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    minHeight: 48,
  },
  picker: {
    height: 48,
    fontSize: 14,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ShiftReport;
