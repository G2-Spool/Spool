import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ExerciseSection } from './exercise-section'
import { cn } from '@/lib/utils'

interface ConceptPresentationProps {
  conceptId: string
  conceptTitle?: string
  className?: string
}

export function ConceptPresentation({ conceptId, conceptTitle, className }: ConceptPresentationProps) {
  // Mock data - in real implementation, this would come from API based on conceptId
  const conceptData = {
    title: "Solving Two-Step Linear Equations",
    subtitle: "e.g., 2x + 5 = 15",
    hooks: {
      personal: "You have a $100 gift card and want to buy a new pair of jeans for $40. You also want to buy a few books that all cost the same price. You can use a two-step equation to figure out exactly how many books you can afford with the remaining balance.",
      social: "You and your friends are planning a movie night. You spend $12 on snacks and drinks. Tickets cost $9 each. With a total budget set, you can use an equation to determine how many friends you can invite to stay within that budget.",
      career: "As an event planner, you might have a client's total budget of $5,000. If your fixed fee for planning is $500, and the cost per guest is $75, you would use a two-step equation to calculate the maximum number of guests the event can have.",
      service: "You are organizing a fundraiser to build a community garden. The project requires $1,000 for tools and lumber. Your goal is to raise $4,000 total. If you raise money by getting $50 sponsorships for each garden bed, an equation tells you exactly how many sponsorships you need to secure."
    },
    examples: [
      {
        interest: "Gaming Interest",
        scenario: "You want to buy some in-game items that cost $4 each. You also buy a one-time character skin for $7. Your total spending is $27. How many items (x) did you buy?",
        equation: "$4x + 7 = 27"
      },
      {
        interest: "Music Interest", 
        scenario: "You are saving for a $350 guitar. You already have $50 saved. If you save $25 per week (w), how many weeks will it take to afford the guitar?",
        equation: "$25w + 50 = 350"
      },
      {
        interest: "Sports Interest",
        scenario: "Your soccer team is raising money. They earned $100 from a car wash. They are also selling candy bars that make a $2 profit each (c). Their goal is to raise a total of $500. How many candy bars do they need to sell?",
        equation: "$2c + 100 = 500"
      }
    ],
    vocabulary: [
      {
        term: "Variable",
        definition: "The letter representing the unknown value you're looking for (like x)."
      },
      {
        term: "Coefficient", 
        definition: "The number attached to the variable (the 2 in 2x)."
      },
      {
        term: "Constant",
        definition: "A number without a variable (the 5 and 15 in 2x + 5 = 15)."
      }
    ],
    mentalModel: {
      title: "The \"Reverse Order of Operations\"",
      description: "Think about getting dressed: you put on socks first, then shoes. To undo it, you take off your shoes first, then your socks.",
      explanation: "In math, we follow PEMDAS (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction). To solve for an unknown, you undo the operations in the reverse order: first, undo any addition or subtraction, then undo any multiplication or division."
    },
    principle: {
      title: "Keep the Equation Balanced",
      description: "An equation is like a balanced scale. Whatever you do to one side of the equals sign (=), you must do to the other side to keep it balanced."
    },
    workflow: {
      title: "How to Solve 2x + 5 = 15",
      steps: [
        {
          step: "Goal",
          description: "Get x by itself."
        },
        {
          step: "Undo Addition/Subtraction",
          description: "The equation has \"+ 5\". Do the opposite by subtracting 5 from both sides.",
          math: ["2x + 5 - 5 = 15 - 5", "2x = 10"]
        },
        {
          step: "Undo Multiplication/Division", 
          description: "The variable x is multiplied by 2. Do the opposite by dividing both sides by 2.",
          math: ["2x / 2 = 10 / 2"]
        },
        {
          step: "Solve",
          description: "",
          math: ["x = 5"]
        }
      ]
    }
  }

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <Card className="bg-card border-border">
        <CardContent className="space-y-12 py-8">
          {/* Concept Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{conceptTitle || conceptData.title}</h1>
            <p className="text-lg text-muted-foreground">{conceptData.subtitle}</p>
          </div>

      {/* Section 1: Hook & Relevance */}
      <section className="space-y-6">
                  <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Hook & Relevance</h2>
            <p className="text-muted-foreground font-bold">Where will you ever use this?</p>
          <div className="w-full h-px bg-border"></div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Personal</h3>
            <p className="text-foreground leading-relaxed pl-4">{conceptData.hooks.personal}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Social</h3>
            <p className="text-foreground leading-relaxed pl-4">{conceptData.hooks.social}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Career</h3>
            <p className="text-foreground leading-relaxed pl-4">{conceptData.hooks.career}</p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-foreground">Service (Philanthropic)</h3>
            <p className="text-foreground leading-relaxed pl-4">{conceptData.hooks.service}</p>
          </div>
        </div>
      </section>

      {/* Section Separator */}
      <div className="w-full h-px bg-border opacity-50"></div>

      {/* Section 2: Show Me Examples */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Show Me Examples</h2>
          <p className="text-muted-foreground font-bold">See it in action</p>
          <div className="w-full h-px bg-border"></div>
        </div>

                 <div className="space-y-8">
           {conceptData.examples.map((example, index) => (
             <div key={index} className="space-y-3">
               <h3 className="text-lg font-bold text-primary">{example.interest}</h3>
               <p className="text-foreground leading-relaxed pl-4">{example.scenario}</p>
               <div className="bg-muted p-4 rounded-lg">
                 <p className="font-mono text-foreground">
                   <span className="text-muted-foreground">Equation: </span>
                   {example.equation}
                 </p>
               </div>
             </div>
           ))}
         </div>
      </section>

      {/* Section Separator */}
      <div className="w-full h-px bg-border opacity-50"></div>

      {/* Section 3: What & How */}
      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">What & How</h2>
          <p className="text-muted-foreground font-bold">The building blocks</p>
          <div className="w-full h-px bg-border"></div>
        </div>

        <div className="space-y-8">
          {/* Vocabulary */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Vocabulary</h3>
            <div className="space-y-4">
              {conceptData.vocabulary.map((item, index) => (
                <div key={index} className="space-y-1">
                  <h4 className="font-bold text-foreground">{item.term}:</h4>
                  <p className="text-foreground leading-relaxed pl-4">{item.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mental Model */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Mental Model: {conceptData.mentalModel.title}</h3>
            <div className="space-y-3">
              <p className="text-foreground leading-relaxed pl-4">{conceptData.mentalModel.description}</p>
              <p className="text-foreground leading-relaxed pl-4">{conceptData.mentalModel.explanation}</p>
            </div>
          </div>

          {/* Principle */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Principle: {conceptData.principle.title}</h3>
            <p className="text-foreground leading-relaxed pl-4">{conceptData.principle.description}</p>
          </div>

          {/* Workflow */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-foreground">Workflow: {conceptData.workflow.title}</h3>
            <div className="space-y-6">
              {conceptData.workflow.steps.map((step, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div className="space-y-2">
                      <h4 className="font-bold text-foreground">{step.step}:</h4>
                      {step.description && (
                        <p className="text-foreground leading-relaxed pl-4">{step.description}</p>
                      )}
                      {step.math && (
                        <div className="space-y-1">
                          {step.math.map((equation, mathIndex) => (
                            <div key={mathIndex} className="bg-muted p-3 rounded-lg">
                              <p className="font-mono text-foreground">{equation}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Exercise Section */}
      <ExerciseSection conceptId={conceptId} />
        </CardContent>
      </Card>
    </div>
  )
} 