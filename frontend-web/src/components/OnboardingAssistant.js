import React, { useState, useEffect } from 'react';

const steps = [
  {
    key: 'role',
    question: 'Bun venit! Ești aici pentru a oferi servicii (Prestator) sau pentru a găsi ajutor (Beneficiar)?',
    options: ['Prestator', 'Beneficiar'],
  },
  {
    key: 'skills',
    question: 'Excelent! Ce competențe principale ai? (separă prin virgulă, ex: web design, reparații, curățenie)',
    type: 'text',
    condition: (answers) => answers.role === 'Prestator',
  },
  {
    key: 'location',
    question: 'Unde ești localizat(ă)? Acest lucru ne ajută să-ți găsim joburi în apropiere.',
    type: 'text',
  },
];

function OnboardingAssistant({ user, onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState({ role: user.role });
  const [inputValue, setInputValue] = useState('');

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    // Skip steps that don't meet the condition
    if (currentStep && currentStep.condition && !currentStep.condition(answers)) {
      goToNextStep();
    }
  }, [currentStepIndex, answers, currentStep]);

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Onboarding finished
      handleFinish();
    }
  };

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [currentStep.key]: answer };
    setAnswers(newAnswers);
    setInputValue('');
    goToNextStep();
  };

  const handleFinish = async () => {
    try {
      const token = localStorage.getItem('jwt');
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(answers)
      });
      // Mark onboarding as complete
      await fetch('/api/users/complete-onboarding', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      onComplete();
    } catch (error) {
      console.error('Failed to save onboarding data', error);
    }
  };

  if (!currentStep) return null;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 350, background: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 1000 }}>
      <div style={{ padding: 16 }}>
        <p style={{ marginTop: 0, fontWeight: 'bold' }}>Asistent Onboarding</p>
        <p>{currentStep.question}</p>
        {currentStep.options ? (
          <div style={{ display: 'flex', gap: 8 }}>
            {currentStep.options.map(option => (
              <button key={option} onClick={() => handleAnswer(option)} style={{ flex: 1, padding: 8, cursor: 'pointer' }}>
                {option}
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); handleAnswer(inputValue); }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
              autoFocus
            />
            <button type="submit" style={{ width: '100%', marginTop: 8, padding: 8, cursor: 'pointer' }}>Continuă</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default OnboardingAssistant;