export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          id: string;
          name: string;
          preferred_unit_system: Database['public']['Enums']['unit_system'] | null;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          id: string;
          name: string;
          preferred_unit_system?: Database['public']['Enums']['unit_system'] | null;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          id?: string;
          name?: string;
          preferred_unit_system?: Database['public']['Enums']['unit_system'] | null;
          updated_at?: string;
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
      recipe_changes: {
        Row: {
          change_type: string;
          created_at: string | null;
          id: string;
          new_value: Json | null;
          old_value: Json | null;
          reason: string | null;
          recipe_version_id: string;
        };
        Insert: {
          change_type: string;
          created_at?: string | null;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
          reason?: string | null;
          recipe_version_id: string;
        };
        Update: {
          change_type?: string;
          created_at?: string | null;
          id?: string;
          new_value?: Json | null;
          old_value?: Json | null;
          reason?: string | null;
          recipe_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_changes_recipe_version_id_fkey';
            columns: ['recipe_version_id'];
            isOneToOne: false;
            referencedRelation: 'recipe_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      recipe_diary_entries: {
        Row: {
          content: string;
          cooking_date: string | null;
          created_at: string | null;
          created_by: string;
          entry_type: string;
          id: string;
          images: string[] | null;
          recipe_version_id: string;
        };
        Insert: {
          content: string;
          cooking_date?: string | null;
          created_at?: string | null;
          created_by: string;
          entry_type: string;
          id?: string;
          images?: string[] | null;
          recipe_version_id: string;
        };
        Update: {
          content?: string;
          cooking_date?: string | null;
          created_at?: string | null;
          created_by?: string;
          entry_type?: string;
          id?: string;
          images?: string[] | null;
          recipe_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_diary_entries_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_diary_entries_recipe_version_id_fkey';
            columns: ['recipe_version_id'];
            isOneToOne: false;
            referencedRelation: 'recipe_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      recipe_versions: {
        Row: {
          change_summary: string | null;
          created_at: string | null;
          created_by: string;
          fork_count: number | null;
          id: string;
          is_public: boolean | null;
          original_recipe_id: string;
          parent_version_id: string | null;
          recipe_id: string;
          success_rating: number | null;
          version_number: string;
        };
        Insert: {
          change_summary?: string | null;
          created_at?: string | null;
          created_by: string;
          fork_count?: number | null;
          id?: string;
          is_public?: boolean | null;
          original_recipe_id: string;
          parent_version_id?: string | null;
          recipe_id: string;
          success_rating?: number | null;
          version_number: string;
        };
        Update: {
          change_summary?: string | null;
          created_at?: string | null;
          created_by?: string;
          fork_count?: number | null;
          id?: string;
          is_public?: boolean | null;
          original_recipe_id?: string;
          parent_version_id?: string | null;
          recipe_id?: string;
          success_rating?: number | null;
          version_number?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipe_versions_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_versions_original_recipe_id_fkey';
            columns: ['original_recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_versions_original_recipe_id_fkey';
            columns: ['original_recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes_with_author_data';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_versions_parent_version_id_fkey';
            columns: ['parent_version_id'];
            isOneToOne: false;
            referencedRelation: 'recipe_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_versions_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipe_versions_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes_with_author_data';
            referencedColumns: ['id'];
          },
        ];
      };
      recipes: {
        Row: {
          category: Database['public']['Enums']['recipe_categories'];
          created_at: string;
          created_by: string;
          description: string | null;
          difficulty: number;
          id: string;
          image_banner_url: string | null;
          image_thumbnail_url: string | null;
          ingredients: Json;
          instructions: Json;
          metadata: Json | null;
          name: string;
          nutrition_info: Json | null;
          servings: number;
          slug: string;
          status: Database['public']['Enums']['recipe_status'];
          subcategory: Database['public']['Enums']['recipe_subcategories'];
          total_time: number;
          version_id: string | null;
        };
        Insert: {
          category?: Database['public']['Enums']['recipe_categories'];
          created_at?: string;
          created_by: string;
          description?: string | null;
          difficulty?: number;
          id?: string;
          image_banner_url?: string | null;
          image_thumbnail_url?: string | null;
          ingredients?: Json;
          instructions?: Json;
          metadata?: Json | null;
          name: string;
          nutrition_info?: Json | null;
          servings?: number;
          slug: string;
          status?: Database['public']['Enums']['recipe_status'];
          subcategory: Database['public']['Enums']['recipe_subcategories'];
          total_time?: number;
          version_id?: string | null;
        };
        Update: {
          category?: Database['public']['Enums']['recipe_categories'];
          created_at?: string;
          created_by?: string;
          description?: string | null;
          difficulty?: number;
          id?: string;
          image_banner_url?: string | null;
          image_thumbnail_url?: string | null;
          ingredients?: Json;
          instructions?: Json;
          metadata?: Json | null;
          name?: string;
          nutrition_info?: Json | null;
          servings?: number;
          slug?: string;
          status?: Database['public']['Enums']['recipe_status'];
          subcategory?: Database['public']['Enums']['recipe_subcategories'];
          total_time?: number;
          version_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'recipes_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'recipes_version_id_fkey';
            columns: ['version_id'];
            isOneToOne: false;
            referencedRelation: 'recipe_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      user_favorite_recipes: {
        Row: {
          created_at: string;
          recipe_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          recipe_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          recipe_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_favorite_recipes_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_favorite_recipes_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes_with_author_data';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_favorite_recipes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      recipes_with_author_data: {
        Row: {
          category: Database['public']['Enums']['recipe_categories'] | null;
          created_at: string | null;
          created_by: Json | null;
          description: string | null;
          difficulty: number | null;
          id: string | null;
          image_banner_url: string | null;
          image_thumbnail_url: string | null;
          ingredients: Json | null;
          instructions: Json | null;
          name: string | null;
          servings: number | null;
          slug: string | null;
          status: Database['public']['Enums']['recipe_status'] | null;
          total_time: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      create_initial_recipe_versions: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      generate_version_number: {
        Args: {
          original_recipe_id: string;
          parent_version_id: string;
        };
        Returns: string;
      };
      increment_fork_count: {
        Args: {
          original_version_id: string;
        };
        Returns: undefined;
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
      recipe_categories: 'sweets' | 'breads';
      recipe_status: 'draft' | 'published' | 'archived';
      recipe_subcategories:
        | 'cookies'
        | 'muffins.cupcakes'
        | 'roll.cakes'
        | 'tarts'
        | 'pies'
        | 'brownies'
        | 'donuts'
        | 'ice.cream'
        | 'puddings'
        | 'chocolates'
        | 'candies'
        | 'cheesecakes'
        | 'macarons'
        | 'traditional.sweets'
        | 'sourdough'
        | 'flatbreads'
        | 'sweet.breads'
        | 'buns.rolls'
        | 'bagels'
        | 'croissants'
        | 'baguettes'
        | 'natural-yeast';
      unit_system: 'metric' | 'imperial';
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
