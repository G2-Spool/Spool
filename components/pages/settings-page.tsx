"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { User, BookOpen, Bell, Palette, RotateCcw, Plus, X } from "lucide-react"

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

export function SettingsPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [newInterest, setNewInterest] = useState("")
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyProgress: true,
    achievements: true,
  })
  const [preferences, setPreferences] = useState({
    theme: "light",
    difficulty: "adaptive",
    feedbackFrequency: "normal",
  })

  useEffect(() => {
    const profile = localStorage.getItem("user-profile")
    if (profile) {
      setUserProfile(JSON.parse(profile))
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
      const newDetails = { ...userProfile.interestDetails }
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
    window.location.reload()
  }

  const signOut = () => {
    localStorage.removeItem("user-signed-in")
    localStorage.removeItem("onboarding-complete")
    localStorage.removeItem("user-profile")
    localStorage.removeItem("splash-completed")
    localStorage.setItem("show-splash-screen", "true")
    window.location.reload()
  }

  if (!userProfile) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account preferences and study configuration</p>
        </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your interests and personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="interests">Your Interests</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    id="interests"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Add a new interest"
                    onKeyPress={(e) => e.key === "Enter" && addInterest()}
                  />
                  <Button onClick={addInterest} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {userProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center space-x-1">
                      <span>{interest}</span>
                      <button onClick={() => removeInterest(interest)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {userProfile.interests.map((interest) => (
                <div key={interest} className="space-y-2">
                  <Label htmlFor={`detail-${interest}`}>What do you enjoy about {interest}?</Label>
                  <Textarea
                    id={`detail-${interest}`}
                    value={userProfile.interestDetails[interest] || ""}
                    onChange={(e) =>
                      setUserProfile({
                        ...userProfile,
                        interestDetails: {
                          ...userProfile.interestDetails,
                          [interest]: e.target.value,
                        },
                      })
                    }
                    placeholder={`Describe what you love about ${interest}...`}
                    rows={2}
                  />
                </div>
              ))}
            </div>

            <Button onClick={saveProfile}>Save Profile Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Study Configuration</span>
            </CardTitle>
            <CardDescription>Adjust your learning goals and pace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={userProfile.studyGoals.subject}
                  onValueChange={(value) =>
                    setUserProfile({
                      ...userProfile,
                      studyGoals: { ...userProfile.studyGoals, subject: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="literature">Literature</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={userProfile.studyGoals.topic}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      studyGoals: { ...userProfile.studyGoals, topic: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="focus">Focus Area</Label>
                <Input
                  id="focus"
                  value={userProfile.studyGoals.focusArea}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      studyGoals: { ...userProfile.studyGoals, focusArea: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Learning Pace</Label>
              <Select
                value={userProfile.learningPace}
                onValueChange={(value) =>
                  setUserProfile({
                    ...userProfile,
                    learningPace: value,
                  })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turtle">Turtle - 2 questions/day</SelectItem>
                  <SelectItem value="steady">Steady - 3-4 questions/day</SelectItem>
                  <SelectItem value="rabbit">Fast - 5-6 questions/day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={saveProfile}>Save Study Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>Choose what notifications you'd like to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Daily Study Reminder</div>
                <div className="text-sm text-muted-foreground">
                  Get reminded to complete your daily learning session
                </div>
              </div>
              <Switch
                checked={notifications.dailyReminder}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    dailyReminder: checked,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Weekly Progress Report</div>
                <div className="text-sm text-muted-foreground">
                  Receive a summary of your learning progress each week
                </div>
              </div>
              <Switch
                checked={notifications.weeklyProgress}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    weeklyProgress: checked,
                  })
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Achievement Notifications</div>
                <div className="text-sm text-muted-foreground">Get notified when you unlock new achievements</div>
              </div>
              <Switch
                checked={notifications.achievements}
                onCheckedChange={(checked) =>
                  setNotifications({
                    ...notifications,
                    achievements: checked,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Preferences</span>
            </CardTitle>
            <CardDescription>Customize your learning experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Difficulty Level</Label>
                <Select
                  value={preferences.difficulty}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      difficulty: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Feedback Frequency</Label>
                <Select
                  value={preferences.feedbackFrequency}
                  onValueChange={(value) =>
                    setPreferences({
                      ...preferences,
                      feedbackFrequency: value,
                    })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="frequent">Frequent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

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
                Sign out of your account and return to the sign-in page. Your data will be preserved.
              </div>
              <Button variant="outline" onClick={signOut} className="border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-900/20 dark:text-orange-300 dark:hover:bg-orange-900/10">
                Sign Out
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
