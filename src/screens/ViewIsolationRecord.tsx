import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from '../components';
import { useTheme } from '../hooks';
import { useIsolationRecords } from '../context/IsolationRecordsContext';
import { sizes, colors } from '../constants';

const ViewIsolationRecord = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { records, loading } = useIsolationRecords();
  const [record, setRecord] = useState<any>(null);

  useEffect(() => {
    const rec = records.find(r => r.id === route.params?.id);
    setRecord(rec);
  }, [route.params?.id, records]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text color={theme.colors.gray}>Isolation record not found</Text>
      </View>
    );
  }

  const statusColor = ({
    active: colors.warning,
    completed: colors.success,
    discontinued: colors.danger,
  } as any)[record.status] || colors.primary;

  const daysSince = Math.floor(
    (new Date().getTime() - new Date(record.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text h3 bold>
            {record.patient?.name || 'Unknown Patient'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text white bold size={12}>
              {record.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text color={theme.colors.gray}>Isolation Tracking Record</Text>
      </View>

      {/* Main Details Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.isolationTypeTag}>
          <Text
            bold
            size={14}
            style={{
              color: colors.primary,
              backgroundColor: (colors.primary as any) + '20',
              paddingHorizontal: sizes.padding * 0.75,
              paddingVertical: sizes.padding * 0.5,
              borderRadius: sizes.buttonRadius,
            }}
          >
            {record.isolation_type.toUpperCase()}
          </Text>
        </View>

        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            PATIENT INFORMATION
          </Text>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Patient ID:</Text>
            <Text size={12} bold>{record.patient_id}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Patient Name:</Text>
            <Text size={12}>{record.patient?.name || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />

        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            ISOLATION DETAILS
          </Text>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Type:</Text>
            <Text size={12} bold>{record.isolation_type}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Start Date:</Text>
            <Text size={12}>{new Date(record.start_date).toLocaleDateString()}</Text>
          </View>
          {record.end_date && (
            <View style={styles.detailItem}>
              <Text color={theme.colors.gray} size={12}>End Date:</Text>
              <Text size={12}>{new Date(record.end_date).toLocaleDateString()}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Duration:</Text>
            <Text size={12} bold>{daysSince} days</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Status:</Text>
            <Text size={12} style={{ color: statusColor, fontWeight: 'bold' }}>
              {record.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />

        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            RECORDED BY
          </Text>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Nurse:</Text>
            <Text size={12}>{record.nurse?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Created:</Text>
            <Text size={12}>{new Date(record.created_at).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Updated:</Text>
            <Text size={12}>{new Date(record.updated_at).toLocaleString()}</Text>
          </View>
        </View>

        {record.notes && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />
            <View style={styles.detailSection}>
              <Text color={theme.colors.gray} size={12} bold>
                PRECAUTIONS & NOTES
              </Text>
              <Text size={12}>{record.notes}</Text>
            </View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('EditIsolation', { id: record.id })}
        >
          <Text white bold>
            Edit Record
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.danger, borderWidth: 1 }]}
          onPress={() => {
            Alert.alert(
              'Delete Record',
              'Are you sure you want to delete this isolation record?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ]
            );
          }}
        >
          <Text danger bold>
            Delete Record
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: sizes.padding,
    paddingVertical: sizes.padding,
  },
  header: {
    marginBottom: sizes.padding * 1.5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.5,
    borderRadius: sizes.buttonRadius,
  },
  isolationTypeTag: {
    marginBottom: sizes.padding,
  },
  card: {
    borderRadius: sizes.buttonRadius,
    padding: sizes.padding,
    marginBottom: sizes.padding,
  },
  detailSection: {
    marginBottom: sizes.padding,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.5,
  },
  divider: {
    height: 1,
    marginVertical: sizes.padding,
  },
  actionContainer: {
    gap: sizes.padding,
    marginBottom: sizes.padding * 2,
  },
  actionButton: {
    paddingVertical: sizes.padding * 0.75,
    borderRadius: sizes.buttonRadius,
    alignItems: 'center',
  },
});

export default ViewIsolationRecord;




