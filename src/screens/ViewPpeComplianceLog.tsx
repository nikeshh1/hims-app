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
import { usePpeCompliance } from '../context/PpeComplianceContext';
import { sizes, colors } from '../constants';

const ViewPpeComplianceLog = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { logs, loading } = usePpeCompliance();
  const [log, setLog] = useState<any>(null);

  useEffect(() => {
    const ppeLog = logs.find(l => l.id === route.params?.id);
    setLog(ppeLog);
  }, [route.params?.id, logs]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!log) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text color={theme.colors.gray}>PPE compliance log not found</Text>
      </View>
    );
  }

  const complianceColor = ({
    compliant: colors.success,
    partial: colors.warning,
    'non-compliant': colors.danger,
  } as any)[log.compliance_status] || colors.primary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text h3 bold>
            {log.patient?.name || 'Unknown Patient'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: complianceColor }]}>
            <Text white bold size={12}>
              {log.compliance_status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text color={theme.colors.gray}>PPE Compliance Log</Text>
      </View>

      {/* Main Details Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        {/* PPE Status Indicator */}
        <View style={styles.ppeStatusContainer}>
          {log.ppe_used ? (
            <View style={{ backgroundColor: (colors.success as any) + '20', borderRadius: sizes.buttonRadius, padding: sizes.padding }}>
              <Text
                bold
                size={14}
                style={{ color: colors.success, textAlign: 'center' }}
              >
                ✓ PPE EQUIPMENT USED
              </Text>
              <Text
                size={12}
                style={{ color: colors.success, textAlign: 'center', marginTop: sizes.padding * 0.5 }}
              >
                {log.ppe_type}
              </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: (colors.danger as any) + '20', borderRadius: sizes.buttonRadius, padding: sizes.padding }}>
              <Text
                bold
                size={14}
                style={{ color: colors.danger, textAlign: 'center' }}
              >
                ✗ PPE EQUIPMENT NOT USED
              </Text>
            </View>
          )}
        </View>

        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            PATIENT INFORMATION
          </Text>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Patient ID:</Text>
            <Text size={12} bold>{log.patient_id}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Patient Name:</Text>
            <Text size={12}>{log.patient?.name || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />

        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            PPE COMPLIANCE DETAILS
          </Text>
          {log.ppe_used && (
            <View style={styles.detailItem}>
              <Text color={theme.colors.gray} size={12}>PPE Type:</Text>
              <Text size={12} bold>{log.ppe_type}</Text>
            </View>
          )}
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Compliance Status:</Text>
            <Text size={12} style={{ color: complianceColor, fontWeight: 'bold' }}>
              {log.compliance_status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Recorded Time:</Text>
            <Text size={12}>{new Date(log.recorded_at).toLocaleString()}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />

        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            RECORDED BY
          </Text>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Nurse:</Text>
            <Text size={12}>{log.nurse?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Created:</Text>
            <Text size={12}>{new Date(log.created_at).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Updated:</Text>
            <Text size={12}>{new Date(log.updated_at).toLocaleString()}</Text>
          </View>
        </View>

        {log.notes && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />
            <View style={styles.detailSection}>
              <Text color={theme.colors.gray} size={12} bold>
                NOTES & OBSERVATIONS
              </Text>
              <Text size={12}>{log.notes}</Text>
            </View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('EditPpeLog', { id: log.id })}
        >
          <Text white bold>
            Edit Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.danger, borderWidth: 1 }]}
          onPress={() => {
            Alert.alert(
              'Delete Log',
              'Are you sure you want to delete this PPE compliance log?',
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
            Delete Log
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
  ppeStatusContainer: {
    marginBottom: sizes.padding * 1.5,
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

export default ViewPpeComplianceLog;




