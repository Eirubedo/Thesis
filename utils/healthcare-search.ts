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

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: {
    name?: string
    amenity?: string
    healthcare?: string
    emergency?: string
    "addr:full"?: string
    "addr:street"?: string
    "addr:housenumber"?: string
    "addr:city"?: string
    phone?: string
    "contact:phone"?: string
    opening_hours?: string
  }
}

export function getPriorityScore(name: string, amenity?: string, healthcare?: string, emergency?: string): number {
  const lowerName = name.toLowerCase()

  // Priority 1: Klinik (highest priority)
  if (lowerName.includes("klinik")) {
    return 1
  }

  // Priority 2: Hospitals and Rumah Sakit
  if (
    lowerName.includes("hospital") ||
    lowerName.includes("rumah sakit") ||
    lowerName.includes("rs ") ||
    lowerName.startsWith("rs") ||
    amenity === "hospital"
  ) {
    return 2
  }

  // Priority 3: Emergency facilities
  if (emergency === "yes" || lowerName.includes("emergency") || lowerName.includes("gawat darurat")) {
    return 3
  }

  // Priority 4: Other clinics
  if (
    amenity === "clinic" ||
    healthcare === "clinic" ||
    lowerName.includes("puskesmas") ||
    lowerName.includes("posyandu")
  ) {
    return 4
  }

  // Priority 5: Everything else
  return 5
}

export function getFacilityTypeLabel(name: string, amenity?: string, healthcare?: string): string {
  const lowerName = name.toLowerCase()

  if (lowerName.includes("klinik")) {
    return "Klinik"
  }

  if (
    lowerName.includes("hospital") ||
    lowerName.includes("rumah sakit") ||
    lowerName.includes("rs ") ||
    lowerName.startsWith("rs") ||
    amenity === "hospital"
  ) {
    return "Hospital"
  }

  if (lowerName.includes("puskesmas")) {
    return "Puskesmas"
  }

  if (amenity === "clinic" || healthcare === "clinic") {
    return "Clinic"
  }

  return "Healthcare"
}

export function getFacilityTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case "klinik":
      return "bg-green-100 text-green-800 border-green-200"
    case "hospital":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "puskesmas":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "emergency":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export async function searchOverpassAPI(location: { lat: number; lng: number }): Promise<HealthcareFacility[]> {
  const overpassQuery = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:5000,${location.lat},${location.lng});
      node["amenity"="clinic"](around:5000,${location.lat},${location.lng});
    );
    out body;
  `

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `data=${encodeURIComponent(overpassQuery)}`,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    const facilities = data.elements
      .map((element: OverpassElement, index: number) => {
        const lat = element.lat || element.center?.lat || 0
        const lng = element.lon || element.center?.lon || 0
        const distance = calculateDistance(location.lat, location.lng, lat, lng)

        const name = element.tags?.name || `Healthcare Facility ${index + 1}`
        const priority = getPriorityScore(
          name,
          element.tags?.amenity,
          element.tags?.healthcare,
          element.tags?.emergency,
        )

        // Build address from available components
        let address = "Address not available"
        if (element.tags) {
          const addressParts = []
          if (element.tags["addr:housenumber"]) addressParts.push(element.tags["addr:housenumber"])
          if (element.tags["addr:street"]) addressParts.push(element.tags["addr:street"])
          if (element.tags["addr:city"]) addressParts.push(element.tags["addr:city"])
          if (addressParts.length > 0) {
            address = addressParts.join(", ")
          } else if (element.tags["addr:full"]) {
            address = element.tags["addr:full"]
          }
        }

        // Get phone number
        const phone = element.tags?.phone || element.tags?.["contact:phone"]

        // Determine if open (basic check)
        let isOpen: boolean | undefined
        if (element.tags?.opening_hours) {
          const openingHours = element.tags.opening_hours.toLowerCase()
          isOpen = openingHours.includes("24/7") || (!openingHours.includes("closed") && !openingHours.includes("off"))
        }

        return {
          id: element.id?.toString() || `facility-${index}`,
          name,
          type: getFacilityTypeLabel(name, element.tags?.amenity, element.tags?.healthcare),
          address,
          distance,
          lat,
          lng,
          priority,
          phone,
          isOpen,
        }
      })
      .filter((facility: HealthcareFacility) => facility.lat !== 0 && facility.lng !== 0 && facility.distance <= 10)
      .sort((a: HealthcareFacility, b: HealthcareFacility) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority
        }
        return a.distance - b.distance
      })
      .slice(0, 8)

    return facilities
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Overpass API timeout, using fallback facilities")
      return generateFallbackFacilities(location)
    }
    console.error("Error fetching from Overpass API:", error)
    return generateFallbackFacilities(location)
  }
}

export function generateFallbackFacilities(location: { lat: number; lng: number }): HealthcareFacility[] {
  return [
    {
      id: "fallback-klinik-1",
      name: "Klinik Pratama Sehat",
      type: "Klinik",
      address: "Jl. Kesehatan No. 123",
      distance: 1.2,
      lat: location.lat + 0.008,
      lng: location.lng + 0.006,
      priority: 1,
      isOpen: true,
      phone: "+62-21-1234567",
    },
    {
      id: "fallback-klinik-2",
      name: "Klinik Medika Prima",
      type: "Klinik",
      address: "Jl. Dokter Sutomo No. 456",
      distance: 2.1,
      lat: location.lat - 0.012,
      lng: location.lng + 0.009,
      priority: 1,
      isOpen: true,
      phone: "+62-21-2345678",
    },
    {
      id: "fallback-hospital-1",
      name: "RS Umum Daerah",
      type: "Hospital",
      address: "Jl. Medika Raya No. 789",
      distance: 3.5,
      lat: location.lat + 0.02,
      lng: location.lng - 0.015,
      priority: 2,
      isOpen: true,
      phone: "+62-21-3456789",
    },
    {
      id: "fallback-hospital-2",
      name: "Rumah Sakit Pusat",
      type: "Hospital",
      address: "Jl. Kesehatan Utama No. 321",
      distance: 4.8,
      lat: location.lat - 0.025,
      lng: location.lng - 0.018,
      priority: 2,
      isOpen: true,
    },
    {
      id: "fallback-puskesmas-1",
      name: "Puskesmas Kecamatan",
      type: "Puskesmas",
      address: "Jl. Pelayanan Masyarakat No. 654",
      distance: 2.8,
      lat: location.lat + 0.015,
      lng: location.lng - 0.012,
      priority: 4,
      isOpen: true,
      phone: "+62-21-4567890",
    },
  ]
}
