import React, {useEffect} from 'react';
import {Platform, StatusBar} from 'react-native';
import {useFonts} from 'expo-font';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import Menu from './Menu';

import {DataProvider, useData, ThemeProvider, TranslationProvider} from '../hooks';
import {VitalsProvider} from '../context/VitalsContext';
import {MedicationProvider} from '../context/MedicationAdministrationContext';
import {PpeProvider} from '../context/PpeComplianceContext';

SplashScreen.preventAutoHideAsync();

function NavigationContent() {
  const {isDark, theme, setTheme} = useData();

  useEffect(() => {
    Platform.OS === 'android' && StatusBar.setTranslucent(true);
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content');
    return () => {
      StatusBar.setBarStyle('default');
    };
  }, [isDark]);

  const [fontsLoaded] = useFonts({
    'OpenSans-Light': theme.assets.OpenSansLight,
    'OpenSans-Regular': theme.assets.OpenSansRegular,
    'OpenSans-SemiBold': theme.assets.OpenSansSemiBold,
    'OpenSans-ExtraBold': theme.assets.OpenSansExtraBold,
    'OpenSans-Bold': theme.assets.OpenSansBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const navigationTheme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      border: 'rgba(0,0,0,0)',
      text: String(theme.colors.text),
      card: String(theme.colors.card),
      primary: String(theme.colors.primary),
      notification: String(theme.colors.primary),
      background: String(theme.colors.background),
    },
  };

  return (
    <TranslationProvider>
      <ThemeProvider theme={theme} setTheme={setTheme}>
        <VitalsProvider>
          <MedicationProvider>
            <PpeProvider>
              <NavigationContainer theme={navigationTheme}>
                <Menu />
              </NavigationContainer>
            </PpeProvider>
          </MedicationProvider>
        </VitalsProvider>
      </ThemeProvider>
    </TranslationProvider>
  );
}

export default function AppNavigation() {
  return (
    <DataProvider>
      <NavigationContent />
    </DataProvider>
  );
}