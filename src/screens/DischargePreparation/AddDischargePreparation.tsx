import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDischarge, ChecklistItem, DischargePreparation } from '../../context/DischargePreparationContext';
import { 
  getDischargePreparation as getPrepApi 
} from '../../api/dischargePreparation';
import { useTheme } from '../../hooks';
import { Block, Button, Text, Checkbox, Input } from '../../components';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', name: 'IV Removed', completed: false },
  { id: '2', name: 'Catheter Removed', completed: false },
  { id: '3', name: 'Dressing Done', completed: false },
  { id: '4', name: 'Final Vitals Recorded', completed: false },
];

const AddDischargePreparation = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { saveDischargePrep, markReady, loading } = useDischarge();
  const { sizes } = useTheme();

  const { admissionId, admission } = route.params || {};

  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
  const [belongingsStatus, setBelongingsStatus] = useState<string>('Not Returned');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const toggleChecklistItem = (id: string) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      if (!admissionId) {
        Alert.alert('Error', 'Admission ID is missing');
        setSubmitting(false);
        return;
      }

      const data: DischargePreparation = {
        patient_id: admission?.patient_id,
        ipd_admission_id: admissionId,
        nurse_id: 'current_nurse_id',
        checklist,
        belongings_status: belongingsStatus === 'Returned',
        status: 'in_progress',
        is_ready: false,
      };
      
      console.log('Saving discharge prep with data:', data);
      await saveDischargePrep(data);
      Alert.alert('Success', 'Discharge preparation saved');
      setIsSaved(true);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkReady = async () => {
    if (checklist.length === 0) {
      Alert.alert('Error', 'Please complete the checklist');
      return;
    }
    
    if (!admissionId) {
      Alert.alert('Error', 'Admission ID is missing');
      return;
    }

    try {
      setSubmitting(true);
      
      // First save the discharge prep data
      const data: DischargePreparation = {
        patient_id: admission?.patient_id,
        ipd_admission_id: admissionId,
        nurse_id: 'current_nurse_id',
        checklist,
        belongings_status: belongingsStatus === 'Returned',
        status: 'in_progress',
        is_ready: false,
      };
      
      console.log('Saving discharge prep:', data);
      await saveDischargePrep(data);
      
      // Then call the markReady endpoint to update status to ready
      console.log('Calling markReady for admissionId:', admissionId);
      const freshPrep = await markReady(admissionId);
      console.log('Fresh prep after mark ready:', freshPrep);
      
      // Ensure the discharge object has ready status and all data for display
      const displayPrep = {
        ...(freshPrep || {}),
        is_ready: true,
        status: 'ready',
        belongings_status: belongingsStatus === 'Returned',
        checklist,
      };
      
      Alert.alert('Success', 'Marked as ready for discharge', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to the view screen with fresh data from backend
            console.log('Navigating to ConfirmDischarge with prep:', displayPrep);
            navigation.navigate('ConfirmDischarge', { admission, discharge: displayPrep });
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to mark ready');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Block safe>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <Block paddingHorizontal={sizes.padding}>
          {/* Patient Header */}
          <View style={styles.section}>
            <Text bold size={16} style={{ marginBottom: 12 }}>
              {admission?.patient?.name || admission?.patient_name || 'Patient'}
            </Text>
            <Text gray size={13}>
              📋 Admission ID: {admission?.admission_id || 'N/A'}
            </Text>
            <Text gray size={13} style={{ marginTop: 4 }}>
              👤 Patient ID: {admission?.patient_id?.substring(0, 12)}...
            </Text>
            <Text gray size={13} style={{ marginTop: 4 }}>
              🏥 Ward: {admission?.ward || 'N/A'}
            </Text>
          </View>

          {/* Progress */}
          <View style={[styles.section, styles.progressSection]}>
            <View style={styles.progressRow}>
              <Text bold size={14}>Progress</Text>
              <Text bold size={14} color="#ffc107">{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#28a745' : '#ffc107',
                  },
                ]}
              />
            </View>
          </View>

          {/* Discharge Checklist */}
          <View style={styles.section}>
            <Text bold size={15} style={{ marginBottom: 4 }}>
              Discharge Checklist
            </Text>
            <Text gray size={12} style={{ marginBottom: 12 }}>
              {completedCount} of {checklist.length} items completed
            </Text>

            {checklist.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleChecklistItem(item.id!)}
                style={styles.checklistItem}
              >
                <Checkbox
                  checked={item.completed}
                  onPress={() => toggleChecklistItem(item.id!)}
                />
                <Text
                  size={13}
                  style={{
                    marginLeft: 12,
                    textDecorationLine: item.completed ? 'line-through' : 'none',
                    color: item.completed ? '#999' : '#333',
                    flex: 1,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Belongings Verification */}
          <View style={styles.section}>
            <Text bold size={15} style={{ marginBottom: 12 }}>
              Belongings Status
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={belongingsStatus}
                onValueChange={(itemValue) => setBelongingsStatus(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Not Returned" value="Not Returned" />
                <Picker.Item label="Returned" value="Returned" />
              </Picker>
            </View>
          </View>

          {/* Additional Notes */}
          <View style={styles.section}>
            <Text bold size={15} style={{ marginBottom: 8 }}>
              Additional Notes (Optional)
            </Text>
            <Input
              multiline
              numberOfLines={4}
              placeholder="Add any additional notes..."
              onChangeText={setNotes}
              value={notes}
            />
          </View>

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelBtn]}
              onPress={() => navigation.goBack()}
              disabled={submitting}
            >
              <Text bold size={13} color="#fff">
                Back
              </Text>
            </TouchableOpacity>

            {!isSaved ? (
              <TouchableOpacity
                style={[styles.button, styles.saveBtn]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text bold size={13} color="#fff">
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.button, styles.readyBtn]}
                onPress={handleMarkReady}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text bold size={13} color="#fff">
                    Mark As Ready
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </Block>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  progressSection: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#6c757d',
    borderRadius: 6,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#007bff',
    marginLeft: 8,
  },
  readyBtn: {
    flex: 1,
    backgroundColor: '#28a745',
    marginLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
});

export default AddDischargePreparation;
