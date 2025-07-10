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
import { Calendar, Trophy, Target } from 'lucide-react'

export function TestStudyStreak() {
  const { currentStreak, totalCompletions, todayCompletions, recordCompletion, getStreakStatus } = useStudyStreak()
  const [testConceptId, setTestConceptId] = useState('test-concept-1')
  const [testTopicId, setTestTopicId] = useState('college-algebra')  
  const [testConceptTitle, setTestConceptTitle] = useState('Linear Equations')

  const streakStatus = getStreakStatus()

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
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Study Streak Test
          </CardTitle>
          <CardDescription>
            Test the study streak functionality by simulating concept completions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{todayCompletions}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalCompletions}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
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
              <li>• Each completion counts toward your daily streak</li>
              <li>• You need at least 1 concept per day to maintain your streak</li>
              <li>• The streak resets if you miss a day</li>
              <li>• Use "Clear Data" to reset and start fresh</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 