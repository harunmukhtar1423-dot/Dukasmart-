import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useStore } from '../../stores/useStore';
import db from '../../services/database';
import { format, subDays, startOfDay } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
  labels: string[];
  datasets: Array<{ data: number[] }>;
}

export default function AnalyticsScreen() {
  const { sales, products, loadSales, loadProducts } = useStore();
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days'>('7days');
  const [salesData, setSalesData] = useState<ChartData>({ labels: [], datasets: [{ data: [] }] });
  const [revenueData, setRevenueData] = useState<ChartData>({ labels: [], datasets: [{ data: [] }] });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    await loadSales();
    await loadProducts();

    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: startOfDay(date).toISOString(),
        label: format(date, 'MM/dd'),
      };
    });

    // Get sales by date
    const salesByDate = await Promise.all(
      dateRange.map(async ({ date }) => {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        const result = await db.getAllAsync<any>(
          'SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as revenue FROM sales WHERE createdAt >= ? AND createdAt < ?',
          [date, nextDay.toISOString()]
        );

        return {
          count: result[0]?.count || 0,
          revenue: result[0]?.revenue || 0,
        };
      })
    );

    // Set chart data
    setSalesData({
      labels: dateRange.map((d) => d.label),
      datasets: [{ data: salesByDate.map((s) => s.count) }],
    });

    setRevenueData({
      labels: dateRange.map((d) => d.label),
      datasets: [{ data: salesByDate.map((s) => s.revenue) }],
    });

    // Get top selling products
    const topProductsResult = await db.getAllAsync<any>(
      `SELECT p.name, COUNT(*) as sales_count, SUM(p.sellingPrice) as revenue
       FROM products p
       INNER JOIN sales s ON json_extract(s.items, '$[*].productId') LIKE '%' || p.id || '%'
       GROUP BY p.id
       ORDER BY sales_count DESC
       LIMIT 5`
    );
    setTopProducts(topProductsResult);

    // Get sales by category
    const categoryResult = await db.getAllAsync<any>(
      `SELECT category, COUNT(*) as count
       FROM products
       WHERE category IS NOT NULL AND category != ''
       GROUP BY category
       ORDER BY count DESC
       LIMIT 5`
    );

    const colors = ['#6200ee', '#03DAC6', '#FF9800', '#E91E63', '#4CAF50'];
    const categoryChartData = categoryResult.map((item, index) => ({
      name: item.category,
      count: item.count,
      color: colors[index % colors.length],
      legendFontColor: '#333',
      legendFontSize: 12,
    }));
    setCategoryData(categoryChartData);
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#6200ee',
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sales Analytics</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={[styles.timeButton, timeRange === '7days' && styles.timeButtonActive]}
          onPress={() => setTimeRange('7days')}
        >
          <Text style={[styles.timeButtonText, timeRange === '7days' && styles.timeButtonTextActive]}>
            7 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeButton, timeRange === '30days' && styles.timeButtonActive]}
          onPress={() => setTimeRange('30days')}
        >
          <Text style={[styles.timeButtonText, timeRange === '30days' && styles.timeButtonTextActive]}>
            30 Days
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timeButton, timeRange === '90days' && styles.timeButtonActive]}
          onPress={() => setTimeRange('90days')}
        >
          <Text style={[styles.timeButtonText, timeRange === '90days' && styles.timeButtonTextActive]}>
            90 Days
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Sales Count Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sales Trend</Text>
          {salesData.datasets[0].data.length > 0 ? (
            <LineChart
              data={salesData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.noDataText}>No data available</Text>
          )}
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          {revenueData.datasets[0].data.length > 0 ? (
            <BarChart
              data={revenueData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel="$"
            />
          ) : (
            <Text style={styles.noDataText}>No data available</Text>
          )}
        </View>

        {/* Category Distribution */}
        {categoryData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Products by Category</Text>
            <PieChart
              data={categoryData}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {/* Top Products */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Selling Products</Text>
          {topProducts.length > 0 ? (
            topProducts.map((product, index) => (
              <View key={index} style={styles.topProductItem}>
                <View style={styles.topProductRank}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View style={styles.topProductInfo}>
                  <Text style={styles.topProductName}>{product.name}</Text>
                  <Text style={styles.topProductStats}>
                    {product.sales_count} sales • ${product.revenue?.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No sales data available</Text>
          )}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="cart" size={32} color="#6200ee" />
            <Text style={styles.metricValue}>{sales.length}</Text>
            <Text style={styles.metricLabel}>Total Sales</Text>
          </View>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="package-variant" size={32} color="#03DAC6" />
            <Text style={styles.metricValue}>{products.length}</Text>
            <Text style={styles.metricLabel}>Total Products</Text>
          </View>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="currency-usd" size={32} color="#4CAF50" />
            <Text style={styles.metricValue}>
              ${sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(0)}
            </Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>
          <View style={styles.metricCard}>
            <MaterialCommunityIcons name="trending-up" size={32} color="#FF9800" />
            <Text style={styles.metricValue}>
              ${sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2) : '0'}
            </Text>
            <Text style={styles.metricLabel}>Avg Sale Value</Text>
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
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  timeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    elevation: 2,
  },
  timeButtonActive: {
    backgroundColor: '#6200ee',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  timeButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 40,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topProductRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6200ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  topProductStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    paddingBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    margin: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});
