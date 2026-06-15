import React, {useState} from 'react';
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
import {
  getDeletedPpeLogs,
  restorePpeLog,
  forceDeletePpeLog,
} from '../../api/ppeCompliance';
const TrashPpeCompliance = () => {
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    setLoading(true);

    try {
      const data = await getDeletedPpeLogs();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.message ||
          'Failed to load deleted records',
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (item: any) => {
    Alert.alert(
      'Restore Record',
      'Restore this PPE compliance record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Restore',
          onPress: async () => {
            try {
              await restorePpeLog(item.id); 

              Alert.alert(
                'Success',
                'Record restored successfully',
              );

              loadData();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message ||
                  'Failed to restore',
              );
            }
          },
        },
      ],
    );
  };

  const handlePermanentDelete = (
  id: string,
) => {
  Alert.alert(
    'Permanent Delete',
    'This action cannot be undone.',
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
            await forceDeletePpeLog(id);

            Alert.alert(
              'Deleted',
              'Record permanently removed',
            );

            loadData();
          } catch (err: any) {
            Alert.alert(
              'Error',
              err?.response?.data?.message ||
                'Failed to delete',
            );
          }
        },
      },
    ],
  );
};
  const filtered = records.filter(item => {
    if (!searchQuery.trim()) {
      return true;
    }

    const q = searchQuery.toLowerCase();

    return (
      (item.patient?.first_name || '')
        .toLowerCase()
        .includes(q) ||
      (item.patient?.last_name || '')
        .toLowerCase()
        .includes(q)
    );
  });

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
              handleRestore(item)
            }>
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
            onPress={() =>
              handlePermanentDelete(
                item.id,
              )
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
        <View style={styles.header}>
          <Text bold size={20}>
            Deleted PPE Records
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search deleted records..."
            onChangeText={setSearchQuery}
            value={searchQuery}
          />
        </View>

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
              No deleted records found
            </Text>
          </View>
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

export default TrashPpeCompliance;