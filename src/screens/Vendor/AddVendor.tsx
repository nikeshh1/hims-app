import React, {useState, useEffect} from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {useVendors} from '../../context/VendorContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const AddVendor = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editData = route.params?.editData;

  const {addVendor, updateVendor} = useVendors();
  const {sizes} = useTheme();

  const [vendorName, setVendorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setVendorName(editData.vendor_name || '');
      setPhoneNumber(editData.phone_number || '');
      setEmail(editData.email || '');
      setAddress(editData.address || '');
      setStatus(editData.status || 'Active');
    }
  }, [editData]);

  const validate = (): boolean => {
    if (!vendorName.trim()) {
      Alert.alert('Validation', 'Vendor name is required');
      return false;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        Alert.alert('Validation', 'Please enter a valid email address');
        return false;
      }
    }

    if (phoneNumber.trim()) {
      const phoneRegex = /^[0-9+\-\s()]{7,20}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        Alert.alert('Validation', 'Please enter a valid phone number');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        vendor_name: vendorName.trim(),
        phone_number: phoneNumber.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        status,
      };

      if (editData) {
        await updateVendor(editData.id, payload);
        Alert.alert('Success', 'Vendor updated successfully');
      } else {
        await addVendor(payload);
        Alert.alert('Success', 'Vendor created successfully');
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
        {/* TITLE */}
        <Text bold size={20} style={{marginBottom: 20}}>
          {editData ? 'Edit Vendor' : 'Add Vendor'}
        </Text>

        {/* VENDOR NAME */}
        <Text bold size={13} style={styles.label}>
          Vendor Name *
        </Text>
        <Input
          placeholder="Enter vendor name"
          value={vendorName}
          onChangeText={setVendorName}
          style={styles.input}
        />

        {/* PHONE NUMBER */}
        <Text bold size={13} style={styles.label}>
          Phone Number
        </Text>
        <Input
          placeholder="Enter phone number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          style={styles.input}
        />

        {/* EMAIL */}
        <Text bold size={13} style={styles.label}>
          Email
        </Text>
        <Input
          placeholder="Enter email address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        {/* ADDRESS */}
        <Text bold size={13} style={styles.label}>
          Address
        </Text>
        <Input
          placeholder="Enter address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />

        {/* STATUS TOGGLE */}
        <View style={styles.statusRow}>
          <Text bold size={13} color="#444">
            Status
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Text size={13} color={status === 'Active' ? '#1e8e3e' : '#999'} bold>
              {status}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
              style={[
                styles.toggleTrack,
                {backgroundColor: status === 'Active' ? '#1e8e3e' : '#ccc'},
              ]}>
              <View
                style={[
                  styles.toggleThumb,
                  status === 'Active' ? {alignSelf: 'flex-end'} : {alignSelf: 'flex-start'},
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
              ? 'Update Vendor'
              : 'Create Vendor'}
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

export default AddVendor;
