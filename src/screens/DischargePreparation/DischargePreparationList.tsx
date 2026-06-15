import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useDischarge} from '../../context/DischargePreparationContext';
import {useTheme} from '../../hooks';
import {Block, Text, Input} from '../../components';

const DischargePreparationList = () => {
  const navigation = useNavigation<any>();
  const {admissions, loading, fetchAdmissions} = useDischarge();
  const {sizes} = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [filtered, setFiltered] = useState(admissions);

  useFocusEffect(
    React.useCallback(() => {
      fetchAdmissions();
    }, []),
  );

  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const result = admissions.filter((adm: any) => {
      const patientName = (
        adm.patient?.name ||
        adm.patient_name ||
        ''
      ).toLowerCase();

      const wardName = (adm.ward || '').toLowerCase();

      return patientName.includes(query) || wardName.includes(query);
    });

    setFiltered(result);
  }, [searchQuery, admissions]);

  const getStatusLabel = (prep: any) => {
    if (!prep) {
      return 'Not Started';
    }

    if (prep.is_ready || prep.status === 'ready') {
      return 'Ready';
    }

    if (prep.status === 'in_progress') {
      return 'In Progress';
    }

    return 'Not Started';
  };

  const renderItem = ({item}: any) => {
  const prep = item.discharge_preparation;

  const patientName =
    item.patient?.name ||
    item.patient_name ||
    'Unknown';

  const wardName =
    item.ward || 'N/A';

  return (
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
            style={{
              color: '#2d3748',
            }}>
            {patientName}
          </Text>

          <Text style={styles.infoText}>
            Admission:{' '}
            {item.admission_id ||
              item.ipd_id ||
              'N/A'}
          </Text>

          <Text style={styles.infoText}>
            Ward: {wardName}
          </Text>

          <Text style={styles.infoText}>
            Status:{' '}
            {getStatusLabel(prep)}
          </Text>
        </View>

        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#e3f2fd',
              },
            ]}
            onPress={() =>
              navigation.navigate(
                'AddDischargePreparation',
                {
                  admissionId:
                    item.ipd_id ||
                    item.id,
                  admission: item,
                },
              )
            }>
            <Text
              bold
              color="#1565c0">
              {prep
                ? 'CONTINUE'
                : 'PREPARE'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.verticalBtn,
              {
                backgroundColor:
                  '#f0f0f0',
                marginTop: 4,
              },
            ]}
            onPress={() =>
              navigation.navigate(
                'ConfirmDischarge',
                {
                  admission: item,
                  discharge: prep,
                },
              )
            }>
            <Text
              bold
              color="#333">
              VIEW
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

  return (
    <Block safe>
      <Block scroll={false} paddingHorizontal={sizes.padding} style={{flex: 1}}>
        {/* HEADER */}
        <View style={styles.pageHeader}>
  <View>
    <Text style={styles.pageTitle}>
      Discharge Preparation
    </Text>

    <Text style={styles.breadcrumb}>
      Nurse / Discharge Preparation
    </Text>
  </View>
</View>

        {/* SEARCH */}
        <View style={styles.searchContainer}>
          <Input
            search
            placeholder="Search by patient name or ward..."
            onChangeText={(text: string) => setSearchQuery(text)}
            value={searchQuery}
          />
        </View>

        {loading && admissions.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#cb0c9f" />
          </View>
        ) : filtered.length > 0 ? (
          <FlatList
            data={filtered}
            renderItem={renderItem}
            keyExtractor={(item, index) =>
              String(item?.id || `admission-${index}`)
            }
            contentContainerStyle={{
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.center}>
            <Text gray size={14}>
              No active admissions
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DischargePreparationList;
