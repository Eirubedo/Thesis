"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "id"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Navigation
    "nav.assessment": "Assessment",
    "nav.monitoring": "Monitoring",
    "nav.education": "Education",
    "nav.reports": "Reports",
    "nav.about": "About",
    "nav.profile": "Profile",
    "nav.appSettings": "Settings",
    "nav.logout": "Logout",
    "nav.support": "Support",

    // Home
    "home.title": "Welcome to HyperCare",
    "home.subtitle":
      "Your comprehensive hypertension management companion. Get personalized support, health assessments, and resources powered by advanced AI technology for both your physical and mental well-being.",
    "home.startChat": "Start Health Chat",
    "home.takeAssessment": "Health Assessment",
    "home.getStarted": "Get Started",
    "home.learnMore": "Learn More",
    "home.viewReports": "View Reports",
    "home.trackBP": "Track Blood Pressure",

    // Home Features
    "home.aiChatTitle": "AI Health Assistant",
    "home.aiChatDescription":
      "Intelligent conversations about hypertension management, lifestyle changes, and mental health support",
    "home.bpTrackingTitle": "Blood Pressure Tracking",
    "home.bpTrackingDescription": "Monitor your blood pressure readings with smart analytics and trend analysis",
    "home.medicationTitle": "Medication Management",
    "home.medicationDescription":
      "Track medications, set reminders, and monitor adherence for optimal hypertension control",
    "home.lifestyleTitle": "Lifestyle Coaching",
    "home.lifestyleDescription": "Personalized guidance on diet, exercise, stress management, and healthy habits",
    "home.mentalHealthTitle": "Mental Health Support",
    "home.mentalHealthDescription": "Address stress, anxiety, and emotional factors that impact blood pressure",
    "home.progressTrackingTitle": "Progress Monitoring",
    "home.progressTrackingDescription": "Comprehensive tracking of your hypertension management journey",
    "home.readyToStart": "Ready to take control of your hypertension?",
    "home.joinThousands": "Join thousands of users managing their hypertension with HyperCare's comprehensive platform",

    // Login
    "login.title": "HyperCare",
    "login.subtitle": "Welcome back to your hypertension management journey",
    "login.subtitleRegister": "Start managing your hypertension today",
    "login.fullName": "Full Name",
    "login.email": "Email",
    "login.password": "Password",
    "login.signIn": "Sign In",
    "login.createAccount": "Create Account",
    "login.noAccount": "Don't have an account? Sign up",
    "login.hasAccount": "Already have an account? Sign in",
    "login.backHome": "← Back to Home",

    // Chat
    "chat.title": "AI Health Assistant",
    "chat.placeholder": "Ask about blood pressure, medications, lifestyle, or mental health...",
    "chat.initialMessage":
      "Hello! I'm your AI health assistant specializing in hypertension management. I can help with blood pressure questions, lifestyle advice, medication information, and mental health support. How can I assist you today?",

    // Assessment
    "assessment.title": "Health Assessment",
    "assessment.subtitle": "Comprehensive AI-guided health evaluation",
    "assessment.description":
      "Choose from our comprehensive assessment options to evaluate your hypertension management and health knowledge",
    "assessment.startAssessment": "Start Assessment",
    "assessment.chatPlaceholder": "Type your response here...",
    "assessment.viewReport": "View Report",
    "assessment.talkToAI": "Talk to AI",
    "assessment.personalizedDesc":
      "Experience personalized health assessments that evaluate your hypertension management, lifestyle factors, and health knowledge.",
    "assessment.conversational": "Conversational Assessment",
    "assessment.conversationalFeatures":
      "• Natural dialogue about your health\n• Questions about blood pressure, lifestyle, and mental health\n• Voice and text input support\n• Real-time health analysis",
    "assessment.intelligentInsights": "Health Insights",
    "assessment.insightsFeatures":
      "• Personalized hypertension management analysis\n• Lifestyle and mental health recommendations\n• Progress tracking over time\n• Healthcare provider guidance",
    "assessment.privacyNotice":
      "Privacy Notice: Your health data is completely confidential and secure. This assessment will help us provide personalized hypertension management recommendations.",
    "assessment.backToOverview": "← Back to Overview",
    "assessment.progressTitle": "Assessment Progress",
    "assessment.startedConversation": "Started conversation",
    "assessment.completeAssessment": "Complete assessment",
    "assessment.receiveInsights": "Receive insights",
    "assessment.tipsTitle": "Assessment Tips",
    "assessment.tips":
      "• Be honest about your symptoms and lifestyle\n• Include information about medications\n• Mention stress levels and mental health\n• Ask questions if you need clarification",
    "assessment.needHelp": "Need Help?",
    "assessment.emergencyText": "If you're experiencing a hypertensive emergency, please contact:",
    "assessment.emergency": "Emergency: 911",
    "assessment.comprehensive": "Comprehensive AI Assessment",
    "assessment.comprehensiveDesc": "In-depth AI evaluation using Dify API for complete health analysis",
    "assessment.quick": "Quick AI Assessment",
    "assessment.quickDesc": "Fast screening for routine monitoring and early detection",
    "assessment.knowledge": "Hypertension Knowledge Test",
    "assessment.knowledgeDesc": "Evaluate your understanding of hypertension management",

    // Monitoring
    "monitoring.title": "Health Monitoring",
    "monitoring.subtitle": "Track your blood pressure and medication intake",
    "monitoring.bpInput": "Blood Pressure Input",
    "monitoring.medicationInput": "Medication Input",
    "monitoring.todaysProgress": "Today's Progress",
    "monitoring.medicationsTaken": "Medications taken today",
    "monitoring.todaysChecklist": "Today's Medication Checklist",
    "monitoring.checklistDescription": "Check off medications as you take them throughout the day",
    "monitoring.addMedicationDesc": "Add a new medication to your daily routine",
    "monitoring.scheduleTimes": "Schedule Times",
    "monitoring.addTime": "Add Time",
    "monitoring.remove": "Remove",
    "monitoring.addMedication": "Add Medication",
    "monitoring.cancel": "Cancel",
    "monitoring.taken": "Taken",
    "monitoring.overdue": "Overdue",
    "monitoring.dueSoon": "Due Soon",
    "monitoring.scheduled": "Scheduled",
    "monitoring.takenAt": "Taken at",
    "monitoring.noMedicationsToday": "No medications scheduled for today",
    "monitoring.noMedicationsDesc": "Add medications to start tracking your daily routine",
    "monitoring.additionalNotes": "Additional notes (optional)",

    // Reports
    "reports.title": "Health Reports",
    "reports.subtitle": "Track your health assessment progress and results over time",
    "reports.exportPDF": "Export PDF",
    "reports.print": "Print",
    "reports.noReports": "No Reports Yet",
    "reports.noReportsDesc": "Take your first health assessment to start tracking your progress",
    "reports.takeAssessment": "Take Assessment",
    "reports.latestBP": "Latest BP Reading",
    "reports.averageBP": "Average BP (30 days)",
    "reports.totalAssessments": "Total Assessments",
    "reports.progressTrend": "Progress Trend",
    "reports.improving": "Improving",
    "reports.needsAttention": "Needs attention",
    "reports.needMoreData": "Need more data",
    "reports.assessmentHistory": "Assessment History",
    "reports.historyDesc": "Your health assessment results over time",
    "reports.recommendations": "Recommendations",
    "reports.recommendationsDesc": "Based on your latest assessment and health data",
    "reports.professionalSupport":
      "Important: Your recent readings suggest you should consult with your healthcare provider for medication adjustment or additional treatment.",
    "reports.continueAI": "Continue using our AI assistant for daily support and health guidance.",
    "reports.exploreSelfHelp": "Explore our education modules for lifestyle management techniques.",
    "reports.chatWithAI": "Chat with AI",
    "reports.educationResources": "Education Resources",
    "reports.normal": "Normal",
    "reports.elevated": "Elevated",
    "reports.stage1": "Stage 1 Hypertension",
    "reports.stage2": "Stage 2 Hypertension",
    "reports.crisis": "Hypertensive Crisis",
    "reports.since": "Since",
    "reports.assessment": "Assessment",
    "reports.comprehensiveResults": "Comprehensive AI Results",
    "reports.quickResults": "Quick Assessment Results",
    "reports.knowledgeLevel": "Knowledge Level",

    // Education (Self-Help)
    "selfHelp.title": "Health Education",
    "selfHelp.subtitle":
      "Evidence-based techniques for managing hypertension through lifestyle changes, stress reduction, and mental health support",
    "selfHelp.description":
      "Comprehensive educational resources combining physical health management for hypertension with mental health support",
    "selfHelp.aiAssistant": "AI Health Coach",
    "selfHelp.aiAssistantTitle": "AI Health Coach",
    "selfHelp.aiAssistantDesc": "Get personalized guidance for hypertension management and mental health",
    "selfHelp.backToResources": "← Back to Resources",
    "selfHelp.aiPlaceholder": "Ask about diet, exercise, stress management, medications, or mental health...",
    "selfHelp.allResources": "All Resources",
    "selfHelp.bloodPressure": "Blood Pressure",
    "selfHelp.diet": "Diet & Nutrition",
    "selfHelp.exercise": "Exercise",
    "selfHelp.stress": "Stress Management",
    "selfHelp.medications": "Medications",
    "selfHelp.mentalHealth": "Mental Health",
    "selfHelp.markCompleted": "Mark as Completed",
    "selfHelp.discussWithAI": "Discuss with AI",
    "selfHelp.startResource": "Start Resource",
    "selfHelp.progressTracking": "Progress Tracking",
    "selfHelp.sessionsCompleted": "Sessions completed",
    "selfHelp.totalPracticeTime": "Total practice time",
    "selfHelp.streak": "Current streak",
    "selfHelp.longestStreak": "Longest streak",
    "selfHelp.completedResources": "Completed resources",
    "selfHelp.lastPracticed": "Last practiced",
    "selfHelp.quickTips": "Quick Tips",
    "selfHelp.tips":
      "• Practice regularly for best results\n• Monitor your blood pressure regularly\n• Take medications as prescribed\n• Maintain a healthy lifestyle\n• Manage stress effectively",
    "selfHelp.relatedResources": "Related Resources",
    "selfHelp.noResourcesFound": "No resources found",
    "selfHelp.noResourcesDesc": "Try selecting a different category or check back later for new resources",
    "selfHelp.backToOverview": "← Back to Overview",
    "selfHelp.beginner": "Beginner",
    "selfHelp.intermediate": "Intermediate",
    "selfHelp.advanced": "Advanced",
    "selfHelp.guide": "guide",
    "selfHelp.video": "Video",
    "selfHelp.diagram": "Diagram",
    "selfHelp.timer": "Timer",
    "selfHelp.min": "min",
    "selfHelp.days": "days",
    "selfHelp.never": "Never",
    "selfHelp.today": "Today",
    "selfHelp.yesterday": "Yesterday",
    "selfHelp.daysAgo": "days ago",
    "selfHelp.practiceSession": "Practice Session",
    "selfHelp.sessionComplete": "Session Complete!",
    "selfHelp.wellDone": "Well done! You've completed another health practice session.",
    "selfHelp.keepGoing": "Keep up the great work!",
    "selfHelp.resourceCompleted": "Resource marked as completed!",
    "selfHelp.alreadyCompleted": "You've already completed this resource.",

    // Blood Pressure Tracking
    "bp.title": "Blood Pressure Tracking",
    "bp.subtitle": "Monitor and track your blood pressure readings over time",
    "bp.addReading": "Add Reading",
    "bp.systolic": "Systolic",
    "bp.diastolic": "Diastolic",
    "bp.heartRate": "Heart Rate",
    "bp.date": "Date",
    "bp.time": "Time",
    "bp.notes": "Notes",
    "bp.save": "Save Reading",
    "bp.cancel": "Cancel",
    "bp.recentReadings": "Recent Readings",
    "bp.trends": "Trends",
    "bp.average": "Average",
    "bp.last7days": "Last 7 days",
    "bp.last30days": "Last 30 days",
    "bp.noReadings": "No readings yet",
    "bp.noReadingsDesc": "Start tracking your blood pressure by adding your first reading",
    "bp.readingAdded": "Blood pressure reading added successfully",
    "bp.invalidReading": "Please enter valid blood pressure values",
    "bp.category": "Category",
    "bp.mmHg": "mmHg",
    "bp.bpm": "bpm",

    // Medications
    "meds.title": "Medication Management",
    "meds.subtitle": "Track your medications and set reminders",
    "meds.addMedication": "Add Medication",
    "meds.medicationName": "Medication Name",
    "meds.dosage": "Dosage",
    "meds.frequency": "Frequency",
    "meds.time": "Time",
    "meds.notes": "Notes",
    "meds.save": "Save Medication",
    "meds.cancel": "Cancel",
    "meds.currentMedications": "Current Medications",
    "meds.noMedications": "No medications added",
    "meds.noMedicationsDesc": "Add your medications to track them and set reminders",
    "meds.medicationAdded": "Medication added successfully",
    "meds.takeNow": "Take Now",
    "meds.taken": "Taken",
    "meds.missed": "Missed",
    "meds.upcoming": "Upcoming",
    "meds.overdue": "Overdue",
    "meds.adherence": "Adherence Rate",
    "meds.thisWeek": "This Week",
    "meds.thisMonth": "This Month",

    // Settings
    "settings.title": "App Settings",
    "settings.language": "Language",
    "settings.selectLanguage": "Select your preferred language",
    "settings.english": "English",
    "settings.indonesian": "Bahasa Indonesia",
    "settings.notifications": "Notifications",
    "settings.privacy": "Privacy & Security",
    "settings.about": "About",

    // Language Selection
    "language.select": "Select Language",
    "language.current": "Current Language",
    "language.english": "English",
    "language.indonesian": "Bahasa Indonesia",
    "language.changed": "Language changed to {language}",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.submit": "Submit",
    "common.reset": "Reset",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",
    "common.ok": "OK",
    "common.minutes": "minutes",
    "common.hours": "hours",
    "common.days": "days",
    "common.weeks": "weeks",
    "common.months": "months",
    "common.once": "Once",
    "common.twice": "Twice",
    "common.threeTimes": "Three times",
    "common.daily": "daily",
    "common.asNeeded": "As needed",

    // Timer
    "timer.start": "Start",
    "timer.pause": "Pause",
    "timer.resume": "Resume",
    "timer.reset": "Reset",
    "timer.completed": "Exercise completed successfully!",
    "timer.ready": "Ready to start",
    "timer.running": "Running...",
    "timer.complete": "Timer Complete!",
    "timer.completedExercise": "You've completed the {title} exercise.",

    // About page translations
    "about.title": "About HyperCare",
    "about.subtitle":
      "We're revolutionizing hypertension management through AI-powered technology, making professional-grade assistance accessible to everyone, everywhere.",
    "about.badges.aiPowered": "AI-Powered",
    "about.badges.hipaaCompliant": "HIPAA Compliant",
    "about.badges.evidenceBased": "Evidence-Based",
    "about.mission.title": "Our Mission",
    "about.mission.description":
      "To democratize access to hypertension management by combining cutting-edge AI technology with evidence-based medical approaches, ensuring that quality cardiovascular care is available to everyone, regardless of location, time, or circumstances.",
    "about.features.title": "Key Features",
    "about.team.title": "Our Team",
    "about.howItWorks.title": "How HyperCare Works",
    "about.howItWorks.steps.signUp": "Sign Up",
    "about.howItWorks.steps.signUpDescription": "Create your secure account and complete your health profile",
    "about.howItWorks.steps.assessment": "Assessment",
    "about.howItWorks.steps.assessmentDescription": "Take our comprehensive hypertension and mental health assessment",
    "about.howItWorks.steps.aiSupport": "AI Support",
    "about.howItWorks.steps.aiSupportDescription": "Chat with our AI assistant for personalized hypertension guidance",
    "about.howItWorks.steps.trackProgress": "Track Progress",
    "about.howItWorks.steps.trackProgressDescription":
      "Monitor your blood pressure and health journey with detailed reports",
    "about.openSource.title": "Open Source & Deployment",
    "about.openSource.openSource": "Open Source",
    "about.openSource.openSourceDescription":
      "HyperCare is built with transparency in mind. Our codebase is available on GitHub, allowing developers and researchers to contribute to hypertension management technology advancement.",
    "about.openSource.viewOnGitHub": "View on GitHub",
    "about.openSource.easyDeployment": "Easy Deployment",
    "about.openSource.easyDeploymentDescription":
      "Deploy HyperCare to your own infrastructure with our comprehensive deployment guide. Compatible with major cloud providers and supports custom configurations.",
    "about.openSource.deploymentGuide": "Deployment Guide",
    "about.contact.title": "Get Involved",
    "about.contact.description":
      "Whether you're a developer, healthcare professional, or someone passionate about improving hypertension management, we'd love to hear from you.",
    "about.contact.contactUs": "Contact Us",
    "about.contact.joinCommunity": "Join Community",

    // Emergency Support
    "emergency.title": "Emergency Support",
    "emergency.crisisSupport": "Crisis Support",
    "emergency.crisisDescription":
      "If you're in immediate danger or having thoughts of self-harm, please reach out for help immediately.",
    "emergency.callCrisisHotline": "Call Crisis Hotline (119)",
    "emergency.mentalHealthSupport": "Mental Health Support",
    "emergency.mentalHealthDescription": "Connect with mental health professionals and support services.",
    "emergency.whatsappFacility": "WhatsApp Mental Health Facility",
    "emergency.nearbyFacilities": "Nearby Healthcare Facilities",
    "emergency.searchingFacilities": "Searching for nearby facilities...",
    "emergency.noFacilitiesFound": "No facilities found nearby",
    "emergency.enableLocation": "Enable Location",
    "emergency.locationError": "Unable to get your location. Please enable location services.",
    "emergency.searchError": "Failed to search for nearby facilities",
    "emergency.addressNotAvailable": "Address not available",
    "emergency.getDirections": "Directions",
    "emergency.callFacility": "Call",
    "emergency.distance": "km",
    "emergency.openNow": "Open",
    "emergency.closed": "Closed",
    "emergency.hospital": "Hospital",
    "emergency.clinic": "Clinic",
    "emergency.resources": "Additional Resources",
    "emergency.resourcesDescription": "24/7 support lines and resources",
    "emergency.nationalSuicide": "National Suicide Prevention: 988",
    "emergency.crisisText": "Crisis Text Line: Text HOME to 741741",
    "emergency.emergencyServices": "Emergency Services: 911",
    "emergency.notAlone": "Remember: You are not alone. Help is available.",
  },
  id: {
    // Navigation
    "nav.assessment": "Asesmen",
    "nav.monitoring": "Pemantauan",
    "nav.education": "Edukasi",
    "nav.reports": "Laporan",
    "nav.about": "Tentang",
    "nav.profile": "Profil",
    "nav.appSettings": "Pengaturan",
    "nav.logout": "Keluar",
    "nav.support": "Bantuan",

    // Home
    "home.title": "Selamat Datang di HyperCare",
    "home.subtitle":
      "Teman komprehensif pengelolaan hipertensi Anda. Dapatkan dukungan personal, asesmen kesehatan, dan sumber daya dengan teknologi AI canggih untuk kesehatan fisik dan mental Anda.",
    "home.startChat": "Mulai Obrolan Kesehatan",
    "home.takeAssessment": "Asesmen Kesehatan",
    "home.getStarted": "Mulai Sekarang",
    "home.learnMore": "Pelajari Lebih Lanjut",
    "home.viewReports": "Lihat Laporan",
    "home.trackBP": "Pantau Tekanan Darah",

    // Home Features
    "home.aiChatTitle": "Asisten Kesehatan AI",
    "home.aiChatDescription":
      "Percakapan cerdas tentang pengelolaan hipertensi, perubahan gaya hidup, dan dukungan kesehatan mental",
    "home.bpTrackingTitle": "Pemantauan Tekanan Darah",
    "home.bpTrackingDescription": "Pantau pembacaan tekanan darah dengan analitik cerdas dan analisis tren",
    "home.medicationTitle": "Manajemen Obat",
    "home.medicationDescription": "Lacak obat, atur pengingat, dan pantau kepatuhan untuk kontrol hipertensi optimal",
    "home.lifestyleTitle": "Pelatihan Gaya Hidup",
    "home.lifestyleDescription": "Panduan personal tentang diet, olahraga, manajemen stres, dan kebiasaan sehat",
    "home.mentalHealthTitle": "Dukungan Kesehatan Mental",
    "home.mentalHealthDescription": "Atasi stres, kecemasan, dan faktor emosional yang mempengaruhi tekanan darah",
    "home.progressTrackingTitle": "Pemantauan Kemajuan",
    "home.progressTrackingDescription": "Pelacakan komprehensif perjalanan pengelolaan hipertensi Anda",
    "home.readyToStart": "Siap mengendalikan hipertensi Anda?",
    "home.joinThousands":
      "Bergabunglah dengan ribuan pengguna yang mengelola hipertensi mereka dengan platform komprehensif HyperCare",

    // Login
    "login.title": "HyperCare",
    "login.subtitle": "Selamat datang kembali di perjalanan pengelolaan hipertensi Anda",
    "login.subtitleRegister": "Mulai mengelola hipertensi Anda hari ini",
    "login.fullName": "Nama Lengkap",
    "login.email": "Email",
    "login.password": "Kata Sandi",
    "login.signIn": "Masuk",
    "login.createAccount": "Buat Akun",
    "login.noAccount": "Belum punya akun? Daftar di sini",
    "login.hasAccount": "Sudah punya akun? Masuk",
    "login.backHome": "← Kembali ke Beranda",

    // Chat
    "chat.title": "Asisten Kesehatan AI",
    "chat.placeholder": "Tanyakan tentang tekanan darah, obat, gaya hidup, atau kesehatan mental...",
    "chat.initialMessage":
      "Halo! Saya adalah asisten kesehatan AI yang mengkhususkan diri dalam pengelolaan hipertensi. Saya dapat membantu dengan pertanyaan tekanan darah, saran gaya hidup, informasi obat, dan dukungan kesehatan mental. Bagaimana saya bisa membantu Anda hari ini?",

    // Assessment
    "assessment.title": "Asesmen Kesehatan",
    "assessment.subtitle": "Evaluasi kesehatan komprehensif terpandu AI",
    "assessment.description":
      "Pilih dari opsi asesmen komprehensif kami untuk mengevaluasi pengelolaan hipertensi dan pengetahuan kesehatan Anda",
    "assessment.startAssessment": "Mulai Asesmen",
    "assessment.chatPlaceholder": "Ketik jawaban Anda di sini...",
    "assessment.viewReport": "Lihat Laporan",
    "assessment.talkToAI": "Ngobrol dengan AI",
    "assessment.personalizedDesc":
      "Jalani asesmen kesehatan personal yang mengevaluasi pengelolaan hipertensi, faktor gaya hidup, dan pengetahuan kesehatan Anda.",
    "assessment.conversational": "Asesmen Percakapan",
    "assessment.conversationalFeatures":
      "• Dialog alami tentang kesehatan Anda\n• Pertanyaan tentang tekanan darah, gaya hidup, dan kesehatan mental\n• Dukungan input suara dan teks\n• Analisis kesehatan real-time",
    "assessment.intelligentInsights": "Wawasan Kesehatan",
    "assessment.insightsFeatures":
      "• Analisis pengelolaan hipertensi personal\n• Rekomendasi gaya hidup dan kesehatan mental\n• Pelacakan kemajuan dari waktu ke waktu\n• Panduan penyedia layanan kesehatan",
    "assessment.privacyNotice":
      "Pemberitahuan Privasi: Data kesehatan Anda sepenuhnya rahasia dan aman. Asesmen ini akan membantu kami memberikan rekomendasi pengelolaan hipertensi yang personal.",
    "assessment.backToOverview": "← Kembali ke Ringkasan",
    "assessment.progressTitle": "Progres Asesmen",
    "assessment.startedConversation": "Percakapan dimulai",
    "assessment.completeAssessment": "Asesmen selesai",
    "assessment.receiveInsights": "Menerima wawasan",
    "assessment.tipsTitle": "Tips Asesmen",
    "assessment.tips":
      "• Jujur tentang gejala dan gaya hidup Anda\n• Sertakan informasi tentang obat-obatan\n• Sebutkan tingkat stres dan kesehatan mental\n• Ajukan pertanyaan jika butuh klarifikasi",
    "assessment.needHelp": "Butuh Bantuan?",
    "assessment.emergencyText": "Jika Anda mengalami krisis hipertensi, silakan hubungi:",
    "assessment.emergency": "Darurat: 119",
    "assessment.comprehensive": "Asesmen AI Lengkap",
    "assessment.comprehensiveDesc": "Evaluasi AI mendalam menggunakan Dify API untuk analisis kesehatan lengkap",
    "assessment.quick": "Asesmen AI Cepat",
    "assessment.quickDesc": "Skrining cepat untuk pemantauan rutin dan deteksi dini",
    "assessment.knowledge": "Tes Pengetahuan",
    "assessment.knowledgeDesc": "Evaluasi pemahaman Anda tentang pengelolaan hipertensi",

    // Monitoring
    "monitoring.title": "Pemantauan Kesehatan",
    "monitoring.subtitle": "Lacak tekanan darah dan asupan obat Anda",
    "monitoring.bpInput": "Input Tekanan Darah",
    "monitoring.medicationInput": "Input Obat",
    "monitoring.todaysProgress": "Kemajuan Hari Ini",
    "monitoring.medicationsTaken": "Obat diminum hari ini",
    "monitoring.todaysChecklist": "Daftar Periksa Obat Hari Ini",
    "monitoring.checklistDescription": "Centang obat saat Anda meminumnya sepanjang hari",
    "monitoring.addMedicationDesc": "Tambahkan obat baru ke rutinitas harian Anda",
    "monitoring.scheduleTimes": "Jadwal Waktu",
    "monitoring.addTime": "Tambah Waktu",
    "monitoring.remove": "Hapus",
    "monitoring.addMedication": "Tambah Obat",
    "monitoring.cancel": "Batal",
    "monitoring.taken": "Diminum",
    "monitoring.overdue": "Terlambat",
    "monitoring.dueSoon": "Segera Jatuh Tempo",
    "monitoring.scheduled": "Terjadwal",
    "monitoring.takenAt": "Diminum pada",
    "monitoring.noMedicationsToday": "Tidak ada obat terjadwal untuk hari ini",
    "monitoring.noMedicationsDesc": "Tambahkan obat untuk mulai melacak rutinitas harian Anda",
    "monitoring.additionalNotes": "Catatan tambahan (opsional)",

    // Reports
    "reports.title": "Laporan Kesehatan",
    "reports.subtitle": "Lacak kemajuan dan hasil asesmen kesehatan Anda dari waktu ke waktu",
    "reports.exportPDF": "Ekspor PDF",
    "reports.print": "Cetak",
    "reports.noReports": "Belum Ada Laporan",
    "reports.noReportsDesc": "Ikuti asesmen kesehatan pertama Anda untuk mulai melacak kemajuan",
    "reports.takeAssessment": "Ikuti Asesmen",
    "reports.latestBP": "Pembacaan TD Terbaru",
    "reports.averageBP": "Rata-rata TD (30 hari)",
    "reports.totalAssessments": "Total Asesmen",
    "reports.progressTrend": "Tren Kemajuan",
    "reports.improving": "Membaik",
    "reports.needsAttention": "Butuh Perhatian",
    "reports.needMoreData": "Butuh lebih banyak data",
    "reports.assessmentHistory": "Riwayat Asesmen",
    "reports.historyDesc": "Hasil asesmen kesehatan Anda dari waktu ke waktu",
    "reports.recommendations": "Rekomendasi",
    "reports.recommendationsDesc": "Berdasarkan asesmen terbaru dan data kesehatan Anda",
    "reports.professionalSupport":
      "Penting: Pembacaan terbaru Anda menunjukkan Anda harus berkonsultasi dengan penyedia layanan kesehatan untuk penyesuaian obat atau perawatan tambahan.",
    "reports.continueAI": "Terus gunakan asisten AI kami untuk dukungan harian dan panduan kesehatan.",
    "reports.exploreSelfHelp": "Jelajahi modul edukasi kami untuk teknik pengelolaan gaya hidup.",
    "reports.chatWithAI": "Ngobrol dengan AI",
    "reports.educationResources": "Sumber Edukasi",
    "reports.normal": "Normal",
    "reports.elevated": "Meningkat",
    "reports.stage1": "Hipertensi Tahap 1",
    "reports.stage2": "Hipertensi Tahap 2",
    "reports.crisis": "Krisis Hipertensi",
    "reports.since": "Sejak",
    "reports.assessment": "Asesmen",
    "reports.comprehensiveResults": "Hasil AI Lengkap",
    "reports.quickResults": "Hasil Asesmen Cepat",
    "reports.knowledgeLevel": "Level Pengetahuan",

    // Education (Self-Help)
    "selfHelp.title": "Edukasi Kesehatan",
    "selfHelp.subtitle":
      "Teknik berbasis bukti untuk mengelola hipertensi melalui perubahan gaya hidup, pengurangan stres, dan dukungan kesehatan mental",
    "selfHelp.description":
      "Sumber edukasi komprehensif yang menggabungkan pengelolaan kesehatan fisik untuk hipertensi dengan dukungan kesehatan mental",
    "selfHelp.aiAssistant": "Pelatih Kesehatan AI",
    "selfHelp.aiAssistantTitle": "Pelatih Kesehatan AI",
    "selfHelp.aiAssistantDesc": "Dapatkan panduan personal untuk pengelolaan hipertensi dan kesehatan mental",
    "selfHelp.backToResources": "← Kembali ke Sumber",
    "selfHelp.aiPlaceholder": "Tanyakan tentang diet, olahraga, manajemen stres, obat, atau kesehatan mental...",
    "selfHelp.allResources": "Semua Sumber",
    "selfHelp.bloodPressure": "Tekanan Darah",
    "selfHelp.diet": "Diet & Nutrisi",
    "selfHelp.exercise": "Olahraga",
    "selfHelp.stress": "Manajemen Stres",
    "selfHelp.medications": "Obat-obatan",
    "selfHelp.mentalHealth": "Kesehatan Mental",
    "selfHelp.markCompleted": "Tandai Selesai",
    "selfHelp.discussWithAI": "Diskusikan dengan AI",
    "selfHelp.startResource": "Mulai Sumber",
    "selfHelp.progressTracking": "Pelacakan Kemajuan",
    "selfHelp.sessionsCompleted": "Sesi selesai",
    "selfHelp.totalPracticeTime": "Total waktu praktik",
    "selfHelp.streak": "Hari beruntun saat ini",
    "selfHelp.longestStreak": "Hari beruntun terpanjang",
    "selfHelp.completedResources": "Sumber selesai",
    "selfHelp.lastPracticed": "Terakhir dipraktikkan",
    "selfHelp.quickTips": "Tips Cepat",
    "selfHelp.tips":
      "• Praktikkan secara teratur untuk hasil terbaik\n• Pantau tekanan darah secara teratur\n• Minum obat sesuai resep\n• Pertahankan gaya hidup sehat\n• Kelola stres secara efektif",
    "selfHelp.relatedResources": "Sumber Terkait",
    "selfHelp.noResourcesFound": "Sumber tidak ditemukan",
    "selfHelp.noResourcesDesc": "Coba pilih kategori berbeda atau periksa kembali nanti",
    "selfHelp.backToOverview": "← Kembali ke Ringkasan",
    "selfHelp.beginner": "Pemula",
    "selfHelp.intermediate": "Menengah",
    "selfHelp.advanced": "Lanjutan",
    "selfHelp.guide": "panduan",
    "selfHelp.video": "Video",
    "selfHelp.diagram": "Diagram",
    "selfHelp.timer": "Timer",
    "selfHelp.min": "mnt",
    "selfHelp.days": "hari",
    "selfHelp.never": "Tidak pernah",
    "selfHelp.today": "Hari ini",
    "selfHelp.yesterday": "Kemarin",
    "selfHelp.daysAgo": "hari lalu",
    "selfHelp.practiceSession": "Sesi Praktik",
    "selfHelp.sessionComplete": "Sesi Selesai!",
    "selfHelp.wellDone": "Bagus! Anda telah menyelesaikan sesi praktik kesehatan lainnya.",
    "selfHelp.keepGoing": "Terus pertahankan kerja keras Anda!",
    "selfHelp.resourceCompleted": "Sumber ditandai selesai!",
    "selfHelp.alreadyCompleted": "Anda sudah menyelesaikan sumber ini.",

    // Blood Pressure Tracking
    "bp.title": "Pelacakan Tekanan Darah",
    "bp.subtitle": "Pantau dan lacak pembacaan tekanan darah Anda dari waktu ke waktu",
    "bp.addReading": "Tambah Pembacaan",
    "bp.systolic": "Sistolik",
    "bp.diastolic": "Diastolik",
    "bp.heartRate": "Detak Jantung",
    "bp.date": "Tanggal",
    "bp.time": "Waktu",
    "bp.notes": "Catatan",
    "bp.save": "Simpan Pembacaan",
    "bp.cancel": "Batal",
    "bp.recentReadings": "Pembacaan Terbaru",
    "bp.trends": "Tren",
    "bp.average": "Rata-rata",
    "bp.last7days": "7 hari terakhir",
    "bp.last30days": "30 hari terakhir",
    "bp.noReadings": "Belum ada pembacaan",
    "bp.noReadingsDesc": "Mulai lacak tekanan darah dengan menambahkan pembacaan pertama",
    "bp.readingAdded": "Pembacaan tekanan darah berhasil ditambahkan",
    "bp.invalidReading": "Harap masukkan nilai tekanan darah yang valid",
    "bp.category": "Kategori",
    "bp.mmHg": "mmHg",
    "bp.bpm": "bpm",

    // Medications
    "meds.title": "Manajemen Obat",
    "meds.subtitle": "Lacak obat Anda dan atur pengingat",
    "meds.addMedication": "Tambah Obat",
    "meds.medicationName": "Nama Obat",
    "meds.dosage": "Dosis",
    "meds.frequency": "Frekuensi",
    "meds.time": "Waktu",
    "meds.notes": "Catatan",
    "meds.save": "Simpan Obat",
    "meds.cancel": "Batal",
    "meds.currentMedications": "Obat Saat Ini",
    "meds.noMedications": "Belum ada obat ditambahkan",
    "meds.noMedicationsDesc": "Tambahkan obat Anda untuk melacak dan mengatur pengingat",
    "meds.medicationAdded": "Obat berhasil ditambahkan",
    "meds.takeNow": "Minum Sekarang",
    "meds.taken": "Diminum",
    "meds.missed": "Terlewat",
    "meds.upcoming": "Akan Datang",
    "meds.overdue": "Terlambat",
    "meds.adherence": "Tingkat Kepatuhan",
    "meds.thisWeek": "Minggu Ini",
    "meds.thisMonth": "Bulan Ini",

    // Settings
    "settings.title": "Pengaturan Aplikasi",
    "settings.language": "Bahasa",
    "settings.selectLanguage": "Pilih bahasa pilihan Anda",
    "settings.english": "English",
    "settings.indonesian": "Bahasa Indonesia",
    "settings.notifications": "Notifikasi",
    "settings.privacy": "Privasi & Keamanan",
    "settings.about": "Tentang",

    // Language Selection
    "language.select": "Pilih Bahasa",
    "language.current": "Bahasa Saat Ini",
    "language.english": "English",
    "language.indonesian": "Bahasa Indonesia",
    "language.changed": "Bahasa telah diubah ke {language}",

    // Common
    "common.loading": "Memuat...",
    "common.error": "Terjadi Kesalahan",
    "common.success": "Berhasil",
    "common.cancel": "Batal",
    "common.save": "Simpan",
    "common.delete": "Hapus",
    "common.edit": "Ubah",
    "common.close": "Tutup",
    "common.back": "Kembali",
    "common.next": "Lanjut",
    "common.previous": "Sebelumnya",
    "common.submit": "Kirim",
    "common.reset": "Atur Ulang",
    "common.confirm": "Konfirmasi",
    "common.yes": "Ya",
    "common.no": "Tidak",
    "common.ok": "OK",
    "common.minutes": "menit",
    "common.hours": "jam",
    "common.days": "hari",
    "common.weeks": "minggu",
    "common.months": "bulan",
    "common.once": "Sekali",
    "common.twice": "Dua kali",
    "common.threeTimes": "Tiga kali",
    "common.daily": "sehari",
    "common.asNeeded": "Sesuai kebutuhan",

    // Timer
    "timer.start": "Mulai",
    "timer.pause": "Jeda",
    "timer.resume": "Lanjutkan",
    "timer.reset": "Atur Ulang",
    "timer.completed": "Latihan berhasil diselesaikan!",
    "timer.ready": "Siap memulai",
    "timer.running": "Berlangsung...",
    "timer.complete": "Waktu Habis!",
    "timer.completedExercise": "Anda telah menyelesaikan latihan {title}.",

    // About page translations
    "about.title": "Tentang HyperCare",
    "about.subtitle":
      "Kami merevolusi pengelolaan hipertensi melalui teknologi bertenaga AI, membuat bantuan tingkat profesional dapat diakses oleh semua orang, di mana saja.",
    "about.badges.aiPowered": "Bertenaga AI",
    "about.badges.hipaaCompliant": "Sesuai HIPAA",
    "about.badges.evidenceBased": "Berbasis Bukti",
    "about.mission.title": "Misi Kami",
    "about.mission.description":
      "Untuk mendemokratisasi akses ke pengelolaan hipertensi dengan menggabungkan teknologi AI mutakhir dengan pendekatan medis berbasis bukti, memastikan bahwa perawatan kardiovaskular berkualitas tersedia untuk semua orang, terlepas dari lokasi, waktu, atau keadaan.",
    "about.features.title": "Fitur Utama",
    "about.team.title": "Tim Kami",
    "about.howItWorks.title": "Cara Kerja HyperCare",
    "about.howItWorks.steps.signUp": "Daftar",
    "about.howItWorks.steps.signUpDescription": "Buat akun aman Anda dan lengkapi profil kesehatan Anda",
    "about.howItWorks.steps.assessment": "Asesmen",
    "about.howItWorks.steps.assessmentDescription": "Ikuti asesmen hipertensi dan kesehatan mental komprehensif kami",
    "about.howItWorks.steps.aiSupport": "Dukungan AI",
    "about.howItWorks.steps.aiSupportDescription":
      "Ngobrol dengan asisten AI kami untuk panduan hipertensi yang dipersonalisasi",
    "about.howItWorks.steps.trackProgress": "Lacak Kemajuan",
    "about.howItWorks.steps.trackProgressDescription":
      "Pantau tekanan darah dan perjalanan kesehatan Anda dengan laporan terperinci",
    "about.openSource.title": "Sumber Terbuka & Deployment",
    "about.openSource.openSource": "Sumber Terbuka",
    "about.openSource.openSourceDescription":
      "HyperCare dibangun dengan transparansi dalam pikiran. Basis kode kami tersedia di GitHub, memungkinkan pengembang dan peneliti untuk berkontribusi pada kemajuan teknologi pengelolaan hipertensi.",
    "about.openSource.viewOnGitHub": "Lihat di GitHub",
    "about.openSource.easyDeployment": "Deployment Mudah",
    "about.openSource.easyDeploymentDescription":
      "Deploy HyperCare ke infrastruktur Anda sendiri dengan panduan deployment komprehensif kami. Kompatibel dengan penyedia cloud utama dan mendukung konfigurasi kustom.",
    "about.openSource.deploymentGuide": "Panduan Deployment",
    "about.contact.title": "Terlibat",
    "about.contact.description":
      "Baik Anda seorang pengembang, profesional kesehatan, atau seseorang yang bersemangat tentang meningkatkan pengelolaan hipertensi, kami ingin mendengar dari Anda.",
    "about.contact.contactUs": "Hubungi Kami",
    "about.contact.joinCommunity": "Bergabung dengan Komunitas",

    // Emergency Support
    "emergency.title": "Bantuan Darurat",
    "emergency.crisisSupport": "Dukungan Krisis",
    "emergency.crisisDescription":
      "Jika Anda dalam bahaya langsung atau memiliki pikiran untuk menyakiti diri sendiri, segera hubungi bantuan.",
    "emergency.callCrisisHotline": "Hubungi Hotline Krisis (119)",
    "emergency.mentalHealthSupport": "Dukungan Kesehatan Mental",
    "emergency.mentalHealthDescription": "Terhubung dengan profesional kesehatan mental dan layanan dukungan.",
    "emergency.whatsappFacility": "WhatsApp Fasilitas Kesehatan Mental",
    "emergency.nearbyFacilities": "Fasilitas Kesehatan Terdekat",
    "emergency.searchingFacilities": "Mencari fasilitas terdekat...",
    "emergency.noFacilitiesFound": "Tidak ada fasilitas ditemukan di sekitar",
    "emergency.enableLocation": "Aktifkan Lokasi",
    "emergency.locationError": "Tidak dapat mendapatkan lokasi Anda. Harap aktifkan layanan lokasi.",
    "emergency.searchError": "Gagal mencari fasilitas terdekat",
    "emergency.addressNotAvailable": "Alamat tidak tersedia",
    "emergency.getDirections": "Petunjuk Arah",
    "emergency.callFacility": "Telepon",
    "emergency.distance": "km",
    "emergency.openNow": "Buka Sekarang",
    "emergency.closed": "Tutup",
    "emergency.hospital": "Rumah Sakit",
    "emergency.clinic": "Klinik",
    "emergency.resources": "Sumber Daya Tambahan",
    "emergency.resourcesDescription": "Saluran dukungan 24/7 dan sumber daya",
    "emergency.nationalSuicide": "Pencegahan Bunuh Diri Nasional: 119",
    "emergency.crisisText": "SMS Krisis: Kirim BANTUAN ke 119",
    "emergency.emergencyServices": "Layanan Darurat: 112",
    "emergency.notAlone": "Ingat: Anda tidak sendirian. Bantuan tersedia.",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Add this line to export LanguageContext as a named export
export { LanguageContext }

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    // Auto-detect browser language on first load
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "id")) {
      setLanguage(savedLanguage)
    } else {
      // Auto-detect from browser
      const browserLanguage = navigator.language.toLowerCase()
      if (browserLanguage.startsWith("id") || browserLanguage.includes("indonesia")) {
        setLanguage("id")
        localStorage.setItem("language", "id")
      } else {
        setLanguage("en")
        localStorage.setItem("language", "en")
      }
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
