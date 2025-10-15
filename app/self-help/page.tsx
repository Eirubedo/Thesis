"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DifyChatInterface } from "@/components/dify-chat-interface"
import { InteractiveTimer } from "@/components/interactive-timer"
import { EmbeddedVideo } from "@/components/embedded-video"
import { useAuth } from "@/components/auth-provider"
import { useLanguage } from "@/contexts/language-context"
import { useProgressTracking } from "@/hooks/use-progress-tracking"
import { useRouter } from "next/navigation"
import {
  Heart,
  Activity,
  Utensils,
  Dumbbell,
  Brain,
  Pill,
  BookOpen,
  Play,
  Clock,
  Star,
  CheckCircle,
  MessageCircle,
  TrendingUp,
} from "lucide-react"

export default function SelfHelpPage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const { userStats, getResourceProgress, markResourceCompleted, getLastPracticedText, formatDuration } =
    useProgressTracking()

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [showAIChat, setShowAIChat] = useState(false)

  const categories = [
    { id: "all", name: t("selfHelp.allResources"), icon: BookOpen },
    { id: "bloodPressure", name: t("selfHelp.bloodPressure"), icon: Activity },
    { id: "diet", name: t("selfHelp.diet"), icon: Utensils },
    { id: "exercise", name: t("selfHelp.exercise"), icon: Dumbbell },
    { id: "stress", name: t("selfHelp.stress"), icon: Brain },
    { id: "medications", name: t("selfHelp.medications"), icon: Pill },
    { id: "mentalHealth", name: t("selfHelp.mentalHealth"), icon: Heart },
  ]

  const resources = [
    {
      id: 1,
      title: "Deep Breathing for Blood Pressure",
      titleId: "Pernapasan Dalam untuk Tekanan Darah",
      description: "Learn breathing techniques that can help lower blood pressure naturally",
      descriptionId: "Pelajari teknik pernapasan yang dapat membantu menurunkan tekanan darah secara alami",
      category: "bloodPressure",
      duration: "10 min",
      durationId: "10 mnt",
      difficulty: t("selfHelp.beginner"),
      rating: 4.8,
      type: "exercise",
      timerDuration: 600,
      video: {
        videoId: "YRPh_GaiL8s",
        title: "Guided Breathing for Hypertension",
        titleId: "Panduan Pernapasan untuk Hipertensi",
        description: "Follow along with this breathing exercise designed for blood pressure management",
        descriptionId: "Ikuti latihan pernapasan ini yang dirancang untuk pengelolaan tekanan darah",
        duration: "10:15",
      },
      content: `
# Pernapasan Dalam untuk Kontrol Tekanan Darah

## Bagaimana Membantu:
Pernapasan dalam mengaktifkan sistem saraf parasimpatis, yang membantu:
- Menurunkan detak jantung
- Mengurangi tekanan darah
- Mengurangi hormon stres
- Meningkatkan sirkulasi

## Instruksi:
1. Duduk dengan nyaman dengan punggung lurus
2. Letakkan satu tangan di dada, satu di perut
3. Tarik napas perlahan melalui hidung selama 4 hitungan
4. Tahan napas selama 4 hitungan
5. Buang napas perlahan melalui mulut selama 6 hitungan
6. Ulangi selama 10 menit

## Praktik Terbaik:
- Latihan dua kali sehari (pagi dan sore)
- Gunakan sebelum situasi stres
- Kombinasikan dengan pemantauan tekanan darah
- Lacak kemajuan Anda dari waktu ke waktu

## Manfaat Berdasarkan Penelitian:
Berdasarkan Pedoman Hipertensi 2024, teknik pernapasan dalam dapat menurunkan tekanan darah sistolik hingga 5-10 mmHg dan diastolik 3-6 mmHg ketika dipraktikkan secara konsisten.

## Mekanisme Fisiologis:
- Aktivasi sistem saraf parasimpatis mengurangi aktivitas simpatis
- Penurunan pelepasan katekolamin (adrenalin dan noradrenalin)
- Relaksasi otot polos pembuluh darah
- Perbaikan variabilitas detak jantung
      `,
      contentId: `
# Deep Breathing for Blood Pressure Control

## How It Helps:
Deep breathing activates the parasympathetic nervous system, which helps:
- Lower heart rate
- Reduce blood pressure
- Decrease stress hormones
- Improve circulation

## Instructions:
1. Sit comfortably with your back straight
2. Place one hand on your chest, one on your belly
3. Breathe in slowly through your nose for 4 counts
4. Hold your breath for 4 counts
5. Exhale slowly through your mouth for 6 counts
6. Repeat for 10 minutes

## Best Practices:
- Practice twice daily (morning and evening)
- Use before stressful situations
- Combine with blood pressure monitoring
- Track your progress over time

## Research-Based Benefits:
According to the 2024 Hypertension Guidelines, deep breathing techniques can reduce systolic blood pressure by 5-10 mmHg and diastolic by 3-6 mmHg when practiced consistently.

## Physiological Mechanisms:
- Parasympathetic nervous system activation reduces sympathetic activity
- Decreased catecholamine release (adrenaline and noradrenaline)
- Smooth muscle relaxation in blood vessels
- Improved heart rate variability
      `,
    },
    {
      id: 2,
      title: "DASH Diet Basics",
      titleId: "Dasar-dasar Diet DASH",
      description: "Learn the fundamentals of the DASH diet for hypertension management",
      descriptionId: "Pelajari dasar-dasar diet DASH untuk pengelolaan hipertensi",
      category: "diet",
      duration: "15 min",
      durationId: "15 mnt",
      difficulty: t("selfHelp.beginner"),
      rating: 4.9,
      type: "guide",
      timerDuration: 900,
      video: {
        videoId: "6K8AnxrnROE",
        title: "DASH Diet Explained",
        titleId: "Diet DASH Dijelaskan",
        description: "Complete guide to the DASH diet for blood pressure control",
        descriptionId: "Panduan lengkap diet DASH untuk kontrol tekanan darah",
        duration: "12:30",
      },
      content: `
# Diet DASH untuk Hipertensi

## Apa itu DASH?
DASH (Dietary Approaches to Stop Hypertension) adalah rencana makan yang dirancang untuk membantu mengobati atau mencegah tekanan darah tinggi.

## Prinsip Utama berdasarkan Pedoman Hipertensi 2024:
- Menekankan buah dan sayuran (4-5 porsi sehari)
- Sertakan biji-bijian utuh (6-8 porsi sehari)
- Pilih protein tanpa lemak (≤6 oz sehari)
- Batasi asupan natrium (<2.300mg, idealnya 1.500mg)
- Kurangi lemak jenuh
- Sertakan produk susu rendah lemak (2-3 porsi sehari)

## Porsi Harian Berdasarkan Kebutuhan 2000 Kalori:
- Sayuran: 4-5 porsi
- Buah: 4-5 porsi
- Biji-bijian: 6-8 porsi
- Daging tanpa lemak: 6 oz atau kurang
- Kacang/biji: 4-5 porsi per minggu
- Lemak dan minyak: 2-3 porsi
- Makanan manis: ≤5 porsi per minggu

## Manfaat Terbukti:
- Dapat menurunkan tekanan darah sistolik 8-14 mmHg
- Mengurangi risiko penyakit jantung hingga 20%
- Membantu pengelolaan berat badan
- Meningkatkan kesehatan secara keseluruhan
- Mengurangi risiko stroke hingga 14%

## Tips Implementasi:
- Mulai dengan mengurangi natrium secara bertahap
- Tingkatkan konsumsi buah dan sayuran perlahan
- Ganti nasi putih dengan nasi merah
- Pilih ikan 2-3 kali seminggu
- Batasi makanan olahan dan fast food

## Makanan yang Direkomendasikan:
### Sayuran (4-5 porsi/hari):
- Bayam, kangkung, sawi
- Brokoli, kembang kol
- Wortel, tomat
- Labu, terong

### Buah (4-5 porsi/hari):
- Pisang (tinggi kalium)
- Jeruk, pepaya
- Apel, pir
- Melon, semangka

### Protein Rendah Lemak:
- Ikan (salmon, tuna, makarel)
- Ayam tanpa kulit
- Tahu, tempe
- Kacang-kacangan
      `,
      contentId: `
# DASH Diet for Hypertension

## What is DASH?
DASH (Dietary Approaches to Stop Hypertension) is an eating plan designed to help treat or prevent high blood pressure.

## Key Principles based on 2024 Hypertension Guidelines:
- Emphasize fruits and vegetables (4-5 servings daily)
- Include whole grains (6-8 servings daily)
- Choose lean proteins (≤6 oz daily)
- Limit sodium intake (<2,300mg, ideally 1,500mg)
- Reduce saturated fats
- Include low-fat dairy (2-3 servings daily)

## Daily Servings for 2000 Calorie Diet:
- Vegetables: 4-5 servings
- Fruits: 4-5 servings
- Grains: 6-8 servings
- Lean meats: 6 oz or less
- Nuts/seeds: 4-5 servings per week
- Fats and oils: 2-3 servings
- Sweets: ≤5 servings per week

## Proven Benefits:
- Can lower systolic blood pressure by 8-14 mmHg
- Reduces heart disease risk by up to 20%
- Helps with weight management
- Improves overall health
- Reduces stroke risk by up to 14%

## Implementation Tips:
- Start by gradually reducing sodium
- Slowly increase fruit and vegetable intake
- Replace white rice with brown rice
- Choose fish 2-3 times per week
- Limit processed foods and fast food

## Recommended Foods:
### Vegetables (4-5 servings/day):
- Spinach, kale, bok choy
- Broccoli, cauliflower
- Carrots, tomatoes
- Squash, eggplant

### Fruits (4-5 servings/day):
- Bananas (high potassium)
- Oranges, papaya
- Apples, pears
- Cantaloupe, watermelon

### Lean Proteins:
- Fish (salmon, tuna, mackerel)
- Skinless chicken
- Tofu, tempeh
- Legumes and nuts
      `,
    },
    {
      id: 3,
      title: "Safe Exercise for Hypertension",
      titleId: "Olahraga Aman untuk Hipertensi",
      description: "Safe and effective exercises for people with high blood pressure",
      descriptionId: "Olahraga yang aman dan efektif untuk penderita tekanan darah tinggi",
      category: "exercise",
      duration: "20 min",
      durationId: "20 mnt",
      difficulty: t("selfHelp.beginner"),
      rating: 4.7,
      type: "exercise",
      timerDuration: 1200,
      video: {
        videoId: "akbY1QMJR4M",
        title: "Low-Impact Exercise for High Blood Pressure",
        titleId: "Olahraga Dampak Rendah untuk Tekanan Darah Tinggi",
        description: "Safe exercise routine designed for hypertension management",
        descriptionId: "Rutinitas olahraga aman yang dirancang untuk pengelolaan hipertensi",
        duration: "18:45",
      },
      content: `
# Olahraga Aman untuk Hipertensi

## Manfaat Olahraga berdasarkan Pedoman 2024:
- Menurunkan tekanan darah sistolik 4-9 mmHg
- Menurunkan tekanan darah diastolik 3-5 mmHg
- Memperkuat jantung dan meningkatkan efisiensi pompa
- Meningkatkan sirkulasi dan elastisitas pembuluh darah
- Mengurangi stres dan hormon kortisol
- Membantu pengelolaan berat badan

## Aktivitas yang Direkomendasikan:
### Olahraga Aerobik (Prioritas Utama):
- Jalan cepat: 30-45 menit, 5-7 hari/minggu
- Berenang: 30-45 menit, 3-5 hari/minggu
- Bersepeda: 30-60 menit, 3-5 hari/minggu
- Jogging ringan: 20-30 menit, 3-4 hari/minggu

### Latihan Kekuatan (2-3 hari/minggu):
- Angkat beban ringan (50-60% 1RM)
- Latihan resistensi dengan band
- Latihan berat badan (push-up, squat)

### Olahraga Fleksibilitas:
- Yoga: 2-3 kali seminggu
- Tai Chi: sangat baik untuk lansia
- Stretching: setiap hari

## Panduan Olahraga Berdasarkan Tingkat Hipertensi:

### Hipertensi Tahap 1 (140-159/90-99 mmHg):
- Semua jenis olahraga aerobik diperbolehkan
- Latihan kekuatan dengan pengawasan
- Target: 150 menit aktivitas sedang/minggu

### Hipertensi Tahap 2 (≥160/100 mmHg):
- Konsultasi dokter sebelum memulai
- Mulai dengan intensitas rendah
- Hindari angkat beban berat
- Fokus pada olahraga aerobik

## Tips Keamanan:
- Pemanasan 5-10 menit sebelum olahraga
- Pendinginan 5-10 menit setelah olahraga
- Hindari menahan napas saat latihan kekuatan
- Hentikan jika merasa pusing, nyeri dada, atau sesak napas
- Monitor tekanan darah sebelum dan sesudah olahraga
- Minum obat sesuai jadwal
- Tetap terhidrasi

## Target Detak Jantung:
- Intensitas sedang: 50-70% dari detak jantung maksimal
- Rumus: (220 - usia) x 0.5-0.7
- Gunakan skala RPE (Rate of Perceived Exertion) 5-6 dari 10

## Olahraga yang Harus Dihindari:
- Angkat beban sangat berat (>85% 1RM)
- Olahraga isometrik berlebihan
- Aktivitas dengan perubahan posisi mendadak
- Olahraga kompetitif dengan intensitas tinggi
      `,
      contentId: `
# Safe Exercise for Hypertension

## Exercise Benefits based on 2024 Guidelines:
- Lowers systolic blood pressure by 4-9 mmHg
- Lowers diastolic blood pressure by 3-5 mmHg
- Strengthens heart and improves pump efficiency
- Improves circulation and blood vessel elasticity
- Reduces stress and cortisol hormones
- Helps with weight management

## Recommended Activities:
### Aerobic Exercise (Top Priority):
- Brisk walking: 30-45 minutes, 5-7 days/week
- Swimming: 30-45 minutes, 3-5 days/week
- Cycling: 30-60 minutes, 3-5 days/week
- Light jogging: 20-30 minutes, 3-4 days/week

### Strength Training (2-3 days/week):
- Light weight lifting (50-60% 1RM)
- Resistance band exercises
- Bodyweight exercises (push-ups, squats)

### Flexibility Exercises:
- Yoga: 2-3 times per week
- Tai Chi: excellent for elderly
- Stretching: daily

## Exercise Guidelines by Hypertension Stage:

### Stage 1 Hypertension (140-159/90-99 mmHg):
- All aerobic exercises allowed
- Strength training with supervision
- Target: 150 minutes moderate activity/week

### Stage 2 Hypertension (≥160/100 mmHg):
- Consult doctor before starting
- Begin with low intensity
- Avoid heavy weight lifting
- Focus on aerobic exercise

## Safety Tips:
- Warm up 5-10 minutes before exercise
- Cool down 5-10 minutes after exercise
- Avoid holding breath during strength training
- Stop if feeling dizzy, chest pain, or shortness of breath
- Monitor blood pressure before and after exercise
- Take medications as scheduled
- Stay hydrated

## Target Heart Rate:
- Moderate intensity: 50-70% of maximum heart rate
- Formula: (220 - age) x 0.5-0.7
- Use RPE (Rate of Perceived Exertion) scale 5-6 out of 10

## Exercises to Avoid:
- Very heavy weight lifting (>85% 1RM)
- Excessive isometric exercises
- Activities with sudden position changes
- High-intensity competitive sports
      `,
    },
    {
      id: 4,
      title: "Stress Management for Blood Pressure",
      titleId: "Manajemen Stres untuk Tekanan Darah",
      description: "Learn techniques to manage stress and its impact on blood pressure",
      descriptionId: "Pelajari teknik untuk mengelola stres dan dampaknya pada tekanan darah",
      category: "stress",
      duration: "15 min",
      durationId: "15 mnt",
      difficulty: t("selfHelp.intermediate"),
      rating: 4.8,
      type: "guide",
      timerDuration: 900,
      content: `
# Manajemen Stres untuk Hipertensi

## Bagaimana Stres Mempengaruhi Tekanan Darah:
Berdasarkan Pedoman Hipertensi 2024, stres kronis dapat:
- Meningkatkan tekanan darah 10-20 mmHg sementara
- Memicu respons fight-or-flight yang meningkatkan detak jantung
- Menyempitkan pembuluh darah melalui pelepasan adrenalin
- Melepaskan hormon kortisol yang meningkatkan retensi natrium
- Menyebabkan perilaku tidak sehat (merokok, makan berlebihan, kurang tidur)

## Teknik Manajemen Stres Terbukti Efektif:

### 1. Teknik Pernapasan (Efektivitas Tinggi):
- **Pernapasan 4-7-8**: Tarik napas 4 detik, tahan 7 detik, buang 8 detik
- **Pernapasan Diafragma**: Fokus pada pernapasan perut, bukan dada
- **Pernapasan Kotak**: 4 detik masuk, 4 detik tahan, 4 detik keluar, 4 detik tahan
- Praktik: 10-15 menit, 2-3 kali sehari

### 2. Relaksasi Otot Progresif:
- Tegang dan lepaskan setiap kelompok otot secara berurutan
- Mulai dari kaki hingga kepala
- Tahan ketegangan 5 detik, lepaskan 15 detik
- Durasi: 15-20 menit sebelum tidur

### 3. Meditasi Mindfulness:
- Fokus pada momen saat ini tanpa menilai
- Mulai dengan 5-10 menit sehari
- Gunakan aplikasi panduan atau musik relaksasi
- Terbukti menurunkan tekanan darah 5-10 mmHg

### 4. Olahraga Teratur:
- Aktivitas fisik melepaskan endorfin alami
- Mengurangi hormon stres kortisol
- Target: 150 menit aktivitas sedang per minggu
- Yoga dan Tai Chi sangat efektif untuk stres

### 5. Tidur Berkualitas:
- 7-9 jam tidur per malam untuk dewasa
- Tidur kurang dari 6 jam meningkatkan risiko hipertensi 20%
- Buat rutinitas tidur yang konsisten
- Hindari kafein 6 jam sebelum tidur

## Strategi Pengelolaan Stres Harian:

### Pagi Hari:
- Bangun 15 menit lebih awal untuk rutinitas tenang
- Praktik pernapasan dalam 5 menit
- Hindari langsung mengecek ponsel
- Sarapan sehat dan terhidrasi

### Siang Hari:
- Istirahat 5-10 menit setiap 2 jam kerja
- Jalan kaki singkat saat istirahat
- Praktik pernapasan saat merasa tertekan
- Batasi konsumsi kafein (maksimal 400mg/hari)

### Malam Hari:
- Matikan perangkat elektronik 1 jam sebelum tidur
- Praktik relaksasi otot progresif
- Tulis jurnal rasa syukur
- Mandi air hangat untuk relaksasi

## Dukungan Sosial dan Profesional:
- Berbagi dengan keluarga dan teman dekat
- Bergabung dengan kelompok dukungan hipertensi
- Konsultasi dengan psikolog jika stres kronis
- Pertimbangkan terapi kognitif-perilaku (CBT)
      `,
      contentId: `
# Stress Management for Hypertension

## How Stress Affects Blood Pressure:
Based on 2024 Hypertension Guidelines, chronic stress can:
- Temporarily increase blood pressure by 10-20 mmHg
- Trigger fight-or-flight response increasing heart rate
- Constrict blood vessels through adrenaline release
- Release cortisol hormone increasing sodium retention
- Lead to unhealthy behaviors (smoking, overeating, poor sleep)

## Proven Effective Stress Management Techniques:

### 1. Breathing Techniques (High Effectiveness):
- **4-7-8 Breathing**: Inhale 4 seconds, hold 7 seconds, exhale 8 seconds
- **Diaphragmatic Breathing**: Focus on belly breathing, not chest
- **Box Breathing**: 4 seconds in, 4 seconds hold, 4 seconds out, 4 seconds hold
- Practice: 10-15 minutes, 2-3 times daily

### 2. Progressive Muscle Relaxation:
- Tense and release each muscle group sequentially
- Start from feet to head
- Hold tension 5 seconds, release 15 seconds
- Duration: 15-20 minutes before bedtime

### 3. Mindfulness Meditation:
- Focus on present moment without judgment
- Start with 5-10 minutes daily
- Use guided apps or relaxation music
- Proven to lower blood pressure by 5-10 mmHg

### 4. Regular Exercise:
- Physical activity releases natural endorphins
- Reduces stress hormone cortisol
- Target: 150 minutes moderate activity per week
- Yoga and Tai Chi particularly effective for stress

### 5. Quality Sleep:
- 7-9 hours sleep per night for adults
- Less than 6 hours increases hypertension risk by 20%
- Create consistent sleep routine
- Avoid caffeine 6 hours before bedtime

## Daily Stress Management Strategies:

### Morning:
- Wake up 15 minutes earlier for calm routine
- Practice deep breathing for 5 minutes
- Avoid immediately checking phone
- Eat healthy breakfast and hydrate

### Daytime:
- Take 5-10 minute breaks every 2 hours
- Short walks during breaks
- Practice breathing when feeling pressured
- Limit caffeine intake (maximum 400mg/day)

### Evening:
- Turn off electronic devices 1 hour before bed
- Practice progressive muscle relaxation
- Write gratitude journal
- Take warm bath for relaxation

## Social and Professional Support:
- Share with close family and friends
- Join hypertension support groups
- Consult psychologist for chronic stress
- Consider cognitive-behavioral therapy (CBT)
      `,
    },
    {
      id: 5,
      title: "Medication Adherence for Hypertension",
      titleId: "Kepatuhan Obat untuk Hipertensi",
      description: "Understanding and maintaining proper medication adherence",
      descriptionId: "Memahami dan menjaga kepatuhan minum obat yang tepat",
      category: "medications",
      duration: "12 min",
      durationId: "12 mnt",
      difficulty: t("selfHelp.beginner"),
      rating: 4.9,
      type: "guide",
      timerDuration: 720,
      content: `
# Kepatuhan Obat untuk Hipertensi

## Pentingnya Kepatuhan Obat berdasarkan Pedoman 2024:
- Kepatuhan <80% meningkatkan risiko stroke 2-3 kali lipat
- Kepatuhan optimal (>90%) dapat mencegah 70% komplikasi kardiovaskular
- Penghentian obat mendadak dapat menyebabkan rebound hypertension
- Kontrol tekanan darah yang baik mengurangi risiko kematian hingga 25%

## Jenis Obat Hipertensi dan Cara Kerjanya:

### 1. ACE Inhibitors (Captopril, Lisinopril):
- **Cara Kerja**: Menghambat enzim pengubah angiotensin
- **Manfaat**: Melindungi jantung dan ginjal
- **Waktu Minum**: Pagi hari, perut kosong
- **Efek Samping**: Batuk kering (10-15% pasien)
- **Monitoring**: Fungsi ginjal dan kalium darah

### 2. ARB (Valsartan, Telmisartan):
- **Cara Kerja**: Memblokir reseptor angiotensin II
- **Manfaat**: Sama dengan ACE inhibitor, tanpa batuk
- **Waktu Minum**: Pagi atau malam, dengan/tanpa makanan
- **Efek Samping**: Minimal, kadang pusing ringan
- **Monitoring**: Fungsi ginjal dan elektrolit

### 3. Calcium Channel Blockers (Amlodipine, Nifedipine):
- **Cara Kerja**: Menghambat masuknya kalsium ke otot jantung
- **Manfaat**: Efektif untuk hipertensi sistolik terisolasi
- **Waktu Minum**: Pagi hari, bersamaan dengan makanan
- **Efek Samping**: Pembengkakan kaki, pusing
- **Monitoring**: Detak jantung dan tekanan darah

### 4. Diuretik (Hydrochlorothiazide, Furosemide):
- **Cara Kerja**: Mengeluarkan kelebihan cairan dan natrium
- **Manfaat**: Mengurangi volume darah dan beban jantung
- **Waktu Minum**: Pagi hari untuk menghindari sering buang air kecil malam
- **Efek Samping**: Sering buang air kecil, kram otot
- **Monitoring**: Elektrolit (kalium, natrium, magnesium)

### 5. Beta Blockers (Propranolol, Metoprolol):
- **Cara Kerja**: Menghambat reseptor beta di jantung
- **Manfaat**: Mengurangi detak jantung dan kontraktilitas
- **Waktu Minum**: Pagi dan malam (jika 2x sehari)
- **Efek Samping**: Kelelahan, disfungsi seksual
- **Monitoring**: Detak jantung dan tekanan darah

## Tips Meningkatkan Kepatuhan:

### 1. Sistem Pengingat:
- Alarm ponsel untuk waktu minum obat
- Kotak obat mingguan dengan pembagian hari
- Aplikasi pengingat obat
- Hubungkan dengan aktivitas rutin (sikat gigi, sarapan)

### 2. Edukasi dan Pemahaman:
- Pahami nama obat, dosis, dan waktu minum
- Ketahui manfaat dan efek samping yang mungkin terjadi
- Diskusikan kekhawatiran dengan dokter atau apoteker
- Baca informasi obat yang disediakan

### 3. Komunikasi dengan Tenaga Kesehatan:
- Laporkan efek samping yang mengganggu
- Diskusikan kesulitan minum obat (ukuran, rasa, frekuensi)
- Tanyakan alternatif jika ada masalah finansial
- Jadwalkan kontrol rutin sesuai anjuran
      `,
      contentId: `
# Medication Adherence for Hypertension

## Importance of Medication Adherence based on 2024 Guidelines:
- Adherence <80% increases stroke risk 2-3 times
- Optimal adherence (>90%) can prevent 70% of cardiovascular complications
- Sudden medication discontinuation can cause rebound hypertension
- Good blood pressure control reduces mortality risk by up to 25%

## Types of Hypertension Medications and How They Work:

### 1. ACE Inhibitors (Captopril, Lisinopril):
- **Mechanism**: Inhibit angiotensin-converting enzyme
- **Benefits**: Protect heart and kidneys
- **Timing**: Morning, on empty stomach
- **Side Effects**: Dry cough (10-15% of patients)
- **Monitoring**: Kidney function and blood potassium

### 2. ARBs (Valsartan, Telmisartan):
- **Mechanism**: Block angiotensin II receptors
- **Benefits**: Same as ACE inhibitors, without cough
- **Timing**: Morning or evening, with/without food
- **Side Effects**: Minimal, occasional mild dizziness
- **Monitoring**: Kidney function and electrolytes

### 3. Calcium Channel Blockers (Amlodipine, Nifedipine):
- **Mechanism**: Block calcium entry into heart muscle
- **Benefits**: Effective for isolated systolic hypertension
- **Timing**: Morning, with food
- **Side Effects**: Ankle swelling, dizziness
- **Monitoring**: Heart rate and blood pressure

### 4. Diuretics (Hydrochlorothiazide, Furosemide):
- **Mechanism**: Remove excess fluid and sodium
- **Benefits**: Reduce blood volume and heart workload
- **Timing**: Morning to avoid nighttime urination
- **Side Effects**: Frequent urination, muscle cramps
- **Monitoring**: Electrolytes (potassium, sodium, magnesium)

### 5. Beta Blockers (Propranolol, Metoprolol):
- **Mechanism**: Block beta receptors in heart
- **Benefits**: Reduce heart rate and contractility
- **Timing**: Morning and evening (if twice daily)
- **Side Effects**: Fatigue, sexual dysfunction
- **Monitoring**: Heart rate and blood pressure

## Tips to Improve Adherence:

### 1. Reminder Systems:
- Phone alarms for medication times
- Weekly pill organizers with daily compartments
- Medication reminder apps
- Link with routine activities (brushing teeth, breakfast)

### 2. Education and Understanding:
- Know medication names, doses, and timing
- Understand benefits and possible side effects
- Discuss concerns with doctor or pharmacist
- Read provided medication information

### 3. Communication with Healthcare Providers:
- Report bothersome side effects
- Discuss difficulties taking medications (size, taste, frequency)
- Ask about alternatives if financial issues exist
- Schedule regular follow-ups as recommended
      `,
    },
    {
      id: 6,
      title: "Mental Health and Hypertension",
      titleId: "Kesehatan Mental dan Hipertensi",
      description: "Understanding the connection between mental health and blood pressure",
      descriptionId: "Memahami hubungan antara kesehatan mental dan tekanan darah",
      category: "mentalHealth",
      duration: "18 min",
      durationId: "18 mnt",
      difficulty: t("selfHelp.intermediate"),
      rating: 4.6,
      type: "guide",
      timerDuration: 1080,
      content: `
# Kesehatan Mental dan Hipertensi

## Hubungan Kesehatan Mental dengan Tekanan Darah:
Berdasarkan Pedoman Hipertensi 2024, terdapat hubungan dua arah antara kesehatan mental dan hipertensi:

### Dampak Gangguan Mental terhadap Hipertensi:
- **Depresi**: Meningkatkan risiko hipertensi 42%
- **Kecemasan**: Meningkatkan tekanan darah 10-15 mmHg saat episode akut
- **Stres Kronis**: Menyebabkan peningkatan kortisol dan aktivasi sistem saraf simpatis
- **Gangguan Tidur**: Kurang tidur (<6 jam) meningkatkan risiko hipertensi 20%

### Dampak Hipertensi terhadap Kesehatan Mental:
- Risiko depresi meningkat 25% pada penderita hipertensi
- Kecemasan tentang komplikasi dapat memperburuk kontrol tekanan darah
- Efek samping obat dapat mempengaruhi mood dan fungsi kognitif
- Pembatasan aktivitas dapat menyebabkan isolasi sosial

## Mekanisme Biologis:

### 1. Sistem Saraf Otonom:
- Stres mengaktifkan sistem saraf simpatis
- Pelepasan adrenalin dan noradrenalin
- Peningkatan detak jantung dan kontraksi pembuluh darah
- Aktivasi sistem renin-angiotensin-aldosteron

### 2. Sistem Endokrin:
- Peningkatan kortisol kronis
- Gangguan regulasi insulin
- Perubahan hormon tiroid
- Ketidakseimbangan neurotransmitter (serotonin, dopamin)

### 3. Peradangan:
- Stres kronis meningkatkan marker inflamasi (CRP, IL-6)
- Peradangan merusak endotel pembuluh darah
- Aterosklerosis dan kekakuan arteri
- Gangguan fungsi ginjal

## Strategi Pengelolaan Terintegrasi:

### 1. Terapi Psikologis:
- **Cognitive Behavioral Therapy (CBT)**: Terbukti menurunkan TD 5-10 mmHg
- **Mindfulness-Based Stress Reduction**: Efektif untuk kecemasan dan TD
- **Terapi Relaksasi**: Progressive muscle relaxation, guided imagery
- **Konseling**: Untuk mengatasi masalah adaptasi dan kepatuhan

### 2. Intervensi Gaya Hidup:
- **Olahraga Teratur**: Meningkatkan endorfin dan menurunkan kortisol
- **Yoga dan Tai Chi**: Kombinasi aktivitas fisik dan meditasi
- **Hobi dan Aktivitas Menyenangkan**: Mengurangi stres dan meningkatkan mood
- **Dukungan Sosial**: Bergabung dengan kelompok dukungan atau komunitas

### 3. Manajemen Tidur:
- Tidur 7-9 jam per malam
- Rutinitas tidur yang konsisten
- Lingkungan tidur yang nyaman (gelap, sejuk, tenang)
- Hindari kafein dan alkohol sebelum tidur
- Teknik relaksasi sebelum tidur

## Tanda-tanda yang Memerlukan Bantuan Profesional:

### Gejala Depresi:
- Perasaan sedih atau putus asa >2 minggu
- Kehilangan minat pada aktivitas yang biasa disukai
- Perubahan nafsu makan atau berat badan signifikan
- Gangguan tidur (insomnia atau hipersomnia)
- Kelelahan atau kehilangan energi
- Perasaan tidak berharga atau bersalah berlebihan
- Kesulitan konsentrasi atau membuat keputusan
- Pikiran tentang kematian atau bunuh diri

### Gejala Kecemasan:
- Kekhawatiran berlebihan yang sulit dikontrol
- Ketegangan otot dan gelisah
- Mudah lelah atau irritable
- Kesulitan konsentrasi
- Gangguan tidur
- Gejala fisik (jantung berdebar, berkeringat, tremor)
      `,
      contentId: `
# Mental Health and Hypertension

## Connection Between Mental Health and Blood Pressure:
Based on 2024 Hypertension Guidelines, there's a bidirectional relationship between mental health and hypertension:

### Impact of Mental Disorders on Hypertension:
- **Depression**: Increases hypertension risk by 42%
- **Anxiety**: Increases blood pressure by 10-15 mmHg during acute episodes
- **Chronic Stress**: Causes increased cortisol and sympathetic nervous system activation
- **Sleep Disorders**: Less than 6 hours sleep increases hypertension risk by 20%

### Impact of Hypertension on Mental Health:
- Depression risk increases by 25% in hypertensive patients
- Anxiety about complications can worsen blood pressure control
- Medication side effects can affect mood and cognitive function
- Activity restrictions can lead to social isolation

## Biological Mechanisms:

### 1. Autonomic Nervous System:
- Stress activates sympathetic nervous system
- Release of adrenaline and noradrenaline
- Increased heart rate and blood vessel contraction
- Activation of renin-angiotensin-aldosterone system

### 2. Endocrine System:
- Chronic cortisol elevation
- Insulin regulation disruption
- Thyroid hormone changes
- Neurotransmitter imbalance (serotonin, dopamine)

### 3. Inflammation:
- Chronic stress increases inflammatory markers (CRP, IL-6)
- Inflammation damages blood vessel endothelium
- Atherosclerosis and arterial stiffness
- Kidney function impairment

## Integrated Management Strategies:

### 1. Psychological Therapies:
- **Cognitive Behavioral Therapy (CBT)**: Proven to lower BP by 5-10 mmHg
- **Mindfulness-Based Stress Reduction**: Effective for anxiety and BP
- **Relaxation Therapy**: Progressive muscle relaxation, guided imagery
- **Counseling**: To address adaptation and adherence issues

### 2. Lifestyle Interventions:
- **Regular Exercise**: Increases endorphins and reduces cortisol
- **Yoga and Tai Chi**: Combination of physical activity and meditation
- **Hobbies and Enjoyable Activities**: Reduce stress and improve mood
- **Social Support**: Join support groups or communities

### 3. Sleep Management:
- 7-9 hours sleep per night
- Consistent sleep routine
- Comfortable sleep environment (dark, cool, quiet)
- Avoid caffeine and alcohol before bedtime
- Relaxation techniques before sleep

## Signs Requiring Professional Help:

### Depression Symptoms:
- Sad or hopeless feelings >2 weeks
- Loss of interest in usually enjoyed activities
- Significant appetite or weight changes
- Sleep disturbances (insomnia or hypersomnia)
- Fatigue or energy loss
- Excessive worthlessness or guilt feelings
- Concentration or decision-making difficulties
- Thoughts about death or suicide

### Anxiety Symptoms:
- Excessive worry that's hard to control
- Muscle tension and restlessness
- Easy fatigue or irritability
- Concentration difficulties
- Sleep disturbances
- Physical symptoms (palpitations, sweating, tremor)
      `,
    },
  ]

  const isIndonesian = language === "id"

  if (!user) {
    router.push("/login")
    return null
  }

  const filteredResources =
    selectedCategory === "all" ? resources : resources.filter((resource) => resource.category === selectedCategory)

  if (showAIChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("selfHelp.aiAssistantTitle")}</h1>
              <p className="text-gray-600">{t("selfHelp.aiAssistantDesc")}</p>
            </div>
            <Button onClick={() => setShowAIChat(false)} variant="outline" className="bg-transparent">
              {t("selfHelp.backToResources")}
            </Button>
          </div>

          <DifyChatInterface
            title={t("selfHelp.aiAssistantTitle")}
            showHeader={true}
            minHeight="calc(100vh - 200px)"
            className="shadow-lg"
            placeholder={t("selfHelp.aiPlaceholder")}
            apiPath="/api/dify/education"
          />
        </div>
      </div>
    )
  }

  if (selectedResource) {
    const resourceProgress = getResourceProgress(selectedResource.id)

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />

        <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
          <Button onClick={() => setSelectedResource(null)} variant="ghost" className="mb-4">
            {t("selfHelp.backToResources")}
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {isIndonesian ? selectedResource.titleId : selectedResource.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {isIndonesian ? selectedResource.descriptionId : selectedResource.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        {isIndonesian ? selectedResource.durationId : selectedResource.duration}
                      </Badge>
                      <Badge variant="outline">{selectedResource.difficulty}</Badge>
                      {resourceProgress?.isCompleted && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="prose max-w-none">
                    {(isIndonesian ? selectedResource.contentId : selectedResource.content)
                      .split("\n")
                      .map((line: string, index: number) => {
                        if (line.startsWith("# ")) {
                          return (
                            <h1 key={index} className="text-2xl font-bold mb-4">
                              {line.substring(2)}
                            </h1>
                          )
                        }
                        if (line.startsWith("## ")) {
                          return (
                            <h2 key={index} className="text-xl font-semibold mb-3 mt-6">
                              {line.substring(3)}
                            </h2>
                          )
                        }
                        if (line.startsWith("### ")) {
                          return (
                            <h3 key={index} className="text-lg font-semibold mb-2 mt-4">
                              {line.substring(4)}
                            </h3>
                          )
                        }
                        if (line.startsWith("- ")) {
                          return (
                            <li key={index} className="mb-1 ml-4">
                              {line.substring(2)}
                            </li>
                          )
                        }
                        if (line.match(/^\d+\./)) {
                          return (
                            <li key={index} className="mb-1 ml-4">
                              {line}
                            </li>
                          )
                        }
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={index} className="mb-3 font-semibold">
                              {line.substring(2, line.length - 2)}
                            </p>
                          )
                        }
                        if (line.trim() === "") {
                          return <br key={index} />
                        }
                        return (
                          <p key={index} className="mb-3">
                            {line}
                          </p>
                        )
                      })}
                  </div>

                  <div className="mt-8 flex space-x-4">
                    <Button
                      onClick={() => markResourceCompleted(selectedResource.id)}
                      className={resourceProgress?.isCompleted ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {resourceProgress?.isCompleted ? t("selfHelp.alreadyCompleted") : t("selfHelp.markCompleted")}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAIChat(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {t("selfHelp.discussWithAI")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Video */}
              {selectedResource.video && (
                <EmbeddedVideo
                  title={isIndonesian ? selectedResource.video.titleId : selectedResource.video.title}
                  description={isIndonesian ? selectedResource.video.descriptionId : selectedResource.video.description}
                  videoId={selectedResource.video.videoId}
                  duration={selectedResource.video.duration}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timer */}
              {selectedResource.timerDuration && (
                <InteractiveTimer
                  title={`${isIndonesian ? selectedResource.titleId : selectedResource.title} Timer`}
                  duration={selectedResource.timerDuration}
                  description={`Set timer for ${isIndonesian ? selectedResource.durationId : selectedResource.duration} practice session`}
                  resourceId={selectedResource.id}
                  onComplete={() => {
                    markResourceCompleted(selectedResource.id)
                  }}
                />
              )}

              {/* Resource Progress */}
              {resourceProgress && (
                <Card className="border-green-100 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg text-green-900 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Your Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Sessions completed</span>
                        <span className="text-sm font-medium text-green-900">{resourceProgress.sessions.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Total practice time</span>
                        <span className="text-sm font-medium text-green-900">
                          {formatDuration(resourceProgress.totalPracticeTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Last practiced</span>
                        <span className="text-sm font-medium text-green-900">
                          {getLastPracticedText(selectedResource.id, t)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Completion count</span>
                        <span className="text-sm font-medium text-green-900">{resourceProgress.completionCount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Overall Progress Tracking */}
              <Card className="border-red-100 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-900">{t("selfHelp.progressTracking")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.sessionsCompleted")}</span>
                      <span className="text-sm font-medium text-red-900">{userStats.totalSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.totalPracticeTime")}</span>
                      <span className="text-sm font-medium text-red-900">
                        {formatDuration(userStats.totalPracticeTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.completedResources")}</span>
                      <span className="text-sm font-medium text-red-900">{userStats.completedResources}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.streak")}</span>
                      <span className="text-sm font-medium text-red-900">
                        {userStats.currentStreak} {t("selfHelp.days")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-red-700">{t("selfHelp.longestStreak")}</span>
                      <span className="text-sm font-medium text-red-900">
                        {userStats.longestStreak} {t("selfHelp.days")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border-blue-100">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900">{t("selfHelp.quickTips")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-blue-800 space-y-2">
                    {t("selfHelp.tips")
                      .split("\n")
                      .map((tip, index) => (
                        <div key={index}>{tip}</div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16 max-w-6xl mx-auto p-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("selfHelp.title")}</h1>
            <p className="text-gray-600">{t("selfHelp.subtitle")}</p>
          </div>
          <Button onClick={() => setShowAIChat(true)} className="bg-red-500 hover:bg-red-600 text-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("selfHelp.aiAssistant")}
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Categories Sidebar */}
          <div className="space-y-4">
            <Card className="border-red-100 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  {t("selfHelp.progressTracking")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.sessionsCompleted")}</span>
                    <span className="text-sm font-medium text-red-900">{userStats.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.totalPracticeTime")}</span>
                    <span className="text-sm font-medium text-red-900">
                      {formatDuration(userStats.totalPracticeTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.completedResources")}</span>
                    <span className="text-sm font-medium text-red-900">{userStats.completedResources}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-700">{t("selfHelp.streak")}</span>
                    <span className="text-sm font-medium text-red-900">
                      {userStats.currentStreak} {t("selfHelp.days")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                return (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Resources Grid */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => {
                const resourceProgress = getResourceProgress(resource.id)

                return (
                  <Card
                    key={resource.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-red-100"
                    onClick={() => setSelectedResource(resource)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center">
                            {isIndonesian ? resource.titleId : resource.title}
                            {resourceProgress?.isCompleted && <CheckCircle className="w-5 h-5 ml-2 text-green-600" />}
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {isIndonesian ? resource.descriptionId : resource.description}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {isIndonesian ? resource.durationId : resource.duration}
                          </Badge>
                          <Badge variant="outline">{resource.difficulty}</Badge>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 mr-1" />
                            <span className="text-xs text-gray-600">{resource.rating}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      {resourceProgress && (
                        <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Sessions:</span>
                            <span className="font-medium">{resourceProgress.sessions.length}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Practice time:</span>
                            <span className="font-medium">{formatDuration(resourceProgress.totalPracticeTime)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Last practiced:</span>
                            <span className="font-medium">{getLastPracticedText(resource.id, t)}</span>
                          </div>
                        </div>
                      )}

                      <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        {t("selfHelp.startResource")}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredResources.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t("selfHelp.noResourcesFound")}</h3>
                  <p className="text-gray-600">{t("selfHelp.noResourcesDesc")}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
