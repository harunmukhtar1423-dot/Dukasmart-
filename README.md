# Dukasmart - Smart Shop Management System

A comprehensive mobile application for managing small to medium-sized retail shops, built with React Native and Expo.

## Features

### Core Features
- **Dashboard** - Real-time analytics and business insights
  - Today's sales and revenue
  - Monthly performance tracking
  - Low stock alerts
  - Total debt tracking
  - Customer and product statistics

- **Point of Sale (POS)** - Complete sales management
  - Quick product search and selection
  - Shopping cart with quantity management
  - Multiple payment methods (Cash, Card, Mobile, Credit)
  - Customer selection for tracking purchases
  - Automatic inventory updates
  - Debt tracking for credit sales

- **Inventory Management** - Full product control
  - Add, edit, and delete products
  - Track stock levels
  - Low stock alerts
  - Product categorization
  - SKU management
  - Cost and selling price tracking

- **Customer Management** - Customer relationship management
  - Customer database
  - Contact information (phone, email, address)
  - Purchase history tracking
  - Debt tracking per customer
  - WhatsApp integration for quick messaging
  - Direct call functionality

### Additional Features
- **Supplier Management** - Track and manage suppliers
  - Complete supplier database with CRUD operations
  - Contact information and company details
  - WhatsApp, call, and email integration

- **Sales Analytics** - Detailed sales reports and charts
  - Interactive charts (Line, Bar, Pie charts)
  - Sales trends over 7, 30, or 90 days
  - Revenue analysis and tracking
  - Top selling products
  - Category distribution

- **Debt Calculator** - Calculate and manage customer debts
  - Track all customer debts
  - Record debt payments
  - Multiple payment methods
  - Debt status tracking (active, paid, overdue)
  - Automatic customer debt updates

- **Todo List** - Task management for daily operations
  - Create and manage tasks
  - Priority levels (low, medium, high)
  - Due dates and completion tracking
  - Filter by status

- **Calculator** - Built-in calculator tool
  - Full-featured calculator
  - Basic operations (+, -, ×, ÷, %)
  - Clean interface for quick calculations

- **Barcode Scanner** - Product scanning functionality
  - Scan product barcodes
  - Quick product lookup
  - Camera permission handling

- **Multi-store Support** - Manage multiple store locations
  - Switch between stores
  - Store-specific data isolation
  - Store management (add, edit, delete)
  - Multi-currency support

- **Backup & Restore** - Data backup and export
  - Export all data to JSON
  - Share backups via any app
  - Import from backup (info provided)
  - Clear data functionality

- **Advanced Reporting** - Comprehensive business reports
  - Sales reports
  - Inventory reports
  - Customer reports
  - Financial reports
  - Export as text files

- **Receipt Printing/Sharing** - Professional receipts
  - Generate PDF receipts
  - Print receipts
  - Share via email, messaging apps
  - Detailed transaction information

## Technology Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **State Management:** Zustand
- **Database:** SQLite (expo-sqlite)
- **UI Components:** React Native Paper
- **Icons:** Expo Vector Icons (Material Community Icons)
- **Charts:** React Native Chart Kit

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (optional, will be installed automatically)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Dukasmart-
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - **Android:** Press `a` or scan the QR code with Expo Go app
   - **iOS:** Press `i` or scan the QR code with Camera app (requires macOS)
   - **Web:** Press `w` to open in browser

## Project Structure

```
Dukasmart-/
├── src/
│   ├── components/        # Reusable components
│   │   ├── common/       # Common UI components
│   │   └── forms/        # Form components
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/          # Application screens
│   │   ├── Dashboard/    # Dashboard screen
│   │   ├── POS/          # Point of Sale screen
│   │   ├── Inventory/    # Inventory management
│   │   ├── Customers/    # Customer management
│   │   ├── Suppliers/    # Supplier management
│   │   ├── Analytics/    # Sales analytics
│   │   ├── Settings/     # Settings and More screen
│   │   ├── DebtCalculator/ # Debt calculator
│   │   └── TodoList/     # Todo list
│   ├── services/         # Business logic and services
│   │   └── database.ts   # SQLite database configuration
│   ├── stores/           # Zustand state management
│   │   └── useStore.ts   # Main application store
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   └── constants/        # App constants
├── App.tsx               # Main application component
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## Database Schema

The application uses SQLite for local data storage with the following tables:

- **stores** - Store information
- **products** - Product inventory
- **customers** - Customer data
- **suppliers** - Supplier information
- **sales** - Sales transactions
- **debt_records** - Debt tracking
- **debt_payments** - Debt payment history
- **todo_items** - Todo tasks

## Usage Guide

### Adding Products
1. Navigate to Inventory tab
2. Tap the "+" button
3. Fill in product details (name, price, quantity, etc.)
4. Tap "Add Product"

### Making a Sale
1. Navigate to POS tab
2. Search and select products
3. Adjust quantities as needed
4. (Optional) Select a customer
5. Choose payment method
6. Enter amount paid
7. Complete sale

### Managing Customers
1. Navigate to Customers tab
2. Tap "+" to add new customer
3. Fill in customer details
4. Use WhatsApp or Call icons to contact customers
5. Track debt and purchase history

## Features Breakdown

### Dashboard Statistics
- Total sales count and revenue
- Today's performance
- Monthly performance
- Customer count
- Debt overview
- Low stock warnings

### POS System
- Fast product search
- Real-time cart management
- Multiple payment methods
- Credit sales with automatic debt tracking
- Receipt generation (planned)
- Inventory auto-deduction

### Inventory Control
- Quick product search
- Stock level monitoring
- Low stock alerts
- Product categorization
- Price management
- Multi-variant support (planned)

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run web` - Run in web browser

### Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## Roadmap

### Version 2.0 (Current) ✅
- [x] Supplier management screen
- [x] Sales analytics with charts
- [x] Debt calculator tool
- [x] Todo list functionality
- [x] Built-in calculator
- [x] Receipt printing/sharing
- [x] Barcode scanning
- [x] Multi-currency support (via multi-store)
- [x] Export data (JSON, TXT reports)
- [x] Advanced reporting
- [x] Multi-store management
- [x] Backup & restore functionality

### Version 2.1 (Planned)
- [ ] Cloud sync (Google Drive, Dropbox)
- [ ] Offline-first with auto-sync
- [ ] Enhanced receipt templates
- [ ] Product variants support
- [ ] Purchase orders management

### Version 3.0 (Future)
- [ ] User roles and permissions
- [ ] Email integration
- [ ] Advanced analytics with AI insights
- [ ] Predictive stock management
- [ ] Customer loyalty programs
- [ ] Online store integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, email support@dukasmart.com or create an issue in the repository.

## Acknowledgments

- Built with Expo and React Native
- UI inspired by Material Design
- Icons by Material Community Icons

---

**Dukasmart** - Empowering small businesses with smart technology
