export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bad_habits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          cost_per_occurrence: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          cost_per_occurrence: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          cost_per_occurrence?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bad_habits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_tracking: {
        Row: {
          id: string
          habit_id: string
          date: string
          avoided: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          date: string
          avoided?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          date?: string
          avoided?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_tracking_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "bad_habits"
            referencedColumns: ["id"]
          }
        ]
      }
      budget_categories: {
        Row: {
          created_at: string
          id: string
          monthly_limit: number
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          monthly_limit: number
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          monthly_limit?: number
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      financial_summaries: {
        Row: {
          id: string
          user_id: string
          current_balance: number
          monthly_income: number
          total_investments: number
          total_expenses: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_balance?: number
          monthly_income?: number
          total_investments?: number
          total_expenses?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_balance?: number
          monthly_income?: number
          total_investments?: number
          total_expenses?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      savings_goals: {
        Row: {
          created_at: string
          current_amount: number | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          type: string
          user_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type: string
          user_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          type?: string
          user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          created_at: string
          currency: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          email: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_habit_savings: {
        Args: {
          habit_uuid: string
          start_date: string
          end_date: string
        }
        Returns: number
      }
      calculate_total_savings: {
        Args: {
          user_uuid: string
          start_date: string
          end_date: string
        }
        Returns: number
      }
      get_habit_statistics: {
        Args: {
          habit_uuid: string
          start_date: string
          end_date: string
        }
        Returns: {
          date: string
          avoided: boolean
          savings: number
        }[]
      }
      get_habit_streak: {
        Args: {
          habit_uuid: string
        }
        Returns: number
      }
      update_user_financial_summary: {
        Args: {
          user_uuid: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}