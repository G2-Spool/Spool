"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  BookOpen, 
  Settings, 
  LogOut, 
  Target, 
  Zap 
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"

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

export function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)
  const [userName, setUserName] = useState("Student")
  const [userEmail, setUserEmail] = useState("")
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, signOut: authSignOut } = useAuth()
  const { navigateToLanding } = useUnifiedNavigation()

  // Set user email from auth context
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email)
      // Set initial from email if no name is set
      if (userName === "Student" && user.email) {
        const emailName = user.email.split('@')[0]
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1))
      }
    }
  }, [user])

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

  const getPaceDescription = (pace: string) => {
    switch (pace) {
      case "turtle":
        return "2 questions/day"
      case "steady":
        return "3-4 questions/day"
      case "rabbit":
        return "5-6 questions/day"
      default:
        return "Custom pace"
    }
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
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">View and manage your learning profile</p>
        </div>

        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>Your account and profile details</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  onClick={signOut} 
                  disabled={isSigningOut}
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-950/10 dark:border-red-900/20 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isSigningOut ? "Signing Out..." : "Sign Out"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Name</div>
                  <div className="font-medium">{userName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Email</div>
                  <div className="font-medium">{userEmail}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Target className="h-5 w-5" />
                <span>Interests & Hobbies</span>
              </CardTitle>
              <CardDescription>Your personal interests that shape your learning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-sm">
                      {interest}
                    </Badge>
                  ))}
                </div>
                {userProfile.interests.length > 0 && (
                  <div className="space-y-3">
                    {userProfile.interests.map((interest) => (
                      userProfile.interestDetails[interest] && (
                        <div key={interest} className="p-3 bg-secondary/20 rounded-lg">
                          <div className="font-medium text-sm mb-1">{interest}</div>
                          <div className="text-sm text-muted-foreground">
                            {userProfile.interestDetails[interest]}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Study Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BookOpen className="h-5 w-5" />
                <span>Study Goals</span>
              </CardTitle>
              <CardDescription>Your current learning objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Subject</div>
                  <div className="font-medium">{userProfile.studyGoals.subject}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Topic</div>
                  <div className="font-medium">{userProfile.studyGoals.topic}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Focus Area</div>
                  <div className="font-medium">{userProfile.studyGoals.focusArea}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Pace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Zap className="h-5 w-5" />
                <span>Learning Pace</span>
              </CardTitle>
              <CardDescription>Your preferred learning speed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="text-sm">
                  {userProfile.learningPace.charAt(0).toUpperCase() + userProfile.learningPace.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getPaceDescription(userProfile.learningPace)}
                </span>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  )
}
