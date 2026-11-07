export type ProductType = 'product' | 'service';

export interface Product {
  id: number;
  ref: string;
  name: string;
  cat: string;
  type?: ProductType;
  unit?: string;
  svgKey?: string;
  badgeColor?: string;
  icon?: string;
  visualType?: 'svg' | 'image';
  priceBuy: number;
  priceSell: number;
  stockShelf: number;
  stockReserve: number;
  alertThreshold: number;
  barcode: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  qty: number;
  priceUnit: number;
  discount: number;
}

export type PaymentMethod = 'cash' | 'orange_money' | 'moov_money' | 'wave' | 'card' | 'bank_transfer' | 'credit' | 'split';

export interface SplitPayment {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  items: {
    productId: number;
    name: string;
    qty: number;
    priceUnit: number;
    discount: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  splitPayments?: SplitPayment[];
  received: number;
  change: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierName: string;
  shiftId?: number;
  status: 'completed' | 'cancelled' | 'refunded';
  createdAt: string;
}

export interface Shift {
  id: number;
  cashierName: string;
  startedAt: string;
  endedAt?: string;
  initialAmount: number;
  expectedAmount: number;
  actualAmount?: number;
  difference?: number;
  notes?: string;
  status: 'open' | 'closed';
}

export interface Customer {
  id: string;
  name: string;
  cat: 'B2B' | 'B2C' | 'VIP';
  phone: string;
  email?: string;
  ifu?: string;
  rccm?: string;
  city?: string;
  address?: string;
  balanceDue: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone: string;
  email?: string;
  address?: string;
  balanceDue: number;
}

export interface Expense {
  id: number;
  date: string;
  category: string;
  desc: string;
  beneficiary: string;
  amount: number;
  paymentMode: string;
  cashierName?: string;
}

export interface Credit {
  id: number;
  saleId?: number;
  customerId: string;
  customerName: string;
  phone: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid';
}

export interface Delivery {
  id: number;
  ref: string;
  saleId?: number;
  customerName: string;
  customerPhone: string;
  address: string;
  driver: string;
  vehicle: string;
  departureTime: string;
  packagesCount: string;
  weight: string;
  fee: number;
  status: 'pending' | 'delivering' | 'delivered' | 'cancelled';
}

export type AttendanceStatus = 'Présent' | 'Retard' | 'Absent';

export interface Employee {
  id: string;
  name: string;
  role: string;
  contract: 'CDI' | 'CDD' | 'Stage' | 'Prestation';
  phone: string;
  cnss?: string;
  salaryBase: number;
  hired: string;
  status: 'Actif' | 'Congé' | 'Départ';
  attendance: AttendanceStatus;
  arrivalTime: string;
  advances: number;
}

export interface SalaryAdvance {
  id: number;
  date: string;
  empId: string;
  employeeName: string;
  amount: number;
  reason: string;
  status: 'Validé & Décaissé' | 'En attente';
}

export interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  user: string;
  module: string;
  details: string;
}

export type DocTemplate = 'minimal' | 'corporate' | 'dgi' | 'split' | 'prestige';
export type DocType = 'invoice' | 'proforma' | 'order' | 'delivery';

export interface DocumentLine {
  desc: string;
  unit: string;
  qty: number;
  pu: number;
  remise: number;
  total: number;
  qtyOrdered?: number;
  qtyDelivered?: number;
  qtyRemaining?: number;
}

export interface DocumentModel {
  id: number;
  type: DocType;
  ref: string;
  date: string;
  expiryDate?: string;
  template: DocTemplate;
  client: {
    name: string;
    attn?: string;
    ifu?: string;
    rccm?: string;
    address?: string;
    phone?: string;
  };
  supplier?: {
    name: string;
    contact?: string;
    phone?: string;
    address?: string;
  };
  deliveryInfo?: {
    driver: string;
    vehicle: string;
    departureTime: string;
    destination: string;
    packagesCount: string;
    weight: string;
  };
  items: DocumentLine[];
  applyStamp: boolean;
  paymentTerms: string;
  notes?: string;
}

export interface CompanySettings {
  name: string;
  sigle: string;
  tagline: string;
  ifu: string;
  rccm: string;
  regime: string;
  divisionFiscale: string;
  address: string;
  phone: string;
  email: string;
  ribBank: string;
  ribAccount: string;
  currency: string;
  vatRate: number;
  bicRate: number;
  defaultDocTemplate: DocTemplate;
  logoUrl?: string;
  stampUrl?: string;
  signatureUrl?: string;
  bluetoothPrinterMac?: string;
  bluetoothPrinterName?: string;
}
