import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../hooks';
import { Block, Text } from '../components';

const ViewLabReport = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sizes } = useTheme();
  const { report: passedReport } = route.params;

  const [report, setReport] = useState<any>(passedReport || null);
  const [loading, setLoading] = useState(!passedReport);

  useEffect(() => {
    // If report is passed from navigation, use it directly
    if (passedReport) {
      setReport(passedReport);
      setLoading(false);
    } else {
      // Fallback: try to fetch if no report data passed
      // This is a fallback for backward compatibility
      setLoading(false);
    }
  }, [passedReport]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return '#4caf50';
      case 'in progress':
        return '#ff9800';
      case 'pending':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return '#e8f5e9';
      case 'in progress':
        return '#fff3e0';
      case 'pending':
        return '#ffebee';
      default:
        return '#f5f5f5';
    }
  };

  if (loading) {
    return (
      <Block safe>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#cb0c9f" />
        </View>
      </Block>
    );
  }

  if (!report) {
    return (
      <Block safe>
        <View style={styles.center}>
          <Text gray size={16}>Lab report not found</Text>
        </View>
      </Block>
    );
  }

  const resultData = report.result_data || {};

  return (
    <Block safe>
      <ScrollView style={{ flex: 1, padding: sizes.padding }}>
        <View style={styles.headerSection}>
          <Text bold size={20} style={{ marginBottom: 16 }}>
            Report Details
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}>
            <Text bold size={14}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Patient & Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text gray size={12}>Patient</Text>
              <Text bold size={16} style={{ marginTop: 4 }}>
                {report.patient?.first_name || ''} {report.patient?.last_name || ''}
              </Text>
              <Text gray size={12} style={{ marginTop: 4 }}>
                Patient ID: {report.patient?.patient_code || '-'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBgColor(report.status) },
              ]}>
              <Text
                bold
                size={14}
                style={{ color: getStatusColor(report.status) }}>
                {report.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Test Information */}
        <View style={styles.card}>
          <Text bold size={14} style={{ marginBottom: 12, color: '#333' }}>
            Test Information
          </Text>
          <DetailRow label="Report Type" value={report.test_type || '-'} />
          <DetailRow label="Test Name" value={report.test_name || '-'} />
          <DetailRow
            label="Recorded Date"
            value={report.created_at ? new Date(report.created_at).toLocaleDateString() : '-'}
          />
        </View>

        {/* Observations */}
        {resultData.observations && (
          <View style={styles.card}>
            <Text bold size={14} style={{ marginBottom: 12, color: '#333' }}>
              Observations
            </Text>
            <Text size={13} style={{ lineHeight: 20, color: '#555' }}>
              {resultData.observations}
            </Text>
          </View>
        )}

        {/* Findings */}
        {resultData.findings && (
          <View style={styles.card}>
            <Text bold size={14} style={{ marginBottom: 12, color: '#333' }}>
              Findings
            </Text>
            <Text size={13} style={{ lineHeight: 20, color: '#555' }}>
              {resultData.findings}
            </Text>
          </View>
        )}

        {/* Diagnosis */}
        {resultData.diagnosis && (
          <View style={styles.card}>
            <Text bold size={14} style={{ marginBottom: 12, color: '#333' }}>
              Diagnosis
            </Text>
            <Text size={13} style={{ lineHeight: 20, color: '#555' }}>
              {resultData.diagnosis}
            </Text>
          </View>
        )}

        {/* Lab Values (if available) */}
        {(resultData.WBC || resultData.RBC || Object.keys(resultData).length > 0) && (
          <View style={styles.card}>
            <Text bold size={14} style={{ marginBottom: 12, color: '#333' }}>
              Lab Values
            </Text>

            {resultData.WBC && (
              <LabValueRow label="WBC (White Blood Cells)" value={resultData.WBC} unit="" />
            )}
            {resultData.RBC && (
              <LabValueRow label="RBC (Red Blood Cells)" value={resultData.RBC} unit="" />
            )}

            {/* Other lab values */}
            {Object.entries(resultData).map(([key, value]: [string, any]) => {
              if (
                !['observations', 'findings', 'diagnosis', 'WBC', 'RBC', 'attachments'].includes(
                  key,
                ) &&
                value &&
                typeof value === 'string'
              ) {
                return (
                  <LabValueRow
                    key={key}
                    label={key.replace(/_/g, ' ').toUpperCase()}
                    value={value}
                    unit=""
                  />
                );
              }
              return null;
            })}
          </View>
        )}

        {/* Additional Info */}
        <View style={styles.card}>
          <Text bold size={14} style={{ marginBottom: 12, color: '#333' }}>
            Additional Information
          </Text>
          <DetailRow label="Status" value={report.status || '-'} />
          <DetailRow label="Created At" value={report.created_at ? new Date(report.created_at).toLocaleString() : '-'} />
        </View>

        <TouchableOpacity
          style={styles.backBtnFull}
          onPress={() => navigation.goBack()}>
          <Text bold color="#fff" size={14}>Back to Reports</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </Block>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text bold size={12} style={{ width: 120, color: '#666' }}>
      {label}
    </Text>
    <Text size={12} style={{ flex: 1, color: '#333' }}>
      {value || '-'}
    </Text>
  </View>
);

const LabValueRow = ({ label, value, unit }: { label: string; value: string; unit: string }) => (
  <View style={[styles.row, styles.labValueRow]}>
    <Text size={12} style={{ flex: 1, color: '#555' }}>
      {label}
    </Text>
    <Text bold size={12} style={{ color: '#cb0c9f' }}>
      {value} {unit}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  labValueRow: {
    paddingBottom: 8,
    marginBottom: 8,
  },
  backBtnFull: {
    backgroundColor: '#cb0c9f',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ViewLabReport;
