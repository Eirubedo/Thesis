"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AlertTriangle, Phone, MessageSquare } from "lucide-react"

export function EmergencySupport() {
  const [isOpen, setIsOpen] = useState(false)

  const openWhatsApp = () => {
    window.open("https://wa.me/1234567890", "_blank")
  }

  const callCrisisHotline = () => {
    window.open("tel:119", "_self")
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <AlertTriangle className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Emergency Support</h2>
            </div>

            <div className="space-y-4 flex-1">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Crisis Support
                  </CardTitle>
                  <CardDescription className="text-red-700">
                    If you're in immediate danger or having thoughts of self-harm, please reach out for help
                    immediately.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={callCrisisHotline} className="w-full bg-red-600 hover:bg-red-700 text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Crisis Hotline (119)
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-sky-200 bg-sky-50">
                <CardHeader>
                  <CardTitle className="text-sky-800">Mental Health Support</CardTitle>
                  <CardDescription className="text-sky-700">
                    Connect with mental health professionals and support services.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={openWhatsApp}
                    variant="outline"
                    className="w-full border-green-500 text-green-600 hover:bg-green-50 bg-transparent"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp Mental Health Facility
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Resources</CardTitle>
                  <CardDescription className="text-yellow-700">
                    Additional mental health resources and information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-yellow-800">• National Suicide Prevention Lifeline</p>
                  <p className="text-sm text-yellow-800">• Crisis Text Line: Text HOME to 741741</p>
                  <p className="text-sm text-yellow-800">• Emergency Services: 911</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 pt-4 border-t">
              <p className="text-xs text-gray-500 text-center">Remember: You are not alone. Help is available 24/7.</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
