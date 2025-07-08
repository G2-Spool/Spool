"use client"

import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConceptList } from "../organisms/concept-list"
import { SectionNavigation } from "../organisms/section-navigation"

interface TopicPageProps {
  topicId: string
  title: string
  sections: Section[]
  onBack?: () => void
}

interface Section {
  id: string
  title: string
  description?: string
  concepts?: Concept[]
  content?: string
}

interface Concept {
  id: string
  title: string
  description: string
  completed: boolean
  locked: boolean
  progress: number
}

// Comprehensive mock data with rich content for multiple subjects
const getTopicData = (topicId: string) => {
  const topicDataMap: Record<string, { title: string; sections: Section[] }> = {
    "college-algebra": {
      title: "College Algebra",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Course introduction and overview",
          content: `College Algebra is a fundamental course that builds upon basic algebraic concepts to prepare students for more advanced mathematics courses.

This course covers essential topics including functions, equations, inequalities, and graphing. Students will develop problem-solving skills and mathematical reasoning abilities.

The course emphasizes practical applications of algebraic concepts in real-world scenarios, helping students understand the relevance of mathematics in their daily lives and future careers.

By the end of this course, you'll have a solid foundation in algebraic thinking and be prepared for calculus and other advanced mathematics courses.

Prerequisites: Intermediate Algebra or equivalent
Duration: 16 weeks
Credits: 3 credit hours`
        },
        {
          id: "real-numbers",
          title: "Real Numbers and Algebraic Expressions",
          description: "Fundamental properties of real numbers and basic algebraic manipulations",
          concepts: [
            {
              id: "number-systems",
              title: "Number Systems",
              description: "Natural numbers, integers, rational and irrational numbers",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "order-operations",
              title: "Order of Operations",
              description: "PEMDAS and evaluating algebraic expressions",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "properties-real-numbers",
              title: "Properties of Real Numbers",
              description: "Commutative, associative, and distributive properties",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "simplifying-expressions",
              title: "Simplifying Algebraic Expressions",
              description: "Combining like terms and using properties",
              completed: false,
              locked: false,
              progress: 75
            }
          ]
        },
        {
          id: "linear-equations",
          title: "Linear Equations and Inequalities",
          description: "Solving linear equations and inequalities in one variable",
          concepts: [
            {
              id: "solving-linear-equations",
              title: "Solving Linear Equations",
              description: "One-step, two-step, and multi-step linear equations",
              completed: false,
              locked: false,
              progress: 60
            },
            {
              id: "literal-equations",
              title: "Literal Equations and Formulas",
              description: "Solving for specified variables in formulas",
              completed: false,
              locked: false,
              progress: 40
            },
            {
              id: "applications-linear-equations",
              title: "Applications of Linear Equations",
              description: "Word problems and real-world applications",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "linear-inequalities",
              title: "Linear Inequalities",
              description: "Solving and graphing linear inequalities",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "quadratic-equations",
          title: "Quadratic Equations and Functions",
          description: "Solving quadratic equations and analyzing quadratic functions",
          concepts: [
            {
              id: "solving-quadratics-factoring",
              title: "Solving by Factoring",
              description: "Using factoring to solve quadratic equations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "completing-square",
              title: "Completing the Square",
              description: "Solving quadratics by completing the square",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "quadratic-formula",
              title: "The Quadratic Formula",
              description: "Using the quadratic formula to solve equations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "quadratic-functions",
              title: "Quadratic Functions",
              description: "Graphing parabolas and finding key features",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "statistics": {
      title: "Statistics",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Introduction to statistical methods and applications",
          content: `Statistics is the science of collecting, analyzing, interpreting, and presenting data. This course provides a comprehensive introduction to statistical methods and their applications.

Students will learn to describe data using measures of central tendency and variability, understand probability concepts, and make inferences about populations based on sample data.

The course emphasizes practical applications of statistical concepts in various fields including business, science, and social sciences.

By the end of this course, you'll be able to analyze data critically and make informed decisions based on statistical evidence.`
        },
        {
          id: "descriptive-statistics",
          title: "Descriptive Statistics",
          description: "Describing and summarizing data",
          concepts: [
            {
              id: "measures-center",
              title: "Measures of Central Tendency",
              description: "Mean, median, and mode",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "measures-spread",
              title: "Measures of Spread",
              description: "Range, variance, and standard deviation",
              completed: false,
              locked: false,
              progress: 60
            },
            {
              id: "data-visualization",
              title: "Data Visualization",
              description: "Histograms, box plots, and scatter plots",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "probability",
          title: "Probability Theory",
          description: "Fundamental concepts of probability",
          concepts: [
            {
              id: "basic-probability",
              title: "Basic Probability",
              description: "Sample spaces, events, and probability rules",
              completed: false,
              locked: false,
              progress: 30
            },
            {
              id: "conditional-probability",
              title: "Conditional Probability",
              description: "Bayes' theorem and independence",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "data-structures-algorithms": {
      title: "Data Structures and Algorithms",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Introduction to DSA with focus on coding interviews",
          content: `This is a data structures and algorithms (DSA) course with a strong focus on passing coding interviews for software engineering jobs.

Most DSA courses - including those offered in universities, tend to concentrate on theoretical concepts that don't matter in an interview. Most of the time, these courses present zero or few examples of problems you would see in an interview.

This course takes a very pragmatic approach to teaching DSA. The course is primarily taught through examples - it includes hundreds of carefully curated problems that show up in actual interviews. These examples are delivered through a balanced mix of walkthroughs and exercises. You will learn by doing.

Everything you need to pass coding interviews is here in one place. We will not dwell on theoretical details or waste time on concepts that won't help you pass an interview. The goal of this course is to get you a job, not pass an exam.

Regardless of your initial skill level, you should be comfortable with preparing for and passing coding interviews at tech companies after taking this course. If your target is top-tier companies like FAANG, taking this course will set you up with all the fundamentals necessary to prepare for those interviews.`
        },
        {
          id: "introduction",
          title: "Introduction",
          description: "Before we start the course, let's talk about some basics that you'll need to succeed.",
          concepts: [
            {
              id: "testimonials",
              title: "Testimonials",
              description: "Student success stories and feedback",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "intro-big-o",
              title: "Introduction to big O",
              description: "Understanding algorithmic complexity",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "intro-recursion",
              title: "Introduction to recursion",
              description: "Fundamental recursive concepts",
              completed: false,
              locked: false,
              progress: 25
            },
            {
              id: "notes-before-starting",
              title: "Notes before starting",
              description: "Important preparation notes",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "arrays-strings",
          title: "Arrays and strings",
          description: "Arrays and strings are two of the most fundamental data structures.",
          concepts: [
            {
              id: "array-basics",
              title: "Array Basics",
              description: "Understanding arrays and their operations",
              completed: false,
              locked: false,
              progress: 45
            },
            {
              id: "string-manipulation",
              title: "String Manipulation",
              description: "Common string operations and algorithms",
              completed: false,
              locked: false,
              progress: 20
            },
            {
              id: "two-pointers",
              title: "Two Pointers Technique",
              description: "Efficient array traversal patterns",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "writing": {
      title: "Writing",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Comprehensive writing course for creative and academic writing",
          content: `This comprehensive writing course is designed to help you develop creative and academic writing skills across various genres and formats.

You'll learn the fundamentals of effective writing including structure, style, voice, and audience awareness. The course covers both creative and analytical writing techniques.

Through practical exercises and guided practice, you'll develop confidence in expressing your ideas clearly and persuasively in written form.

By the end of this course, you'll have a strong foundation in writing principles and the ability to adapt your writing style to different purposes and audiences.`
        },
        {
          id: "fundamentals",
          title: "Writing Fundamentals",
          description: "Basic principles of effective writing",
          concepts: [
            {
              id: "structure",
              title: "Essay Structure",
              description: "Learn to organize your ideas effectively",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "grammar",
              title: "Grammar and Style",
              description: "Master grammar rules and writing style",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "philosophy": {
      title: "Philosophy",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Introduction to philosophical thinking and major traditions",
          content: `Philosophy explores fundamental questions about existence, knowledge, values, reason, mind, and ethics. This course provides an introduction to major philosophical traditions and thinkers.

You'll examine classic philosophical problems and learn to think critically about complex issues. The course covers major areas including metaphysics, epistemology, ethics, and logic.

Through reading primary texts and engaging in philosophical dialogue, you'll develop analytical thinking skills and learn to construct and evaluate arguments.

By the end of this course, you'll have a solid foundation in philosophical thinking and be able to engage thoughtfully with life's biggest questions.`
        },
        {
          id: "ancient-philosophy",
          title: "Ancient Philosophy",
          description: "Explore the foundations of Western philosophical thought",
          concepts: [
            {
              id: "socrates",
              title: "Socrates and the Examined Life",
              description: "Learn about Socratic questioning and ethics",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "plato",
              title: "Plato's Theory of Forms",
              description: "Understand Plato's metaphysical theories",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "world-history": {
      title: "World History",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Journey through major events and civilizations",
          content: `World History takes you on a journey through the major events, civilizations, and developments that have shaped human society across the globe.

This course examines the interconnected nature of world cultures and civilizations, from ancient times to the present day. You'll explore political, social, economic, and cultural developments across different regions.

Through studying primary sources and historical evidence, you'll develop skills in historical thinking and analysis. The course emphasizes understanding how past events continue to influence our world today.

By the end of this course, you'll have a comprehensive understanding of world history and the ability to think critically about historical events and their significance.`
        },
        {
          id: "ancient-civilizations",
          title: "Ancient Civilizations",
          description: "Explore the earliest human civilizations",
          concepts: [
            {
              id: "mesopotamia",
              title: "Ancient Mesopotamia",
              description: "Study the cradle of civilization",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "egypt",
              title: "Ancient Egypt",
              description: "Explore Egyptian civilization and culture",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "biology": {
      title: "Biology",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Scientific study of living organisms",
          content: `Biology is the scientific study of living organisms and their interactions with the environment. This course provides a comprehensive introduction to biological concepts and processes.

You'll explore the fundamental principles of life, from the molecular level to entire ecosystems. The course covers cell biology, genetics, evolution, ecology, and human biology.

Through laboratory work and field studies, you'll develop scientific thinking skills and learn to apply the scientific method to biological questions.

By the end of this course, you'll have a solid foundation in biological science and understand how living systems function and interact.`
        },
        {
          id: "cell-biology",
          title: "Cell Biology",
          description: "Study the basic unit of life",
          concepts: [
            {
              id: "cell-structure",
              title: "Cell Structure and Function",
              description: "Learn about cellular components and their roles",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "metabolism",
              title: "Cellular Metabolism",
              description: "Understand how cells obtain and use energy",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "anatomy": {
      title: "Anatomy",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Study of human body structure and organization",
          content: `Human Anatomy is the study of the structure and organization of the human body. This course provides a systematic examination of all body systems and their interrelationships.

You'll learn about the structure and function of organs, tissues, and systems that make up the human body. The course covers all major body systems including skeletal, muscular, cardiovascular, nervous, and more.

Through detailed study of anatomical structures and their relationships, you'll develop a comprehensive understanding of human body organization.

By the end of this course, you'll have detailed knowledge of human anatomy and understand how structure relates to function in the human body.`
        },
        {
          id: "skeletal-system",
          title: "Skeletal System",
          description: "Study bones, joints, and skeletal function",
          concepts: [
            {
              id: "bone-structure",
              title: "Bone Structure and Function",
              description: "Learn about bone anatomy and physiology",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "joints",
              title: "Joints and Movement",
              description: "Understand joint classification and movement",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    }
  }

  return topicDataMap[topicId] || {
    title: "Topic Not Found",
    sections: [
      {
        id: "overview",
        title: "Overview",
        description: "This topic could not be found.",
        content: "The requested topic is not available. Please check the topic ID or go back to the classes page."
      }
    ]
  }
}

export function TopicPage({ topicId, title, sections, onBack }: TopicPageProps) {
  const [activeSection, setActiveSection] = useState("overview")
  
  // Ensure topicId is a string and handle potential undefined cases
  const safeTopicId = typeof topicId === 'string' ? topicId : 'unknown'
  
  // Use mock data if no sections provided, otherwise use provided data
  const topicData = sections && sections.length > 0 ? { title, sections } : getTopicData(safeTopicId)
  const currentSection = topicData?.sections?.find(section => section.id === activeSection)

  // Early return if no topic data
  if (!topicData || !topicData.sections || topicData.sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Topic Data Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Could not load data for topic: "{safeTopicId}"
          </p>
          <Button onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>
      </div>
    )
  }

  const handleConceptClick = (conceptId: string) => {
    // TODO: Navigate to concept details or start learning
    console.log(`Opening concept: ${conceptId}`)
  }

  return (
    <div className="space-y-0">
      {/* Colored Banner with Title */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white -mx-6 -mt-6 px-6 py-12">
        <div className="max-w-7xl mx-auto relative">
          <div className="absolute left-0 top-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Classes
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold">{topicData.title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <Card className="transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50 hover:drop-shadow-2xl">
                <CardContent className="p-0">
                  <SectionNavigation
                    sections={topicData.sections}
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {currentSection ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{currentSection.title}</h2>
                  {currentSection.description && (
                    <p className="text-muted-foreground text-base">{currentSection.description}</p>
                  )}
                </div>

                {currentSection.content && (
                  <div className="prose prose-lg max-w-none">
                    {currentSection.content.split('\n\n').map((paragraph: string, index: number) => (
                      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}

                {currentSection.concepts && currentSection.concepts.length > 0 && (
                  <ConceptList
                    concepts={currentSection.concepts}
                    onConceptClick={handleConceptClick}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">Section not found</h2>
                <p className="text-muted-foreground mb-4">
                  The selected section "{activeSection}" could not be found.
                </p>
                {topicData?.sections?.length > 0 && (
                  <Button onClick={() => setActiveSection(topicData.sections[0].id)}>
                    Go to first section ({topicData.sections[0].title})
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 