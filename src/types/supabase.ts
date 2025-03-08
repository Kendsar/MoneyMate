import { Database } from './database.types';

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export type Investment = Database['public']['Tables']['investments']['Row'];
export type InvestmentInsert = Database['public']['Tables']['investments']['Insert'];
export type InvestmentUpdate = Database['public']['Tables']['investments']['Update'];

export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];
export type SavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert'];
export type SavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update'];

export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row'];
export type BudgetCategoryInsert = Database['public']['Tables']['budget_categories']['Insert'];
export type BudgetCategoryUpdate = Database['public']['Tables']['budget_categories']['Update'];

export type FinancialSummary = Database['public']['Tables']['financial_summaries']['Row'];
export type FinancialSummaryInsert = Database['public']['Tables']['financial_summaries']['Insert'];
export type FinancialSummaryUpdate = Database['public']['Tables']['financial_summaries']['Update'];