'use client';

import { useState } from 'react';

import InitialRegistrationForm from '@/components/ui/auth/registration/InitialRegistrationForm';
// import EmailVerificationForm from './EmailVerificationForm';
// import RegistrationComplete from './RegistrationComplete';
import { RegistrationData, RegistrationStep } from '@/types/register';

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('initial');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    password: '',
    terms: false
  });

  const updateRegistrationData = (data: Partial<RegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...data }));
  };

  const goToStep = (step: RegistrationStep) => {
    setCurrentStep(step);
  };

  return (
    <div>
      {currentStep === 'initial' && (
        <InitialRegistrationForm
          data={registrationData}
          onNext={(data) => {
            updateRegistrationData(data);
            goToStep('email-verify');
          }}
        />
      )}

      {/* {currentStep === 'email-verify' && (
        <EmailVerificationForm
          email={registrationData.email}
          userId={registrationData.userId}
          password={registrationData.password}
          name={registrationData.name}
          onNext={(userId) => {
            updateRegistrationData({ userId });
            goToStep('complete');
          }}
        />
      )}

      {currentStep === 'complete' && (
        <RegistrationComplete
          name={registrationData.name}
          email={registrationData.email}
        />
      )} */}
    </div>
  );
};

export default RegisterForm;
