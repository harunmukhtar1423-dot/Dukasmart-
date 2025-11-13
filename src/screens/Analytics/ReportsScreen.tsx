import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import db from '../../services/database';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export default function ReportsScreen() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalCustomers: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalDebt: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const salesResult = await db.getAllAsync<any>(
        'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales'
      );

      const customersResult = await db.getAllAsync<any>('SELECT COUNT(*) as count FROM customers');
      const productsResult = await db.getAllAsync<any>('SELECT COUNT(*) as count FROM products');
      const lowStockResult = await db.getAllAsync<any>(
        'SELECT COUNT(*) as count FROM products WHERE quantity <= reorderLevel'
      );
      const debtResult = await db.getAllAsync<any>(
        'SELECT COALESCE(SUM(amountRemaining), 0) as total FROM debt_records WHERE status = ?',
        ['active']
      );

      setStats({
        totalSales: salesResult[0]?.count || 0,
        totalRevenue: salesResult[0]?.revenue || 0,
        totalProfit: 0, // TODO: Calculate from sales
        totalCustomers: customersResult[0]?.count || 0,
        totalProducts: productsResult[0]?.count || 0,
        lowStockProducts: lowStockResult[0]?.count || 0,
        totalDebt: debtResult[0]?.total || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const generateReport = async (type: 'sales' | 'inventory' | 'customers' | 'financial') => {
    setLoading(true);
    try {
      let reportContent = '';
      const now = new Date();

      switch (type) {
        case 'sales':
          reportContent = await generateSalesReport();
          break;
        case 'inventory':
          reportContent = await generateInventoryReport();
          break;
        case 'customers':
          reportContent = await generateCustomersReport();
          break;
        case 'financial':
          reportContent = await generateFinancialReport();
          break;
      }

      const fileName = `dukasmart_${type}_report_${format(now, 'yyyy-MM-dd')}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, reportContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/plain',
          dialogTitle: 'Share Report',
        });
      }

      Alert.alert('Success', 'Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateSalesReport = async (): Promise<string> => {
    const sales = await db.getAllAsync<any>('SELECT * FROM sales ORDER BY createdAt DESC LIMIT 100');
    const monthStart = startOfMonth(new Date()).toISOString();
    const monthSales = await db.getAllAsync<any>(
      'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales WHERE createdAt >= ?',
      [monthStart]
    );

    let report = '=== SALES REPORT ===\n\n';
    report += `Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}\n\n`;
    report += `Total Sales: ${stats.totalSales}\n`;
    report += `Total Revenue: $${stats.totalRevenue.toFixed(2)}\n`;
    report += `This Month: ${monthSales[0]?.count || 0} sales, $${monthSales[0]?.revenue?.toFixed(2) || '0.00'}\n\n`;
    report += '--- Recent Sales ---\n\n';

    sales.forEach((sale, index) => {
      report += `${index + 1}. ${format(new Date(sale.createdAt), 'MMM dd, yyyy')}\n`;
      report += `   Total: $${sale.total.toFixed(2)} (${sale.paymentStatus})\n`;
      report += `   Payment: ${sale.paymentMethod}\n\n`;
    });

    return report;
  };

  const generateInventoryReport = async (): Promise<string> => {
    const products = await db.getAllAsync<any>('SELECT * FROM products ORDER BY name');
    const categories = await db.getAllAsync<any>(
      'SELECT category, COUNT(*) as count FROM products WHERE category IS NOT NULL GROUP BY category'
    );

    let report = '=== INVENTORY REPORT ===\n\n';
    report += `Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}\n\n`;
    report += `Total Products: ${stats.totalProducts}\n`;
    report += `Low Stock Items: ${stats.lowStockProducts}\n\n`;
    report += '--- Categories ---\n\n';

    categories.forEach((cat) => {
      report += `${cat.category}: ${cat.count} items\n`;
    });

    report += '\n--- Products ---\n\n';

    products.forEach((product, index) => {
      report += `${index + 1}. ${product.name}\n`;
      report += `   SKU: ${product.sku || 'N/A'}\n`;
      report += `   Price: $${product.sellingPrice.toFixed(2)}\n`;
      report += `   Stock: ${product.quantity}`;
      if (product.quantity <= product.reorderLevel) {
        report += ' ⚠️ LOW STOCK';
      }
      report += '\n\n';
    });

    return report;
  };

  const generateCustomersReport = async (): Promise<string> => {
    const customers = await db.getAllAsync<any>('SELECT * FROM customers ORDER BY totalPurchases DESC');

    let report = '=== CUSTOMERS REPORT ===\n\n';
    report += `Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}\n\n`;
    report += `Total Customers: ${stats.totalCustomers}\n`;
    report += `Total Outstanding Debt: $${stats.totalDebt.toFixed(2)}\n\n`;
    report += '--- Customers ---\n\n';

    customers.forEach((customer, index) => {
      report += `${index + 1}. ${customer.name}\n`;
      report += `   Phone: ${customer.phone}\n`;
      report += `   Total Purchases: $${customer.totalPurchases?.toFixed(2) || '0.00'}\n`;
      if (customer.totalDebt > 0) {
        report += `   Debt: $${customer.totalDebt.toFixed(2)} ⚠️\n`;
      }
      report += '\n';
    });

    return report;
  };

  const generateFinancialReport = async (): Promise<string> => {
    const yearStart = startOfYear(new Date()).toISOString();
    const yearSales = await db.getAllAsync<any>(
      'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales WHERE createdAt >= ?',
      [yearStart]
    );

    const monthStart = startOfMonth(new Date()).toISOString();
    const monthSales = await db.getAllAsync<any>(
      'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales WHERE createdAt >= ?',
      [monthStart]
    );

    let report = '=== FINANCIAL REPORT ===\n\n';
    report += `Generated: ${format(new Date(), 'MMM dd, yyyy hh:mm a')}\n\n`;
    report += '--- Year to Date ---\n';
    report += `Sales: ${yearSales[0]?.count || 0}\n`;
    report += `Revenue: $${yearSales[0]?.revenue?.toFixed(2) || '0.00'}\n\n`;
    report += '--- This Month ---\n';
    report += `Sales: ${monthSales[0]?.count || 0}\n`;
    report += `Revenue: $${monthSales[0]?.revenue?.toFixed(2) || '0.00'}\n\n`;
    report += '--- Overall ---\n';
    report += `Total Sales: ${stats.totalSales}\n`;
    report += `Total Revenue: $${stats.totalRevenue.toFixed(2)}\n`;
    report += `Outstanding Debt: $${stats.totalDebt.toFixed(2)}\n`;
    report += `Active Customers: ${stats.totalCustomers}\n`;

    return report;
  };

  const ReportCard = ({
    title,
    description,
    icon,
    color,
    onPress,
  }: {
    title: string;
    description: string;
    icon: string;
    color: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.reportCard} onPress={onPress} disabled={loading}>
      <View style={[styles.reportIcon, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon as any} size={32} color={color} />
      </View>
      <View style={styles.reportContent}>
        <Text style={styles.reportTitle}>{title}</Text>
        <Text style={styles.reportDescription}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="cart" size={24} color="#6200ee" />
            <Text style={styles.statValue}>{stats.totalSales}</Text>
            <Text style={styles.statLabel}>Sales</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="currency-usd" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>${stats.totalRevenue.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="account-group" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.totalCustomers}</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="package-variant" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate Reports</Text>

          <ReportCard
            title="Sales Report"
            description="Detailed sales transactions and revenue analysis"
            icon="chart-line"
            color="#6200ee"
            onPress={() => generateReport('sales')}
          />

          <ReportCard
            title="Inventory Report"
            description="Current stock levels and product details"
            icon="package-variant"
            color="#FF9800"
            onPress={() => generateReport('inventory')}
          />

          <ReportCard
            title="Customers Report"
            description="Customer list with purchase history and debts"
            icon="account-group"
            color="#2196F3"
            onPress={() => generateReport('customers')}
          />

          <ReportCard
            title="Financial Report"
            description="Comprehensive financial summary and metrics"
            icon="chart-bar"
            color="#4CAF50"
            onPress={() => generateReport('financial')}
          />
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={20} color="#6200ee" />
          <Text style={styles.infoText}>
            Reports are generated as text files that you can share via email, messaging apps, or save to your device.
          </Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    paddingTop: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  reportCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  reportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reportContent: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
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
});
