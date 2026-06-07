
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
    PostgrestVersion: "14.5"
  }
  anthem: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_chat_guest_usage: {
        Row: {
          count: number
          guest_id: string
          ip: string | null
          updated_at: string
          usage_date: string
        }
        Insert: {
          count?: number
          guest_id: string
          ip?: string | null
          updated_at?: string
          usage_date?: string
        }
        Update: {
          count?: number
          guest_id?: string
          ip?: string | null
          updated_at?: string
          usage_date?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_usage: {
        Row: {
          count: number
          total_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          count?: number
          total_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          count?: number
          total_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_interactions_feedback: {
        Row: {
          ai_response: string
          created_at: string
          feature: string
          id: string
          metadata: Json
          personality_settings: Json
          prompt: string
          source_message_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          ai_response: string
          created_at?: string
          feature?: string
          id?: string
          metadata?: Json
          personality_settings?: Json
          prompt: string
          source_message_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          ai_response?: string
          created_at?: string
          feature?: string
          id?: string
          metadata?: Json
          personality_settings?: Json
          prompt?: string
          source_message_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_knowledge_base: {
        Row: {
          approved_at: string
          approved_by: string | null
          created_at: string
          embedding: string | null
          feature: string
          id: string
          ideal_response: string
          prompt: string
          source_sample_id: string | null
          tags: string[]
        }
        Insert: {
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          embedding?: string | null
          feature: string
          id?: string
          ideal_response: string
          prompt: string
          source_sample_id?: string | null
          tags?: string[]
        }
        Update: {
          approved_at?: string
          approved_by?: string | null
          created_at?: string
          embedding?: string | null
          feature?: string
          id?: string
          ideal_response?: string
          prompt?: string
          source_sample_id?: string | null
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "ai_knowledge_base_source_sample_id_fkey"
            columns: ["source_sample_id"]
            isOneToOne: false
            referencedRelation: "ai_training_samples"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_personality_settings: {
        Row: {
          created_at: string
          creativity: number
          detail_level: number
          forbidden_keywords: string[]
          formality: number
          id: string
          system_prompt_override: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          creativity?: number
          detail_level?: number
          forbidden_keywords?: string[]
          formality?: number
          id?: string
          system_prompt_override?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          creativity?: number
          detail_level?: number
          forbidden_keywords?: string[]
          formality?: number
          id?: string
          system_prompt_override?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_training_samples: {
        Row: {
          ai_response: string
          corrected_response: string | null
          created_at: string
          feature: string
          id: string
          metadata: Json
          model: string | null
          status: string
          system_prompt_version: string | null
          tokens_used: number | null
          updated_at: string
          user_id: string
          user_prompt: string
          user_rating: number | null
        }
        Insert: {
          ai_response: string
          corrected_response?: string | null
          created_at?: string
          feature: string
          id?: string
          metadata?: Json
          model?: string | null
          status?: string
          system_prompt_version?: string | null
          tokens_used?: number | null
          updated_at?: string
          user_id: string
          user_prompt: string
          user_rating?: number | null
        }
        Update: {
          ai_response?: string
          corrected_response?: string | null
          created_at?: string
          feature?: string
          id?: string
          metadata?: Json
          model?: string | null
          status?: string
          system_prompt_version?: string | null
          tokens_used?: number | null
          updated_at?: string
          user_id?: string
          user_prompt?: string
          user_rating?: number | null
        }
        Relationships: []
      }
      ai_usage_daily: {
        Row: {
          count: number
          feature: string
          id: string
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          count?: number
          feature: string
          id?: string
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          count?: number
          feature?: string
          id?: string
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          end_at: string | null
          id: string
          is_active: boolean
          link_url: string | null
          message: string
          start_at: string | null
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          message?: string
          start_at?: string | null
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          message?: string
          start_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_user_id: string | null
          category: string
          content: string
          created_at: string
          featured_image: string | null
          featured_image_alt: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          related_feature_link: string | null
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_user_id?: string | null
          category?: string
          content?: string
          created_at?: string
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          related_feature_link?: string | null
          slug: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_user_id?: string | null
          category?: string
          content?: string
          created_at?: string
          featured_image?: string | null
          featured_image_alt?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          related_feature_link?: string | null
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      asset_items: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          payload: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          label: string
          payload?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          payload?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      auth_banner_slides: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      beta_feedback: {
        Row: {
          created_at: string
          feature: string
          id: string
          message: string
          rating: number | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          message: string
          rating?: number | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          message?: string
          rating?: number | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      calculator_usage_events: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
        }
        Relationships: []
      }
      changelog_entries: {
        Row: {
          body: string
          created_at: string
          id: string
          is_published: boolean
          released_at: string
          tag: string
          title: string
          version: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          is_published?: boolean
          released_at?: string
          tag?: string
          title: string
          version: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_published?: boolean
          released_at?: string
          tag?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean
          sender_id: string
          sender_role: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          sender_id: string
          sender_role: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean
          sender_id?: string
          sender_role?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_banner_slides: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dashboard_daily_trends: {
        Row: {
          created_at: string
          items: Json
          trend_date: string
        }
        Insert: {
          created_at?: string
          items?: Json
          trend_date: string
        }
        Update: {
          created_at?: string
          items?: Json
          trend_date?: string
        }
        Relationships: []
      }
      dashboard_job_tasks: {
        Row: {
          created_at: string
          done: boolean
          id: string
          job_id: string
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          job_id: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          job_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_job_tasks_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "dashboard_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_jobs: {
        Row: {
          brand: string
          created_at: string
          done: boolean
          due_date: string | null
          id: string
          sort_order: number
          task: string
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          sort_order?: number
          task?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          done?: boolean
          due_date?: string | null
          id?: string
          sort_order?: number
          task?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_notes: {
        Row: {
          content: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dashboard_tasks: {
        Row: {
          created_at: string
          done: boolean
          id: string
          sort_order: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done?: boolean
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          done?: boolean
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_briefs: {
        Row: {
          ai_analysis: Json | null
          audience: Json
          client_info: Json
          confirmed_at: string | null
          confirmed_by_name: string | null
          confirmed_signature: string | null
          created_at: string
          design_direction: Json
          id: string
          notes: string
          project_id: string | null
          project_overview: Json
          references: Json
          share_token: string
          status: string
          tech_specs: Json
          timeline_budget: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          audience?: Json
          client_info?: Json
          confirmed_at?: string | null
          confirmed_by_name?: string | null
          confirmed_signature?: string | null
          created_at?: string
          design_direction?: Json
          id?: string
          notes?: string
          project_id?: string | null
          project_overview?: Json
          references?: Json
          share_token?: string
          status?: string
          tech_specs?: Json
          timeline_budget?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          audience?: Json
          client_info?: Json
          confirmed_at?: string | null
          confirmed_by_name?: string | null
          confirmed_signature?: string | null
          created_at?: string
          design_direction?: Json
          id?: string
          notes?: string
          project_id?: string | null
          project_overview?: Json
          references?: Json
          share_token?: string
          status?: string
          tech_specs?: Json
          timeline_budget?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          is_published: boolean
          question: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          question?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      feature_suggestions: {
        Row: {
          admin_note: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          status: string
          title: string
          updated_at: string
          upvotes: number
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Relationships: []
      }
      feature_usage_events: {
        Row: {
          created_at: string
          feature: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_jobs: {
        Row: {
          client_id: string
          closed: boolean
          created_at: string
          id: string
          quotation_id: string | null
          revision_quota: number | null
          revisions: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          closed?: boolean
          created_at?: string
          id?: string
          quotation_id?: string | null
          revision_quota?: number | null
          revisions?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          closed?: boolean
          created_at?: string
          id?: string
          quotation_id?: string | null
          revision_quota?: number | null
          revisions?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_clients_invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          meta: Json
          name: string
          project: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          meta?: Json
          name: string
          project?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          meta?: Json
          name?: string
          project?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_deductions: {
        Row: {
          amount: number
          created_at: string
          deduction_key: string
          enabled: boolean
          id: string
          note: string | null
          tax_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          deduction_key: string
          enabled?: boolean
          id?: string
          note?: string | null
          tax_year?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          deduction_key?: string
          enabled?: boolean
          id?: string
          note?: string | null
          tax_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          id: string
          is_deductible: boolean
          label: string
          meta: Json
          month: string
          scope: string
          spent_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          category?: string | null
          created_at?: string
          id?: string
          is_deductible?: boolean
          label: string
          meta?: Json
          month: string
          scope?: string
          spent_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          id?: string
          is_deductible?: boolean
          label?: string
          meta?: Json
          month?: string
          scope?: string
          spent_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_incomes: {
        Row: {
          category: string
          created_at: string
          gross: number
          has_certificate: boolean
          id: string
          meta: Json
          month: string
          net: number
          receive_date: string | null
          source: string
          source_quotation_id: string | null
          updated_at: string
          user_id: string
          vat: number
          wht: number
        }
        Insert: {
          category?: string
          created_at?: string
          gross?: number
          has_certificate?: boolean
          id?: string
          meta?: Json
          month: string
          net?: number
          receive_date?: string | null
          source?: string
          source_quotation_id?: string | null
          updated_at?: string
          user_id: string
          vat?: number
          wht?: number
        }
        Update: {
          category?: string
          created_at?: string
          gross?: number
          has_certificate?: boolean
          id?: string
          meta?: Json
          month?: string
          net?: number
          receive_date?: string | null
          source?: string
          source_quotation_id?: string | null
          updated_at?: string
          user_id?: string
          vat?: number
          wht?: number
        }
        Relationships: [
          {
            foreignKeyName: "finance_incomes_source_quotation_id_fkey"
            columns: ["source_quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_invoice_status_history: {
        Row: {
          changed_at: string
          from_status: string | null
          id: string
          invoice_id: string
          note: string | null
          to_status: string
          user_id: string
        }
        Insert: {
          changed_at?: string
          from_status?: string | null
          id?: string
          invoice_id: string
          note?: string | null
          to_status: string
          user_id: string
        }
        Update: {
          changed_at?: string
          from_status?: string | null
          id?: string
          invoice_id?: string
          note?: string | null
          to_status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_invoice_status_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "finance_clients_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_payment_methods: {
        Row: {
          created_at: string
          id: string
          kind: string
          label: string
          last4: string | null
          meta: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          label: string
          last4?: string | null
          meta?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          label?: string
          last4?: string | null
          meta?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_settings: {
        Row: {
          created_at: string
          expense_method: string
          meta: Json
          monthly_goal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expense_method?: string
          meta?: Json
          monthly_goal?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expense_method?: string
          meta?: Json
          monthly_goal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_subscriptions: {
        Row: {
          category: string | null
          created_at: string
          cycle: string
          id: string
          is_active: boolean
          meta: Json
          name: string
          next_renewal: string | null
          payment_method_id: string | null
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          cycle?: string
          id?: string
          is_active?: boolean
          meta?: Json
          name: string
          next_renewal?: string | null
          payment_method_id?: string | null
          price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          cycle?: string
          id?: string
          is_active?: boolean
          meta?: Json
          name?: string
          next_renewal?: string | null
          payment_method_id?: string | null
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_tax_scenarios: {
        Row: {
          created_at: string
          id: string
          name: string
          payload: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          payload?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          payload?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hq_agents: {
        Row: {
          accent_color: string
          created_at: string
          department: string
          emoji: string
          id: string
          is_active: boolean
          max_tokens: number
          model: string
          name: string
          skills: string[]
          slug: string
          sort_order: number
          system_prompt: string
          temperature: number
          title: string
          tools: Json
          updated_at: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          department: string
          emoji?: string
          id?: string
          is_active?: boolean
          max_tokens?: number
          model?: string
          name: string
          skills?: string[]
          slug: string
          sort_order?: number
          system_prompt: string
          temperature?: number
          title: string
          tools?: Json
          updated_at?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          department?: string
          emoji?: string
          id?: string
          is_active?: boolean
          max_tokens?: number
          model?: string
          name?: string
          skills?: string[]
          slug?: string
          sort_order?: number
          system_prompt?: string
          temperature?: number
          title?: string
          tools?: Json
          updated_at?: string
        }
        Relationships: []
      }
      hq_conversations: {
        Row: {
          agent_slug: string
          archived: boolean
          created_at: string
          id: string
          pinned_context: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_slug: string
          archived?: boolean
          created_at?: string
          id?: string
          pinned_context?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_slug?: string
          archived?: boolean
          created_at?: string
          id?: string
          pinned_context?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hq_conversations_agent_slug_fkey"
            columns: ["agent_slug"]
            isOneToOne: false
            referencedRelation: "hq_agents"
            referencedColumns: ["slug"]
          },
        ]
      }
      hq_messages: {
        Row: {
          agent_slug: string | null
          content: string
          conversation_id: string
          cost_estimate: number
          created_at: string
          id: string
          metadata: Json
          role: string
          tokens_used: number
        }
        Insert: {
          agent_slug?: string | null
          content?: string
          conversation_id: string
          cost_estimate?: number
          created_at?: string
          id?: string
          metadata?: Json
          role: string
          tokens_used?: number
        }
        Update: {
          agent_slug?: string | null
          content?: string
          conversation_id?: string
          cost_estimate?: number
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
          tokens_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "hq_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "hq_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      hq_outputs: {
        Row: {
          agent_slug: string
          attachments: Json
          content: string
          created_at: string
          id: string
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          task_id: string | null
          title: string
          type: string
        }
        Insert: {
          agent_slug: string
          attachments?: Json
          content?: string
          created_at?: string
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          task_id?: string | null
          title?: string
          type?: string
        }
        Update: {
          agent_slug?: string
          attachments?: Json
          content?: string
          created_at?: string
          id?: string
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          task_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "hq_outputs_agent_slug_fkey"
            columns: ["agent_slug"]
            isOneToOne: false
            referencedRelation: "hq_agents"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "hq_outputs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "hq_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      hq_tasks: {
        Row: {
          assigned_agent: string | null
          context_refs: Json
          created_at: string
          created_by: string | null
          created_by_agent: string | null
          description: string
          id: string
          output: Json
          parent_task_id: string | null
          priority: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_agent?: string | null
          context_refs?: Json
          created_at?: string
          created_by?: string | null
          created_by_agent?: string | null
          description?: string
          id?: string
          output?: Json
          parent_task_id?: string | null
          priority?: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_agent?: string | null
          context_refs?: Json
          created_at?: string
          created_by?: string | null
          created_by_agent?: string | null
          description?: string
          id?: string
          output?: Json
          parent_task_id?: string | null
          priority?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hq_tasks_assigned_agent_fkey"
            columns: ["assigned_agent"]
            isOneToOne: false
            referencedRelation: "hq_agents"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "hq_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "hq_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      job_events: {
        Row: {
          amount: number | null
          created_at: string
          id: string
          image_url: string | null
          job_id: string
          kind: string
          meta: Json
          note: string
          title: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          job_id: string
          kind: string
          meta?: Json
          note?: string
          title?: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          job_id?: string
          kind?: string
          meta?: Json
          note?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_events_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_milestones: {
        Row: {
          created_at: string
          done: boolean
          done_at: string | null
          id: string
          job_id: string
          label: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          done?: boolean
          done_at?: string | null
          id?: string
          job_id: string
          label?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          done?: boolean
          done_at?: string | null
          id?: string
          job_id?: string
          label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_milestones_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_slips: {
        Row: {
          id: string
          job_id: string
          note: string
          rejected: boolean
          rejection_reason: string
          slip_url: string
          uploaded_at: string
          verified: boolean
        }
        Insert: {
          id?: string
          job_id: string
          note?: string
          rejected?: boolean
          rejection_reason?: string
          slip_url: string
          uploaded_at?: string
          verified?: boolean
        }
        Update: {
          id?: string
          job_id?: string
          note?: string
          rejected?: boolean
          rejection_reason?: string
          slip_url?: string
          uploaded_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "job_slips_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_steps: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name_en: string
          name_th: string
          step_index: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name_en: string
          name_th: string
          step_index: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name_en?: string
          name_th?: string
          step_index?: number
        }
        Relationships: []
      }
      job_tracker_step_comments: {
        Row: {
          author_role: string
          body: string
          created_at: string
          id: string
          job_id: string
          step_index: number
        }
        Insert: {
          author_role: string
          body: string
          created_at?: string
          id?: string
          job_id: string
          step_index: number
        }
        Update: {
          author_role?: string
          body?: string
          created_at?: string
          id?: string
          job_id?: string
          step_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_tracker_step_comments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_trackers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_trackers: {
        Row: {
          amount_due: number
          brief_id: string | null
          client_id: string | null
          client_name: string
          created_at: string
          current_step: number
          deadline: string | null
          deposit_paid: boolean
          deposit_percent: number
          final_file_url: string | null
          final_paid: boolean
          id: string
          meta: Json
          notes: string
          payment_info: string
          payment_qr_url: string | null
          preview_image_url: string | null
          progress_percent: number
          quotation_id: string | null
          share_token: string
          start_date: string | null
          status: string
          title: string
          total_amount: number
          tracking_code: string
          unlocked: boolean
          updated_at: string
          user_id: string
          watermark_text: string
        }
        Insert: {
          amount_due?: number
          brief_id?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          current_step?: number
          deadline?: string | null
          deposit_paid?: boolean
          deposit_percent?: number
          final_file_url?: string | null
          final_paid?: boolean
          id?: string
          meta?: Json
          notes?: string
          payment_info?: string
          payment_qr_url?: string | null
          preview_image_url?: string | null
          progress_percent?: number
          quotation_id?: string | null
          share_token?: string
          start_date?: string | null
          status?: string
          title?: string
          total_amount?: number
          tracking_code?: string
          unlocked?: boolean
          updated_at?: string
          user_id: string
          watermark_text?: string
        }
        Update: {
          amount_due?: number
          brief_id?: string | null
          client_id?: string | null
          client_name?: string
          created_at?: string
          current_step?: number
          deadline?: string | null
          deposit_paid?: boolean
          deposit_percent?: number
          final_file_url?: string | null
          final_paid?: boolean
          id?: string
          meta?: Json
          notes?: string
          payment_info?: string
          payment_qr_url?: string | null
          preview_image_url?: string | null
          progress_percent?: number
          quotation_id?: string | null
          share_token?: string
          start_date?: string | null
          status?: string
          title?: string
          total_amount?: number
          tracking_code?: string
          unlocked?: boolean
          updated_at?: string
          user_id?: string
          watermark_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_trackers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "saved_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string | null
          currency: string | null
          current_step_index: number | null
          description: string | null
          final_file_url: string | null
          id: string
          notes: string | null
          payment_status: string | null
          price: number | null
          share_token: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
          watermark_preview_url: string | null
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string | null
          currency?: string | null
          current_step_index?: number | null
          description?: string | null
          final_file_url?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          price?: number | null
          share_token?: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          watermark_preview_url?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string | null
          currency?: string | null
          current_step_index?: number | null
          description?: string | null
          final_file_url?: string | null
          id?: string
          notes?: string | null
          payment_status?: string | null
          price?: number | null
          share_token?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          watermark_preview_url?: string | null
        }
        Relationships: []
      }
      payment_notifications: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          environment: string
          event_type: string
          id: string
          message: string
          metadata: Json
          price_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          environment?: string
          event_type: string
          id?: string
          message?: string
          metadata?: Json
          price_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          environment?: string
          event_type?: string
          id?: string
          message?: string
          metadata?: Json
          price_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_receipts: {
        Row: {
          id: string
          job_id: string
          notes: string | null
          receipt_url: string
          status: string | null
          uploaded_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          id?: string
          job_id: string
          notes?: string | null
          receipt_url: string
          status?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          id?: string
          job_id?: string
          notes?: string | null
          receipt_url?: string
          status?: string | null
          uploaded_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_receipts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      planner_posts: {
        Row: {
          approval_status: string
          caption: string | null
          client_feedback: string | null
          client_id: string
          created_at: string
          custom_platforms: string[] | null
          id: string
          image_url: string | null
          link: string | null
          meta: Json
          platforms: string[]
          post_date: string
          post_time: string
          status: string
          title: string
          updated_at: string
          user_id: string
          vision_canvas_id: string | null
        }
        Insert: {
          approval_status?: string
          caption?: string | null
          client_feedback?: string | null
          client_id: string
          created_at?: string
          custom_platforms?: string[] | null
          id?: string
          image_url?: string | null
          link?: string | null
          meta?: Json
          platforms?: string[]
          post_date: string
          post_time?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          vision_canvas_id?: string | null
        }
        Update: {
          approval_status?: string
          caption?: string | null
          client_feedback?: string | null
          client_id?: string
          created_at?: string
          custom_platforms?: string[] | null
          id?: string
          image_url?: string | null
          link?: string | null
          meta?: Json
          platforms?: string[]
          post_date?: string
          post_time?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          vision_canvas_id?: string | null
        }
        Relationships: []
      }
      planner_share_links: {
        Row: {
          client_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          month: string
          share_token: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          month: string
          share_token?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          month?: string
          share_token?: string
          user_id?: string
        }
        Relationships: []
      }
      price_guide_events: {
        Row: {
          applied: boolean
          complexity: string
          created_at: string
          days: number
          id: string
          job_type: string
          max_price: number
          min_price: number
          quantity: number
          reasoning: string | null
          recommended_price: number
          user_id: string
        }
        Insert: {
          applied?: boolean
          complexity?: string
          created_at?: string
          days?: number
          id?: string
          job_type: string
          max_price?: number
          min_price?: number
          quantity?: number
          reasoning?: string | null
          recommended_price?: number
          user_id: string
        }
        Update: {
          applied?: boolean
          complexity?: string
          created_at?: string
          days?: number
          id?: string
          job_type?: string
          max_price?: number
          min_price?: number
          quantity?: number
          reasoning?: string | null
          recommended_price?: number
          user_id?: string
        }
        Relationships: []
      }
      price_guide_feedback: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          job_type: string | null
          rating: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          job_type?: string | null
          rating: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          job_type?: string | null
          rating?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_guide_overrides: {
        Row: {
          created_at: string
          job_type: string
          max_price: number
          min_price: number
          note: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          job_type: string
          max_price?: number
          min_price?: number
          note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          job_type?: string
          max_price?: number
          min_price?: number
          note?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string
          active_studio_id: string | null
          address: string | null
          archetype: string | null
          archetype_secondary: string | null
          avatar_url: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_name: string | null
          bio: string
          brand_name: string | null
          cover_url: string
          created_at: string
          currency: string
          deactivated_at: string | null
          deactivated_by: string | null
          display_name: string | null
          email: string | null
          experience: Json
          facebook: string
          freelance_field: string | null
          frozen_at: string | null
          frozen_reason: string
          id: string
          instagram: string
          is_active: boolean
          is_verified: boolean
          last_active_at: string | null
          line_id: string
          location: string
          logo_url: string | null
          notify_email: boolean
          notify_hire: boolean
          notify_job_match: boolean
          onboarding_completed: boolean
          onboarding_data: Json
          payment_qr_url: string | null
          persona: string | null
          phone: string | null
          preferred_categories: string[]
          preferred_employment_types: string[]
          purge_after: string | null
          purged_at: string | null
          risk_score: number
          role: string
          skills: string[]
          social_link: string | null
          subscription_seats: number
          subscription_tier: string
          tagline: string | null
          tax_id: string | null
          terms: string | null
          tester_applied_at: string | null
          tester_approved: boolean
          updated_at: string
          user_id: string
          username: string | null
          verified_at: string | null
          verified_by: string | null
          website: string
        }
        Insert: {
          account_status?: string
          active_studio_id?: string | null
          address?: string | null
          archetype?: string | null
          archetype_secondary?: string | null
          avatar_url?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bio?: string
          brand_name?: string | null
          cover_url?: string
          created_at?: string
          currency?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          display_name?: string | null
          email?: string | null
          experience?: Json
          facebook?: string
          freelance_field?: string | null
          frozen_at?: string | null
          frozen_reason?: string
          id?: string
          instagram?: string
          is_active?: boolean
          is_verified?: boolean
          last_active_at?: string | null
          line_id?: string
          location?: string
          logo_url?: string | null
          notify_email?: boolean
          notify_hire?: boolean
          notify_job_match?: boolean
          onboarding_completed?: boolean
          onboarding_data?: Json
          payment_qr_url?: string | null
          persona?: string | null
          phone?: string | null
          preferred_categories?: string[]
          preferred_employment_types?: string[]
          purge_after?: string | null
          purged_at?: string | null
          risk_score?: number
          role?: string
          skills?: string[]
          social_link?: string | null
          subscription_seats?: number
          subscription_tier?: string
          tagline?: string | null
          tax_id?: string | null
          terms?: string | null
          tester_applied_at?: string | null
          tester_approved?: boolean
          updated_at?: string
          user_id: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string
        }
        Update: {
          account_status?: string
          active_studio_id?: string | null
          address?: string | null
          archetype?: string | null
          archetype_secondary?: string | null
          avatar_url?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          bio?: string
          brand_name?: string | null
          cover_url?: string
          created_at?: string
          currency?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          display_name?: string | null
          email?: string | null
          experience?: Json
          facebook?: string
          freelance_field?: string | null
          frozen_at?: string | null
          frozen_reason?: string
          id?: string
          instagram?: string
          is_active?: boolean
          is_verified?: boolean
          last_active_at?: string | null
          line_id?: string
          location?: string
          logo_url?: string | null
          notify_email?: boolean
          notify_hire?: boolean
          notify_job_match?: boolean
          onboarding_completed?: boolean
          onboarding_data?: Json
          payment_qr_url?: string | null
          persona?: string | null
          phone?: string | null
          preferred_categories?: string[]
          preferred_employment_types?: string[]
          purge_after?: string | null
          purged_at?: string | null
          risk_score?: number
          role?: string
          skills?: string[]
          social_link?: string | null
          subscription_seats?: number
          subscription_tier?: string
          tagline?: string | null
          tax_id?: string | null
          terms?: string | null
          tester_applied_at?: string | null
          tester_approved?: boolean
          updated_at?: string
          user_id?: string
          username?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string
        }
        Relationships: []
      }
      project_members: {
        Row: {
          email: string | null
          id: string
          invited_at: string
          joined_at: string | null
          project_id: string
          revenue_percent: number
          role: string
          user_id: string | null
        }
        Insert: {
          email?: string | null
          id?: string
          invited_at?: string
          joined_at?: string | null
          project_id: string
          revenue_percent?: number
          role?: string
          user_id?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          invited_at?: string
          joined_at?: string | null
          project_id?: string
          revenue_percent?: number
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "shared_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          handover_note: string | null
          id: string
          project_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          handover_note?: string | null
          id?: string
          project_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          handover_note?: string | null
          id?: string
          project_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "project_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "shared_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          addons: Json
          brief_id: string | null
          client_address: string | null
          client_email: string | null
          client_line_id: string | null
          client_name: string
          client_phone: string | null
          client_tax_id: string | null
          contract_accepted: boolean
          contract_signed_at: string | null
          contract_signer_ip: string | null
          created_at: string
          deposit_due_date: string | null
          deposit_preset: number
          difficulties: Json
          discount_kind: string
          discount_value: number
          due_date: string | null
          end_date: string | null
          hidden_cost: number
          hourly_days: number
          hourly_hours: number
          id: string
          invoice_issued_at: string | null
          invoice_number: string | null
          items: Json
          last_followup_at: string | null
          late_fee_percent: number
          milestones: Json
          notes: string
          number: string
          paid_at: string | null
          paid_partial: number
          payment_terms: string
          pdf_exported_at: string | null
          project_name: string
          receipt_issued_at: string | null
          receipt_number: string | null
          revisions_count: number
          start_date: string | null
          status: string
          timeline_enabled: boolean
          updated_at: string
          user_id: string
          vat_enabled: boolean
          vat_rate: number
          wht_enabled: boolean
          wht_rate: number
        }
        Insert: {
          addons?: Json
          brief_id?: string | null
          client_address?: string | null
          client_email?: string | null
          client_line_id?: string | null
          client_name?: string
          client_phone?: string | null
          client_tax_id?: string | null
          contract_accepted?: boolean
          contract_signed_at?: string | null
          contract_signer_ip?: string | null
          created_at?: string
          deposit_due_date?: string | null
          deposit_preset?: number
          difficulties?: Json
          discount_kind?: string
          discount_value?: number
          due_date?: string | null
          end_date?: string | null
          hidden_cost?: number
          hourly_days?: number
          hourly_hours?: number
          id?: string
          invoice_issued_at?: string | null
          invoice_number?: string | null
          items?: Json
          last_followup_at?: string | null
          late_fee_percent?: number
          milestones?: Json
          notes?: string
          number: string
          paid_at?: string | null
          paid_partial?: number
          payment_terms?: string
          pdf_exported_at?: string | null
          project_name?: string
          receipt_issued_at?: string | null
          receipt_number?: string | null
          revisions_count?: number
          start_date?: string | null
          status?: string
          timeline_enabled?: boolean
          updated_at?: string
          user_id: string
          vat_enabled?: boolean
          vat_rate?: number
          wht_enabled?: boolean
          wht_rate?: number
        }
        Update: {
          addons?: Json
          brief_id?: string | null
          client_address?: string | null
          client_email?: string | null
          client_line_id?: string | null
          client_name?: string
          client_phone?: string | null
          client_tax_id?: string | null
          contract_accepted?: boolean
          contract_signed_at?: string | null
          contract_signer_ip?: string | null
          created_at?: string
          deposit_due_date?: string | null
          deposit_preset?: number
          difficulties?: Json
          discount_kind?: string
          discount_value?: number
          due_date?: string | null
          end_date?: string | null
          hidden_cost?: number
          hourly_days?: number
          hourly_hours?: number
          id?: string
          invoice_issued_at?: string | null
          invoice_number?: string | null
          items?: Json
          last_followup_at?: string | null
          late_fee_percent?: number
          milestones?: Json
          notes?: string
          number?: string
          paid_at?: string | null
          paid_partial?: number
          payment_terms?: string
          pdf_exported_at?: string | null
          project_name?: string
          receipt_issued_at?: string | null
          receipt_number?: string | null
          revisions_count?: number
          start_date?: string | null
          status?: string
          timeline_enabled?: boolean
          updated_at?: string
          user_id?: string
          vat_enabled?: boolean
          vat_rate?: number
          wht_enabled?: boolean
          wht_rate?: number
        }
        Relationships: []
      }
      review_pins: {
        Row: {
          board: string
          created_at: string
          id: string
          note: string
          updated_at: string
          user_id: string
          x: number
          y: number
        }
        Insert: {
          board?: string
          created_at?: string
          id?: string
          note?: string
          updated_at?: string
          user_id: string
          x: number
          y: number
        }
        Update: {
          board?: string
          created_at?: string
          id?: string
          note?: string
          updated_at?: string
          user_id?: string
          x?: number
          y?: number
        }
        Relationships: []
      }
      saved_clients: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          industry: string | null
          line_id: string | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          preferred_channel: string | null
          rate: number | null
          social: string | null
          tags: string[]
          tax_id: string | null
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          line_id?: string | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          preferred_channel?: string | null
          rate?: number | null
          social?: string | null
          tags?: string[]
          tax_id?: string | null
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          industry?: string | null
          line_id?: string | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          preferred_channel?: string | null
          rate?: number | null
          social?: string | null
          tags?: string[]
          tax_id?: string | null
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_projects: {
        Row: {
          created_at: string
          guest_token: string | null
          guest_visible_columns: string[]
          host_user_id: string
          id: string
          pricing_model: string
          quotation_id: string | null
          status: string
          tax_split_config: Json
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          guest_token?: string | null
          guest_visible_columns?: string[]
          host_user_id: string
          id?: string
          pricing_model?: string
          quotation_id?: string | null
          status?: string
          tax_split_config?: Json
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          guest_token?: string | null
          guest_visible_columns?: string[]
          host_user_id?: string
          id?: string
          pricing_model?: string
          quotation_id?: string | null
          status?: string
          tax_split_config?: Json
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_projects_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      spec_checklist_state: {
        Row: {
          checked_ids: Json
          created_at: string
          custom_items: Json
          id: string
          template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_ids?: Json
          created_at?: string
          custom_items?: Json
          id?: string
          template: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_ids?: Json
          created_at?: string
          custom_items?: Json
          id?: string
          template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supplier_files: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          supplier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          supplier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_files_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_links: {
        Row: {
          created_at: string
          id: string
          label: string
          supplier_id: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          supplier_id: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          supplier_id?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_links_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string | null
          contact_name: string | null
          cover_image_url: string | null
          created_at: string
          email: string | null
          id: string
          is_shared: boolean
          line_id: string | null
          map_url: string | null
          meta: Json
          name: string
          notes: string
          phone: string | null
          rate_note: string | null
          rating: number
          share_hidden_fields: string[]
          share_token: string | null
          tags: string[]
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_shared?: boolean
          line_id?: string | null
          map_url?: string | null
          meta?: Json
          name: string
          notes?: string
          phone?: string | null
          rate_note?: string | null
          rating?: number
          share_hidden_fields?: string[]
          share_token?: string | null
          tags?: string[]
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_shared?: boolean
          line_id?: string | null
          map_url?: string | null
          meta?: Json
          name?: string
          notes?: string
          phone?: string | null
          rate_note?: string | null
          rating?: number
          share_hidden_fields?: string[]
          share_token?: string | null
          tags?: string[]
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          admin_note: string | null
          category: string
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          resolution_note: string | null
          source: string
          source_feature: string | null
          status: string
          ticket_number: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolution_note?: string | null
          source?: string
          source_feature?: string | null
          status?: string
          ticket_number: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          category?: string
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolution_note?: string | null
          source?: string
          source_feature?: string | null
          status?: string
          ticket_number?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      survey_responses: {
        Row: {
          answers: Json
          created_at: string
          guest_id: string | null
          id: string
          persona: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          answers?: Json
          created_at?: string
          guest_id?: string | null
          id?: string
          persona: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          created_at?: string
          guest_id?: string | null
          id?: string
          persona?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tester_applications: {
        Row: {
          alias_name: string | null
          contact_channel: string | null
          contact_email: string | null
          contact_line: string | null
          contact_value: string | null
          created_at: string
          feature_request: string | null
          full_name: string
          id: string
          main_field: string
          main_field_other: string | null
          pain_points: string[]
          pain_points_other: string | null
          quotation_method: string[]
          quotation_method_other: string | null
          updated_at: string
          user_id: string
          years_experience: string
        }
        Insert: {
          alias_name?: string | null
          contact_channel?: string | null
          contact_email?: string | null
          contact_line?: string | null
          contact_value?: string | null
          created_at?: string
          feature_request?: string | null
          full_name: string
          id?: string
          main_field: string
          main_field_other?: string | null
          pain_points?: string[]
          pain_points_other?: string | null
          quotation_method?: string[]
          quotation_method_other?: string | null
          updated_at?: string
          user_id: string
          years_experience: string
        }
        Update: {
          alias_name?: string | null
          contact_channel?: string | null
          contact_email?: string | null
          contact_line?: string | null
          contact_value?: string | null
          created_at?: string
          feature_request?: string | null
          full_name?: string
          id?: string
          main_field?: string
          main_field_other?: string | null
          pain_points?: string[]
          pain_points_other?: string | null
          quotation_method?: string[]
          quotation_method_other?: string | null
          updated_at?: string
          user_id?: string
          years_experience?: string
        }
        Relationships: []
      }
      ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          storage_path: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          storage_path: string
          ticket_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          storage_path?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_events: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          event_type: string
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          event_type: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          event_type?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      typo_pairs: {
        Row: {
          body_font: string
          body_weight: number
          created_at: string
          heading_font: string
          heading_weight: number
          id: string
          label: string | null
          mood: string
          user_id: string
        }
        Insert: {
          body_font: string
          body_weight?: number
          created_at?: string
          heading_font: string
          heading_weight?: number
          id?: string
          label?: string | null
          mood: string
          user_id: string
        }
        Update: {
          body_font?: string
          body_weight?: number
          created_at?: string
          heading_font?: string
          heading_weight?: number
          id?: string
          label?: string | null
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_color_palettes: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          environment: string
          id: string
          lifetime_purchased: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          environment?: string
          id?: string
          lifetime_purchased?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          environment?: string
          id?: string
          lifetime_purchased?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_device_events: {
        Row: {
          browser: string | null
          created_at: string
          device_type: string
          id: string
          os: string | null
          pixel_ratio: number | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          browser?: string | null
          created_at?: string
          device_type: string
          id?: string
          os?: string | null
          pixel_ratio?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          browser?: string | null
          created_at?: string
          device_type?: string
          id?: string
          os?: string | null
          pixel_ratio?: number | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_colors: {
        Row: {
          created_at: string
          hex: string
          id: string
          label: string | null
          palette_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hex: string
          id?: string
          label?: string | null
          palette_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          hex?: string
          id?: string
          label?: string | null
          palette_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_colors_palette_id_fkey"
            columns: ["palette_id"]
            isOneToOne: false
            referencedRelation: "user_color_palettes"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_canvas_reactions: {
        Row: {
          block_id: string | null
          canvas_id: string
          created_at: string
          guest_name: string | null
          id: string
          kind: string
          message: string | null
          pin_x: number | null
          pin_y: number | null
          target_block_id: string | null
        }
        Insert: {
          block_id?: string | null
          canvas_id: string
          created_at?: string
          guest_name?: string | null
          id?: string
          kind: string
          message?: string | null
          pin_x?: number | null
          pin_y?: number | null
          target_block_id?: string | null
        }
        Update: {
          block_id?: string | null
          canvas_id?: string
          created_at?: string
          guest_name?: string | null
          id?: string
          kind?: string
          message?: string | null
          pin_x?: number | null
          pin_y?: number | null
          target_block_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vision_canvas_reactions_canvas_id_fkey"
            columns: ["canvas_id"]
            isOneToOne: false
            referencedRelation: "vision_canvases"
            referencedColumns: ["id"]
          },
        ]
      }
      vision_canvases: {
        Row: {
          blocks: Json
          brief_id: string | null
          created_at: string
          designer_note: string
          font: string | null
          id: string
          is_public: boolean
          keywords: string[]
          live_text: string
          palette: string[]
          share_token: string
          title: string
          updated_at: string
          user_id: string
          voting_enabled: boolean
        }
        Insert: {
          blocks?: Json
          brief_id?: string | null
          created_at?: string
          designer_note?: string
          font?: string | null
          id?: string
          is_public?: boolean
          keywords?: string[]
          live_text?: string
          palette?: string[]
          share_token?: string
          title?: string
          updated_at?: string
          user_id: string
          voting_enabled?: boolean
        }
        Update: {
          blocks?: Json
          brief_id?: string | null
          created_at?: string
          designer_note?: string
          font?: string | null
          id?: string
          is_public?: boolean
          keywords?: string[]
          live_text?: string
          palette?: string[]
          share_token?: string
          title?: string
          updated_at?: string
          user_id?: string
          voting_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vision_canvases_brief_id_fkey"
            columns: ["brief_id"]
            isOneToOne: false
            referencedRelation: "design_briefs"
            referencedColumns: ["id"]
          },
        ]
      }
      work_projects: {
        Row: {
          archived: boolean
          client: string
          client_id: string | null
          comments: Json
          created_at: string
          deadline: string | null
          done_at: string | null
          id: string
          meta: Json
          priority: string
          rate: number | null
          revision_limit: number
          revisions: number
          status: string
          title: string
          updated_at: string
          user_id: string
          versions: Json
        }
        Insert: {
          archived?: boolean
          client?: string
          client_id?: string | null
          comments?: Json
          created_at?: string
          deadline?: string | null
          done_at?: string | null
          id?: string
          meta?: Json
          priority?: string
          rate?: number | null
          revision_limit?: number
          revisions?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
          versions?: Json
        }
        Update: {
          archived?: boolean
          client?: string
          client_id?: string | null
          comments?: Json
          created_at?: string
          deadline?: string | null
          done_at?: string | null
          id?: string
          meta?: Json
          priority?: string
          rate?: number | null
          revision_limit?: number
          revisions?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          versions?: Json
        }
        Relationships: []
      }
    }
    Views: {
      ecosystem_notifications: {
        Row: {
          app: string | null
          body: string | null
          created_at: string | null
          id: string | null
          is_dismissed: boolean | null
          is_read: boolean | null
          kind: string | null
          link: string | null
          metadata: Json | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          app?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          kind?: string | null
          link?: string | null
          metadata?: Json | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          app?: string | null
          body?: string | null
          created_at?: string | null
          id?: string | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          kind?: string | null
          link?: string | null
          metadata?: Json | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_avatar: string | null
          actor_name: string | null
          actor_user_id: string | null
          created_at: string | null
          id: string | null
          message: string | null
          project_id: string | null
          read: boolean | null
          type: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          actor_avatar?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          id?: string | null
          message?: string | null
          project_id?: string | null
          read?: boolean | null
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          actor_avatar?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          id?: string | null
          message?: string | null
          project_id?: string | null
          read?: boolean | null
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      so1o_notifications: {
        Row: {
          actor_avatar: string | null
          actor_name: string | null
          actor_user_id: string | null
          created_at: string | null
          id: string | null
          message: string | null
          project_id: string | null
          read: boolean | null
          type: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          actor_avatar?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          id?: string | null
          message?: string | null
          project_id?: string | null
          read?: boolean | null
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          actor_avatar?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          id?: string | null
          message?: string | null
          project_id?: string | null
          read?: boolean | null
          type?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _catalog_demo_uid: { Args: { i: number }; Returns: string }
      _delete_storage_object: {
        Args: { _bucket: string; _path: string }
        Returns: undefined
      }
      _storage_path_from_url: {
        Args: { _bucket: string; _url: string }
        Returns: string
      }
      admin_list_profiles_safe: {
        Args: never
        Returns: {
          archetype: string
          archetype_secondary: string
          avatar_url: string
          brand_name: string
          created_at: string
          currency: string
          deactivated_at: string
          deactivated_by: string
          display_name: string
          email: string
          freelance_field: string
          id: string
          is_active: boolean
          last_active_at: string
          onboarding_completed: boolean
          onboarding_data: Json
          persona: string
          purge_after: string
          purged_at: string
          subscription_seats: number
          subscription_tier: string
          tagline: string
          tester_applied_at: string
          tester_approved: boolean
          updated_at: string
          user_id: string
        }[]
      }
      auto_update_invoice_statuses: { Args: never; Returns: number }
      check_and_increment_ai_usage: {
        Args: { _feature: string; _limit: number; _user_id: string }
        Returns: Json
      }
      confirm_brief_by_token: {
        Args: { _name: string; _signature: string; _token: string }
        Returns: boolean
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      force_purge_user: {
        Args: { _admin_user_id?: string; _target_user_id: string }
        Returns: {
          auth_deleted: boolean
          user_id: string
          warnings: string[]
        }[]
      }
      format_ticket_number: { Args: { n: number }; Returns: string }
      gen_tracking_code: { Args: never; Returns: string }
      get_brief_by_token: { Args: { _token: string }; Returns: Json }
      get_calculator_usage_count: { Args: never; Returns: number }
      get_daily_active_users: {
        Args: { _days?: number }
        Returns: {
          active_users: number
          day: string
          total_events: number
        }[]
      }
      get_db_usage_stats: { Args: never; Returns: Json }
      get_device_breakdown: {
        Args: { _by?: string; _days?: number }
        Returns: {
          label: string
          sessions: number
          unique_users: number
        }[]
      }
      get_device_usage_stats: {
        Args: { _days?: number }
        Returns: {
          device_type: string
          pct: number
          sessions: number
          unique_users: number
        }[]
      }
      get_feature_data_stats: {
        Args: never
        Returns: {
          avg_per_user: number
          feature: string
          max_per_user: number
          table_name: string
          total_records: number
          unique_users: number
        }[]
      }
      get_feature_usage_stats: {
        Args: { _days?: number }
        Returns: {
          feature: string
          last_used: string
          total_events: number
          unique_users: number
        }[]
      }
      get_feature_usage_trend: {
        Args: { _days?: number }
        Returns: {
          day: string
          events: number
          feature: string
          unique_users: number
        }[]
      }
      get_hourly_active_distribution: {
        Args: { _days?: number }
        Returns: {
          events: number
          hour: number
          unique_users: number
        }[]
      }
      get_planner_posts_by_token: {
        Args: { _token: string }
        Returns: {
          approval_status: string
          caption: string
          client_feedback: string
          client_id: string
          custom_platforms: string[]
          id: string
          image_url: string
          link: string
          platforms: string[]
          post_date: string
          post_time: string
          status: string
          title: string
        }[]
      }
      get_planner_share_by_token: {
        Args: { _token: string }
        Returns: {
          client_id: string
          created_at: string
          expires_at: string
          id: string
          month: string
          share_token: string
          user_id: string
        }[]
      }
      get_public_profile: {
        Args: { _user_id: string }
        Returns: {
          avatar_url: string
          brand_name: string
          created_at: string
          display_name: string
          logo_url: string
          social_link: string
          tagline: string
          user_id: string
        }[]
      }
      get_shared_supplier_by_token: { Args: { _token: string }; Returns: Json }
      get_storage_usage_stats: { Args: never; Returns: Json }
      get_top_active_users: {
        Args: { _days?: number; _limit?: number }
        Returns: {
          active_days: number
          display_name: string
          email: string
          last_seen: string
          total_events: number
          user_id: string
        }[]
      }
      get_top_subscriptions: {
        Args: { _limit?: number }
        Returns: {
          avg_price: number
          category: string
          name: string
          total_monthly_value: number
          total_subscriptions: number
          user_count: number
        }[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_article_view: { Args: { _slug: string }; Returns: undefined }
      log_user_activity: { Args: { _activity_type?: string }; Returns: boolean }
      match_ai_knowledge: {
        Args: {
          match_count?: number
          match_feature: string
          query_embedding: string
        }
        Returns: {
          feature: string
          id: string
          ideal_response: string
          prompt: string
          similarity: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      purge_inactive_profile_data: {
        Args: { _limit?: number }
        Returns: {
          auth_deleted: boolean
          user_id: string
          warnings: string[]
        }[]
      }
      purge_old_storage: { Args: never; Returns: undefined }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      submit_post_approval: {
        Args: {
          _feedback: string
          _post_id: string
          _share_token: string
          _status: string
        }
        Returns: undefined
      }
      sync_user_tier: { Args: { _user_id: string }; Returns: undefined }
      touch_last_active: { Args: never; Returns: undefined }
      update_brief_by_token: {
        Args: {
          _audience?: Json
          _client_info?: Json
          _design_direction?: Json
          _notes?: string
          _project_overview?: Json
          _references?: Json
          _tech_specs?: Json
          _timeline_budget?: Json
          _token: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  shared: {
    Tables: {
      notifications: {
        Row: {
          app: string
          body: string
          created_at: string
          id: string
          is_dismissed: boolean
          is_read: boolean
          kind: string
          link: string
          metadata: Json
          title: string
          user_id: string
        }
        Insert: {
          app: string
          body?: string
          created_at?: string
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          kind: string
          link?: string
          metadata?: Json
          title: string
          user_id: string
        }
        Update: {
          app?: string
          body?: string
          created_at?: string
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          kind?: string
          link?: string
          metadata?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      push_notification: {
        Args: {
          _app: string
          _body?: string
          _kind: string
          _link?: string
          _metadata?: Json
          _title: string
          _user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  so1o: {
    Tables: {
      notifications: {
        Row: {
          actor_avatar: string | null
          actor_name: string
          actor_user_id: string | null
          created_at: string
          id: string
          message: string
          project_id: string | null
          read: boolean
          type: string
          url: string | null
          user_id: string
        }
        Insert: {
          actor_avatar?: string | null
          actor_name?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          message?: string
          project_id?: string | null
          read?: boolean
          type: string
          url?: string | null
          user_id: string
        }
        Update: {
          actor_avatar?: string | null
          actor_name?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          message?: string
          project_id?: string | null
          read?: boolean
          type?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  anthem: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
  shared: {
    Enums: {},
  },
  so1o: {
    Enums: {},
  },
} as const
