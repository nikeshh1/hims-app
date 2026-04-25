import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Alert, Animated, Linking, StyleSheet} from 'react-native';

import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from '@react-navigation/drawer';

import Screens from './Screens';
import {Block, Text, Switch, Button, Image} from '../components';
import {useData, useTheme, useTranslation} from '../hooks';

const Drawer = createDrawerNavigator();

/* drawer menu screens navigation */
const ScreensStack = () => {
  const {colors} = useTheme();
  const isDrawerOpen = useDrawerStatus() === 'open';
  const animation = useRef(new Animated.Value(0)).current;

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.88],
  });

  const borderRadius = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const animatedStyle = {
    borderRadius: borderRadius,
    transform: [{scale: scale}],
  };

  useEffect(() => {
    Animated.timing(animation, {
      duration: 200,
      useNativeDriver: true,
      toValue: isDrawerOpen ? 1 : 0,
    }).start();
  }, [isDrawerOpen, animation]);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        animatedStyle,
        {
          flex: 1,
          overflow: 'hidden',
          borderColor: colors.card,
          borderWidth: isDrawerOpen ? 1 : 0,
        },
      ])}>
      {/*  */}
      <Screens />
    </Animated.View>
  );
};

/* custom drawer menu */
const DrawerContent = (
  props: DrawerContentComponentProps,
) => {
  const {navigation} = props;
  const {t} = useTranslation();
  const {isDark, handleIsDark} = useData();
  const [active, setActive] = useState('Home');
  const {assets, colors, gradients, sizes} = useTheme();
  const labelColor = colors.text;

  const handleNavigation = useCallback(
    (to: string) => {
      setActive(to);
      // Properly navigate to screens in the stack
      navigation.navigate('Screens', { screen: to });
      // Close the drawer after navigation
      navigation.closeDrawer();
    },
    [navigation, setActive],
  );

  const handleWebLink = useCallback((url: string) => Linking.openURL(url), []);

  // screen list for Drawer menu
  const screens = [
    {name: t('screens.home'), to: 'Home', icon: assets.home},
    {name: 'Patient Monitoring', to: 'VitalsList', icon: assets.document, section: 'Nurse'},
    {name: 'Medication Administration', to: 'MedicationAdministrationList', icon: assets.document},
    {name: 'Infection Logs', to: 'InfectionLogsList', icon: assets.document},
    {name: 'Isolation Tracking', to: 'IsolationTrackingList', icon: assets.document},
    {name: 'PPE Compliance', to: 'PpeComplianceList', icon: assets.document},
    {name: 'Shift Assignments', to: 'NurseShiftsList', icon: assets.document},
    {name: 'Discharge Preparation', to: 'DischargePreparationList', icon: assets.document},
    {name: 'Lab & Report View', to: 'LabReportsList', icon: assets.document},
    {name: 'Vital Trends Report', to: 'VitalsTrendsReport', icon: assets.document, section: 'Reports'},
    {name: 'Medication Report', to: 'MedicationReport', icon: assets.document},
    {name: 'Shift Report', to: 'ShiftReport', icon: assets.document},
    {name: 'Patient Summary', to: 'PatientSummary', icon: assets.document},
    {name: t('screens.components'), to: 'Components', icon: assets.components},
    {name: t('screens.articles'), to: 'Articles', icon: assets.document},
    {name: t('screens.rental'), to: 'Pro', icon: assets.rental},
    {name: t('screens.profile'), to: 'Profile', icon: assets.profile},
    {name: t('screens.settings'), to: 'Pro', icon: assets.settings},
    {name: t('screens.register'), to: 'Register', icon: assets.register},
    {name: t('screens.extra'), to: 'Pro', icon: assets.extras},
  ];

  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled
      removeClippedSubviews
      renderToHardwareTextureAndroid
      contentContainerStyle={{paddingBottom: sizes.padding}}>
      <Block paddingHorizontal={sizes.padding}>
        <Block flex={0} row align="center" marginBottom={sizes.l}>
          <Image
            radius={0}
            width={33}
            height={33}
            color={colors.text}
            source={assets.logo}
            marginRight={sizes.sm}
          />
          <Block>
            <Text size={12} semibold>
              {t('app.name')}
            </Text>
            <Text size={12} semibold>
              {t('app.native')}
            </Text>
          </Block>
        </Block>

        {screens?.map((screen, index) => {
          const isActive = active === screen.to;
          const showSection = screen.section && (index === 0 || screens[index - 1]?.section !== screen.section);
          return (
            <React.Fragment key={`menu-screen-${screen.name}-${index}`}>
              {showSection && (
                <Text
                  semibold
                  transform="uppercase"
                  opacity={0.5}
                  style={{marginTop: index > 0 ? 10 : 0, marginBottom: 6}}>
                  {screen.section}
                </Text>
              )}
              <Button
                row
                justify="flex-start"
                marginBottom={sizes.s}
                onPress={() => handleNavigation(screen.to)}>
                <Block
                  flex={0}
                  radius={6}
                  align="center"
                  justify="center"
                  width={sizes.md}
                  height={sizes.md}
                  marginRight={sizes.s}
                  gradient={gradients[isActive ? 'primary' : 'white']}>
                  <Image
                    radius={0}
                    width={14}
                    height={14}
                    source={screen.icon}
                    color={colors[isActive ? 'white' : 'black']}
                  />
                </Block>
                <Text p semibold={isActive} color={labelColor}>
                  {screen.name}
                </Text>
              </Button>
            </React.Fragment>
          );
        })}

        <Block
          flex={0}
          height={1}
          marginRight={sizes.md}
          marginVertical={sizes.sm}
          gradient={gradients.menu}
        />

        <Text semibold transform="uppercase" opacity={0.5}>
          {t('menu.documentation')}
        </Text>

        <Button
          row
          justify="flex-start"
          marginTop={sizes.sm}
          marginBottom={sizes.s}
          onPress={() =>
            handleWebLink('https://github.com/creativetimofficial')
          }>
          <Block
            flex={0}
            radius={6}
            align="center"
            justify="center"
            width={sizes.md}
            height={sizes.md}
            marginRight={sizes.s}
            gradient={gradients.white}>
            <Image
              radius={0}
              width={14}
              height={14}
              color={colors.black}
              source={assets.documentation}
            />
          </Block>
          <Text p color={labelColor}>
            {t('menu.started')}
          </Text>
        </Button>

        <Block row justify="space-between" marginTop={sizes.sm}>
          <Text color={labelColor}>{t('darkMode')}</Text>
          <Switch
            checked={isDark}
            onPress={(checked) => {
              handleIsDark(checked);
              Alert.alert(t('pro.title'), t('pro.alert'));
            }}
          />
        </Block>
      </Block>
    </DrawerContentScrollView>
  );
};

/* drawer menu navigation */
export default () => {
  const {gradients} = useTheme();

  return (
    <Block gradient={gradients.light}>
      <Drawer.Navigator
        screenOptions={{
          drawerStyle: {
            flex: 1,
            width: '60%',
            borderRightWidth: 0,
            backgroundColor: 'transparent',
          },
          drawerType: 'slide',
          overlayColor: 'transparent',
        }}
        drawerContent={(props) => <DrawerContent {...props} />}>
        <Drawer.Screen 
          name="Screens" 
          component={ScreensStack}
          options={{
            headerShown: false
          }} 
        />
      </Drawer.Navigator>
    </Block>
  );
};
