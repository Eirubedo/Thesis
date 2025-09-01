export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hypertension_profiles: {
        Row: {
          id: string
          user_id: string
          age: number | null
          gender: string | null
          height: number | null
          weight: number | null
          activity_level: string | null
          smoking_status: string | null
          alcohol_consumption: string | null
          family_history: boolean | null
          current_medications: string | null
          medical_conditions: string | null
          stress_level: number | null
          sleep_hours: number | null
          dietary_restrictions: string | null
          emergency_contact: string | null
          doctor_name: string | null
          doctor_phone: string | null
          preferred_language: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          smoking_status?: string | null
          alcohol_consumption?: string | null
          family_history?: boolean | null
          current_medications?: string | null
          medical_conditions?: string | null
          stress_level?: number | null
          sleep_hours?: number | null
          dietary_restrictions?: string | null
          emergency_contact?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          preferred_language?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          gender?: string | null
          height?: number | null
          weight?: number | null
          activity_level?: string | null
          smoking_status?: string | null
          alcohol_consumption?: string | null
          family_history?: boolean | null
          current_medications?: string | null
          medical_conditions?: string | null
          stress_level?: number | null
          sleep_hours?: number | null
          dietary_restrictions?: string | null
          emergency_contact?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          preferred_language?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bp_readings: {
        Row: {
          id: string
          user_id: string
          systolic: number
          diastolic: number
          heart_rate: number | null
          notes: string | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          systolic: number
          diastolic: number
          heart_rate?: number | null
          notes?: string | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          systolic?: number
          diastolic?: number
          heart_rate?: number | null
          notes?: string | null
          recorded_at?: string
          created_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      medication_logs: {
        Row: {
          id: string
          user_id: string
          medication_id: string
          date: string
          scheduled_time: string
          taken_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          medication_id: string
          date: string
          scheduled_time: string
          taken_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          medication_id?: string
          date?: string
          scheduled_time?: string
          taken_at?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      health_assessments: {
        Row: {
          id: string
          user_id: string
          assessment_type: string
          responses: any
          score: number | null
          recommendations: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_type: string
          responses: any
          score?: number | null
          recommendations?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_type?: string
          responses?: any
          score?: number | null
          recommendations?: string | null
          created_at?: string
        }
      }
      progress_tracking: {
        Row: {
          id: string
          user_id: string
          category: string
          item_id: string
          completed_at: string | null
          practice_time: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          item_id: string
          completed_at?: string | null
          practice_time?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          item_id?: string
          completed_at?: string | null
          practice_time?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
