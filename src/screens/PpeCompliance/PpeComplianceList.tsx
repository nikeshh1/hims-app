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
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';
import {getPpeLogs, deletePpeLog} from '../../api/ppeCompliance';

const PpeComplianceList = () => {
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, []),
  );

  const refreshData = async () => {
    setLoading(true);

    try {
      const data = await getPpeLogs();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load PPE compliance records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = records;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();

      result = result.filter(
        r =>
          (r.patient?.first_name || '')
            .toLowerCase()
            .includes(q) ||
          (r.patient?.last_name || '')
            .toLowerCase()
            .includes(q) ||
          (r.compliance_status || '')
            .toLowerCase()
            .includes(q),
      );
    }

    return result;
  }, [records, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Record',
      `Delete PPE compliance record for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
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
              await deletePpeLog(item.id);
              Alert.alert('Deleted', 'Record removed');
              refreshData();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message ||
                  'Cannot delete',
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
          justifyContent: 'space-between',
        }}>
        <View style={{flex: 1}}>
          <Text
            bold
            size={16}
            style={{color: '#2d3748'}}>
            {item.patient?.first_name || ''}{' '}
            {item.patient?.last_name || ''}
          </Text>

          <Text style={styles.infoText}>
            PPE Type: {item.ppe_type || '-'}
          </Text>

          <Text style={styles.infoText}>
            Status:{' '}
            {item.compliance_status || '-'}
          </Text>

          <Text style={styles.dateText}>
            📅{' '}
            {item.created_at
              ? new Date(
                  item.created_at,
                ).toLocaleDateString()
              : '-'}
          </Text>
        </View>

        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor: '#e8f5e9',
              },
            ]}
            onPress={() =>
              navigation.navigate(
                'ViewPpeCompliance',
                {
                  id: item.id,
                },
              )
            }>
            <Text bold color="#2e7d32">
              VIEW
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor: '#e3f2fd',
                marginTop: 4,
              },
            ]}
            onPress={() =>
              navigation.navigate(
                'AddPpeCompliance',
                {
                  editData: item,
                },
              )
            }>
            <Text bold color="#1565c0">
              EDIT
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
            onPress={() =>
              handleDelete(item)
            }>
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
      <Block
        scroll={false}
        paddingHorizontal={sizes.padding}
        style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>
              PPE Compliance
            </Text>

            <Text style={styles.breadcrumb}>
              Nurse / PPE Compliance
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              navigation.navigate(
                'AddPpeCompliance',
              )
            }>
            <Text color="#fff" bold>
              + NEW RECORD
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient or status..."
            onChangeText={(
              text: string,
            ) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {/* DELETED BUTTON */}
        <TouchableOpacity
          style={styles.deletedButton}
          onPress={() =>
            navigation.navigate(
              'TrashPpeCompliance',
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
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color="#cb0c9f"
            />
          </View>
        ) : filtered.length > 0 ? (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={item =>
              String(item.id)
            }
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={
              false
            }
          />
        ) : (
          <View style={styles.center}>
            <Text gray size={14}>
              No PPE compliance records found
            </Text>
          </View>
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
    justifyContent: 'space-between',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 2,
  },

  infoText: {
    marginTop: 8,
    color: '#4a5568',
    fontSize: 14,
  },

  dateText: {
    marginTop: 10,
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

export default PpeComplianceList;