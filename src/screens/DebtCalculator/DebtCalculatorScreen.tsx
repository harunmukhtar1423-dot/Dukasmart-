import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../stores/useStore';
import db from '../../services/database';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface DebtWithCustomer {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  amountPaid: number;
  amountRemaining: number;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export default function DebtCalculatorScreen() {
  const { customers, loadCustomers, loadDebts } = useStore();
  const [debts, setDebts] = useState<DebtWithCustomer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<DebtWithCustomer | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paid' | 'overdue'>('all');

  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadCustomers();
    await loadDebtsWithCustomers();
  };

  const loadDebtsWithCustomers = async () => {
    try {
      const result = await db.getAllAsync<any>(
        `SELECT d.*, c.name as customerName
         FROM debt_records d
         INNER JOIN customers c ON d.customerId = c.id
         ORDER BY d.createdAt DESC`
      );
      setDebts(result);
    } catch (error) {
      console.error('Error loading debts:', error);
    }
  };

  const filteredDebts = debts.filter((debt) => {
    if (filterStatus === 'all') return true;
    return debt.status === filterStatus;
  });

  const totalDebt = debts
    .filter((d) => d.status === 'active')
    .reduce((sum, debt) => sum + debt.amountRemaining, 0);

  const handleAddDebt = async () => {
    if (!formData.customerId || !formData.amount) {
      Alert.alert('Error', 'Please fill in customer and amount');
      return;
    }

    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const amount = parseFloat(formData.amount);

      await db.runAsync(
        `INSERT INTO debt_records (id, customerId, storeId, amount, amountPaid,
         amountRemaining, status, dueDate, notes, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          formData.customerId,
          'default-store',
          amount,
          0,
          amount,
          'active',
          formData.dueDate || null,
          formData.notes || '',
          now,
          now,
        ]
      );

      // Update customer total debt
      await db.runAsync(
        'UPDATE customers SET totalDebt = totalDebt + ? WHERE id = ?',
        [amount, formData.customerId]
      );

      setShowAddModal(false);
      setFormData({ customerId: '', amount: '', dueDate: '', notes: '' });
      await loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add debt record');
      console.error(error);
    }
  };

  const handlePayment = async () => {
    if (!selectedDebt || !paymentAmount) {
      Alert.alert('Error', 'Please enter payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > selectedDebt.amountRemaining) {
      Alert.alert('Error', 'Invalid payment amount');
      return;
    }

    try {
      const paymentId = uuidv4();
      const now = new Date().toISOString();
      const newAmountPaid = selectedDebt.amountPaid + amount;
      const newAmountRemaining = selectedDebt.amountRemaining - amount;
      const newStatus = newAmountRemaining === 0 ? 'paid' : 'active';

      // Add payment record
      await db.runAsync(
        `INSERT INTO debt_payments (id, debtRecordId, amount, paymentMethod, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [paymentId, selectedDebt.id, amount, paymentMethod, '', now]
      );

      // Update debt record
      await db.runAsync(
        `UPDATE debt_records SET amountPaid = ?, amountRemaining = ?, status = ?, updatedAt = ?
         WHERE id = ?`,
        [newAmountPaid, newAmountRemaining, newStatus, now, selectedDebt.id]
      );

      // Update customer total debt
      await db.runAsync(
        'UPDATE customers SET totalDebt = totalDebt - ? WHERE id = ?',
        [amount, selectedDebt.customerId]
      );

      setShowPaymentModal(false);
      setSelectedDebt(null);
      setPaymentAmount('');
      await loadData();
      Alert.alert('Success', 'Payment recorded successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to record payment');
      console.error(error);
    }
  };

  const renderDebtItem = ({ item }: { item: DebtWithCustomer }) => (
    <TouchableOpacity
      style={styles.debtCard}
      onPress={() => {
        setSelectedDebt(item);
        setShowPaymentModal(true);
      }}
    >
      <View style={styles.debtHeader}>
        <Text style={styles.customerName}>{item.customerName}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.status === 'paid' ? '#4CAF50' : item.status === 'overdue' ? '#F44336' : '#FF9800' },
          ]}
        >
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.debtDetails}>
        <View style={styles.debtRow}>
          <Text style={styles.debtLabel}>Total Amount:</Text>
          <Text style={styles.debtValue}>${item.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.debtRow}>
          <Text style={styles.debtLabel}>Paid:</Text>
          <Text style={[styles.debtValue, { color: '#4CAF50' }]}>
            ${item.amountPaid.toFixed(2)}
          </Text>
        </View>
        <View style={styles.debtRow}>
          <Text style={styles.debtLabel}>Remaining:</Text>
          <Text style={[styles.debtValue, { color: '#F44336' }]}>
            ${item.amountRemaining.toFixed(2)}
          </Text>
        </View>
        {item.dueDate && (
          <View style={styles.debtRow}>
            <Text style={styles.debtLabel}>Due Date:</Text>
            <Text style={styles.debtValue}>
              {format(new Date(item.dueDate), 'MMM dd, yyyy')}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.debtDate}>
        Created: {format(new Date(item.createdAt), 'MMM dd, yyyy')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Debt Calculator</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="alert-circle" size={32} color="#F44336" />
          <Text style={styles.summaryValue}>${totalDebt.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Active Debt</Text>
        </View>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="account-multiple" size={32} color="#6200ee" />
          <Text style={styles.summaryValue}>
            {debts.filter((d) => d.status === 'active').length}
          </Text>
          <Text style={styles.summaryLabel}>Active Records</Text>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {['all', 'active', 'paid', 'overdue'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
            onPress={() => setFilterStatus(status as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Debt List */}
      <FlatList
        data={filteredDebts}
        renderItem={renderDebtItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="account-cash" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No debt records found</Text>
          </View>
        }
      />

      {/* Add Debt Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Debt Record</Text>

            <Text style={styles.inputLabel}>Customer *</Text>
            <View style={styles.pickerContainer}>
              <TextInput
                style={styles.input}
                placeholder="Select customer..."
                value={customers.find((c) => c.id === formData.customerId)?.name || ''}
                editable={false}
              />
            </View>
            <ScrollView style={styles.customerList}>
              {customers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.customerItem}
                  onPress={() => setFormData({ ...formData, customerId: customer.id })}
                >
                  <Text>{customer.name}</Text>
                  {formData.customerId === customer.id && (
                    <MaterialCommunityIcons name="check" size={20} color="#6200ee" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Amount *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              keyboardType="numeric"
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
            />

            <Text style={styles.inputLabel}>Due Date (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.dueDate}
              onChangeText={(text) => setFormData({ ...formData, dueDate: text })}
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes..."
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddDebt}>
                <Text style={styles.saveButtonText}>Add Debt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Payment</Text>

            {selectedDebt && (
              <>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentInfoLabel}>Customer:</Text>
                  <Text style={styles.paymentInfoValue}>{selectedDebt.customerName}</Text>
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentInfoLabel}>Remaining Debt:</Text>
                  <Text style={[styles.paymentInfoValue, { color: '#F44336', fontWeight: 'bold' }]}>
                    ${selectedDebt.amountRemaining.toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.inputLabel}>Payment Amount *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  keyboardType="numeric"
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                />

                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.paymentMethods}>
                  {['cash', 'card', 'mobile'].map((method) => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        paymentMethod === method && styles.paymentMethodButtonActive,
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
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowPaymentModal(false);
                  setSelectedDebt(null);
                  setPaymentAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlePayment}
              >
                <Text style={styles.saveButtonText}>Record Payment</Text>
              </TouchableOpacity>
            </View>
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#6200ee',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  debtCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  debtDetails: {
    marginBottom: 12,
  },
  debtRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  debtLabel: {
    fontSize: 14,
    color: '#666',
  },
  debtValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  debtDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
  modalOverlay: {
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
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 8,
  },
  customerList: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  customerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  paymentInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentInfoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  paymentMethodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  paymentMethodButtonActive: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#666',
  },
  paymentMethodTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6200ee',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
