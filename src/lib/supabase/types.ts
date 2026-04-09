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
      alert_rules: {
        Row: {
          alert_condition: string | null
          alert_enabled: boolean | null
          assigned_users: string[] | null
          created_at: string | null
          id: string
          metric_id: string | null
          updated_at: string | null
        }
        Insert: {
          alert_condition?: string | null
          alert_enabled?: boolean | null
          assigned_users?: string[] | null
          created_at?: string | null
          id?: string
          metric_id?: string | null
          updated_at?: string | null
        }
        Update: {
          alert_condition?: string | null
          alert_enabled?: boolean | null
          assigned_users?: string[] | null
          created_at?: string | null
          id?: string
          metric_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'alert_rules_metric_id_fkey'
            columns: ['metric_id']
            isOneToOne: false
            referencedRelation: 'metrics_definitions'
            referencedColumns: ['id']
          },
        ]
      }
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
      alerts_log: {
        Row: {
          alert_message: string | null
          alert_rule_id: string | null
          alert_status: string | null
          assigned_to: string | null
          created_at: string | null
          id: string
          metric_value: number | null
          resolved_at: string | null
          wo_id: string | null
        }
        Insert: {
          alert_message?: string | null
          alert_rule_id?: string | null
          alert_status?: string | null
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          metric_value?: number | null
          resolved_at?: string | null
          wo_id?: string | null
        }
        Update: {
          alert_message?: string | null
          alert_rule_id?: string | null
          alert_status?: string | null
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          metric_value?: number | null
          resolved_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'alerts_log_alert_rule_id_fkey'
            columns: ['alert_rule_id']
            isOneToOne: false
            referencedRelation: 'alert_rules'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alerts_log_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'alerts_log_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
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
      customer_history: {
        Row: {
          action: string | null
          changed_at: string | null
          customer_id: string | null
          field_changed: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          changed_at?: string | null
          customer_id?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          changed_at?: string | null
          customer_id?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'customer_history_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'customer_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          customer_id: string
          customer_name: string
          deleted_at: string | null
          email: string | null
          id: string
          last_wo_date: string | null
          phone: string | null
          state: string | null
          status: string | null
          total_wos: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          customer_id: string
          customer_name: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          last_wo_date?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          total_wos?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string
          customer_name?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          last_wo_date?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          total_wos?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      hr_absences: {
        Row: {
          absence_date: string | null
          absence_type: string | null
          created_at: string | null
          employee_id: string
          employee_name: string
          id: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          absence_date?: string | null
          absence_type?: string | null
          created_at?: string | null
          employee_id: string
          employee_name: string
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          absence_date?: string | null
          absence_type?: string | null
          created_at?: string | null
          employee_id?: string
          employee_name?: string
          id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'hr_absences_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      hr_injuries: {
        Row: {
          created_at: string | null
          employee_id: string
          employee_name: string
          id: string
          injury_date: string | null
          injury_description: string | null
          injury_type: string | null
          severity_level: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          employee_name: string
          id?: string
          injury_date?: string | null
          injury_description?: string | null
          injury_type?: string | null
          severity_level?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          employee_name?: string
          id?: string
          injury_date?: string | null
          injury_description?: string | null
          injury_type?: string | null
          severity_level?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'hr_injuries_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      hr_productivity: {
        Row: {
          created_at: string | null
          employee_id: string
          employee_name: string
          id: string
          labour_hours: number | null
          production_value: number | null
          productivity_ratio: number | null
          recorded_date: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          employee_name: string
          id?: string
          labour_hours?: number | null
          production_value?: number | null
          productivity_ratio?: number | null
          recorded_date?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          employee_name?: string
          id?: string
          labour_hours?: number | null
          production_value?: number | null
          productivity_ratio?: number | null
          recorded_date?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'hr_productivity_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'hr_productivity_wo_id_fkey'
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
      metrics_definitions: {
        Row: {
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          metric_name: string
          metric_type: string | null
          threshold_max: number | null
          threshold_min: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          metric_name: string
          metric_type?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          metric_name?: string
          metric_type?: string | null
          threshold_max?: number | null
          threshold_min?: number | null
          unit?: string | null
        }
        Relationships: []
      }
      metrics_tracking: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          metric_name: string
          metric_value: number | null
          recorded_date: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          metric_name: string
          metric_value?: number | null
          recorded_date?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          metric_name?: string
          metric_value?: number | null
          recorded_date?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'metrics_tracking_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
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
      quality_late_card_pulls: {
        Row: {
          component_name: string
          created_at: string | null
          id: string
          part_number: string | null
          pull_date: string | null
          pull_reason: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          component_name: string
          created_at?: string | null
          id?: string
          part_number?: string | null
          pull_date?: string | null
          pull_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          component_name?: string
          created_at?: string | null
          id?: string
          part_number?: string | null
          pull_date?: string | null
          pull_reason?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quality_warranty_claims: {
        Row: {
          created_at: string | null
          customer_name: string | null
          id: string
          issue_category: string | null
          issue_description: string | null
          reported_date: string | null
          resolution_notes: string | null
          resolved_date: string | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
          wo_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          issue_category?: string | null
          issue_description?: string | null
          reported_date?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string | null
          id?: string
          issue_category?: string | null
          issue_description?: string | null
          reported_date?: string | null
          resolution_notes?: string | null
          resolved_date?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'quality_warranty_claims_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      quote_history: {
        Row: {
          action: string | null
          changed_at: string | null
          field_changed: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          quote_id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          changed_at?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          quote_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          changed_at?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          quote_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'quote_history_quote_id_fkey'
            columns: ['quote_id']
            isOneToOne: false
            referencedRelation: 'quotes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'quote_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      quotes: {
        Row: {
          actual_completion_date: string | null
          approval_date: string | null
          created_at: string | null
          created_by: string | null
          customer_city: string | null
          customer_name: string
          customer_state: string | null
          date_order: string | null
          deleted_at: string | null
          expected_completion_date: string | null
          expiration_date: string | null
          id: string
          machine_model: string | null
          product_family: string | null
          product_type: string | null
          profit_margin_percentage: number | null
          quote_number: string
          quote_value: number | null
          salesperson: string | null
          sent_date: string | null
          special_custom: string | null
          status: string
          truck_information: string | null
          truck_supplier: string | null
          updated_at: string | null
          wo_number_ref: string | null
        }
        Insert: {
          actual_completion_date?: string | null
          approval_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_city?: string | null
          customer_name: string
          customer_state?: string | null
          date_order?: string | null
          deleted_at?: string | null
          expected_completion_date?: string | null
          expiration_date?: string | null
          id?: string
          machine_model?: string | null
          product_family?: string | null
          product_type?: string | null
          profit_margin_percentage?: number | null
          quote_number: string
          quote_value?: number | null
          salesperson?: string | null
          sent_date?: string | null
          special_custom?: string | null
          status?: string
          truck_information?: string | null
          truck_supplier?: string | null
          updated_at?: string | null
          wo_number_ref?: string | null
        }
        Update: {
          actual_completion_date?: string | null
          approval_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_city?: string | null
          customer_name?: string
          customer_state?: string | null
          date_order?: string | null
          deleted_at?: string | null
          expected_completion_date?: string | null
          expiration_date?: string | null
          id?: string
          machine_model?: string | null
          product_family?: string | null
          product_type?: string | null
          profit_margin_percentage?: number | null
          quote_number?: string
          quote_value?: number | null
          salesperson?: string | null
          sent_date?: string | null
          special_custom?: string | null
          status?: string
          truck_information?: string | null
          truck_supplier?: string | null
          updated_at?: string | null
          wo_number_ref?: string | null
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
      report_history: {
        Row: {
          created_at: string | null
          date_end: string | null
          date_start: string | null
          department: string | null
          format: string
          id: string
          report_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          department?: string | null
          format: string
          id?: string
          report_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_end?: string | null
          date_start?: string | null
          department?: string | null
          format?: string
          id?: string
          report_type?: string
          user_id?: string
        }
        Relationships: []
      }
      salesperson_history: {
        Row: {
          action: string | null
          changed_at: string | null
          field_changed: string
          id: string
          new_value: string | null
          notes: string | null
          old_value: string | null
          salesperson_id: string | null
          user_id: string | null
        }
        Insert: {
          action?: string | null
          changed_at?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          salesperson_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string | null
          changed_at?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          notes?: string | null
          old_value?: string | null
          salesperson_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'salesperson_history_salesperson_id_fkey'
            columns: ['salesperson_id']
            isOneToOne: false
            referencedRelation: 'salespersons'
            referencedColumns: ['id']
          },
        ]
      }
      salespersons: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          deleted_at: string | null
          department: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          region: string | null
          salesperson_id: string
          status: string | null
          total_revenue: number | null
          total_wos: number | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          region?: string | null
          salesperson_id: string
          status?: string | null
          total_revenue?: number | null
          total_wos?: number | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          region?: string | null
          salesperson_id?: string
          status?: string | null
          total_revenue?: number | null
          total_wos?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          critical_alerts: boolean | null
          daily_summary: boolean | null
          department: string | null
          email: string
          email_notifications: boolean | null
          full_name: string
          id: string
          role: string | null
          system_notifications: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          critical_alerts?: boolean | null
          daily_summary?: boolean | null
          department?: string | null
          email: string
          email_notifications?: boolean | null
          full_name: string
          id: string
          role?: string | null
          system_notifications?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          critical_alerts?: boolean | null
          daily_summary?: boolean | null
          department?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string
          id?: string
          role?: string | null
          system_notifications?: boolean | null
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
      wo_history: {
        Row: {
          action: string | null
          changed_at: string | null
          department: string | null
          field_changed: string | null
          id: string
          new_status: string | null
          new_value: string | null
          notes: string | null
          old_status: string | null
          old_value: string | null
          user_id: string | null
          wo_id: string | null
        }
        Insert: {
          action?: string | null
          changed_at?: string | null
          department?: string | null
          field_changed?: string | null
          id?: string
          new_status?: string | null
          new_value?: string | null
          notes?: string | null
          old_status?: string | null
          old_value?: string | null
          user_id?: string | null
          wo_id?: string | null
        }
        Update: {
          action?: string | null
          changed_at?: string | null
          department?: string | null
          field_changed?: string | null
          id?: string
          new_status?: string | null
          new_value?: string | null
          notes?: string | null
          old_status?: string | null
          old_value?: string | null
          user_id?: string | null
          wo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'wo_history_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wo_history_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      wo_task_comments_history: {
        Row: {
          author_id: string | null
          comment: string
          created_at: string | null
          deleted_at: string | null
          id: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          comment: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          comment?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'wo_task_comments_history_author_id_fkey'
            columns: ['author_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wo_task_comments_history_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'wo_tasks'
            referencedColumns: ['id']
          },
        ]
      }
      wo_task_history: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_value: string | null
          old_value: string | null
          task_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'wo_task_history_task_id_fkey'
            columns: ['task_id']
            isOneToOne: false
            referencedRelation: 'wo_tasks'
            referencedColumns: ['id']
          },
        ]
      }
      wo_tasks: {
        Row: {
          assigned_to: string | null
          comments: string | null
          completion_date: string | null
          created_at: string
          department: string
          finish_date: string | null
          id: string
          is_completed: boolean | null
          progress: number | null
          start_date: string | null
          status: string
          sub_department: string | null
          task_name: string
          updated_at: string
          wo_id: string
        }
        Insert: {
          assigned_to?: string | null
          comments?: string | null
          completion_date?: string | null
          created_at?: string
          department: string
          finish_date?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          start_date?: string | null
          status?: string
          sub_department?: string | null
          task_name: string
          updated_at?: string
          wo_id: string
        }
        Update: {
          assigned_to?: string | null
          comments?: string | null
          completion_date?: string | null
          created_at?: string
          department?: string
          finish_date?: string | null
          id?: string
          is_completed?: boolean | null
          progress?: number | null
          start_date?: string | null
          status?: string
          sub_department?: string | null
          task_name?: string
          updated_at?: string
          wo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'wo_tasks_assigned_to_fkey'
            columns: ['assigned_to']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'wo_tasks_wo_id_fkey'
            columns: ['wo_id']
            isOneToOne: false
            referencedRelation: 'work_orders'
            referencedColumns: ['id']
          },
        ]
      }
      work_orders: {
        Row: {
          actual_completion_date: string | null
          created_at: string | null
          created_by: string | null
          customer_name: string
          deleted_at: string | null
          department: string | null
          due_date: string | null
          expected_completion_date: string | null
          id: string
          machine_model: string | null
          price: number | null
          product_type: string | null
          profit_margin: number | null
          progress: number | null
          quote_id: string | null
          special_custom: string | null
          status: string
          truck_information: string | null
          truck_supplier: string | null
          updated_at: string | null
          wo_number: string
        }
        Insert: {
          actual_completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name: string
          deleted_at?: string | null
          department?: string | null
          due_date?: string | null
          expected_completion_date?: string | null
          id?: string
          machine_model?: string | null
          price?: number | null
          product_type?: string | null
          profit_margin?: number | null
          progress?: number | null
          quote_id?: string | null
          special_custom?: string | null
          status?: string
          truck_information?: string | null
          truck_supplier?: string | null
          updated_at?: string | null
          wo_number: string
        }
        Update: {
          actual_completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_name?: string
          deleted_at?: string | null
          department?: string | null
          due_date?: string | null
          expected_completion_date?: string | null
          id?: string
          machine_model?: string | null
          price?: number | null
          product_type?: string | null
          profit_margin?: number | null
          progress?: number | null
          quote_id?: string | null
          special_custom?: string | null
          status?: string
          truck_information?: string | null
          truck_supplier?: string | null
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
// Table: alert_rules
//   id: uuid (not null, default: gen_random_uuid())
//   metric_id: uuid (nullable)
//   alert_condition: text (nullable)
//   assigned_users: _uuid (nullable)
//   alert_enabled: boolean (nullable, default: true)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: alerts
//   id: uuid (not null, default: gen_random_uuid())
//   metric_id: uuid (nullable)
//   alert_type: text (nullable)
//   alert_message: text (nullable)
//   assigned_to: uuid (nullable)
//   status: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: alerts_log
//   id: uuid (not null, default: gen_random_uuid())
//   alert_rule_id: uuid (nullable)
//   wo_id: uuid (nullable)
//   metric_value: numeric (nullable)
//   alert_message: text (nullable)
//   alert_status: text (nullable, default: 'pending'::text)
//   assigned_to: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   resolved_at: timestamp with time zone (nullable)
// Table: audit_log
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   user_id: uuid (nullable)
//   action: text (nullable)
//   description: text (nullable)
//   timestamp: timestamp with time zone (nullable, default: now())
// Table: customer_history
//   id: uuid (not null, default: gen_random_uuid())
//   customer_id: uuid (nullable)
//   user_id: uuid (nullable)
//   field_changed: text (not null)
//   old_value: text (nullable)
//   new_value: text (nullable)
//   action: text (nullable)
//   notes: text (nullable)
//   changed_at: timestamp with time zone (nullable, default: now())
// Table: customers
//   id: uuid (not null, default: gen_random_uuid())
//   customer_id: text (not null)
//   customer_name: text (not null)
//   contact_person: text (nullable)
//   email: text (nullable)
//   phone: text (nullable)
//   address: text (nullable)
//   city: text (nullable)
//   state: text (nullable)
//   country: text (nullable)
//   status: text (nullable, default: 'Active'::text)
//   total_wos: integer (nullable, default: 0)
//   last_wo_date: date (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   deleted_at: timestamp with time zone (nullable)
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
// Table: hr_absences
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   employee_name: text (not null)
//   absence_date: date (nullable)
//   absence_type: text (nullable)
//   reason: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: hr_injuries
//   id: uuid (not null, default: gen_random_uuid())
//   employee_id: uuid (not null)
//   employee_name: text (not null)
//   injury_date: date (nullable)
//   injury_description: text (nullable)
//   injury_type: text (nullable)
//   severity_level: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: hr_productivity
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   employee_id: uuid (not null)
//   employee_name: text (not null)
//   labour_hours: numeric (nullable)
//   production_value: numeric (nullable)
//   productivity_ratio: numeric (nullable)
//   recorded_date: date (nullable)
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
// Table: metrics_definitions
//   id: uuid (not null, default: gen_random_uuid())
//   department: text (nullable)
//   metric_name: text (not null)
//   metric_type: text (nullable)
//   threshold_min: numeric (nullable)
//   threshold_max: numeric (nullable)
//   unit: text (nullable)
//   description: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: metrics_tracking
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   department: text (nullable)
//   metric_name: text (not null)
//   metric_value: numeric (nullable)
//   recorded_date: date (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   type: text (not null)
//   message: text (not null)
//   is_read: boolean (not null, default: false)
//   created_at: timestamp with time zone (not null, default: now())
//   related_entity_id: uuid (nullable)
//   related_entity_type: text (nullable)
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
// Table: quality_late_card_pulls
//   id: uuid (not null, default: gen_random_uuid())
//   component_name: text (not null)
//   pull_reason: text (nullable)
//   pull_date: date (nullable)
//   status: text (nullable, default: 'pending'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   part_number: text (nullable)
// Table: quality_warranty_claims
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   serial_number: text (nullable)
//   customer_name: text (nullable)
//   issue_description: text (nullable)
//   issue_category: text (nullable)
//   status: text (nullable, default: 'pending'::text)
//   reported_date: date (nullable)
//   resolved_date: date (nullable)
//   resolution_notes: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: quote_history
//   id: uuid (not null, default: gen_random_uuid())
//   quote_id: uuid (nullable)
//   user_id: uuid (nullable)
//   changed_at: timestamp with time zone (nullable, default: now())
//   field_changed: text (not null)
//   old_value: text (nullable)
//   new_value: text (nullable)
//   action: text (nullable)
//   notes: text (nullable)
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
//   salesperson: text (nullable)
//   product_family: text (nullable)
//   machine_model: text (nullable)
//   special_custom: text (nullable)
//   truck_information: text (nullable)
//   truck_supplier: text (nullable)
//   wo_number_ref: text (nullable)
//   expected_completion_date: date (nullable)
//   actual_completion_date: date (nullable)
//   date_order: timestamp with time zone (nullable)
//   customer_city: text (nullable)
//   customer_state: text (nullable)
//   deleted_at: timestamp with time zone (nullable)
// Table: report_history
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   report_type: text (not null)
//   department: text (nullable)
//   date_start: date (nullable)
//   date_end: date (nullable)
//   format: text (not null)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: salesperson_history
//   id: uuid (not null, default: gen_random_uuid())
//   salesperson_id: uuid (nullable)
//   user_id: uuid (nullable)
//   field_changed: text (not null)
//   old_value: text (nullable)
//   new_value: text (nullable)
//   action: text (nullable)
//   notes: text (nullable)
//   changed_at: timestamp with time zone (nullable, default: now())
// Table: salespersons
//   id: uuid (not null, default: gen_random_uuid())
//   salesperson_id: text (not null)
//   name: text (not null)
//   email: text (nullable)
//   phone: text (nullable)
//   department: text (nullable)
//   region: text (nullable)
//   total_wos: integer (nullable, default: 0)
//   total_revenue: numeric (nullable, default: 0)
//   commission_rate: numeric (nullable, default: 0)
//   status: text (nullable, default: 'Active'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   deleted_at: timestamp with time zone (nullable)
// Table: users
//   id: uuid (not null)
//   email: text (not null)
//   full_name: text (not null)
//   department: text (nullable)
//   role: text (nullable, default: 'user'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   email_notifications: boolean (nullable, default: true)
//   system_notifications: boolean (nullable, default: true)
//   critical_alerts: boolean (nullable, default: true)
//   daily_summary: boolean (nullable, default: false)
//   avatar_url: text (nullable)
// Table: warranty_claims
//   id: uuid (not null, default: gen_random_uuid())
//   serial_number: text (nullable)
//   wo_id: uuid (nullable)
//   customer_name: text (nullable)
//   issue_description: text (nullable)
//   status: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: wo_history
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (nullable)
//   changed_at: timestamp with time zone (nullable, default: now())
//   department: text (nullable)
//   user_id: uuid (nullable)
//   old_status: text (nullable)
//   new_status: text (nullable)
//   notes: text (nullable)
//   action: text (nullable)
//   field_changed: text (nullable)
//   old_value: text (nullable)
//   new_value: text (nullable)
// Table: wo_task_comments_history
//   id: uuid (not null, default: gen_random_uuid())
//   task_id: uuid (not null)
//   comment: text (not null)
//   author_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
//   deleted_at: timestamp with time zone (nullable)
// Table: wo_task_history
//   id: uuid (not null, default: gen_random_uuid())
//   task_id: uuid (not null)
//   user_id: uuid (nullable)
//   action: text (not null)
//   old_value: text (nullable)
//   new_value: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: wo_tasks
//   id: uuid (not null, default: gen_random_uuid())
//   wo_id: uuid (not null)
//   department: text (not null)
//   sub_department: text (nullable)
//   task_name: text (not null)
//   start_date: date (nullable)
//   finish_date: date (nullable)
//   status: text (not null, default: 'Pending'::text)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
//   assigned_to: uuid (nullable)
//   progress: integer (nullable, default: 0)
//   comments: text (nullable)
//   is_completed: boolean (nullable, default: false)
//   completion_date: timestamp with time zone (nullable)
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
//   machine_model: text (nullable)
//   price: numeric (nullable)
//   profit_margin: numeric (nullable)
//   expected_completion_date: date (nullable)
//   actual_completion_date: date (nullable)
//   deleted_at: timestamp with time zone (nullable)
//   special_custom: text (nullable)
//   truck_information: text (nullable)
//   truck_supplier: text (nullable)

// --- CONSTRAINTS ---
// Table: alert_rules
//   CHECK alert_rules_alert_condition_check: CHECK ((alert_condition = ANY (ARRAY['below_min'::text, 'above_max'::text, 'both'::text])))
//   FOREIGN KEY alert_rules_metric_id_fkey: FOREIGN KEY (metric_id) REFERENCES metrics_definitions(id) ON DELETE CASCADE
//   PRIMARY KEY alert_rules_pkey: PRIMARY KEY (id)
// Table: alerts
//   FOREIGN KEY alerts_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES users(id)
//   FOREIGN KEY alerts_metric_id_fkey: FOREIGN KEY (metric_id) REFERENCES metrics(id) ON DELETE CASCADE
//   PRIMARY KEY alerts_pkey: PRIMARY KEY (id)
// Table: alerts_log
//   FOREIGN KEY alerts_log_alert_rule_id_fkey: FOREIGN KEY (alert_rule_id) REFERENCES alert_rules(id) ON DELETE CASCADE
//   CHECK alerts_log_alert_status_check: CHECK ((alert_status = ANY (ARRAY['pending'::text, 'acknowledged'::text, 'resolved'::text])))
//   FOREIGN KEY alerts_log_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
//   PRIMARY KEY alerts_log_pkey: PRIMARY KEY (id)
//   FOREIGN KEY alerts_log_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: audit_log
//   PRIMARY KEY audit_log_pkey: PRIMARY KEY (id)
//   FOREIGN KEY audit_log_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id)
//   FOREIGN KEY audit_log_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: customer_history
//   FOREIGN KEY customer_history_customer_id_fkey: FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
//   PRIMARY KEY customer_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY customer_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
// Table: customers
//   UNIQUE customers_customer_id_key: UNIQUE (customer_id)
//   PRIMARY KEY customers_pkey: PRIMARY KEY (id)
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
// Table: hr_absences
//   CHECK hr_absences_absence_type_check: CHECK ((absence_type = ANY (ARRAY['excused'::text, 'unexcused'::text])))
//   FOREIGN KEY hr_absences_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
//   PRIMARY KEY hr_absences_pkey: PRIMARY KEY (id)
// Table: hr_injuries
//   FOREIGN KEY hr_injuries_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
//   CHECK hr_injuries_injury_type_check: CHECK ((injury_type = ANY (ARRAY['recordable'::text, 'non-recordable'::text])))
//   PRIMARY KEY hr_injuries_pkey: PRIMARY KEY (id)
// Table: hr_productivity
//   FOREIGN KEY hr_productivity_employee_id_fkey: FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
//   PRIMARY KEY hr_productivity_pkey: PRIMARY KEY (id)
//   FOREIGN KEY hr_productivity_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: metrics
//   PRIMARY KEY metrics_pkey: PRIMARY KEY (id)
//   FOREIGN KEY metrics_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: metrics_definitions
//   PRIMARY KEY metrics_definitions_pkey: PRIMARY KEY (id)
// Table: metrics_tracking
//   PRIMARY KEY metrics_tracking_pkey: PRIMARY KEY (id)
//   FOREIGN KEY metrics_tracking_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: notifications
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
//   CHECK notifications_type_check: CHECK ((type = ANY (ARRAY['Sales'::text, 'Engineering'::text, 'Purchasing'::text, 'Production'::text, 'Quality'::text, 'HR'::text, 'System'::text])))
//   FOREIGN KEY notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
// Table: quality_late_card_pulls
//   PRIMARY KEY quality_late_card_pulls_pkey: PRIMARY KEY (id)
// Table: quality_warranty_claims
//   PRIMARY KEY quality_warranty_claims_pkey: PRIMARY KEY (id)
//   FOREIGN KEY quality_warranty_claims_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: quote_history
//   PRIMARY KEY quote_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY quote_history_quote_id_fkey: FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
//   FOREIGN KEY quote_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
// Table: quotes
//   FOREIGN KEY quotes_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
//   PRIMARY KEY quotes_pkey: PRIMARY KEY (id)
//   UNIQUE quotes_quote_number_key: UNIQUE (quote_number)
//   CHECK quotes_status_check: CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'approved'::text, 'rejected'::text, 'expired'::text, 'converted'::text])))
// Table: report_history
//   PRIMARY KEY report_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY report_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: salesperson_history
//   PRIMARY KEY salesperson_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY salesperson_history_salesperson_id_fkey: FOREIGN KEY (salesperson_id) REFERENCES salespersons(id) ON DELETE CASCADE
//   FOREIGN KEY salesperson_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: salespersons
//   PRIMARY KEY salespersons_pkey: PRIMARY KEY (id)
//   UNIQUE salespersons_salesperson_id_key: UNIQUE (salesperson_id)
// Table: users
//   FOREIGN KEY users_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   PRIMARY KEY users_pkey: PRIMARY KEY (id)
// Table: warranty_claims
//   PRIMARY KEY warranty_claims_pkey: PRIMARY KEY (id)
//   FOREIGN KEY warranty_claims_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: wo_history
//   PRIMARY KEY wo_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY wo_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
//   FOREIGN KEY wo_history_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: wo_task_comments_history
//   FOREIGN KEY wo_task_comments_history_author_id_fkey: FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
//   PRIMARY KEY wo_task_comments_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY wo_task_comments_history_task_id_fkey: FOREIGN KEY (task_id) REFERENCES wo_tasks(id) ON DELETE CASCADE
// Table: wo_task_history
//   PRIMARY KEY wo_task_history_pkey: PRIMARY KEY (id)
//   FOREIGN KEY wo_task_history_task_id_fkey: FOREIGN KEY (task_id) REFERENCES wo_tasks(id) ON DELETE CASCADE
//   FOREIGN KEY wo_task_history_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL
// Table: wo_tasks
//   FOREIGN KEY wo_tasks_assigned_to_fkey: FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
//   PRIMARY KEY wo_tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY wo_tasks_wo_id_fkey: FOREIGN KEY (wo_id) REFERENCES work_orders(id) ON DELETE CASCADE
// Table: work_orders
//   FOREIGN KEY work_orders_created_by_fkey: FOREIGN KEY (created_by) REFERENCES users(id)
//   PRIMARY KEY work_orders_pkey: PRIMARY KEY (id)
//   FOREIGN KEY work_orders_quote_id_fkey: FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
//   UNIQUE work_orders_wo_number_key: UNIQUE (wo_number)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: alert_rules
//   Policy "Auth delete alert_rules" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert alert_rules" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read alert_rules" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update alert_rules" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: alerts
//   Policy "Auth read alerts" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: alerts_log
//   Policy "Auth delete alerts_log" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert alerts_log" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read alerts_log" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update alerts_log" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: audit_log
//   Policy "Auth read audit" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: customer_history
//   Policy "Auth insert customer_history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read customer_history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: customers
//   Policy "Auth delete customers" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert customers" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read customers" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update customers" (UPDATE, PERMISSIVE) roles={authenticated}
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
// Table: hr_absences
//   Policy "Auth delete hr_absences" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert hr_absences" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read hr_absences" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update hr_absences" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: hr_injuries
//   Policy "Auth delete hr_injuries" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert hr_injuries" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read hr_injuries" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update hr_injuries" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: hr_productivity
//   Policy "Auth delete hr_productivity" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert hr_productivity" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read hr_productivity" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update hr_productivity" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: metrics
//   Policy "Auth read metrics" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: metrics_definitions
//   Policy "Auth delete metrics_definitions" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert metrics_definitions" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read metrics_definitions" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update metrics_definitions" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: metrics_tracking
//   Policy "Auth delete metrics_tracking" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert metrics_tracking" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read metrics_tracking" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update metrics_tracking" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: notifications
//   Policy "System can insert notifications" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Users can read own notifications" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//   Policy "Users can update own notifications" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
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
// Table: quality_late_card_pulls
//   Policy "Auth delete quality_late_card_pulls" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert quality_late_card_pulls" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read quality_late_card_pulls" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update quality_late_card_pulls" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: quality_warranty_claims
//   Policy "Auth delete quality_warranty_claims" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert quality_warranty_claims" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read quality_warranty_claims" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update quality_warranty_claims" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: quote_history
//   Policy "Auth insert quote_history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read quote_history" (SELECT, PERMISSIVE) roles={authenticated}
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
// Table: report_history
//   Policy "Users can insert own report history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Users can read own report history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
// Table: salesperson_history
//   Policy "Auth insert salesperson_history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read salesperson_history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: salespersons
//   Policy "Auth delete salespersons" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert salespersons" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read salespersons" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update salespersons" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: users
//   Policy "Users can read own profile or admin reads all" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((auth.uid() = id) OR (get_user_role() = 'admin'::text))
//   Policy "Users can update own profile" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//     WITH CHECK: (auth.uid() = id)
// Table: warranty_claims
//   Policy "Auth read warranty" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: wo_history
//   Policy "Auth insert wo_history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read wo_history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: wo_task_comments_history
//   Policy "Auth delete wo_task_comments_history" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert wo_task_comments_history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read wo_task_comments_history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update wo_task_comments_history" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: wo_task_history
//   Policy "Auth insert wo_task_history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read wo_task_history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: wo_tasks
//   Policy "Auth delete wo_tasks" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth insert wo_tasks" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Auth read wo_tasks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Auth update wo_tasks" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: work_orders
//   Policy "Creator can read WO" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (created_by = auth.uid())
//   Policy "Insert WO" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Read WO by department or admin" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((department = get_user_department()) OR (get_user_role() = 'admin'::text))
//   Policy "Sales can read WOs linked to quotes" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((quote_id IS NOT NULL) AND ((get_user_department() = 'Sales'::text) OR (get_user_department() = 'Vendas'::text)))
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
// FUNCTION log_customer_changes()
//   CREATE OR REPLACE FUNCTION public.log_customer_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_old_json jsonb := to_jsonb(OLD);
//       v_new_json jsonb := to_jsonb(NEW);
//       v_key text;
//       v_user_id uuid;
//   BEGIN
//       v_user_id := auth.uid();
//
//       FOR v_key IN SELECT * FROM jsonb_object_keys(v_new_json)
//       LOOP
//           IF v_key NOT IN ('updated_at', 'created_at', 'id') THEN
//               IF v_old_json->>v_key IS DISTINCT FROM v_new_json->>v_key THEN
//                   INSERT INTO public.customer_history (customer_id, user_id, field_changed, old_value, new_value)
//                   VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key);
//               END IF;
//           END IF;
//       END LOOP;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION log_quote_changes()
//   CREATE OR REPLACE FUNCTION public.log_quote_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_old_json jsonb := to_jsonb(OLD);
//       v_new_json jsonb := to_jsonb(NEW);
//       v_key text;
//       v_user_id uuid;
//   BEGIN
//       v_user_id := auth.uid();
//
//       FOR v_key IN SELECT * FROM jsonb_object_keys(v_new_json)
//       LOOP
//           IF v_key NOT IN ('updated_at', 'created_at', 'id') THEN
//               IF v_old_json->>v_key IS DISTINCT FROM v_new_json->>v_key THEN
//                   INSERT INTO public.quote_history (quote_id, user_id, field_changed, old_value, new_value)
//                   VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key);
//               END IF;
//           END IF;
//       END LOOP;
//
//       RETURN NEW;
//   END;
//   $function$
//
// FUNCTION log_salesperson_changes()
//   CREATE OR REPLACE FUNCTION public.log_salesperson_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_old_json JSONB := to_jsonb(OLD);
//       v_new_json JSONB := to_jsonb(NEW);
//       v_key TEXT;
//       v_user_id UUID;
//   BEGIN
//       v_user_id := auth.uid();
//
//       FOR v_key IN SELECT * FROM jsonb_object_keys(v_new_json)
//       LOOP
//           IF v_key NOT IN ('updated_at', 'created_at', 'id') THEN
//               IF v_old_json->>v_key IS DISTINCT FROM v_new_json->>v_key THEN
//                   INSERT INTO public.salesperson_history (salesperson_id, user_id, field_changed, old_value, new_value, action)
//                   VALUES (NEW.id, v_user_id, v_key, v_old_json->>v_key, v_new_json->>v_key, 'update');
//               END IF;
//           END IF;
//       END LOOP;
//
//       RETURN NEW;
//   END;
//   $function$
//

// --- TRIGGERS ---
// Table: customers
//   on_customer_update: CREATE TRIGGER on_customer_update AFTER UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION log_customer_changes()
// Table: quotes
//   on_quote_update: CREATE TRIGGER on_quote_update AFTER UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION log_quote_changes()
// Table: salespersons
//   on_salesperson_update: CREATE TRIGGER on_salesperson_update AFTER UPDATE ON public.salespersons FOR EACH ROW EXECUTE FUNCTION log_salesperson_changes()

// --- INDEXES ---
// Table: customers
//   CREATE UNIQUE INDEX customers_customer_id_key ON public.customers USING btree (customer_id)
// Table: departments
//   CREATE UNIQUE INDEX departments_name_key ON public.departments USING btree (name)
// Table: notifications
//   CREATE INDEX notifications_user_id_idx ON public.notifications USING btree (user_id)
// Table: quotes
//   CREATE UNIQUE INDEX quotes_quote_number_key ON public.quotes USING btree (quote_number)
// Table: salespersons
//   CREATE UNIQUE INDEX salespersons_salesperson_id_key ON public.salespersons USING btree (salesperson_id)
// Table: wo_task_comments_history
//   CREATE INDEX wo_task_comments_history_task_id_idx ON public.wo_task_comments_history USING btree (task_id)
// Table: wo_tasks
//   CREATE INDEX wo_tasks_wo_id_idx ON public.wo_tasks USING btree (wo_id)
// Table: work_orders
//   CREATE UNIQUE INDEX work_orders_wo_number_key ON public.work_orders USING btree (wo_number)
