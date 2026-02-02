# Full Assessment Variables - Asesmen Lengkap

This document maps all variables from the Dify prompt to the Supabase database table `full_assessments`.

## Database Table: `full_assessments`

All variables are stored in the `full_assessments` table with the following structure:

### Patient Profile
- `user_id` - Foreign key to users table (UUID, required)
- `full_name` - From users.full_name
- `age` - Calculated from users.birth_date
- `gender` - From users.gender

### Clinical History
- `chief_complaint` - Keluhan utama
- `illness_history` - Riwayat penyakit sekarang
- `medical_history` - Riwayat medis/penyakit dahulu
- `family_medical_history` - Riwayat medis keluarga

### Psychological Symptoms (Gejala Psikologis)
- `hallucinations` - Halusinasi
- `delusions` - Waham
- `thought_disorders` - Gangguan pikiran
- `memory_issues` - Gangguan memori
- `orientation_issues` - Gangguan orientasi
- `consciousness_level` - Tingkat kesadaran

### Emotional State (Keadaan Emosi)
- `mood_description` - Deskripsi mood/suasana hati
- `affect_description` - Deskripsi afek
- `anxiety_level` - Tingkat kecemasan
- `depression_symptoms` - Gejala depresi

### Self-Perception (Konsep Diri)
- `self_concept` - Konsep diri
- `ideal_self` - Diri ideal
- `self_esteem` - Harga diri
- `identity_confusion` - Kebingungan identitas

### Body Image (Gambaran Diri)
- `body_image_perception` - Persepsi citra tubuh
- `physical_concerns` - Kekhawatiran fisik

### Social Relationships (Hubungan Sosial)
- `family_relationships` - Hubungan dengan keluarga
- `social_relationships` - Hubungan sosial/pertemanan
- `communication_patterns` - Pola komunikasi
- `social_support` - Dukungan sosial

### Activities & Daily Living (Aktivitas Sehari-hari)
- `daily_activities` - Aktivitas harian
- `work_status` - Status pekerjaan
- `hobbies` - Hobi
- `sleep_pattern` - Pola tidur
- `appetite_pattern` - Pola makan/nafsu makan

### Spiritual Aspects (Aspek Spiritual)
- `spiritual_beliefs` - Keyakinan spiritual
- `spiritual_practices` - Praktik spiritual
- `spiritual_support` - Dukungan spiritual

### Safety & Risk Assessment (Keselamatan & Risiko)
- `suicidal_ideation` - Ide bunuh diri (boolean)
- `self_harm_history` - Riwayat menyakiti diri (boolean)
- `violence_risk` - Risiko kekerasan (boolean)
- `safety_concerns` - Kekhawatiran keselamatan lainnya

### Coping & Stress Management
- `coping_mechanisms` - Mekanisme koping
- `stress_management` - Cara mengatasi stres

### Vital Signs (Tanda-tanda Vital)
- `blood_pressure` - Tekanan darah
- `heart_rate` - Detak jantung
- `temperature` - Suhu tubuh
- `respiratory_rate` - Laju pernapasan

### Assessment & Diagnosis
- `nursing_diagnosis` - Diagnosis keperawatan
- `assessment_notes` - Catatan asesmen tambahan

### Timestamps
- `created_at` - Timestamp when assessment was created
- `updated_at` - Timestamp when assessment was last updated

## API Endpoints

### Save or Update Full Assessment
```
POST /api/full-assessment
Body: {
  user_id: string (required),
  // ... all other assessment fields
}
```

### Get Full Assessment
```
GET /api/full-assessment?user_id={userId}
Response: { assessment: { ...assessmentData } }
```

### Get User Context (includes full assessment)
```
GET /api/user-context?user_id={userId}
Response: {
  profile: {...},
  hypertension: {...},
  bloodPressure: {...},
  medications: [...],
  activities: [...],
  fullAssessment: {...}  // Full assessment data included here
}
```

## Integration with Dify

The full assessment data is automatically included in the user context sent to Dify. The `buildContextString` function in `/app/api/dify/chat/route.ts` formats all assessment variables into a readable context string that Dify can use to provide personalized responses.

All variables are mapped exactly as specified in the Dify prompt requirements.

## Usage in Chat

When a user chats with the AI assistant:
1. The system fetches all user context including the full assessment
2. The assessment data is formatted into Indonesian text
3. This context is appended to the user's message
4. Dify uses this context to provide personalized, clinically-informed responses

The full assessment ensures the AI assistant has comprehensive patient information for the "Asesmen Lengkap" feature.
