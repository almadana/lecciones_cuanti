'use client'

import { useRouter } from 'next/navigation'

interface LessonNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  previousUrl?: string;
  nextUrl?: string;
  showPrevious?: boolean;
  showNext?: boolean;
}

export default function LessonNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  previousUrl,
  nextUrl,
  showPrevious = true,
  showNext = true
}: LessonNavigationProps) {
  const router = useRouter();

  const handlePrevious = () => {
    if (onPrevious) {
      onPrevious();
    } else if (previousUrl) {
      router.push(previousUrl);
    }
  };

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (nextUrl) {
      router.push(nextUrl);
    }
  };

  const btn =
    'inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-sm font-medium text-[var(--text)] shadow-sm transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] disabled:pointer-events-none disabled:opacity-40';

  return (
    <section className="mt-16 flex flex-col gap-6 border-t border-[var(--border)] pt-10 sm:flex-row sm:items-center sm:justify-between">
      {showPrevious ? (
        <button type="button" onClick={handlePrevious} className={btn}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Anterior
        </button>
      ) : (
        <span />
      )}

      <p className="order-first text-center text-xs font-medium uppercase tracking-widest text-[var(--text-muted)] sm:order-none">
        Paso {currentStep} de {totalSteps}
      </p>

      {showNext ? (
        <button type="button" onClick={handleNext} className={`${btn} border-[var(--accent)] bg-[var(--accent-soft)]`}>
          Siguiente
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <span />
      )}
    </section>
  );
}
