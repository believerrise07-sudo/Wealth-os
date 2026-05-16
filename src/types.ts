export enum Archetype {
  Builder = "Builder",
  Protector = "Protector",
  Optimizer = "Optimizer",
  Explorer = "Explorer"
}

export enum Tab {
  Overview = "Intelligence Suite",
  Expenses = "Capital Outflow",
  AI = "Neural Council",
  Business = "Wealth Engine",
  Profile = "Identity Console",
  Income = "Value Ingress",
  Debt = "Leverage Audit",
  Ventures = "Ventures & Acquisitions",
  Budget = "Allocation Plan",
  NetWorth = "Equity Matrix"
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'personal' | 'business';
  isTaxDeductible?: boolean;
  date: string;
  note?: string;
}

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
}

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  sym: string;
  mode: 'Single' | 'Couples' | 'Business';
  goal: string;
  archetype: Archetype;
  taxRate: number;
  partnerName?: string;
  businessName?: string;
  onboarded: boolean;
}

export interface VentureItem {
  id: string;
  name: string;
  category: string;
  stage: number;
  equityStake: number;
  invested: number;
  currentValue: number;
  tvpi: number;
  irr: number;
  moic: number;
}

export interface UserData {
  income: FinancialItem[];
  expenses: FinancialItem[];
  debts: DebtItem[];
  ventures: VentureItem[];
  budgets: any[];
  assets: any[];
  invoices: any[];
  clients: any[];
  chatHistory: any[];
  profile: UserProfile;
}
