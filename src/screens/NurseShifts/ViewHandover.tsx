import React, {useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, useFocusEffect} from '@react-navigation/native';
import {useNurseShifts} from '../../context/NurseShiftsContext';
import {useTheme} from '../../hooks';
import {Block, Text} from '../../components';

const ViewHandover = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {handoverNotes, loading, getHandoverNotesForAssignment, updateHandoverTaskStatus, removeHandoverNote} =
    useNurseShifts();
  const {sizes} = useTheme();

  const assignmentId = route.params?.assignmentId;
  const assignmentData = route.params?.assignmentData;

  useFocusEffect(
    React.useCallback(() => {
      if (assignmentId) {
        getHandoverNotesForAssignment(assignmentId);
      }
    }, [assignmentId]),
  );

  const handleMarkCompleted = (item: any) => {
    if (item.entry_type !== 'task') return;

    Alert.alert(
      'Mark as Completed',
      'Mark this task as completed?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Mark Completed',
          style: 'default',
          onPress: async () => {
            try {
              await updateHandoverTaskStatus(item.id, 'completed');
              Alert.alert('Done', 'Task marked as completed');
              getHandoverNotesForAssignment(assignmentId);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Cannot update task');
            }
          },
        },
      ],
    );
  };

  const handleDelete = (item: any) => {
    Alert.alert(
      'Delete Handover',
      'Delete this handover note?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeHandoverNote(item.id);
              Alert.alert('Deleted', 'Handover note deleted');
              getHandoverNotesForAssignment(assignmentId);
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Cannot delete');
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f57c00';
      case 'completed':
        return '#2e7d32';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A';
  };

  const renderHandoverItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
            <Text bold size={14}>
              {item.entry_type === 'note' ? '📝' : '✓'} {item.entry_type?.toUpperCase() || 'NOTE'}
            </Text>
            {item.entry_type === 'task' && item.task_status && (
              <View
                style={[
                  styles.statusBadge,
                  {backgroundColor: getStatusColor(item.task_status) + '20'},
                ]}>
                <Text size={11} bold color={getStatusColor(item.task_status)} numberOfLines={1}>
                  {getStatusLabel(item.task_status)}
                </Text>
              </View>
            )}
          </View>
          <Text gray size={12} style={{marginTop: 4}}>
            by {item.nurse?.name || 'Unknown'}
          </Text>
        </View>
      </View>

      <Text style={{marginTop: 12, fontSize: 13, color: '#333', lineHeight: 18}}>
        {item.description}
      </Text>

      <Text gray size={11} style={{marginTop: 10}}>
        ⏰ {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
      </Text>

      <View style={styles.cardActions}>
        {item.entry_type === 'task' && item.task_status !== 'completed' && (
          <TouchableOpacity
            style={[styles.actionBtn, {backgroundColor: '#e8f5e9', flex: 1}]}
            onPress={() => handleMarkCompleted(item)}>
            <Text size={12} color="#2e7d32" bold numberOfLines={1}>
              MARK COMPLETED
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, {backgroundColor: '#fce4ec', flex: 1}]}
          onPress={() => handleDelete(item)}>
          <Text size={12} color="#c62828" bold numberOfLines={1}>
            DELETE
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        <View style={styles.header}>
          <Text bold size={18}>Handover Notes</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text bold color="#cb0c9f" size={14}>
              BACK
            </Text>
          </TouchableOpacity>
        </View>

        {/* Assignment Info */}
        <View style={styles.infoCard}>
          <Text gray size={12}>👤 {assignmentData?.staff?.name || 'Unknown'}</Text>
          <Text gray size={12} style={{marginTop: 4}}>
            🔄 {assignmentData?.shift?.shift_name} ({assignmentData?.shift?.start_time?.substring(0, 5)} - {assignmentData?.shift?.end_time?.substring(0, 5)})
          </Text>
          <Text gray size={12} style={{marginTop: 4}}>
            📅 {assignmentData?.start_date?.substring(0, 10)} {assignmentData?.end_date && `to ${assignmentData?.end_date?.substring(0, 10)}`}
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
            <Text gray style={{marginTop: 10}}>
              Loading handover notes...
            </Text>
          </View>
        ) : handoverNotes.length === 0 ? (
          <View style={styles.center}>
            <Text gray size={16}>
              No handover notes yet
            </Text>
            <TouchableOpacity
              style={[styles.addBtn, {marginTop: 16}]}
              onPress={() =>
                navigation.navigate('AddHandover', {
                  assignmentId: assignmentId,
                  assignmentData: assignmentData,
                })
              }>
              <Text bold color="#fff" size={14}>
                + ADD HANDOVER
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <FlatList
              data={handoverNotes}
              keyExtractor={(item) => item.id}
              renderItem={renderHandoverItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingBottom: 40}}
            />

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() =>
                navigation.navigate('AddHandover', {
                  assignmentId: assignmentId,
                  assignmentData: assignmentData,
                })
              }>
              <Text bold color="#fff" size={14}>
                + ADD MORE
              </Text>
            </TouchableOpacity>
          </>
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
  infoCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#cb0c9f',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addBtn: {
    backgroundColor: '#cb0c9f',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
});

export default ViewHandover;
