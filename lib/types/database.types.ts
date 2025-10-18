// Este archivo se puede generar automáticamente con Supabase CLI
// Por ahora lo dejamos como placeholder
// Comando: supabase gen types typescript --project-id "your-project-ref" > lib/types/database.types.ts

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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          province: string | null
          postal_code: string | null
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          province?: string | null
          postal_code?: string | null
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Agregar más tablas según sea necesario
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado'
      payment_status: 'pendiente' | 'pagado' | 'rechazado'
    }
  }
}

