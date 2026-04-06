import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Button, Input } from '../components';
import { useTheme } from '../hooks';
import { useMedicationAdministration } from '../context/MedicationAdministrationContext';
import { useData } from '../hooks';
import { sizes, colors } from '../constants';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddMedicationAdministration = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { addMedication, editMedication, medications, loading } = useMedicationAdministration();
  // const { patients } = useData();

  const isEditing = route.params?.id;
  const medicationToEdit = isEditing ? medications.find(m => m.id === route.params.id) : null;

  const [patientId, setPatientId] = useState(medicationToEdit?.patient_id || '');
  const [prescriptionItemId, setPrescriptionItemId] = useState(medicationToEdit?.prescription_item_id || '');
  const [status, setStatus] = useState<'administered' | 'pending' | 'skipped' | 'refused'>(
    (medicationToEdit?.status as any) || 'pending'
  );
  const [administeredTime, setAdministeredTime] = useState(
    medicationToEdit?.administered_time ? new Date(medicationToEdit.administered_time) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState(medicationToEdit?.notes || '');
  const [saving, setSaving] = useState(false);

  const statusOptions = ['pending', 'administered', 'skipped', 'refused'];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setAdministeredTime(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!patientId || !prescriptionItemId) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const data = {
        patient_id: patientId,
        prescription_item_id: prescriptionItemId,
        status,
        administered_time: administeredTime.toISOString(),
        notes,
        nurse_id: 'current-nurse-id', // This should come from auth context
      };

      if (isEditing) {
        await editMedication(route.params.id, data);
        Alert.alert('Success', 'Medication record updated');
      } else {
        await addMedication(data);
        Alert.alert('Success', 'Medication record added');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text h3 bold>
          {isEditing ? 'Edit Medication Administration' : 'Add Medication Administration'}
        </Text>
      </View>

      {/* Patient Selection */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Patient *
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.colors.light, color: theme.colors.text },
          ]}
          placeholder="Enter patient ID"
          placeholderTextColor={theme.colors.gray}
          value={patientId}
          onChangeText={setPatientId}
        />
      </View>

      {/* Prescription Item ID */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Prescription Item ID *
        </Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: theme.colors.light, color: theme.colors.text },
          ]}
          placeholder="Enter prescription item ID"
          placeholderTextColor={theme.colors.gray}
          value={prescriptionItemId}
          onChangeText={setPrescriptionItemId}
        />
      </View>

      {/* Administration Status */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Status *
        </Text>
        <View style={styles.statusGrid}>
          {statusOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.statusButton,
                status === opt && { backgroundColor: colors.primary },
                status !== opt && { backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.light },
              ]}
              onPress={() => setStatus(opt as any)}
            >
              <Text
                bold
                size={12}
                style={{ color: status === opt ? '#fff' : theme.colors.text }}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Administration Time */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Administration Time *
        </Text>
        <TouchableOpacity
          style={[
            styles.dateButton,
            { borderColor: theme.colors.light, backgroundColor: theme.colors.card },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text size={14}>{administeredTime.toLocaleString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={administeredTime}
            mode="datetime"
            display="spinner"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Notes
        </Text>
        <TextInput
          style={[
            styles.textArea,
            { borderColor: theme.colors.light, color: theme.colors.text },
          ]}
          placeholder="Add any notes..."
          placeholderTextColor={theme.colors.gray}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving || loading}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text white bold>
              {isEditing ? 'Update' : 'Add'} Medication
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.light }]}
          onPress={() => navigation.goBack()}
          disabled={saving || loading}
        >
          <Text size={14}>Cancel</Text>
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
    marginBottom: sizes.padding,
  },
  section: {
    marginBottom: sizes.padding * 1.5,
  },
  label: {
    marginBottom: sizes.padding * 0.5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderRadius: sizes.buttonRadius,
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.75,
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: sizes.buttonRadius,
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.75,
    justifyContent: 'center',
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: sizes.buttonRadius,
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.75,
    justifyContent: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: sizes.buttonRadius,
    paddingHorizontal: sizes.padding * 0.75,
    paddingVertical: sizes.padding * 0.75,
    fontSize: 14,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.padding * 0.5,
  },
  statusButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: sizes.padding * 0.75,
    borderRadius: sizes.buttonRadius,
    alignItems: 'center',
  },
  buttonContainer: {
    marginVertical: sizes.padding * 2,
    gap: sizes.padding,
  },
  saveButton: {
    paddingVertical: sizes.padding * 0.75,
    borderRadius: sizes.buttonRadius,
    alignItems: 'center',
  },
  cancelButton: {
    paddingVertical: sizes.padding * 0.75,
    borderRadius: sizes.buttonRadius,
    alignItems: 'center',
    borderWidth: 1,
  },
});

export default AddMedicationAdministration;



