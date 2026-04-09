import React, {useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SectionList,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useNurseShifts} from '../../context/NurseShiftsContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const NurseShiftsList = () => {
  const navigation = useNavigation<any>();
  const {shiftAssignments, loading, refreshAssignments} = useNurseShifts();
  const {sizes} = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      refreshAssignments();
    }, []),
  );

  const filteredAssignments = useMemo(() => {
    let result = shiftAssignments;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          (a.staff?.name || '').toLowerCase().includes(q) ||
          (a.shift?.shift_name || '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [shiftAssignments, searchQuery]);

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const renderAssignmentItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <Text bold size={16}>
            {item.staff?.name || 'Unknown'}
          </Text>
          <Text gray size={13} style={{marginTop: 4}}>
            {item.shift?.shift_name || 'No shift'} • {formatTime(item.shift?.start_time)} - {formatTime(item.shift?.end_time)}
          </Text>
        </View>
      </View>

      <Text gray size={12} style={{marginTop: 8}}>
        📅 {item.start_date?.substring(0, 10)} {item.end_date ? `→ ${item.end_date.substring(0, 10)}` : '(Ongoing)'}
      </Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, {flex: 1, backgroundColor: '#e8f5e9'}]}
          onPress={() => navigation.navigate('AddHandover', {assignmentId: item.id, assignmentData: item})}>
          <Text size={13} color="#2e7d32" bold>
            + ADD HANDOVER
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, {flex: 1, backgroundColor: '#e3f2fd'}]}
          onPress={() => navigation.navigate('ViewHandover', {assignmentId: item.id, assignmentData: item})}>
          <Text size={13} color="#1565c0" bold>
            VIEW HANDOVER
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.header}>
          <Text bold size={20}>Shift Assignments</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by nurse or shift..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>
              Loading shifts...
            </Text>
          </View>
        ) : filteredAssignments.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>
              No shift assignments found
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredAssignments}
            keyExtractor={(item) => item.id}
            renderItem={renderAssignmentItem}
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
  searchContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});

export default NurseShiftsList;
