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

import {API_URL} from '../../config/api';
import {Block, Text, Input} from '../../components';
import {useTheme} from '../../hooks';
import {useVendors} from '../../context/VendorContext';

const TrashVendors = () => {
  const {refreshVendors} = useVendors();
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();

  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTrash = () => {
    setLoading(true);

    fetch(`${API_URL}/vendors/trash/list`)
      .then((res) => res.json())
      .then((json) => {
        setVendors(json.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch deleted vendors:', err);

        setVendors([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) {
      return vendors;
    }

    const q = searchQuery.toLowerCase();

    return vendors.filter(
      (v) =>
        v.vendor_name?.toLowerCase().includes(q) ||
        (v.phone_number || '').toLowerCase().includes(q) ||
        (v.email || '').toLowerCase().includes(q),
    );
  }, [vendors, searchQuery]);

  const restoreVendor = (id: number) => {
    Alert.alert('Restore Vendor', 'Restore this vendor?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Restore',
        onPress: () => {
          fetch(`${API_URL}/vendors/restore/${id}`, {
            method: 'POST',
          })
            .then(() => {
              fetchTrash();
              refreshVendors();

              Alert.alert('Success', 'Vendor restored');
            })
            .catch((err) => {
              console.error('Failed to restore vendor:', err);

              Alert.alert('Error', 'Failed to restore vendor');
            });
        },
      },
    ]);
  };

  const deleteVendor = (id: number) => {
    Alert.alert('Permanent Delete', 'Delete permanently?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          fetch(`${API_URL}/vendors/force-delete/${id}`, {
            method: 'DELETE',
          })
            .then(() => {
              fetchTrash();
              refreshVendors();

              Alert.alert('Deleted', 'Vendor permanently deleted');
            })
            .catch((err) => {
              console.error('Failed to delete vendor:', err);

              Alert.alert('Error', 'Failed to delete vendor');
            });
        },
      },
    ]);
  };

  const renderItem = ({item}: any) => (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text bold size={16} style={{color: '#2d3748'}}>
            {item.vendor_name}
          </Text>

          <Text style={styles.infoText}>Phone: {item.phone_number || '-'}</Text>

          <Text style={styles.infoText}>Email: {item.email || '-'}</Text>

          <Text style={styles.infoText}>Address: {item.address || '-'}</Text>

          <Text style={styles.infoText}>Status: {item.status || '-'}</Text>
        </View>

        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor: '#e8f5e9',
              },
            ]}
            onPress={() => restoreVendor(item.id)}>
            <Text bold color="#2e7d32">
              RESTORE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor: '#fce4ec',
                marginTop: 4,
              },
            ]}
            onPress={() => deleteVendor(item.id)}>
            <Text bold color="#c62828">
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block paddingHorizontal={sizes.padding} style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text bold size={20}>
            Deleted Vendors
          </Text>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search deleted vendors..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />

            <Text
              gray
              style={{
                marginTop: 10,
              }}>
              Loading deleted vendors...
            </Text>
          </View>
        ) : filteredVendors.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>
              No deleted vendors
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredVendors}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 40,
            }}
          />
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: {
    marginVertical: 16,
  },

  searchContainer: {
    marginVertical: 12,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },

  infoText: {
    marginTop: 6,
    color: '#4a5568',
    fontSize: 14,
  },

  actionColumn: {
    justifyContent: 'center',
  },

  verticalBtn: {
    width: 90,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
});

export default TrashVendors;
