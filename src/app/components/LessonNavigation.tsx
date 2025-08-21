'use client';

import { useRouter } from 'next/navigation';

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

  return (
    <section className="flex justify-between items-center py-8 border-t border-morado-claro">
      {showPrevious ? (
        <button
          onClick={handlePrevious}
          className="flex items-center gap-2 px-6 py-3 bg-morado-oscuro text-blanco rounded-lg hover:bg-[#7a6bc8] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Anterior</span>
        </button>
      ) : (
        <div></div>
      )}
      
      <div className="text-sm text-gray-600">
        {currentStep} de {totalSteps}
      </div>
      
      {showNext ? (
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-3 bg-verde-claro text-negro rounded-lg hover:bg-[#8ae671] transition-colors"
        >
          <span>Siguiente</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <div></div>
      )}
    </section>
  );
} 