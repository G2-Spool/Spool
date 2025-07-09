"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw } from "lucide-react"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"
import { useAuth } from "@/contexts/auth-context"

interface UserProfile {
  interests: string[]
  interestDetails: Record<string, string>
  studyGoals: {
    subject: string
    topic: string
    focusArea: string
  }
  learningPace: string
}

const defaultProfile: UserProfile = {
  interests: ["Technology", "Science", "Reading"],
  interestDetails: {
    "Technology": "I enjoy learning about software development and emerging tech trends",
    "Science": "Fascinated by how things work and scientific discoveries",
    "Reading": "Love exploring different genres and expanding my knowledge"
  },
  studyGoals: {
    subject: "mathematics",
    topic: "Algebra",
    focusArea: "Linear Equations"
  },
  learningPace: "steady"
}

export function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)
  const [newInterest, setNewInterest] = useState("")
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { navigateToLanding } = useUnifiedNavigation()
  const { signOut: authSignOut } = useAuth()

  useEffect(() => {
    const profile = localStorage.getItem("user-profile")
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile)
        // Merge with default profile to ensure all properties exist
        const mergedProfile = {
          ...defaultProfile,
          ...parsedProfile,
          interestDetails: {
            ...defaultProfile.interestDetails,
            ...(parsedProfile.interestDetails || {})
          }
        }
        setUserProfile(mergedProfile)
        // Save the merged profile back to localStorage
        localStorage.setItem("user-profile", JSON.stringify(mergedProfile))
      } catch (error) {
        console.error("Failed to parse user profile, using default:", error)
        // Save default profile to localStorage
        localStorage.setItem("user-profile", JSON.stringify(defaultProfile))
      }
    } else {
      // Create default profile if none exists
      console.log("No user profile found, creating default profile")
      localStorage.setItem("user-profile", JSON.stringify(defaultProfile))
    }
  }, [])

  const saveProfile = () => {
    if (userProfile) {
      localStorage.setItem("user-profile", JSON.stringify(userProfile))
      // Show success message
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && userProfile && !userProfile.interests.includes(newInterest.trim())) {
      setUserProfile({
        ...userProfile,
        interests: [...userProfile.interests, newInterest.trim()],
      })
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    if (userProfile) {
      const newDetails = { ...(userProfile.interestDetails || {}) }
      delete newDetails[interest]
      setUserProfile({
        ...userProfile,
        interests: userProfile.interests.filter((i) => i !== interest),
        interestDetails: newDetails,
      })
    }
  }

  const resetOnboarding = () => {
    localStorage.removeItem("onboarding-complete")
    localStorage.removeItem("user-profile")
    navigateToLanding()
  }

  const signOut = async () => {
    setIsSigningOut(true)
    try {
      // Use the auth context's signOut method which handles Cognito sign out
      await authSignOut()
      
      // Navigate to landing page after sign out
      navigateToLanding()
    } catch (error) {
      console.error("Sign out error:", error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your learning preferences and account settings</p>
        </div>

        <div className="grid gap-6">
          {/* Interests & Hobbies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Interests & Hobbies</CardTitle>
              <CardDescription>Tell us about your interests to personalize your learning experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="interests">Add new interest</Label>
                <div className="flex gap-2">
                  <Input
                    id="interests"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="e.g., photography, cooking, music"
                    onKeyPress={(e) => e.key === "Enter" && addInterest()}
                  />
                  <Button onClick={addInterest} size="sm">
                    Add
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeInterest(interest)}
                  >
                    {interest} ×
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Study Goals</CardTitle>
              <CardDescription>Set your current learning objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={userProfile.studyGoals.subject}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      studyGoals: { ...userProfile.studyGoals, subject: e.target.value }
                    })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={userProfile.studyGoals.topic}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      studyGoals: { ...userProfile.studyGoals, topic: e.target.value }
                    })}
                    placeholder="e.g., Algebra"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="focusArea">Focus Area</Label>
                  <Input
                    id="focusArea"
                    value={userProfile.studyGoals.focusArea}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      studyGoals: { ...userProfile.studyGoals, focusArea: e.target.value }
                    })}
                    placeholder="e.g., Linear Equations"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Pace */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Learning Pace</CardTitle>
              <CardDescription>How quickly do you want to progress through the material?</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={userProfile.learningPace}
                onValueChange={(pace: string) => setUserProfile({ ...userProfile, learningPace: pace })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turtle">Turtle - 2 questions/day</SelectItem>
                  <SelectItem value="steady">Steady - 3-4 questions/day</SelectItem>
                  <SelectItem value="rabbit">Fast - 5-6 questions/day</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Save Changes</CardTitle>
              <CardDescription>Save your updated preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={saveProfile} className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5" />
                <span>Account Actions</span>
              </CardTitle>
              <CardDescription>Sign out or reset your learning progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-orange-200 rounded-lg bg-orange-50 dark:border-orange-900/20 dark:bg-orange-900/5">
                <div className="font-medium text-orange-700 dark:text-orange-300 mb-2">Sign Out</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Sign out of your account and return to the landing page. Your data will be preserved.
                </div>
                <Button 
                  variant="outline" 
                  onClick={signOut} 
                  disabled={isSigningOut}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/10"
                >
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </Button>
              </div>
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="font-medium text-destructive mb-2">Reset Onboarding</div>
                <div className="text-sm text-muted-foreground mb-4">
                  This will clear all your profile data and take you back to the initial setup. This action cannot be
                  undone.
                </div>
                <Button variant="destructive" onClick={resetOnboarding}>
                  Reset Everything
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
