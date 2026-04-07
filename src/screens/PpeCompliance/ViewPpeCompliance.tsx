import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../hooks';
import { Block, Text, Button } from '../../components';
import {
  getPpeLog,
  deletePpeLog,
} from '../../api/ppeCompliance';

const ViewPpeCompliance = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sizes } = useTheme();
  const recordId = route.params?.id;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecord();
  }, []);

  const loadRecord = async () => {
    if (!recordId) return;
    setLoading(true);
    try {
      const data = await getPpeLog(recordId);
      setRecord(data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load record');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this PPE compliance record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePpeLog(recordId);
              Alert.alert('Deleted', 'Record removed successfully');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'compliant':
        return '#388e3c';
      case 'non-compliant':
        return '#d32f2f';
      case 'pending':
        return '#f57c00';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (!record) {
    return (
      <Block safe>
        <Text center gray>
          Record not found
        </Text>
      </Block>
    );
  }

  return (
    <Block safe>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ paddingHorizontal: sizes.padding }}
      >
        <Text bold size={20} style={{ marginVertical: 16 }}>
          PPE Compliance Details
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text bold size={16}>
              {record.patient?.first_name || ''} {record.patient?.last_name || ''}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(record.status) },
              ]}
            >
              <Text size={12} color="#fff" bold>
                {record.status}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              Patient ID:
            </Text>
            <Text size={13}>{record.patient_id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              PPE Type:
            </Text>
            <Text size={13}>{record.ppe_type || '-'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              Created:
            </Text>
            <Text size={13}>
              {record.created_at
                ? new Date(record.created_at).toLocaleDateString()
                : '-'}
            </Text>
          </View>

          {record.notes && (
            <View style={styles.detailRow}>
              <Text gray bold size={13}>
                Notes:
              </Text>
              <Text size={13}>{record.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: '#007AFF' }]}
            onPress={() =>
              navigation.navigate('AddPpeCompliance', { editData: record })
            }
          >
            <Text bold color="#fff">
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: '#d32f2f' }]}
            onPress={handleDelete}
          >
            <Text bold color="#fff">
              Delete
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text bold color="#007AFF">
            Back
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  detailRow: {
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 16,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default ViewPpeCompliance;
