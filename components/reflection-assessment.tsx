"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useReflectionQuestions } from "@/hooks/useReflectionQuestions"

interface Question {
id: number
question: string
options: string[]
}

export function ReflectionAssessment() {

const router = useRouter()
const { questions, loading } = useReflectionQuestions()

const [currentQuestion, setCurrentQuestion] = useState(0)
const [answers, setAnswers] = useState<Record<number,string>>({})
const [selectedOption, setSelectedOption] = useState<string | null>(null)

if (loading || questions.length === 0) {
return ( <div className="text-center py-20"> <p className="text-muted-foreground">Loading questions...</p> </div>
)
}

const question = questions[currentQuestion]

const progress =
((currentQuestion + 1) / questions.length) * 100

const handleSelect = (option: string) => {
setSelectedOption(option)
}

const handleContinue = () => {


if (!selectedOption) return

const newAnswers = {
  ...answers,
  [question.id]: selectedOption,
}

setAnswers(newAnswers)

if (currentQuestion < questions.length - 1) {
  setCurrentQuestion(currentQuestion + 1)
  setSelectedOption(null)
} else {

  const result = calculateStressLevel(newAnswers)

  sessionStorage.setItem(
    "reflectionResult",
    JSON.stringify(result)
  )

  router.push("/reflection/result")
}


}

const handleBack = () => {


if (currentQuestion === 0) return

const prevQuestion = questions[currentQuestion - 1]

setCurrentQuestion(currentQuestion - 1)

setSelectedOption(
  answers[prevQuestion.id] || null
)


}

return ( <div className="max-w-2xl mx-auto px-4">

```
  <h1 className="text-2xl font-serif text-center mb-8">
    Assess Your Mental Clarity
  </h1>

  <div className="mb-6">
    <div className="flex justify-between text-sm text-muted-foreground">
      <span>
        Question {currentQuestion + 1} of {questions.length}
      </span>
      <span>{Math.round(progress)}%</span>
    </div>

    <Progress value={progress} className="mt-2 h-2" />
  </div>

  <h2 className="text-xl text-center mb-8">
    {question.question}
  </h2>

  <div className="space-y-3 mb-8">

    {question.options.map((option) => (

      <button
        key={option}
        onClick={() => handleSelect(option)}
        className={cn(
          "w-full p-4 rounded-xl border transition",
          selectedOption === option
            ? "border-primary bg-primary/10"
            : "border-border hover:bg-muted"
        )}
      >
        {option}
      </button>

    ))}

  </div>

  <div className="flex justify-center gap-4">

    <Button
      variant="outline"
      onClick={handleBack}
      disabled={currentQuestion === 0}
    >
      Back
    </Button>

    <Button
      onClick={handleContinue}
      disabled={!selectedOption}
    >
      Continue
    </Button>

  </div>

</div>


)
}

function calculateStressLevel(
answers: Record<number,string>
) {

let score = 0
let count = 0

Object.values(answers).forEach((_, index) => {


score += index + 1
count++


})

const avg = score / count

let level = "Low"

if (avg >= 3) level = "High"
else if (avg >= 2) level = "Moderate"

return {
level,
score
}
}
