export interface User {
  id: string
  phone_number: string
  password_hash: string
  full_name: string
  gender?: "male" | "female" | "other"
  birth_date?: string
  address?: string
  postal_code?: string
  created_at: string
  updated_at: string
}

export interface HypertensionProfile {
  id: string
  user_id: string
  medical_history?: string
  risk_factors?: string[]
  family_history?: boolean
  smoking_status?: "never" | "former" | "current"
  alcohol_consumption?: "none" | "light" | "moderate" | "heavy"
  exercise_frequency?: "none" | "rare" | "weekly" | "daily"
  stress_level?: number
  created_at: string
  updated_at: string
}

export interface Medication {
  id: string
  user_id: string
  name: string
  dosage?: string
  is_active: boolean
  notes?: string // JSON string containing {"times": ["08:00", "20:00"], "notes": "Additional notes"}
  created_at: string
  updated_at: string
}

export interface BPReading {
  id: string
  user_id: string
  systolic: number
  diastolic: number
  heart_rate?: number
  measurement_date: string
  notes?: string
  category?: "normal" | "elevated" | "stage1" | "stage2" | "crisis"
  created_at: string
}

export interface MedicationLog {
  id: string
  user_id: string
  medication_id: string
  taken_at: string
  was_taken: boolean
  notes?: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  conversation_type: "chat" | "assessment" | "education" | "quick-assessment" | "knowledge-test"
  dify_conversation_id?: string
  title?: string
  summary?: string
  message_count: number
  started_at: string
  ended_at?: string
  is_archived: boolean
  created_at: string
  updated_at: string
}

export interface ConversationMessage {
  id: string
  conversation_id: string
  message_id?: string
  content: string
  role: "user" | "assistant"
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>
      }
      hypertension_profiles: {
        Row: HypertensionProfile
        Insert: Omit<HypertensionProfile, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<HypertensionProfile, "id" | "created_at" | "updated_at">>
      }
      medications: {
        Row: Medication
        Insert: Omit<Medication, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Medication, "id" | "created_at" | "updated_at">>
      }
      bp_readings: {
        Row: BPReading
        Insert: Omit<BPReading, "id" | "created_at">
        Update: Partial<Omit<BPReading, "id" | "created_at">>
      }
      medication_logs: {
        Row: MedicationLog
        Insert: Omit<MedicationLog, "id" | "created_at">
        Update: Partial<Omit<MedicationLog, "id" | "created_at">>
      }
      conversations: {
        Row: Conversation
        Insert: Omit<Conversation, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Conversation, "id" | "created_at" | "updated_at">>
      }
      conversation_messages: {
        Row: ConversationMessage
        Insert: Omit<ConversationMessage, "id" | "created_at">
        Update: Partial<Omit<ConversationMessage, "id" | "created_at">>
      }
    }
  }
}
