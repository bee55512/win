import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import WindowCalculatorScreen from './src/screens/WindowCalculatorScreen';
import MaterialsDatabaseScreen from './src/screens/MaterialsDatabaseScreen';
import OptimizationToolsScreen from './src/screens/OptimizationToolsScreen';

const Tab = createBottomTabNavigator();

const theme = {
  colors: {
    primary: '#2563eb',
    accent: '#10b981',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1f2937',
    onSurface: '#374151',
    disabled: '#9ca3af',
    placeholder: '#6b7280',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === 'Calculator') {
                  iconName = focused ? 'calculator' : 'calculator-outline';
                } else if (route.name === 'Materials') {
                  iconName = focused ? 'cube' : 'cube-outline';
                } else if (route.name === 'Optimization') {
                  iconName = focused ? 'construct' : 'construct-outline';
                } else {
                  iconName = 'help-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: theme.colors.primary,
              tabBarInactiveTintColor: 'gray',
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            })}
          >
            <Tab.Screen 
              name="Calculator" 
              component={WindowCalculatorScreen}
              options={{ 
                title: 'حاسبة النوافذ',
                headerTitle: 'حاسبة تكلفة النوافذ'
              }}
            />
            <Tab.Screen 
              name="Materials" 
              component={MaterialsDatabaseScreen}
              options={{ 
                title: 'قاعدة المواد',
                headerTitle: 'قاعدة بيانات المواد'
              }}
            />
            <Tab.Screen 
              name="Optimization" 
              component={OptimizationToolsScreen}
              options={{ 
                title: 'تحسين القص',
                headerTitle: 'أدوات تحسين القص'
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}