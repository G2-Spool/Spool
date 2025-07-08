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