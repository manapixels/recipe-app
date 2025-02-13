export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      event_reservations: {
        Row: {
          event_id: string;
          id: string;
          payment_amount: number | null;
          payment_currency: string | null;
          payment_status: string;
          reservation_status: string;
          stripe_payment_intent_id: string | null;
          stripe_receipt_url: string | null;
          tickets_bought: number;
          user_id: string;
        };
        Insert: {
          event_id: string;
          id?: string;
          payment_amount?: number | null;
          payment_currency?: string | null;
          payment_status?: string;
          reservation_status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_receipt_url?: string | null;
          tickets_bought?: number;
          user_id: string;
        };
        Update: {
          event_id?: string;
          id?: string;
          payment_amount?: number | null;
          payment_currency?: string | null;
          payment_status?: string;
          reservation_status?: string;
          stripe_payment_intent_id?: string | null;
          stripe_receipt_url?: string | null;
          tickets_bought?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_reservations_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_reservations_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events_with_host_data';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_reservations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_reservations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles_with_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'event_reservations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles_with_roles';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          category: Database['public']['Enums']['event_categories'][];
          created_at: string;
          created_by: string;
          date_end: string;
          date_start: string;
          description: string | null;
          id: string;
          image_banner_url: string | null;
          image_thumbnail_url: string | null;
          location_address: string;
          location_country: string;
          location_name: string;
          metadata: Json | null;
          name: string;
          price: number | null;
          price_currency: string;
          price_stripe_id: string | null;
          slots: number;
          slug: string;
          status: Database['public']['Enums']['event_status'];
        };
        Insert: {
          category?: Database['public']['Enums']['event_categories'][];
          created_at?: string;
          created_by: string;
          date_end?: string;
          date_start?: string;
          description?: string | null;
          id?: string;
          image_banner_url?: string | null;
          image_thumbnail_url?: string | null;
          location_address: string;
          location_country: string;
          location_name: string;
          metadata?: Json | null;
          name: string;
          price?: number | null;
          price_currency?: string;
          price_stripe_id?: string | null;
          slots?: number;
          slug: string;
          status?: Database['public']['Enums']['event_status'];
        };
        Update: {
          category?: Database['public']['Enums']['event_categories'][];
          created_at?: string;
          created_by?: string;
          date_end?: string;
          date_start?: string;
          description?: string | null;
          id?: string;
          image_banner_url?: string | null;
          image_thumbnail_url?: string | null;
          location_address?: string;
          location_country?: string;
          location_name?: string;
          metadata?: Json | null;
          name?: string;
          price?: number | null;
          price_currency?: string;
          price_stripe_id?: string | null;
          slots?: number;
          slug?: string;
          status?: Database['public']['Enums']['event_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'events_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles_with_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'events_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles_with_roles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          billing_address: Json | null;
          birthmonth: number | null;
          birthyear: number | null;
          id: string;
          name: string;
          payment_method: Json | null;
          stripe_customer_id: string | null;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          billing_address?: Json | null;
          birthmonth?: number | null;
          birthyear?: number | null;
          id: string;
          name: string;
          payment_method?: Json | null;
          stripe_customer_id?: string | null;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          billing_address?: Json | null;
          birthmonth?: number | null;
          birthyear?: number | null;
          id?: string;
          name?: string;
          payment_method?: Json | null;
          stripe_customer_id?: string | null;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      role_permissions: {
        Row: {
          id: number;
          permission: Database['public']['Enums']['app_permission'];
          role: Database['public']['Enums']['app_role'];
        };
        Insert: {
          id?: number;
          permission: Database['public']['Enums']['app_permission'];
          role: Database['public']['Enums']['app_role'];
        };
        Update: {
          id?: number;
          permission?: Database['public']['Enums']['app_permission'];
          role?: Database['public']['Enums']['app_role'];
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: number;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Insert: {
          id?: number;
          role: Database['public']['Enums']['app_role'];
          user_id: string;
        };
        Update: {
          id?: number;
          role?: Database['public']['Enums']['app_role'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles_with_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles_with_roles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      events_with_host_data: {
        Row: {
          category: Database['public']['Enums']['event_categories'][] | null;
          created_at: string | null;
          created_by: Json | null;
          date_end: string | null;
          date_start: string | null;
          description: string | null;
          id: string | null;
          image_banner_url: string | null;
          image_thumbnail_url: string | null;
          location_address: string | null;
          location_country: string | null;
          location_name: string | null;
          name: string | null;
          price: number | null;
          price_currency: string | null;
          price_stripe_id: string | null;
          sign_ups: number | null;
          slots: number | null;
          slug: string | null;
          status: Database['public']['Enums']['event_status'] | null;
        };
        Relationships: [];
      };
      profiles_with_events: {
        Row: {
          avatar_url: string | null;
          events_hosted: Json | null;
          events_joined: Json | null;
          events_joined_count: number | null;
          guests_hosted: number | null;
          id: string | null;
          name: string | null;
          user_roles: Database['public']['Enums']['app_role'][] | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles_with_roles: {
        Row: {
          avatar_url: string | null;
          birthmonth: number | null;
          birthyear: number | null;
          id: string | null;
          name: string | null;
          roles: Database['public']['Enums']['app_role'][] | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      authorize: {
        Args: {
          requested_permission: Database['public']['Enums']['app_permission'];
          user_id: string;
        };
        Returns: boolean;
      };
      sign_up_for_event: {
        Args: {
          p_event_id: string;
          p_user_id: string;
          p_tickets_bought: number;
        };
        Returns: string;
      };
      slugify: {
        Args: {
          value: string;
        };
        Returns: string;
      };
      unaccent: {
        Args: {
          '': string;
        };
        Returns: string;
      };
      unaccent_init: {
        Args: {
          '': unknown;
        };
        Returns: unknown;
      };
    };
    Enums: {
      app_permission: 'events.create' | 'events.delete';
      app_role: 'admin' | 'host' | 'participant';
      currencies: 'sgd';
      event_categories: 'speed-dating' | 'retreats';
      event_status: 'draft' | 'reserving' | 'reservations-closed' | 'cancelled' | 'completed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
        Database['public']['Views'])
    ? (Database['public']['Tables'] &
        Database['public']['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database['public']['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
    ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database['public']['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
    ? Database['public']['Enums'][PublicEnumNameOrOptions]
    : never;
