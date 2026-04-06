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
import { Text, Button } from '../components';
import { useTheme } from '../hooks';
import { useIsolationRecords } from '../context/IsolationRecordsContext';
import { useData } from '../hooks';
import { sizes, colors } from '../constants';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddIsolationRecord = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { addRecord, editRecord, records, loading } = useIsolationRecords();
  // const { patients } = useData();

  const isEditing = route.params?.id;
  const recordToEdit = isEditing ? records.find(r => r.id === route.params.id) : null;

  const [patientId, setPatientId] = useState(recordToEdit?.patient_id || '');
  const [isolationType, setIsolationType] = useState<string>(recordToEdit?.isolation_type || '');
  const [status, setStatus] = useState<'active' | 'completed' | 'discontinued'>(
    (recordToEdit?.status as any) || 'active'
  );
  const [startDate, setStartDate] = useState(
    recordToEdit?.start_date ? new Date(recordToEdit.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState(
    recordToEdit?.end_date ? new Date(recordToEdit.end_date) : new Date()
  );
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [notes, setNotes] = useState(recordToEdit?.notes || '');
  const [saving, setSaving] = useState(false);

  const isolationTypes = [
    { label: 'Standard', value: 'standard' },
    { label: 'Contact', value: 'contact' },
    { label: 'Droplet', value: 'droplet' },
    { label: 'Airborne', value: 'airborne' },
    { label: 'Other', value: 'other' },
  ];

  const statusOptions = ['active', 'completed', 'discontinued'];

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setStartDate(selectedDate);
    }
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setEndDate(selectedDate);
    }
    setShowEndDatePicker(false);
  };

  const handleSave = async () => {
    if (!patientId || !isolationType) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const data = {
        patient_id: patientId,
        isolation_type: isolationType,
        status,
        start_date: startDate.toISOString(),
        end_date: status === 'active' ? null : endDate.toISOString(),
        notes,
        nurse_id: 'current-nurse-id',
      };

      if (isEditing) {
        await editRecord(route.params.id, data);
        Alert.alert('Success', 'Isolation record updated');
      } else {
        await addRecord(data);
        Alert.alert('Success', 'Isolation record added');
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
          {isEditing ? 'Edit Isolation Record' : 'Add Isolation Record'}
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

      {/* Isolation Type */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Isolation Type *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdown,
            { borderColor: theme.colors.light, backgroundColor: theme.colors.card },
          ]}
          onPress={() => {
            Alert.alert(
              'Select Isolation Type',
              '',
              isolationTypes.map((t) => ({
                text: t.label,
                onPress: () => setIsolationType(t.value),
              }))
            );
          }}
        >
          <Text size={14}>
            {isolationTypes.find((t) => t.value === isolationType)?.label ||
              'Select isolation type'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
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

      {/* Start Date */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Start Date *
        </Text>
        <TouchableOpacity
          style={[
            styles.dateButton,
            { borderColor: theme.colors.light, backgroundColor: theme.colors.card },
          ]}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text size={14}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="spinner"
            onChange={handleStartDateChange}
          />
        )}
      </View>

      {/* End Date (only for non-active) */}
      {status !== 'active' && (
        <View style={styles.section}>
          <Text bold size={14} style={styles.label}>
            End Date
          </Text>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { borderColor: theme.colors.light, backgroundColor: theme.colors.card },
            ]}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text size={14}>{endDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="spinner"
              onChange={handleEndDateChange}
              minimumDate={startDate}
            />
          )}
        </View>
      )}

      {/* Notes */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Notes / Precautions
        </Text>
        <TextInput
          style={[
            styles.textArea,
            { borderColor: theme.colors.light, color: theme.colors.text },
          ]}
          placeholder="Add isolation precautions, special instructions..."
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
              {isEditing ? 'Update' : 'Add'} Record
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

export default AddIsolationRecord;



