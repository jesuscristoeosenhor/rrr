# 🏐 Complete Sports Court Booking System

A comprehensive, enterprise-ready sports court booking and management system built with modern web technologies. This system provides complete management capabilities for sports facilities, including unit management, court scheduling, user management, payments, and analytics.

## 🚀 Features

### 🔐 Authentication & Security
- **Role-based Access Control**: Admin, Manager, Instructor, Student, Receptionist roles
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Advanced Security**: Password hashing, rate limiting, account lockout protection
- **Permission Management**: Granular permissions for different user types
- **Security Monitoring**: Login attempt tracking and security event logging

### 🏢 Unit Management
- **Complete CRUD Operations**: Create, read, update, delete sports units
- **Location Management**: Address, coordinates, and contact information
- **Operating Hours**: Configurable operating hours per day
- **Image Gallery**: Multiple images per unit with upload support
- **Equipment Tracking**: Detailed equipment and facility management
- **Online Booking**: Configurable online booking settings

### 🎾 Court Management
- **Multi-Sport Support**: Futevôlei, Volleyball, Beach Tennis, Futsal
- **Dynamic Pricing**: Time-based pricing with promotional rates
- **Equipment Management**: Detailed equipment tracking per court
- **Status Management**: Available, Occupied, Maintenance, Unavailable
- **Capacity Control**: Maximum players per court
- **Court Images**: Photo galleries for each court

### 📅 Interactive Booking System
- **Calendar Views**: Day, week, and month calendar views
- **Real-time Availability**: Live availability checking and updates
- **Booking Management**: Create, modify, cancel bookings
- **Participant Management**: Add/remove participants, track attendance
- **Recurring Bookings**: Support for recurring/repeating bookings
- **Check-in/Check-out**: Digital check-in system with timestamps
- **Conflict Resolution**: Automatic conflict detection and prevention

### 👥 User Management
- **Comprehensive Profiles**: Detailed user profiles with preferences
- **Bulk Operations**: Import/export users, bulk status changes
- **Activity Tracking**: Login history, booking history, activity logs
- **Permission Control**: Granular permission assignment
- **User Statistics**: Usage analytics and behavior tracking
- **Profile Customization**: Avatar upload, personal settings

### 💳 Payment Processing
- **Multiple Payment Methods**: PIX, Credit Card, Debit Card, Bank Transfer, Cash
- **Payment Tracking**: Real-time payment status monitoring
- **Refund Processing**: Automated refund handling
- **Transaction History**: Complete payment history and receipts
- **Payment Validation**: Card validation, CPF validation, security checks
- **Webhook Support**: Payment gateway webhook processing

### 🔔 Enhanced Notification System
- **Multi-Channel**: App notifications, Email, SMS, Push notifications
- **Priority-Based**: Urgent, High, Medium, Low priority messaging
- **Automated Reminders**: Booking reminders, payment notifications
- **Real-time Updates**: Live status updates and alerts
- **Custom Templates**: Customizable notification templates
- **Notification History**: Complete notification audit trail

### 📊 Analytics & Reporting
- **Real-time Dashboard**: Live KPIs and performance metrics
- **Revenue Analytics**: Detailed revenue tracking and trends
- **Occupancy Reports**: Court utilization and occupancy rates
- **User Analytics**: User behavior and engagement metrics
- **Performance Metrics**: System performance and response times
- **Export Capabilities**: CSV, PDF, Excel export options

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, fully responsive layout
- **Dark/Light Theme**: User preference-based theme switching
- **Accessibility**: WCAG 2.1 AA compliance
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: User-friendly error messages and recovery
- **Performance Optimized**: Code splitting, lazy loading, caching

## 🛠️ Technology Stack

### Frontend
- **React 18**: Latest React with concurrent features
- **TypeScript**: Full type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **Lucide React**: Beautiful, customizable icons

### State Management  
- **Context API**: React's built-in state management
- **Custom Hooks**: Reusable state logic
- **Local Storage**: Persistent client-side storage
- **React Query**: Server state management (ready for integration)

### Authentication & Security
- **JWT Tokens**: JSON Web Tokens with refresh token support
- **bcrypt**: Password hashing and encryption
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive input sanitization
- **Security Headers**: XSS protection, CSRF protection

### Performance & Optimization
- **Code Splitting**: Dynamic imports and lazy loading
- **Memoization**: React.memo, useMemo, useCallback
- **Virtual Scrolling**: Efficient rendering of large lists
- **Image Optimization**: Lazy loading, compression
- **Bundle Analysis**: Performance monitoring and optimization

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- npm 8.0 or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/sports-booking-system.git

# Navigate to project directory
cd sports-booking-system

# Install dependencies
npm install

# Start development server
npm run dev
```

### Default Login Credentials
- **Admin**: admin@futevolei.com / admin123
- **Manager**: gestor@futevolei.com / gestor123

### Build for Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (Button, Modal, etc.)
│   ├── layout/          # Layout components (Header, Sidebar)
│   └── forms/           # Form components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx  # Authentication context
│   ├── ThemeContext.tsx # Theme management
│   └── NotificationContext.tsx # Notification system
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useStorage.ts    # Local storage hook
│   └── useDebounce.ts   # Debounce hook
├── pages/               # Page components
│   ├── BookingCalendarPage.tsx  # Booking calendar
│   ├── CourtsPage.tsx           # Court management
│   ├── UnitsPage.tsx            # Unit management
│   ├── UserManagementPage.tsx   # User management
│   └── EnhancedDashboard.tsx    # Analytics dashboard
├── services/            # API and business logic
│   ├── authService.ts   # Authentication service
│   ├── paymentService.ts # Payment processing
│   └── securityService.ts # Security utilities
├── types/               # TypeScript type definitions
│   └── index.ts         # Main type definitions
├── utils/               # Utility functions
│   ├── helpers.ts       # General helpers
│   ├── validation.ts    # Input validation
│   └── performance.ts   # Performance utilities
└── constants/           # Application constants
    └── mockData.ts      # Mock data for development
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Sports Booking System
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_PAYMENT_GATEWAY_URL=https://sandbox.payments.com
```

### Customization
- **Branding**: Update colors and logos in `tailwind.config.js`
- **Features**: Enable/disable features in configuration files
- **Payment**: Configure payment methods in `paymentService.ts`
- **Notifications**: Setup notification channels in configuration

## 📚 Documentation

- [API Documentation](./docs/API_DOCUMENTATION.md)
- [User Guide](./docs/USER_GUIDE.md)
- [Developer Guide](./docs/DEVELOPER_GUIDE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run visual regression tests
npm run test:visual
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Docker
```bash
# Build Docker image
docker build -t sports-booking-system .

# Run container
docker run -p 3000:3000 sports-booking-system
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Write tests for new features
- Follow the established code style
- Update documentation for changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Team](https://reactjs.org/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Vite](https://vitejs.dev/) for the fast build tool

## 📞 Support

- **Email**: support@example.com
- **Documentation**: [docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/sports-booking-system/issues)

## 🗺️ Roadmap

- [ ] Mobile App (React Native)
- [ ] Advanced Analytics & ML
- [ ] Third-party Integrations
- [ ] Multi-language Support
- [ ] IoT Device Integration
- [ ] Advanced Reporting
- [ ] Multi-tenant Support

---

**Built with ❤️ for sports facilities worldwide**