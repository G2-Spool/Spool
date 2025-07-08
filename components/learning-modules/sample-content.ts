import { ConceptItem, LearningModule } from './types'

// Sample content demonstrating all module types
export const sampleConcepts: ConceptItem[] = [
  {
    id: "introduction-to-functions",
    title: "Introduction to Functions",
    description: "Understanding the basic concept of functions and their importance",
    completed: true,
    locked: false,
    progress: 100,
    modules: [
      {
        id: "text-intro",
        type: "text",
        order: 1,
                  title: "What is a Function?",
          content: "A function is a relationship between inputs and outputs. For every input, there is exactly one output.\n\nFunctions are fundamental to mathematics and appear everywhere in our daily lives. From the relationship between time and distance when driving, to the connection between study time and test scores.\n\nIn mathematics, we often write functions using notation like $f(x) = y$, where $x$ is the input and $y$ is the output. A more general form can be written as:\n\n$$f: X \\rightarrow Y$$\n\nThis notation means function $f$ maps elements from set $X$ to set $Y$."
      },
      {
        id: "quote-galileo",
        type: "quote",
        order: 2,
        content: "Mathematics is the language with which God has written the universe.",
        author: "Galileo Galilei",
        citation: "Il Saggiatore (1623)"
      },
      {
        id: "latex-notation",
        type: "latex",
        order: 3,
        title: "Function Notation",
        equation: "f(x) = y",
        description: "This reads as 'f of x equals y', where x is the input and y is the output."
      },
      {
        id: "diagram-function-machine",
        type: "diagram",
        order: 4,
        imageUrl: "/placeholder.svg",
        caption: "Figure 1: A function as a machine that takes inputs and produces outputs",
        alt: "Diagram showing a function as a machine with input x going in and output f(x) coming out"
      }
    ]
  },
  {
    id: "domain-and-range",
    title: "Domain and Range",
    description: "Understanding the domain and range of functions",
    completed: false,
    locked: false,
    progress: 65,
    modules: [
      {
        id: "text-domain-range",
        type: "text",
        order: 1,
                  title: "Domain and Range Basics",
          content: "The domain of a function is the set of all possible input values. The range is the set of all possible output values.\n\nThink of domain as 'what can go in' and range as 'what can come out'.\n\nFor example, consider the function $f(x) = x^2$. The domain is all real numbers (we can square any real number), but the range is only non-negative real numbers since $x^2 \\geq 0$ for all real $x$.\n\nFor a square area function $A(s) = s^2$ where $s$ is the side length, both domain and range would be positive real numbers: $s > 0$ and $A > 0$."
      },
      {
        id: "youtube-domain-range",
        type: "youtube",
        order: 2,
        videoId: "dQw4w9WgXcQ",
        title: "Domain and Range Examples",
        description: "Watch this video for visual examples of finding domain and range",
        startTime: 30,
        endTime: 180
      },
      {
        id: "assignment-find-domain",
        type: "assignment",
        order: 3,
        title: "Find the Domain",
        description: "Practice identifying the domain of various functions",
        isCompleted: false,
        isCollapsed: false,
        modules: [
          {
            id: "text-assignment-intro",
            type: "text",
            order: 1,
            content: "Find the domain of the following function. Remember: The domain includes all real numbers except those that make the denominator zero or cause other undefined operations."
          },
          {
            id: "latex-assignment-function",
            type: "latex",
            order: 2,
            equation: "f(x) = \\frac{1}{x-2}",
            description: "The function we're analyzing"
          },
          {
            id: "text-assignment-hint",
            type: "text",
            order: 3,
            content: "Hint: What value of x would make the denominator equal to zero?"
          }
        ]
      },
      {
        id: "latex-domain-example",
        type: "latex",
        order: 4,
        title: "Domain Example",
        equation: "\\text{Domain of } f(x) = \\frac{1}{x-2}: \\quad x \\in \\mathbb{R}, x \\neq 2",
        description: "The domain excludes x = 2 because it would make the denominator zero."
      }
    ]
  },
  {
    id: "linear-functions",
    title: "Linear Functions",
    description: "Exploring linear functions and their properties",
    completed: false,
    locked: false,
    progress: 30,
    modules: [
      {
        id: "text-linear-intro",
        type: "text",
        order: 1,
                  title: "Linear Functions",
          content: "A linear function is a function whose graph forms a straight line. The general form is $f(x) = mx + b$, where $m$ is the slope and $b$ is the y-intercept.\n\nLinear functions have a constant rate of change, meaning they increase or decrease at a steady rate. The slope $m$ represents this rate of change:\n\n$$m = \\frac{\\Delta y}{\\Delta x} = \\frac{y_2 - y_1}{x_2 - x_1}$$\n\nFor example, the function $f(x) = 2x + 3$ has a slope of $m = 2$ and y-intercept of $b = 3$."
      },
      {
        id: "latex-linear-form",
        type: "latex",
        order: 2,
        title: "Standard Form",
        equation: "f(x) = mx + b",
        description: "Where m is the slope and b is the y-intercept"
      },
      {
        id: "diagram-linear-graph",
        type: "diagram",
        order: 3,
        imageUrl: "/placeholder.svg",
        caption: "Figure 2: Example of a linear function showing slope and y-intercept",
        alt: "Graph of a linear function with slope and y-intercept labeled"
      },
      {
        id: "quote-descartes",
        type: "quote",
        order: 4,
        content: "The reading of all good books is like a conversation with the finest minds of past centuries.",
        author: "René Descartes",
        citation: "Discourse on Method (1637)"
      },
      {
        id: "assignment-slope-intercept",
        type: "assignment",
        order: 5,
        title: "Find Slope and Y-Intercept",
        description: "Practice identifying slope and y-intercept from linear equations",
        isCompleted: false,
        isCollapsed: false,
        modules: [
          {
            id: "text-slope-problem",
            type: "text",
            order: 1,
            content: "Given the linear function below, identify the slope and y-intercept:"
          },
          {
            id: "latex-slope-equation",
            type: "latex",
            order: 2,
            equation: "f(x) = 3x - 4",
            description: "Linear function to analyze"
          }
        ]
      }
    ]
  },
  {
    id: "quadratic-functions",
    title: "Quadratic Functions",
    description: "Understanding quadratic functions and parabolas",
    completed: false,
    locked: true,
    progress: 0,
    modules: [
      {
        id: "text-quadratic-intro",
        type: "text",
        order: 1,
        title: "Quadratic Functions",
        content: "A quadratic function is a function of the form f(x) = ax² + bx + c, where a ≠ 0. The graph of a quadratic function is always a parabola."
      },
      {
        id: "latex-quadratic-form",
        type: "latex",
        order: 2,
        title: "Standard Form",
        equation: "f(x) = ax^2 + bx + c",
        description: "Where a, b, and c are constants and a ≠ 0"
      }
    ]
  },
  {
    id: "exponential-functions",
    title: "Exponential Functions",
    description: "Exploring exponential growth and decay",
    completed: false,
    locked: true,
    progress: 0,
    modules: [
      {
        id: "text-exponential-intro",
        type: "text",
        order: 1,
        title: "Exponential Functions",
        content: "An exponential function is a function of the form f(x) = a·b^x, where a > 0 and b > 0, b ≠ 1. These functions model growth and decay in many real-world situations."
      },
      {
        id: "latex-exponential-form",
        type: "latex",
        order: 2,
        title: "Standard Form",
        equation: "f(x) = a \\cdot b^x",
        description: "Where a > 0 and b > 0, b ≠ 1"
      },
      {
        id: "youtube-exponential-growth",
        type: "youtube",
        order: 3,
        videoId: "dQw4w9WgXcQ",
        title: "Exponential Growth in Nature",
        description: "Examples of exponential growth in biology and economics"
      }
    ]
  }
]

// Helper function to create sample modules for developers
export const createSampleModules = (): LearningModule[] => [
  {
    id: "sample-text",
    type: "text",
    order: 1,
    title: "Sample Text Module",
    content: "This is a sample text module. You can use this to display lecture content, explanations, or any other textual information.\n\nIt supports multiple paragraphs and maintains formatting."
  },
  {
    id: "sample-quote",
    type: "quote",
    order: 2,
    content: "This is a sample quote that demonstrates how to add inspirational or relevant quotes to your learning content.",
    author: "Sample Author",
    citation: "Sample Citation (2024)"
  },
  {
    id: "sample-latex",
    type: "latex",
    order: 3,
    title: "Sample LaTeX Equation",
    equation: "E = mc^2",
    description: "Einstein's famous mass-energy equivalence formula"
  },
  {
    id: "sample-diagram",
    type: "diagram",
    order: 4,
    imageUrl: "/placeholder.svg",
    caption: "Sample diagram showing how to include images with captions",
    alt: "Sample diagram placeholder"
  },
  {
    id: "sample-youtube",
    type: "youtube",
    order: 5,
    videoId: "dQw4w9WgXcQ",
    title: "Sample YouTube Video",
    description: "This shows how to embed YouTube videos in your learning content",
    startTime: 0,
    endTime: 60
  },
  {
    id: "sample-assignment",
    type: "assignment",
    order: 6,
    title: "Sample Assignment",
    description: "This is a sample assignment that demonstrates the interactive features",
    isCompleted: false,
    isCollapsed: false,
    modules: [
      {
        id: "assignment-text",
        type: "text",
        order: 1,
        content: "This is the content inside an assignment. Assignments can contain other modules like text, equations, and diagrams."
      },
      {
        id: "assignment-latex",
        type: "latex",
        order: 2,
        equation: "\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}",
        description: "Formula for the sum of first n natural numbers"
      }
    ]
  }
]

// Export default sample content
export default sampleConcepts 