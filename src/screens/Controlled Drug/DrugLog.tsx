import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getDrugLog} from '../../api/controlledDrug';
import {Block, Text} from '../../components';
import {useTheme} from '../../hooks';

const DrugLog = () => {
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDrugLog()
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
          <Text gray size={13}>Type</Text>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  item.transaction_type === 'Dispensed' ? '#e0f2f1' : '#e8f5e9',
              },
            ]}>
            <Text
              size={11}
              bold
              color={item.transaction_type === 'Dispensed' ? '#00796b' : '#2e7d32'}>
              {item.transaction_type}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Quantity</Text>
          <Text bold size={13}>{item.quantity}</Text>
        </View>
        <View style={styles.row}>
          <Text gray size={13}>Date</Text>
          <Text bold size={13}>{item.transaction_date?.split('T')[0]}</Text>
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
          <View>
            <Text bold size={20}>Controlled Drug Log</Text>
            <Text gray size={12}>
              Pharmacy › Controlled Drugs › Log
            </Text>
          </View>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Text bold color="#fff">Back</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>Loading logs...</Text>
          </View>
        ) : logs.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No log entries found</Text>
          </View>
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(item) => String(item.log_id)}
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
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DrugLog;
