import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { initDatabase } from './src/services/database';
import { useStore } from './src/stores/useStore';
import db from './src/services/database';
import { v4 as uuidv4 } from 'uuid';
import { testSupabaseConnection } from './src/supabaseClient';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { setCurrentStore } = useStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await initDatabase();

        // Check if default store exists
        const stores = await db.getAllAsync<any>('SELECT * FROM stores LIMIT 1');

        if (stores.length === 0) {
          // Create default store
          const storeId = uuidv4();
          const now = new Date().toISOString();
          await db.runAsync(
            `INSERT INTO stores (id, name, address, phone, email, currency, ownerId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [storeId, 'My Store', '', '', '', 'USD', 'default-owner', now, now]
          );

          setCurrentStore({
            id: storeId,
            name: 'My Store',
            address: '',
            phone: '',
            email: '',
            currency: 'USD',
            ownerId: 'default-owner',
            createdAt: now,
            updatedAt: now,
          });
        } else {
          setCurrentStore(stores[0]);
        }

        // Test Supabase connection
        console.log('🔄 Testing Supabase connection...');
        const result = await testSupabaseConnection();
        if (result.success) {
          console.log('✅ Supabase is connected and ready!');
        } else {
          console.warn('⚠️ Supabase connection test failed:', result.error);
        }

        setIsReady(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <AppNavigator />
      <StatusBar style="light" />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
