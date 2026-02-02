# Monitoring & Evaluation (Monev) Database Structure

## Overview
The Monev database supports the structured collection and tracking of symptoms, abilities, and progress across multiple diagnoses for hypertension management.

## Database Tables

### 1. `user_diagnoses`
Tracks which diagnoses each user has selected for monitoring.

**Columns:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users)
- `diagnosis_type`: TEXT (HT, AS, GCT, RBD)
- `diagnosed_date`: TIMESTAMP
- `notes`: TEXT
- `is_active`: BOOLEAN (default: true)

**Usage:** When a user selects a diagnosis type in the Monev chat, save it here.

### 2. `symptom_assessments`
Records symptoms experienced by users for each diagnosis.

**Columns:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users)
- `diagnosis_type`: TEXT (HT, AS, GCT, RBD)
- `symptoms`: JSONB (Array of symptom objects)
- `assessment_id`: UUID (Links to assessment_progress)
- `assessed_at`: TIMESTAMP

**Symptom Object Structure:**
```json
{
  "name": "Sakit kepala",
  "severity": "sedang",
  "frequency": "kadang-kadang",
  "duration": "2 minggu",
  "notes": "Biasanya pagi hari"
}
```

**Usage:** Store symptoms collected during Monev chat.

### 3. `ability_assessments`
Records abilities that users know (cognitive) vs. actually do (psychomotor).

**Columns:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users)
- `diagnosis_type`: TEXT (HT, AS, GCT, RBD)
- `abilities_known`: JSONB (Array of ability names user knows about)
- `abilities_practiced`: JSONB (Array of ability names user actually does)
- `assessment_id`: UUID (Links to assessment_progress)
- `assessed_at`: TIMESTAMP

**Example:**
```json
{
  "abilities_known": [
    "Mengukur tekanan darah",
    "Diet rendah garam",
    "Olahraga teratur"
  ],
  "abilities_practiced": [
    "Mengukur tekanan darah",
    "Diet rendah garam"
  ]
}
```

**Gap Analysis:** `abilities_known` - `abilities_practiced` = abilities that need practice support

**Usage:** Store abilities collected during Monev chat.

### 4. `ability_practice_details`
Detailed information about how users practice each ability.

**Columns:**
- `id`: UUID (Primary Key)
- `ability_assessment_id`: UUID (Foreign Key → ability_assessments)
- `user_id`: UUID (Foreign Key → users)
- `ability_name`: TEXT
- `practice_frequency`: TEXT (setiap hari, 3x seminggu, jarang)
- `practice_duration`: TEXT (5 menit, 30 menit, etc.)
- `challenges`: TEXT (What makes it difficult?)
- `support_needed`: TEXT (What help do they need?)
- `notes`: TEXT

**Usage:** Store detailed practice information for each ability.

### 5. `monev_action_plans`
Action plans and recommendations generated from assessments.

**Columns:**
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key → users)
- `diagnosis_type`: TEXT
- `priority_symptoms`: JSONB (Symptoms to address first)
- `ability_gaps`: JSONB (Abilities known but not practiced)
- `recommendations`: JSONB (Specific action items)
- `follow_up_date`: DATE
- `notes`: TEXT
- `created_at`: TIMESTAMP

**Usage:** Store AI-generated action plans based on assessment results.

## API Endpoints

### Diagnoses
- `POST /api/monev/diagnoses` - Save user diagnosis
- `GET /api/monev/diagnoses?user_id={id}` - Get user's active diagnoses

### Symptoms
- `POST /api/monev/symptoms` - Save symptom assessment
- `GET /api/monev/symptoms?user_id={id}&diagnosis_type={type}` - Get symptoms

### Abilities
- `POST /api/monev/abilities` - Save ability assessment (with practice details)
- `GET /api/monev/abilities?user_id={id}&diagnosis_type={type}` - Get abilities with details

### Assessment Progress
- `POST /api/monev/check-assessed` - Check if data collection is complete
- `POST /api/assessment-progress` - Update progress status

## Integration with Dify Chat

### Flow for "Monitoring dan Evaluasi" (Quick Assessment):

1. **User starts chat** → Status: "started"
   
2. **User selects diagnosis** → Save to `user_diagnoses`
   ```javascript
   POST /api/monev/diagnoses
   {
     user_id: "...",
     diagnosis_type: "HT",
     diagnosed_date: "2024-01-15"
   }
   ```

3. **Chat collects symptoms** → Save to `symptom_assessments`
   ```javascript
   POST /api/monev/symptoms
   {
     user_id: "...",
     diagnosis_type: "HT",
     symptoms: [
       { name: "Sakit kepala", severity: "sedang", frequency: "kadang-kadang" }
     ]
   }
   ```

4. **Chat collects abilities** → Save to `ability_assessments` + `ability_practice_details`
   ```javascript
   POST /api/monev/abilities
   {
     user_id: "...",
     diagnosis_type: "HT",
     abilities_known: ["Mengukur TD", "Diet rendah garam"],
     abilities_practiced: ["Mengukur TD"],
     practice_details: [
       {
         ability_name: "Mengukur TD",
         practice_frequency: "setiap hari",
         challenges: "Kadang lupa",
         support_needed: "Reminder otomatis"
       }
     ]
   }
   ```

5. **Check if assessed** → Status: "assessed"
   ```javascript
   POST /api/monev/check-assessed
   {
     user_id: "...",
     assessment_type: "quick-assessment"
   }
   // Returns: { assessed: true, hasSymptoms: true, hasAbilities: true }
   ```

6. **Chat provides summary & recommendations** → Status: "completed"

## Progress Status Detection

The system automatically detects status changes:

- **Started**: When chat is initiated
- **Assessed**: When both symptoms AND abilities are recorded in the database
- **Completed**: When chat reaches conclusion with recommendations

## Data Usage

### Viewing Progress Over Time
Query `symptom_assessments` and `ability_assessments` ordered by `assessed_at` to show:
- Symptom trends (improving, worsening, stable)
- Ability adoption progress (gap closing over time)
- Compliance patterns

### Generating Reports
Combine data from multiple tables to create comprehensive reports:
- Current symptoms by diagnosis
- Ability gaps requiring intervention
- Practice consistency metrics
- Recommended action items

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Service role can access all data for admin/reporting purposes

## Notes

- Use JSONB for flexible symptom/ability structure
- Unique constraints prevent duplicate entries per user+diagnosis
- Timestamps track when data was collected for trend analysis
- Foreign keys maintain referential integrity
