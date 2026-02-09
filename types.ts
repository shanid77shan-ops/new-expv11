export interface Profile {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  name: string;
  category: string;
  date: string;
  totalAmount: number;
  advancePaid: number;
  account: string;
  notes?: string;
  updatedAt?: string;
}

export interface AccountData {
  paid: number;
  limit: number;
  balance: number;
  percent: number;
  transactions: Expense[];
  categories: { name: string; spent: number; count: number }[];
}

export interface CategoryDetail {
  name: string;
  agreed: number;
  paid: number;
  pending: number;
  count: number;
  percent: number;
  shareOfTotal: number;
}

export interface MonthlyGroup {
  id: string;
  label: string;
  totalSpent: number;
  items: Expense[];
}

export interface FormData {
  name: string;
  category: string;
  date: string;
  totalAmount: string;
  advancePaid: string;
  account: string;
  notes: string;
}

export interface TransferData {
  from: string;
  to: string;
  amount: string;
}

export interface Toast {
  message: string;
  type: 'success' | 'error';
}

export interface AIAnalysisResult {
  vendor: string;
  category: string;
  date: string;
  amount: number;
  confidence: number;
}

export interface BankAnalysisResult {
  totalDebits: number;
  totalCredits: number;
  openingBalance: number;
  closingBalance: number;
  statementPeriod: string;
  topTransactions: {
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
  }[];
}

export interface BankAccount {
  id: string;
  name: string;
  institution?: string;
  lastAnalysis?: BankAnalysisResult;
  updatedAt?: string;
}