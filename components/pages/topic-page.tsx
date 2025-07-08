"use client"

import React, { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConceptList } from "../organisms/concept-list"
import { SectionNavigation } from "../organisms/section-navigation"
import { LearningPage } from "./learning-page"

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

// Subject color mapping - matches the colors from classes-page.tsx
const getSubjectColorForTopic = (topicId: string) => {
  const topicToSubjectMap: Record<string, { gradient: string; shadowColor: string }> = {
    // Math topics
    "college-algebra": {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadowColor: "rgba(59, 130, 246, 0.4)" // blue-500 with 40% opacity
    },
    "statistics": {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadowColor: "rgba(59, 130, 246, 0.4)" // blue-500 with 40% opacity
    },
    // Literature topics
    "writing": {
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      shadowColor: "rgba(236, 72, 153, 0.4)" // pink-500 with 40% opacity
    },
    // Humanities topics
    "philosophy": {
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      shadowColor: "rgba(6, 182, 212, 0.4)" // cyan-500 with 40% opacity
    },
    "world-history": {
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      shadowColor: "rgba(6, 182, 212, 0.4)" // cyan-500 with 40% opacity
    },
    // Science topics
    "biology": {
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      shadowColor: "rgba(34, 197, 94, 0.4)" // green-500 with 40% opacity
    },
    "anatomy": {
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      shadowColor: "rgba(34, 197, 94, 0.4)" // green-500 with 40% opacity
    },
    // Default for unknown topics (like data-structures-algorithms)
    "data-structures-algorithms": {
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      shadowColor: "rgba(59, 130, 246, 0.4)" // blue-500 with 40% opacity
    }
  }

  return topicToSubjectMap[topicId] || {
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    shadowColor: "rgba(59, 130, 246, 0.4)" // blue-500 with 40% opacity
  }
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
          id: "prerequisites",
          title: "Prerequisites",
          description: "Fundamental algebraic concepts and skills",
          concepts: [
            {
              id: "real-numbers",
              title: "Real Numbers: Algebra Essentials",
              description: "Properties of real numbers, number systems, and algebraic operations",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "exponents-scientific-notation",
              title: "Exponents and Scientific Notation",
              description: "Rules of exponents and scientific notation applications",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "radicals-rational-exponents",
              title: "Radicals and Rational Exponents",
              description: "Working with radicals and rational exponents",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "polynomials",
              title: "Polynomials",
              description: "Polynomial operations and properties",
              completed: false,
              locked: false,
              progress: 75
            },
            {
              id: "factoring-polynomials",
              title: "Factoring Polynomials",
              description: "Techniques for factoring various polynomial expressions",
              completed: false,
              locked: false,
              progress: 50
            },
            {
              id: "rational-expressions",
              title: "Rational Expressions",
              description: "Simplifying and operating with rational expressions",
              completed: false,
              locked: false,
              progress: 25
            }
          ]
        },
        {
          id: "equations-inequalities",
          title: "Equations and Inequalities",
          description: "Solving equations and inequalities in one variable",
          concepts: [
            {
              id: "rectangular-coordinate-systems",
              title: "The Rectangular Coordinate Systems and Graphs",
              description: "Coordinate plane, distance formula, and graphing basics",
              completed: false,
              locked: false,
              progress: 60
            },
            {
              id: "linear-equations-one-variable",
              title: "Linear Equations in One Variable",
              description: "Solving linear equations and understanding solution sets",
              completed: false,
              locked: false,
              progress: 45
            },
            {
              id: "models-applications",
              title: "Models and Applications",
              description: "Real-world problem solving with algebraic models",
              completed: false,
              locked: false,
              progress: 30
            },
            {
              id: "complex-numbers",
              title: "Complex Numbers",
              description: "Operations with complex numbers and their properties",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "quadratic-equations",
              title: "Quadratic Equations",
              description: "Solving quadratic equations using various methods",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "other-types-equations",
              title: "Other Types of Equations",
              description: "Rational, radical, and absolute value equations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "linear-inequalities-absolute-value",
              title: "Linear Inequalities and Absolute Value Inequalities",
              description: "Solving compound and absolute value inequalities",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "functions",
          title: "Functions",
          description: "Introduction to functions and their properties",
          concepts: [
            {
              id: "functions-notation",
              title: "Functions and Function Notation",
              description: "Definition of functions and function notation",
              completed: false,
              locked: false,
              progress: 25
            },
            {
              id: "domain-range",
              title: "Domain and Range",
              description: "Determining domain and range of functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rates-change-behavior",
              title: "Rates of Change and Behavior of Graphs",
              description: "Analyzing function behavior and rates of change",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "composition-functions",
              title: "Composition of Functions",
              description: "Combining functions and function composition",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "transformation-functions",
              title: "Transformation of Functions",
              description: "Shifting, stretching, and reflecting functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "absolute-value-functions",
              title: "Absolute Value Functions",
              description: "Properties and graphs of absolute value functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "inverse-functions",
              title: "Inverse Functions",
              description: "Finding and working with inverse functions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "linear-functions",
          title: "Linear Functions",
          description: "Properties and applications of linear functions",
          concepts: [
            {
              id: "linear-functions-basics",
              title: "Linear Functions",
              description: "Properties and characteristics of linear functions",
              completed: false,
              locked: false,
              progress: 15
            },
            {
              id: "modeling-linear-functions",
              title: "Modeling with Linear Functions",
              description: "Using linear functions to model real-world situations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fitting-linear-models",
              title: "Fitting Linear Models to Data",
              description: "Regression analysis and best-fit lines",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "polynomial-rational-functions",
          title: "Polynomial and Rational Functions",
          description: "Advanced study of polynomial and rational functions",
          concepts: [
            {
              id: "quadratic-functions",
              title: "Quadratic Functions",
              description: "Properties and graphs of quadratic functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "power-polynomial-functions",
              title: "Power Functions and Polynomial Functions",
              description: "General polynomial functions and their properties",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "graphs-polynomial-functions",
              title: "Graphs of Polynomial Functions",
              description: "Analyzing and sketching polynomial graphs",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "dividing-polynomials",
              title: "Dividing Polynomials",
              description: "Polynomial division techniques",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "zeros-polynomial-functions",
              title: "Zeros of Polynomial Functions",
              description: "Finding roots and zeros of polynomial functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rational-functions",
              title: "Rational Functions",
              description: "Properties and graphs of rational functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "inverses-radical-functions",
              title: "Inverses and Radical Functions",
              description: "Inverse functions and radical function properties",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "modeling-using-variation",
              title: "Modeling Using Variation",
              description: "Direct, inverse, and joint variation models",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "exponential-logarithmic-functions",
          title: "Exponential and Logarithmic Functions",
          description: "Exponential and logarithmic functions and their applications",
          concepts: [
            {
              id: "exponential-functions",
              title: "Exponential Functions",
              description: "Properties and applications of exponential functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "graphs-exponential-functions",
              title: "Graphs of Exponential Functions",
              description: "Analyzing exponential function graphs",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "logarithmic-functions",
              title: "Logarithmic Functions",
              description: "Properties and applications of logarithmic functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "graphs-logarithmic-functions",
              title: "Graphs of Logarithmic Functions",
              description: "Analyzing logarithmic function graphs",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "logarithmic-properties",
              title: "Logarithmic Properties",
              description: "Properties and rules of logarithms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exponential-logarithmic-equations",
              title: "Exponential and Logarithmic Equations",
              description: "Solving exponential and logarithmic equations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exponential-logarithmic-models",
              title: "Exponential and Logarithmic Models",
              description: "Real-world applications and modeling",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fitting-exponential-models",
              title: "Fitting Exponential Models to Data",
              description: "Using exponential functions to model data sets",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "systems-equations-inequalities",
          title: "Systems of Equations and Inequalities",
          description: "Solving systems of equations and inequalities",
          concepts: [
            {
              id: "systems-linear-two-variables",
              title: "Systems of Linear Equations: Two Variables",
              description: "Methods for solving two-variable linear systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "systems-linear-three-variables",
              title: "Systems of Linear Equations: Three Variables",
              description: "Solving three-variable linear systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "systems-nonlinear-equations",
              title: "Systems of Nonlinear Equations and Inequalities: Two Variables",
              description: "Solving nonlinear systems and inequalities with two variables",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "partial-fractions",
              title: "Partial Fractions",
              description: "Decomposing rational functions using partial fractions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "matrices-solving-systems",
              title: "Matrices and Matrix Operations",
              description: "Using matrices to solve systems of equations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "solving-systems-gaussian-elimination",
              title: "Solving Systems with Gaussian Elimination",
              description: "Row reduction method for solving linear systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "solving-systems-inverses",
              title: "Solving Systems with Inverses",
              description: "Using matrix inverses to solve linear systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "solving-systems-cramers-rule",
              title: "Solving Systems with Cramer's Rule",
              description: "Using determinants and Cramer's rule for solving systems",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "analytic-geometry",
          title: "Analytic Geometry",
          description: "Conic sections and their properties",
          concepts: [
            {
              id: "ellipse",
              title: "The Ellipse",
              description: "Properties and equations of ellipses",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hyperbola",
              title: "The Hyperbola",
              description: "Properties and equations of hyperbolas",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "parabola",
              title: "The Parabola",
              description: "Properties and equations of parabolas",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rotation-axes",
              title: "Rotation of Axes",
              description: "Rotating coordinate systems for conic sections",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "conic-sections-polar",
              title: "Conic Sections in Polar Coordinates",
              description: "Representing conic sections in polar form",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "sequences-probability",
          title: "Sequences, Probability, and Counting Theory",
          description: "Sequences, series, and probability concepts",
          concepts: [
            {
              id: "sequences-notations",
              title: "Sequences and Their Notations",
              description: "Introduction to sequences and notation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "arithmetic-sequences",
              title: "Arithmetic Sequences",
              description: "Properties and formulas for arithmetic sequences",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "geometric-sequences",
              title: "Geometric Sequences",
              description: "Properties and formulas for geometric sequences",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "series-notations",
              title: "Series and Their Notations",
              description: "Introduction to series and summation notation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "counting-principles",
              title: "Counting Principles",
              description: "Fundamental counting techniques",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "binomial-theorem",
              title: "Binomial Theorem",
              description: "Expanding binomial expressions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "probability",
              title: "Probability",
              description: "Basic probability concepts and calculations",
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
  const [activeConcept, setActiveConcept] = useState<{ id: string; title: string } | null>(null)
  
  // Ensure topicId is a string and handle potential undefined cases
  const safeTopicId = typeof topicId === 'string' ? topicId : 'unknown'
  
  // Use mock data if no sections provided, otherwise use provided data
  const topicData = sections && sections.length > 0 ? { title, sections } : getTopicData(safeTopicId)
  const currentSection = topicData?.sections?.find(section => section.id === activeSection)
  
  // Get subject colors for this topic
  const subjectColors = getSubjectColorForTopic(safeTopicId)

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
    // Find the concept to get its title
    const concept = topicData.sections
      .flatMap(section => section.concepts || [])
      .find(c => c.id === conceptId)
    
    if (concept) {
      setActiveConcept({ id: conceptId, title: concept.title })
    }
  }

  const handleBackFromLearning = () => {
    setActiveConcept(null)
  }

  // Show learning page if concept is active
  if (activeConcept) {
    return (
      <LearningPage
        conceptId={activeConcept.id}
        conceptTitle={activeConcept.title}
        onBack={handleBackFromLearning}
      />
    )
  }

  return (
    <div className="space-y-0">
      {/* Colored Banner with Title */}
      <div 
        className="text-white -mx-6 -mt-6 px-6 py-16 relative"
        style={{ background: subjectColors.gradient }}
      >
        <div className="absolute left-4 top-4">
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold">{topicData.title}</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 -mt-16">
              <Card 
                className="transition-all duration-300 hover:shadow-2xl hover:drop-shadow-2xl"
                style={{
                  '--hover-shadow': `0 25px 50px -12px ${subjectColors.shadowColor}`,
                  '&:hover': {
                    boxShadow: `0 25px 50px -12px ${subjectColors.shadowColor}`
                  }
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 25px 50px -12px ${subjectColors.shadowColor}`
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = ''
                }}
              >
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
          <div className="lg:col-span-2">
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
    </div>
  )
} 