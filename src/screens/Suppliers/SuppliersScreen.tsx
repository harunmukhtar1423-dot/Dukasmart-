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
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../stores/useStore';
import { Supplier } from '../../types';

export default function SuppliersScreen() {
  const { suppliers, currentStore, loadSuppliers, addSupplier, updateSupplier, deleteSupplier } =
    useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    company: '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      company: '',
    });
    setEditingSupplier(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      Alert.alert('Error', 'Please fill in name and phone number');
      return;
    }

    try {
      const supplierData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        company: formData.company,
        storeId: currentStore?.id || 'default-store',
      };

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierData);
      } else {
        await addSupplier(supplierData);
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      company: supplier.company || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = (supplier: Supplier) => {
    Alert.alert('Delete Supplier', `Are you sure you want to delete ${supplier.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteSupplier(supplier.id),
      },
    ]);
  };

  const handleWhatsApp = (phone: string) => {
    const url = `whatsapp://send?phone=${phone}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed');
        }
      })
      .catch((err) => console.error('Error opening WhatsApp:', err));
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone}`;
    Linking.openURL(url);
  };

  const handleEmail = (email: string) => {
    const url = `mailto:${email}`;
    Linking.openURL(url);
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => (
    <View style={styles.supplierCard}>
      <View style={styles.supplierInfo}>
        <Text style={styles.supplierName}>{item.name}</Text>
        {item.company && <Text style={styles.companyName}>{item.company}</Text>}
        <Text style={styles.supplierDetails}>
          <MaterialCommunityIcons name="phone" size={14} /> {item.phone}
        </Text>
        {item.email && (
          <Text style={styles.supplierDetails}>
            <MaterialCommunityIcons name="email" size={14} /> {item.email}
          </Text>
        )}
        {item.address && (
          <Text style={styles.supplierDetails}>
            <MaterialCommunityIcons name="map-marker" size={14} /> {item.address}
          </Text>
        )}
      </View>
      <View style={styles.supplierActions}>
        <TouchableOpacity onPress={() => handleWhatsApp(item.phone)} style={styles.actionButton}>
          <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleCall(item.phone)} style={styles.actionButton}>
          <MaterialCommunityIcons name="phone" size={24} color="#2196F3" />
        </TouchableOpacity>
        {item.email && (
          <TouchableOpacity onPress={() => handleEmail(item.email!)} style={styles.actionButton}>
            <MaterialCommunityIcons name="email" size={24} color="#FF9800" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
          <MaterialCommunityIcons name="pencil" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
          <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suppliers</Text>
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

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search suppliers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSuppliers}
        renderItem={renderSupplierItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="truck" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No suppliers found</Text>
            <Text style={styles.emptySubtext}>Add your first supplier to get started</Text>
          </View>
        }
      />

      <Modal visible={showAddModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Supplier Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Company Name"
              value={formData.company}
              onChangeText={(text) => setFormData({ ...formData, company: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Address"
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  supplierCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  supplierInfo: {
    marginBottom: 12,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 8,
  },
  supplierDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  supplierActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#ccc',
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
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
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
