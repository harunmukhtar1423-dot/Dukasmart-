import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../stores/useStore';
import { Product, Customer, SaleItem } from '../../types';

export default function POSScreen() {
  const {
    products,
    customers,
    cart,
    currentStore,
    loadProducts,
    loadCustomers,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    addSale,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile' | 'credit'>('cash');
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    if (product.quantity <= 0) {
      Alert.alert('Out of Stock', 'This product is currently out of stock.');
      return;
    }

    const cartItem: SaleItem = {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.sellingPrice,
      total: product.sellingPrice,
    };

    addToCart(cartItem);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to the cart before checkout.');
      return;
    }

    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || 0;

    if (paymentMethod !== 'credit' && paid < total) {
      Alert.alert('Insufficient Payment', 'Amount paid is less than the total.');
      return;
    }

    try {
      let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'paid';
      if (paymentMethod === 'credit') {
        paymentStatus = paid === 0 ? 'unpaid' : paid < total ? 'partial' : 'paid';
      }

      await addSale({
        customerId: selectedCustomer?.id,
        storeId: currentStore?.id || 'default-store',
        items: cart,
        subtotal: total,
        tax: 0,
        discount: 0,
        total: total,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        amountPaid: paid,
        amountDue: total - paid,
      });

      Alert.alert(
        'Success',
        `Sale completed successfully!\n${paymentMethod !== 'credit' && paid > total ? `Change: $${(paid - total).toFixed(2)}` : ''}`,
        [
          {
            text: 'OK',
            onPress: () => {
              clearCart();
              setSelectedCustomer(null);
              setAmountPaid('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete sale. Please try again.');
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleAddToCart(item)}
    >
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productSku}>SKU: {item.sku}</Text>
        <Text style={styles.productPrice}>${item.sellingPrice.toFixed(2)}</Text>
      </View>
      <View style={styles.productStock}>
        <Text style={[styles.stockText, item.quantity <= item.reorderLevel && styles.lowStock]}>
          Stock: {item.quantity}
        </Text>
        <MaterialCommunityIcons name="plus-circle" size={32} color="#6200ee" />
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: SaleItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.productName}</Text>
        <Text style={styles.cartItemPrice}>${item.unitPrice.toFixed(2)} x {item.quantity}</Text>
      </View>
      <View style={styles.cartItemActions}>
        <TouchableOpacity
          onPress={() => {
            if (item.quantity > 1) {
              updateCartItem(item.productId, item.quantity - 1);
            } else {
              removeFromCart(item.productId);
            }
          }}
        >
          <MaterialCommunityIcons name="minus-circle" size={24} color="#F44336" />
        </TouchableOpacity>
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <TouchableOpacity
          onPress={() => updateCartItem(item.productId, item.quantity + 1)}
        >
          <MaterialCommunityIcons name="plus-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.cartItemTotal}>${item.total.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Point of Sale</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.leftPanel}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productList}
          />
        </View>

        <View style={styles.rightPanel}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Current Sale</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={clearCart}>
                <MaterialCommunityIcons name="delete" size={24} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.customerSelector}
            onPress={() => setShowCustomerModal(true)}
          >
            <MaterialCommunityIcons name="account" size={24} color="#666" />
            <Text style={styles.customerText}>
              {selectedCustomer ? selectedCustomer.name : 'Select Customer (Optional)'}
            </Text>
          </TouchableOpacity>

          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.productId}
            contentContainerStyle={styles.cartList}
            ListEmptyComponent={
              <View style={styles.emptyCart}>
                <MaterialCommunityIcons name="cart-outline" size={64} color="#ccc" />
                <Text style={styles.emptyCartText}>Cart is empty</Text>
              </View>
            }
          />

          <View style={styles.paymentSection}>
            <Text style={styles.paymentLabel}>Payment Method:</Text>
            <View style={styles.paymentMethods}>
              {['cash', 'card', 'mobile', 'credit'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod(method as any)}
                >
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method && styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.amountInput}
              placeholder="Amount Paid"
              keyboardType="numeric"
              value={amountPaid}
              onChangeText={setAmountPaid}
            />

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, cart.length === 0 && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={cart.length === 0}
            >
              <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
              <Text style={styles.checkoutButtonText}>Complete Sale</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal visible={showCustomerModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Customer</Text>
            <FlatList
              data={customers}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.customerItem}
                  onPress={() => {
                    setSelectedCustomer(item);
                    setShowCustomerModal(false);
                  }}
                >
                  <Text style={styles.customerName}>{item.name}</Text>
                  <Text style={styles.customerPhone}>{item.phone}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCustomerModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 2,
    padding: 16,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  productList: {
    paddingBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productSku: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 4,
  },
  productStock: {
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },
  lowStock: {
    color: '#F44336',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  customerText: {
    marginLeft: 8,
    color: '#666',
  },
  cartList: {
    flexGrow: 1,
  },
  cartItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cartItemInfo: {
    marginBottom: 8,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
    marginLeft: 'auto',
  },
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCartText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
  paymentSection: {
    marginTop: 16,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  paymentMethod: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  paymentMethodActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#666',
  },
  paymentMethodTextActive: {
    color: '#fff',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  checkoutButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  customerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
