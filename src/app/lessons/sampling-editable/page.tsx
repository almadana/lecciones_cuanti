import LessonNavigation from '@/app/components/LessonNavigation';

export default function SamplingEditablePage() {
  return (
    <div className="py-8">
      <LessonNavigation
        currentStep={2}
        totalSteps={2}
        previousUrl="/lessons/sampling"
        showNext={false}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-negro bg-morado-claro p-4 rounded-lg inline-block">
            Muestreo - Editable (2 de 2)
          </h1>
        </div>
      </div>
      <LessonNavigation
        currentStep={2}
        totalSteps={2}
        previousUrl="/lessons/sampling"
        showNext={false}
      />
    </div>
  );
} 