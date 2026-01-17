"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Phone, MessageSquare, MapPin, Navigation, Star, Loader2, RefreshCw } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { searchOverpassAPI, generateFallbackFacilities, getFacilityTypeColor } from "@/utils/healthcare-search"

interface HealthcareFacility {
  id: string
  name: string
  type: string
  address: string
  distance: number
  rating?: number
  isOpen?: boolean
  phone?: string
  lat: number
  lng: number
  priority: number
}

export function EmergencySupport() {
  const [isOpen, setIsOpen] = useState(false)
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([])
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const { t } = useLanguage()

  const openWhatsApp = () => {
    window.open("https://wa.me/1234567890", "_blank")
  }

  const callCrisisHotline = () => {
    window.open("tel:119", "_self")
  }

  const getDirections = (facility: HealthcareFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`
    window.open(url, "_blank")
  }

  const callFacility = (phone: string) => {
    window.open(`tel:${phone}`, "_self")
  }

  const getCurrentLocation = () => {
    setIsLoadingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError(t("emergency.locationError"))
      setIsLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(location)
        searchNearbyFacilities(location)
      },
      (error) => {
        setLocationError(t("emergency.locationError"))
        setIsLoadingLocation(false)
        console.error("Geolocation error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    )
  }

  const searchNearbyFacilities = async (location: { lat: number; lng: number }) => {
    try {
      const results = await searchOverpassAPI(location)
      setFacilities(results)
    } catch (error) {
      console.error("Error searching facilities:", error)
      // Fallback to mock data if API fails
      const fallbackFacilities = generateFallbackFacilities(location)
      setFacilities(fallbackFacilities)
    } finally {
      setIsLoadingLocation(false)
    }
  }

  useEffect(() => {
    if (isOpen && !userLocation && !isLoadingLocation) {
      getCurrentLocation()
    }
  }, [isOpen])

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            data-tutorial="emergency-btn"
            className="rounded-full w-12 h-12 sm:w-14 sm:h-14 bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative"
          >
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-96 md:w-[480px] p-0 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t("emergency.title")}</h2>
                </div>

                {/* Crisis Support */}
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-red-800 flex items-center text-sm sm:text-base">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {t("emergency.crisisSupport")}
                    </CardTitle>
                    <CardDescription className="text-red-700 text-xs sm:text-sm">
                      {t("emergency.crisisDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={callCrisisHotline}
                      className="w-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm h-8 sm:h-10"
                    >
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {t("emergency.callCrisisHotline")}
                    </Button>
                  </CardContent>
                </Card>

                {/* Mental Health Support */}
                <Card className="border-sky-200 bg-sky-50">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-sky-800 text-sm sm:text-base">
                      {t("emergency.mentalHealthSupport")}
                    </CardTitle>
                    <CardDescription className="text-sky-700 text-xs sm:text-sm">
                      {t("emergency.mentalHealthDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      onClick={openWhatsApp}
                      variant="outline"
                      className="w-full border-green-500 text-green-600 hover:bg-green-50 bg-transparent text-xs sm:text-sm h-8 sm:h-10"
                    >
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      {t("emergency.whatsappFacility")}
                    </Button>
                  </CardContent>
                </Card>

                {/* Nearby Healthcare Facilities */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-blue-800 flex items-center justify-between text-sm sm:text-base">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {t("emergency.nearbyFacilities")}
                      </div>
                      <Button
                        onClick={getCurrentLocation}
                        variant="ghost"
                        size="sm"
                        disabled={isLoadingLocation}
                        className="h-6 w-6 p-0 hover:bg-blue-100"
                      >
                        {isLoadingLocation ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoadingLocation ? (
                      <div className="flex items-center justify-center py-3 sm:py-4">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        <span className="text-xs sm:text-sm">{t("emergency.searchingFacilities")}</span>
                      </div>
                    ) : locationError ? (
                      <div className="text-center py-3 sm:py-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{locationError}</p>
                        <Button
                          onClick={getCurrentLocation}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm bg-transparent h-8"
                        >
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          {t("emergency.enableLocation")}
                        </Button>
                      </div>
                    ) : facilities.length === 0 ? (
                      <div className="text-center py-3 sm:py-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">{t("emergency.noFacilitiesFound")}</p>
                        <Button
                          onClick={getCurrentLocation}
                          variant="outline"
                          size="sm"
                          className="text-xs sm:text-sm bg-transparent h-8"
                        >
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          {t("emergency.tryAgain")}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-[40vh] overflow-y-auto">
                        {facilities.map((facility) => (
                          <div key={facility.id} className="border rounded-lg p-2 sm:p-3 bg-white">
                            <div className="flex items-start justify-between mb-1 sm:mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-xs sm:text-sm truncate">{facility.name}</h4>
                                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                                  <Badge className={`text-xs border ${getFacilityTypeColor(facility.type)}`}>
                                    {facility.type}
                                  </Badge>
                                  {facility.rating && (
                                    <div className="flex items-center">
                                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                      <span className="text-xs ml-1">{facility.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-2">
                                <div className="text-xs text-gray-600">
                                  {facility.distance} {t("emergency.distance")}
                                </div>
                                {facility.isOpen !== undefined && (
                                  <Badge variant={facility.isOpen ? "default" : "secondary"} className="text-xs mt-1">
                                    {facility.isOpen ? t("emergency.openNow") : t("emergency.closed")}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2">{facility.address}</p>
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                onClick={() => getDirections(facility)}
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs h-7 sm:h-8"
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                {t("emergency.getDirections")}
                              </Button>
                              {facility.phone && (
                                <Button
                                  onClick={() => callFacility(facility.phone!)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs h-7 sm:h-8"
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  {t("emergency.callFacility")}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resources */}
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-yellow-800 text-sm sm:text-base">{t("emergency.resources")}</CardTitle>
                    <CardDescription className="text-yellow-700 text-xs sm:text-sm">
                      {t("emergency.resourcesDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm text-yellow-800">{t("emergency.nationalSuicide")}</p>
                      <p className="text-xs sm:text-sm text-yellow-800">{t("emergency.crisisText")}</p>
                      <p className="text-xs sm:text-sm text-yellow-800">{t("emergency.emergencyServices")}</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 text-center">{t("emergency.notAlone")}</p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
