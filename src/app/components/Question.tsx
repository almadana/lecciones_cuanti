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
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="mb-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Pausa para pensar</p>
        <h3 className="mb-2 text-lg font-semibold text-[var(--text)]">{question}</h3>
        {hint && (
          <p className="mb-4 text-sm text-[var(--text-muted)]">Pista: {hint}</p>
        )}
      </div>

      {type === 'multiple-choice' && options && (
        <div className="space-y-3">
          {options.map((option, index) => (
            <label
              key={index}
              className={`flex cursor-pointer items-center rounded-xl border p-3 text-[var(--text)] transition-colors hover:border-[var(--accent)] ${
                answer === option.text
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'border-[var(--border)] bg-[var(--surface)]'
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
              <span className="ml-2 text-sm">{option.text}</span>
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
            placeholder="Ingresá tu respuesta"
            className="block w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text)] shadow-sm"
          />
        </div>
      )}

      <button
        onClick={checkAnswer}
        disabled={!answer}
        className="mt-4 inline-flex items-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Verificar respuesta
      </button>

      {isCorrect !== null && (
        <div
          className={`mt-4 rounded-xl border p-4 ${
            isCorrect
              ? 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]'
              : 'border-[var(--danger)] bg-[var(--danger-soft)] text-[var(--danger)]'
          }`}
          role="status"
        >
          <p className="text-sm font-bold">
            {isCorrect ? 'Bien pensado.' : 'Probá otra vez.'}
          </p>
          {showExplanation && (
            <p className="mt-2 text-sm">{explanation}</p>
          )}
        </div>
      )}
    </section>
  )
} 