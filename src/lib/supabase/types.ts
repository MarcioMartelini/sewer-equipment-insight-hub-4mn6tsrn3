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
// Table: metrics
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   department: text (nullable)
//   metric_name: text (not null)
//   metric_value: numeric (nullable)
//   threshold_min: numeric (nullable)
//   threshold_max: numeric (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: products
//   id: uuid (not null, default: gen_random_uuid())
//   product_name: text (not null)
//   product_type: text (nullable)
//   description: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
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
// Table: metrics
//   PRIMARY KEY metrics_pkey: PRIMARY KEY (id)
//   FOREIGN KEY metrics_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: products
//   PRIMARY KEY products_pkey: PRIMARY KEY (id)
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: warranty_claims
//   PRIMARY KEY warranty_claims_pkey: PRIMARY KEY (id)
//   FOREIGN KEY warranty_claims_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: work_orders
//   FOREIGN KEY work_orders_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id)
//   PRIMARY KEY work_orders_pkey: PRIMARY KEY (id)
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
// Table: metrics
//   Policy "Auth read metrics" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: products
//   Policy "Auth read products" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
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
// Table: work_orders
//   CREATE UNIQUE INDEX work_orders_wo_number_key ON public.work_orders USING btree (wo_number)
