import React from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../../hooks';
import { Block, Text } from '../../components';

const ConfirmDischarge = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sizes } = useTheme();

  const { admission, discharge } = route.params || {};

  // Log received data for debugging
  React.useEffect(() => {
    console.log('=== ConfirmDischarge DEBUG ===');
    console.log('Full discharge object:', JSON.stringify(discharge, null, 2));
    console.log('is_ready:', discharge?.is_ready);
    console.log('status:', discharge?.status);
    console.log('Status check - is_ready OR status=ready?', discharge?.is_ready || discharge?.status === 'ready');
    console.log('Admission:', {
      name: admission?.patient?.name,
      admission_id: admission?.admission_id,
      ipd_id: admission?.ipd_id,
      ward: admission?.ward,
    });
  }, [admission, discharge]);

  if (!admission) {
    return (
      <View style={[styles.center, { flex: 1 }]}>
        <Text gray>Invalid data</Text>
      </View>
    );
  }

  const patientName = admission?.patient?.name || admission?.patient_name || 'N/A';
  const completedItems = discharge?.checklist?.filter((c: any) => c.completed).length || 0;
  const totalItems = discharge?.checklist?.length || 0;
  const admissionId = admission?.admission_id || admission?.ipd_id || 'N/A';

  return (
    <Block safe>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <Block paddingHorizontal={sizes.padding}>
          {/* Patient Information */}
          <View style={styles.section}>
            <Text bold size={15} style={{ marginBottom: 12 }}>
              Patient Information
            </Text>
            <View style={styles.infoRow}>
              <Text gray size={13} style={{ flex: 1 }}>Name:</Text>
              <Text bold size={13} style={{ flex: 1 }}>
                {patientName}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text gray size={13} style={{ flex: 1 }}>Admission ID:</Text>
              <Text bold size={13} style={{ flex: 1 }}>
                {admissionId}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text gray size={13} style={{ flex: 1 }}>Ward:</Text>
              <Text bold size={13} style={{ flex: 1 }}>
                {admission?.ward || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Status Section */}
          <View style={styles.section}>
            <Text bold size={15} style={{ marginBottom: 12 }}>
              Status
            </Text>
            <View style={styles.infoRow}>
              <Text gray size={13} style={{ flex: 1 }}>Status:</Text>
              <View style={{ flex: 1 }}>
                <View style={[styles.statusBadge, { backgroundColor: discharge?.is_ready || discharge?.status === 'ready' ? '#28a745' : '#ffc107' }]}>
                  <Text white bold size={12}>
                    {discharge?.is_ready || discharge?.status === 'ready' ? 'Ready' : 'In Progress'}
                  </Text>
                </View>
              </View>
            </View>
            {discharge?.created_at && (
              <View style={styles.infoRow}>
                <Text gray size={13} style={{ flex: 1 }}>Prepared At:</Text>
                <Text bold size={13} style={{ flex: 1 }}>
                  {new Date(discharge.created_at).toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Checklist */}
          {discharge?.checklist && Array.isArray(discharge.checklist) && (
            <View style={styles.section}>
              <Text bold size={15} style={{ marginBottom: 12 }}>
                Checklist
              </Text>
              {discharge.checklist.map((item: any, idx: number) => (
                <View key={idx} style={styles.checklistItem}>
                  <Text bold size={12} color={item.completed ? '#28a745' : '#dc3545'}>
                    {item.completed ? '✓' : '✗'}
                  </Text>
                  <Text
                    size={13}
                    style={{
                      marginLeft: 8,
                      color: item.completed ? '#28a745' : '#dc3545',
                      flex: 1,
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Belongings */}
          <View style={styles.section}>
            <Text bold size={15} style={{ marginBottom: 12 }}>
              Belongings
            </Text>
            <Text size={13} style={{ color: discharge?.belongings_status ? '#28a745' : '#dc3545' }}>
              {discharge?.belongings_status ? '✓ Returned' : '✗ Not Returned'}
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.backBtn]}
              onPress={() => navigation.goBack()}
            >
              <Text bold size={13} color="#fff">
                Back
              </Text>
            </TouchableOpacity>
          </View>
        </Block>
      </ScrollView>
    </Block>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  warningSection: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    backgroundColor: '#6c757d',
    borderRadius: 6,
  },
  dischargeBtn: {
    backgroundColor: '#28a745',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});

export default ConfirmDischarge;
