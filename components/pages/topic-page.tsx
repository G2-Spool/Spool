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
          id: "sampling-data",
          title: "Sampling and Data",
          description: "Introduction to data collection and sampling methods",
          concepts: [
            {
              id: "definitions-statistical-probability",
              title: "Definitions of Statistics, Probability, and Key Terms",
              description: "Basic statistical terminology and concepts",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "data-sampling-variation",
              title: "Data, Sampling, and Variation in Data and Sampling",
              description: "Understanding different types of data and sampling methods",
              completed: true,
              locked: false,
              progress: 100
            },
            {
              id: "frequency-frequency-tables",
              title: "Frequency, Frequency Tables, and Levels of Measurement",
              description: "Organizing data and understanding measurement scales",
              completed: false,
              locked: false,
              progress: 75
            },
            {
              id: "experimental-design-ethics",
              title: "Experimental Design and Ethics",
              description: "Principles of experimental design and research ethics",
              completed: false,
              locked: false,
              progress: 50
            },
            {
              id: "data-collection-experiment",
              title: "Data Collection Experiment",
              description: "Hands-on data collection and experimental design",
              completed: false,
              locked: false,
              progress: 25
            },
            {
              id: "sampling-experiment",
              title: "Sampling Experiment",
              description: "Understanding sampling distributions through experimentation",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "descriptive-statistics",
          title: "Descriptive Statistics",
          description: "Summarizing and describing data",
          concepts: [
            {
              id: "stem-and-leaf-graphs",
              title: "Stem-and-Leaf Graphs (Stemplots), Line Graphs, and Bar Graphs",
              description: "Basic graphical displays of data",
              completed: false,
              locked: false,
              progress: 60
            },
            {
              id: "histograms-frequency-polygons",
              title: "Histograms, Frequency Polygons, and Time Series Graphs",
              description: "Advanced graphical displays and time-based data",
              completed: false,
              locked: false,
              progress: 45
            },
            {
              id: "measures-location",
              title: "Measures of the Location of the Data",
              description: "Percentiles, quartiles, and measures of position",
              completed: false,
              locked: false,
              progress: 30
            },
            {
              id: "box-plots",
              title: "Box Plots",
              description: "Five-number summary and outlier detection",
              completed: false,
              locked: false,
              progress: 15
            },
            {
              id: "measures-center",
              title: "Measures of the Center of the Data",
              description: "Mean, median, and mode",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "skewness-mean-median-mode",
              title: "Skewness and the Mean, Median, and Mode",
              description: "Understanding distribution shape and central tendency",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "measures-spread",
              title: "Measures of the Spread of the Data",
              description: "Range, variance, and standard deviation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "descriptive-statistics",
              title: "Descriptive Statistics",
              description: "Applications and summary of descriptive statistics",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "probability-topics",
          title: "Probability Topics",
          description: "Fundamental concepts of probability",
          concepts: [
            {
              id: "terminology",
              title: "Terminology",
              description: "Basic probability terminology and notation",
              completed: false,
              locked: false,
              progress: 25
            },
            {
              id: "independent-mutually-exclusive",
              title: "Independent and Mutually Exclusive Events",
              description: "Understanding different types of events",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "two-basic-rules",
              title: "Two Basic Rules of Probability",
              description: "Addition and multiplication rules",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "contingency-tables",
              title: "Contingency Tables",
              description: "Joint and conditional probabilities using tables",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "tree-venn-diagrams",
              title: "Tree and Venn Diagrams",
              description: "Visual representations of probability",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "probability-topics",
              title: "Probability Topics",
              description: "Advanced probability concepts and applications",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "discrete-random-variables",
          title: "Discrete Random Variables",
          description: "Random variables with discrete outcomes",
          concepts: [
            {
              id: "probability-distribution-function",
              title: "Probability Distribution Function (PDF) for a Discrete Random Variable",
              description: "Defining and working with discrete probability distributions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "mean-expected-value",
              title: "Mean or Expected Value and Standard Deviation",
              description: "Calculating central tendency and spread for discrete variables",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "binomial-distribution",
              title: "Binomial Distribution",
              description: "Fixed number of independent trials",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "geometric-distribution",
              title: "Geometric Distribution",
              description: "Number of trials until first success",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hypergeometric-distribution",
              title: "Hypergeometric Distribution",
              description: "Sampling without replacement scenarios",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "poisson-distribution",
              title: "Poisson Distribution",
              description: "Rate of occurrence over time or space",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "discrete-distribution-playing-card",
              title: "Discrete Distribution (Playing Card Experiment)",
              description: "Exploring discrete distributions using playing cards",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "discrete-distribution-dice",
              title: "Discrete Distribution (Dice Experiment Using Three Regular Dice)",
              description: "Analyzing discrete distributions with three-dice experiments",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "continuous-random-variables",
          title: "Continuous Random Variables",
          description: "Random variables with continuous outcomes",
          concepts: [
            {
              id: "continuous-probability-functions",
              title: "Continuous Probability Functions",
              description: "Properties of continuous distributions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "uniform-distribution",
              title: "The Uniform Distribution",
              description: "Equally likely outcomes over an interval",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exponential-distribution",
              title: "The Exponential Distribution",
              description: "Time between events in a Poisson process",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "continuous-distribution",
              title: "Continuous Distribution",
              description: "Applications and summary of continuous distributions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "normal-distribution",
          title: "The Normal Distribution",
          description: "The most important continuous distribution",
          concepts: [
            {
              id: "standard-normal-distribution",
              title: "The Standard Normal Distribution",
              description: "Properties and characteristics of the standard normal distribution",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "using-normal-distribution",
              title: "Using the Normal Distribution",
              description: "Applications and calculations with normal distributions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "normal-distribution-lap-times",
              title: "Normal Distribution (Lap Times)",
              description: "Real-world application using lap time data",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "normal-distribution-pinkie-length",
              title: "Normal Distribution (Pinkie Length)",
              description: "Real-world application using pinkie length measurements",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "central-limit-theorem",
          title: "The Central Limit Theorem",
          description: "Foundation of statistical inference",
          concepts: [
            {
              id: "central-limit-theorem-sample-means",
              title: "The Central Limit Theorem for Sample Means (Averages)",
              description: "Distribution of sample means",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "central-limit-theorem-proportions",
              title: "The Central Limit Theorem for Sums",
              description: "Distribution of sample sums",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "using-central-limit-theorem",
              title: "Using the Central Limit Theorem",
              description: "Applications and practical use",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "central-limit-theorem-pocket-change",
              title: "Central Limit Theorem (Pocket Change)",
              description: "Real-world application using pocket change data",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "central-limit-theorem-cookie-recipes",
              title: "Central Limit Theorem (Cookie Recipes)",
              description: "Real-world application using cookie recipe measurements",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "confidence-intervals",
          title: "Confidence Intervals",
          description: "Estimating population parameters",
          concepts: [
            {
              id: "single-population-mean-normal",
              title: "A Single Population Mean using the Normal Distribution",
              description: "Confidence intervals when σ is known",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "single-population-mean-t-distribution",
              title: "A Single Population Mean using the Student t Distribution",
              description: "Confidence intervals when σ is unknown",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "population-proportion",
              title: "A Population Proportion",
              description: "Confidence intervals for proportions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "confidence-interval-home-costs",
              title: "Confidence Interval (Home Costs)",
              description: "Real-world application using home cost data",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "confidence-interval-place-of-birth",
              title: "Confidence Interval (Place of Birth)",
              description: "Real-world application using place of birth data",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "confidence-interval-womens-heights",
              title: "Confidence Interval (Women's Heights)",
              description: "Real-world application using women's height measurements",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "hypothesis-testing-one-sample",
          title: "Hypothesis Testing with One Sample",
          description: "Testing claims about population parameters",
          concepts: [
            {
              id: "null-alternative-hypotheses",
              title: "Null and Alternative Hypotheses",
              description: "Setting up hypothesis tests",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "outcomes-errors",
              title: "Outcomes and the Type I and Type II Errors",
              description: "Understanding test results and errors",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "distribution-needed-test",
              title: "Distribution Needed for Hypothesis Testing",
              description: "Choosing the appropriate test statistic",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rare-events",
              title: "Rare Events, the Sample, Decision and Conclusion",
              description: "Making decisions from hypothesis tests",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "additional-information-p-values",
              title: "Additional Information and Full Hypothesis Test Examples",
              description: "Complete hypothesis testing procedures",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hypothesis-testing-single-mean-proportion",
              title: "Hypothesis Testing of a Single Mean and Single Proportion",
              description: "Comprehensive hypothesis testing applications",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "hypothesis-testing-two-samples",
          title: "Hypothesis Testing with Two Samples",
          description: "Comparing two populations",
          concepts: [
            {
              id: "two-population-means",
              title: "Two Population Means with Unknown Standard Deviations",
              description: "Comparing means from two groups",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "two-population-means-known",
              title: "Two Population Means with Known Standard Deviations",
              description: "Comparing means when σ is known",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "comparing-two-proportions",
              title: "Comparing Two Independent Population Proportions",
              description: "Testing differences in proportions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "matched-paired-samples",
              title: "Matched or Paired Samples",
              description: "Tests for dependent samples",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hypothesis-testing-two-means-proportions",
              title: "Hypothesis Testing for Two Means and Two Proportions",
              description: "Comprehensive two-sample hypothesis testing applications",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chi-square-distribution",
          title: "The Chi-Square Distribution",
          description: "Tests of independence and goodness of fit",
          concepts: [
            {
              id: "facts-about-chi-square",
              title: "Facts About the Chi-Square Distribution",
              description: "Properties of the chi-square distribution",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "goodness-of-fit-test",
              title: "Goodness-of-Fit Test",
              description: "Testing if data fits a particular distribution",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "test-of-independence",
              title: "Test of Independence",
              description: "Testing relationships between categorical variables",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "test-for-homogeneity",
              title: "Test for Homogeneity",
              description: "Comparing distributions across groups",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "comparison-chi-square-tests",
              title: "Comparison of the Chi-Square Tests",
              description: "When to use different chi-square tests",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "test-single-variance",
              title: "Test of a Single Variance",
              description: "Testing claims about population variance",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lab-chi-square-goodness-of-fit",
              title: "Lab 1: Chi-Square Goodness-of-Fit",
              description: "Hands-on practice with chi-square goodness-of-fit tests",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lab-chi-square-test-of-independence",
              title: "Lab 2: Chi-Square Test of Independence",
              description: "Hands-on practice with chi-square independence tests",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "linear-regression-correlation",
          title: "Linear Regression and Correlation",
          description: "Analyzing relationships between variables",
          concepts: [
            {
              id: "linear-equations",
              title: "Linear Equations",
              description: "Understanding linear relationships",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "scatter-plots",
              title: "Scatter Plots",
              description: "Visualizing relationships between variables",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "regression-equation",
              title: "The Regression Equation",
              description: "Developing and interpreting regression equations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "testing-significance-correlation",
              title: "Testing the Significance of the Correlation Coefficient",
              description: "Statistical significance of relationships",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "prediction",
              title: "Prediction",
              description: "Using regression for prediction",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "outliers",
              title: "Outliers",
              description: "Identifying and handling unusual data points",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "regression-assumptions",
              title: "Regression (Distance from School)",
              description: "Assumptions and limitations of regression",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "regression-textbook-cost",
              title: "Regression (Textbook Cost)",
              description: "Real-world application using textbook cost data",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "regression-fuel-efficiency",
              title: "Regression (Fuel Efficiency)",
              description: "Real-world application using fuel efficiency data",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "f-distribution-anova",
          title: "F Distribution and One-Way ANOVA",
          description: "Comparing multiple groups",
          concepts: [
            {
              id: "one-way-anova",
              title: "One-Way ANOVA",
              description: "Analysis of variance for multiple groups",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "f-distribution-anova-test",
              title: "The F Distribution and the F-Ratio",
              description: "Understanding the F distribution",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "facts-about-f-distribution",
              title: "Facts About the F Distribution",
              description: "Properties and applications of F distribution",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "test-of-two-variances",
              title: "Test of Two Variances",
              description: "Testing equality of variances between two populations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lab-one-way-anova",
              title: "Lab: One-Way ANOVA",
              description: "Hands-on practice with one-way analysis of variance",
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
          id: "digital-world",
          title: "The Digital World: Building on What You Already Know to Respond Critically",
          description: "Critical response to digital media and texts",
          concepts: [
            {
              id: "reading-to-understand",
              title: '"Reading" to Understand and Respond',
              description: "Develop critical reading skills for digital texts",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "social-media-trailblazer",
              title: "Social Media Trailblazer: Selena Gomez",
              description: "Learn from digital media influencers",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "critical-response-rhetoric",
              title: "Glance at Critical Response: Rhetoric and Critical Thinking",
              description: "Understanding rhetoric in digital contexts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "annotated-voter-suppression",
              title: "Annotated Student Sample: Social Media Post and Responses on Voter Suppression",
              description: "Analyze social media discourse",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thinking-critically-text",
              title: 'Writing Process: Thinking Critically About a "Text"',
              description: "Develop critical thinking about texts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "intention-vs-execution",
              title: "Evaluation: Intention vs. Execution",
              description: "Assess writing effectiveness",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "spotlight-academia",
              title: "Spotlight on ... Academia",
              description: "Academic writing contexts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "tracing-writing-development",
              title: "Portfolio: Tracing Writing Development",
              description: "Track your writing growth",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "language-identity-culture",
          title: "Language, Identity, and Culture: Exploring, Employing, Embracing",
          description: "Explore the connections between language, identity, and culture",
          concepts: [
            {
              id: "seeds-of-self",
              title: "Seeds of Self",
              description: "Discover your writing identity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "identity-trailblazer-hong",
              title: "Identity Trailblazer: Cathy Park Hong",
              description: "Learn from identity-focused writers",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "oppression-reclamation",
              title: "Glance at the Issues: Oppression and Reclamation",
              description: "Understand social justice in writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "souls-black-folk",
              title: "Annotated Sample Reading from The Souls of Black Folk by W. E. B. Du Bois",
              description: "Analyze classic identity writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "identity-through-writing",
              title: "Writing Process: Thinking Critically about How Identity Is Constructed Through Writing",
              description: "Examine identity construction in writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "antiracism-inclusivity",
              title: "Evaluation: Antiracism and Inclusivity",
              description: "Assess inclusive writing practices",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "variations-english",
              title: "Spotlight on ... Variations of English",
              description: "Explore linguistic diversity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "decolonizing-self",
              title: "Portfolio: Decolonizing Self",
              description: "Reflect on cultural identity in writing",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "literacy-narrative",
          title: "Literacy Narrative: Building Bridges, Bridging Gaps",
          description: "Write personal stories about learning to read and write",
          concepts: [
            {
              id: "identity-expression",
              title: "Identity and Expression",
              description: "Connect identity to literacy experiences",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "literacy-trailblazer-westover",
              title: "Literacy Narrative Trailblazer: Tara Westover",
              description: "Study exemplary literacy narratives",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "genre-literacy-narrative",
              title: "Glance at Genre: The Literacy Narrative",
              description: "Understand the literacy narrative genre",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "frederick-douglass",
              title: "Annotated Sample Reading: from Narrative of the Life of Frederick Douglass by Frederick Douglass",
              description: "Analyze classic literacy narrative",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "beginnings-literacy",
              title: "Writing Process: Tracing the Beginnings of Literacy",
              description: "Develop your literacy narrative",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "sentence-structure",
              title: "Editing Focus: Sentence Structure",
              description: "Improve sentence construction",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "self-evaluating",
              title: "Evaluation: Self-Evaluating",
              description: "Assess your own writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "digital-archive",
              title: "Spotlight on ... The Digital Archive of Literacy Narratives (DALN)",
              description: "Explore digital literacy collections",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "literacy-artifact",
              title: "Portfolio: A Literacy Artifact",
              description: "Create a literacy portfolio piece",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "memoir-personal-narrative",
          title: "Memoir or Personal Narrative: Learning Lessons from the Personal",
          description: "Craft compelling personal stories with universal themes",
          concepts: [
            {
              id: "past-present",
              title: "Exploring the Past to Understand the Present",
              description: "Connect past experiences to current insights",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "memoir-trailblazer-coates",
              title: "Memoir Trailblazer: Ta-Nehisi Coates",
              description: "Study powerful memoir writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "conflict-detail-revelation",
              title: "Glance at Genre: Conflict, Detail, and Revelation",
              description: "Understand memoir elements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "life-mississippi",
              title: "Annotated Sample Reading: from Life on the Mississippi by Mark Twain",
              description: "Analyze classic memoir writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "personal-public",
              title: "Writing Process: Making the Personal Public",
              description: "Transform personal experience into public narrative",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "characterization-point-view",
              title: "Editing Focus: More on Characterization and Point of View",
              description: "Develop character and perspective",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "structure-organization",
              title: "Evaluation: Structure and Organization",
              description: "Assess narrative structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "multilingual-writers",
              title: "Spotlight on ... Multilingual Writers",
              description: "Support diverse language backgrounds",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "filtered-memories",
              title: "Portfolio: Filtered Memories",
              description: "Reflect on memory and narrative",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "profile",
          title: "Profile: Telling a Rich and Compelling Story",
          description: "Write detailed portraits of people, places, or phenomena",
          concepts: [
            {
              id: "profiles-inspiration",
              title: "Profiles as Inspiration",
              description: "Understand the power of profile writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "profile-trailblazer-chambers",
              title: "Profile Trailblazer: Veronica Chambers",
              description: "Study expert profile writers",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "subject-angle-background",
              title: "Glance at Genre: Subject, Angle, Background, and Description",
              description: "Master profile writing elements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "remembering-john-lewis",
              title: 'Annotated Sample Reading: "Remembering John Lewis" by Carla D. Hayden',
              description: "Analyze profile writing techniques",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "angle-subject",
              title: "Writing Process: Focusing on the Angle of Your Subject",
              description: "Develop your profile approach",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "verb-tense-consistency",
              title: "Editing Focus: Verb Tense Consistency",
              description: "Maintain consistent verb tenses",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "text-personal-introduction",
              title: "Evaluation: Text as Personal Introduction",
              description: "Assess profile effectiveness",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cultural-artifact",
              title: "Spotlight on ... Profiling a Cultural Artifact",
              description: "Profile objects and cultural items",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "subject-reflection-self",
              title: "Portfolio: Subject as a Reflection of Self",
              description: "Reflect on profile choices",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "proposal",
          title: "Proposal: Writing About Problems and Solutions",
          description: "Identify problems and propose effective solutions",
          concepts: [
            {
              id: "proposing-change",
              title: "Proposing Change: Thinking Critically About Problems and Solutions",
              description: "Develop problem-solving thinking",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "proposal-trailblazer-gawande",
              title: "Proposal Trailblazer: Atul Gawande",
              description: "Study effective proposal writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "features-proposals",
              title: "Glance at Genre: Features of Proposals",
              description: "Understand proposal structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "slowing-climate-change",
              title: 'Annotated Student Sample: "Slowing Climate Change" by Shawn Krukowski',
              description: "Analyze student proposal writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "creating-proposal",
              title: "Writing Process: Creating a Proposal",
              description: "Develop your proposal",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "subject-verb-agreement",
              title: "Editing Focus: Subject-Verb Agreement",
              description: "Master subject-verb agreement",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "conventions-clarity-coherence",
              title: "Evaluation: Conventions, Clarity, and Coherence",
              description: "Assess proposal quality",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "technical-writing-career",
              title: "Spotlight on ... Technical Writing as a Career",
              description: "Explore technical writing professions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reflecting-problems-solutions",
              title: "Portfolio: Reflecting on Problems and Solutions",
              description: "Reflect on problem-solving approaches",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "evaluation-review",
          title: "Evaluation or Review: Would You Recommend It?",
          description: "Write thoughtful evaluations and reviews",
          concepts: [
            {
              id: "thumbs-up-down",
              title: "Thumbs Up or Down?",
              description: "Understand evaluation criteria",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "review-trailblazer-kakutani",
              title: "Review Trailblazer: Michiko Kakutani",
              description: "Study expert review writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "criteria-evidence-evaluation",
              title: "Glance at Genre: Criteria, Evidence, Evaluation",
              description: "Master review elements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "black-representation-film",
              title: 'Annotated Student Sample: "Black Representation in Film" by Caelia Marshall',
              description: "Analyze student review writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thinking-critically-entertainment",
              title: "Writing Process: Thinking Critically About Entertainment",
              description: "Develop evaluation skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "quotations",
              title: "Editing Focus: Quotations",
              description: "Use quotations effectively",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "effect-audience",
              title: "Evaluation: Effect on Audience",
              description: "Assess audience impact",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "language-culture",
              title: "Spotlight on ... Language and Culture",
              description: "Explore cultural contexts in evaluation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "arts-say-about-you",
              title: "Portfolio: What the Arts Say About You",
              description: "Reflect on cultural preferences",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "analytical-report",
          title: "Analytical Report: Writing from Facts",
          description: "Create objective, fact-based analytical reports",
          concepts: [
            {
              id: "information-critical-thinking",
              title: "Information and Critical Thinking",
              description: "Develop analytical thinking skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "analytical-trailblazer-ehrenreich",
              title: "Analytical Report Trailblazer: Barbara Ehrenreich",
              description: "Study analytical reporting",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "informal-formal-reports",
              title: "Glance at Genre: Informal and Formal Analytical Reports",
              description: "Understand report types",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "us-response-covid",
              title: 'Annotated Student Sample: "U.S. Response to COVID-19" by Trevor Garcia',
              description: "Analyze student analytical writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "creating-analytical-report",
              title: "Writing Process: Creating an Analytical Report",
              description: "Develop analytical reports",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "commas-nonessential-essential",
              title: "Editing Focus: Commas with Nonessential and Essential Information",
              description: "Master comma usage",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reviewing-final-draft",
              title: "Evaluation: Reviewing the Final Draft",
              description: "Assess analytical writing quality",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "discipline-specific-language",
              title: "Spotlight on ... Discipline-Specific and Technical Language",
              description: "Use appropriate professional language",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "evidence-objectivity",
              title: "Portfolio: Evidence and Objectivity",
              description: "Reflect on analytical approaches",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "rhetorical-analysis",
          title: "Rhetorical Analysis: Interpreting the Art of Rhetoric",
          description: "Analyze how writers use rhetorical strategies",
          concepts: [
            {
              id: "breaking-whole-parts",
              title: "Breaking the Whole into Its Parts",
              description: "Understand analytical decomposition",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rhetorical-trailblazer-smith",
              title: "Rhetorical Analysis Trailblazer: Jamil Smith",
              description: "Study rhetorical analysis experts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rhetorical-strategies",
              title: "Glance at Genre: Rhetorical Strategies",
              description: "Identify rhetorical techniques",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "evicted-desmond-analysis",
              title: 'Annotated Student Sample: "Rhetorical Analysis: Evicted by Matthew Desmond" by Eliana Evans',
              description: "Analyze student rhetorical analysis",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thinking-critically-rhetoric",
              title: "Writing Process: Thinking Critically about Rhetoric",
              description: "Develop rhetorical analysis skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "mixed-sentence-constructions",
              title: "Editing Focus: Mixed Sentence Constructions",
              description: "Improve sentence clarity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rhetorical-analysis-evaluation",
              title: "Evaluation: Rhetorical Analysis",
              description: "Assess rhetorical analysis quality",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "business-law",
              title: "Spotlight on ... Business and Law",
              description: "Apply rhetoric in professional contexts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rhetoric-intellectual-growth",
              title: "Portfolio: How Thinking Critically about Rhetoric Affects Intellectual Growth",
              description: "Reflect on rhetorical awareness",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "position-argument",
          title: "Position Argument: Practicing the Art of Rhetoric",
          description: "Craft persuasive arguments on important issues",
          concepts: [
            {
              id: "defining-position-argument",
              title: "Making a Case: Defining a Position Argument",
              description: "Understand argumentative writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "position-trailblazer-blow",
              title: "Position Argument Trailblazer: Charles Blow",
              description: "Study effective argumentation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thesis-reasoning-evidence",
              title: "Glance at Genre: Thesis, Reasoning, and Evidence",
              description: "Master argument structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "remarks-university-michigan",
              title: 'Annotated Sample Reading: "Remarks at the University of Michigan" by Lyndon B. Johnson',
              description: "Analyze political argumentation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "creating-position-argument",
              title: "Writing Process: Creating a Position Argument",
              description: "Develop persuasive arguments",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "paragraphs-transitions",
              title: "Editing Focus: Paragraphs and Transitions",
              description: "Improve paragraph flow",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "varied-appeals",
              title: "Evaluation: Varied Appeals",
              description: "Assess persuasive techniques",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "citation",
              title: "Spotlight on ... Citation",
              description: "Master citation practices",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "growth-argument-development",
              title: "Portfolio: Growth in the Development of Argument",
              description: "Reflect on argumentative skills",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "reasoning-strategies",
          title: "Reasoning Strategies: Improving Critical Thinking",
          description: "Develop logical reasoning and critical thinking skills",
          concepts: [
            {
              id: "developing-sense-logic",
              title: "Developing Your Sense of Logic",
              description: "Build logical thinking skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reasoning-trailblazer-hebert",
              title: "Reasoning Trailblazer: Paul D. N. Hebert",
              description: "Study logical reasoning examples",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reasoning-strategies-signals",
              title: "Glance at Genre: Reasoning Strategies and Signal Words",
              description: "Identify reasoning patterns",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "republic-plato",
              title: "Annotated Sample Reading: from Book VII of The Republic by Plato",
              description: "Analyze classical reasoning",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reasoning-supported-evidence",
              title: "Writing Process: Reasoning Supported by Evidence",
              description: "Develop evidence-based reasoning",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "argumentative-research",
          title: "Argumentative Research: Enhancing the Art of Rhetoric with Evidence",
          description: "Combine research with persuasive argumentation",
          concepts: [
            {
              id: "introducing-research-evidence",
              title: "Introducing Research and Research Evidence",
              description: "Understand research in argumentation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "argumentative-trailblazer-nosrat",
              title: "Argumentative Research Trailblazer: Samin Nosrat",
              description: "Study research-based arguments",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "research-as-evidence",
              title: "Glance at Genre: Introducing Research as Evidence",
              description: "Use research effectively in arguments",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "healthy-diets-sustainable",
              title: 'Annotated Student Sample: "Healthy Diets from Sustainable Sources Can Save the Earth" by Lily Tran',
              description: "Analyze research-based student writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "integrating-research",
              title: "Writing Process: Integrating Research",
              description: "Blend research with argumentation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "integrating-sources-quotations",
              title: "Editing Focus: Integrating Sources and Quotations",
              description: "Seamlessly incorporate sources",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "effectiveness-research-paper",
              title: "Evaluation: Effectiveness of Research Paper",
              description: "Assess research integration",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bias-language-research",
              title: "Spotlight on ... Bias in Language and Research",
              description: "Identify and avoid bias",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "facts-matter-research",
              title: "Portfolio: Why Facts Matter in Research Argumentation",
              description: "Reflect on evidence and truth",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "research-process",
          title: "Research Process: Accessing and Recording Information",
          description: "Master the research process from start to finish",
          concepts: [
            {
              id: "existing-sources",
              title: "The Research Process: Where to Look for Existing Sources",
              description: "Find and evaluate sources",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "create-sources",
              title: "The Research Process: How to Create Sources",
              description: "Conduct primary research",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "research-key-skills",
              title: "Glance at the Research Process: Key Skills",
              description: "Develop essential research skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "research-log-sample",
              title: "Annotated Student Sample: Research Log",
              description: "Learn research documentation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "notes-synthesizing-log",
              title: "Research Process: Making Notes, Synthesizing Information, and Keeping a Research Log",
              description: "Organize and synthesize research",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "ethical-research",
              title: "Spotlight on ... Ethical Research",
              description: "Understand research ethics",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "annotated-bibliography",
          title: "Annotated Bibliography: Gathering, Evaluating, and Documenting Sources",
          description: "Create comprehensive annotated bibliographies",
          concepts: [
            {
              id: "compiling-sources",
              title: "Compiling Sources for an Annotated Bibliography",
              description: "Gather and organize sources",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "citation-style-formatting",
              title: "Glance at Form: Citation Style, Purpose, and Formatting",
              description: "Master citation formats",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "healthy-diets-bibliography",
              title: 'Annotated Student Sample: "Healthy Diets from Sustainable Sources Can Save the Earth" by Lily Tran',
              description: "Study annotated bibliography examples",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "informing-analyzing",
              title: "Writing Process: Informing and Analyzing",
              description: "Write effective annotations",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "case-study-profile",
          title: "Case Study Profile: What One Person Says About All",
          description: "Use individual cases to illuminate broader issues",
          concepts: [
            {
              id: "broad-issue-individual",
              title: "Tracing a Broad Issue in the Individual",
              description: "Connect individual to universal",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "case-study-trailblazer-ramachandran",
              title: "Case Study Trailblazer: Vilayanur S. Ramachandran",
              description: "Study case study methodology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "observation-description-analysis",
              title: "Glance at Genre: Observation, Description, and Analysis",
              description: "Master case study elements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "louis-victor-leborgne",
              title: 'Annotated Sample Reading: Case Study on Louis Victor "Tan" Leborgne',
              description: "Analyze case study writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "people-language-interact",
              title: "Writing Process: Thinking Critically About How People and Language Interact",
              description: "Develop case study approach",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "words-often-confused",
              title: "Editing Focus: Words Often Confused",
              description: "Avoid common word errors",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "presentation-analysis-case",
              title: "Evaluation: Presentation and Analysis of Case Study",
              description: "Assess case study effectiveness",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "applied-linguistics",
              title: "Spotlight on ... Applied Linguistics",
              description: "Explore language research applications",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "own-uses-language",
              title: "Portfolio: Your Own Uses of Language",
              description: "Reflect on personal language use",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "textual-analysis",
          title: "Print or Textual Analysis: What You Read",
          description: "Analyze written texts for meaning and technique",
          concepts: [
            {
              id: "author-choices",
              title: "An Author's Choices: What Text Says and How It Says It",
              description: "Understand authorial decisions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "textual-trailblazer-hooks",
              title: "Textual Analysis Trailblazer: bell hooks",
              description: "Study textual analysis experts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "print-textual-analysis-genre",
              title: "Glance at Genre: Print or Textual Analysis",
              description: "Understand textual analysis approaches",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "artists-at-work",
              title: 'Annotated Student Sample: "Artists at Work" by Gwyn Garrison',
              description: "Analyze student textual analysis",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thinking-critically-text-analysis",
              title: "Writing Process: Thinking Critically About Text",
              description: "Develop textual analysis skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "literary-works-present",
              title: "Editing Focus: Literary Works Live in the Present",
              description: "Use proper tense for literary analysis",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "self-directed-assessment",
              title: "Evaluation: Self-Directed Assessment",
              description: "Self-assess analytical writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "humanities",
              title: "Spotlight on ... Humanities",
              description: "Apply analysis in humanities contexts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "academic-personal",
              title: "Portfolio: The Academic and the Personal",
              description: "Balance scholarly and personal perspectives",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "image-analysis",
          title: "Image Analysis: What You See",
          description: "Analyze visual texts and their rhetorical impact",
          concepts: [
            {
              id: "reading-images",
              title: '"Reading" Images',
              description: "Develop visual literacy skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "image-trailblazer-ludy",
              title: "Image Trailblazer: Sara Ludy",
              description: "Study visual analysis experts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "image-rhetoric-relationship",
              title: "Glance at Genre: Relationship Between Image and Rhetoric",
              description: "Understand visual rhetoric",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hints-homoerotic",
              title: 'Annotated Student Sample: "Hints of the Homoerotic" by Leo Davis',
              description: "Analyze student image analysis",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "writing-persuasively-images",
              title: "Writing Process: Thinking Critically and Writing Persuasively About Images",
              description: "Develop visual analysis writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "descriptive-diction",
              title: "Editing Focus: Descriptive Diction",
              description: "Use precise descriptive language",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "analysis-image-relationship",
              title: "Evaluation: Relationship Between Analysis and Image",
              description: "Assess visual analysis quality",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "video-film",
              title: "Spotlight on ... Video and Film",
              description: "Extend analysis to moving images",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "text-image-interplay",
              title: "Portfolio: Interplay Between Text and Image",
              description: "Explore multimodal communication",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "multimodal-online-writing",
          title: "Multimodal and Online Writing: Creative Interaction between Text and Image",
          description: "Create multimodal digital communications",
          concepts: [
            {
              id: "mixing-genres-modes",
              title: "Mixing Genres and Modes",
              description: "Combine different communication modes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "multimodal-trailblazer-bolatagici",
              title: "Multimodal Trailblazer: Torika Bolatagici",
              description: "Study multimodal communication experts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "genre-audience-purpose",
              title: "Glance at Genre: Genre, Audience, Purpose, Organization",
              description: "Design for digital audiences",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "celebrating-win-win",
              title: 'Annotated Sample Reading: "Celebrating a Win-Win" by Alexandra Dapolito Dunn',
              description: "Analyze multimodal texts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "multimodal-advocacy-project",
              title: "Writing Process: Create a Multimodal Advocacy Project",
              description: "Develop multimodal projects",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "transitions",
              title: "Evaluation: Transitions",
              description: "Connect multimodal elements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "technology",
              title: "Spotlight on ... Technology",
              description: "Leverage digital tools",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "multimodalism",
              title: "Portfolio: Multimodalism",
              description: "Reflect on multimodal communication",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "scripting-public-forum",
          title: "Scripting for the Public Forum: Writing to Speak",
          description: "Write for oral presentation and public speaking",
          concepts: [
            {
              id: "writing-speaking-activism",
              title: "Writing, Speaking, and Activism",
              description: "Connect writing to social action",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "podcast-trailblazer-wong",
              title: "Podcast Trailblazer: Alice Wong",
              description: "Study audio communication",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "language-performance-visuals",
              title: "Glance at Genre: Language Performance and Visuals",
              description: "Design for spoken delivery",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "dot-regulations-discriminatory",
              title: 'Annotated Student Sample: "Are New DOT Regulations Discriminatory?" by Zain A. Kumar',
              description: "Analyze writing for speaking",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "writing-to-speak",
              title: "Writing Process: Writing to Speak",
              description: "Adapt writing for oral presentation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bridging-writing-speaking",
              title: "Evaluation: Bridging Writing and Speaking",
              description: "Assess oral communication writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "delivery-public-speaking",
              title: "Spotlight on ... Delivery/Public Speaking",
              description: "Master presentation skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "everyday-rhetoric",
              title: "Portfolio: Everyday Rhetoric, Rhetoric Every Day",
              description: "Recognize rhetoric in daily life",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "portfolio-reflection",
          title: "Portfolio Reflection: Your Growth as a Writer",
          description: "Reflect on your development as a writer",
          concepts: [
            {
              id: "thinking-critically-semester",
              title: "Thinking Critically about Your Semester",
              description: "Assess your learning journey",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reflection-trailblazer-cisneros",
              title: "Reflection Trailblazer: Sandra Cisneros",
              description: "Study reflective writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "purpose-structure",
              title: "Glance at Genre: Purpose and Structure",
              description: "Organize reflective writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "dont-expect-congrats",
              title: 'Annotated Sample Reading: "Don\'t Expect Congrats" by Dale Trumbore',
              description: "Analyze reflective writing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "looking-back-forward",
              title: "Writing Process: Looking Back, Looking Forward",
              description: "Develop reflective perspective",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pronouns",
              title: "Editing Focus: Pronouns",
              description: "Use pronouns effectively",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "evaluating-self-reflection",
              title: "Evaluation: Evaluating Self-Reflection",
              description: "Assess reflective writing quality",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pronouns-context",
              title: "Spotlight on ... Pronouns in Context",
              description: "Understand pronoun usage in context",
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
          content: `Philosophy explores fundamental questions about existence, knowledge, values, reason, mind, and ethics. This comprehensive course provides an introduction to major philosophical traditions and thinkers from around the world.

You'll examine classic philosophical problems and learn to think critically about complex issues. The course covers major areas including metaphysics, epistemology, ethics, logic, and political philosophy.

Through reading primary texts and engaging in philosophical dialogue, you'll develop analytical thinking skills and learn to construct and evaluate arguments.

By the end of this course, you'll have a solid foundation in philosophical thinking and be able to engage thoughtfully with life's biggest questions.

This course covers 12 comprehensive chapters spanning ancient wisdom to contemporary thought, preparing you for advanced philosophical study and critical thinking in any field.`
        },
        {
          id: "introduction-to-philosophy",
          title: "Introduction to Philosophy",
          description: "Explore the fundamental nature and methods of philosophical inquiry",
          concepts: [
            {
              id: "what-is-philosophy",
              title: "What Is Philosophy?",
              description: "Understand the nature and scope of philosophical inquiry",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "how-philosophers-arrive-truth",
              title: "How Do Philosophers Arrive at Truth?",
              description: "Learn about philosophical methods and approaches to truth",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "socrates-paradigmatic-philosopher",
              title: "Socrates as a Paradigmatic Historical Philosopher",
              description: "Study Socrates' method and influence on philosophy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "overview-contemporary-philosophy",
              title: "An Overview of Contemporary Philosophy",
              description: "Survey modern philosophical movements and issues",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "critical-thinking-research-reading-writing",
          title: "Critical Thinking, Research, Reading, and Writing",
          description: "Develop essential skills for philosophical inquiry and argumentation",
          concepts: [
            {
              id: "brain-inference-machine",
              title: "The Brain Is an Inference Machine",
              description: "Understand how the mind processes information and makes inferences",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "overcoming-cognitive-biases",
              title: "Overcoming Cognitive Biases and Engaging in Critical Reflection",
              description: "Learn to identify and overcome common thinking errors",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "developing-good-habits-mind",
              title: "Developing Good Habits of Mind",
              description: "Cultivate intellectual virtues and thinking skills",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "gathering-information-evaluating-sources",
              title: "Gathering Information, Evaluating Sources, and Understanding Evidence",
              description: "Learn research methods and source evaluation for philosophy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reading-philosophy",
              title: "Reading Philosophy",
              description: "Develop skills for reading and interpreting philosophical texts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "writing-philosophy-papers",
              title: "Writing Philosophy Papers",
              description: "Learn to write clear, persuasive philosophical arguments",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "early-history-philosophy-world",
          title: "The Early History of Philosophy around the World",
          description: "Explore diverse philosophical traditions from various cultures",
          concepts: [
            {
              id: "indigenous-philosophy",
              title: "Indigenous Philosophy",
              description: "Study philosophical traditions of indigenous peoples",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "classical-indian-philosophy",
              title: "Classical Indian Philosophy",
              description: "Explore Hindu, Buddhist, and Jain philosophical traditions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "classical-chinese-philosophy",
              title: "Classical Chinese Philosophy",
              description: "Study Confucian, Daoist, and other Chinese philosophical schools",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "emergence-classical-philosophy",
          title: "The Emergence of Classical Philosophy",
          description: "Examine the development of Western philosophical traditions",
          concepts: [
            {
              id: "historiography-history-philosophy",
              title: "Historiography and the History of Philosophy",
              description: "Understand how we study and interpret philosophical history",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "classical-philosophy",
              title: "Classical Philosophy",
              description: "Study ancient Greek and Roman philosophical traditions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "jewish-christian-islamic-philosophy",
              title: "Jewish, Christian, and Islamic Philosophy",
              description: "Explore medieval religious philosophical traditions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "logic-reasoning",
          title: "Logic and Reasoning",
          description: "Master the tools of logical analysis and argument construction",
          concepts: [
            {
              id: "philosophical-methods-discovering-truth",
              title: "Philosophical Methods for Discovering Truth",
              description: "Learn systematic approaches to philosophical inquiry",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "logical-statements",
              title: "Logical Statements",
              description: "Understand the structure and types of logical statements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "arguments",
              title: "Arguments",
              description: "Learn to construct and evaluate philosophical arguments",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "types-inferences",
              title: "Types of Inferences",
              description: "Study deductive, inductive, and abductive reasoning",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "informal-fallacies",
              title: "Informal Fallacies",
              description: "Identify and avoid common logical fallacies",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "metaphysics",
          title: "Metaphysics",
          description: "Explore fundamental questions about reality and existence",
          concepts: [
            {
              id: "substance",
              title: "Substance",
              description: "Examine theories about the basic building blocks of reality",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "self-identity",
              title: "Self and Identity",
              description: "Study questions of personal identity and the nature of self",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cosmology-existence-god",
              title: "Cosmology and the Existence of God",
              description: "Explore arguments for and against the existence of God",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "free-will",
              title: "Free Will",
              description: "Examine debates about determinism and human freedom",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "epistemology",
          title: "Epistemology",
          description: "Study the nature of knowledge, belief, and justification",
          concepts: [
            {
              id: "what-epistemology-studies",
              title: "What Epistemology Studies",
              description: "Understand the scope and methods of epistemological inquiry",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "knowledge",
              title: "Knowledge",
              description: "Examine different theories of knowledge and its conditions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "justification",
              title: "Justification",
              description: "Study what makes beliefs justified or warranted",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "skepticism",
              title: "Skepticism",
              description: "Explore skeptical challenges to knowledge claims",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "applied-epistemology",
              title: "Applied Epistemology",
              description: "Apply epistemological principles to practical questions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "value-theory",
          title: "Value Theory",
          description: "Explore questions about values, ethics, and aesthetic judgment",
          concepts: [
            {
              id: "fact-value-distinction",
              title: "The Fact-Value Distinction",
              description: "Examine the relationship between facts and values",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "basic-questions-values",
              title: "Basic Questions about Values",
              description: "Study fundamental questions in value theory",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "metaethics",
              title: "Metaethics",
              description: "Explore the nature and meaning of ethical claims",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "well-being",
              title: "Well-Being",
              description: "Study theories of human flourishing and the good life",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "aesthetics",
              title: "Aesthetics",
              description: "Examine philosophical questions about art and beauty",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "normative-moral-theory",
          title: "Normative Moral Theory",
          description: "Study systematic approaches to moral reasoning and judgment",
          concepts: [
            {
              id: "requirements-normative-moral-theory",
              title: "Requirements of a Normative Moral Theory",
              description: "Understand what makes a moral theory adequate",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "consequentialism",
              title: "Consequentialism",
              description: "Study moral theories based on outcomes and consequences",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "deontology",
              title: "Deontology",
              description: "Examine duty-based approaches to moral reasoning",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "virtue-ethics",
              title: "Virtue Ethics",
              description: "Study character-based approaches to moral philosophy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "daoism",
              title: "Daoism",
              description: "Explore Daoist approaches to ethics and the good life",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "feminist-theories-ethics",
              title: "Feminist Theories of Ethics",
              description: "Study feminist perspectives on moral reasoning",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "applied-ethics",
          title: "Applied Ethics",
          description: "Apply ethical theories to contemporary moral issues",
          concepts: [
            {
              id: "challenge-bioethics",
              title: "The Challenge of Bioethics",
              description: "Examine ethical issues in medicine and biology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "environmental-ethics",
              title: "Environmental Ethics",
              description: "Study moral obligations to the natural world",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "business-ethics-emerging-technology",
              title: "Business Ethics and Emerging Technology",
              description: "Explore ethical issues in business and technology",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "political-philosophy",
          title: "Political Philosophy",
          description: "Examine questions of government, justice, and political authority",
          concepts: [
            {
              id: "historical-perspectives-government",
              title: "Historical Perspectives on Government",
              description: "Study the evolution of political thought and institutions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "forms-government",
              title: "Forms of Government",
              description: "Examine different systems of political organization",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "political-legitimacy-duty",
              title: "Political Legitimacy and Duty",
              description: "Study the justification of political authority",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "political-ideologies",
              title: "Political Ideologies",
              description: "Explore major political theories and movements",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "contemporary-philosophies-social-theories",
          title: "Contemporary Philosophies and Social Theories",
          description: "Study modern developments in philosophical and social thought",
          concepts: [
            {
              id: "enlightenment-social-theory",
              title: "Enlightenment Social Theory",
              description: "Examine Enlightenment approaches to society and politics",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "marxist-solution",
              title: "The Marxist Solution",
              description: "Study Marxist critiques of capitalism and society",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "continental-philosophy-challenge",
              title: "Continental Philosophy's Challenge to Enlightenment Theories",
              description: "Explore continental critiques of Enlightenment thought",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "frankfurt-school",
              title: "The Frankfurt School",
              description: "Study critical theory and the Frankfurt School tradition",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "postmodernism",
              title: "Postmodernism",
              description: "Examine postmodern critiques of traditional philosophy",
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
          description: "Journey through major events and civilizations from 1200 to present",
          content: `World History takes you on a comprehensive journey through the major events, civilizations, and developments that have shaped human society across the globe from 1200 to the present day.

This course examines the interconnected nature of world cultures and civilizations, exploring how trade, empires, revolutions, and global forces have shaped our modern world. You'll study the rise and fall of great civilizations, the impact of industrialization, and the challenges of the contemporary world.

Through analyzing primary sources and historical evidence, you'll develop critical thinking skills and learn to understand complex historical patterns and relationships.

By the end of this course, you'll have a comprehensive understanding of world history and the ability to think critically about how historical events continue to influence our interconnected world today.

This course covers 15 comprehensive chapters from medieval trade networks through contemporary global challenges, preparing you for advanced historical study and informed global citizenship.`
        },
        {
          id: "understanding-past",
          title: "Understanding the Past",
          description: "Learn the foundations of historical thinking and methodology",
          concepts: [
            {
              id: "developing-global-perspective",
              title: "Developing a Global Perspective",
              description: "Understand how to approach history from a global viewpoint",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "primary-sources",
              title: "Primary Sources",
              description: "Learn to analyze and interpret historical documents and evidence",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "causation-interpretation-history",
              title: "Causation and Interpretation in History",
              description: "Understand how historians determine causes and interpret historical events",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "exchange-east-asia-indian-ocean",
          title: "Exchange in East Asia and the Indian Ocean",
          description: "Explore the great trading networks that connected Asia",
          concepts: [
            {
              id: "india-international-connections",
              title: "India and International Connections",
              description: "Study India's role in medieval international trade and diplomacy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "malacca-sultanate",
              title: "The Malacca Sultanate",
              description: "Examine the powerful trading state that controlled Southeast Asian commerce",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exchange-east-asia",
              title: "Exchange in East Asia",
              description: "Analyze trade and cultural exchange in China, Japan, and Korea",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "early-modern-africa-wider-world",
          title: "Early Modern Africa and the Wider World",
          description: "Study Africa's great empires and their global connections",
          concepts: [
            {
              id: "roots-african-trade",
              title: "The Roots of African Trade",
              description: "Understand the foundations of African commercial networks",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "songhai-empire",
              title: "The Songhai Empire",
              description: "Explore one of Africa's greatest medieval empires",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "swahili-coast",
              title: "The Swahili Coast",
              description: "Study the trading cities of East Africa and their Indian Ocean connections",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "trans-saharan-slave-trade",
              title: "The Trans-Saharan Slave Trade",
              description: "Examine the impact of slavery on African societies",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "islamic-world",
          title: "The Islamic World",
          description: "Explore the great Islamic empires and their global influence",
          concepts: [
            {
              id: "connected-islamic-world",
              title: "A Connected Islamic World",
              description: "Understand the unity and diversity of Islamic civilization",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "ottoman-empire",
              title: "The Ottoman Empire",
              description: "Study the rise and expansion of the Ottoman Empire",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "safavid-empire",
              title: "The Safavid Empire",
              description: "Examine the Persian Safavid Empire and its cultural achievements",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "foundations-atlantic-world",
          title: "Foundations of the Atlantic World",
          description: "Study the creation of Atlantic trade networks and colonial systems",
          concepts: [
            {
              id: "protestant-reformation",
              title: "The Protestant Reformation",
              description: "Understand the religious revolution that transformed Europe",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "crossing-atlantic",
              title: "Crossing the Atlantic",
              description: "Study European exploration and colonization of the Americas",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "mercantilist-economy",
              title: "The Mercantilist Economy",
              description: "Examine early modern economic theories and practices",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "atlantic-slave-trade",
              title: "The Atlantic Slave Trade",
              description: "Analyze the devastating impact of the Atlantic slave trade",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "colonization-economic-expansion",
          title: "Colonization and Economic Expansion",
          description: "Examine European expansion and the rise of global capitalism",
          concepts: [
            {
              id: "european-colonization-americas",
              title: "European Colonization in the Americas",
              description: "Study the establishment and development of European colonies",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rise-global-economy",
              title: "The Rise of a Global Economy",
              description: "Understand the emergence of worldwide economic connections",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "capitalism-first-industrial-revolution",
              title: "Capitalism and the First Industrial Revolution",
              description: "Explore the transformation of production and economic systems",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "revolutions-europe-north-america",
          title: "Revolutions in Europe and North America",
          description: "Study the age of democratic and political revolutions",
          concepts: [
            {
              id: "enlightenment",
              title: "The Enlightenment",
              description: "Examine the intellectual revolution that changed European thought",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exchange-ideas-public-sphere",
              title: "The Exchange of Ideas in the Public Sphere",
              description: "Study how new ideas spread through society",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "revolutions-america-france-haiti",
              title: "Revolutions: America, France, and Haiti",
              description: "Analyze the great democratic revolutions of the 18th century",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nationalism-liberalism-conservatism",
              title: "Nationalism, Liberalism, Conservatism, and the Political Order",
              description: "Understand the competing political ideologies of the 19th century",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "revolutions-latin-america",
          title: "Revolutions in Latin America",
          description: "Explore the independence movements that transformed Latin America",
          concepts: [
            {
              id: "revolution-for-whom",
              title: "Revolution for Whom?",
              description: "Examine who benefited from Latin American independence movements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "spanish-north-america",
              title: "Spanish North America",
              description: "Study independence movements in Mexico and Central America",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "spanish-south-america",
              title: "Spanish South America",
              description: "Analyze revolutionary movements in Spanish South America",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "portuguese-south-america",
              title: "Portuguese South America",
              description: "Examine Brazilian independence and its unique characteristics",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "expansion-industrial-age",
          title: "Expansion in the Industrial Age",
          description: "Study the new imperialism and industrial expansion of the 19th century",
          concepts: [
            {
              id: "second-industrial-revolution",
              title: "The Second Industrial Revolution",
              description: "Explore technological advances and industrial growth",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "motives-means-imperialism",
              title: "Motives and Means of Imperialism",
              description: "Understand why and how European powers expanded globally",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "colonial-empires",
              title: "Colonial Empires",
              description: "Study the establishment and administration of colonial systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exploitation-resistance",
              title: "Exploitation and Resistance",
              description: "Examine colonial exploitation and indigenous resistance movements",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "life-labor-industrial-world",
          title: "Life and Labor in the Industrial World",
          description: "Explore the social transformation brought by industrialization",
          concepts: [
            {
              id: "inventions-innovations-mechanization",
              title: "Inventions, Innovations, and Mechanization",
              description: "Study technological advances that transformed production",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "life-industrial-city",
              title: "Life in the Industrial City",
              description: "Examine urbanization and the transformation of city life",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "coerced-semicoerced-labor",
              title: "Coerced and Semicoerced Labor",
              description: "Analyze various forms of forced labor in the industrial era",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "communities-diaspora",
              title: "Communities in Diaspora",
              description: "Study migration patterns and diaspora communities",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "regulation-reform-revolutionary-ideologies",
              title: "Regulation, Reform, and Revolutionary Ideologies",
              description: "Examine responses to industrial social problems",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "war-end-all-wars",
          title: "The War to End All Wars",
          description: "Study World War I and its global impact",
          concepts: [
            {
              id: "alliances-expansion-conflict",
              title: "Alliances, Expansion, and Conflict",
              description: "Understand the causes and outbreak of World War I",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "collapse-ottomans-coming-war",
              title: "The Collapse of the Ottomans and the Coming of War",
              description: "Examine the decline of the Ottoman Empire and regional conflicts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "total-war",
              title: "Total War",
              description: "Study the unprecedented scale and nature of World War I",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "war-homefront",
              title: "War on the Homefront",
              description: "Analyze how the war transformed societies at home",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "war-ends",
              title: "The War Ends",
              description: "Examine the conclusion of World War I and its immediate aftermath",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "interwar-period",
          title: "The Interwar Period",
          description: "Study the turbulent years between the world wars",
          concepts: [
            {
              id: "recovering-world-war-i",
              title: "Recovering from World War I",
              description: "Understand post-war reconstruction and its challenges",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "formation-soviet-union",
              title: "The Formation of the Soviet Union",
              description: "Study the Russian Revolution and creation of the Soviet state",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "great-depression",
              title: "The Great Depression",
              description: "Analyze the global economic crisis of the 1930s",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "old-empires-new-colonies",
              title: "Old Empires and New Colonies",
              description: "Examine changes in imperial systems after World War I",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "resistance-civil-rights-democracy",
              title: "Resistance, Civil Rights, and Democracy",
              description: "Study movements for rights and democracy in the interwar period",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "causes-consequences-world-war-ii",
          title: "The Causes and Consequences of World War II",
          description: "Examine the deadliest conflict in human history",
          concepts: [
            {
              id: "unstable-peace",
              title: "An Unstable Peace",
              description: "Understand the factors that led to World War II",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "theaters-war",
              title: "Theaters of War",
              description: "Study the global scope and major campaigns of World War II",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "keeping-home-fires-burning",
              title: "Keeping the Home Fires Burning",
              description: "Examine the war's impact on civilian populations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "out-of-ashes",
              title: "Out of the Ashes",
              description: "Analyze the end of World War II and its immediate consequences",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "cold-war-conflicts",
          title: "Cold War Conflicts",
          description: "Study the global ideological struggle between superpowers",
          concepts: [
            {
              id: "cold-war-begins",
              title: "The Cold War Begins",
              description: "Understand the origins and early development of the Cold War",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "spread-communism",
              title: "The Spread of Communism",
              description: "Examine the expansion of communist influence worldwide",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "non-aligned-movement",
              title: "The Non-Aligned Movement",
              description: "Study nations that sought neutrality in the Cold War",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "global-tensions-decolonization",
              title: "Global Tensions and Decolonization",
              description: "Analyze the end of colonial empires and its impact",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "new-world-order",
              title: "A New World Order",
              description: "Examine the end of the Cold War and its consequences",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "contemporary-world-ongoing-challenges",
          title: "The Contemporary World and Ongoing Challenges",
          description: "Explore current global issues and their historical roots",
          concepts: [
            {
              id: "global-economy",
              title: "A Global Economy",
              description: "Study economic globalization and its effects",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "debates-environment",
              title: "Debates about the Environment",
              description: "Examine environmental challenges and responses",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "science-technology-todays-world",
              title: "Science and Technology for Today's World",
              description: "Analyze the role of technology in shaping the modern world",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "ongoing-problems-solutions",
              title: "Ongoing Problems and Solutions",
              description: "Study contemporary global challenges and potential solutions",
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
          description: "Scientific study of living organisms and their interactions with the environment",
          content: `Biology is the scientific study of living organisms and their interactions with the environment. This comprehensive course covers 47 chapters spanning from basic molecular biology to complex ecological systems.

You'll explore the fundamental principles of life, from the molecular level to entire ecosystems. The course covers cell biology, genetics, evolution, ecology, and human biology.

Through laboratory work and field studies, you'll develop scientific thinking skills and learn to apply the scientific method to biological questions.

By the end of this course, you'll have a solid foundation in biological science and understand how living systems function and interact.`
        },
        {
          id: "chapter-1",
          title: "The Study of Life",
          description: "Introduction to biology and its foundational concepts",
          concepts: [
            {
              id: "science-of-biology",
              title: "The Science of Biology",
              description: "Understanding biological science principles and methods",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "themes-concepts-biology",
              title: "Themes and Concepts of Biology",
              description: "Core themes that unify biological sciences",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-2",
          title: "The Chemical Foundation of Life",
          description: "Basic chemistry concepts essential for biology",
          concepts: [
            {
              id: "atoms-molecules",
              title: "Atoms, Isotopes, Ions, and Molecules: The Building Blocks",
              description: "Understanding the basic units of matter",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "water",
              title: "Water",
              description: "Properties of water and its biological importance",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "carbon",
              title: "Carbon",
              description: "Carbon's role in biological molecules",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-3",
          title: "Biological Macromolecules",
          description: "Structure and function of life's essential molecules",
          concepts: [
            {
              id: "synthesis-macromolecules",
              title: "Synthesis of Biological Macromolecules",
              description: "How macromolecules are built and broken down",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "carbohydrates",
              title: "Carbohydrates",
              description: "Structure and function of carbohydrates",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lipids",
              title: "Lipids",
              description: "Structure and function of lipids",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "proteins",
              title: "Proteins",
              description: "Structure and function of proteins",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nucleic-acids",
              title: "Nucleic Acids",
              description: "Structure and function of DNA and RNA",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-4",
          title: "Cell Structure",
          description: "Organization and components of cells",
          concepts: [
            {
              id: "studying-cells",
              title: "Studying Cells",
              description: "Methods and techniques for cell observation",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "prokaryotic-cells",
              title: "Prokaryotic Cells",
              description: "Structure and characteristics of prokaryotic cells",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "eukaryotic-cells",
              title: "Eukaryotic Cells",
              description: "Structure and characteristics of eukaryotic cells",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "endomembrane-system",
              title: "The Endomembrane System and Proteins",
              description: "Internal membrane systems and protein processing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cytoskeleton",
              title: "The Cytoskeleton",
              description: "Cell's structural framework and movement",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cell-connections",
              title: "Connections between Cells and Cellular Activities",
              description: "How cells communicate and interact",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-5",
          title: "Structure and Function of Plasma Membranes",
          description: "Cell membrane structure and transport mechanisms",
          concepts: [
            {
              id: "membrane-components",
              title: "Components and Structure",
              description: "Membrane composition and organization",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "passive-transport",
              title: "Passive Transport",
              description: "Movement across membranes without energy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "active-transport",
              title: "Active Transport",
              description: "Energy-requiring membrane transport",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bulk-transport",
              title: "Bulk Transport",
              description: "Large-scale movement across membranes",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-6",
          title: "Metabolism",
          description: "Energy transformations in living systems",
          concepts: [
            {
              id: "energy-metabolism",
              title: "Energy and Metabolism",
              description: "Basic principles of energy in biological systems",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "energy-types",
              title: "Potential, Kinetic, Free, and Activation Energy",
              description: "Different forms of energy in biological processes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thermodynamics",
              title: "The Laws of Thermodynamics",
              description: "Fundamental laws governing energy transformations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "atp",
              title: "ATP: Adenosine Triphosphate",
              description: "The universal energy currency of cells",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "enzymes",
              title: "Enzymes",
              description: "Biological catalysts and their functions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-7",
          title: "Cellular Respiration",
          description: "How cells extract energy from nutrients",
          concepts: [
            {
              id: "energy-living-systems",
              title: "Energy in Living Systems",
              description: "Energy requirements and sources in organisms",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "glycolysis",
              title: "Glycolysis",
              description: "Breakdown of glucose to pyruvate",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "citric-acid-cycle",
              title: "Oxidation of Pyruvate and the Citric Acid Cycle",
              description: "Central metabolic pathway for energy production",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "oxidative-phosphorylation",
              title: "Oxidative Phosphorylation",
              description: "ATP production through electron transport",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "metabolism-without-oxygen",
              title: "Metabolism without Oxygen",
              description: "Fermentation and anaerobic respiration",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "metabolic-pathways",
              title: "Connections of Carbohydrate, Protein, and Lipid Metabolic Pathways",
              description: "Integration of different metabolic processes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "respiration-regulation",
              title: "Regulation of Cellular Respiration",
              description: "Control mechanisms of respiratory processes",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-8",
          title: "Photosynthesis",
          description: "How plants capture and use light energy",
          concepts: [
            {
              id: "photosynthesis-overview",
              title: "Overview of Photosynthesis",
              description: "Basic principles of photosynthetic energy conversion",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "light-reactions",
              title: "The Light-Dependent Reactions of Photosynthesis",
              description: "Capturing light energy and producing ATP",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "light-energy-molecules",
              title: "Using Light Energy to Make Organic Molecules",
              description: "Calvin cycle and carbon fixation",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-9",
          title: "Cell Communication",
          description: "How cells send and receive signals",
          concepts: [
            {
              id: "signaling-molecules",
              title: "Signaling Molecules and Cellular Receptors",
              description: "Chemical signals and their detection",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "signal-propagation",
              title: "Propagation of the Signal",
              description: "Signal transduction pathways",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "signal-response",
              title: "Response to the Signal",
              description: "Cellular responses to signaling",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "single-cell-signaling",
              title: "Signaling in Single-Celled Organisms",
              description: "Communication in unicellular life",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-10",
          title: "Cell Reproduction",
          description: "Cell division and reproduction mechanisms",
          concepts: [
            {
              id: "cell-division",
              title: "Cell Division",
              description: "Basic principles of cell division",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "cell-cycle",
              title: "The Cell Cycle",
              description: "Stages of cell division and growth",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cell-cycle-control",
              title: "Control of the Cell Cycle",
              description: "Regulatory mechanisms of cell division",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cancer-cell-cycle",
              title: "Cancer and the Cell Cycle",
              description: "When cell division goes wrong",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "prokaryotic-division",
              title: "Prokaryotic Cell Division",
              description: "Cell division in bacteria and archaea",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-11",
          title: "Meiosis and Sexual Reproduction",
          description: "Special cell division for gamete formation",
          concepts: [
            {
              id: "meiosis-process",
              title: "The Process of Meiosis",
              description: "Reduction division and genetic recombination",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "sexual-reproduction",
              title: "Sexual Reproduction",
              description: "Advantages and mechanisms of sexual reproduction",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-12",
          title: "Mendel's Experiments and Heredity",
          description: "Foundations of genetics and inheritance",
          concepts: [
            {
              id: "mendel-experiments",
              title: "Mendel's Experiments and the Laws of Probability",
              description: "Classic genetics experiments and statistical analysis",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "characteristics-traits",
              title: "Characteristics and Traits",
              description: "Genetic traits and their inheritance patterns",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "laws-inheritance",
              title: "Laws of Inheritance",
              description: "Mendel's laws and their applications",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-13",
          title: "Modern Understandings of Inheritance",
          description: "Contemporary genetics beyond Mendel",
          concepts: [
            {
              id: "chromosomal-theory",
              title: "Chromosomal Theory and Genetic Linkage",
              description: "Genes on chromosomes and linkage mapping",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "inherited-disorders",
              title: "Chromosomal Basis of Inherited Disorders",
              description: "Genetic diseases and chromosomal abnormalities",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-14",
          title: "DNA Structure and Function",
          description: "The molecular basis of heredity",
          concepts: [
            {
              id: "dna-history",
              title: "Historical Basis of Modern Understanding",
              description: "Discovery of DNA structure and function",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "dna-structure",
              title: "DNA Structure and Sequencing",
              description: "Double helix structure and sequencing methods",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "dna-replication-basics",
              title: "Basics of DNA Replication",
              description: "Fundamental principles of DNA copying",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "prokaryotic-replication",
              title: "DNA Replication in Prokaryotes",
              description: "Bacterial DNA replication mechanisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "eukaryotic-replication",
              title: "DNA Replication in Eukaryotes",
              description: "Eukaryotic DNA replication complexities",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "dna-repair",
              title: "DNA Repair",
              description: "Mechanisms for maintaining DNA integrity",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-15",
          title: "Genes and Proteins",
          description: "From genes to proteins - the central dogma",
          concepts: [
            {
              id: "genetic-code",
              title: "The Genetic Code",
              description: "How DNA codes for proteins",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "prokaryotic-transcription",
              title: "Prokaryotic Transcription",
              description: "RNA synthesis in bacteria",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "eukaryotic-transcription",
              title: "Eukaryotic Transcription",
              description: "RNA synthesis in eukaryotes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "rna-processing",
              title: "RNA Processing in Eukaryotes",
              description: "mRNA modification and maturation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "protein-synthesis",
              title: "Ribosomes and Protein Synthesis",
              description: "Translation of mRNA to proteins",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-16",
          title: "Gene Expression",
          description: "Regulation of gene activity",
          concepts: [
            {
              id: "gene-expression-regulation",
              title: "Regulation of Gene Expression",
              description: "General principles of gene regulation",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "prokaryotic-regulation",
              title: "Prokaryotic Gene Regulation",
              description: "Gene control in bacteria",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "epigenetic-regulation",
              title: "Eukaryotic Epigenetic Gene Regulation",
              description: "Epigenetic modifications and inheritance",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "transcriptional-regulation",
              title: "Eukaryotic Transcription Gene Regulation",
              description: "Transcriptional control mechanisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "post-transcriptional-regulation",
              title: "Eukaryotic Post-transcriptional Gene Regulation",
              description: "RNA-based gene regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "translational-regulation",
              title: "Eukaryotic Translational and Post-translational Gene Regulation",
              description: "Protein-level gene regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cancer-gene-regulation",
              title: "Cancer and Gene Regulation",
              description: "Disrupted gene regulation in cancer",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-17",
          title: "Biotechnology and Genomics",
          description: "Modern molecular techniques and applications",
          concepts: [
            {
              id: "biotechnology",
              title: "Biotechnology",
              description: "Applications of molecular biology techniques",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "mapping-genomes",
              title: "Mapping Genomes",
              description: "Techniques for genome mapping",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "genome-sequencing",
              title: "Whole-Genome Sequencing",
              description: "Large-scale DNA sequencing projects",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "applying-genomics",
              title: "Applying Genomics",
              description: "Practical applications of genomic data",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "genomics-proteomics",
              title: "Genomics and Proteomics",
              description: "Studying genes and proteins at scale",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-18",
          title: "Evolution and the Origin of Species",
          description: "Evolutionary processes and speciation",
          concepts: [
            {
              id: "understanding-evolution",
              title: "Understanding Evolution",
              description: "Mechanisms and evidence for evolution",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "new-species-formation",
              title: "Formation of New Species",
              description: "Speciation mechanisms and patterns",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "speciation-rates",
              title: "Reconnection and Speciation Rates",
              description: "Factors affecting speciation rates",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-19",
          title: "The Evolution of Populations",
          description: "Population genetics and evolutionary change",
          concepts: [
            {
              id: "population-evolution",
              title: "Population Evolution",
              description: "Evolution at the population level",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "population-genetics",
              title: "Population Genetics",
              description: "Genetic variation in populations",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "adaptive-evolution",
              title: "Adaptive Evolution",
              description: "Natural selection and adaptation",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-20",
          title: "Phylogenies and the History of Life",
          description: "Evolutionary relationships and life's history",
          concepts: [
            {
              id: "organizing-life",
              title: "Organizing Life on Earth",
              description: "Classification and phylogenetic trees",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "evolutionary-relationships",
              title: "Determining Evolutionary Relationships",
              description: "Methods for inferring phylogenies",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "phylogenetic-perspectives",
              title: "Perspectives on the Phylogenetic Tree",
              description: "Interpreting evolutionary trees",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-21",
          title: "Viruses",
          description: "Non-living infectious agents",
          concepts: [
            {
              id: "viral-evolution",
              title: "Viral Evolution, Morphology, and Classification",
              description: "Structure and diversity of viruses",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "virus-infections",
              title: "Virus Infections and Hosts",
              description: "Viral life cycles and host interactions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "viral-prevention",
              title: "Prevention and Treatment of Viral Infections",
              description: "Antiviral strategies and vaccines",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "acellular-entities",
              title: "Other Acellular Entities: Prions and Viroids",
              description: "Non-viral infectious agents",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-22",
          title: "Prokaryotes: Bacteria and Archaea",
          description: "Diversity and importance of prokaryotic life",
          concepts: [
            {
              id: "prokaryotic-diversity",
              title: "Prokaryotic Diversity",
              description: "Variety of prokaryotic organisms",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "prokaryotic-structure",
              title: "Structure of Prokaryotes: Bacteria and Archaea",
              description: "Cellular organization of prokaryotes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "prokaryotic-metabolism",
              title: "Prokaryotic Metabolism",
              description: "Energy and nutrient processing in prokaryotes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bacterial-diseases",
              title: "Bacterial Diseases in Humans",
              description: "Pathogenic bacteria and human health",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "beneficial-prokaryotes",
              title: "Beneficial Prokaryotes",
              description: "Positive roles of prokaryotes in ecosystems",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-23",
          title: "Protists",
          description: "Diverse eukaryotic microorganisms",
          concepts: [
            {
              id: "eukaryotic-origins",
              title: "Eukaryotic Origins",
              description: "Evolution of eukaryotic cells",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "protist-characteristics",
              title: "Characteristics of Protists",
              description: "Common features of protist organisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "protist-groups",
              title: "Groups of Protists",
              description: "Major protist classifications",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "protist-ecology",
              title: "Ecology of Protists",
              description: "Protist roles in ecosystems",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-24",
          title: "Fungi",
          description: "Heterotrophic eukaryotes and decomposers",
          concepts: [
            {
              id: "fungal-characteristics",
              title: "Characteristics of Fungi",
              description: "Basic features of fungal organisms",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "fungal-classifications",
              title: "Classifications of Fungi",
              description: "Major fungal groups and taxonomy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fungal-ecology",
              title: "Ecology of Fungi",
              description: "Fungal roles in ecosystems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fungal-parasites",
              title: "Fungal Parasites and Pathogens",
              description: "Disease-causing fungi",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fungal-importance",
              title: "Importance of Fungi in Human Life",
              description: "Beneficial uses of fungi",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-25",
          title: "Seedless Plants",
          description: "Early plant evolution and non-seed plants",
          concepts: [
            {
              id: "early-plant-life",
              title: "Early Plant Life",
              description: "Evolution of the first plants",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "green-algae",
              title: "Green Algae: Precursors of Land Plants",
              description: "Algal ancestors of plants",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bryophytes",
              title: "Bryophytes",
              description: "Mosses, liverworts, and hornworts",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "seedless-vascular",
              title: "Seedless Vascular Plants",
              description: "Ferns and their relatives",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-26",
          title: "Seed Plants",
          description: "Evolution and diversity of seed-bearing plants",
          concepts: [
            {
              id: "seed-plant-evolution",
              title: "Evolution of Seed Plants",
              description: "Advantages and evolution of seeds",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "gymnosperms",
              title: "Gymnosperms",
              description: "Conifers and other naked seed plants",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "angiosperms",
              title: "Angiosperms",
              description: "Flowering plants and their diversity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "seed-plant-role",
              title: "The Role of Seed Plants",
              description: "Ecological and economic importance",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-27",
          title: "Introduction to Animal Diversity",
          description: "Overview of animal classification and evolution",
          concepts: [
            {
              id: "animal-kingdom-features",
              title: "Features of the Animal Kingdom",
              description: "Common characteristics of animals",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "animal-classification",
              title: "Features Used to Classify Animals",
              description: "Criteria for animal taxonomy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "animal-phylogeny",
              title: "Animal Phylogeny",
              description: "Evolutionary relationships among animals",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "animal-evolutionary-history",
              title: "The Evolutionary History of the Animal Kingdom",
              description: "Major events in animal evolution",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-28",
          title: "Invertebrates",
          description: "Animals without backbones",
          concepts: [
            {
              id: "porifera",
              title: "Phylum Porifera",
              description: "Sponges and their characteristics",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "cnidaria",
              title: "Phylum Cnidaria",
              description: "Jellyfish, corals, and relatives",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lophotrochozoa-flatworms",
              title: "Superphylum Lophotrochozoa: Flatworms, Rotifers, and Nemerteans",
              description: "Simple bilateral animals",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lophotrochozoa-molluscs",
              title: "Superphylum Lophotrochozoa: Molluscs and Annelids",
              description: "Soft-bodied animals and segmented worms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "ecdysozoa-nematodes",
              title: "Superphylum Ecdysozoa: Nematodes and Tardigrades",
              description: "Molting animals - roundworms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "ecdysozoa-arthropods",
              title: "Superphylum Ecdysozoa: Arthropods",
              description: "Insects, spiders, and crustaceans",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "deuterostomia",
              title: "Superphylum Deuterostomia",
              description: "Echinoderms and early chordates",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-29",
          title: "Vertebrates",
          description: "Animals with backbones",
          concepts: [
            {
              id: "chordates",
              title: "Chordates",
              description: "Defining characteristics of chordates",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "fishes",
              title: "Fishes",
              description: "Aquatic vertebrates and their diversity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "amphibians",
              title: "Amphibians",
              description: "Transition from water to land",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reptiles",
              title: "Reptiles",
              description: "First fully terrestrial vertebrates",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "birds",
              title: "Birds",
              description: "Feathered vertebrates and flight",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "mammals",
              title: "Mammals",
              description: "Hair-bearing vertebrates",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "primate-evolution",
              title: "The Evolution of Primates",
              description: "Human evolutionary history",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-30",
          title: "Plant Form and Physiology",
          description: "Structure and function of plant bodies",
          concepts: [
            {
              id: "plant-body",
              title: "The Plant Body",
              description: "Basic plant anatomy and organization",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "stems",
              title: "Stems",
              description: "Structure and function of plant stems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "roots",
              title: "Roots",
              description: "Root systems and their functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "leaves",
              title: "Leaves",
              description: "Leaf structure and photosynthesis",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "water-transport",
              title: "Transport of Water and Solutes in Plants",
              description: "Vascular transport systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "plant-sensory",
              title: "Plant Sensory Systems and Responses",
              description: "How plants detect and respond to stimuli",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-31",
          title: "Soil and Plant Nutrition",
          description: "How plants obtain nutrients",
          concepts: [
            {
              id: "plant-nutrition",
              title: "Nutritional Requirements of Plants",
              description: "Essential nutrients for plant growth",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "soil",
              title: "The Soil",
              description: "Soil composition and properties",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nutritional-adaptations",
              title: "Nutritional Adaptations of Plants",
              description: "Special strategies for nutrient acquisition",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-32",
          title: "Plant Reproduction",
          description: "Sexual and asexual reproduction in plants",
          concepts: [
            {
              id: "reproductive-development",
              title: "Reproductive Development and Structure",
              description: "Development of reproductive organs",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "pollination-fertilization",
              title: "Pollination and Fertilization",
              description: "Sexual reproduction mechanisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "asexual-reproduction",
              title: "Asexual Reproduction",
              description: "Vegetative propagation methods",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-33",
          title: "The Animal Body: Basic Form and Function",
          description: "Fundamental principles of animal physiology",
          concepts: [
            {
              id: "animal-form-function",
              title: "Animal Form and Function",
              description: "Relationship between structure and function",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "animal-tissues",
              title: "Animal Primary Tissues",
              description: "Basic tissue types in animals",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "homeostasis",
              title: "Homeostasis",
              description: "Maintaining internal balance",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-34",
          title: "Animal Nutrition and the Digestive System",
          description: "How animals obtain and process food",
          concepts: [
            {
              id: "digestive-systems",
              title: "Digestive Systems",
              description: "Types of digestive systems",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "nutrition-energy",
              title: "Nutrition and Energy Production",
              description: "Nutritional requirements and energy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "digestive-processes",
              title: "Digestive System Processes",
              description: "Mechanical and chemical digestion",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "digestive-regulation",
              title: "Digestive System Regulation",
              description: "Control of digestive processes",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-35",
          title: "The Nervous System",
          description: "Neural control and coordination",
          concepts: [
            {
              id: "neurons-glia",
              title: "Neurons and Glial Cells",
              description: "Basic cellular components of nervous systems",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "neural-communication",
              title: "How Neurons Communicate",
              description: "Electrical and chemical signaling",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "central-nervous-system",
              title: "The Central Nervous System",
              description: "Brain and spinal cord organization",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "peripheral-nervous-system",
              title: "The Peripheral Nervous System",
              description: "Nerves and ganglia outside the CNS",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nervous-system-disorders",
              title: "Nervous System Disorders",
              description: "Diseases of the nervous system",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-36",
          title: "Sensory Systems",
          description: "How animals detect environmental stimuli",
          concepts: [
            {
              id: "sensory-processes",
              title: "Sensory Processes",
              description: "General principles of sensation",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "somatosensation",
              title: "Somatosensation",
              description: "Touch, temperature, and pain",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "taste-smell",
              title: "Taste and Smell",
              description: "Chemical senses",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hearing-vestibular",
              title: "Hearing and Vestibular Sensation",
              description: "Sound detection and balance",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "vision",
              title: "Vision",
              description: "Light detection and image formation",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-37",
          title: "The Endocrine System",
          description: "Hormonal control and regulation",
          concepts: [
            {
              id: "hormone-types",
              title: "Types of Hormones",
              description: "Chemical classes of hormones",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "hormone-function",
              title: "How Hormones Work",
              description: "Mechanisms of hormone action",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "body-process-regulation",
              title: "Regulation of Body Processes",
              description: "Hormonal control of physiology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hormone-production-regulation",
              title: "Regulation of Hormone Production",
              description: "Control of hormone synthesis and release",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "endocrine-glands",
              title: "Endocrine Glands",
              description: "Major hormone-producing organs",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-38",
          title: "The Musculoskeletal System",
          description: "Support and movement in animals",
          concepts: [
            {
              id: "skeletal-system-types",
              title: "Types of Skeletal Systems",
              description: "Different types of animal skeletons",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "bone",
              title: "Bone",
              description: "Structure and function of bone tissue",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "joints-movement",
              title: "Joints and Skeletal Movement",
              description: "Types of joints and their functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "muscle-contraction",
              title: "Muscle Contraction and Locomotion",
              description: "How muscles produce movement",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-39",
          title: "The Respiratory System",
          description: "Gas exchange in animals",
          concepts: [
            {
              id: "gas-exchange-systems",
              title: "Systems of Gas Exchange",
              description: "Different respiratory systems",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "respiratory-surfaces",
              title: "Gas Exchange across Respiratory Surfaces",
              description: "Mechanisms of gas exchange",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "breathing",
              title: "Breathing",
              description: "Ventilation mechanisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "gas-transport",
              title: "Transport of Gases in Human Bodily Fluids",
              description: "Oxygen and carbon dioxide transport",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-40",
          title: "The Circulatory System",
          description: "Transport of materials in animals",
          concepts: [
            {
              id: "circulatory-overview",
              title: "Overview of the Circulatory System",
              description: "Types of circulatory systems",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "blood-components",
              title: "Components of the Blood",
              description: "Blood composition and functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "heart-blood-vessels",
              title: "Mammalian Heart and Blood Vessels",
              description: "Structure of the cardiovascular system",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "blood-flow-regulation",
              title: "Blood Flow and Blood Pressure Regulation",
              description: "Control of circulation",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-41",
          title: "Osmotic Regulation and Excretion",
          description: "Water balance and waste removal",
          concepts: [
            {
              id: "osmoregulation",
              title: "Osmoregulation and Osmotic Balance",
              description: "Water and salt balance",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "kidneys-osmoregulation",
              title: "The Kidneys and Osmoregulatory Organs",
              description: "Organs that regulate water balance",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "excretion-systems",
              title: "Excretion Systems",
              description: "Removal of metabolic wastes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nitrogenous-wastes",
              title: "Nitrogenous Wastes",
              description: "Types of nitrogen waste products",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hormonal-osmoregulation",
              title: "Hormonal Control of Osmoregulatory Functions",
              description: "Hormonal regulation of water balance",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-42",
          title: "The Immune System",
          description: "Defense against pathogens",
          concepts: [
            {
              id: "innate-immunity",
              title: "Innate Immune Response",
              description: "Non-specific defense mechanisms",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "adaptive-immunity",
              title: "Adaptive Immune Response",
              description: "Specific immune responses",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "antibodies",
              title: "Antibodies",
              description: "Structure and function of antibodies",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "immune-disruptions",
              title: "Disruptions in the Immune System",
              description: "Immune system disorders",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-43",
          title: "Animal Reproduction and Development",
          description: "Reproductive strategies and development",
          concepts: [
            {
              id: "reproduction-methods",
              title: "Reproduction Methods",
              description: "Sexual and asexual reproduction in animals",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "fertilization",
              title: "Fertilization",
              description: "Sperm and egg fusion",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "human-reproduction",
              title: "Human Reproductive Anatomy and Gametogenesis",
              description: "Human reproductive systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hormonal-reproduction",
              title: "Hormonal Control of Human Reproduction",
              description: "Reproductive hormones",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pregnancy-birth",
              title: "Human Pregnancy and Birth",
              description: "Development and birth process",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "embryonic-development",
              title: "Fertilization and Early Embryonic Development",
              description: "Early stages of development",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "organogenesis",
              title: "Organogenesis and Vertebrate Formation",
              description: "Organ system development",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-44",
          title: "Ecology and the Biosphere",
          description: "Environmental interactions and global ecology",
          concepts: [
            {
              id: "ecology-scope",
              title: "The Scope of Ecology",
              description: "Levels of ecological organization",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "biogeography",
              title: "Biogeography",
              description: "Distribution of life on Earth",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "terrestrial-biomes",
              title: "Terrestrial Biomes",
              description: "Major land-based ecosystems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "aquatic-biomes",
              title: "Aquatic Biomes",
              description: "Freshwater and marine ecosystems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "climate-change",
              title: "Climate and the Effects of Global Climate Change",
              description: "Climate patterns and global change",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-45",
          title: "Population and Community Ecology",
          description: "Interactions within and between species",
          concepts: [
            {
              id: "population-demography",
              title: "Population Demography",
              description: "Population structure and dynamics",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "life-histories",
              title: "Life Histories and Natural Selection",
              description: "Evolutionary strategies",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "population-limits",
              title: "Environmental Limits to Population Growth",
              description: "Carrying capacity and limiting factors",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "population-dynamics",
              title: "Population Dynamics and Regulation",
              description: "Population growth and regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "human-population",
              title: "Human Population Growth",
              description: "Human demographics and growth",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "community-ecology",
              title: "Community Ecology",
              description: "Species interactions and communities",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "behavioral-biology",
              title: "Behavioral Biology: Proximate and Ultimate Causes of Behavior",
              description: "Animal behavior and its evolution",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-46",
          title: "Ecosystems",
          description: "Energy flow and nutrient cycling",
          concepts: [
            {
              id: "ecosystem-ecology",
              title: "Ecology of Ecosystems",
              description: "Ecosystem structure and function",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "energy-flow",
              title: "Energy Flow through Ecosystems",
              description: "Trophic levels and energy transfer",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "biogeochemical-cycles",
              title: "Biogeochemical Cycles",
              description: "Nutrient cycling in ecosystems",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chapter-47",
          title: "Conservation Biology and Biodiversity",
          description: "Protecting Earth's biological diversity",
          concepts: [
            {
              id: "biodiversity-crisis",
              title: "The Biodiversity Crisis",
              description: "Current threats to biodiversity",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "biodiversity-importance",
              title: "The Importance of Biodiversity to Human Life",
              description: "Ecosystem services and human welfare",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "biodiversity-threats",
              title: "Threats to Biodiversity",
              description: "Human impacts on biodiversity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "preserving-biodiversity",
              title: "Preserving Biodiversity",
              description: "Conservation strategies and solutions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        }
      ]
    },
    "anatomy": {
      title: "Anatomy and Physiology",
      sections: [
        {
          id: "overview",
          title: "Overview",
          description: "Study of human body structure and organization",
          content: `Human Anatomy and Physiology is the study of the structure and function of the human body. This course provides a systematic examination of all body systems from the cellular level to complex organ systems.

You'll learn about the fundamental organization of life from molecules to organs, and how these structures work together to maintain life. The course covers all major body systems including skeletal, muscular, cardiovascular, nervous, endocrine, and reproductive systems.

This comprehensive course integrates structure and function, showing how anatomy and physiology are interconnected. You'll develop a deep understanding of how the human body maintains homeostasis and responds to internal and external changes.

By the end of this course, you'll have detailed knowledge of human anatomy and physiology and understand how structure relates to function in the human body.`
        },
        {
          id: "introduction-to-human-body",
          title: "An Introduction to the Human Body",
          description: "Overview of anatomy and physiology, body organization, and basic concepts",
          concepts: [
            {
              id: "anatomy-physiology-overview",
              title: "Overview of Anatomy and Physiology",
              description: "Definition and scope of anatomy and physiology study",
              completed: false,
              locked: false,
              progress: 0
            },
            {
              id: "structural-organization",
              title: "Structural Organization of the Human Body",
              description: "Levels of structural organization from atoms to organ systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "functions-of-human-life",
              title: "Functions of Human Life",
              description: "Essential life processes and characteristics of living organisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "requirements-for-human-life",
              title: "Requirements for Human Life",
              description: "Basic needs for survival and optimal functioning",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "homeostasis",
              title: "Homeostasis",
              description: "Dynamic equilibrium and regulatory mechanisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "anatomical-terminology",
              title: "Anatomical Terminology",
              description: "Standard terminology used in anatomy and physiology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "medical-imaging",
              title: "Medical Imaging",
              description: "Various imaging techniques used in medical diagnosis",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "chemical-level-organization",
          title: "The Chemical Level of Organization",
          description: "Chemical foundations of life including atoms, molecules, and chemical reactions",
          concepts: [
            {
              id: "elements-and-atoms",
              title: "Elements and Atoms: The Building Blocks of Matter",
              description: "Atomic structure and properties of biologically important elements",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "chemical-bonds",
              title: "Chemical Bonds",
              description: "Types of chemical bonds and their role in biological molecules",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "chemical-reactions",
              title: "Chemical Reactions",
              description: "Types of chemical reactions and their biological significance",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "inorganic-compounds",
              title: "Inorganic Compounds Essential to Human Functioning",
              description: "Water, acids, bases, and salts in biological systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "organic-compounds",
              title: "Organic Compounds Essential to Human Functioning",
              description: "Carbohydrates, lipids, proteins, and nucleic acids",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "cellular-level-organization",
          title: "The Cellular Level of Organization",
          description: "Cell structure, function, and cellular processes",
          concepts: [
            {
              id: "cell-membrane",
              title: "The Cell Membrane",
              description: "Structure and function of the plasma membrane",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cytoplasm-organelles",
              title: "The Cytoplasm and Cellular Organelles",
              description: "Internal structure and organelles of cells",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nucleus-dna-replication",
              title: "The Nucleus and DNA Replication",
              description: "Nuclear structure and DNA replication processes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "protein-synthesis",
              title: "Protein Synthesis",
              description: "Transcription and translation processes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cell-growth-division",
              title: "Cell Growth and Division",
              description: "Cell cycle and mitosis",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cellular-differentiation",
              title: "Cellular Differentiation",
              description: "Development of specialized cell types",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "tissue-level-organization",
          title: "The Tissue Level of Organization",
          description: "Four basic tissue types and their functions",
          concepts: [
            {
              id: "types-of-tissues",
              title: "Types of Tissues",
              description: "Overview of epithelial, connective, muscle, and nervous tissue",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "epithelial-tissue",
              title: "Epithelial Tissue",
              description: "Structure and function of epithelial tissue types",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "connective-tissue",
              title: "Connective Tissue Supports and Protects",
              description: "Types and functions of connective tissue",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "muscle-tissue-motion",
              title: "Muscle Tissue and Motion",
              description: "Types of muscle tissue and their functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nervous-tissue",
              title: "Nervous Tissue Mediates Perception and Response",
              description: "Structure and function of nervous tissue",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "tissue-injury-aging",
              title: "Tissue Injury and Aging",
              description: "Response to injury and age-related changes",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "integumentary-system",
          title: "The Integumentary System",
          description: "Structure and function of skin and associated structures",
          concepts: [
            {
              id: "layers-of-skin",
              title: "Layers of the Skin",
              description: "Epidermis, dermis, and hypodermis structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "accessory-structures",
              title: "Accessory Structures of the Skin",
              description: "Hair, nails, and skin glands",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "integumentary-functions",
              title: "Functions of the Integumentary System",
              description: "Protection, temperature regulation, and other functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "integumentary-diseases",
              title: "Diseases, Disorders, and Injuries of the Integumentary System",
              description: "Common skin conditions and injuries",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "bone-tissue-skeletal-system",
          title: "Bone Tissue and the Skeletal System",
          description: "Structure and function of bone tissue and the skeletal system",
          concepts: [
            {
              id: "skeletal-system-functions",
              title: "The Functions of the Skeletal System",
              description: "Support, protection, movement, and metabolic functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bone-classification",
              title: "Bone Classification",
              description: "Types of bones based on shape and structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bone-structure",
              title: "Bone Structure",
              description: "Microscopic and macroscopic bone anatomy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bone-formation-development",
              title: "Bone Formation and Development",
              description: "Ossification and bone growth processes",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "bone-fractures-repair",
              title: "Fractures: Bone Repair",
              description: "Types of fractures and healing process",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exercise-nutrition-bone",
              title: "Exercise, Nutrition, Hormones, and Bone Tissue",
              description: "Factors affecting bone health and remodeling",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "calcium-homeostasis",
              title: "Calcium Homeostasis: Interactions of the Skeletal System and Other Organ Systems",
              description: "Calcium regulation and systemic interactions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "axial-skeleton",
          title: "Axial Skeleton",
          description: "Structure and function of the axial skeleton",
          concepts: [
            {
              id: "skeletal-system-divisions",
              title: "Divisions of the Skeletal System",
              description: "Axial and appendicular skeleton organization",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "skull",
              title: "The Skull",
              description: "Cranial and facial bones of the skull",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "vertebral-column",
              title: "The Vertebral Column",
              description: "Structure and function of the spine",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thoracic-cage",
              title: "The Thoracic Cage",
              description: "Ribs and sternum structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "axial-skeleton-development",
              title: "Embryonic Development of the Axial Skeleton",
              description: "Development of axial skeleton components",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "appendicular-skeleton",
          title: "The Appendicular Skeleton",
          description: "Structure and function of the appendicular skeleton",
          concepts: [
            {
              id: "pectoral-girdle",
              title: "The Pectoral Girdle",
              description: "Clavicle and scapula structure and function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "upper-limb-bones",
              title: "Bones of the Upper Limb",
              description: "Humerus, radius, ulna, and hand bones",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pelvic-girdle",
              title: "The Pelvic Girdle and Pelvis",
              description: "Hip bones and pelvic structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lower-limb-bones",
              title: "Bones of the Lower Limb",
              description: "Femur, tibia, fibula, and foot bones",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "appendicular-skeleton-development",
              title: "Development of the Appendicular Skeleton",
              description: "Development of appendicular skeleton components",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "joints",
          title: "Joints",
          description: "Classification and function of joints",
          concepts: [
            {
              id: "joint-classification",
              title: "Classification of Joints",
              description: "Structural and functional classification of joints",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fibrous-joints",
              title: "Fibrous Joints",
              description: "Immovable fibrous joint types",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cartilaginous-joints",
              title: "Cartilaginous Joints",
              description: "Slightly movable cartilaginous joints",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "synovial-joints",
              title: "Synovial Joints",
              description: "Freely movable synovial joint structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "body-movements",
              title: "Types of Body Movements",
              description: "Movement terminology and types",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "synovial-joint-anatomy",
              title: "Anatomy of Selected Synovial Joints",
              description: "Detailed anatomy of major synovial joints",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "joint-development",
              title: "Development of Joints",
              description: "Formation and development of joint structures",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "muscle-tissue",
          title: "Muscle Tissue",
          description: "Structure and function of muscle tissue types",
          concepts: [
            {
              id: "muscle-tissue-overview",
              title: "Overview of Muscle Tissues",
              description: "Three types of muscle tissue and their properties",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "skeletal-muscle",
              title: "Skeletal Muscle",
              description: "Structure and organization of skeletal muscle",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "muscle-fiber-contraction",
              title: "Muscle Fiber Contraction and Relaxation",
              description: "Mechanism of skeletal muscle contraction",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nervous-system-muscle-control",
              title: "Nervous System Control of Muscle Tension",
              description: "Neural control of muscle contraction",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "muscle-fiber-types",
              title: "Types of Muscle Fibers",
              description: "Classification of skeletal muscle fibers",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "exercise-muscle-performance",
              title: "Exercise and Muscle Performance",
              description: "Effects of exercise on muscle tissue",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cardiac-muscle",
              title: "Cardiac Muscle Tissue",
              description: "Structure and function of cardiac muscle",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "smooth-muscle",
              title: "Smooth Muscle",
              description: "Structure and function of smooth muscle",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "muscle-development-regeneration",
              title: "Development and Regeneration of Muscle Tissue",
              description: "Muscle tissue development and repair",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "muscular-system",
          title: "The Muscular System",
          description: "Organization and function of skeletal muscles",
          concepts: [
            {
              id: "skeletal-muscle-interactions",
              title: "Interactions of Skeletal Muscles, Their Fascicle Arrangement, and Their Lever Systems",
              description: "Muscle organization and mechanical advantage",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "naming-skeletal-muscles",
              title: "Naming Skeletal Muscles",
              description: "Muscle naming conventions and terminology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "axial-muscles-head-neck",
              title: "Axial Muscles of the Head, Neck, and Back",
              description: "Muscles of the head, neck, and back region",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "axial-muscles-abdomen-thorax",
              title: "Axial Muscles of the Abdominal Wall, and Thorax",
              description: "Muscles of the trunk region",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pectoral-upper-limb-muscles",
              title: "Muscles of the Pectoral Girdle and Upper Limbs",
              description: "Upper extremity muscle groups",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pelvic-lower-limb-muscles",
              title: "Appendicular Muscles of the Pelvic Girdle and Lower Limbs",
              description: "Lower extremity muscle groups",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "nervous-system-tissue",
          title: "The Nervous System and Nervous Tissue",
          description: "Basic structure and function of nervous tissue",
          concepts: [
            {
              id: "nervous-system-structure-function",
              title: "Basic Structure and Function of the Nervous System",
              description: "Organization of the nervous system",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nervous-tissue-structure",
              title: "Nervous Tissue",
              description: "Neurons and glial cells structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nervous-tissue-function",
              title: "The Function of Nervous Tissue",
              description: "Nerve impulse generation and propagation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "action-potential",
              title: "The Action Potential",
              description: "Generation and propagation of action potentials",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "neuron-communication",
              title: "Communication Between Neurons",
              description: "Synaptic transmission and neurotransmitters",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "anatomy-nervous-system",
          title: "Anatomy of the Nervous System",
          description: "Structure and organization of the nervous system",
          concepts: [
            {
              id: "embryologic-perspective",
              title: "The Embryologic Perspective",
              description: "Development of the nervous system",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "central-nervous-system",
              title: "The Central Nervous System",
              description: "Brain and spinal cord structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "circulation-cns",
              title: "Circulation and the Central Nervous System",
              description: "Blood supply to the brain and spinal cord",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "peripheral-nervous-system",
              title: "The Peripheral Nervous System",
              description: "Cranial and spinal nerves",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "somatic-nervous-system",
          title: "The Somatic Nervous System",
          description: "Sensory and motor pathways of the somatic nervous system",
          concepts: [
            {
              id: "sensory-perception",
              title: "Sensory Perception",
              description: "Sensory receptor types and sensory processing",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "central-processing",
              title: "Central Processing",
              description: "Brain processing of sensory information",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "motor-responses",
              title: "Motor Responses",
              description: "Motor control and voluntary movement",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "autonomic-nervous-system",
          title: "The Autonomic Nervous System",
          description: "Structure and function of the autonomic nervous system",
          concepts: [
            {
              id: "autonomic-divisions",
              title: "Divisions of the Autonomic Nervous System",
              description: "Sympathetic and parasympathetic divisions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "autonomic-reflexes",
              title: "Autonomic Reflexes and Homeostasis",
              description: "Involuntary responses and homeostatic control",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "central-control",
              title: "Central Control",
              description: "Brain control of autonomic functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "autonomic-drugs",
              title: "Drugs that Affect the Autonomic System",
              description: "Pharmacological effects on autonomic function",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "neurological-exam",
          title: "The Neurological Exam",
          description: "Clinical assessment of nervous system function",
          concepts: [
            {
              id: "neurological-exam-overview",
              title: "Overview of the Neurological Exam",
              description: "Components of neurological assessment",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "mental-status-exam",
              title: "The Mental Status Exam",
              description: "Assessment of cognitive function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cranial-nerve-exam",
              title: "The Cranial Nerve Exam",
              description: "Testing cranial nerve function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "sensory-motor-exams",
              title: "The Sensory and Motor Exams",
              description: "Testing sensory and motor function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "coordination-gait-exams",
              title: "The Coordination and Gait Exams",
              description: "Testing coordination and walking ability",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "endocrine-system",
          title: "The Endocrine System",
          description: "Structure and function of the endocrine system",
          concepts: [
            {
              id: "endocrine-overview",
              title: "An Overview of the Endocrine System",
              description: "Endocrine glands and hormone classification",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hormones",
              title: "Hormones",
              description: "Chemical nature and mechanisms of hormone action",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pituitary-hypothalamus",
              title: "The Pituitary Gland and Hypothalamus",
              description: "Structure and function of the pituitary-hypothalamic system",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "thyroid-gland",
              title: "The Thyroid Gland",
              description: "Thyroid structure and hormone production",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "parathyroid-glands",
              title: "The Parathyroid Glands",
              description: "Parathyroid hormone and calcium regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "adrenal-glands",
              title: "The Adrenal Glands",
              description: "Adrenal cortex and medulla function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "pineal-gland",
              title: "The Pineal Gland",
              description: "Melatonin production and circadian rhythms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "gonadal-placental-hormones",
              title: "Gonadal and Placental Hormones",
              description: "Sex hormones and reproductive function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "endocrine-pancreas",
              title: "The Endocrine Pancreas",
              description: "Insulin and glucagon regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "secondary-endocrine-organs",
              title: "Organs with Secondary Endocrine Functions",
              description: "Organs with additional endocrine roles",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "endocrine-development-aging",
              title: "Development and Aging of the Endocrine System",
              description: "Endocrine system changes throughout life",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "cardiovascular-blood",
          title: "The Cardiovascular System: Blood",
          description: "Composition and functions of blood",
          concepts: [
            {
              id: "blood-overview",
              title: "An Overview of Blood",
              description: "Blood composition and basic functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "formed-elements-production",
              title: "Production of the Formed Elements",
              description: "Hematopoiesis and blood cell formation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "erythrocytes",
              title: "Erythrocytes",
              description: "Red blood cell structure and function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "leukocytes-platelets",
              title: "Leukocytes and Platelets",
              description: "White blood cells and platelet function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "hemostasis",
              title: "Hemostasis",
              description: "Blood clotting and bleeding control",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "blood-typing",
              title: "Blood Typing",
              description: "ABO and Rh blood group systems",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "cardiovascular-heart",
          title: "The Cardiovascular System: The Heart",
          description: "Structure and function of the heart",
          concepts: [
            {
              id: "heart-anatomy",
              title: "Heart Anatomy",
              description: "Chambers, valves, and wall structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cardiac-muscle-electrical",
              title: "Cardiac Muscle and Electrical Activity",
              description: "Cardiac muscle properties and electrical conduction",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cardiac-cycle",
              title: "Cardiac Cycle",
              description: "Systole and diastole in the cardiac cycle",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "cardiac-physiology",
              title: "Cardiac Physiology",
              description: "Cardiac output and regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "heart-development",
              title: "Development of the Heart",
              description: "Embryonic heart development",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "cardiovascular-vessels-circulation",
          title: "The Cardiovascular System: Blood Vessels and Circulation",
          description: "Structure and function of blood vessels and circulation",
          concepts: [
            {
              id: "blood-vessel-structure",
              title: "Structure and Function of Blood Vessels",
              description: "Arteries, veins, and capillary structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "blood-flow-pressure",
              title: "Blood Flow, Blood Pressure, and Resistance",
              description: "Hemodynamics and blood pressure regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "capillary-exchange",
              title: "Capillary Exchange",
              description: "Nutrient and waste exchange at capillaries",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "homeostatic-regulation",
              title: "Homeostatic Regulation of the Vascular System",
              description: "Blood pressure and flow regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "circulatory-pathways",
              title: "Circulatory Pathways",
              description: "Major circulation routes in the body",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "blood-vessel-development",
              title: "Development of Blood Vessels and Fetal Circulation",
              description: "Vascular development and fetal circulation",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "lymphatic-immune-system",
          title: "The Lymphatic and Immune System",
          description: "Structure and function of the lymphatic and immune systems",
          concepts: [
            {
              id: "lymphatic-immune-anatomy",
              title: "Anatomy of the Lymphatic and Immune Systems",
              description: "Lymphatic organs and immune system components",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "barrier-defenses",
              title: "Barrier Defenses and the Innate Immune Response",
              description: "First line of defense and innate immunity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "adaptive-immune-t-cells",
              title: "The Adaptive Immune Response: T lymphocytes and Their Functional Types",
              description: "T cell types and cellular immunity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "adaptive-immune-b-cells",
              title: "The Adaptive Immune Response: B-lymphocytes and Antibodies",
              description: "B cell function and humoral immunity",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "immune-response-pathogens",
              title: "The Immune Response against Pathogens",
              description: "Integrated immune responses to infections",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "immune-diseases",
              title: "Diseases Associated with Depressed or Overactive Immune Responses",
              description: "Immunodeficiency and autoimmune diseases",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "transplantation-cancer-immunology",
              title: "Transplantation and Cancer Immunology",
              description: "Immune responses in transplantation and cancer",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "respiratory-system",
          title: "The Respiratory System",
          description: "Structure and function of the respiratory system",
          concepts: [
            {
              id: "respiratory-organs-structures",
              title: "Organs and Structures of the Respiratory System",
              description: "Anatomy of the respiratory tract",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lungs",
              title: "The Lungs",
              description: "Lung structure and alveolar organization",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "process-breathing",
              title: "The Process of Breathing",
              description: "Ventilation mechanics and control",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "gas-exchange",
              title: "Gas Exchange",
              description: "Oxygen and carbon dioxide exchange",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "transport-gases",
              title: "Transport of Gases",
              description: "Oxygen and carbon dioxide transport in blood",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "respiratory-modifications",
              title: "Modifications in Respiratory Functions",
              description: "Adaptations and non-respiratory functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "respiratory-development",
              title: "Embryonic Development of the Respiratory System",
              description: "Development of respiratory structures",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "digestive-system",
          title: "The Digestive System",
          description: "Structure and function of the digestive system",
          concepts: [
            {
              id: "digestive-system-overview",
              title: "Overview of the Digestive System",
              description: "General organization and function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "digestive-processes-regulation",
              title: "Digestive System Processes and Regulation",
              description: "Digestion, absorption, and regulatory mechanisms",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "mouth-pharynx-esophagus",
              title: "The Mouth, Pharynx, and Esophagus",
              description: "Upper digestive tract structure and function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "stomach",
              title: "The Stomach",
              description: "Stomach structure and digestive function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "small-large-intestines",
              title: "The Small and Large Intestines",
              description: "Intestinal structure and function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "accessory-organs-digestion",
              title: "Accessory Organs in Digestion: The Liver, Pancreas, and Gallbladder",
              description: "Digestive accessory organ functions",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "chemical-digestion-absorption",
              title: "Chemical Digestion and Absorption: A Closer Look",
              description: "Detailed mechanisms of digestion and absorption",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "metabolism-nutrition",
          title: "Metabolism and Nutrition",
          description: "Cellular metabolism and nutritional requirements",
          concepts: [
            {
              id: "metabolic-reactions-overview",
              title: "Overview of Metabolic Reactions",
              description: "Catabolism and anabolism principles",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "carbohydrate-metabolism",
              title: "Carbohydrate Metabolism",
              description: "Glucose metabolism and energy production",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lipid-metabolism",
              title: "Lipid Metabolism",
              description: "Fat metabolism and fatty acid oxidation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "protein-metabolism",
              title: "Protein Metabolism",
              description: "Amino acid metabolism and protein synthesis",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "metabolic-states",
              title: "Metabolic States of the Body",
              description: "Fed and fasted states and their regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "energy-heat-balance",
              title: "Energy and Heat Balance",
              description: "Energy expenditure and thermoregulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "nutrition-diet",
              title: "Nutrition and Diet",
              description: "Nutritional requirements and dietary recommendations",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "urinary-system",
          title: "The Urinary System",
          description: "Structure and function of the urinary system",
          concepts: [
            {
              id: "urine-physical-characteristics",
              title: "Physical Characteristics of Urine",
              description: "Urine composition and properties",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "gross-anatomy-urine-transport",
              title: "Gross Anatomy of Urine Transport",
              description: "Ureters, bladder, and urethra structure",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "gross-anatomy-kidney",
              title: "Gross Anatomy of the Kidney",
              description: "Kidney structure and organization",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "microscopic-anatomy-kidney",
              title: "Microscopic Anatomy of the Kidney",
              description: "Nephron structure and function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "physiology-urine-formation",
              title: "Physiology of Urine Formation",
              description: "Filtration, reabsorption, and secretion",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "tubular-reabsorption",
              title: "Tubular Reabsorption",
              description: "Reabsorption mechanisms and regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "renal-blood-flow-regulation",
              title: "Regulation of Renal Blood Flow",
              description: "Autoregulation and blood flow control",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "endocrine-regulation-kidney",
              title: "Endocrine Regulation of Kidney Function",
              description: "Hormonal control of kidney function",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fluid-volume-composition-regulation",
              title: "Regulation of Fluid Volume and Composition",
              description: "Water and electrolyte balance",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "urinary-homeostasis",
              title: "The Urinary System and Homeostasis",
              description: "Urinary system role in homeostasis",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "fluid-electrolyte-acid-base",
          title: "Fluid, Electrolyte, and Acid-Base Balance",
          description: "Homeostatic regulation of body fluids and pH",
          concepts: [
            {
              id: "body-fluids-compartments",
              title: "Body Fluids and Fluid Compartments",
              description: "Intracellular and extracellular fluid compartments",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "water-balance",
              title: "Water Balance",
              description: "Water intake and loss regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "electrolyte-balance",
              title: "Electrolyte Balance",
              description: "Sodium, potassium, and electrolyte regulation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "acid-base-balance",
              title: "Acid-Base Balance",
              description: "pH regulation and buffer systems",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "acid-base-disorders",
              title: "Disorders of Acid-Base Balance",
              description: "Acidosis and alkalosis conditions",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "reproductive-system",
          title: "The Reproductive System",
          description: "Structure and function of the reproductive system",
          concepts: [
            {
              id: "testicular-reproductive-system",
              title: "Anatomy and Physiology of the Testicular Reproductive System",
              description: "Male reproductive anatomy and physiology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "ovarian-reproductive-system",
              title: "Anatomy and Physiology of the Ovarian Reproductive System",
              description: "Female reproductive anatomy and physiology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "reproductive-system-development",
              title: "Development of the Male and Female Reproductive Systems",
              description: "Embryonic development of reproductive organs",
              completed: false,
              locked: true,
              progress: 0
            }
          ]
        },
        {
          id: "development-inheritance",
          title: "Development and Inheritance",
          description: "Human development and inheritance patterns",
          concepts: [
            {
              id: "fertilization",
              title: "Fertilization",
              description: "Sperm-egg interaction and fertilization process",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "embryonic-development",
              title: "Embryonic Development",
              description: "Early development from fertilization to organ formation",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "fetal-development",
              title: "Fetal Development",
              description: "Development during the fetal period",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "changes-pregnancy-labor-birth",
              title: "Changes During Pregnancy, Labor, and Birth",
              description: "Maternal and fetal changes during pregnancy",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "infant-adjustments-birth",
              title: "Adjustments of the Infant at Birth and Postnatal Stages",
              description: "Physiological changes at birth and early development",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "lactation",
              title: "Lactation",
              description: "Milk production and breastfeeding physiology",
              completed: false,
              locked: true,
              progress: 0
            },
            {
              id: "patterns-of-inheritance",
              title: "Patterns of Inheritance",
              description: "Genetics and inheritance patterns in humans",
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
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold">{currentSection.title}</h2>
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