import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateMockOnboardingData() {
  return {
    interests: ["guitar", "cooking", "video games"],
    interestDetails: {
      guitar: "I love the creative expression and the way music can connect people. There's something magical about creating melodies and learning new songs.",
      cooking: "I enjoy experimenting with flavors and the satisfaction of creating something delicious from scratch. It's both an art and a science.",
      "video games": "I'm fascinated by the storytelling, problem-solving, and the way games can create immersive worlds. I also appreciate the technical aspects."
    },
    studyGoals: {
      subject: "physics",
      topic: "Waves",
      focusArea: "Sound Waves"
    },
    competencyAnswers: [
      "Sound waves are vibrations that travel through a medium like air, water, or solid materials. They're created when something vibrates, like a guitar string, and these vibrations cause the air molecules around it to move back and forth, creating a wave that carries the sound to our ears.",
      "Sound waves are used in ultrasound imaging for medical diagnosis, in musical instruments like my guitar where string vibrations create different pitches, and in sonar technology for underwater navigation. Even in cooking, understanding how sound travels helps with kitchen acoustics and designing better cooking spaces."
    ],
    learningPace: "steady"
  }
}
