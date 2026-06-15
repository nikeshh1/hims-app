import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useVendors} from '../../context/VendorContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const VendorList = () => {
  const navigation = useNavigation<any>();
  const {vendors, loading, deleteVendor, refreshVendors} =
    useVendors();

  const {sizes} = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshVendors();
    }, []),
  );

  const filteredVendors = useMemo(() => {
    let result = vendors;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      result = result.filter(
        v =>
          v.vendor_name
            ?.toLowerCase()
            .includes(q) ||
          (v.phone_number || '')
            .toLowerCase()
            .includes(q) ||
          (v.email || '')
            .toLowerCase()
            .includes(q),
      );
    }

    return result;
  }, [vendors, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Vendor',
      `Are you sure you want to delete "${item.vendor_name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVendor(item.id);

              Alert.alert(
                'Deleted',
                'Vendor removed',
              );
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data
                  ?.message ||
                  'Cannot delete this vendor',
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent:
            'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text
            bold
            size={16}
            style={{
              color: '#2d3748',
            }}>
            {item.vendor_name}
          </Text>

          <Text style={styles.infoText}>
            Phone:{' '}
            {item.phone_number || '-'}
          </Text>

          <Text style={styles.infoText}>
            Email:{' '}
            {item.email || '-'}
          </Text>

          <Text style={styles.infoText}>
            Address:{' '}
            {item.address || '-'}
          </Text>

          <Text style={styles.infoText}>
            Status:{' '}
            {item.status || '-'}
          </Text>
        </View>

        <View
          style={
            styles.actionColumn
          }>
          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#e8f5e9',
              },
            ]}
            onPress={() =>
              navigation.navigate(
                'ViewVendor',
                {
                  id: item.id,
                },
              )
            }>
            <Text
              bold
              color="#2e7d32">
              VIEW
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#e3f2fd',
                marginTop: 4,
              },
            ]}
            onPress={() =>
              navigation.navigate(
                'AddVendor',
                {
                  editData:
                    item,
                },
              )
            }>
            <Text
              bold
              color="#1565c0">
              EDIT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#fce4ec',
                marginTop: 4,
              },
            ]}
            onPress={() =>
              handleDelete(item)
            }>
            <Text
              bold
              color="#c62828">
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block
        scroll={false}
        paddingHorizontal={
          sizes.padding
        }
        style={{flex: 1}}>
        {/* HEADER */}
        <View
          style={
            styles.pageHeader
          }>
          <View>
            <Text
              style={
                styles.pageTitle
              }>
              Vendors
            </Text>

            <Text
              style={
                styles.breadcrumb
              }>
              Pharmacy / Vendors
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.primaryButton
            }
            onPress={() =>
              navigation.navigate(
                'AddVendor',
              )
            }>
            <Text
              color="#fff"
              bold>
              + ADD
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View
          style={
            styles.searchContainer
          }>
          <Input
            search
            placeholder="Search vendors..."
            onChangeText={(
              text: string,
            ) =>
              setSearchQuery(
                text,
              )
            }
            value={
              searchQuery
            }
          />
        </View>

        {/* DELETED BUTTON */}
        <TouchableOpacity
          style={
            styles.deletedButton
          }
          onPress={() =>
            navigation.navigate(
              'TrashVendors',
            )
          }>
          <Text
            bold
            color="#fff"
            size={15}>
            Deleted Records
          </Text>
        </TouchableOpacity>

        {loading ? (
          <View
            style={
              styles.center
            }>
            <ActivityIndicator
              size="large"
              color="#cb0c9f"
            />

            <Text
              gray
              style={{
                marginTop: 10,
              }}>
              Loading vendors...
            </Text>
          </View>
        ) : filteredVendors.length ===
          0 ? (
          <View
            style={
              styles.center
            }>
            <Text
              gray
              size={16}>
              No vendors found
            </Text>
          </View>
        ) : (
          <FlatList
            data={
              filteredVendors
            }
            keyExtractor={item =>
              String(
                item.id,
              )
            }
            renderItem={
              renderItem
            }
            showsVerticalScrollIndicator={
              false
            }
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
  pageHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
    elevation: 2,
  },

  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },

  breadcrumb: {
    marginTop: 6,
    color: '#4a5568',
  },

  primaryButton: {
    backgroundColor: '#cb0c9f',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },

  searchContainer: {
    marginVertical: 12,
  },

  deletedButton: {
    backgroundColor: '#6c757d',
    height: 40,
    borderRadius: 10,
    justifyContent:
      'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  center: {
    flex: 1,
    justifyContent:
      'center',
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
    justifyContent:
      'center',
  },

  verticalBtn: {
    width: 90,
    height: 38,
    justifyContent:
      'center',
    alignItems: 'center',
    borderRadius: 6,
  },
});

export default VendorList;