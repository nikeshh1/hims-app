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
import { useMedicationAdministration } from '../context/MedicationAdministrationContext';
import { sizes, colors } from '../constants';

const ViewMedicationAdministration = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { medications, loading } = useMedicationAdministration();
  const [medication, setMedication] = useState<any>(null);

  useEffect(() => {
    const med = medications.find(m => m.id === route.params?.id);
    setMedication(med);
  }, [route.params?.id, medications]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!medication) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text color={theme.colors.gray}>Medication record not found</Text>
      </View>
    );
  }

  const statusColor = ({
    administered: colors.success,
    pending: colors.warning,
    skipped: colors.gray,
    refused: colors.danger,
  } as any)[medication.status] || colors.primary;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text h3 bold>
            {medication.patient?.name || 'Unknown Patient'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text white bold size={12}>
              {medication.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Details Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            PATIENT INFORMATION
          </Text>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Patient ID:</Text>
            <Text size={12} bold>{medication.patient_id}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Patient Name:</Text>
            <Text size={12}>{medication.patient?.name || 'N/A'}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />

        <View style={styles.detailSection}>
          <Text color={theme.colors.gray} size={12} bold>
            MEDICATION DETAILS
          </Text>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Prescription Item ID:</Text>
            <Text size={12} bold>{medication.prescription_item_id}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Administered Time:</Text>
            <Text size={12}>{new Date(medication.administered_time).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Status:</Text>
            <Text size={12} style={{ color: statusColor, fontWeight: 'bold' }}>
              {medication.status.toUpperCase()}
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
            <Text size={12}>{medication.nurse?.name || 'N/A'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Created:</Text>
            <Text size={12}>{new Date(medication.created_at).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text color={theme.colors.gray} size={12}>Updated:</Text>
            <Text size={12}>{new Date(medication.updated_at).toLocaleString()}</Text>
          </View>
        </View>

        {medication.notes && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.light }]} />
            <View style={styles.detailSection}>
              <Text color={theme.colors.gray} size={12} bold>
                NOTES
              </Text>
              <Text size={12}>{medication.notes}</Text>
            </View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('EditMedication', { id: medication.id })}
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
              'Are you sure you want to delete this record?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    // Handle delete
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

export default ViewMedicationAdministration;




