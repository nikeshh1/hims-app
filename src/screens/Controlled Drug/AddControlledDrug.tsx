import React, {useState, useEffect} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useControlledDrugs} from '../../context/ControlledDrugContext';
import {getVendors} from '../../api/vendor';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';
const AddControlledDrug = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editData = route.params?.editData;

  const {addDrug, editDrug} = useControlledDrugs();
  const {sizes} = useTheme();

  const [drugName, setDrugName] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [showVendorPicker, setShowVendorPicker] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch vendors for dropdown
    getVendors()
      .then((data: any[]) => setVendors(Array.isArray(data) ? data : []))
      .catch(() => setVendors([]));
  }, []);

  useEffect(() => {
    if (editData) {
      setDrugName(editData.drug_name || '');
      setBatchNumber(editData.batch_number || '');
      setExpiryDate(editData.expiry_date?.split('T')[0] || '');
      setStockQuantity(String(editData.stock_quantity ?? ''));
      setVendorId(editData.vendor_id ? String(editData.vendor_id) : null);
      setStatus(editData.status || 'Active');
    }
  }, [editData]);

  const selectedVendor = vendors.find((v) => String(v.id) === vendorId);

  const validate = (): boolean => {
    if (!drugName.trim()) {
      Alert.alert('Validation', 'Drug name is required');
      return false;
    }
    if (!batchNumber.trim()) {
      Alert.alert('Validation', 'Batch number is required');
      return false;
    }
    if (!expiryDate.trim()) {
      Alert.alert('Validation', 'Expiry date is required (YYYY-MM-DD)');
      return false;
    }
    // Basic date format check
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(expiryDate.trim())) {
      Alert.alert('Validation', 'Expiry date format must be YYYY-MM-DD');
      return false;
    }
    if (
      !stockQuantity.trim() ||
      isNaN(Number(stockQuantity)) ||
      Number(stockQuantity) < 0
    ) {
      Alert.alert('Validation', 'Stock quantity must be a non-negative number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        drug_name: drugName.trim(),
        batch_number: batchNumber.trim(),
        expiry_date: expiryDate.trim(),
        stock_quantity: Number(stockQuantity),
        supplier_id: vendorId,
        status,
      };

      if (editData) {
        await editDrug(editData.controlled_drug_id, payload);
        Alert.alert('Success', 'Controlled drug updated successfully');
      } else {
        await addDrug(payload);
        Alert.alert('Success', 'Controlled drug created successfully');
      }

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

  return (
    <Block safe>
      <ScrollView
        contentContainerStyle={{padding: sizes.padding, paddingBottom: 60}}
        showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <Text gray size={12} style={{marginBottom: 4}}>
          Pharmacy › Controlled Drugs › {editData ? 'Edit' : 'Add'}
        </Text>

        {/* TITLE */}
        <Text bold size={20} style={{marginBottom: 20}}>
          {editData ? 'Edit Controlled Drug' : 'Add Controlled Drug'}
        </Text>

        {/* DRUG NAME */}
        <Text bold size={13} style={styles.label}>
          Drug Name *
        </Text>
        <Input
          placeholder="Enter drug name"
          value={drugName}
          onChangeText={setDrugName}
          style={styles.input}
        />

        {/* BATCH NUMBER */}
        <Text bold size={13} style={styles.label}>
          Batch Number *
        </Text>
        <Input
          placeholder="Enter batch number"
          value={batchNumber}
          onChangeText={setBatchNumber}
          style={styles.input}
        />

        {/* EXPIRY DATE */}
        <Text bold size={13} style={styles.label}>
          Expiry Date * (YYYY-MM-DD)
        </Text>
        <Input
          placeholder="e.g. 2027-12-03"
          value={expiryDate}
          onChangeText={setExpiryDate}
          style={styles.input}
        />

        {/* STOCK QUANTITY */}
        <Text bold size={13} style={styles.label}>
          Stock Quantity *
        </Text>
        <Input
          placeholder="Enter stock quantity"
          value={stockQuantity}
          onChangeText={setStockQuantity}
          style={styles.input}
        />

        {/* VENDOR DROPDOWN */}
        <Text bold size={13} style={styles.label}>
          Vendor Name
        </Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setShowVendorPicker(!showVendorPicker)}>
          <Text size={14} color={selectedVendor ? '#000' : '#999'}>
            {selectedVendor ? selectedVendor.vendor_name : 'Select Vendor'}
          </Text>
          <Text size={14} color="#999">
            ▼
          </Text>
        </TouchableOpacity>

        {showVendorPicker && (
          <View style={styles.dropdown}>
            {/* None option */}
            <TouchableOpacity
              key="none"
              style={[
                styles.dropdownItem,
                !vendorId && {backgroundColor: '#e3f2fd'},
              ]}
              onPress={() => {
                setVendorId(null);
                setShowVendorPicker(false);
              }}>
              <Text size={14} color="#999">
                — None —
              </Text>
            </TouchableOpacity>
            {vendors.map((v: any) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.dropdownItem,
                  vendorId === String(v.id) && {backgroundColor: '#e3f2fd'},
                ]}
                onPress={() => {
                  setVendorId(String(v.id));
                  setShowVendorPicker(false);
                }}>
                <Text size={14}>{v.vendor_name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* STATUS TOGGLE */}
        <View style={styles.statusRow}>
          <Text bold size={13} color="#444">
            Status
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Text
              size={13}
              color={status === 'Active' ? '#1e8e3e' : '#999'}
              bold>
              {status}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setStatus(status === 'Active' ? 'Inactive' : 'Active')
              }
              style={[
                styles.toggleTrack,
                {backgroundColor: status === 'Active' ? '#1e8e3e' : '#ccc'},
              ]}>
              <View
                style={[
                  styles.toggleThumb,
                  status === 'Active'
                    ? {alignSelf: 'flex-end'}
                    : {alignSelf: 'flex-start'},
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && {opacity: 0.6}]}
          onPress={handleSubmit}
          disabled={submitting}>
          <Text bold color="#fff" size={16}>
            {submitting
              ? 'Saving...'
              : editData
                ? 'Update Drug'
                : 'Create Drug'}
          </Text>
        </TouchableOpacity>

        {/* CANCEL BUTTON */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}>
          <Text bold color="#666" size={14}>
            Cancel
          </Text>
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
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 8,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 4,
  },
  toggleTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 2,
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

export default AddControlledDrug;
