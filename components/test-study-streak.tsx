/**
 * Test component for demonstrating study streak functionality
 * This component allows testing the streak tracking without going through the full learning flow
 */

"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStudyStreak } from '@/hooks/use-study-streak'
import { Badge } from '@/components/ui/badge'
import { Calendar, Trophy, Target, BookOpen } from 'lucide-react'
import { getTopicData } from '@/components/pages/topic-page'

export function TestStudyStreak() {
  const { currentStreak, totalCompletions, todayCompletions, recordCompletion, getStreakStatus, getWeeklyConsistency } = useStudyStreak()
  const [testConceptId, setTestConceptId] = useState('test-concept-1')
  const [testTopicId, setTestTopicId] = useState('college-algebra')  
  const [testConceptTitle, setTestConceptTitle] = useState('Linear Equations')

  const streakStatus = getStreakStatus()
  const weeklyConsistency = getWeeklyConsistency()

  // Function to get current study focus (for debugging)
  const getCurrentStudyFocusDebug = () => {
    const availableTopics = ["college-algebra", "statistics", "biology", "anatomy"]
    
    const streakData = localStorage.getItem('study-streak-data')
    let recentCompletions: any[] = []
    
    if (streakData) {
      try {
        const parsedData = JSON.parse(streakData)
        recentCompletions = parsedData.completions || []
        recentCompletions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      } catch (error) {
        console.error('Failed to parse study streak data:', error)
      }
    }
    
    const mostRecentTopic = recentCompletions.length > 0 ? recentCompletions[0].topicId : null
    
    const topicProgress = availableTopics.map(topicId => {
      const topicData = getTopicData(topicId)
      
      let totalConcepts = 0
      let completedConcepts = 0
      let currentSection = null
      
      for (const section of topicData.sections) {
        if (section.concepts && section.concepts.length > 0) {
          totalConcepts += section.concepts.length
          completedConcepts += section.concepts.filter(c => c.completed).length
          
          if (!currentSection) {
            const firstIncomplete = section.concepts.find(c => !c.completed)
            if (firstIncomplete) {
              currentSection = section
            }
          }
        }
      }
      
      const overallProgress = totalConcepts > 0 ? (completedConcepts / totalConcepts) * 100 : 0
      
      return {
        topicId,
        title: topicData.title,
        currentSection: currentSection?.title || 'No current section',
        overallProgress: Math.round(overallProgress),
        isRecentlyActive: topicId === mostRecentTopic,
        totalConcepts,
        completedConcepts
      }
    })

    return { topicProgress, mostRecentTopic, recentCompletions: recentCompletions.slice(0, 3) }
  }

  const debugInfo = getCurrentStudyFocusDebug()

  const handleTestCompletion = () => {
    recordCompletion(testConceptId, testTopicId, testConceptTitle)
    // Generate new test concept ID for next completion
    const newId = `test-concept-${Date.now()}`
    setTestConceptId(newId)
  }

  const clearData = () => {
    localStorage.removeItem('study-streak-data')
    window.location.reload()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Dashboard Stats Test
          </CardTitle>
          <CardDescription>
            Test streak and daily progress by simulating concept completions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayCompletions}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{weeklyConsistency.percentage}%</div>
              <div className="text-sm text-muted-foreground">Weekly</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCompletions}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>
          
          {/* Weekly Detail */}
          <div className="text-center">
            <Badge variant="outline" className="flex items-center gap-2 mx-auto w-fit">
              <Target className="h-4 w-4" />
              {weeklyConsistency.daysCompleted}/{weeklyConsistency.totalDays} days met daily goal this week
            </Badge>
          </div>

          {/* Streak Status */}
          <div className="flex items-center justify-center">
            <Badge variant={streakStatus.isActive ? "default" : "secondary"} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {streakStatus.message}
            </Badge>
          </div>

          {/* Test Form */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold">Simulate Concept Completion</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="conceptId">Concept ID</Label>
                <Input
                  id="conceptId"
                  value={testConceptId}
                  onChange={(e) => setTestConceptId(e.target.value)}
                  placeholder="Enter concept ID"
                />
              </div>

              <div>
                <Label htmlFor="topicId">Topic ID</Label>
                <Input
                  id="topicId"
                  value={testTopicId}
                  onChange={(e) => setTestTopicId(e.target.value)}
                  placeholder="Enter topic ID"
                />
              </div>

              <div>
                <Label htmlFor="conceptTitle">Concept Title</Label>
                <Input
                  id="conceptTitle"
                  value={testConceptTitle}
                  onChange={(e) => setTestConceptTitle(e.target.value)}
                  placeholder="Enter concept title"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleTestCompletion} className="flex-1">
                <Target className="h-4 w-4 mr-2" />
                Complete Concept
              </Button>
              <Button onClick={clearData} variant="outline">
                Clear Data
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">How to Test:</h4>
            <ul className="space-y-1">
              <li>• Click "Complete Concept" to simulate finishing a concept</li>
              <li>• Each completion counts toward your daily streak and weekly consistency</li>
              <li>• You need at least 1 concept per day to maintain your streak</li>
              <li>• Weekly consistency tracks days you met your personal daily goal (2/5/8 concepts based on pace)</li>
              <li>• The streak resets if you miss a day</li>
              <li>• Use "Clear Data" to reset and start fresh</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Current Study Focus Debug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Current Study Focus Debug
          </CardTitle>
          <CardDescription>
            Shows how the system determines your current study focus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Most Recent Activity */}
          <div>
            <h4 className="font-semibold mb-2">Most Recent Activity</h4>
            {debugInfo.mostRecentTopic ? (
              <Badge variant="default">{debugInfo.mostRecentTopic}</Badge>
            ) : (
              <Badge variant="secondary">No recent activity</Badge>
            )}
          </div>

          {/* Recent Completions */}
          <div>
            <h4 className="font-semibold mb-2">Recent Completions</h4>
            {debugInfo.recentCompletions.length > 0 ? (
              <div className="space-y-2">
                {debugInfo.recentCompletions.map((completion, index) => (
                  <div key={index} className="text-sm bg-muted p-2 rounded">
                    <strong>{completion.topicId}</strong>: {completion.conceptTitle} 
                    <div className="text-xs text-muted-foreground">
                      {new Date(completion.completedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No completions yet</p>
            )}
          </div>

          {/* Topic Progress */}
          <div>
            <h4 className="font-semibold mb-2">All Topics Progress</h4>
            <div className="grid gap-3">
              {debugInfo.topicProgress.map((topic) => (
                <div key={topic.topicId} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{topic.title}</h5>
                    <div className="flex items-center gap-2">
                      <Badge variant={topic.isRecentlyActive ? "default" : "secondary"} className="text-xs">
                        {topic.overallProgress}%
                      </Badge>
                      {topic.isRecentlyActive && (
                        <Badge variant="outline" className="text-xs">Recent</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div>Current Section: {topic.currentSection}</div>
                    <div>Progress: {topic.completedConcepts}/{topic.totalConcepts} concepts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 