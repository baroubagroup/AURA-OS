import Dexie, { type Table } from 'dexie';
import type {
  Product,
  Category,
  Sale,
  Shift,
  Customer,
  Supplier,
  Expense,
  Credit,
  Delivery,
  Employee,
  SalaryAdvance,
  AuditLog,
  DocumentModel,
  CompanySettings
} from '../types';

export interface SyncQueueItem {
  id?: number;
  opId: string;
  action: 'create' | 'update' | 'delete';
  entity: string;
  payload: any;
  status: 'pending' | 'syncing' | 'failed';
  retries: number;
  error?: string;
  createdAt: string;
}

export class AuraPosDatabase extends Dexie {
  products!: Table<Product, number>;
  categories!: Table<Category, string>;
  sales!: Table<Sale, number>;
  shifts!: Table<Shift, number>;
  customers!: Table<Customer, string>;
  suppliers!: Table<Supplier, string>;
  expenses!: Table<Expense, number>;
  credits!: Table<Credit, number>;
  deliveries!: Table<Delivery, number>;
  employees!: Table<Employee, string>;
  salaryAdvances!: Table<SalaryAdvance, number>;
  auditLogs!: Table<AuditLog, number>;
  documents!: Table<DocumentModel, number>;
  settings!: Table<{ key: string; value: any }, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('AuraPosDb');
    this.version(1).stores({
      products: '++id, ref, name, cat, type, barcode, priceSell, stockShelf',
      categories: 'id, name',
      sales: '++id, invoiceNumber, createdAt, status, paymentMethod, shiftId, customerId',
      shifts: '++id, cashierName, startedAt, status',
      customers: 'id, name, cat, phone',
      suppliers: 'id, name, phone',
      expenses: '++id, date, category, amount, paymentMode',
      credits: '++id, customerId, status, dueDate',
      deliveries: '++id, ref, status, driver',
      employees: 'id, name, role, status',
      salaryAdvances: '++id, empId, date',
      auditLogs: '++id, timestamp, action, module',
      documents: '++id, ref, type, date',
      settings: 'key',
      syncQueue: '++id, opId, action, entity, status, createdAt'
    });
  }
}

export const db = new AuraPosDatabase();
