import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, TabParamList } from '../types';

// Import Tab screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import POSScreen from '../screens/POS/POSScreen';
import InventoryScreen from '../screens/Inventory/InventoryScreen';
import CustomersScreen from '../screens/Customers/CustomersScreen';
import MoreScreen from '../screens/Settings/MoreScreen';

// Import additional screens
import SuppliersScreen from '../screens/Suppliers/SuppliersScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import DebtCalculatorScreen from '../screens/DebtCalculator/DebtCalculatorScreen';
import TodoListScreen from '../screens/TodoList/TodoListScreen';
import CalculatorScreen from '../screens/Calculator/CalculatorScreen';
import BarcodeScannerScreen from '../screens/Settings/BarcodeScannerScreen';
import MultiStoreScreen from '../screens/Settings/MultiStoreScreen';
import BackupScreen from '../screens/Settings/BackupScreen';
import ReportsScreen from '../screens/Analytics/ReportsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="POS"
        component={POSScreen}
        options={{
          tabBarLabel: 'POS',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cash-register" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="package-variant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="menu" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />

        {/* Additional screens */}
        <Stack.Screen name="Suppliers" component={SuppliersScreen} />
        <Stack.Screen name="Analytics" component={AnalyticsScreen} />
        <Stack.Screen name="DebtCalculator" component={DebtCalculatorScreen} />
        <Stack.Screen name="TodoList" component={TodoListScreen} />
        <Stack.Screen name="Calculator" component={CalculatorScreen} />
        <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
        <Stack.Screen name="MultiStore" component={MultiStoreScreen} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Simple About Screen component
function AboutScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={{ backgroundColor: '#6200ee', padding: 20, paddingTop: 40 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
          About Dukasmart
        </Text>
      </View>
      <ScrollView style={{ padding: 20 }}>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Dukasmart</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>Version: 2.0.0</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
            A comprehensive shop management solution for small to medium businesses.
          </Text>
        </View>
        <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Features</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Point of Sale System</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Inventory Management</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Customer Management</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Supplier Management</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Sales Analytics & Reports</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Debt Calculator</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Multi-Store Support</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• Backup & Restore</Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>• And much more!</Text>
        </View>
      </ScrollView>
    </View>
  );
}
