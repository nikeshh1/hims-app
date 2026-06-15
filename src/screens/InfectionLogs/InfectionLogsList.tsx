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
import {colors} from '../../constants';
import {getInfectionLogs, deleteInfectionLog} from '../../api/infectionLogs';

const InfectionLogsList = () => {
  const navigation = useNavigation<any>();
  const {sizes} = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
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
      const data = await getInfectionLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load infection logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = logs;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          (l.patient?.first_name || '').toLowerCase().includes(q) ||
          (l.patient?.last_name || '').toLowerCase().includes(q) ||
          (l.infection_type || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [logs, searchQuery]);

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Log',
      `Delete infection log for "${item.patient?.first_name || ''} ${item.patient?.last_name || ''}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInfectionLog(item.id);
              Alert.alert('Deleted', 'Log removed');
              refreshData();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err?.response?.data?.message || 'Cannot delete',
              );
            }
          },
        },
      ],
    );
  };


 const renderItem = ({item}: {item: any}) => (
  <View style={styles.card}>
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <View style={{flex: 1}}>
        <Text bold size={16} style={{color: '#2d3748'}}>
          {item.patient?.first_name || ''}{' '}
          {item.patient?.last_name || ''}
        </Text>

        <Text size={14} style={{marginTop: 6, color: '#4a5568'}}>
  🦠 {item.infection_type || '-'}
</Text>

<Text size={14} style={{marginTop: 4, color: '#4a5568'}}>
  Status: {item.status || '-'}
</Text>

<Text size={14} style={{marginTop: 4, color: '#4a5568'}}>
  Severity: {item.severity || '-'}
</Text>

<Text size={14} style={{marginTop: 6, color: '#4a5568'}}>
  📅 {item.created_at
    ? new Date(item.created_at).toLocaleDateString()
    : '-'}
</Text>
      </View>

      <View style={styles.actionColumn}>
        <TouchableOpacity
          style={[
            styles.verticalBtn,
            {backgroundColor: '#e8f5e9'},
          ]}
          onPress={() =>
            navigation.navigate('ViewInfectionLog', {
              id: item.id,
            })
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
            navigation.navigate('AddInfectionLog', {
              editData: item,
            })
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
          onPress={() => handleDelete(item)}>
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
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.pageHeader}>
  <View>
    <Text style={styles.pageTitle}>Infection Logs</Text>
    <Text style={styles.breadcrumb}>Nurse / Infection Logs</Text>
  </View>

  <TouchableOpacity
    style={styles.primaryButton}
    onPress={() => navigation.navigate('AddInfectionLog')}>
    <Text color="#fff" bold>
      + NEW LOG
    </Text>
  </TouchableOpacity>
</View>


        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient or infection..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>
      <TouchableOpacity
  style={styles.deletedButton}
  onPress={() => navigation.navigate('TrashInfectionLogs')}>
  <Text bold color="#fff" size={15}>
    Deleted Records
  </Text>
</TouchableOpacity>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filtered.length > 0 ? (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={true}
            contentContainerStyle={{paddingBottom: 20}}
          />
        ) : (
          <View style={styles.center}>
            <Text gray size={14}>
              No infection logs found
            </Text>
          </View>
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  searchContainer: {marginVertical: 12},
  center: {justifyContent: 'center', alignItems: 'center', marginTop: 40},
  card: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 14, // was 18
  marginBottom: 16,
  elevation: 2,
},
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
actionRow: {
  flexDirection: 'row',
  gap: 10,
  marginBottom: 12,
},
addBtn: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
},
deletedButton: {
  backgroundColor: '#6c757d',
  height: 40,
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 16,
},
});

export default InfectionLogsList;
