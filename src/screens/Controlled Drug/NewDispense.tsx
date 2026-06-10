import React, {useState, useEffect} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getControlledDrugs, createDispenseRecord} from '../../api/controlledDrug';
import {useControlledDrugs} from '../../context/ControlledDrugContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const NewDispense = () => {
  const navigation = useNavigation<any>();
  const {refreshDrugs} = useControlledDrugs();
  const {sizes} = useTheme();

  const [activeDrugs, setActiveDrugs] = useState<any[]>([]);
  const [loadingDrugs, setLoadingDrugs] = useState(true);

  const [selectedDrugId, setSelectedDrugId] = useState<number | null>(null);
  const [showDrugPicker, setShowDrugPicker] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [prescriptionId, setPrescriptionId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dispenseDate, setDispenseDate] = useState('');
  const [pharmacistId, setPharmacistId] = useState('1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getControlledDrugs()
      .then((data: any[]) => {
        const active = (data || []).filter((d: any) => d.status === 'Active');
        setActiveDrugs(active);
        setLoadingDrugs(false);
      })
      .catch(() => setLoadingDrugs(false));

    // Default today's date
    const today = new Date().toISOString().split('T')[0];
    setDispenseDate(today);
  }, []);

  const selectedDrug = activeDrugs.find(
    (d) => d.controlled_drug_id === selectedDrugId,
  );

  const validate = (): boolean => {
    if (!selectedDrugId) {
      Alert.alert('Validation', 'Please select a controlled drug');
      return false;
    }
    if (!patientId.trim() || isNaN(Number(patientId))) {
      Alert.alert('Validation', 'Patient ID must be a number');
      return false;
    }
    if (!prescriptionId.trim() || isNaN(Number(prescriptionId))) {
      Alert.alert('Validation', 'Prescription ID must be a number');
      return false;
    }
    if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 1) {
      Alert.alert('Validation', 'Quantity must be at least 1');
      return false;
    }
    if (!dispenseDate.trim()) {
      Alert.alert('Validation', 'Dispense date is required');
      return false;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dispenseDate.trim())) {
      Alert.alert('Validation', 'Date format must be YYYY-MM-DD');
      return false;
    }
    // Check stock
    if (selectedDrug && Number(quantity) > selectedDrug.stock_quantity) {
      Alert.alert(
        'Insufficient Stock',
        `Available: ${selectedDrug.stock_quantity}`,
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        controlled_drug_id: selectedDrugId,
        patient_id: Number(patientId),
        prescription_id: Number(prescriptionId),
        quantity_dispensed: Number(quantity),
        dispense_date: dispenseDate.trim(),
        pharmacist_id: pharmacistId.trim() ? Number(pharmacistId) : 1,
      };

      await createDispenseRecord(payload);
      await refreshDrugs();
      Alert.alert('Success', 'Drug dispensed successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message || 'Something went wrong',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDrugs) {
    return (
      <Block safe center>
        <ActivityIndicator size="large" color="#cb0c9f" />
      </Block>
    );
  }

  return (
    <Block safe>
      <ScrollView
        contentContainerStyle={{padding: sizes.padding, paddingBottom: 60}}
        showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <Text gray size={12} style={{marginBottom: 4}}>
          Pharmacy › Controlled Drugs › Dispense Records › New
        </Text>

        <Text bold size={20} style={{marginBottom: 20}}>
          New Dispense
        </Text>

        {/* CONTROLLED DRUG PICKER */}
        <Text bold size={13} style={styles.label}>Controlled Drug *</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowDrugPicker(!showDrugPicker)}>
          <Text size={14} color={selectedDrug ? '#000' : '#999'}>
            {selectedDrug
              ? `${selectedDrug.drug_name} - Batch ${selectedDrug.batch_number}`
              : 'Select Drug'}
          </Text>
          <Text size={14} color="#999">▼</Text>
        </TouchableOpacity>

        {showDrugPicker && (
          <View style={styles.dropdown}>
            {activeDrugs.length === 0 ? (
              <Text gray size={13} style={{padding: 12}}>
                No active drugs available
              </Text>
            ) : (
              activeDrugs.map((drug) => (
                <TouchableOpacity
                  key={drug.controlled_drug_id}
                  style={[
                    styles.dropdownItem,
                    selectedDrugId === drug.controlled_drug_id && {
                      backgroundColor: '#e3f2fd',
                    },
                  ]}
                  onPress={() => {
                    setSelectedDrugId(drug.controlled_drug_id);
                    setShowDrugPicker(false);
                  }}>
                  <Text size={14}>
                    {drug.drug_name} - Batch {drug.batch_number}
                  </Text>
                  <Text gray size={11}>
                    Stock: {drug.stock_quantity}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {selectedDrug && (
          <Text size={12} color="#1e8e3e" style={{marginTop: 4}}>
            Available stock: {selectedDrug.stock_quantity}
          </Text>
        )}

        {/* PATIENT ID */}
        <Text bold size={13} style={styles.label}>Patient ID *</Text>
        <Input
          placeholder="Enter patient ID"
          value={patientId}
          onChangeText={setPatientId}
          style={styles.input}
        />

        {/* PRESCRIPTION ID */}
        <Text bold size={13} style={styles.label}>Prescription ID *</Text>
        <Input
          placeholder="Enter prescription ID"
          value={prescriptionId}
          onChangeText={setPrescriptionId}
          style={styles.input}
        />

        {/* QUANTITY */}
        <Text bold size={13} style={styles.label}>Quantity Dispensed *</Text>
        <Input
          placeholder="Enter quantity"
          value={quantity}
          onChangeText={setQuantity}
          style={styles.input}
        />

        {/* DISPENSE DATE */}
        <Text bold size={13} style={styles.label}>Dispense Date * (YYYY-MM-DD)</Text>
        <Input
          placeholder="e.g. 2026-03-03"
          value={dispenseDate}
          onChangeText={setDispenseDate}
          style={styles.input}
        />

        {/* PHARMACIST ID */}
        <Text bold size={13} style={styles.label}>Pharmacist ID</Text>
        <Input
          placeholder="Enter pharmacist ID"
          value={pharmacistId}
          onChangeText={setPharmacistId}
          style={styles.input}
        />

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && {opacity: 0.6}]}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text bold color="#fff" size={16}>
            {submitting ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>

        {/* CANCEL */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}>
          <Text bold color="#666" size={14}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    marginTop: 14,
    color: '#444',
  },
  input: {
    marginBottom: 4,
  },
  picker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 4,
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  submitBtn: {
    backgroundColor: '#cb0c9f',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 28,
  },
  cancelBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default NewDispense;
