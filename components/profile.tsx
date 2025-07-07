"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, BookOpen, Calendar, Clock, Award, Target } from "lucide-react"

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

export function Profile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userName, setUserName] = useState("Student")
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const profile = localStorage.getItem("user-profile")
    if (profile) {
      setUserProfile(JSON.parse(profile))
    }
  }, [])

  if (!userProfile) {
    return <div className="text-white">Loading...</div>
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Profile</h2>
        <p className="text-muted-foreground">Manage your personal information and learning preferences</p>
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
      </div>
    </div>
  )
}
