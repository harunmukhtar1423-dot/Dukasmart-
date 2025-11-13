import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../stores/useStore';
import { DashboardStats } from '../../types';
import db from '../../services/database';
import { format, startOfDay, startOfMonth } from 'date-fns';

export default function DashboardScreen() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalDebt: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    todaySales: 0,
    todayRevenue: 0,
    monthSales: 0,
    monthRevenue: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const { products, customers, sales, debts, loadProducts, loadCustomers, loadSales, loadDebts } = useStore();

  const loadStats = async () => {
    try {
      const today = startOfDay(new Date()).toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();

      // Today's sales
      const todaySalesResult = await db.getAllAsync<any>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales WHERE createdAt >= ?',
        [today]
      );

      // Month's sales
      const monthSalesResult = await db.getAllAsync<any>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales WHERE createdAt >= ?',
        [monthStart]
      );

      // Total sales
      const totalSalesResult = await db.getAllAsync<any>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales'
      );

      // Low stock items
      const lowStockResult = await db.getAllAsync<any>(
        'SELECT COUNT(*) as count FROM products WHERE quantity <= reorderLevel'
      );

      // Total debt
      const totalDebtResult = await db.getAllAsync<any>(
        'SELECT COALESCE(SUM(amountRemaining), 0) as total FROM debt_records WHERE status = ?',
        ['active']
      );

      // Calculate profit (simplified - total revenue minus total cost)
      const profitResult = await db.getAllAsync<any>(
        'SELECT COALESCE(SUM((sellingPrice - costPrice) * quantity), 0) as profit FROM products'
      );

      setStats({
        totalSales: totalSalesResult[0]?.count || 0,
        totalRevenue: totalSalesResult[0]?.revenue || 0,
        totalProfit: profitResult[0]?.profit || 0,
        totalDebt: totalDebtResult[0]?.total || 0,
        lowStockItems: lowStockResult[0]?.count || 0,
        totalCustomers: customers.length,
        todaySales: todaySalesResult[0]?.count || 0,
        todayRevenue: todaySalesResult[0]?.revenue || 0,
        monthSales: monthSalesResult[0]?.count || 0,
        monthRevenue: monthSalesResult[0]?.revenue || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProducts(),
        loadCustomers(),
        loadSales(),
        loadDebts(),
      ]);
      await loadStats();
    };
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadProducts(),
      loadCustomers(),
      loadSales(),
      loadDebts(),
    ]);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    prefix = '',
    suffix = ''
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
    prefix?: string;
    suffix?: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>
        {prefix}{typeof value === 'number' ? value.toFixed(2) : value}{suffix}
      </Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome to Dukasmart</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Today Sales"
            value={stats.todaySales}
            icon="cart"
            color="#4CAF50"
          />
          <StatCard
            title="Today Revenue"
            value={stats.todayRevenue}
            icon="currency-usd"
            color="#2196F3"
            prefix="$"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Month Sales"
            value={stats.monthSales}
            icon="chart-line"
            color="#FF9800"
          />
          <StatCard
            title="Month Revenue"
            value={stats.monthRevenue}
            icon="cash-multiple"
            color="#9C27B0"
            prefix="$"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Sales"
            value={stats.totalSales}
            icon="receipt"
            color="#4CAF50"
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon="currency-usd"
            color="#2196F3"
            prefix="$"
          />
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon="account-group"
            color="#FF5722"
          />
          <StatCard
            title="Total Debt"
            value={stats.totalDebt}
            icon="alert-circle"
            color="#F44336"
            prefix="$"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon="package-variant"
            color="#FF9800"
          />
          <StatCard
            title="Total Products"
            value={products.length}
            icon="cube"
            color="#3F51B5"
          />
        </View>
      </View>

      {stats.lowStockItems > 0 && (
        <View style={styles.alertCard}>
          <MaterialCommunityIcons name="alert" size={24} color="#F44336" />
          <Text style={styles.alertText}>
            {stats.lowStockItems} product(s) are low on stock. Please restock soon.
          </Text>
        </View>
      )}
    </ScrollView>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    opacity: 0.9,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  alertCard: {
    backgroundColor: '#FFF3E0',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertText: {
    flex: 1,
    marginLeft: 12,
    color: '#E65100',
    fontSize: 14,
  },
});
