import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface MenuItem {
  title: string;
  icon: string;
  onPress: () => void;
  color: string;
}

export default function MoreScreen() {
  const navigation = useNavigation<any>();

  const menuSections = [
    {
      title: 'Management',
      items: [
        {
          title: 'Suppliers',
          icon: 'truck',
          color: '#2196F3',
          onPress: () => {
            navigation.navigate('Suppliers');
          },
        },
        {
          title: 'Sales Analytics',
          icon: 'chart-bar',
          color: '#4CAF50',
          onPress: () => {
            navigation.navigate('Analytics');
          },
        },
        {
          title: 'Debt Calculator',
          icon: 'account-cash',
          color: '#F44336',
          onPress: () => {
            navigation.navigate('DebtCalculator');
          },
        },
        {
          title: 'Reports',
          icon: 'file-document',
          color: '#009688',
          onPress: () => {
            navigation.navigate('Reports');
          },
        },
      ],
    },
    {
      title: 'Tools',
      items: [
        {
          title: 'Calculator',
          icon: 'calculator',
          color: '#9C27B0',
          onPress: () => {
            navigation.navigate('Calculator');
          },
        },
        {
          title: 'To-Do List',
          icon: 'checkbox-marked-circle',
          color: '#FF9800',
          onPress: () => {
            navigation.navigate('TodoList');
          },
        },
        {
          title: 'Barcode Scanner',
          icon: 'barcode-scan',
          color: '#E91E63',
          onPress: () => {
            navigation.navigate('BarcodeScanner');
          },
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          title: 'Multi-Store',
          icon: 'store-cog',
          color: '#607D8B',
          onPress: () => {
            navigation.navigate('MultiStore');
          },
        },
        {
          title: 'Backup & Restore',
          icon: 'backup-restore',
          color: '#00BCD4',
          onPress: () => {
            navigation.navigate('Backup');
          },
        },
        {
          title: 'About',
          icon: 'information',
          color: '#795548',
          onPress: () => {
            navigation.navigate('About');
          },
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity key={item.title} style={styles.menuItem} onPress={item.onPress}>
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <MaterialCommunityIcons name={item.icon as any} size={28} color="#fff" />
      </View>
      <Text style={styles.menuItemText}>{item.title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView style={styles.content}>
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map(renderMenuItem)}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Dukasmart v1.0.0</Text>
          <Text style={styles.footerSubtext}>Smart Shop Management</Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    fontWeight: 'bold',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
});
