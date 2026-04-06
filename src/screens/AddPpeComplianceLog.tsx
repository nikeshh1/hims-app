import React, { useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Text, Button } from '../components';
import { useTheme } from '../hooks';
import { usePpeCompliance } from '../context/PpeComplianceContext';
import { useData } from '../hooks';
import { sizes, colors } from '../constants';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddPpeComplianceLog = ({ navigation, route }: any) => {
  const theme = useTheme();
  const { addLog, editLog, logs, loading } = usePpeCompliance();
  // const { patients } = useData();

  const isEditing = route.params?.id;
  const logToEdit = isEditing ? logs.find(l => l.id === route.params.id) : null;

  const [patientId, setPatientId] = useState(logToEdit?.patient_id || '');
  const [ppeUsed, setPpeUsed] = useState(logToEdit?.ppe_used ?? true);
  const [ppeType, setPpeType] = useState<string>(logToEdit?.ppe_type || '');
  const [complianceStatus, setComplianceStatus] = useState<'compliant' | 'partial' | 'non-compliant'>(
    (logToEdit?.compliance_status as any) || 'compliant'
  );
  const [recordedAt, setRecordedAt] = useState(
    logToEdit?.recorded_at ? new Date(logToEdit.recorded_at) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [notes, setNotes] = useState(logToEdit?.notes || '');
  const [saving, setSaving] = useState(false);

  const ppeTypeOptions = [
    { label: 'N95 Mask', value: 'n95_mask' },
    { label: 'Surgical Mask', value: 'surgical_mask' },
    { label: 'Gloves', value: 'gloves' },
    { label: 'Gown', value: 'gown' },
    { label: 'Face Shield', value: 'face_shield' },
    { label: 'Boot Covers', value: 'boot_covers' },
    { label: 'All PPE', value: 'all' },
    { label: 'Other', value: 'other' },
  ];

  const complianceOptions = ['compliant', 'partial', 'non-compliant'];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setRecordedAt(selectedDate);
    }
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!patientId || (ppeUsed && !ppeType)) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const data = {
        patient_id: patientId,
        ppe_used: ppeUsed,
        ppe_type: ppeUsed ? ppeType : 'none',
        compliance_status: complianceStatus,
        recorded_at: recordedAt.toISOString(),
        notes,
        nurse_id: 'current-nurse-id',
      };

      if (isEditing) {
        await editLog(route.params.id, data);
        Alert.alert('Success', 'PPE compliance log updated');
      } else {
        await addLog(data);
        Alert.alert('Success', 'PPE compliance log added');
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
          {isEditing ? 'Edit PPE Compliance Log' : 'Add PPE Compliance Log'}
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

      {/* PPE Used Toggle */}
      <View style={[styles.section, styles.toggleSection]}>
        <Text bold size={14} style={styles.label}>
          PPE Used
        </Text>
        <Switch
          value={ppeUsed}
          onValueChange={setPpeUsed}
          trackColor={{ false: '#ccc', true: (colors.primary as any) + '80' }}
          thumbColor={ppeUsed ? colors.primary : '#f4f3f4'}
        />
      </View>

      {/* PPE Type (conditional) */}
      {ppeUsed && (
        <View style={styles.section}>
          <Text bold size={14} style={styles.label}>
            PPE Type *
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdown,
              { borderColor: theme.colors.light, backgroundColor: theme.colors.card },
            ]}
            onPress={() => {
              Alert.alert(
                'Select PPE Type',
                '',
                ppeTypeOptions.map((t) => ({
                  text: t.label,
                  onPress: () => setPpeType(t.value),
                }))
              );
            }}
          >
            <Text size={14}>
              {ppeTypeOptions.find((t) => t.value === ppeType)?.label ||
                'Select PPE type'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Compliance Status */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Compliance Status *
        </Text>
        <View style={styles.complianceGrid}>
          {complianceOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.complianceButton,
                complianceStatus === opt && { backgroundColor: getComplianceColor(opt) },
                complianceStatus !== opt && {
                  backgroundColor: theme.colors.card,
                  borderWidth: 1,
                  borderColor: theme.colors.light,
                },
              ]}
              onPress={() => setComplianceStatus(opt as any)}
            >
              <Text
                bold
                size={11}
                style={{ color: complianceStatus === opt ? '#fff' : theme.colors.text }}
              >
                {opt.replace('-', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recorded Time */}
      <View style={styles.section}>
        <Text bold size={14} style={styles.label}>
          Time Recorded *
        </Text>
        <TouchableOpacity
          style={[
            styles.dateButton,
            { borderColor: theme.colors.light, backgroundColor: theme.colors.card },
          ]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text size={14}>{recordedAt.toLocaleString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={recordedAt}
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
          placeholder="Add any observations or notes..."
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
              {isEditing ? 'Update' : 'Add'} Log
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

const getComplianceColor = (status: string) => {
  switch (status) {
    case 'compliant':
      return colors.success;
    case 'partial':
      return colors.warning;
    case 'non-compliant':
      return colors.danger;
    default:
      return colors.primary;
  }
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
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sizes.padding * 0.5,
  },
  complianceButton: {
    flex: 1,
    minWidth: '30%',
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

export default AddPpeComplianceLog;



