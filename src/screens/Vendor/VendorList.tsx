import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useVendors } from '../../context/VendorContext';
import { useTheme } from '../../hooks';
import { Block, Text, Input } from '../../components';
const VendorList = () => {
  const navigation = useNavigation<any>();
  const { vendors, loading, deleteVendor, refreshVendors } = useVendors(); const { assets, colors, sizes } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  useFocusEffect(
    React.useCallback(() => {

      refreshVendors();

    }, [])
  );
  const filteredVendors = useMemo(() => {
    let result = vendors;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (v) =>
          v.vendor_name.toLowerCase().includes(q) ||
          (v.phone_number && v.phone_number.includes(q)) ||
          (v.email && v.email.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [vendors, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Vendor',
      `Are you sure you want to delete "${item.vendor_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVendor(item.id);
              Alert.alert('Deleted', 'Vendor removed');
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message || 'Cannot delete this vendor',
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text bold size={15} style={{ flex: 1 }}>
          {item.vendor_name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'Active' ? '#e6f4ea' : '#fce8e6' },
          ]}>
          <Text
            size={11}
            bold
            color={item.status === 'Active' ? '#1e8e3e' : '#d93025'}>
            {item.status}
          </Text>
        </View>
      </View>

      {item.phone_number ? (
        <Text gray size={13} style={{ marginTop: 4 }}>
          📞 {item.phone_number}
        </Text>
      ) : null}

      {item.email ? (
        <Text gray size={13} style={{ marginTop: 2 }}>
          ✉️ {item.email}
        </Text>
      ) : null}

      {item.address ? (
        <Text gray size={13} style={{ marginTop: 2 }} numberOfLines={2}>
          📍 {item.address}
        </Text>
      ) : null}

      <View style={styles.cardActions}>

        {/* VIEW BUTTON */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e8f5e9' }]}
          onPress={() =>
            navigation.navigate('ViewVendor', { id: item.id })
          }>
          <Text size={12} color="#2e7d32" bold>
            View
          </Text>
        </TouchableOpacity>

        {/* EDIT BUTTON */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#e3f2fd' }]}
          onPress={() =>
            navigation.navigate('AddVendor', { editData: item })
          }>
          <Text size={12} color="#1565c0" bold>
            Edit
          </Text>
        </TouchableOpacity>

        {/* DELETE BUTTON */}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#fce4ec' }]}
          onPress={() => handleDelete(item)}>
          <Text size={12} color="#c62828" bold>
            Delete
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );

  return (
    <Block safe>
      <Block
        scroll={false}
        paddingHorizontal={sizes.padding}
        style={{ flex: 1 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text bold size={20}>
            Vendors
          </Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.addBtn, {backgroundColor: '#6c757d'}]}
            onPress={() => navigation.navigate('TrashVendors')}>
            <Text bold color="#fff" size={14}>
              Deleted List
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddVendor')}>
            <Text bold color="#fff" size={14}>
              + Add Vendor
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search vendors..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {/* LIST */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{ marginTop: 10 }}>
              Loading vendors...
            </Text>
          </View>
        ) : filteredVendors.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>
              No vendors found
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, { marginTop: 16 }]}
              onPress={() => navigation.navigate('AddVendor')}>
              <Text bold color="#fff" size={14}>
                + Add First Vendor
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredVendors}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
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
  addBtn: {
    backgroundColor: '#cb0c9f',
    paddingHorizontal: 16,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
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

export default VendorList;
