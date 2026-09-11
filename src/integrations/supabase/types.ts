export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      company_settings: {
        Row: {
          bank_account_no: string | null
          bank_branch: string | null
          bank_ifsc: string | null
          bank_name: string | null
          company_address: string
          company_email: string | null
          company_gstin: string
          company_name: string
          company_pan: string
          company_phone: string | null
          company_tagline: string | null
          created_at: string | null
          default_cgst_rate: number | null
          default_sgst_rate: number | null
          id: string
          invoice_counter: number | null
          invoice_prefix: string | null
          logo_url: string | null
          terms_and_conditions: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bank_account_no?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          company_address?: string
          company_email?: string | null
          company_gstin?: string
          company_name?: string
          company_pan?: string
          company_phone?: string | null
          company_tagline?: string | null
          created_at?: string | null
          default_cgst_rate?: number | null
          default_sgst_rate?: number | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          logo_url?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bank_account_no?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          company_address?: string
          company_email?: string | null
          company_gstin?: string
          company_name?: string
          company_pan?: string
          company_phone?: string | null
          company_tagline?: string | null
          created_at?: string | null
          default_cgst_rate?: number | null
          default_sgst_rate?: number | null
          id?: string
          invoice_counter?: number | null
          invoice_prefix?: string | null
          logo_url?: string | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string
          created_at: string | null
          email: string | null
          gstin: string
          id: string
          name: string
          pan: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email?: string | null
          gstin: string
          id?: string
          name: string
          pan: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string | null
          gstin?: string
          id?: string
          name?: string
          pan?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          amount: number
          bales: number
          created_at: string | null
          description: string
          folding_less_metre: number | null
          folding_less_percentage: number | null
          hsn_code: string
          id: string
          invoice_id: string
          pieces: number
          rate_per_metre: number
          sort_order: number | null
          total_metre: number
          updated_at: string | null
        }
        Insert: {
          amount?: number
          bales?: number
          created_at?: string | null
          description: string
          folding_less_metre?: number | null
          folding_less_percentage?: number | null
          hsn_code?: string
          id?: string
          invoice_id: string
          pieces?: number
          rate_per_metre?: number
          sort_order?: number | null
          total_metre?: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bales?: number
          created_at?: string | null
          description?: string
          folding_less_metre?: number | null
          folding_less_percentage?: number | null
          hsn_code?: string
          id?: string
          invoice_id?: string
          pieces?: number
          rate_per_metre?: number
          sort_order?: number | null
          total_metre?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_in_words: string | null
          assessable_value: number
          bale_numbers: string | null
          bank_account_no: string | null
          bank_branch: string | null
          bank_ifsc: string | null
          bank_name: string | null
          billed_to_address: string
          billed_to_gstin: string
          billed_to_name: string
          billed_to_pan: string
          cgst_amount: number
          cgst_rate: number
          checked_by: string | null
          created_at: string | null
          financial_year: string
          id: string
          invoice_date: string
          invoice_no: string
          net_amount: number
          order_no: string | null
          payment_terms: string | null
          prepared_by: string | null
          rounded_off: number | null
          sgst_amount: number
          sgst_rate: number
          shipped_to_address: string
          shipped_to_gstin: string
          shipped_to_name: string
          shipped_to_pan: string
          status: Database["public"]["Enums"]["invoice_status"] | null
          tax_on_reverse_charge: boolean | null
          terms_and_conditions: string | null
          total_bales: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_in_words?: string | null
          assessable_value?: number
          bale_numbers?: string | null
          bank_account_no?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          billed_to_address: string
          billed_to_gstin: string
          billed_to_name: string
          billed_to_pan: string
          cgst_amount?: number
          cgst_rate?: number
          checked_by?: string | null
          created_at?: string | null
          financial_year: string
          id?: string
          invoice_date?: string
          invoice_no: string
          net_amount?: number
          order_no?: string | null
          payment_terms?: string | null
          prepared_by?: string | null
          rounded_off?: number | null
          sgst_amount?: number
          sgst_rate?: number
          shipped_to_address: string
          shipped_to_gstin: string
          shipped_to_name: string
          shipped_to_pan: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tax_on_reverse_charge?: boolean | null
          terms_and_conditions?: string | null
          total_bales?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_in_words?: string | null
          assessable_value?: number
          bale_numbers?: string | null
          bank_account_no?: string | null
          bank_branch?: string | null
          bank_ifsc?: string | null
          bank_name?: string | null
          billed_to_address?: string
          billed_to_gstin?: string
          billed_to_name?: string
          billed_to_pan?: string
          cgst_amount?: number
          cgst_rate?: number
          checked_by?: string | null
          created_at?: string | null
          financial_year?: string
          id?: string
          invoice_date?: string
          invoice_no?: string
          net_amount?: number
          order_no?: string | null
          payment_terms?: string | null
          prepared_by?: string | null
          rounded_off?: number | null
          sgst_amount?: number
          sgst_rate?: number
          shipped_to_address?: string
          shipped_to_gstin?: string
          shipped_to_name?: string
          shipped_to_pan?: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tax_on_reverse_charge?: boolean | null
          terms_and_conditions?: string | null
          total_bales?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      invoice_status: "draft" | "saved" | "paid" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      invoice_status: ["draft", "saved", "paid", "cancelled"],
    },
  },
} as const
