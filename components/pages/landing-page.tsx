"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import HeroGeometric from "@/components/ui/hero-geometric"
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Zap,
  ChevronDown,
  Play,
  Star,
  Heart,
  Lightbulb,
  Code
} from "lucide-react"
import { signIn } from 'aws-amplify/auth'

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDemoLogin = async () => {
    setIsDemoLoading(true)
    try {
      // Attempt to sign in with demo credentials
      const { isSignedIn } = await signIn({
        username: 'demo@spool.ai',
        password: 'DemoUser123!'
      })
      
      if (isSignedIn) {
        console.log("Demo login successful")
        // Complete all the onboarding flags for a smooth demo experience
        localStorage.setItem("visited-landing", "true")
        localStorage.setItem("splash-completed", "true")
        localStorage.setItem("onboarding-complete", "true")
        // Navigate to dashboard
        onGetStarted()
      }
    } catch (error) {
      console.error("Demo login failed:", error)
      // If demo account doesn't exist or login fails, just proceed normally
      // This allows the button to work even without a configured demo account
      console.log("Proceeding with normal flow (demo account not configured)")
      onGetStarted()
    } finally {
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={scrollToTop}>
            <img src="/spool-logo.png" alt="Spool" className="h-16 w-16" />
            <span className="text-4xl font-bold text-foreground">Spool</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={scrollToAbout}
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </Button>
            <Button 
              variant="ghost" 
              onClick={scrollToFeatures}
              className="text-foreground hover:text-primary transition-colors"
            >
              Features
            </Button>
            <Button 
              variant="outline"
              onClick={handleDemoLogin}
              disabled={isDemoLoading}
              className="hover:shadow-md transition-all duration-300 gap-2"
            >
              <Code className="w-4 h-4" />
              {isDemoLoading ? "Loading Demo..." : "Development Mode"}
            </Button>
            <Button 
              onClick={onGetStarted}
              variant="default"
              className="hover:shadow-lg transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - New Geometric Design */}
      <HeroGeometric 
        badge="AI-Powered Learning Platform"
        title1="Learn Through"
        title2="Your Passions"
      />

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <button
          onClick={scrollToFeatures}
          className="p-2 rounded-full hover:bg-muted/20 transition-all duration-200 cursor-pointer"
          style={{
            animation: 'bounce 1.5s infinite',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animation = 'none';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animation = 'bounce 1.5s infinite';
          }}
          aria-label="Scroll to features"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      {/* Features Section */}
      <section id="features-section" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Why Students Love <span className="text-primary">Spool</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience learning like never before with our revolutionary approach to education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Personalized Learning</h3>
                <p className="text-muted-foreground">
                  AI adapts every lesson to your interests, learning style, and pace. No more one-size-fits-all education.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Real-World Connections</h3>
                <p className="text-muted-foreground">
                  See how physics applies to your guitar, how math powers your favorite games, and how history shapes your world.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Instant Engagement</h3>
                <p className="text-muted-foreground">
                  From day one, learning feels exciting and relevant. Watch your motivation soar as subjects come alive.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="about-section" className="py-24 px-6 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">98%</div>
              <div className="text-muted-foreground">Student Satisfaction</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground">Active Learners</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">50+</div>
              <div className="text-muted-foreground">Subject Areas</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-muted-foreground">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students who've discovered the joy of learning through their passions
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="text-lg px-12 py-6 group hover:shadow-2xl transition-all duration-300"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-12 py-6 hover:shadow-lg transition-all duration-300"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 