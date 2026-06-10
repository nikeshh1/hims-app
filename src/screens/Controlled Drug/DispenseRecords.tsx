import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {getDispenseRecords} from '../../api/controlledDrug';
import {Block, Text} from '../../components';
import {useTheme} from '../../hooks';

const DispenseRecords = () => {
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = () => {
    setLoading(true);
    getDispenseRecords()
      .then((data) => {
        setRecords(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchRecords();
    }, []),
  );

  const renderItem = ({item, index}: {item: any; index: number}) => {
    const drugInfo = item.controlled_drug;
    const drugLabel = drugInfo
      ? `${drugInfo.drug_name} - Batch ${drugInfo.batch_number}`
      : String(item.controlled_drug_id);

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <Text gray size={13}>SL.NO.</Text>
          <Text bold size={13}>{index + 1}</Text>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Drug</Text>
          <Text bold size={13} style={{flex: 1, textAlign: 'right'}}>{drugLabel}</Text>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Patient</Text>
          <Text bold size={13}>{item.patient_id}</Text>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Prescription</Text>
          <Text bold size={13}>{item.prescription_id}</Text>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Quantity</Text>
          <Text bold size={13}>{item.quantity_dispensed}</Text>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Date</Text>
          <Text bold size={13}>{item.dispense_date?.split('T')[0]}</Text>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Pharmacist</Text>
          <Text bold size={13}>{item.pharmacist_id ?? '—'}</Text>
        </View>
      </View>
    );
  };

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text bold size={20}>Dispense Records</Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Text bold color="#fff">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb + action row */}
        <Text gray size={12} style={{marginBottom: 8}}>
          Pharmacy › Controlled Drugs › Dispense Records
        </Text>

        <View style={{marginBottom: 12}}>
          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: '#cb0c9f', alignSelf: 'flex-start'}]}
            onPress={() => navigation.navigate('NewDispense')}>
            <Text bold color="#fff" size={13}>+ New Dispense</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>Loading records...</Text>
          </View>
        ) : records.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No dispense records found</Text>
            <TouchableOpacity
              style={[styles.headerBtn, {backgroundColor: '#cb0c9f', marginTop: 16}]}
              onPress={() => navigation.navigate('NewDispense')}>
              <Text bold color="#fff" size={14}>+ New Dispense</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => String(item.dispense_id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 40}}
          />
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 12,
  },
  headerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtn: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DispenseRecords;
