"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { RotateCcw, Plus, X } from "lucide-react"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"
import { useAuth } from "@/contexts/auth-context"

interface StudyGoal {
  subject: string
  topic: string
}

interface UserProfile {
  interests: string[]
  interestDetails: Record<string, string>
  studyGoals: StudyGoal[]
  learningPace: string
}

const defaultProfile: UserProfile = {
  interests: ["Technology", "Science", "Reading"],
  interestDetails: {
    "Technology": "I enjoy learning about software development and emerging tech trends",
    "Science": "Fascinated by how things work and scientific discoveries",
    "Reading": "Love exploring different genres and expanding my knowledge"
  },
  studyGoals: [
    { subject: "Mathematics", topic: "Algebra" },
    { subject: "Science", topic: "Biology" }
  ],
  learningPace: "regular"
}

export function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)
  const [originalProfile, setOriginalProfile] = useState<UserProfile>(defaultProfile)
  const [newInterest, setNewInterest] = useState("")
  const [newStudyGoal, setNewStudyGoal] = useState<StudyGoal>({ subject: "", topic: "" })
  const [isSigningOut, setIsSigningOut] = useState(false)
  const { navigateToLanding } = useUnifiedNavigation()
  const { signOut: authSignOut } = useAuth()

  useEffect(() => {
    const profile = localStorage.getItem("user-profile")
    if (profile) {
      try {
        const parsedProfile = JSON.parse(profile)
        
        // Handle migration from old format
        if (parsedProfile.studyGoals && !Array.isArray(parsedProfile.studyGoals)) {
          const oldGoals = parsedProfile.studyGoals
          parsedProfile.studyGoals = [{
            subject: oldGoals.subject || "Mathematics",
            topic: oldGoals.topic || "Algebra"
          }]
        }
        
        // Merge with default profile to ensure all properties exist
        const mergedProfile = {
          ...defaultProfile,
          ...parsedProfile,
          interestDetails: {
            ...defaultProfile.interestDetails,
            ...(parsedProfile.interestDetails || {})
          },
          studyGoals: parsedProfile.studyGoals || defaultProfile.studyGoals
        }
        setUserProfile(mergedProfile)
        setOriginalProfile(mergedProfile)
        // Save the merged profile back to localStorage
        localStorage.setItem("user-profile", JSON.stringify(mergedProfile))
      } catch (error) {
        console.error("Failed to parse user profile, using default:", error)
        // Save default profile to localStorage
        localStorage.setItem("user-profile", JSON.stringify(defaultProfile))
        setOriginalProfile(defaultProfile)
      }
    } else {
      // Create default profile if none exists
      console.log("No user profile found, creating default profile")
      localStorage.setItem("user-profile", JSON.stringify(defaultProfile))
      setOriginalProfile(defaultProfile)
    }
  }, [])

  // Normalize objects for consistent comparison
  const normalizeForComparison = (obj: any): string => {
    if (obj === null || obj === undefined) return 'null'
    if (typeof obj !== 'object') return String(obj)
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return JSON.stringify(obj.map(normalizeForComparison))
    }
    
    // Handle objects - sort keys for consistent comparison
    const sortedKeys = Object.keys(obj).sort()
    const normalized: any = {}
    sortedKeys.forEach(key => {
      normalized[key] = obj[key]
    })
    
    return JSON.stringify(normalized, sortedKeys)
  }

  // Check if there are any changes using useMemo for performance
  const hasChanges = useMemo(() => {
    const currentHash = normalizeForComparison(userProfile)
    const originalHash = normalizeForComparison(originalProfile)
    return currentHash !== originalHash
  }, [userProfile, originalProfile])

  const saveProfile = () => {
    if (userProfile) {
      localStorage.setItem("user-profile", JSON.stringify(userProfile))
      setOriginalProfile(userProfile) // Update original profile to current state
      // Show success message
    }
  }

  const cancelChanges = () => {
    setUserProfile(originalProfile)
    setNewInterest("")
    setNewStudyGoal({ subject: "", topic: "" })
  }

  const addInterest = () => {
    if (newInterest.trim() && userProfile) {
      const cleanedInterest = cleanText(newInterest)
      
      if (!userProfile.interests.includes(cleanedInterest)) {
        setUserProfile({
          ...userProfile,
          interests: [...userProfile.interests, cleanedInterest],
        })
        setNewInterest("")
      }
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

  const cleanText = (text: string): string => {
    if (!text || typeof text !== 'string') return ''
    
    return text
      .trim() // Remove leading/trailing spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .split(' ') // Split into words
      .filter(word => word.length > 0) // Remove empty strings
      .map(word => {
        if (word.length === 1) {
          return word.toUpperCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      }) // Capitalize each word
      .join(' ') // Join back together
  }

  const addStudyGoal = () => {
    if (newStudyGoal.subject.trim() && newStudyGoal.topic.trim() && userProfile) {
      const cleanedSubject = cleanText(newStudyGoal.subject)
      const cleanedTopic = cleanText(newStudyGoal.topic)
      
      // Debug logging
      console.log('Original subject:', newStudyGoal.subject)
      console.log('Cleaned subject:', cleanedSubject)
      console.log('Original topic:', newStudyGoal.topic)
      console.log('Cleaned topic:', cleanedTopic)
      
      const goalExists = userProfile.studyGoals.some(
        goal => goal.subject === cleanedSubject && goal.topic === cleanedTopic
      )
      
      if (!goalExists) {
        setUserProfile({
          ...userProfile,
          studyGoals: [...userProfile.studyGoals, {
            subject: cleanedSubject,
            topic: cleanedTopic
          }]
        })
        setNewStudyGoal({ subject: "", topic: "" })
      }
    }
  }

  const removeStudyGoal = (index: number) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        studyGoals: userProfile.studyGoals.filter((_, i) => i !== index)
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
                    <Plus className="h-4 w-4 mr-1" />
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
                    {interest} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Study Materials</CardTitle>
              <CardDescription>Add subjects and topics you want to focus on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newSubject">Subject</Label>
                    <Input
                      id="newSubject"
                      value={newStudyGoal.subject}
                      onChange={(e) => setNewStudyGoal({ ...newStudyGoal, subject: e.target.value })}
                      placeholder="e.g., Mathematics, History, Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newTopic">Topic</Label>
                    <Input
                      id="newTopic"
                      value={newStudyGoal.topic}
                      onChange={(e) => setNewStudyGoal({ ...newStudyGoal, topic: e.target.value })}
                      placeholder="e.g., Algebra, World War II, Biology"
                      onKeyPress={(e) => e.key === "Enter" && addStudyGoal()}
                    />
                  </div>
                </div>
                <Button onClick={addStudyGoal} size="sm" className="px-3 py-1 text-sm h-8">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Class
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Current Study Materials</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {userProfile.studyGoals.map((goal, index) => (
                    <div
                      key={index}
                      className="relative group flex items-center justify-between p-2 border rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {goal.subject}: {goal.topic}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudyGoal(index)}
                        className="h-6 w-6 p-0 ml-2 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {userProfile.studyGoals.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <p>No study materials added yet</p>
                      <p className="text-sm">Add your first subject and topic above</p>
                    </div>
                  )}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    userProfile.learningPace === 'slow' || userProfile.learningPace === 'turtle'
                      ? 'ring-2 ring-primary bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setUserProfile({ ...userProfile, learningPace: 'slow' })}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🐢</div>
                    <div className="font-semibold text-lg">Slow</div>
                    <div className="text-sm text-muted-foreground">2 questions/day</div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    userProfile.learningPace === 'regular' || userProfile.learningPace === 'steady'
                      ? 'ring-2 ring-primary bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setUserProfile({ ...userProfile, learningPace: 'regular' })}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="font-semibold text-lg">Regular</div>
                    <div className="text-sm text-muted-foreground">3-4 questions/day</div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    userProfile.learningPace === 'fast' || userProfile.learningPace === 'rabbit'
                      ? 'ring-2 ring-primary bg-primary/10 border-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setUserProfile({ ...userProfile, learningPace: 'fast' })}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">🚀</div>
                    <div className="font-semibold text-lg">Fast</div>
                    <div className="text-sm text-muted-foreground">5-6 questions/day</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Save Changes</CardTitle>
              <CardDescription>
                {hasChanges ? "You have unsaved changes" : "Save your updated preferences"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button 
                  onClick={saveProfile} 
                  disabled={!hasChanges}
                  size="sm"
                  className="px-4 py-2"
                >
                  Save Settings
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cancelChanges}
                  disabled={!hasChanges}
                  size="sm"
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
              </div>
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
