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
    <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: 'var(--color-blanco)', border: '1px solid var(--color-morado-claro)' }}>
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-negro)' }}>{question}</h3>
        {hint && (
          <p className="text-sm mb-4" style={{ color: 'var(--color-negro)' }}>💡 {hint}</p>
        )}
      </div>

      {type === 'multiple-choice' && options && (
        <div className="space-y-3">
          {options.map((option, index) => (
            <label
              key={index}
              className="flex items-center p-3 rounded-lg cursor-pointer transition-colors border"
              style={{
                backgroundColor: answer === option.text ? 'var(--color-verde-seleccion)' : 'var(--color-blanco)',
                color: 'var(--color-negro)',
                borderColor: answer === option.text ? 'var(--color-morado-oscuro)' : 'var(--color-morado-claro)'
              }}
              onMouseEnter={(e) => {
                if (answer !== option.text) {
                  e.currentTarget.style.borderColor = 'var(--color-morado-oscuro)';
                  e.currentTarget.style.backgroundColor = 'var(--color-morado-claro)';
                }
              }}
              onMouseLeave={(e) => {
                if (answer !== option.text) {
                  e.currentTarget.style.borderColor = 'var(--color-morado-claro)';
                  e.currentTarget.style.backgroundColor = 'var(--color-blanco)';
                }
              }}
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
            className="block w-full rounded-md shadow-sm p-2"
            style={{ 
              border: '1px solid var(--color-morado-claro)',
              backgroundColor: 'var(--color-blanco)',
              color: 'var(--color-negro)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-morado-oscuro)';
              e.target.style.outline = 'none';
              e.target.style.boxShadow = '0 0 0 2px var(--color-morado-oscuro)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-morado-claro)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>
      )}

      <button
        onClick={checkAnswer}
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none"
        style={{ 
          color: 'var(--color-negro)',
          backgroundColor: 'var(--color-morado-oscuro)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-verde-claro)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-morado-oscuro)';
        }}
      >
        Verificar Respuesta
      </button>

      {isCorrect !== null && (
        <div 
          className="mt-4 p-4 rounded-md"
          style={{ 
            backgroundColor: isCorrect ? 'var(--color-verde-claro)' : '#fecaca'
          }}
        >
          <p 
            className="text-sm font-bold"
            style={{ 
              color: isCorrect ? 'var(--color-negro)' : '#dc2626'
            }}
          >
            {isCorrect ? '¡Correcto!' : '¡Inténtalo de nuevo!'}
          </p>
          {showExplanation && (
            <p className="mt-2 text-sm" style={{ color: isCorrect ? 'var(--color-negro)' : '#7f1d1d' }}>{explanation}</p>
          )}
        </div>
      )}
    </div>
  )
} 