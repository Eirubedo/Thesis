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

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

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
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 2MB",
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
            title: "Success",
            description: "Profile picture updated successfully",
          })
        } else {
          toast({
            title: "Upload Failed",
            description: "Failed to upload profile picture",
            variant: "destructive",
          })
        }
        setUploadingPicture(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while uploading your picture",
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
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update profile",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating your profile",
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
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation",
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
            title: "Getting Location...",
            description: "Converting coordinates to address...",
          })

          const geocodeResult = await reverseGeocode(latitude, longitude)

          setFormData((prev) => ({
            ...prev,
            address: geocodeResult.address,
            postal_code: geocodeResult.postalCode,
          }))

          toast({
            title: "Location Retrieved",
            description: `Address found using ${geocodeResult.source}`,
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
            title: "Location Retrieved",
            description: "GPS coordinates saved. Please update address manually if needed.",
          })
        } finally {
          setIsLoadingLocation(false)
        }
      },
      (error) => {
        setIsLoadingLocation(false)
        let errorMessage = "Could not retrieve your location"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions in your browser."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please check your GPS/internet connection."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again."
            break
        }

        toast({
          title: "Location Error",
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
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      logout()
      router.push("/")
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and profile information</CardDescription>
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
                        {profilePicture ? "Change Picture" : "Upload Picture"}
                      </div>
                    </Label>
                    <Input
                      id="profile_picture"
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500">Max 2MB, JPG/PNG</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name / Nama Lengkap</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender / Jenis Kelamin</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male / Laki-laki</SelectItem>
                        <SelectItem value="female">Female / Perempuan</SelectItem>
                        <SelectItem value="other">Other / Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Date of Birth / Tanggal Lahir</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, birth_date: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address / Alamat Lengkap</Label>
                  <div className="flex gap-2">
                    <Textarea
                      id="address"
                      placeholder="Enter your complete address"
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
                    Click GPS button to automatically detect and fill your current address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code / Kode Pos</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, postal_code: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter postal code"
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a bit about yourself..."
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
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>Save Changes</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Edit Profile
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
                  Privacy & Security
                </CardTitle>
                <CardDescription>Manage your privacy settings and data preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive updates about your mental health journey</p>
                  </div>
                  <Button
                    variant={formData.notifications ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, notifications: !prev.notifications }))}
                  >
                    {formData.notifications ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Anonymous Data Sharing</h4>
                    <p className="text-sm text-gray-600">Help improve our AI by sharing anonymized data</p>
                  </div>
                  <Button
                    variant={formData.dataSharing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData((prev) => ({ ...prev, dataSharing: !prev.dataSharing }))}
                  >
                    {formData.dataSharing ? "Enabled" : "Disabled"}
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Shield className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that will affect your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">
                  Delete Account
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Phone Number</p>
                    <p className="text-xs text-gray-600">{user.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Date of Birth</p>
                    <p className="text-xs text-gray-600">{user.birth_date ? formatDate(user.birth_date) : "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Postal Code</p>
                    <p className="text-xs text-gray-600">{user.postal_code || "Not set"}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Notifications</p>
                    <p className="text-xs text-gray-600">{formData.notifications ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/assessment")}
                >
                  Take Assessment
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/reports")}
                >
                  View Reports
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/self-help")}
                >
                  Self-Help Resources
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/bp-tracking")}
                >
                  Blood Pressure Tracking
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/medications")}
                >
                  Medication Management
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
