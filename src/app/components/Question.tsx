import { useState } from 'react'

interface QuestionProps {
  question: string
  hint?: string
  type: 'multiple-choice' | 'numeric'
  options?: { text: string; value: boolean }[]
  correctAnswer?: number
  explanation: string
}

export default function Question({
  question,
  hint,
  type,
  options,
  correctAnswer,
  explanation,
}: QuestionProps) {
  const [answer, setAnswer] = useState<string>('')
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const checkAnswer = () => {
    if (type === 'numeric' && correctAnswer !== undefined) {
      const numericAnswer = parseFloat(answer)
      const isAnswerCorrect = Math.abs(numericAnswer - correctAnswer) < 0.1
      setIsCorrect(isAnswerCorrect)
    } else if (type === 'multiple-choice' && options) {
      const selectedOption = options.find(opt => opt.text === answer)
      setIsCorrect(selectedOption?.value || false)
    }
    setShowExplanation(true)
  }

  return (
    <div className="bg-blanco rounded-lg p-6 shadow-lg border border-morado-claro">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-negro mb-2">{question}</h3>
        {hint && (
          <p className="text-sm text-gray-600 mb-4">💡 {hint}</p>
        )}
      </div>

      {type === 'multiple-choice' && options && (
        <div className="space-y-3">
          {options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors border ${
                answer === option.text
                  ? 'bg-[#c8fab4] text-negro border-morado-oscuro'
                  : 'border-morado-claro hover:border-morado-oscuro hover:bg-morado-claro bg-white'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={option.text}
                checked={answer === option.text}
                onChange={(e) => setAnswer(e.target.value)}
                className="sr-only"
              />
              <span className="ml-2">{option.text}</span>
            </label>
          ))}
        </div>
      )}

      {type === 'numeric' && (
        <div>
          <input
            type="number"
            step="any"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ingresa tu respuesta"
            className="block w-full rounded-md border-morado-claro shadow-sm focus:border-morado-oscuro focus:ring-morado-oscuro p-2"
          />
        </div>
      )}

      <button
        onClick={checkAnswer}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-negro bg-morado-oscuro hover:bg-verde-claro transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-morado-oscuro"
      >
        Verificar Respuesta
      </button>

      {isCorrect !== null && (
        <div className={`mt-4 p-4 rounded-md ${isCorrect ? 'bg-verde-claro' : 'bg-red-100'}`}>
          <p className={`text-sm font-bold ${isCorrect ? 'text-negro' : 'text-red-800'}`}>
            {isCorrect ? '¡Correcto!' : '¡Inténtalo de nuevo!'}
          </p>
          {showExplanation && (
            <p className="mt-2 text-sm text-negro">{explanation}</p>
          )}
        </div>
      )}
    </div>
  )
} 