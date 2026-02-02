"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { User, Calendar, Settings, Shield, Bell, MapPin, Loader2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.profile_picture || null)
  const [uploadingPicture, setUploadingPicture] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    gender: user?.gender || "",
    birth_date: user?.birth_date || "",
    address: user?.address || "",
    postal_code: user?.postal_code || "",
    bio: "",
    notifications: true,
    dataSharing: false,
  })

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || "",
        gender: user.gender || "",
        birth_date: user.birth_date || "",
        address: user.address || "",
        postal_code: user.postal_code || "",
      }))
    }
  }, [user])

  if (!user) {
    router.push("/login")
    return null
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: t("profile.invalidFile"),
        description: t("profile.invalidFileDesc"),
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("profile.fileTooLarge"),
        description: t("profile.fileTooLargeDesc"),
        variant: "destructive",
      })
      return
    }

    setUploadingPicture(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        // Save to database
        const response = await fetch("/api/profile-picture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            profile_picture: base64String,
          }),
        })

        if (response.ok) {
          setProfilePicture(base64String)
          toast({
            title: t("profile.uploadSuccess"),
            description: t("profile.uploadSuccessDesc"),
          })
        } else {
          toast({
            title: t("profile.uploadFailed"),
            description: t("profile.uploadFailedDesc"),
            variant: "destructive",
          })
        }
        setUploadingPicture(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: t("profile.uploadError"),
        description: t("profile.uploadErrorDesc"),
        variant: "destructive",
      })
      setUploadingPicture(false)
    }
  }

  const handleSave = async () => {
    try {
      const profileData = {
        full_name: formData.full_name,
        gender: formData.gender as "male" | "female" | "other",
        birth_date: formData.birth_date,
        address: formData.address,
        postal_code: formData.postal_code,
      }

      const result = await updateProfile(profileData)

      if (result.success) {
        setIsEditing(false)
        toast({
          title: t("profile.updateSuccess"),
          description: t("profile.updateSuccessDesc"),
        })
      } else {
        toast({
          title: t("profile.updateFailed"),
          description: result.error || t("profile.updateFailedDesc"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("profile.updateError"),
        description: t("profile.updateErrorDesc"),
        variant: "destructive",
      })
    }
  }

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Try multiple geocoding services for better coverage

      // First try: Nominatim (OpenStreetMap) - Free and reliable
      try {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=id,en`,
          {
            headers: {
              "User-Agent": "HyperCare-App/1.0",
            },
          },
        )

        if (nominatimResponse.ok) {
          const data = await nominatimResponse.json()
          if (data && data.display_name) {
            const address = data.display_name
            const postalCode = data.address?.postcode || ""

            return {
              address,
              postalCode,
              source: "Nominatim",
            }
          }
        }
      } catch (error) {
        console.log("Nominatim failed, trying next service")
      }

      // Second try: BigDataCloud - Free reverse geocoding
      try {
        const bigDataResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`,
        )

        if (bigDataResponse.ok) {
          const data = await bigDataResponse.json()
          if (data && data.locality) {
            const addressParts = [data.locality, data.principalSubdivision, data.countryName].filter(Boolean)

            const address = addressParts.join(", ")
            const postalCode = data.postcode || ""

            return {
              address,
              postalCode,
              source: "BigDataCloud",
            }
          }
        }
      } catch (error) {
        console.log("BigDataCloud failed, trying next service")
      }

      // Third try: LocationIQ (requires API key but has free tier)
      try {
        const locationIQResponse = await fetch(
          `https://us1.locationiq.com/v1/reverse.php?key=pk.0123456789abcdef&lat=${latitude}&lon=${longitude}&format=json&accept-language=id`,
        )

        if (locationIQResponse.ok) {
          const data = await locationIQResponse.json()
          if (data && data.display_name) {
            const address = data.display_name
            const postalCode = data.address?.postcode || ""

            return {
              address,
              postalCode,
              source: "LocationIQ",
            }
          }
        }
      } catch (error) {
        console.log("LocationIQ failed")
      }

      // Fallback: Create a readable address from coordinates
      return {
        address: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        postalCode: "",
        source: "Coordinates",
      }
    } catch (error) {
      console.error("All geocoding services failed:", error)
      return {
        address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
        postalCode: "",
        source: "Fallback",
      }
    }
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t("profile.locationNotSupported"),
        description: t("profile.locationNotSupportedDesc"),
        variant: "destructive",
      })
      return
    }

    setIsLoadingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          toast({
            title: t("profile.gettingLocation"),
            description: t("profile.gettingLocationDesc"),
          })

          const geocodeResult = await reverseGeocode(latitude, longitude)

          setFormData((prev) => ({
            ...prev,
            address: geocodeResult.address,
            postal_code: geocodeResult.postalCode,
          }))

          toast({
            title: t("profile.locationRetrieved"),
            description: t("profile.locationRetrievedDesc").replace("{source}", geocodeResult.source),
          })
        } catch (error) {
          console.error("Error getting address:", error)

          // Fallback: just show coordinates
          const { latitude, longitude } = position.coords
          setFormData((prev) => ({
            ...prev,
            address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }))

          toast({
            title: t("profile.locationRetrieved"),
            description: t("profile.locationFallback"),
          })
        } finally {
          setIsLoadingLocation(false)
        }
      },
      (error) => {
        setIsLoadingLocation(false)
        let errorMessage = t("profile.locationDenied")

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t("profile.locationDenied")
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = t("profile.locationUnavailable")
            break
          case error.TIMEOUT:
            errorMessage = t("profile.locationTimeout")
            break
        }

        toast({
          title: t("profile.locationError"),
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 60000,
      },
    )
  }

  const handleDeleteAccount = () => {
    if (confirm(t("profile.deleteConfirm"))) {
      logout()
      router.push("/")
      toast({
        title: t("profile.accountDeleted"),
        description: t("profile.accountDeletedDesc"),
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-16 max-w-4xl mx-auto p-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("profile.title")}</h1>
          <p className="text-gray-600">{t("profile.subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  {t("profile.personalInfo")}
                </CardTitle>
                <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center gap-4 pb-4 border-b">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {profilePicture ? (
                        <img src={profilePicture || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    {uploadingPicture && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="profile_picture" className="cursor-pointer">
                      <div className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors">
                        {profilePicture ? t("profile.changePicture") : t("profile.uploadPicture")}
                      </div>
                    </Label>
                    <Input
                      id="profile_picture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500">{t("profile.maxFileSize")}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{t("profile.fullName")}</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder={t("profile.fullName")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t("profile.gender")}</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("profile.selectGender")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t("profile.male")}</SelectItem>
                        <SelectItem value="female">{t("profile.female")}</SelectItem>
                        <SelectItem value="other">{t("profile.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">{t("profile.birthDate")}</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t("profile.address")}</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="address"
                      placeholder={t("profile.addressPlaceholder")}
                      value={formData.address}
                      onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                      disabled={!isEditing}
                      rows={3}
                      className="flex-1"
                    />
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetLocation}
                        disabled={isLoadingLocation}
                        className="shrink-0 bg-transparent"
                      >
                        {isLoadingLocation ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        GPS
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("profile.gpsHint")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">{t("profile.postalCode")}</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
                    disabled={!isEditing}
                    placeholder={t("profile.postalCodePlaceholder")}
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">{t("profile.bio")}</Label>
                  <Textarea
                    id="bio"
                    placeholder={t("profile.bioPlaceholder")}
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        {t("profile.cancel")}
                      </Button>
                      <Button onClick={handleSave}>{t("profile.saveChanges")}</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      {t("profile.editProfile")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  {t("profile.privacySecurity")}
                </CardTitle>
                <CardDescription>{t("profile.privacyDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t("profile.emailNotifications")}</h4>
                    <p className="text-sm text-gray-600">{t("profile.emailNotificationsDesc")}</p>
                  </div>
                  <Button
                    variant={formData.notifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, notifications: !prev.notifications }))}
                  >
                    {formData.notifications ? t("profile.enabled") : t("profile.disabled")}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{t("profile.dataSharing")}</h4>
                    <p className="text-sm text-gray-600">{t("profile.dataSharingDesc")}</p>
                  </div>
                  <Button
                    variant={formData.dataSharing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, dataSharing: !prev.dataSharing }))}
                  >
                    {formData.dataSharing ? t("profile.enabled") : t("profile.disabled")}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Shield className="w-4 h-4 mr-2" />
                    {t("profile.changePassword")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">{t("profile.dangerZone")}</CardTitle>
                <CardDescription>{t("profile.dangerZoneDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                  {t("profile.deleteAccount")}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {t("profile.deleteWarning")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("profile.accountSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t("profile.phoneNumber")}</p>
                    <p className="text-xs text-gray-600">{user.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t("profile.birthDate")}</p>
                    <p className="text-xs text-gray-600">{user.birth_date ? formatDate(user.birth_date) : t("profile.notSet")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t("profile.postalCode")}</p>
                    <p className="text-xs text-gray-600">{user.postal_code || t("profile.notSet")}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">{t("profile.emailNotifications")}</p>
                    <p className="text-xs text-gray-600">{formData.notifications ? t("profile.enabled") : t("profile.disabled")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("profile.quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/assessment")}
                >
                  {t("profile.takeAssessment")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reports")}
                >
                  {t("profile.viewReports")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/self-help")}
                >
                  {t("profile.selfHelpResources")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/bp-tracking")}
                >
                  {t("profile.bloodPressureTracking")}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/medications")}
                >
                  {t("profile.medicationManagement")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
