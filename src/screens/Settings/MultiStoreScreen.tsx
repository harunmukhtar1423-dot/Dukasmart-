import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../stores/useStore';
import { Store } from '../../types';
import db from '../../services/database';
import { v4 as uuidv4 } from 'uuid';

export default function MultiStoreScreen() {
  const { currentStore, setCurrentStore } = useStore();
  const [stores, setStores] = useState<Store[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    currency: 'USD',
  });

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const result = await db.getAllAsync<Store>('SELECT * FROM stores ORDER BY createdAt DESC');
      setStores(result);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: '',
      currency: 'USD',
    });
    setEditingStore(null);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      Alert.alert('Error', 'Please enter store name');
      return;
    }

    try {
      const now = new Date().toISOString();

      if (editingStore) {
        await db.runAsync(
          `UPDATE stores SET name = ?, address = ?, phone = ?, email = ?, currency = ?, updatedAt = ?
           WHERE id = ?`,
          [formData.name, formData.address, formData.phone, formData.email, formData.currency, now, editingStore.id]
        );
      } else {
        const id = uuidv4();
        await db.runAsync(
          `INSERT INTO stores (id, name, address, phone, email, currency, ownerId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, formData.name, formData.address, formData.phone, formData.email, formData.currency, 'default-owner', now, now]
        );
      }

      setShowAddModal(false);
      resetForm();
      await loadStores();
    } catch (error) {
      Alert.alert('Error', 'Failed to save store');
      console.error(error);
    }
  };

  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address || '',
      phone: store.phone || '',
      email: store.email || '',
      currency: store.currency || 'USD',
    });
    setShowAddModal(true);
  };

  const handleDelete = (store: Store) => {
    if (currentStore?.id === store.id) {
      Alert.alert('Error', 'Cannot delete the currently active store');
      return;
    }

    Alert.alert(
      'Delete Store',
      `Are you sure you want to delete ${store.name}? This will also delete all associated data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete store and all associated data
              await db.runAsync('DELETE FROM stores WHERE id = ?', [store.id]);
              await db.runAsync('DELETE FROM products WHERE storeId = ?', [store.id]);
              await db.runAsync('DELETE FROM customers WHERE storeId = ?', [store.id]);
              await db.runAsync('DELETE FROM suppliers WHERE storeId = ?', [store.id]);
              await db.runAsync('DELETE FROM sales WHERE storeId = ?', [store.id]);
              await db.runAsync('DELETE FROM debt_records WHERE storeId = ?', [store.id]);
              await db.runAsync('DELETE FROM todo_items WHERE storeId = ?', [store.id]);
              await loadStores();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete store');
            }
          },
        },
      ]
    );
  };

  const handleSwitchStore = (store: Store) => {
    Alert.alert(
      'Switch Store',
      `Switch to ${store.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            setCurrentStore(store);
            Alert.alert('Success', `Switched to ${store.name}`);
          },
        },
      ]
    );
  };

  const renderStoreItem = ({ item }: { item: Store }) => (
    <View style={[styles.storeCard, currentStore?.id === item.id && styles.storeCardActive]}>
      <View style={styles.storeHeader}>
        <View style={styles.storeIcon}>
          <MaterialCommunityIcons
            name={currentStore?.id === item.id ? "store-check" : "store"}
            size={32}
            color={currentStore?.id === item.id ? "#6200ee" : "#666"}
          />
        </View>
        <View style={styles.storeInfo}>
          <View style={styles.storeNameRow}>
            <Text style={styles.storeName}>{item.name}</Text>
            {currentStore?.id === item.id && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            )}
          </View>
          {item.address && <Text style={styles.storeDetails}>📍 {item.address}</Text>}
          {item.phone && <Text style={styles.storeDetails}>📞 {item.phone}</Text>}
          {item.email && <Text style={styles.storeDetails}>✉️ {item.email}</Text>}
          <Text style={styles.storeDetails}>💱 {item.currency}</Text>
        </View>
      </View>

      <View style={styles.storeActions}>
        {currentStore?.id !== item.id && (
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => handleSwitchStore(item)}
          >
            <MaterialCommunityIcons name="swap-horizontal" size={20} color="#fff" />
            <Text style={styles.switchButtonText}>Switch</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
          <MaterialCommunityIcons name="pencil" size={20} color="#2196F3" />
        </TouchableOpacity>
        {stores.length > 1 && (
          <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
            <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Multi-Store</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information" size={24} color="#6200ee" />
        <Text style={styles.infoText}>
          Manage multiple store locations. Each store has its own inventory, customers, and sales data.
        </Text>
      </View>

      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="store-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No stores found</Text>
          </View>
        }
      />

      <Modal visible={showAddModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingStore ? 'Edit Store' : 'Add Store'}</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Store Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter store name"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
            />

            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />

            <Text style={styles.inputLabel}>Currency</Text>
            <TextInput
              style={styles.input}
              placeholder="Currency (e.g., USD, EUR)"
              value={formData.currency}
              onChangeText={(text) => setFormData({ ...formData, currency: text.toUpperCase() })}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {editingStore ? 'Update Store' : 'Add Store'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#1565C0',
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  storeCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  storeCardActive: {
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  storeIcon: {
    marginRight: 12,
    justifyContent: 'center',
  },
  storeInfo: {
    flex: 1,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storeDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  storeActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  switchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    padding: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
