# Sports Court Booking System - API Documentation

## System Architecture

### Overview
This is a comprehensive sports court booking system built with React 18, TypeScript, and Tailwind CSS. The system provides complete management capabilities for sports facilities, including unit management, court scheduling, user management, payments, and analytics.

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: Context API, Zustand, React Query
- **Build Tool**: Vite
- **Authentication**: JWT with refresh tokens
- **Storage**: LocalStorage (development), IndexedDB (production ready)
- **Notifications**: Multi-channel (app, email, SMS, push)
- **Payments**: Integrated payment processing (PIX, Credit Card, etc.)

## Core Features

### 1. Authentication & Security
- Role-based access control (Admin, Manager, Instructor, Student, Receptionist)
- JWT authentication with refresh tokens
- Password hashing and encryption
- Rate limiting and account lockout protection
- Security event logging
- Two-factor authentication ready

### 2. Unit Management
- CRUD operations for sports units
- Location management with coordinates
- Operating hours configuration
- Image gallery support
- Equipment and facility tracking
- Online booking configuration

### 3. Court Management
- Multi-sport support (Futevôlei, Volleyball, Beach Tennis, Futsal)
- Dynamic pricing by time slots
- Equipment and capacity management
- Status tracking (Available, Occupied, Maintenance, Unavailable)
- Court-specific configurations

### 4. Booking System
- Interactive calendar with day/week/month views
- Real-time availability checking
- Recurring booking support
- Participant management
- Check-in/check-out system
- Conflict resolution

### 5. User Management
- Comprehensive user profiles
- Permission management
- Activity tracking
- Bulk operations
- User import/export
- Profile customization

### 6. Payment Processing
- Multiple payment methods (PIX, Credit Card, Debit Card, Bank Transfer, Cash)
- Payment status tracking
- Refund processing
- Transaction history
- Payment method validation
- Automatic receipt generation

### 7. Notification System
- Multi-channel notifications (App, Email, SMS, Push)
- Priority-based messaging
- Automated booking reminders
- Real-time status updates
- Custom notification templates

### 8. Analytics & Reporting
- Real-time dashboard with KPIs
- Revenue tracking and trends
- Occupancy analytics
- User activity reports
- Performance metrics
- Export capabilities

## API Endpoints

### Authentication
```typescript
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/register
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Users
```typescript
GET    /api/users                    // List users with filtering
POST   /api/users                    // Create user
GET    /api/users/:id                // Get user details
PUT    /api/users/:id                // Update user
DELETE /api/users/:id                // Delete user
POST   /api/users/:id/reset-password // Reset user password
PUT    /api/users/:id/permissions    // Update permissions
GET    /api/users/:id/activity       // Get user activity
```

### Units
```typescript
GET    /api/units              // List units
POST   /api/units              // Create unit
GET    /api/units/:id          // Get unit details
PUT    /api/units/:id          // Update unit
DELETE /api/units/:id          // Delete unit
POST   /api/units/:id/images   // Upload unit images
GET    /api/units/:id/courts   // Get unit courts
GET    /api/units/:id/stats    // Get unit statistics
```

### Courts
```typescript
GET    /api/courts                    // List courts
POST   /api/courts                    // Create court
GET    /api/courts/:id                // Get court details
PUT    /api/courts/:id                // Update court
DELETE /api/courts/:id                // Delete court
PUT    /api/courts/:id/status         // Update court status
GET    /api/courts/:id/availability   // Get availability
POST   /api/courts/:id/images         // Upload court images
GET    /api/courts/:id/bookings       // Get court bookings
```

### Bookings
```typescript
GET    /api/bookings                     // List bookings
POST   /api/bookings                     // Create booking
GET    /api/bookings/:id                 // Get booking details
PUT    /api/bookings/:id                 // Update booking
DELETE /api/bookings/:id                 // Cancel booking
POST   /api/bookings/:id/check-in        // Check-in to booking
POST   /api/bookings/:id/check-out       // Check-out from booking
GET    /api/bookings/:id/participants    // Get participants
POST   /api/bookings/:id/participants    // Add participant
DELETE /api/bookings/:id/participants/:userId // Remove participant
GET    /api/bookings/calendar            // Calendar view data
GET    /api/bookings/conflicts           // Check for conflicts
```

### Payments
```typescript
GET    /api/payments                 // List payments
POST   /api/payments                 // Process payment
GET    /api/payments/:id             // Get payment details
POST   /api/payments/:id/refund      // Process refund
GET    /api/payments/:id/status      // Check payment status
GET    /api/payments/methods         // Available payment methods
POST   /api/payments/webhooks        // Payment webhook handler
```

### Notifications
```typescript
GET    /api/notifications            // List user notifications
POST   /api/notifications            // Send notification
PUT    /api/notifications/:id/read   // Mark as read
PUT    /api/notifications/read-all   // Mark all as read
DELETE /api/notifications/:id        // Delete notification
DELETE /api/notifications            // Clear all notifications
GET    /api/notifications/settings   // Get notification preferences
PUT    /api/notifications/settings   // Update preferences
```

### Analytics
```typescript
GET /api/analytics/dashboard        // Dashboard metrics
GET /api/analytics/bookings         // Booking analytics
GET /api/analytics/revenue          // Revenue analytics
GET /api/analytics/users            // User analytics
GET /api/analytics/courts           // Court utilization
GET /api/analytics/export           // Export analytics data
```

### Reports
```typescript
GET  /api/reports                   // List available reports
POST /api/reports                   // Generate report
GET  /api/reports/:id               // Get report details
GET  /api/reports/:id/download      // Download report
DELETE /api/reports/:id             // Delete report
```

## Data Models

### User
```typescript
interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha: string; // Hashed
  tipo: 'admin' | 'gestor' | 'professor' | 'aluno' | 'recepcionista';
  unidade?: string;
  telefone?: string;
  avatar?: string;
  ativo: boolean;
  ultimoLogin?: Date;
  configuracoes?: UserSettings;
  permissoes?: Permission[];
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Unit
```typescript
interface Unidade {
  id: string;
  nome: string;
  endereco: Endereco;
  telefone: string;
  email: string;
  responsavel: string;
  horarioFuncionamento: HorarioFuncionamento;
  quadras: Quadra[];
  imagens: string[];
  descricao?: string;
  ativo: boolean;
  configuracoes: UnidadeConfig;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Court
```typescript
interface Quadra {
  id: string;
  numero: number;
  nome: string;
  tipo: 'futevolei' | 'volei' | 'beach-tennis' | 'futsal';
  unidadeId: string;
  status: 'disponivel' | 'ocupada' | 'manutencao' | 'indisponivel';
  capacidade: number;
  preco: PrecoPorHorario;
  equipamentos: string[];
  observacoes?: string;
  imagens: string[];
  dimensoes?: { largura: number; comprimento: number };
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Booking
```typescript
interface Agendamento {
  id: string;
  alunoId: string;
  professorId?: string;
  quadraId: string;
  unidadeId: string;
  data: Date;
  horarioInicio: string;
  horarioFim: string;
  tipo: 'aula' | 'jogo-livre' | 'treino' | 'evento';
  status: 'agendado' | 'confirmado' | 'em-andamento' | 'finalizado' | 'cancelado' | 'nao-compareceu';
  participantes: ParticipanteAgendamento[];
  valor: number;
  metodoPagamento?: 'dinheiro' | 'cartao' | 'pix' | 'plano';
  observacoes?: string;
  avaliacoes?: Avaliacao[];
  recorrencia?: RecorrenciaConfig;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

## Security Considerations

### Authentication
- JWT tokens expire after 24 hours
- Refresh tokens expire after 7 days
- Password requirements: minimum 8 characters, mixed case, numbers, special characters
- Account lockout after 5 failed login attempts
- Rate limiting: 5 login attempts per minute per IP

### Data Protection
- All sensitive data is encrypted at rest
- HTTPS required for all API communications
- Input validation and sanitization
- SQL injection protection
- XSS protection

### Access Control
- Role-based permissions
- Resource-level access control
- API rate limiting
- Request logging and monitoring

## Performance Optimizations

### Frontend
- Code splitting and lazy loading
- Memoization for expensive calculations
- Virtual scrolling for large lists
- Image lazy loading
- Debounced search inputs
- Compressed localStorage

### Backend
- Database indexing
- Query optimization
- Caching strategies
- Connection pooling
- API response compression

### Monitoring
- Performance metrics tracking
- Memory usage monitoring
- Error tracking and logging
- Real-time alerts

## Deployment

### Environment Variables
```bash
VITE_API_URL=https://api.example.com
VITE_PAYMENT_GATEWAY_URL=https://payments.example.com
VITE_NOTIFICATION_SERVICE_URL=https://notifications.example.com
VITE_APP_NAME=Sports Booking System
VITE_APP_VERSION=1.0.0
```

### Build Process
```bash
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # Code linting
npm run type-check     # TypeScript type checking
```

### Production Considerations
- CDN for static assets
- Database migrations
- Backup strategies
- Monitoring and logging
- SSL certificates
- Load balancing

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Service layer testing
- Utility function testing
- Hook testing

### Integration Tests
- API integration testing
- Payment flow testing
- Authentication flow testing
- Booking process testing

### E2E Tests
- Critical user journeys
- Cross-browser testing
- Mobile responsiveness testing
- Performance testing

## Maintenance

### Regular Tasks
- Database cleanup
- Log rotation
- Security updates
- Performance monitoring
- Backup verification

### Monitoring
- Application uptime
- API response times
- Error rates
- User activity
- System resources

## Support

### Documentation
- API documentation (this file)
- User manual
- Admin guide
- Developer guide

### Troubleshooting
- Common issues and solutions
- Error code reference
- Performance optimization guide
- Security best practices

## Future Enhancements

### Planned Features
- Mobile app (React Native)
- Advanced analytics and ML predictions
- Third-party integrations (Google Calendar, etc.)
- Multi-language support
- Advanced reporting
- IoT device integration

### Scalability
- Microservices architecture
- Database sharding
- CDN optimization
- Auto-scaling capabilities
- Multi-tenant support

---

*Last updated: December 2024*
*Version: 1.0.0*