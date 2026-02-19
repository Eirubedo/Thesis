/**
 * Monev Knowledge Base
 * Comprehensive resource for diagnoses, symptoms, and abilities for Monitoring & Evaluation
 */

export const MONEV_DIAGNOSES = {
  HT: {
    diagnosis_name: "Hipertensi",
    diagnosis_code: "HT",
    signs_symptoms: [
      { id: "hts1", name: "Sakit kepala atau pusing", label: "Sakit kepala atau pusing" },
      { id: "hts2", name: "Tengkuk terasa berat atau kaku", label: "Tengkuk terasa berat atau kaku" },
      { id: "hts3", name: "Jantung berdebar-debar", label: "Jantung berdebar-debar" },
      { id: "hts4", name: "Penglihatan kabur", label: "Penglihatan kabur" },
      { id: "hts5", name: "Mudah lelah", label: "Mudah lelah" },
      { id: "hts6", name: "Sulit tidur", label: "Sulit tidur" },
      { id: "hts7", name: "Tekanan darah di atas normal (>140/90)", label: "Tekanan darah di atas normal (>140/90)" },
    ],
    abilities: [
      {
        id: "hta1",
        name: "Mengenal tanda gejala hipertensi",
        label: "Mengenal tanda gejala hipertensi",
        category: "knowledge",
      },
      {
        id: "hta2",
        name: "Mengetahui cara mengendalikan hipertensi dengan pola makan DASH",
        label: "Mengetahui cara mengendalikan hipertensi dengan pola makan DASH",
        category: "knowledge",
      },
      {
        id: "hta3",
        name: "Mengetahui cara mengendalikan hipertensi dengan minum obat rutin (Jadwal, Cara, Waktu, Jumlah)",
        label: "Mengetahui cara mengendalikan hipertensi dengan minum obat rutin",
        category: "knowledge",
      },
      {
        id: "hta4",
        name: "Mengetahui cara manajemen stres untuk hipertensi",
        label: "Mengetahui cara manajemen stres untuk hipertensi",
        category: "knowledge",
      },
    ],
  },
  AS: {
    diagnosis_name: "Ansietas (Kecemasan)",
    diagnosis_code: "AS",
    signs_symptoms: [
      { id: "ass1", name: "Perasaan bingung", label: "Perasaan bingung" },
      { id: "ass2", name: "Merasa khawatir dengan akibat dari kondisi yang dihadapi", label: "Merasa khawatir dengan akibat dari kondisi yang dihadapi" },
      { id: "ass3", name: "Sulit berkonsentrasi", label: "Sulit berkonsentrasi" },
      { id: "ass4", name: "Tampak gelisah", label: "Tampak gelisah" },
      { id: "ass5", name: "Sulit tidur", label: "Sulit tidur" },
      { id: "ass6", name: "Jantung berdebar kencang", label: "Jantung berdebar kencang" },
      { id: "ass7", name: "Napas terasa pendek/cepat", label: "Napas terasa pendek/cepat" },
      { id: "ass8", name: "Tangan gemetar (tremor)", label: "Tangan gemetar (tremor)" },
    ],
    abilities: [
      {
        id: "asa1",
        name: "Mengenal perasaan cemas, penyebab, dan akibatnya",
        label: "Mengenal perasaan cemas, penyebab, dan akibatnya",
        category: "knowledge",
      },
      {
        id: "asa2",
        name: "Mengenal pengalaman pikiran dan perilaku positif",
        label: "Mengenal pengalaman pikiran dan perilaku positif",
        category: "knowledge",
      },
      {
        id: "asa3",
        name: "Mampu berpartisipasi dalam aktivitas sehari-hari",
        label: "Mampu berpartisipasi dalam aktivitas sehari-hari",
        category: "practice",
      },
      {
        id: "asa4",
        name: "Mampu memanfaatkan sistem pendukung keluarga yang dimiliki",
        label: "Mampu memanfaatkan sistem pendukung keluarga yang dimiliki",
        category: "practice",
      },
    ],
  },
  GCT: {
    diagnosis_name: "Gangguan Citra Tubuh",
    diagnosis_code: "GCT",
    signs_symptoms: [
      { id: "gcts1", name: "Menolak melihat bagian tubuh yang berubah", label: "Menolak melihat bagian tubuh yang berubah" },
      { id: "gcts2", name: "Menolak menyentuh bagian tubuh yang berubah", label: "Menolak menyentuh bagian tubuh yang berubah" },
      { id: "gcts3", name: "Menyembunyikan bagian tubuh yang berubah", label: "Menyembunyikan bagian tubuh yang berubah" },
      { id: "gcts4", name: "Fokus berlebihan pada perubahan tubuh", label: "Fokus berlebihan pada perubahan tubuh" },
      { id: "gcts5", name: "Perasaan negatif tentang tubuh", label: "Perasaan negatif tentang tubuh" },
      { id: "gcts6", name: "Takut reaksi orang lain terhadap tubuhnya", label: "Takut reaksi orang lain terhadap tubuhnya" },
    ],
    abilities: [
      {
        id: "gcta1",
        name: "Mampu menilai citra tubuh: fungsi, bentuk, dan struktur tubuh yang masih sehat",
        label: "Mampu menilai citra tubuh: fungsi, bentuk, dan struktur tubuh yang masih sehat",
        category: "knowledge",
      },
      {
        id: "gcta2",
        name: "Mampu menyebutkan bagian tubuh yang sehat",
        label: "Mampu menyebutkan bagian tubuh yang sehat",
        category: "practice",
      },
      {
        id: "gcta3",
        name: "Mampu melatih bagian tubuh yang sehat",
        label: "Mampu melatih bagian tubuh yang sehat",
        category: "practice",
      },
      {
        id: "gcta4",
        name: "Mampu menilai citra tubuh: fungsi, bentuk, dan struktur tubuh yang terganggu",
        label: "Mampu menilai citra tubuh: fungsi, bentuk, dan struktur tubuh yang terganggu",
        category: "knowledge",
      },
      {
        id: "gcta5",
        name: "Mampu menyebutkan bagian tubuh yang terganggu",
        label: "Mampu menyebutkan bagian tubuh yang terganggu",
        category: "practice",
      },
      {
        id: "gcta6",
        name: "Mampu menggunakan dan melatih bagian tubuh yang terganggu (melihat, menyentuh, merawat)",
        label: "Mampu menggunakan dan melatih bagian tubuh yang terganggu",
        category: "practice",
      },
      {
        id: "gcta7",
        name: "Mampu meningkatkan citra tubuh dengan alat bantu (protese/kosmetik/pakaian baru)",
        label: "Mampu meningkatkan citra tubuh dengan alat bantu",
        category: "practice",
      },
      {
        id: "gcta8",
        name: "Mampu melakukan afirmasi positif bagian tubuh sehat maupun terganggu",
        label: "Mampu melakukan afirmasi positif bagian tubuh",
        category: "practice",
      },
    ],
  },
  RBD: {
    diagnosis_name: "Resiko Bunuh Diri",
    diagnosis_code: "RBD",
    signs_symptoms: [
      { id: "rbds1", name: "Mengatakan ingin mati atau mengakhiri hidup", label: "Mengatakan ingin mati atau mengakhiri hidup" },
      { id: "rbds2", name: "Memberikan isyarat verbal/non-verbal akan bunuh diri", label: "Memberikan isyarat verbal/non-verbal akan bunuh diri" },
      { id: "rbds3", name: "Menyiapkan alat/cara untuk bunuh diri", label: "Menyiapkan alat/cara untuk bunuh diri" },
      { id: "rbds4", name: "Perasaan putus asa/tidak ada harapan", label: "Perasaan putus asa/tidak ada harapan" },
      { id: "rbds5", name: "Menarik diri dari lingkungan sosial", label: "Menarik diri dari lingkungan sosial" },
      { id: "rbds6", name: "Kehilangan minat pada hal yang dulu disukai", label: "Kehilangan minat pada hal yang dulu disukai" },
    ],
    abilities: [
      {
        id: "rbda1",
        name: "Mengidentifikasi beratnya masalah risiko bunuh diri (isyarat, ancaman, percobaan)",
        label: "Mengidentifikasi beratnya masalah risiko bunuh diri",
        category: "knowledge",
      },
      {
        id: "rbda2",
        name: "Mengidentifikasi benda-benda berbahaya dan mengamankannya",
        label: "Mengidentifikasi benda-benda berbahaya dan mengamankannya",
        category: "practice",
      },
      {
        id: "rbda3",
        name: "Melatih kendali diri: Daftar aspek positif diri sendiri & afirmasi positif",
        label: "Melatih kendali diri: aspek positif diri sendiri",
        category: "practice",
      },
      {
        id: "rbda4",
        name: "Melatih kendali diri: Daftar aspek positif keluarga/lingkungan & afirmasi positif",
        label: "Melatih kendali diri: aspek positif keluarga/lingkungan",
        category: "practice",
      },
      {
        id: "rbda5",
        name: "Mengetahui harapan dan masa depan",
        label: "Mengetahui harapan dan masa depan",
        category: "knowledge",
      },
      {
        id: "rbda6",
        name: "Mengetahui cara mencapai harapan dan masa depan",
        label: "Mengetahui cara mencapai harapan dan masa depan",
        category: "knowledge",
      },
      {
        id: "rbda7",
        name: "Melatih cara mencapai harapan secara bertahap",
        label: "Melatih cara mencapai harapan secara bertahap",
        category: "practice",
      },
      {
        id: "rbda8",
        name: "Melatih tahap kedua kegiatan mencapai masa depan",
        label: "Melatih tahap kedua kegiatan mencapai masa depan",
        category: "practice",
      },
    ],
  },
}

export type DiagnosisCode = keyof typeof MONEV_DIAGNOSES

/**
 * Get diagnosis details by code
 */
export function getDiagnosisDetails(code: DiagnosisCode) {
  return MONEV_DIAGNOSES[code]
}

/**
 * Get all symptoms for a diagnosis
 */
export function getDiagnosisSymptoms(code: DiagnosisCode) {
  return MONEV_DIAGNOSES[code]?.signs_symptoms || []
}

/**
 * Get all abilities for a diagnosis
 */
export function getDiagnosisAbilities(code: DiagnosisCode) {
  return MONEV_DIAGNOSES[code]?.abilities || []
}

/**
 * Calculate symptom count from selected symptoms
 */
export function calculateSymptomCount(selectedSymptomIds: string[]): number {
  return selectedSymptomIds.length
}

/**
 * Calculate ability gaps (known but not practiced)
 */
export function calculateAbilityGaps(
  abilitiesKnown: string[],
  abilitiesPracticed: string[]
): string[] {
  return abilitiesKnown.filter((ability) => !abilitiesPracticed.includes(ability))
}

/**
 * Get summary of assessment
 */
export function getAssessmentSummary(
  diagnosisCode: DiagnosisCode,
  selectedSymptomIds: string[],
  abilitiesKnown: string[],
  abilitiesPracticed: string[]
) {
  const diagnosis = getDiagnosisDetails(diagnosisCode)
  const symptomCount = calculateSymptomCount(selectedSymptomIds)
  const abilityGaps = calculateAbilityGaps(abilitiesKnown, abilitiesPracticed)

  return {
    diagnosis_name: diagnosis.diagnosis_name,
    symptom_count: symptomCount,
    total_symptoms: diagnosis.signs_symptoms.length,
    abilities_known_count: abilitiesKnown.length,
    abilities_practiced_count: abilitiesPracticed.length,
    ability_gaps_count: abilityGaps.length,
    ability_gaps: abilityGaps,
    recovery_percentage: Math.round(
      ((diagnosis.signs_symptoms.length - symptomCount) / diagnosis.signs_symptoms.length) * 100
    ),
  }
}

/**
 * Recommend next ability to practice based on diagnosis and gaps
 */
export function recommendNextAbility(
  diagnosisCode: DiagnosisCode,
  abilitiesKnown: string[],
  abilitiesPracticed: string[]
): string | null {
  const abilities = getDiagnosisAbilities(diagnosisCode)
  const gaps = calculateAbilityGaps(abilitiesKnown, abilitiesPracticed)

  if (gaps.length === 0) {
    // If no gaps, recommend the first ability not yet known
    const unknownAbilities = abilities.filter((a) => !abilitiesKnown.includes(a.name))
    return unknownAbilities[0]?.name || null
  }

  return gaps[0] || null
}

/**
 * Get practice frequency labels
 */
export const PRACTICE_FREQUENCIES = [
  { value: "every-day", label: "Setiap hari" },
  { value: "3-times-week", label: "3x seminggu" },
  { value: "1-2-times-week", label: "1-2x seminggu" },
  { value: "rarely", label: "Jarang" },
  { value: "never", label: "Tidak pernah" },
]

/**
 * Get all diagnosis codes
 */
export function getAllDiagnosisCodes(): DiagnosisCode[] {
  return Object.keys(MONEV_DIAGNOSES) as DiagnosisCode[]
}

/**
 * Get diagnosis names for display
 */
export function getDiagnosisNameByCode(code: DiagnosisCode): string {
  return MONEV_DIAGNOSES[code]?.diagnosis_name || code
}
