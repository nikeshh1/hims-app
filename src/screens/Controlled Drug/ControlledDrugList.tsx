import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {useControlledDrugs} from '../../context/ControlledDrugContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const ControlledDrugList = () => {
  const navigation = useNavigation<any>();
  const {drugs, loading, removeDrug, refreshDrugs} = useControlledDrugs();
  const {sizes} = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshDrugs();
    }, []),
  );

  const filteredDrugs = useMemo(() => {
    let result = drugs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.drug_name.toLowerCase().includes(q) ||
          d.batch_number.toLowerCase().includes(q),
      );
    }
    return result;
  }, [drugs, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Drug',
      `Are you sure you want to delete "${item.drug_name}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeDrug(item.controlled_drug_id);
              Alert.alert('Deleted', 'Drug removed');
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message || 'Cannot delete this drug',
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item, index}: {item: any; index: number}) => (
    <View style={styles.card}>
      {/* Header row: SL.NO + Name + Status */}
      <View style={styles.cardHeader}>
        <Text bold size={15} style={{flex: 1}}>
          {index + 1}. {item.drug_name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: item.status === 'Active' ? '#e6f4ea' : '#fce8e6'},
          ]}>
          <Text
            size={11}
            bold
            color={item.status === 'Active' ? '#1e8e3e' : '#d93025'}>
            {item.status}
          </Text>
        </View>
      </View>

      {/* Details rows */}
      <View style={styles.detailRow}>
        <Text gray size={13}>Batch:</Text>
        <Text size={13} bold>{item.batch_number}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text gray size={13}>Expiry:</Text>
        <Text size={13} bold>{item.expiry_date?.split('T')[0]}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text gray size={13}>Stock:</Text>
        <Text size={13} bold>{item.stock_quantity}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text gray size={13}>Vendor:</Text>
        <Text size={13} bold>{item.vendor?.vendor_name ?? '—'}</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#e8f5e9'}]}
          onPress={() =>
            navigation.navigate('ViewControlledDrug', {id: item.controlled_drug_id})
          }>
          <Text size={12} color="#2e7d32" bold>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#e3f2fd'}]}
          onPress={() =>
            navigation.navigate('AddControlledDrug', {editData: item})
          }>
          <Text size={12} color="#1565c0" bold>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#fce4ec'}]}
          onPress={() => handleDelete(item)}>
          <Text size={12} color="#c62828" bold>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text bold size={20}>Controlled Drugs</Text>
        </View>

        {/* ACTION BUTTONS ROW */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: '#344767'}]}
            onPress={() => navigation.navigate('DrugLog')}>
            <Text bold color="#fff" size={12}>Drug Log</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: '#344767'}]}
            onPress={() => navigation.navigate('DispenseRecords')}>
            <Text bold color="#fff" size={12}>Dispense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: '#6c757d'}]}
            onPress={() => navigation.navigate('TrashControlledDrugs')}>
            <Text bold color="#fff" size={12}>Deleted</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerBtn, {backgroundColor: '#cb0c9f'}]}
            onPress={() => navigation.navigate('AddControlledDrug')}>
            <Text bold color="#fff" size={12}>+ Add Drug</Text>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb */}
        <Text gray size={12} style={{marginBottom: 8}}>
          Pharmacy › Controlled Drugs
        </Text>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search drugs..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {/* LIST */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>Loading drugs...</Text>
          </View>
        ) : filteredDrugs.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No controlled drugs found</Text>
            <TouchableOpacity
              style={[styles.headerBtn, {backgroundColor: '#cb0c9f', marginTop: 16}]}
              onPress={() => navigation.navigate('AddControlledDrug')}>
              <Text bold color="#fff" size={14}>+ Add First Drug</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredDrugs}
            keyExtractor={(item) => String(item.controlled_drug_id)}
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
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  headerBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchContainer: {
    marginBottom: 8,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ControlledDrugList;
