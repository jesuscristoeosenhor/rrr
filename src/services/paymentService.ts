// Simple payment processing service for demonstration
// In production, you would integrate with services like Stripe, PagSeguro, or Mercado Pago

import { Transacao, ApiResponse } from '@/types';
import { generateId } from '@/utils/helpers';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'cash';
  icon: string;
  enabled: boolean;
  processingFee: number; // Percentage
  processingTime: string; // Human readable
}

export interface PaymentRequest {
  amount: number;
  description: string;
  paymentMethod: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
    document?: string;
  };
  agendamentoId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled';
  transactionId?: string;
  pixCode?: string; // For PIX payments
  pixQrCode?: string; // Base64 QR code for PIX
  creditCardInfo?: {
    installments: number;
    installmentAmount: number;
  };
  expiresAt?: Date;
  error?: string;
}

class PaymentService {
  private readonly availablePaymentMethods: PaymentMethod[] = [
    {
      id: 'pix',
      name: 'PIX',
      type: 'pix',
      icon: '📱',
      enabled: true,
      processingFee: 0,
      processingTime: 'Instantâneo'
    },
    {
      id: 'credit_card',
      name: 'Cartão de Crédito',
      type: 'credit_card',
      icon: '💳',
      enabled: true,
      processingFee: 3.49,
      processingTime: '1-2 dias úteis'
    },
    {
      id: 'debit_card',
      name: 'Cartão de Débito',
      type: 'debit_card',
      icon: '💳',
      enabled: true,
      processingFee: 2.79,
      processingTime: 'Instantâneo'
    },
    {
      id: 'bank_transfer',
      name: 'Transferência Bancária',
      type: 'bank_transfer',
      icon: '🏦',
      enabled: true,
      processingFee: 0,
      processingTime: '1-3 dias úteis'
    },
    {
      id: 'cash',
      name: 'Dinheiro',
      type: 'cash',
      icon: '💵',
      enabled: true,
      processingFee: 0,
      processingTime: 'Instantâneo'
    }
  ];

  getPaymentMethods(): PaymentMethod[] {
    return this.availablePaymentMethods.filter(method => method.enabled);
  }

  getPaymentMethod(id: string): PaymentMethod | undefined {
    return this.availablePaymentMethods.find(method => method.id === id);
  }

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const paymentMethod = this.getPaymentMethod(paymentRequest.paymentMethod);
      if (!paymentMethod) {
        return {
          success: false,
          paymentId: '',
          status: 'rejected',
          error: 'Método de pagamento inválido'
        };
      }

      // Validate amount
      if (paymentRequest.amount <= 0) {
        return {
          success: false,
          paymentId: '',
          status: 'rejected',
          error: 'Valor inválido'
        };
      }

      // Validate customer info
      if (!paymentRequest.customerInfo.name || !paymentRequest.customerInfo.email) {
        return {
          success: false,
          paymentId: '',
          status: 'rejected',
          error: 'Informações do cliente incompletas'
        };
      }

      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Simulate different payment flows
      switch (paymentMethod.type) {
        case 'pix':
          return this.processPIXPayment(paymentId, transactionId, paymentRequest);
        
        case 'credit_card':
          return this.processCreditCardPayment(paymentId, transactionId, paymentRequest);
        
        case 'debit_card':
          return this.processDebitCardPayment(paymentId, transactionId, paymentRequest);
        
        case 'bank_transfer':
          return this.processBankTransferPayment(paymentId, transactionId, paymentRequest);
        
        case 'cash':
          return this.processCashPayment(paymentId, transactionId, paymentRequest);
        
        default:
          return {
            success: false,
            paymentId: '',
            status: 'rejected',
            error: 'Método de pagamento não suportado'
          };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        paymentId: '',
        status: 'rejected',
        error: 'Erro interno no processamento do pagamento'
      };
    }
  }

  private async processPIXPayment(paymentId: string, transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    // Generate PIX code (simplified)
    const pixCode = `${request.customerInfo.document || '12345678901'}${request.amount.toFixed(2).replace('.', '')}${Date.now()}`;
    
    // Generate QR Code (base64 placeholder)
    const pixQrCode = btoa(`PIX:${pixCode}:${request.amount}:${request.customerInfo.name}`);

    // PIX has 93% success rate in simulation
    const isSuccess = Math.random() > 0.07;

    return {
      success: isSuccess,
      paymentId,
      status: isSuccess ? 'approved' : 'rejected',
      transactionId: isSuccess ? transactionId : undefined,
      pixCode: isSuccess ? pixCode : undefined,
      pixQrCode: isSuccess ? pixQrCode : undefined,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      error: isSuccess ? undefined : 'Falha na geração do código PIX'
    };
  }

  private async processCreditCardPayment(paymentId: string, transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    // Credit card has 85% success rate in simulation
    const isSuccess = Math.random() > 0.15;

    // Calculate installments (simplified)
    const maxInstallments = Math.min(12, Math.floor(request.amount / 10)); // Min R$10 per installment
    const installments = Math.min(maxInstallments, 1); // Default to 1x for simplicity
    const installmentAmount = request.amount / installments;

    if (isSuccess) {
      return {
        success: true,
        paymentId,
        status: 'approved',
        transactionId,
        creditCardInfo: {
          installments,
          installmentAmount
        }
      };
    } else {
      const errors = [
        'Cartão rejeitado pelo banco',
        'Dados do cartão inválidos',
        'Limite insuficiente',
        'Cartão bloqueado'
      ];
      
      return {
        success: false,
        paymentId,
        status: 'rejected',
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  }

  private async processDebitCardPayment(paymentId: string, transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    // Debit card has 90% success rate in simulation
    const isSuccess = Math.random() > 0.10;

    if (isSuccess) {
      return {
        success: true,
        paymentId,
        status: 'approved',
        transactionId
      };
    } else {
      const errors = [
        'Saldo insuficiente',
        'Cartão rejeitado pelo banco',
        'Dados do cartão inválidos'
      ];
      
      return {
        success: false,
        paymentId,
        status: 'rejected',
        error: errors[Math.floor(Math.random() * errors.length)]
      };
    }
  }

  private async processBankTransferPayment(paymentId: string, transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    // Bank transfer is always pending initially
    return {
      success: true,
      paymentId,
      status: 'pending',
      transactionId,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
    };
  }

  private async processCashPayment(paymentId: string, transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    // Cash payment is always approved (manual confirmation)
    return {
      success: true,
      paymentId,
      status: 'approved',
      transactionId
    };
  }

  async checkPaymentStatus(paymentId: string): Promise<{ status: PaymentResponse['status']; error?: string }> {
    // Simulate API call to check payment status
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate status changes over time
    const random = Math.random();
    if (random > 0.9) {
      return { status: 'rejected', error: 'Pagamento não foi confirmado' };
    } else if (random > 0.1) {
      return { status: 'approved' };
    } else {
      return { status: 'processing' };
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<ApiResponse<any>> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 95% success rate for refunds
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        const refundId = `rfnd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
          success: true,
          data: {
            refundId,
            status: 'approved',
            amount: amount || 0,
            reason: reason || 'Reembolso solicitado',
            processedAt: new Date()
          }
        };
      } else {
        return {
          success: false,
          error: 'Não foi possível processar o reembolso. Tente novamente.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erro interno no processamento do reembolso'
      };
    }
  }

  calculateProcessingFee(amount: number, paymentMethodId: string): number {
    const paymentMethod = this.getPaymentMethod(paymentMethodId);
    if (!paymentMethod) return 0;

    return (amount * paymentMethod.processingFee) / 100;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Simulate webhook processing
  simulateWebhook(paymentId: string, newStatus: PaymentResponse['status']): void {
    // In a real application, this would be handled by your backend
    console.log(`Webhook received: Payment ${paymentId} status changed to ${newStatus}`);
    
    // Trigger custom event for frontend handling
    const event = new CustomEvent('paymentStatusChanged', {
      detail: { paymentId, status: newStatus }
    });
    window.dispatchEvent(event);
  }
}

// Payment utilities
export const PaymentUtils = {
  validateCreditCard: (cardNumber: string): { valid: boolean; brand?: string } => {
    // Remove spaces and non-digits
    const cleanNumber = cardNumber.replace(/\D/g, '');
    
    // Basic Luhn algorithm check
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const valid = sum % 10 === 0 && cleanNumber.length >= 13;
    
    // Detect card brand (simplified)
    let brand;
    if (cleanNumber.startsWith('4')) {
      brand = 'Visa';
    } else if (cleanNumber.startsWith('5') || cleanNumber.startsWith('2')) {
      brand = 'Mastercard';
    } else if (cleanNumber.startsWith('3')) {
      brand = 'American Express';
    } else if (cleanNumber.startsWith('6')) {
      brand = 'Discover';
    }
    
    return { valid, brand };
  },

  formatCardNumber: (cardNumber: string): string => {
    const cleaned = cardNumber.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ').substr(0, 19); // Max 16 digits + 3 spaces
  },

  formatExpiryDate: (expiry: string): string => {
    const cleaned = expiry.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + (cleaned.length > 2 ? '/' + cleaned.substring(2, 4) : '');
    }
    return cleaned;
  },

  validateCVV: (cvv: string): boolean => {
    const cleaned = cvv.replace(/\D/g, '');
    return cleaned.length >= 3 && cleaned.length <= 4;
  },

  validateCPF: (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false; // All same digits
    
    // Validate check digits
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.charAt(10))) return false;
    
    return true;
  },

  formatCPF: (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  formatPhone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  }
};

// Transaction history helper
export const TransactionHistory = {
  getTransactionsByPaymentId: (paymentId: string): Transacao[] => {
    // In a real app, this would fetch from your database
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions.filter((t: Transacao) => t.metadata?.paymentId === paymentId);
  },

  addTransaction: (transaction: Omit<Transacao, 'id' | 'criadoEm' | 'atualizadoEm'>): void => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransaction: Transacao = {
      ...transaction,
      id: generateId(),
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }
};

export const paymentService = new PaymentService();