// EXAMPLE: Inventory Screen with Supabase Integration and Real-time Updates
// This file shows how to integrate Supabase into the Inventory screen
// Copy the relevant parts to your actual InventoryScreen.tsx

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
import { Product } from '../../types';
import supabaseService from '../../services/supabaseService';

export default function InventoryScreenWithSupabase() {
  const { currentStore } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    reorderLevel: '',
  });

  // Load products from Supabase
  useEffect(() => {
    if (currentStore?.id) {
      loadProducts();
      setupRealtimeSubscription();
    }
  }, [currentStore?.id]);

  // 🔄 REAL-TIME SUBSCRIPTION
  const setupRealtimeSubscription = () => {
    if (!currentStore?.id) return;

    console.log('Setting up real-time subscription for products...');

    const subscription = supabaseService.products.subscribe(
      currentStore.id,
      (payload) => {
        console.log('🔔 Product change detected:', payload);

        if (payload.eventType === 'INSERT') {
          // New product added - add to list
          setProducts((prev) => [payload.new, ...prev]);
          Alert.alert('New Product', `${payload.new.name} was added!`);
        } else if (payload.eventType === 'UPDATE') {
          // Product updated - update in list
          setProducts((prev) =>
            prev.map((p) => (p.id === payload.new.id ? payload.new : p))
          );
        } else if (payload.eventType === 'DELETE') {
          // Product deleted - remove from list
          setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      console.log('Unsubscribing from product changes');
      subscription.unsubscribe();
    };
  };

  // 📥 LOAD PRODUCTS FROM SUPABASE
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.products.getAll(currentStore?.id);
      setProducts(data || []);
      console.log(`✅ Loaded ${data?.length || 0} products from Supabase`);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      category: '',
      description: '',
      costPrice: '',
      sellingPrice: '',
      quantity: '',
      reorderLevel: '',
    });
    setEditingProduct(null);
  };

  // ➕ ADD/UPDATE PRODUCT WITH SUPABASE
  const handleSubmit = async () => {
    if (!formData.name || !formData.sellingPrice || !formData.quantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const productData = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        description: formData.description,
        cost_price: parseFloat(formData.costPrice) || 0,
        selling_price: parseFloat(formData.sellingPrice),
        quantity: parseInt(formData.quantity),
        reorder_level: parseInt(formData.reorderLevel) || 10,
        store_id: currentStore?.id,
      };

      if (editingProduct) {
        // UPDATE
        await supabaseService.products.update(editingProduct.id, productData);
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        // CREATE
        await supabaseService.products.create(productData);
        Alert.alert('Success', 'Product added successfully!');
      }

      setShowAddModal(false);
      resetForm();
      // Real-time subscription will automatically update the list!
    } catch (error: any) {
      console.error('Error saving product:', error);
      Alert.alert('Error', error.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku || '',
      category: product.category || '',
      description: product.description || '',
      costPrice: product.costPrice?.toString() || '',
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
      reorderLevel: product.reorderLevel.toString(),
    });
    setShowAddModal(true);
  };

  // 🗑️ DELETE PRODUCT WITH SUPABASE
  const handleDelete = (product: Product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await supabaseService.products.delete(product.id);
              Alert.alert('Success', 'Product deleted successfully!');
              // Real-time subscription will automatically update the list!
            } catch (error: any) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', error.message || 'Failed to delete product');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDetails}>SKU: {item.sku || 'N/A'}</Text>
        <Text style={styles.productDetails}>Category: {item.category || 'N/A'}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>Cost: ${item.costPrice?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.price}>Price: ${item.sellingPrice.toFixed(2)}</Text>
        </View>
        <Text
          style={[
            styles.stock,
            item.quantity <= item.reorderLevel && styles.lowStock,
          ]}
        >
          Stock: {item.quantity} {item.quantity <= item.reorderLevel && '⚠️'}
        </Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
          <MaterialCommunityIcons name="pencil" size={20} color="#2196F3" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
          <MaterialCommunityIcons name="delete" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory (Supabase)</Text>
        <View style={styles.headerActions}>
          {/* Cloud Sync Indicator */}
          <View style={styles.syncIndicator}>
            <MaterialCommunityIcons name="cloud-check" size={20} color="#4CAF50" />
            <Text style={styles.syncText}>Live</Text>
          </View>
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
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={loadProducts}>
          <MaterialCommunityIcons name="refresh" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Syncing with cloud...</Text>
        </View>
      )}

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No products found</Text>
            <Text style={styles.emptySubtext}>Add your first product to get started</Text>
          </View>
        }
      />

      {/* Modal remains the same */}
      <Modal visible={showAddModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Product Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="SKU"
              value={formData.sku}
              onChangeText={(text) => setFormData({ ...formData, sku: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Category"
              value={formData.category}
              onChangeText={(text) => setFormData({ ...formData, category: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Cost Price"
              keyboardType="numeric"
              value={formData.costPrice}
              onChangeText={(text) => setFormData({ ...formData, costPrice: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Selling Price *"
              keyboardType="numeric"
              value={formData.sellingPrice}
              onChangeText={(text) => setFormData({ ...formData, sellingPrice: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity *"
              keyboardType="numeric"
              value={formData.quantity}
              onChangeText={(text) => setFormData({ ...formData, quantity: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Reorder Level"
              keyboardType="numeric"
              value={formData.reorderLevel}
              onChangeText={(text) => setFormData({ ...formData, reorderLevel: text })}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles remain the same as original InventoryScreen.tsx, plus these additions:
const styles = StyleSheet.create({
  // ... all existing styles from InventoryScreen.tsx ...
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  // NEW: Cloud sync indicator
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  syncText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // NEW: Loading overlay
  loadingOverlay: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: 'bold',
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
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  stock: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontWeight: 'bold',
  },
  lowStock: {
    color: '#F44336',
  },
  productActions: {
    justifyContent: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 8,
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
