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
  getInfectionLog,
  deleteInfectionLog,
} from '../../api/infectionLogs';

const ViewInfectionLog = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { sizes } = useTheme();
  const logId = route.params?.id;

  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLog();
  }, []);

  const loadLog = async () => {
    if (!logId) return;
    setLoading(true);
    try {
      const data = await getInfectionLog(logId);
      setLog(data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load log');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Log',
      'Are you sure you want to delete this infection log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInfectionLog(logId);
              Alert.alert('Deleted', 'Log removed successfully');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (!log) {
    return (
      <Block safe>
        <Text center gray>
          Log not found
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
          Infection Log Details
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text bold size={16}>
              {log.patient?.first_name || ''} {log.patient?.last_name || ''}
            </Text>
            <View
              style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(log.severity) },
              ]}
            >
              <Text size={12} color="#fff" bold>
                {log.severity}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              Patient ID:
            </Text>
            <Text size={13}>{log.patient_id}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              Infection Type:
            </Text>
            <Text size={13}>{log.infection_type || '-'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              Status:
            </Text>
            <Text size={13}>{log.status || '-'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              Symptoms:
            </Text>
            <Text size={13}>{log.symptoms || '-'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text gray bold size={13}>
              Created:
            </Text>
            <Text size={13}>
              {log.created_at ? new Date(log.created_at).toLocaleDateString() : '-'}
            </Text>
          </View>

          {log.notes && (
            <View style={styles.detailRow}>
              <Text gray bold size={13}>
                Notes:
              </Text>
              <Text size={13}>{log.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.editBtn, { backgroundColor: '#007AFF' }]}
            onPress={() =>
              navigation.navigate('AddInfectionLog', { editData: log })
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
    borderLeftColor: '#d32f2f',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityBadge: {
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

export default ViewInfectionLog;
