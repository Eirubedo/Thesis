"use client"

import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Phone, MessageSquare, Mail, Clock, AlertTriangle, Heart, Users, ExternalLink } from "lucide-react"

const emergencyContacts = [
  {
    name: "Emergency Services",
    number: "119",
    description: "For immediate life-threatening emergencies",
    available: "24/7",
    type: "emergency",
  },
  {
    name: "Mental Health Crisis Line",
    number: "1-800-CRISIS",
    description: "24/7 crisis intervention and suicide prevention",
    available: "24/7",
    type: "crisis",
  },
  {
    name: "Mental Health Facility",
    contact: "WhatsApp: +1234567890",
    description: "Direct line to our partner mental health facility",
    available: "Mon-Fri 9AM-6PM",
    type: "facility",
  },
]

const supportResources = [
  {
    title: "Online Therapy Platforms",
    description: "Professional therapy sessions from licensed therapists",
    links: [
      { name: "BetterHelp", url: "https://betterhelp.com" },
      { name: "Talkspace", url: "https://talkspace.com" },
      { name: "MDLIVE", url: "https://mdlive.com" },
    ],
  },
  {
    title: "Support Groups",
    description: "Connect with others who understand your experiences",
    links: [
      { name: "NAMI Support Groups", url: "https://nami.org" },
      { name: "Mental Health America", url: "https://mhanational.org" },
      { name: "Depression and Bipolar Support Alliance", url: "https://dbsalliance.org" },
    ],
  },
  {
    title: "Educational Resources",
    description: "Learn more about mental health conditions and treatments",
    links: [
      { name: "National Institute of Mental Health", url: "https://nimh.nih.gov" },
      { name: "Mayo Clinic Mental Health", url: "https://mayoclinic.org" },
      { name: "Psychology Today", url: "https://psychologytoday.com" },
    ],
  },
]

export default function SupportPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!user) {
    router.push("/login")
    return null
  }

  const handleEmergencyCall = () => {
    window.open("tel:119", "_self")
  }

  const handleWhatsApp = () => {
    window.open("https://wa.me/1234567890", "_blank")
  }

  const handleCrisisCall = () => {
    window.open("tel:1-800-273-8255", "_self")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-6xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support & Resources</h1>
          <p className="text-gray-600">
            Get immediate help, find professional support, and access mental health resources
          </p>
        </div>

        {/* Emergency Alert */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  If you're in crisis or having thoughts of self-harm
                </h3>
                <p className="text-red-800 mb-4">
                  Please reach out for immediate help. You are not alone, and support is available 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleEmergencyCall} className="bg-red-600 hover:bg-red-700">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Emergency 119
                  </Button>
                  <Button
                    onClick={handleCrisisCall}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Crisis Hotline
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Contacts</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <Card
                key={index}
                className={`${
                  contact.type === "emergency"
                    ? "border-red-200 bg-red-50"
                    : contact.type === "crisis"
                      ? "border-orange-200 bg-orange-50"
                      : "border-blue-200 bg-blue-50"
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    {contact.type === "emergency" ? (
                      <Phone className="w-5 h-5 mr-2 text-red-600" />
                    ) : contact.type === "crisis" ? (
                      <Heart className="w-5 h-5 mr-2 text-orange-600" />
                    ) : (
                      <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    )}
                    {contact.name}
                  </CardTitle>
                  <CardDescription>{contact.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="font-mono text-lg font-semibold">{contact.number || contact.contact}</div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {contact.available}
                    </div>
                    <Button
                      onClick={
                        contact.type === "emergency"
                          ? handleEmergencyCall
                          : contact.type === "crisis"
                            ? handleCrisisCall
                            : handleWhatsApp
                      }
                      className="w-full"
                      variant={contact.type === "emergency" ? "destructive" : "default"}
                    >
                      {contact.type === "facility" ? (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open WhatsApp
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4 mr-2" />
                          Call Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Professional Support */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Support</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Find a Therapist
                </CardTitle>
                <CardDescription>Connect with licensed mental health professionals in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => window.open("https://psychologytoday.com", "_blank")}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Psychology Today Directory
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push("/chat")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with AI Assistant
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-green-600" />
                  Contact Our Team
                </CardTitle>
                <CardDescription>Get in touch with our support team for technical help or questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <p>
                      <strong>Email:</strong> support@mindcare.com
                    </p>
                    <p>
                      <strong>Hours:</strong> Monday-Friday, 9AM-6PM
                    </p>
                    <p>
                      <strong>Response Time:</strong> Within 24 hours
                    </p>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Resources */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {supportResources.map((resource, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {resource.links.map((link, linkIndex) => (
                      <Button
                        key={linkIndex}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto"
                        onClick={() => window.open(link.url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {link.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <Card className="mt-8 bg-gray-100">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">
              <strong>Disclaimer:</strong> ANSWA is designed to provide support and resources for mental health
              wellness. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the
              advice of qualified health providers with any questions you may have regarding a medical condition. If you
              are experiencing a mental health emergency, please contact emergency services immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
