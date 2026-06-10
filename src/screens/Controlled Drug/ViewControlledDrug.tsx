import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getControlledDrug} from '../../api/controlledDrug';
import {Block, Text} from '../../components';
import {useTheme} from '../../hooks';
const ViewControlledDrug = () => {
  const navigation = useNavigation<any>();
  const route: any = useRoute();
  const {sizes} = useTheme();
  const {id} = route.params;

  const [drug, setDrug] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getControlledDrug(id)
      .then((data) => {
        setDrug(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Block safe center>
        <ActivityIndicator size="large" color="#cb0c9f" />
      </Block>
    );
  }

  if (!drug) {
    return (
      <Block safe center>
        <Text gray size={16}>Drug not found</Text>
      </Block>
    );
  }

  return (
    <Block safe>
      <Block paddingHorizontal={sizes.padding}>
        {/* Breadcrumb */}
        <Text gray size={12} style={{marginTop: 16}}>
          Pharmacy › Controlled Drugs › View
        </Text>

        <Text bold size={20} marginTop={8}>
          Drug Details
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text bold size={16} style={{flex: 1}}>
              {drug.drug_name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    drug.status === 'Active' ? '#e6f4ea' : '#fce8e6',
                },
              ]}>
              <Text
                bold
                size={11}
                color={drug.status === 'Active' ? '#1e8e3e' : '#d93025'}>
                {drug.status}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Text gray>Batch Number</Text>
            <Text bold>{drug.batch_number}</Text>
          </View>
          <View style={styles.row}>
            <Text gray>Expiry Date</Text>
            <Text bold>{drug.expiry_date?.split('T')[0]}</Text>
          </View>
          <View style={styles.row}>
            <Text gray>Stock Quantity</Text>
            <Text bold>{drug.stock_quantity}</Text>
          </View>
          <View style={styles.row}>
            <Text gray>Vendor</Text>
            <Text bold>{drug.vendor?.vendor_name ?? '—'}</Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: '#e3f2fd'}]}
              onPress={() =>
                navigation.navigate('AddControlledDrug', {editData: drug})
              }>
              <Text bold size={12} color="#1565c0">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, {backgroundColor: '#eee'}]}
              onPress={() => navigation.goBack()}>
              <Text bold size={12}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
});

export default ViewControlledDrug;
