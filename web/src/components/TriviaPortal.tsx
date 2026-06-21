"use client"

import { useState, useEffect } from "react"
import { addExperience } from "@/lib/gamification"
import Toast, { showToast } from "./Toast"

interface Question {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

interface TriviaPortalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  onProgressUpdate: (xp: number, level: number, title: string) => void
}

export default function TriviaPortal({ isOpen, onClose, userId, onProgressUpdate }: TriviaPortalProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)
  const [levelUpMessage, setLevelUpMessage] = useState("")

  useEffect(() => {
    async function loadTrivia() {
      if (!isOpen) return
      try {
        setLoading(true)
        setSelectedAnswer(null)
        setCurrentIdx(0)
        setCorrectCount(0)
        setShowResult(false)
        setXpEarned(0)
        setLevelUpMessage("")
        
        const res = await fetch("/api/trivia")
        if (!res.ok) throw new Error("Server error")
        const data = await res.json()
        if (data && data.questions) {
          setQuestions(data.questions)
        }
      } catch (err) {
        console.error("Error loading trivia questions:", err)
      } finally {
        setLoading(false)
      }
    }
    loadTrivia()
  }, [isOpen])

  if (!isOpen) return null

  const handleSelect = (idx: number) => {
    if (selectedAnswer !== null) return // Already answered
    setSelectedAnswer(idx)
    if (idx === questions[currentIdx].answerIndex) {
      setCorrectCount(prev => prev + 1)
      showToast("¡Correcto! ⚽", "success")
    } else {
      showToast("Incorrecto ❌", "error")
    }
  }

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1)
      setSelectedAnswer(null)
    } else {
      // Calculate XP rewards: 50 XP per correct, bonus 50 for perfect score
      const baseReward = correctCount * 50
      const bonusReward = correctCount === questions.length ? 50 : 0
      const totalReward = baseReward + bonusReward
      setXpEarned(totalReward)
      
      const res = await addExperience(totalReward, userId)
      onProgressUpdate(res.xp, res.level, res.title)
      
      if (res.leveledUp) {
        setLevelUpMessage(`¡FELICIDADES! Subiste al nivel ${res.level} (${res.title}) 🎉`)
      }
      
      setShowResult(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative overflow-hidden select-none">
        {/* Pitch background accent */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎓</span>
              <h2 className="text-base font-bold text-white tracking-tight">Academia de Trivia</h2>
            </div>
            <button onClick={onClose} className="p-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all text-xs">
              ✕ Cerrar
            </button>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="typing-indicator"><span></span><span></span><span></span></div>
              <p className="text-xs text-text-secondary mt-4">Generando preguntas infinitas con IA...</p>
            </div>
          ) : showResult ? (
            /* Results Step */
            <div className="text-center py-6 space-y-4">
              <div className="text-5xl">🏆</div>
              <h3 className="text-lg font-black text-white">¡Trivia Completada!</h3>
              <p className="text-sm text-text-secondary">
                Acertaste <span className="text-amber-400 font-bold">{correctCount} de {questions.length}</span> preguntas.
              </p>
              
              <div className="bg-gray-950/60 border border-gray-800 rounded-2xl p-4 max-w-xs mx-auto space-y-1">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Experiencia Ganada</span>
                <div className="text-3xl font-black text-amber-400">+{xpEarned} XP</div>
                {correctCount === questions.length && (
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1 block">🏆 ¡Bonus por Pleno! (+50 XP)</span>
                )}
              </div>

              {levelUpMessage && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-400 font-bold max-w-sm mx-auto animate-bounce mt-3">
                  {levelUpMessage}
                </div>
              )}

              <button onClick={onClose} className="w-full mt-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-bold text-sm shadow-lg shadow-amber-500/10 transition-all">
                Continuar
              </button>
            </div>
          ) : (
            /* Question step */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
                <span>PREGUNTA {currentIdx + 1} de {questions.length}</span>
                <span className="text-amber-400">🔥 Aciertos: {correctCount}</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                {questions[currentIdx]?.question}
              </h3>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {questions[currentIdx]?.options.map((opt, oIdx) => {
                  const isAnswered = selectedAnswer !== null
                  const isCorrectAnswer = oIdx === questions[currentIdx].answerIndex
                  const isSelected = oIdx === selectedAnswer
                  
                  let btnStyle = "bg-gray-850 hover:bg-gray-800 border-gray-800 text-text-secondary"
                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-bold"
                    } else if (isSelected) {
                      btnStyle = "bg-red-500/20 border-red-500/40 text-red-400 font-bold"
                    } else {
                      btnStyle = "bg-gray-900/30 border-gray-850 opacity-40 text-gray-600"
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(oIdx)}
                      disabled={isAnswered}
                      className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && isCorrectAnswer && <span>✓</span>}
                      {isAnswered && isSelected && !isCorrectAnswer && <span>✕</span>}
                    </button>
                  )
                })}
              </div>

              {/* Explanation section */}
              {selectedAnswer !== null && (
                <div className="bg-gray-950/80 border border-gray-800/80 rounded-xl p-3 text-xs text-text-secondary leading-relaxed mt-3">
                  <strong>Explicación:</strong> {questions[currentIdx]?.explanation}
                </div>
              )}

              {/* Next/Finish button */}
              {selectedAnswer !== null && (
                <button 
                  onClick={handleNext} 
                  className="w-full mt-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-text-primary font-bold text-xs sm:text-sm transition-all border border-gray-700/50"
                >
                  {currentIdx === questions.length - 1 ? "Ver Resultados 🏆" : "Siguiente Pregunta ➔"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
