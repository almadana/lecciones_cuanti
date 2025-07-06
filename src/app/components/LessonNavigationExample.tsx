'use client';

import LessonNavigation from './LessonNavigation';

// Ejemplo de uso para diferentes escenarios de lecciones

export function ExampleThreeStepLesson() {
  return (
    <div>
      {/* Contenido de la lección */}
      
      {/* Paso 1 de 3 - Solo botón siguiente */}
      <LessonNavigation
        currentStep={1}
        totalSteps={3}
        nextUrl="/lessons/example-step-2"
        showPrevious={false}
      />
      
      {/* Paso 2 de 3 - Botones anterior y siguiente */}
      <LessonNavigation
        currentStep={2}
        totalSteps={3}
        previousUrl="/lessons/example-step-1"
        nextUrl="/lessons/example-step-3"
      />
      
      {/* Paso 3 de 3 - Solo botón anterior */}
      <LessonNavigation
        currentStep={3}
        totalSteps={3}
        previousUrl="/lessons/example-step-2"
        showNext={false}
      />
    </div>
  );
}

export function ExampleWithCustomHandlers() {
  const handlePrevious = () => {
    // Lógica personalizada antes de navegar
    console.log('Guardando progreso...');
    // router.push('/previous-step');
  };

  const handleNext = () => {
    // Lógica personalizada antes de navegar
    console.log('Validando datos...');
    // router.push('/next-step');
  };

  return (
    <div>
      {/* Contenido de la lección */}
      
      <LessonNavigation
        currentStep={2}
        totalSteps={4}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </div>
  );
} 