"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, BookOpen, Calendar, Clock, Award, Target, LogOut } from "lucide-react"
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

export function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)
  const [userName, setUserName] = useState("Student")
  const [userEmail, setUserEmail] = useState("")
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { user, signOut: authSignOut } = useAuth()

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
      
      // Don't reload - the auth context and app router will handle navigation
      // The auth context already clears user data and sets return-to-landing flag
      console.log("Sign out completed, navigation will be handled by auth state change")
    } catch (error) {
      console.error("Sign out error:", error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground text-lg">Manage your personal information and learning preferences</p>
        </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
                <p className="text-sm text-muted-foreground">Upload a new profile picture</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={!!user?.email} // Disable if email comes from Cognito
                />
              </div>
            </div>

            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <BookOpen className="h-5 w-5" />
              <span>Learning Profile</span>
            </CardTitle>
            <CardDescription>Your current study configuration and interests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-white mb-3">Study Goals</h4>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-gray-300">Subject</div>
                  <div className="text-white capitalize">{userProfile.studyGoals.subject}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">Topic</div>
                  <div className="text-white">{userProfile.studyGoals.topic}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">Focus Area</div>
                  <div className="text-white">{userProfile.studyGoals.focusArea}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-white mb-3">Learning Pace</h4>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="capitalize">
                  {userProfile.learningPace}
                </Badge>
                <span className="text-sm text-gray-300">{getPaceDescription(userProfile.learningPace)}</span>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium text-white mb-3">Your Interests</h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Award className="h-5 w-5" />
              <span>Learning Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">7</div>
                <div className="text-sm text-gray-300">Day Streak</div>
              </div>
              <div className="text-center p-4">
                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">24h</div>
                <div className="text-sm text-gray-300">Study Time</div>
              </div>
              <div className="text-center p-4">
                <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">156</div>
                <div className="text-sm text-gray-300">Questions</div>
              </div>
              <div className="text-center p-4">
                <Award className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">78%</div>
                <div className="text-sm text-gray-300">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <LogOut className="h-5 w-5" />
              <span>Account</span>
            </CardTitle>
            <CardDescription>Manage your account session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 border border-orange-200 rounded-lg bg-orange-50 dark:border-orange-900/20 dark:bg-orange-900/5">
              <div className="font-medium text-orange-700 dark:text-orange-300 mb-2">Sign Out</div>
              <div className="text-sm text-muted-foreground mb-4">
                Sign out of your account and return to the sign-in page. Your learning progress will be preserved.
              </div>
              <Button 
                variant="outline" 
                onClick={signOut} 
                disabled={isSigningOut}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/10"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? "Signing Out..." : "Sign Out"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
