
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import {
  Articles,
  Components,
  Home,
  Profile,
  Register,
  Pro,
  VitalsList,
  AddVital,
  ViewVital,
  TrashVitals,
  MedicationAdministrationList,
  AddMedicationAdministration,
  ViewMedicationAdministration,
  TrashMedicationAdministration,
  InfectionLogsList,
  AddInfectionLog,
  ViewInfectionLog,
  TrashInfectionLogs,
  IsolationTrackingList,
  AddIsolationTracking,
  ViewIsolationTracking,
  TrashIsolationTracking,
  PpeComplianceList,
  AddPpeCompliance,
  ViewPpeCompliance,
  TrashPpeCompliance,
  NurseShiftsList,
  AddHandover,
  ViewHandover,
  TrashShifts,
  DischargePreparationList,
  AddDischargePreparation,
  ConfirmDischarge,
  LabReportsList,
  ViewLabReport,
  VitalsTrendsReport,
  MedicationReport,
  ShiftReport,
  PatientSummary,
  NurseDashboard,
  CriticalPatients,
} from '../screens';

import { useScreenOptions, useTranslation } from '../hooks';

const Stack = createStackNavigator();

export default () => {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions.stack}>
      {/* HOME */}
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: t('navigation.home') }}
      />
      {/* NURSE – PATIENT MONITORING */}
      <Stack.Screen
        name="VitalsList"
        component={VitalsList}
        options={{ title: 'Patient Monitoring' }}
      />
      <Stack.Screen
        name="AddVital"
        component={AddVital}
        options={{ title: 'Record Vital' }}
      />
      <Stack.Screen
        name="ViewVital"
        component={ViewVital}
        options={{ title: 'Vital Details' }}
      />
      <Stack.Screen
        name="TrashVitals"
        component={TrashVitals}
        options={{ title: 'Deleted Vitals' }}
      />

      {/* MEDICATION ADMINISTRATION */}
      <Stack.Screen
        name="MedicationAdministrationList"
        component={MedicationAdministrationList}
        options={{ title: 'Medication Administration' }}
      />
      <Stack.Screen
        name="AddMedicationAdministration"
        component={AddMedicationAdministration}
        options={{ title: 'Add Medication' }}
      />
      <Stack.Screen
        name="ViewMedicationAdministration"
        component={ViewMedicationAdministration}
        options={{ title: 'Medication Details' }}
      />
      <Stack.Screen
        name="TrashMedicationAdministration"
        component={TrashMedicationAdministration}
        options={{ title: 'Deleted Medications' }}
      />

      {/* INFECTION LOGS */}
      <Stack.Screen
        name="InfectionLogsList"
        component={InfectionLogsList}
        options={{ title: 'Infection Logs' }}
      />
      <Stack.Screen
        name="AddInfectionLog"
        component={AddInfectionLog}
        options={{ title: 'Add Infection Log' }}
      />
      <Stack.Screen
        name="ViewInfectionLog"
        component={ViewInfectionLog}
        options={{ title: 'Infection Details' }}
      />
      <Stack.Screen
        name="TrashInfectionLogs"
        component={TrashInfectionLogs}
        options={{ title: 'Deleted Logs' }}
      />

      {/* ISOLATION TRACKING */}
      <Stack.Screen
        name="IsolationTrackingList"
        component={IsolationTrackingList}
        options={{ title: 'Isolation Tracking' }}
      />
      <Stack.Screen
        name="AddIsolationTracking"
        component={AddIsolationTracking}
        options={{ title: 'Add Isolation Record' }}
      />
      <Stack.Screen
        name="ViewIsolationTracking"
        component={ViewIsolationTracking}
        options={{ title: 'Isolation Details' }}
      />
      <Stack.Screen
        name="TrashIsolationTracking"
        component={TrashIsolationTracking}
        options={{ title: 'Deleted Records' }}
      />

      {/* PPE COMPLIANCE */}
      <Stack.Screen
        name="PpeComplianceList"
        component={PpeComplianceList}
        options={{ title: 'PPE Compliance' }}
      />
      <Stack.Screen
        name="AddPpeCompliance"
        component={AddPpeCompliance}
        options={{ title: 'Add PPE Record' }}
      />
      <Stack.Screen
        name="ViewPpeCompliance"
        component={ViewPpeCompliance}
        options={{ title: 'PPE Details' }}
      />
      <Stack.Screen
        name="TrashPpeCompliance"
        component={TrashPpeCompliance}
        options={{ title: 'Deleted Records' }}
      />

      {/* NURSE SHIFTS */}
      <Stack.Screen
        name="NurseShiftsList"
        component={NurseShiftsList}
        options={{ title: 'Shift Assignments' }}
      />
      <Stack.Screen
        name="AddHandover"
        component={AddHandover}
        options={{ title: 'Add Handover Notes' }}
      />
      <Stack.Screen
        name="ViewHandover"
        component={ViewHandover}
        options={{ title: 'View Handover Notes' }}
      />
      <Stack.Screen
        name="TrashShifts"
        component={TrashShifts}
        options={{ title: 'Deleted Shifts' }}
      />

      {/* DISCHARGE PREPARATION */}
      <Stack.Screen
        name="DischargePreparationList"
        component={DischargePreparationList}
        options={{ title: 'Discharge Preparation' }}
      />
      <Stack.Screen
        name="AddDischargePreparation"
        component={AddDischargePreparation}
        options={{ title: 'Discharge Checklist' }}
      />
      <Stack.Screen
        name="ConfirmDischarge"
        component={ConfirmDischarge}
        options={{ title: 'Confirm Discharge' }}
      />

      {/* LAB & REPORT VIEW */}
      <Stack.Screen
        name="LabReportsList"
        component={LabReportsList}
        options={{ title: 'Lab & Report View' }}
      />
      <Stack.Screen
        name="ViewLabReport"
        component={ViewLabReport}
        options={{ title: 'Report Details' }}
      />

      {/* NURSE DASHBOARD */}
      <Stack.Screen
        name="NurseDashboard"
        component={NurseDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Stack.Screen
        name="CriticalPatients"
        component={CriticalPatients}
        options={{ title: 'Critical Patients' }}
      />

      {/* NURSE REPORTS */}
      <Stack.Screen
        name="VitalsTrendsReport"
        component={VitalsTrendsReport}
        options={{ title: 'Vital Trends Report' }}
      />
      <Stack.Screen
        name="MedicationReport"
        component={MedicationReport}
        options={{ title: 'Medication Report' }}
      />
      <Stack.Screen
        name="ShiftReport"
        component={ShiftReport}
        options={{ title: 'Shift Report' }}
      />
      <Stack.Screen
        name="PatientSummary"
        component={PatientSummary}
        options={{ title: 'Patient Summary' }}
      />

      {/* OTHER SCREENS */}
      <Stack.Screen
        name="Components"
        component={Components}
        options={screenOptions.components}
      />

      <Stack.Screen
        name="Articles"
        component={Articles}
        options={{ title: t('navigation.articles') }}
      />

      <Stack.Screen name="Pro" component={Pro} options={screenOptions.pro} />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

