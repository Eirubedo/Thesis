"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Phone, MessageCircle, MapPin, ExternalLink, Loader2 } from "lucide-react"

interface HealthcareFacility {
  id: string
  name: string
  address: string
  phone?: string
  distance: number
  type: string
  priority: number
}

export function EmergencySupport() {
  const { t } = useLanguage()
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getPriorityScore = (name: string, tags: any): number => {
    const lowerName = name.toLowerCase()

    // Priority 1: Clinics (highest priority)
    if (lowerName.includes("klinik") || lowerName.includes("clinic")) {
      return 1
    }

    // Priority 2: Hospitals
    if (lowerName.includes("hospital") || lowerName.includes("rumah sakit") || lowerName.includes("rs ")) {
      return 2
    }

    // Priority 3: Emergency facilities
    if (lowerName.includes("emergency") || lowerName.includes("darurat") || lowerName.includes("ugd")) {
      return 3
    }

    // Priority 4: Other clinics based on tags
    if (tags?.amenity === "clinic" || tags?.healthcare === "clinic") {
      return 4
    }

    // Priority 5: Everything else
    return 5
  }

  const getFacilityTypeLabel = (name: string, tags: any): string => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("klinik") || lowerName.includes("clinic")) {
      return t("emergency.clinic")
    }
    if (lowerName.includes("hospital") || lowerName.includes("rumah sakit")) {
      return t("emergency.hospital")
    }
    if (lowerName.includes("emergency") || lowerName.includes("darurat")) {
      return t("emergency.emergency")
    }

    return t("emergency.clinic")
  }

  const getFacilityTypeColor = (name: string): string => {
    const lowerName = name.toLowerCase()

    if (lowerName.includes("klinik") || lowerName.includes("clinic")) {
      return "bg-green-100 text-green-800"
    }
    if (lowerName.includes("hospital") || lowerName.includes("rumah sakit")) {
      return "bg-blue-100 text-blue-800"
    }
    if (lowerName.includes("emergency") || lowerName.includes("darurat")) {
      return "bg-red-100 text-red-800"
    }

    return "bg-gray-100 text-gray-800"
  }

  const findNearbyFacilities = async () => {
    setIsLoading(true)

    try {
      if (!navigator.geolocation) {
        throw new Error(t("emergency.locationNotSupported"))
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      const { latitude, longitude } = position.coords

      // Enhanced Overpass API query for healthcare facilities
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"~"^(hospital|clinic)$"](around:10000,${latitude},${longitude});
          node["healthcare"~"^(hospital|clinic|centre)$"](around:10000,${latitude},${longitude});
          node["emergency"="yes"](around:10000,${latitude},${longitude});
          way["amenity"~"^(hospital|clinic)$"](around:10000,${latitude},${longitude});
          way["healthcare"~"^(hospital|clinic|centre)$"](around:10000,${latitude},${longitude});
          way["emergency"="yes"](around:10000,${latitude},${longitude});
        );
        out center meta;
      `

      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: overpassQuery,
        headers: {
          "Content-Type": "text/plain",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch facilities")
      }

      const data = await response.json()

      const facilitiesData: HealthcareFacility[] = data.elements
        .filter((element: any) => element.tags?.name)
        .map((element: any) => {
          const lat = element.lat || element.center?.lat
          const lon = element.lon || element.center?.lon

          if (!lat || !lon) return null

          const distance = Math.sqrt(Math.pow(lat - latitude, 2) + Math.pow(lon - longitude, 2)) * 111000 // Rough conversion to meters

          const priority = getPriorityScore(element.tags.name, element.tags)

          return {
            id: element.id.toString(),
            name: element.tags.name,
            address: element.tags["addr:full"] || element.tags["addr:street"] || "Address not available",
            phone: element.tags.phone,
            distance: Math.round(distance),
            type: getFacilityTypeLabel(element.tags.name, element.tags),
            priority,
          }
        })
        .filter(Boolean)
        .sort((a, b) => {
          // First sort by priority (lower number = higher priority)
          if (a.priority !== b.priority) {
            return a.priority - b.priority
          }
          // Then sort by distance within same priority
          return a.distance - b.distance
        })
        .slice(0, 8) // Show top 8 facilities

      if (facilitiesData.length === 0) {
        // Fallback facilities with proper priority ordering
        const fallbackFacilities: HealthcareFacility[] = [
          {
            id: "fallback-1",
            name: "Klinik Pratama Terdekat",
            address: t("emergency.generalClinicAddress"),
            distance: 1000,
            type: t("emergency.clinic"),
            priority: 1,
          },
          {
            id: "fallback-2",
            name: t("emergency.generalHospital"),
            address: t("emergency.generalHospitalAddress"),
            distance: 2000,
            type: t("emergency.hospital"),
            priority: 2,
          },
          {
            id: "fallback-3",
            name: t("emergency.emergencyCenter"),
            address: t("emergency.emergencyCenterAddress"),
            distance: 1500,
            type: t("emergency.emergency"),
            priority: 3,
          },
        ]
        setFacilities(fallbackFacilities)
      } else {
        setFacilities(facilitiesData)
      }
    } catch (error) {
      console.error("Error finding facilities:", error)
      // Show fallback facilities on error
      const fallbackFacilities: HealthcareFacility[] = [
        {
          id: "fallback-1",
          name: "Klinik Pratama Terdekat",
          address: t("emergency.generalClinicAddress"),
          distance: 1000,
          type: t("emergency.clinic"),
          priority: 1,
        },
        {
          id: "fallback-2",
          name: t("emergency.generalHospital"),
          address: t("emergency.generalHospitalAddress"),
          distance: 2000,
          type: t("emergency.hospital"),
          priority: 2,
        },
      ]
      setFacilities(fallbackFacilities)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-red-500 hover:bg-red-600 text-white border-0 z-50"
        >
          <AlertTriangle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 max-w-full overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="text-xl font-bold text-red-600">{t("emergency.title")}</SheetTitle>
          <SheetDescription className="text-sm text-gray-600">{t("emergency.reminder")}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Crisis Support */}
          <Card className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t("emergency.crisisSupport")}
              </CardTitle>
              <CardDescription className="text-sm">{t("emergency.crisisDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                {t("emergency.callCrisisHotline")}
              </Button>
            </CardContent>
          </Card>

          {/* Mental Health Support */}
          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {t("emergency.mentalHealthSupport")}
              </CardTitle>
              <CardDescription className="text-sm">{t("emergency.mentalHealthDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                size="sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {t("emergency.whatsappMentalHealth")}
              </Button>
            </CardContent>
          </Card>

          {/* Nearby Healthcare Facilities */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-green-700 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {t("emergency.nearbyFacilities")}
              </CardTitle>
              <CardDescription className="text-sm">{t("emergency.facilitiesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={findNearbyFacilities}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("emergency.findingFacilities")}
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    {t("emergency.findNearby")}
                  </>
                )}
              </Button>

              {facilities.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {facilities.map((facility) => (
                    <div key={facility.id} className="p-3 border rounded-lg bg-gray-50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{facility.name}</h4>
                          <p className="text-xs text-gray-600 mt-1">{facility.address}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={`text-xs px-2 py-1 ${getFacilityTypeColor(facility.name)}`}>
                            {facility.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{facility.distance}m</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {facility.phone && (
                          <Button size="sm" variant="outline" className="flex-1 text-xs h-8 bg-transparent">
                            <Phone className="w-3 h-3 mr-1" />
                            {t("emergency.call")}
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8 bg-transparent">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {t("emergency.directions")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {facilities.length === 0 && !isLoading && (
                <p className="text-sm text-gray-500 text-center py-4">{t("emergency.noFacilitiesFound")}</p>
              )}
            </CardContent>
          </Card>

          {/* Resources */}
          <Card className="border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-purple-700">{t("emergency.resources")}</CardTitle>
              <CardDescription className="text-sm">{t("emergency.resourcesDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm space-y-2">
                <p className="font-medium">{t("emergency.nationalSuicidePrevention")}</p>
                <p>{t("emergency.crisisTextLine")}</p>
                <p>{t("emergency.emergencyServices")}</p>
                <p>{t("emergency.mentalHealthHotline")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
