"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ChatInterface } from "@/components/chat-interface";

const questions = [
  { q: "How would you describe your mood lately?", options: ["Generally positive", "Neutral", "Often low", "Very low"] },
  { q: "How well have you been sleeping?", options: ["Very well", "Fairly well", "Poorly", "Hardly at all"] },
  { q: "How often do you feel stressed?", options: ["Rarely", "Sometimes", "Often", "Almost always"] },
  { q: "How has your energy felt lately?", options: ["Energised and steady", "Mostly balanced", "Frequently exhausted", "Often drained"] },
  { q: "How connected do you feel to others?", options: ["Very connected", "Somewhat", "Often isolated", "Very isolated"] },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(5).fill(null));
  const [result, setResult] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showPsychologist, setShowPsychologist] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOptionSelect = (index: number) => {
    const updated = [...answers];
    updated[step] = index;
    setAnswers(updated);
  };

  const calculateResult = () => {
    const highCount = answers.filter(a => a === 2 || a === 3).length;
    return highCount >= 3 ? "High" : "Moderate";
  };

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setResult(calculateResult());
    }
  };

  const progress = ((step + 1) / questions.length) * 100;

  if (!mounted) return null;

  // View 1: Full-Screen Chat Interface (Logo visible here per instructions)
  if (showChat) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#FBF9F6] flex flex-col items-center justify-center">
        <div className="w-full h-full p-2 md:p-5 flex flex-col">
          <Navbar forceLogo={true} />
          <div className="flex-1 overflow-hidden">
            <ChatInterface onBack={() => setShowChat(false)} />
          </div>
        </div>
      </div>
    );
  }

  // View 2: Psychologist Recommendation Page (Fixed padding & spacing below Navbar)
  if (showPsychologist) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col">
        <Navbar showBackButton={true} customBackAction={() => setShowPsychologist(false)} />

        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 md:py-16 text-center max-w-4xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-serif text-[#333333] mb-6">
            Here's someone who may be right for you
          </h1>
          <p className="text-gray-600 text-lg mb-2">Based on what you shared, we found these therapists.</p>
          <p className="text-[#E9B87D] text-lg mb-12 font-medium">
            Based on your reflection assessment, we recommend speaking with a professional.
          </p>

          <p className="text-gray-500 text-sm max-w-2xl leading-relaxed mb-16">
            KAAL does not replace professional therapy. If you're experiencing severe distress, persistent symptoms, or thoughts of self-harm, please reach out to a mental health professional.
          </p>

          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional therapists will be available soon.</h3>
            <p className="text-gray-500">We're connecting you with qualified professionals to support your journey.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setShowChat(true)}
              className="bg-[#E9B87D] text-white px-10 py-3 rounded-full font-bold text-sm shadow-sm hover:bg-[#dfa96b] transition-all cursor-pointer"
            >
              Talk to KAAL AI
            </button>
            <button
              onClick={() => router.push('/meditation')}
              className="bg-white border border-gray-200 text-gray-700 px-10 py-3 rounded-full font-bold text-sm hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
            >
              Try Meditation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 3: Result Page (Shows Back Arrow)
  if (result) {
    const isHighStress = result === "High";

    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col px-4">
        <Navbar showBackButton={true} customBackAction={() => setResult(null)} />
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="bg-white rounded-[30px] p-8 w-full max-w-[420px] text-center shadow-sm border-t-4" 
               style={{ borderColor: isHighStress ? "#ef4444" : "#22c55e" }}>
            <h1 className="text-xl font-semibold text-gray-800">Your Reflection</h1>
            <p className="text-gray-400 text-sm mb-5">Based on your responses</p>

            <p className="text-xs text-gray-400 tracking-widest uppercase font-medium">Current Stress Level</p>
            <h2 className={`text-4xl my-3 font-bold ${isHighStress ? 'text-red-500' : 'text-green-500'}`}>{result}</h2>
            
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              {isHighStress
                ? "Your stress levels are currently high. We strongly recommend professional guidance alongside our tools."
                : "Your responses suggest steady stress with moments of mental fatigue. A short reset may help restore clarity."
              }
            </p>

            <div className="flex gap-3 justify-center mb-6">
              <button onClick={() => setShowChat(true)} className="bg-[#E9B87D] text-white px-6 py-2.5 rounded-full cursor-pointer hover:bg-[#dfa96b] transition-all font-medium text-sm shadow-sm">
                Talk to Kaal AI
              </button>
              <button onClick={() => router.push('/meditation')} className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-full cursor-pointer hover:bg-gray-50 transition-all font-medium text-sm">
                Try Meditation
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Recommended Action</p>
              <button
                onClick={() => setShowPsychologist(true)}
                className="w-full bg-[#4A4A4A] text-white py-3.5 rounded-2xl font-semibold text-sm hover:bg-black transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                Connect with a psychologist
              </button>
            </div>

            <button
              onClick={() => {
                setStep(0);
                setAnswers(new Array(5).fill(null));
                setResult(null);
              }}
              className="text-xs text-gray-400 mt-8 cursor-pointer hover:text-gray-600 transition-colors block mx-auto"
            >
              Retake assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 4: Question Assessment Stepper (Shows Back Arrow)
  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col px-4">
      <Navbar showBackButton={true} customBackAction={step > 0 ? () => setStep(step - 1) : undefined} />
      <div className="flex-1 flex flex-col items-center pt-14">
        <div className="text-center mb-8 w-full max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">Assess Your Mental Clarity</h1>
          <div className="max-w-md mx-auto mt-5">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Question {step + 1} of 5</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2.5 bg-[#E7E5DF] rounded-full mt-2 overflow-hidden">
              <div className="h-full transition-all duration-500" style={{ width: `${progress}%`, background: "#EDC791" }} />
            </div>
          </div>
        </div>

        <div className="w-full max-w-md">
          <h2 className="text-center text-gray-600 mb-6 text-lg">{questions[step].q}</h2>
          <div className="flex flex-col gap-3">
            {questions[step].options.map((opt, i) => {
              const selected = answers[step] === i;
              return (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  className="w-full rounded-full py-4 transition-all font-medium text-gray-600 border cursor-pointer"
                  style={{
                    background: selected ? "#FFF7ED" : "#fff",
                    borderColor: selected ? "#EDC791" : "#E5E7EB",
                    color: selected ? "#C58A2E" : "#6B7280",
                    borderWidth: selected ? "2px" : "1px"
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 mb-8 w-full max-w-md flex gap-3">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="flex-1 py-3 rounded-full border border-gray-200 text-gray-400 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={nextStep}
            disabled={answers[step] === null}
            className="flex-1 py-3 rounded-full text-white font-semibold transition-all cursor-pointer disabled:cursor-not-allowed"
            style={{ background: answers[step] === null ? "#D1D5DB" : "#EDC791" }}
          >
            {step === 4 ? "Finish" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}