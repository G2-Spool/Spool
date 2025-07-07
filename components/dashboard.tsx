"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Target, TrendingUp, Calendar, Clock, Award, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [studyStreak, setStudyStreak] = useState(7)
  const [todayProgress, setTodayProgress] = useState(60)
  const [weeklyGoal, setWeeklyGoal] = useState(75)

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
        <h2 className="text-2xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-gray-300">Track your learning progress and achievements</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Stats cards remain the same */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Study Streak</CardTitle>
                <Calendar className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{studyStreak} days</div>
                <p className="text-xs text-gray-400">Keep it up!</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Today's Progress</CardTitle>
                <Clock className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{todayProgress}%</div>
                <Progress value={todayProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Weekly Goal</CardTitle>
                <Target className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{weeklyGoal}%</div>
                <p className="text-xs text-gray-400">5/7 days completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Learning Pace</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize text-white">{userProfile.learningPace}</div>
                <p className="text-xs text-gray-400">{getPaceDescription(userProfile.learningPace)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <BookOpen className="h-5 w-5" />
                  <span>Current Study Focus</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-300">Subject</div>
                  <div className="text-lg capitalize text-white">{userProfile.studyGoals.subject}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">Topic</div>
                  <div className="text-lg text-white">{userProfile.studyGoals.topic}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-300">Focus Area</div>
                  <div className="text-lg text-white">{userProfile.studyGoals.focusArea}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Your Interests</CardTitle>
                <CardDescription className="text-gray-400">
                  We'll connect these to your studies to make learning more engaging
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest) => (
                    <Badge key={interest} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <BarChart3 className="h-5 w-5" />
                  <span>Weekly Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Monday</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={100} className="w-20" />
                      <span className="text-sm text-white">100%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Tuesday</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={80} className="w-20" />
                      <span className="text-sm text-white">80%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300">Wednesday</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={60} className="w-20" />
                      <span className="text-sm text-white">60%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Study Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Total Study Time</span>
                  <span className="font-medium text-white">24h 15m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Questions Answered</span>
                  <span className="font-medium text-white">156</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Accuracy Rate</span>
                  <span className="font-medium text-white">78%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Award className="h-5 w-5" />
                <span>Recent Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-[#78af9f] rounded-full"></div>
                  <span className="text-sm text-gray-300">Completed 7-day study streak</span>
                  <Badge variant="outline" className="ml-auto">
                    Today
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-300">Mastered basic wave properties</span>
                  <Badge variant="outline" className="ml-auto">
                    2 days ago
                  </Badge>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-300">Connected guitar playing to sound waves</span>
                  <Badge variant="outline" className="ml-auto">
                    1 week ago
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
