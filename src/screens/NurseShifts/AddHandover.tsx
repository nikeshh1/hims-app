import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useNurseShifts} from '../../context/NurseShiftsContext';
import {useTheme} from '../../hooks';
import {Block, Text} from '../../components';
import {Picker} from '@react-native-picker/picker';

const AddHandover = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {addHandoverNote} = useNurseShifts();
  const {sizes} = useTheme();

  const assignmentId = route.params?.assignmentId;
  const assignmentData = route.params?.assignmentData;

  const [entryType, setEntryType] = useState<'note' | 'task'>('note');
  const [description, setDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!description.trim()) return 'Please enter a description';
    return null;
  };

  const handleSubmit = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation', error);
      return;
    }

    const payload = {
      shift_assignment_id: assignmentId,
      entry_type: entryType,
      description: description.trim(),
      task_status: entryType === 'task' ? taskStatus : null,
    };

    setSubmitting(true);
    try {
      await addHandoverNote(payload);
      Alert.alert('Success', 'Handover note added');
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to add handover note';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Block safe>
      <ScrollView
        style={{flex: 1}}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80}}>

        {/* Assignment Info */}
        <View style={styles.infoCard}>
          <Text gray size={12}>👤 Staff Member</Text>
          <Text bold size={14} style={{marginTop: 4}}>
            {assignmentData?.staff?.name || 'Unknown'}
          </Text>

          <Text gray size={12} style={{marginTop: 12}}>🔄 Shift</Text>
          <Text bold size={14} style={{marginTop: 4}}>
            {assignmentData?.shift?.shift_name} ({assignmentData?.shift?.start_time?.substring(0, 5)} - {assignmentData?.shift?.end_time?.substring(0, 5)})
          </Text>
        </View>

        <View style={styles.card}>

          {/* Entry Type */}
          <Text style={styles.label}>Type *</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={entryType}
              onValueChange={setEntryType}
              style={styles.picker}
              dropdownIconColor="#555">
              <Picker.Item label="Note" value="note" />
              <Picker.Item label="Task" value="task" />
            </Picker>
          </View>

          {/* Description */}
          <Text style={styles.label}>Description *</Text>
          <TextInput
            placeholder="Enter handover details..."
            placeholderTextColor="#aaa"
            value={description}
            onChangeText={setDescription}
            style={[styles.textInput, {height: 120, textAlignVertical: 'top'}]}
            multiline
          />

          {/* Task Status (only for tasks) */}
          {entryType === 'task' && (
            <>
              <Text style={styles.label}>Task Status (only if task)</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={taskStatus}
                  onValueChange={setTaskStatus}
                  style={styles.picker}
                  dropdownIconColor="#555">
                  <Picker.Item label="-- Select --" value="" color="#999" />
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="Completed" value="completed" />
                </Picker>
              </View>
            </>
          )}

        </View>

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && {opacity: 0.6}]}
            onPress={handleSubmit}
            disabled={submitting}>
            <Text bold color="#fff" size={15}>
              {submitting ? 'Saving...' : 'SAVE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
            <Text bold color="#555" size={15}>CANCEL</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#cb0c9f',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginTop: 14,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  btnRow: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default AddHandover;
