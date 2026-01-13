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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          bg_color: string
          color: string
          created_at: string
          description: string | null
          display_order: number
          icon: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          bg_color?: string
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          bg_color?: string
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_order: number
          icon: string
          id: string
          is_private: boolean
          name: string
          post_count: number
          required_tier: Database["public"]["Enums"]["membership_tier"] | null
          search_vector: unknown
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_private?: boolean
          name: string
          post_count?: number
          required_tier?: Database["public"]["Enums"]["membership_tier"] | null
          search_vector?: unknown
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number
          icon?: string
          id?: string
          is_private?: boolean
          name?: string
          post_count?: number
          required_tier?: Database["public"]["Enums"]["membership_tier"] | null
          search_vector?: unknown
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          depth: number
          downvotes: number
          id: string
          images: string[] | null
          is_accepted: boolean
          is_removed: boolean
          parent_id: string | null
          post_id: string
          removal_reason: string | null
          removed_at: string | null
          removed_by: string | null
          search_vector: unknown
          updated_at: string
          upvotes: number
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          depth?: number
          downvotes?: number
          id?: string
          images?: string[] | null
          is_accepted?: boolean
          is_removed?: boolean
          parent_id?: string | null
          post_id: string
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          search_vector?: unknown
          updated_at?: string
          upvotes?: number
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          depth?: number
          downvotes?: number
          id?: string
          images?: string[] | null
          is_accepted?: boolean
          is_removed?: boolean
          parent_id?: string | null
          post_id?: string
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          search_vector?: unknown
          updated_at?: string
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "comments_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      conduct_agreements: {
        Row: {
          agreed_at: string
          id: string
          ip_address: string | null
          user_id: string
          version: string
        }
        Insert: {
          agreed_at?: string
          id?: string
          ip_address?: string | null
          user_id: string
          version?: string
        }
        Update: {
          agreed_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "conduct_agreements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conduct_agreements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      content_violations: {
        Row: {
          content_preview: string
          created_at: string
          detected_terms: string[] | null
          expires_at: string | null
          id: string
          overridden_by: string | null
          override_reason: string | null
          restriction_type: Database["public"]["Enums"]["restriction_type"]
          status: Database["public"]["Enums"]["violation_status"]
          strike_number: number
          user_id: string
          violation_type: Database["public"]["Enums"]["violation_type"]
        }
        Insert: {
          content_preview: string
          created_at?: string
          detected_terms?: string[] | null
          expires_at?: string | null
          id?: string
          overridden_by?: string | null
          override_reason?: string | null
          restriction_type: Database["public"]["Enums"]["restriction_type"]
          status?: Database["public"]["Enums"]["violation_status"]
          strike_number?: number
          user_id: string
          violation_type: Database["public"]["Enums"]["violation_type"]
        }
        Update: {
          content_preview?: string
          created_at?: string
          detected_terms?: string[] | null
          expires_at?: string | null
          id?: string
          overridden_by?: string | null
          override_reason?: string | null
          restriction_type?: Database["public"]["Enums"]["restriction_type"]
          status?: Database["public"]["Enums"]["violation_status"]
          strike_number?: number
          user_id?: string
          violation_type?: Database["public"]["Enums"]["violation_type"]
        }
        Relationships: [
          {
            foreignKeyName: "content_violations_overridden_by_fkey"
            columns: ["overridden_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_violations_overridden_by_fkey"
            columns: ["overridden_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_violations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_violations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          action: Database["public"]["Enums"]["moderation_action"]
          comment_id: string | null
          created_at: string
          details: Json | null
          id: string
          moderator_id: string
          post_id: string | null
          reason: string | null
          target_user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["moderation_action"]
          comment_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id: string
          post_id?: string | null
          reason?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["moderation_action"]
          comment_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          moderator_id?: string
          post_id?: string | null
          reason?: string | null
          target_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moderation_logs_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_logs_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "moderation_logs_moderator_id_fkey"
            columns: ["moderator_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "moderation_logs_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moderation_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "moderation_logs_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_comment_replies: boolean
          email_mentions: boolean
          email_thread_replies: boolean
          email_weekly_digest: boolean
          id: string
          notification_frequency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_comment_replies?: boolean
          email_mentions?: boolean
          email_thread_replies?: boolean
          email_weekly_digest?: boolean
          id?: string
          notification_frequency?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_comment_replies?: boolean
          email_mentions?: boolean
          email_thread_replies?: boolean
          email_weekly_digest?: boolean
          id?: string
          notification_frequency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          comment_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          post_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          comment_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          post_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          comment_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          post_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_notifications: {
        Row: {
          author_id: string
          comment_id: string | null
          content_preview: string
          created_at: string
          id: string
          is_sent: boolean
          notification_type: string
          recipient_user_id: string
          sent_at: string | null
          thread_id: string
        }
        Insert: {
          author_id: string
          comment_id?: string | null
          content_preview: string
          created_at?: string
          id?: string
          is_sent?: boolean
          notification_type: string
          recipient_user_id: string
          sent_at?: string | null
          thread_id: string
        }
        Update: {
          author_id?: string
          comment_id?: string | null
          content_preview?: string
          created_at?: string
          id?: string
          is_sent?: boolean
          notification_type?: string
          recipient_user_id?: string
          sent_at?: string | null
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pending_notifications_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          category_id: string
          comment_count: number
          content: string
          created_at: string
          downvotes: number
          has_accepted_answer: boolean
          id: string
          images: string[] | null
          is_locked: boolean
          is_pinned: boolean
          is_removed: boolean
          removal_reason: string | null
          removed_at: string | null
          removed_by: string | null
          search_vector: unknown
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string
          upvotes: number
          view_count: number
        }
        Insert: {
          author_id: string
          category_id: string
          comment_count?: number
          content: string
          created_at?: string
          downvotes?: number
          has_accepted_answer?: boolean
          id?: string
          images?: string[] | null
          is_locked?: boolean
          is_pinned?: boolean
          is_removed?: boolean
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          search_vector?: unknown
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          upvotes?: number
          view_count?: number
        }
        Update: {
          author_id?: string
          category_id?: string
          comment_count?: number
          content?: string
          created_at?: string
          downvotes?: number
          has_accepted_answer?: boolean
          id?: string
          images?: string[] | null
          is_locked?: boolean
          is_pinned?: boolean
          is_removed?: boolean
          removal_reason?: string | null
          removed_at?: string | null
          removed_by?: string | null
          search_vector?: unknown
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          upvotes?: number
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "posts_removed_by_fkey"
            columns: ["removed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email_verified: boolean
          id: string
          is_banned: boolean
          is_restricted: boolean
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          onboarding_completed: boolean
          post_count: number
          reply_count: number
          reputation: number
          restriction_expires_at: string | null
          strike_count: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean
          id?: string
          is_banned?: boolean
          is_restricted?: boolean
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          onboarding_completed?: boolean
          post_count?: number
          reply_count?: number
          reputation?: number
          restriction_expires_at?: string | null
          strike_count?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_verified?: boolean
          id?: string
          is_banned?: boolean
          is_restricted?: boolean
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          onboarding_completed?: boolean
          post_count?: number
          reply_count?: number
          reputation?: number
          restriction_expires_at?: string | null
          strike_count?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          comment_id: string | null
          created_at: string
          description: string | null
          id: string
          post_id: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string | null
          resolution_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["report_status"]
          updated_at: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string | null
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string | null
          resolution_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      shadow_bans: {
        Row: {
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shadow_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shadow_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shadow_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "shadow_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_type: string
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
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_badges: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      votes: {
        Row: {
          comment_id: string | null
          created_at: string
          id: string
          post_id: string | null
          user_id: string
          vote_type: number
        }
        Insert: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id: string
          vote_type: number
        }
        Update: {
          comment_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          membership_tier: Database["public"]["Enums"]["membership_tier"] | null
          post_count: number | null
          reply_count: number | null
          reputation: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          membership_tier?:
            | Database["public"]["Enums"]["membership_tier"]
            | null
          post_count?: number | null
          reply_count?: number | null
          reputation?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          membership_tier?:
            | Database["public"]["Enums"]["membership_tier"]
            | null
          post_count?: number | null
          reply_count?: number | null
          reputation?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_content_strike: {
        Args: {
          _content_preview: string
          _detected_terms: string[]
          _user_id: string
          _violation_type: Database["public"]["Enums"]["violation_type"]
        }
        Returns: {
          message: string
          restriction_type: Database["public"]["Enums"]["restriction_type"]
          strike_number: number
        }[]
      }
      can_access_category: {
        Args: { _category_id: string; _user_id: string }
        Returns: boolean
      }
      can_access_premium: { Args: { _user_id: string }; Returns: boolean }
      can_moderate: { Args: { _user_id: string }; Returns: boolean }
      can_post: { Args: { _user_id: string }; Returns: boolean }
      check_rate_limit: {
        Args: { _activity_type: string; _user_id: string }
        Returns: boolean
      }
      get_active_strike_count: { Args: { _user_id: string }; Returns: number }
      get_membership_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["membership_tier"]
      }
      has_agreed_to_conduct: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      invoke_digest_emails: { Args: { frequency: string }; Returns: undefined }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_shadow_banned: { Args: { _user_id: string }; Returns: boolean }
      override_violation: {
        Args: { _moderator_id: string; _reason: string; _violation_id: string }
        Returns: boolean
      }
      search_forum: {
        Args: { search_query: string }
        Returns: {
          author_username: string
          category_name: string
          category_slug: string
          content: string
          created_at: string
          id: string
          is_private: boolean
          rank: number
          result_type: string
          slug: string
          title: string
        }[]
      }
    }
    Enums: {
      app_role: "user" | "moderator" | "admin"
      category_visibility: "public" | "pro" | "elite"
      content_status: "active" | "locked" | "removed"
      membership_tier: "free" | "pro" | "elite"
      moderation_action:
        | "warning"
        | "edit"
        | "remove"
        | "lock"
        | "unlock"
        | "shadow_ban"
        | "unshadow_ban"
        | "ban"
        | "unban"
      report_reason:
        | "spam"
        | "harassment"
        | "misinformation"
        | "unsafe_advice"
        | "inappropriate"
        | "off_topic"
        | "other"
      report_status: "pending" | "reviewed" | "resolved" | "dismissed"
      restriction_type: "warning" | "temp_restriction" | "suspension"
      user_role: "user" | "moderator" | "admin"
      violation_status: "active" | "overridden" | "expired" | "appealed"
      violation_type:
        | "profanity"
        | "hate_speech"
        | "threats"
        | "harassment"
        | "personal_attack"
        | "other"
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
      app_role: ["user", "moderator", "admin"],
      category_visibility: ["public", "pro", "elite"],
      content_status: ["active", "locked", "removed"],
      membership_tier: ["free", "pro", "elite"],
      moderation_action: [
        "warning",
        "edit",
        "remove",
        "lock",
        "unlock",
        "shadow_ban",
        "unshadow_ban",
        "ban",
        "unban",
      ],
      report_reason: [
        "spam",
        "harassment",
        "misinformation",
        "unsafe_advice",
        "inappropriate",
        "off_topic",
        "other",
      ],
      report_status: ["pending", "reviewed", "resolved", "dismissed"],
      restriction_type: ["warning", "temp_restriction", "suspension"],
      user_role: ["user", "moderator", "admin"],
      violation_status: ["active", "overridden", "expired", "appealed"],
      violation_type: [
        "profanity",
        "hate_speech",
        "threats",
        "harassment",
        "personal_attack",
        "other",
      ],
    },
  },
} as const
