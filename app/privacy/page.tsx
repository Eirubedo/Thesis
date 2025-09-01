"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Shield, Mail, FileText, Users, Lock, Eye, Phone } from "lucide-react"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-sky-100">
      <Navigation />

      <div className="pt-16 max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <Button onClick={() => router.back()} variant="ghost" className="mb-4">
            ← Kembali
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kebijakan Privasi</h1>
          <p className="text-gray-600">Aplikasi Venti - Penelitian Kesehatan Mental</p>
        </div>

        <Card className="border-sky-100">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Shield className="w-8 h-8 mr-3 text-sky-600" />
              KEBIJAKAN PRIVASI APLIKASI Venti
            </CardTitle>
            <div className="bg-sky-50 p-4 rounded-lg border border-sky-200 mt-4">
              <p className="text-sky-800 font-medium">Tanggal Efektif: 19 Agustus 2025</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Introduction */}
            <div>
              <p className="text-gray-700 leading-relaxed">
                Terima kasih telah berpartisipasi dalam penelitian kami. Kebijakan Privasi ini menjelaskan bagaimana
                informasi Anda dikumpulkan, digunakan, dan dilindungi.
              </p>
            </div>

            {/* Researcher Information */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Users className="w-6 h-6 mr-2 text-yellow-600" />
                  Pembuat Program & Peneliti Utama
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <strong>Nama:</strong> Eka Putri Yulianti
                </p>
                <p>
                  <strong>Afiliasi:</strong> Program Studi Magister Ilmu Keperawatan, Fakultas Ilmu Keperawatan,
                  Universitas Indonesia
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-yellow-600" />
                    <span className="text-sm">eka.putri31@office.ui.ac.id</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-1 text-yellow-600" />
                    <span className="text-sm">ekaputri.rubedo@gmail.com</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-sky-600" />
                1. Informasi yang Kami Kumpulkan
              </h2>
              <p className="text-gray-700 mb-4">Kami mengumpulkan beberapa jenis informasi untuk tujuan penelitian:</p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Demografi:</h3>
                  <p className="text-gray-700">
                    Seperti nama inisial/panggilan, usia, jenis kelamin, pendidikan, dan pekerjaan yang Anda berikan di
                    awal sesi.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Kesehatan dan Psikologis:</h3>
                  <p className="text-gray-700">
                    Jawaban Anda terhadap pertanyaan-pertanyaan selama sesi chatbot, yang mencakup keluhan utama,
                    riwayat kesehatan, kondisi psikologis, dan respons terhadap kuesioner seperti SRQ-20.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Interaksi:</h3>
                  <p className="text-gray-700">
                    Transkrip percakapan Anda dengan chatbot. Data ini akan dianonimkan untuk analisis.
                  </p>
                </div>
              </div>
            </div>

            {/* Purpose of Information Use */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-sky-600" />
                2. Tujuan Penggunaan Informasi
              </h2>
              <p className="text-gray-700 mb-4">Informasi yang Anda berikan akan digunakan untuk tujuan berikut:</p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Tujuan Penelitian Utama:</h3>
                  <p className="text-gray-700">
                    Data akan dianalisis secara agregat sebagai bagian dari penelitian tesis untuk mengevaluasi
                    efektivitas asesmen kesehatan jiwa berbasis AI. Semua data yang dipublikasikan akan bersifat anonim
                    dan tidak dapat diidentifikasi secara perorangan.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Fungsi Aplikasi:</h3>
                  <p className="text-gray-700">
                    Untuk memungkinkan chatbot memberikan respons yang relevan selama sesi asesmen.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Keamanan Peserta:</h3>
                  <p className="text-gray-700">
                    Untuk mengidentifikasi adanya risiko (seperti risiko bunuh diri) dan memberikan informasi kontak
                    darurat jika diperlukan.
                  </p>
                </div>
              </div>
            </div>

            {/* Information Sharing */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-sky-600" />
                3. Pembagian dan Pengungkapan Informasi
              </h2>
              <p className="text-gray-700 mb-4">
                Kami sangat menjaga privasi Anda. Informasi Anda hanya akan dibagikan dalam kondisi berikut:
              </p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Tim Peneliti & Komite Etik:</h3>
                  <p className="text-gray-700">
                    Data anonim dapat ditinjau oleh tim peneliti dan Komite Etik Penelitian Kesehatan Universitas
                    Indonesia untuk tujuan supervisi dan validasi.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Penyedia Layanan Pihak Ketiga:</h3>
                  <p className="text-gray-700">
                    Aplikasi ini menggunakan layanan dari Dify.ai untuk memfasilitasi fungsi chatbot. Dify.ai memiliki
                    kebijakan privasinya sendiri dan kami memilih layanan yang memiliki standar keamanan yang baik.
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Kewajiban Hukum:</h3>
                  <p className="text-gray-700">
                    Jika diwajibkan oleh hukum, kami mungkin perlu mengungkapkan informasi Anda.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                <p className="text-red-800 font-medium">
                  Kami tidak akan pernah menjual atau menyewakan data pribadi Anda kepada pihak ketiga mana pun.
                </p>
              </div>
            </div>

            {/* Data Security */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-sky-600" />
                4. Keamanan Data
              </h2>
              <p className="text-gray-700">
                Kami menerapkan langkah-langkah teknis dan administratif untuk melindungi informasi Anda. Ini termasuk
                anonimisasi data dimana nama atau identitas pribadi lainnya dihilangkan dari kumpulan data analisis, dan
                penyimpanan data di lingkungan yang aman.
              </p>
            </div>

            {/* Participant Rights */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-sky-600" />
                5. Hak Anda sebagai Peserta Riset
              </h2>
              <p className="text-gray-700 mb-4">
                Sesuai dengan prinsip etika penelitian, Anda memiliki hak-hak berikut:
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hak untuk Diberi Informasi:</h3>
                    <p className="text-gray-700">
                      Anda berhak mendapatkan penjelasan yang jelas mengenai penelitian ini.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hak untuk Berpartisipasi Secara Sukarela:</h3>
                    <p className="text-gray-700">Keikutsertaan Anda bersifat sukarela.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hak untuk Mengundurkan Diri:</h3>
                    <p className="text-gray-700">
                      Anda berhak untuk mengundurkan diri dari penelitian ini kapan saja, tanpa memberikan alasan, dan
                      tanpa adanya sanksi atau konsekuensi negatif.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-sky-600 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Hak atas Kerahasiaan:</h3>
                    <p className="text-gray-700">
                      Identitas pribadi Anda akan dijaga kerahasiaannya dalam setiap laporan atau publikasi hasil
                      penelitian.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Changes */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Perubahan pada Kebijakan Privasi Ini</h2>
              <p className="text-gray-700">
                Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Versi terbaru akan selalu tersedia
                melalui aplikasi.
              </p>
            </div>

            {/* Contact Information */}
            <Card className="bg-sky-50 border-sky-200">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Phone className="w-6 h-6 mr-2 text-sky-600" />
                  7. Hubungi Kami
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini atau tentang penelitian secara umum,
                  silakan hubungi Peneliti Utama,
                </p>
                <div className="bg-white p-4 rounded-lg border border-sky-200">
                  <p className="font-semibold text-sky-900">Eka Putri Yulianti</p>
                  <div className="flex items-center mt-2">
                    <Mail className="w-4 h-4 mr-2 text-sky-600" />
                    <a href="mailto:eka.putri31@office.ui.ac.id" className="text-sky-600 hover:text-sky-800 underline">
                      eka.putri31@office.ui.ac.id
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Footer note */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Dokumen ini merupakan bagian dari penelitian yang dilakukan di bawah supervisi Universitas Indonesia
                dengan standar etika penelitian yang ketat.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
