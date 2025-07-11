"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  BookOpen, 
  LogOut, 
  Target, 
  Zap,
  Edit,
  Save,
  X,
  Plus,
  RotateCcw,
  Eye
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useUnifiedNavigation } from "@/hooks/use-unified-navigation"
import { toast } from "sonner"

interface StudyGoal {
  subject: string
  topic: string
}

interface UserProfile {
  name: string
  interests: string[]
  interestDetails: Record<string, string>
  studyGoals: StudyGoal[]
  learningPace: string
}

const defaultProfile: UserProfile = {
  name: "Student",
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
  learningPace: "steady"
}

export function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile)
  const [originalProfile, setOriginalProfile] = useState<UserProfile>(defaultProfile)
  const [userEmail, setUserEmail] = useState("")
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newInterest, setNewInterest] = useState("")
  const [newStudyGoal, setNewStudyGoal] = useState<StudyGoal>({ subject: "", topic: "" })
  const { user, signOut: authSignOut } = useAuth()
  const { navigateToLanding } = useUnifiedNavigation()

  // Helper function to get user-specific profile key
  const getUserProfileKey = () => user?.sub ? `user-profile-${user.sub}` : "user-profile"

  // Set user email from auth context
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email)
      // Set initial name from email if no name is set
      if (userProfile.name === "Student" && user.email) {
        const emailName = user.email.split('@')[0]
        const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1)
        setUserProfile(prev => ({ ...prev, name: formattedName }))
        setOriginalProfile(prev => ({ ...prev, name: formattedName }))
      }
    }
  }, [user, userProfile.name])

  useEffect(() => {
    if (!user?.sub) return // Wait for user to be loaded
    
    const profileKey = getUserProfileKey()
    const profile = localStorage.getItem(profileKey)
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
        
        // Migrate old pace values to new system
        if (parsedProfile.learningPace === 'slow') {
          parsedProfile.learningPace = 'turtle'
        } else if (parsedProfile.learningPace === 'regular') {
          parsedProfile.learningPace = 'steady'
        } else if (parsedProfile.learningPace === 'fast') {
          parsedProfile.learningPace = 'rabbit'
        }
        
        // Merge with default profile to ensure all properties exist
        const mergedProfile = {
          ...defaultProfile,
          ...parsedProfile,
          name: parsedProfile.name || defaultProfile.name,
          interestDetails: {
            ...defaultProfile.interestDetails,
            ...(parsedProfile.interestDetails || {})
          },
          studyGoals: parsedProfile.studyGoals || defaultProfile.studyGoals
        }
        setUserProfile(mergedProfile)
        setOriginalProfile(mergedProfile)
        // Save the merged profile back to localStorage
        localStorage.setItem(profileKey, JSON.stringify(mergedProfile))
      } catch (error) {
        console.error("Failed to parse user profile, using default:", error)
        // Save default profile to localStorage
        localStorage.setItem(profileKey, JSON.stringify(defaultProfile))
        setOriginalProfile(defaultProfile)
      }
    } else {
      // Create default profile if none exists
      console.log("No user profile found, creating default profile")
      localStorage.setItem(profileKey, JSON.stringify(defaultProfile))
      setOriginalProfile(defaultProfile)
    }
  }, [user?.sub])

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

  const getPaceDescription = (pace: string) => {
    switch (pace) {
      case "turtle":
        return "2 concepts/day"
      case "steady":
        return "5 concepts/day"
      case "rabbit":
        return "8 concepts/day"
      default:
        return "Custom pace"
    }
  }

  const getPaceDisplayName = (pace: string) => {
    switch (pace) {
      case "turtle":
        return "Calm"
      case "steady":
        return "Steady"
      case "rabbit":
        return "Energized"
      default:
        return pace.charAt(0).toUpperCase() + pace.slice(1)
    }
  }

  const saveProfile = () => {
    if (userProfile) {
      const profileKey = getUserProfileKey()
      localStorage.setItem(profileKey, JSON.stringify(userProfile))
      setOriginalProfile(userProfile) // Update original profile to current state
      setIsEditMode(false)
      toast.success("Profile saved! Your preferences have been updated successfully.")
    }
  }

  const cancelChanges = () => {
    setUserProfile(originalProfile)
    setNewInterest("")
    setNewStudyGoal({ subject: "", topic: "" })
    setIsEditMode(false)
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

  const addStudyGoal = () => {
    if (newStudyGoal.subject.trim() && newStudyGoal.topic.trim() && userProfile) {
      const cleanedSubject = cleanText(newStudyGoal.subject)
      const cleanedTopic = cleanText(newStudyGoal.topic)
      
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
    const profileKey = getUserProfileKey()
    localStorage.removeItem(profileKey)
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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground">
              {isEditMode ? "Edit your profile and preferences" : "View and manage your learning profile"}
            </p>
          </div>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button 
                  onClick={saveProfile} 
                  disabled={!hasChanges}
                  size="sm"
                  className="px-4 py-2"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cancelChanges}
                  size="sm"
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setIsEditMode(true)}
                size="sm"
                className="px-4 py-2"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
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
                  {isEditMode ? (
                    <Input
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                      placeholder="Enter your name"
                      className="font-medium"
                    />
                  ) : (
                    <div className="font-medium">{userProfile.name}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Email</div>
                  <div className="font-medium">{userEmail}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interests & Hobbies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Target className="h-5 w-5" />
                <span>Interests & Hobbies</span>
              </CardTitle>
              <CardDescription>
                {isEditMode ? "Add or remove interests to personalize your learning experience" : "Your personal interests that shape your learning"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                <>
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
                </>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Study Materials */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <BookOpen className="h-5 w-5" />
                <span>Study Materials</span>
              </CardTitle>
              <CardDescription>
                {isEditMode ? "Add subjects and topics you want to focus on" : "Your current learning objectives"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                <>
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
                      Add Study Material
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
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfile.studyGoals.map((goal, index) => (
                    <div key={index} className="p-3 bg-secondary/20 rounded-lg">
                      <div className="font-medium text-sm mb-1">{goal.subject}</div>
                      <div className="text-sm text-muted-foreground">{goal.topic}</div>
                    </div>
                  ))}
                  {userProfile.studyGoals.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <p>No study materials added yet</p>
                      <p className="text-sm">Click "Edit Profile" to add your first subject and topic</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Learning Pace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Zap className="h-5 w-5" />
                <span>Learning Pace</span>
              </CardTitle>
              <CardDescription>
                {isEditMode ? "Set your daily learning goal - this affects your \"Today's Progress\" tracking" : "Your preferred learning speed"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditMode ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      userProfile.learningPace === 'turtle'
                        ? 'ring-2 ring-primary bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setUserProfile({ ...userProfile, learningPace: 'turtle' })}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">🧘</div>
                      <div className="font-semibold text-lg">Calm</div>
                      <div className="text-sm text-muted-foreground">2 concepts/day</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      userProfile.learningPace === 'steady'
                        ? 'ring-2 ring-primary bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setUserProfile({ ...userProfile, learningPace: 'steady' })}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">⚡</div>
                      <div className="font-semibold text-lg">Steady</div>
                      <div className="text-sm text-muted-foreground">5 concepts/day</div>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all duration-200 ${
                      userProfile.learningPace === 'rabbit'
                        ? 'ring-2 ring-primary bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setUserProfile({ ...userProfile, learningPace: 'rabbit' })}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl mb-2">🚀</div>
                      <div className="font-semibold text-lg">Energized</div>
                      <div className="text-sm text-muted-foreground">8 concepts/day</div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-sm">
                    {getPaceDisplayName(userProfile.learningPace)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getPaceDescription(userProfile.learningPace)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reset Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5" />
                <span>Reset Onboarding</span>
              </CardTitle>
              <CardDescription>Reset your learning progress and start fresh</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="font-medium text-destructive mb-2">Reset Everything</div>
                <div className="text-sm text-muted-foreground mb-4">
                  This will clear all your profile data and take you back to the initial setup. This action cannot be undone.
                </div>
                <Button variant="destructive" onClick={resetOnboarding}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
