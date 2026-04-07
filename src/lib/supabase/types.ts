// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_message: string | null
          alert_type: string | null
          assigned_to: string | null
          created_at: string | null
          id: string
          metric_id: string | null
          status: string | null
        }
        Insert: {
          alert_message?: string | null
          alert_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          metric_id?: string | null
          status?: string | null
        }
        Update: {
          alert_message?: string | null
          alert_type?: string | null
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          metric_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'alerts_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alerts_metric_id_fkey'
            columns: ['metric_id']
            isOneToOne: false
            referencedRelation: 'metrics'
            referencedColumns: ['id']
          },
        ]
      }
      audit_log: {
        Row: {
          action: string | null
          description: string | null
          id: string
          timestamp: string | null
          user_id: string | null
          wo_id: string | null
        }
        Insert: {
          action?: string | null
          description?: string | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
          wo_id?: string | null
        }
        Update: {
          action?: string | null
          description?: string | null
          id?: string
          timestamp?: string | null
          user_id?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'audit_log_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'audit_log_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      engineering_accessories: {
        Row: {
          accessories_list_name: string
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          accessories_list_name: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          accessories_list_name?: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'engineering_accessories_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      engineering_boms: {
        Row: {
          bom_name: string
          created_at: string | null
          id: string
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          bom_name: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          bom_name?: string
          created_at?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'engineering_boms_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      engineering_layouts: {
        Row: {
          created_at: string | null
          id: string
          layout_name: string
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          layout_name: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          layout_name?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'engineering_layouts_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      engineering_tasks: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          task_name: string
          task_type: string
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name: string
          task_type: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name?: string
          task_type?: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'engineering_tasks_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      engineering_travelers: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          traveler_name: string
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          traveler_name: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          traveler_name?: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'engineering_travelers_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      metrics: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          metric_name: string
          metric_value: number | null
          threshold_max: number | null
          threshold_min: number | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          metric_name: string
          metric_value?: number | null
          threshold_max?: number | null
          threshold_min?: number | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          threshold_max?: number | null
          threshold_min?: number | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'metrics_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      production_final_assembly: {
        Row: {
          created_at: string | null
          id: string
          station_name: string
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          station_name: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          station_name?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'production_final_assembly_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      production_paint: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          task_name: string
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name?: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'production_paint_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      production_sub_assembly: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          task_name: string
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name?: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'production_sub_assembly_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      production_tests: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          test_name: string
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          test_name: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          test_name?: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'production_tests_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      production_warehouse: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          task_name: string
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name?: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'production_warehouse_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      production_weld_shop: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          task_name: string
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          task_name?: string
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'production_weld_shop_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          product_name: string
          product_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          product_name: string
          product_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          product_name?: string
          product_type?: string | null
        }
        Relationships: []
      }
      purchasing_components: {
        Row: {
          actual_delivery_date: string | null
          component_name: string
          component_type: string
          created_at: string | null
          expected_delivery_date: string | null
          id: string
          order_date: string | null
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          component_name: string
          component_type: string
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          order_date?: string | null
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          component_name?: string
          component_type?: string
          created_at?: string | null
          expected_delivery_date?: string | null
          id?: string
          order_date?: string | null
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'purchasing_components_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      purchasing_expedites: {
        Row: {
          component_type: string
          created_at: string | null
          expedite_date: string | null
          expedite_reason: string | null
          id: string
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          component_type: string
          created_at?: string | null
          expedite_date?: string | null
          expedite_reason?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          component_type?: string
          created_at?: string | null
          expedite_date?: string | null
          expedite_reason?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'purchasing_expedites_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      quotes: {
        Row: {
          approval_date: string | null
          created_at: string | null
          created_by: string | null
          customer_name: string
          expiration_date: string | null
          id: string
          product_type: string | null
          profit_margin_percentage: number | null
          quote_number: string
          quote_value: number | null
          sent_date: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          approval_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name: string
          expiration_date?: string | null
          id?: string
          product_type?: string | null
          profit_margin_percentage?: number | null
          quote_number: string
          quote_value?: number | null
          sent_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          approval_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name?: string
          expiration_date?: string | null
          id?: string
          product_type?: string | null
          profit_margin_percentage?: number | null
          quote_number?: string
          quote_value?: number | null
          sent_date?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'quotes_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          department: string | null
          email: string
          full_name: string
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email: string
          full_name: string
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      warranty_claims: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string
          issue_description: string | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          issue_description?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          issue_description?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'warranty_claims_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      work_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_name: string
          department: string | null
          due_date: string | null
          id: string
          product_type: string | null
          progress: number | null
          quote_id: string | null
          status: string
          updated_at: string | null
          wo_number: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_name: string
          department?: string | null
          due_date?: string | null
          id?: string
          product_type?: string | null
          progress?: number | null
          quote_id?: string | null
          status?: string
          updated_at?: string | null
          wo_number: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_name?: string
          department?: string | null
          due_date?: string | null
          id?: string
          product_type?: string | null
          progress?: number | null
          quote_id?: string | null
          status?: string
          updated_at?: string | null
          wo_number?: string
        }
        Relationships: [
          {
            foreignKeyName: 'work_orders_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'work_orders_quote_id_fkey'
            columns: ['quote_id']
            isOneToOne: false
            referencedRelation: 'quotes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_department: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: alerts
//   id: uuid (not null, default: gen_random_uuid())
//   metric_id: uuid (nullable)
//   alert_type: text (nullable)
//   alert_message: text (nullable)
//   assigned_to: uuid (nullable)
//   status: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: audit_log
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   user_id: uuid (nullable)
//   action: text (nullable)
//   description: text (nullable)
//   timestamp: timestamp with time zone (nullable, default: now())
// Table: departments
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   description: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: engineering_accessories
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   accessories_list_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: engineering_boms
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   bom_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: engineering_layouts
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   layout_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: engineering_tasks
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   task_type: text (not null)
//   task_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: engineering_travelers
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   traveler_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: metrics
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   department: text (nullable)
//   metric_name: text (not null)
//   metric_value: numeric (nullable)
//   threshold_min: numeric (nullable)
//   threshold_max: numeric (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: production_final_assembly
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   station_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: production_paint
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   task_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: production_sub_assembly
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   task_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: production_tests
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   test_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: production_warehouse
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   task_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: production_weld_shop
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   task_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   product_name: text (not null)
//   product_type: text (nullable)
//   description: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: purchasing_components
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   component_type: text (not null)
//   component_name: text (not null)
//   status: text (nullable, default: 'pending'::text)
//   order_date: date (nullable)
//   expected_delivery_date: date (nullable)
//   actual_delivery_date: date (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: purchasing_expedites
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   component_type: text (not null)
//   expedite_reason: text (nullable)
//   expedite_date: date (nullable)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: quotes
//   id: uuid (not null, default: gen_random_uuid())
//   quote_number: text (not null)
//   customer_name: text (not null)
//   product_type: text (nullable)
//   quote_value: numeric (nullable)
//   profit_margin_percentage: numeric (nullable)
//   status: text (not null, default: 'draft'::text)
//   sent_date: timestamp with time zone (nullable)
//   approval_date: timestamp with time zone (nullable)
//   expiration_date: timestamp with time zone (nullable)
//   created_by: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: users
//   id: uuid (not null)
//   email: text (not null)
//   full_name: text (not null)
//   department: text (nullable)
//   role: text (nullable, default: 'user'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: warranty_claims
//   id: uuid (not null, default: gen_random_uuid())
//   serial_number: text (nullable)
//   wo_id: uuid (nullable)
//   customer_name: text (nullable)
//   issue_description: text (nullable)
//   status: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: work_orders
//   id: uuid (not null, default: gen_random_uuid())
//   wo_number: text (not null)
//   customer_name: text (not null)
//   product_type: text (nullable)
//   status: text (not null, default: 'Não iniciado'::text)
//   department: text (nullable)
//   due_date: date (nullable)
//   progress: integer (nullable, default: 0)
//   created_by: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   quote_id: uuid (nullable)

// --- CONSTRAINTS ---
// Table: alerts
//   FOREIGN KEY alerts_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES users(id)
//   FOREIGN KEY alerts_metric_id_fkey: FOREIGN KEY (metric_id) REFERENCES metrics(id) ON DELETE CASCADE
//   PRIMARY KEY alerts_pkey: PRIMARY KEY (id)
// Table: audit_log
//   PRIMARY KEY audit_log_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_log_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id)
//   FOREIGN KEY audit_log_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: departments
//   UNIQUE departments_name_key: UNIQUE (name)
//   PRIMARY KEY departments_pkey: PRIMARY KEY (id)
// Table: engineering_accessories
//   PRIMARY KEY engineering_accessories_pkey: PRIMARY KEY (id)
//   FOREIGN KEY engineering_accessories_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: engineering_boms
//   PRIMARY KEY engineering_boms_pkey: PRIMARY KEY (id)
//   FOREIGN KEY engineering_boms_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: engineering_layouts
//   PRIMARY KEY engineering_layouts_pkey: PRIMARY KEY (id)
//   FOREIGN KEY engineering_layouts_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: engineering_tasks
//   PRIMARY KEY engineering_tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY engineering_tasks_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: engineering_travelers
//   PRIMARY KEY engineering_travelers_pkey: PRIMARY KEY (id)
//   FOREIGN KEY engineering_travelers_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: metrics
//   PRIMARY KEY metrics_pkey: PRIMARY KEY (id)
//   FOREIGN KEY metrics_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: production_final_assembly
//   PRIMARY KEY production_final_assembly_pkey: PRIMARY KEY (id)
//   FOREIGN KEY production_final_assembly_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: production_paint
//   PRIMARY KEY production_paint_pkey: PRIMARY KEY (id)
//   FOREIGN KEY production_paint_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: production_sub_assembly
//   PRIMARY KEY production_sub_assembly_pkey: PRIMARY KEY (id)
//   FOREIGN KEY production_sub_assembly_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: production_tests
//   PRIMARY KEY production_tests_pkey: PRIMARY KEY (id)
//   FOREIGN KEY production_tests_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: production_warehouse
//   PRIMARY KEY production_warehouse_pkey: PRIMARY KEY (id)
//   FOREIGN KEY production_warehouse_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: production_weld_shop
//   PRIMARY KEY production_weld_shop_pkey: PRIMARY KEY (id)
//   FOREIGN KEY production_weld_shop_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: purchasing_components
//   CHECK purchasing_components_component_type_check: CHECK ((component_type = ANY (ARRAY['Engine'::text, 'Hydraulics'::text, 'Water Pump'::text, 'Water Tank'::text, 'Debris Box'::text, 'Blower'::text, 'Van Air'::text, 'Sewer Hose'::text, 'Shroud'::text])))
//   PRIMARY KEY purchasing_components_pkey: PRIMARY KEY (id)
//   FOREIGN KEY purchasing_components_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: purchasing_expedites
//   CHECK purchasing_expedites_component_type_check: CHECK ((component_type = ANY (ARRAY['Engine'::text, 'Hydraulics'::text, 'Water Pump'::text, 'Water Tank'::text, 'Debris Box'::text, 'Blower'::text, 'Van Air'::text, 'Sewer Hose'::text, 'Shroud'::text])))
//   PRIMARY KEY purchasing_expedites_pkey: PRIMARY KEY (id)
//   FOREIGN KEY purchasing_expedites_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: quotes
//   FOREIGN KEY quotes_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
//   PRIMARY KEY quotes_pkey: PRIMARY KEY (id)
//   UNIQUE quotes_quote_number_key: UNIQUE (quote_number)
//   CHECK quotes_status_check: CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'approved'::text, 'rejected'::text, 'expired'::text])))
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: warranty_claims
//   PRIMARY KEY warranty_claims_pkey: PRIMARY KEY (id)
//   FOREIGN KEY warranty_claims_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: work_orders
//   FOREIGN KEY work_orders_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id)
//   PRIMARY KEY work_orders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY work_orders_quote_id_fkey: FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
//   UNIQUE work_orders_wo_number_key: UNIQUE (wo_number)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: alerts
//   Policy "Auth read alerts" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: audit_log
//   Policy "Auth read audit" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: departments
//   Policy "Read all departments" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: engineering_accessories
//   Policy "Auth delete engineering_accessories" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert engineering_accessories" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read engineering_accessories" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update engineering_accessories" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: engineering_boms
//   Policy "Auth delete engineering_boms" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert engineering_boms" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read engineering_boms" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update engineering_boms" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: engineering_layouts
//   Policy "Auth delete engineering_layouts" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert engineering_layouts" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read engineering_layouts" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update engineering_layouts" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: engineering_tasks
//   Policy "Auth delete engineering_tasks" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert engineering_tasks" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read engineering_tasks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update engineering_tasks" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: engineering_travelers
//   Policy "Auth delete engineering_travelers" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert engineering_travelers" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read engineering_travelers" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update engineering_travelers" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: metrics
//   Policy "Auth read metrics" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: production_final_assembly
//   Policy "Auth delete production_final_assembly" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert production_final_assembly" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read production_final_assembly" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update production_final_assembly" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: production_paint
//   Policy "Auth delete production_paint" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert production_paint" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read production_paint" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update production_paint" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: production_sub_assembly
//   Policy "Auth delete production_sub_assembly" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert production_sub_assembly" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read production_sub_assembly" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update production_sub_assembly" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: production_tests
//   Policy "Auth delete production_tests" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert production_tests" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read production_tests" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update production_tests" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: production_warehouse
//   Policy "Auth delete production_warehouse" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert production_warehouse" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read production_warehouse" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update production_warehouse" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: production_weld_shop
//   Policy "Auth delete production_weld_shop" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert production_weld_shop" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read production_weld_shop" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update production_weld_shop" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: products
//   Policy "Auth read products" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: purchasing_components
//   Policy "Auth delete purchasing_components" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert purchasing_components" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read purchasing_components" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update purchasing_components" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: purchasing_expedites
//   Policy "Auth delete purchasing_expedites" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert purchasing_expedites" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read purchasing_expedites" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update purchasing_expedites" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: quotes
//   Policy "Auth read quotes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Delete quotes" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Insert quotes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Update quotes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: users
//   Policy "Users can read own profile or admin reads all" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = id) OR (get_user_role() = 'admin'::text))
// Table: warranty_claims
//   Policy "Auth read warranty" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: work_orders
//   Policy "Insert WO" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Read WO by department or admin" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((department = get_user_department()) OR (get_user_role() = 'admin'::text))
//   Policy "Update WO" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((department = get_user_department()) OR (get_user_role() = 'admin'::text))

// --- DATABASE FUNCTIONS ---
// FUNCTION get_user_department()
//   CREATE OR REPLACE FUNCTION public.get_user_department()
//    RETURNS text
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT department FROM public.users WHERE id = auth.uid();
//   $function$
//
// FUNCTION get_user_role()
//   CREATE OR REPLACE FUNCTION public.get_user_role()
//    RETURNS text
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT role FROM public.users WHERE id = auth.uid();
//   $function$
//
// FUNCTION handle_new_user()
//   CREATE OR REPLACE FUNCTION public.handle_new_user()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     INSERT INTO public.users (id, email, full_name, department, role)
//     VALUES (
//       NEW.id,
//       NEW.email,
//       COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuário'),
//       COALESCE(NEW.raw_user_meta_data->>'department', 'Vendas'),
//       'user'
//     )
//     ON CONFLICT (id) DO NOTHING;
//     RETURN NEW;
//   END;
//   $function$
//

// --- INDEXES ---
// Table: departments
//   CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name)
// Table: quotes
//   CREATE UNIQUE INDEX quotes_quote_number_key ON public.quotes USING btree (quote_number)
// Table: work_orders
//   CREATE UNIQUE INDEX work_orders_wo_number_key ON public.work_orders USING btree (wo_number)
