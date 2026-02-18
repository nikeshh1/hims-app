
import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {
  Articles,
  Components,
  Home,
  Profile,
  Register,
  Pro,
  FinancialYears,
  AddFinancialYear,
  FYHospitalMapping,
} from '../screens';

import {useScreenOptions, useTranslation} from '../hooks';

const Stack = createStackNavigator();

export default () => {
  const {t} = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions.stack}>
      {/* HOME */}
      <Stack.Screen
        name="Home"
        component={Home}
        options={{title: t('navigation.home')}}
      />

      {/* FINANCIAL YEARS LIST */}
      <Stack.Screen
        name="FinancialYears"
        component={FinancialYears}
        options={{title: 'Financial Years'}}
      />

      {/* ADD FY */}
      <Stack.Screen
        name="AddFinancialYear"
        component={AddFinancialYear}
        options={{title: 'Add Financial Year'}}
      />

      {/* MAPPING SCREEN */}
      <Stack.Screen
        name="FYHospitalMapping"
        component={FYHospitalMapping}
        options={{title: 'Hospital Mapping'}}
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
        options={{title: t('navigation.articles')}}
      />

      <Stack.Screen name="Pro" component={Pro} options={screenOptions.pro} />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="Register"
        component={Register}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

