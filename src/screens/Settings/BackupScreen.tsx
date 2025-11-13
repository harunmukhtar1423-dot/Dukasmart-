import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import db from '../../services/database';
import { format } from 'date-fns';

export default function BackupScreen() {
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const exportData = async () => {
    try {
      setLoading(true);

      // Get all data
      const stores = await db.getAllAsync('SELECT * FROM stores');
      const products = await db.getAllAsync('SELECT * FROM products');
      const customers = await db.getAllAsync('SELECT * FROM customers');
      const suppliers = await db.getAllAsync('SELECT * FROM suppliers');
      const sales = await db.getAllAsync('SELECT * FROM sales');
      const debts = await db.getAllAsync('SELECT * FROM debt_records');
      const todos = await db.getAllAsync('SELECT * FROM todo_items');

      const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {
          stores,
          products,
          customers,
          suppliers,
          sales,
          debts,
          todos,
        },
      };

      // Create backup file
      const fileName = `dukasmart_backup_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.json`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2)
      );

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save Backup File',
          UTI: 'public.json',
        });

        setLastBackup(new Date().toISOString());
        Alert.alert('Success', 'Backup created successfully');
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      Alert.alert('Error', 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const showImportInfo = () => {
    Alert.alert(
      'Import Backup',
      'To restore from a backup:\n\n1. Use the file manager to open the backup JSON file\n2. Share it to Dukasmart\n3. Confirm the restoration\n\n⚠️ Warning: This will replace all current data!',
      [{ text: 'OK' }]
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      '⚠️ Warning: This will permanently delete ALL data including products, customers, sales, etc. This action cannot be undone!\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Keep the stores table, delete everything else
              await db.execAsync('DELETE FROM products');
              await db.execAsync('DELETE FROM customers');
              await db.execAsync('DELETE FROM suppliers');
              await db.execAsync('DELETE FROM sales');
              await db.execAsync('DELETE FROM debt_records');
              await db.execAsync('DELETE FROM debt_payments');
              await db.execAsync('DELETE FROM todo_items');

              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Backup & Restore</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="shield-check" size={32} color="#4CAF50" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Protect Your Data</Text>
            <Text style={styles.infoText}>
              Regular backups ensure your business data is safe. Export your data to save it externally.
            </Text>
          </View>
        </View>

        {lastBackup && (
          <View style={styles.lastBackupCard}>
            <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
            <Text style={styles.lastBackupText}>
              Last backup: {format(new Date(lastBackup), 'MMM dd, yyyy hh:mm a')}
            </Text>
          </View>
        )}

        {/* Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Export Data</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={exportData}
            disabled={loading}
          >
            <View style={styles.actionIcon}>
              {loading ? (
                <ActivityIndicator size="small" color="#6200ee" />
              ) : (
                <MaterialCommunityIcons name="download" size={32} color="#6200ee" />
              )}
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Export Backup</Text>
              <Text style={styles.actionDescription}>
                Create a backup file with all your data (products, customers, sales, etc.)
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Import Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Import Data</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={showImportInfo}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="upload" size={32} color="#2196F3" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Import Backup</Text>
              <Text style={styles.actionDescription}>
                Restore your data from a previously exported backup file
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Cloud Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloud Sync (Coming Soon)</Text>
          <View style={[styles.actionCard, styles.comingSoon]}>
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="cloud-sync" size={32} color="#999" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: '#999' }]}>Auto Backup to Cloud</Text>
              <Text style={[styles.actionDescription, { color: '#999' }]}>
                Automatically sync your data to cloud storage (Google Drive, Dropbox)
              </Text>
            </View>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>SOON</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#F44336' }]}>Danger Zone</Text>
          <TouchableOpacity
            style={[styles.actionCard, styles.dangerCard]}
            onPress={clearAllData}
            disabled={loading}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="delete-forever" size={32} color="#F44336" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: '#F44336' }]}>Clear All Data</Text>
              <Text style={styles.actionDescription}>
                Permanently delete all data. This cannot be undone!
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.tipCard}>
          <MaterialCommunityIcons name="lightbulb" size={24} color="#FF9800" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>💡 Backup Tips</Text>
            <Text style={styles.tipText}>• Create backups regularly (weekly recommended)</Text>
            <Text style={styles.tipText}>• Store backups in multiple locations</Text>
            <Text style={styles.tipText}>• Test your backups by restoring them</Text>
            <Text style={styles.tipText}>• Keep at least 3 recent backups</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#388E3C',
  },
  lastBackupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  lastBackupText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
  comingSoon: {
    opacity: 0.6,
  },
  comingSoonBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dangerCard: {
    borderWidth: 1,
    borderColor: '#FFEBEE',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    gap: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#F57C00',
    marginBottom: 4,
  },
});
