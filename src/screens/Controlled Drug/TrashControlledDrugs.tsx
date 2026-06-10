import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  getDeletedControlledDrugs,
  restoreControlledDrug,
  forceDeleteControlledDrug,
} from '../../api/controlledDrug';
import {useControlledDrugs} from '../../context/ControlledDrugContext';
import {Block, Text, Input} from '../../components';
import {useTheme} from '../../hooks';
const TrashControlledDrugs = () => {
  const {refreshDrugs} = useControlledDrugs();
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();

  const [drugs, setDrugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTrash = () => {
    setLoading(true);
    getDeletedControlledDrugs()
      .then((data) => {
        setDrugs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setDrugs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return drugs;
    const q = searchQuery.toLowerCase();
    return drugs.filter(
      (d) =>
        d.drug_name.toLowerCase().includes(q) ||
        d.batch_number.toLowerCase().includes(q),
    );
  }, [drugs, searchQuery]);

  const handleRestore = (id: number) => {
    Alert.alert('Restore Drug', 'Restore this controlled drug?', [
      {text: 'Cancel'},
      {
        text: 'Restore',
        onPress: async () => {
          try {
            await restoreControlledDrug(id);
            fetchTrash();
            refreshDrugs();
            Alert.alert('Success', 'Drug restored');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed');
          }
        },
      },
    ]);
  };

  const handleForceDelete = (id: number) => {
    Alert.alert('Permanent Delete', 'Delete permanently?', [
      {text: 'Cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await forceDeleteControlledDrug(id);
            fetchTrash();
            refreshDrugs();
            Alert.alert('Deleted', 'Drug permanently deleted');
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Failed');
          }
        },
      },
    ]);
  };

  const renderItem = ({item}: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text bold size={15} style={{flex: 1}}>
          {item.drug_name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: item.status === 'Active' ? '#e6f4ea' : '#fce8e6'},
          ]}>
          <Text
            bold
            size={11}
            color={item.status === 'Active' ? '#1e8e3e' : '#d93025'}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Text gray size={13}>Batch:</Text>
        <Text size={13} bold>{item.batch_number}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text gray size={13}>Stock:</Text>
        <Text size={13} bold>{item.stock_quantity}</Text>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#e8f5e9'}]}
          onPress={() => handleRestore(item.controlled_drug_id)}>
          <Text bold size={12} color="#2e7d32">Restore</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#fce4ec'}]}
          onPress={() => handleForceDelete(item.controlled_drug_id)}>
          <Text bold size={12} color="#c62828">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block paddingHorizontal={sizes.padding} style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text bold size={20}>Deleted Drugs</Text>
            <Text gray size={12}>
              Pharmacy › Controlled Drugs › Deleted
            </Text>
          </View>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Text bold color="#fff">Back</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBox}>
          <Input
            search
            placeholder="Search deleted drugs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* LIST */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>Loading deleted drugs...</Text>
          </View>
        ) : filteredDrugs.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>No deleted drugs</Text>
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
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 10,
  },
  backBtn: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBox: {
    marginBottom: 10,
    backgroundColor: '#f7f7f7',
    borderRadius: 10,
    paddingHorizontal: 6,
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

export default TrashControlledDrugs;
