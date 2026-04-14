import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useDischarge } from '../../context/DischargePreparationContext';
import { useTheme } from '../../hooks';
import { Block, Text, Input } from '../../components';

const DischargePreparationList = () => {
  const navigation = useNavigation<any>();
  const { admissions, loading, fetchAdmissions } = useDischarge();
  const { sizes } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState(admissions);

  useFocusEffect(
    React.useCallback(() => {
      console.log('DischargePreparationList focused - refetching data');
      fetchAdmissions();
    }, []),
  );

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const result = admissions.filter((adm: any) => {
      const patientName = (adm.patient?.name || adm.patient_name || '').toLowerCase();
      const wardName = (adm.ward || '').toLowerCase();
      return patientName.includes(query) || wardName.includes(query);
    });
    setFiltered(result);
  }, [searchQuery, admissions]);

  const getStatusColor = (prep: any) => {
    if (!prep) return '#6c757d'; // Not Started - Gray
    if (prep.is_ready || prep.status === 'ready') return '#28a745'; // Ready - Green
    if (prep.status === 'in_progress') return '#ffc107'; // In Progress - Orange
    return '#6c757d'; // Not Started - Gray
  };

  const getStatusLabel = (prep: any) => {
    if (!prep) return 'Not Started';
    if (prep.is_ready || prep.status === 'ready') return 'Ready';
    if (prep.status === 'in_progress') return 'In Progress';
    return 'Not Started';
  };

  const renderItem = ({ item }: any) => {
    const prep = item.discharge_preparation;
    const patientName = item.patient?.name || item.patient_name || 'Unknown';
    
    // Ward is directly on the item object
    const wardName = item.ward || 'N/A';
    
    const statusColor = getStatusColor(prep);
    
    console.log('List item:', {
      patientName,
      admissionId: item.admission_id,
      prep: prep ? { is_ready: prep.is_ready, status: prep.status } : 'NO PREP',
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text bold size={15} style={{ flex: 1 }}>
            {patientName}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text white bold size={11}>
              {getStatusLabel(prep)}
            </Text>
          </View>
        </View>

        <Text gray size={13} style={{ marginTop: 4 }}>
          📋 Admission: {item.admission_id || item.ipd_id || 'N/A'}
        </Text>

        <Text gray size={13} style={{ marginTop: 4 }}>
          🏥 Ward: {wardName}
        </Text>

        {prep && (
          <Text gray size={13} style={{ marginTop: 4 }}>
            ✓ Checklist: {prep.checklist?.filter((c: any) => c.completed).length || 0}/{prep.checklist?.length || 0}
          </Text>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#e3f2fd', flex: 1 }]}
            onPress={() =>
              navigation.navigate('AddDischargePreparation', {
                admissionId: item.ipd_id || item.id,
                admission: item,
              })
            }
          >
            <Text size={12} color="#1565c0" bold>
              {prep ? 'Continue' : 'Prepare'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#f0f0f0', flex: 1, marginLeft: 8 }]}
            onPress={() =>
              navigation.navigate('ConfirmDischarge', { admission: item, discharge: prep })
            }
          >
            <Text size={12} color="#333" bold>View</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text bold size={20}>Discharge Preparation</Text>
        </View>

        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient name or bed..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {loading && admissions.length === 0 ? (
          <ActivityIndicator size="large" />
        ) : filtered.length > 0 ? (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item, index) => item?.id || `admission-${index}`}
            scrollEnabled={true}
          />
        ) : (
          <View style={styles.center}>
            <Text gray>No active admissions</Text>
          </View>
        )}
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: 12,
  },
  searchContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DischargePreparationList;
