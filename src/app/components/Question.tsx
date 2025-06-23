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
    <div className="bg-blanco rounded-lg p-6 shadow-lg border border-gris-borde">
      <p className="text-lg font-medium text-negro">{question}</p>
      {hint && (
        <p className="mt-2 text-sm text-gray-600">{hint}</p>
      )}

      <div className="mt-4">
        {type === 'multiple-choice' && options && (
          <div className="space-y-2">
            {options.map((option, index) => (
              <button
                key={`${index}-${option.text}`}
                onClick={() => setAnswer(option.text)}
                className={`block w-full text-left px-4 py-2 rounded-md border transition-colors duration-200 ${
                  answer === option.text
                    ? 'border-morado-oscuro bg-morado-claro text-negro font-bold'
                    : 'border-gris-borde hover:border-morado-oscuro hover:bg-morado-claro'
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}

        {type === 'numeric' && (
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="block w-full rounded-md border-gris-borde shadow-sm focus:border-morado-oscuro focus:ring-morado-oscuro p-2"
            placeholder="Ingresa tu respuesta"
            step="0.1"
          />
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
    </div>
  )
} 