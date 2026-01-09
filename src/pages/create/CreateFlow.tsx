import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { StepIndicator } from '@/components/StepIndicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { SecretConfig, Keeper, Share, GeneratedShares } from '@/types';
import { splitSecret } from '@/lib/shamir';
import { Step1About } from './Step1About';
import { Step2Secret, validateBip39Words } from './Step2Secret';
import { Step3Keepers } from './Step3Keepers';
import { Step4Message } from './Step4Message';
import { Step5Review } from './Step5Review';
import { Step6Download } from './Step6Download';
import { Step7TestRecovery } from './Step7TestRecovery';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function createEmptyKeeper(): Keeper {
  return {
    id: generateId(),
    name: '',
    phone: '',
    email: '',
    storageNote: '',
    language: 'en',
  };
}

const initialConfig: SecretConfig = {
  ownerName: '',
  ownerContact: '',
  secretType: 'ente-recovery',
  customSecretType: '',
  toolName: '',
  toolWebsite: '',
  secret: '',
  keepers: [createEmptyKeeper(), createEmptyKeeper(), createEmptyKeeper()],
  threshold: 2,
  message: '',
};

export function CreateFlow() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<SecretConfig>(initialConfig);
  const [generatedShares, setGeneratedShares] = useState<GeneratedShares | null>(null);
  const [bip39ValidationError, setBip39ValidationError] = useState<{ valid: boolean; invalidWords: string[] } | null>(null);

  const STEPS = [
    { id: 1, label: t('create.steps.aboutYou') },
    { id: 2, label: t('create.steps.secret') },
    { id: 3, label: t('create.steps.keepers') },
    { id: 4, label: t('create.steps.message') },
    { id: 5, label: t('create.steps.review') },
    { id: 6, label: t('create.steps.download') },
    { id: 7, label: t('create.steps.verify') },
  ];

  const updateConfig = useCallback((updates: Partial<SecretConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // Handle Enter key to move to next focusable field
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;

      const target = e.target as HTMLElement;

      // Don't trigger if user is in a textarea (where Enter adds newlines)
      if (target.tagName === 'TEXTAREA') {
        return;
      }

      // Don't trigger if user is in a select dropdown or button
      if (target.getAttribute('role') === 'option' ||
          target.getAttribute('role') === 'combobox' ||
          target.tagName === 'BUTTON') {
        return;
      }

      // Find all focusable elements in the form
      const focusableSelectors = 'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const focusableElements = Array.from(document.querySelectorAll(focusableSelectors)) as HTMLElement[];

      const currentIndex = focusableElements.indexOf(target);
      if (currentIndex === -1) return;

      // Find the next input field (not button) to focus
      for (let i = currentIndex + 1; i < focusableElements.length; i++) {
        const nextElement = focusableElements[i];
        // Skip buttons, focus on inputs/textareas/selects
        if (nextElement.tagName === 'INPUT' || nextElement.tagName === 'TEXTAREA' || nextElement.tagName === 'SELECT' || nextElement.getAttribute('role') === 'combobox') {
          e.preventDefault();
          nextElement.focus();
          return;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return config.ownerName.trim().length > 0;
      case 2:
        return config.secret.trim().length > 0;
      case 3:
        return config.keepers.every((k) => k.name.trim().length > 0);
      case 4:
        return true; // Message is optional
      case 5:
        return true; // Review step
      case 6:
        return generatedShares !== null;
      case 7:
        return true; // Verify step
      default:
        return false;
    }
  };

  const handleNext = () => {
    // Validate BIP39 words for Ente.io Recovery Key on step 2
    if (currentStep === 2 && config.secretType === 'ente-recovery') {
      const validation = validateBip39Words(config.secret);
      if (!validation.valid) {
        setBip39ValidationError(validation);
        return; // Don't proceed if validation fails
      }
      setBip39ValidationError(null);
    }

    if (currentStep === 5) {
      // Generate shares
      const shares = splitSecret(config.secret, config.keepers.length, config.threshold);
      const shareObjects: Share[] = config.keepers.map((keeper, index) => ({
        keeperId: keeper.id,
        keeperName: keeper.name,
        shareData: shares[index],
      }));

      setGeneratedShares({
        shares: shareObjects,
        config: {
          ownerName: config.ownerName,
          ownerContact: config.ownerContact,
          secretType: config.secretType,
          customSecretType: config.customSecretType,
          toolName: config.toolName,
          toolWebsite: config.toolWebsite,
          keepers: config.keepers,
          threshold: config.threshold,
          message: config.message,
        },
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigate('/');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    // Clear sensitive data
    setConfig(initialConfig);
    setGeneratedShares(null);
    navigate('/');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1About config={config} updateConfig={updateConfig} />;
      case 2:
        return (
          <Step2Secret
            config={config}
            updateConfig={updateConfig}
            validationError={bip39ValidationError}
            onValidationClear={() => setBip39ValidationError(null)}
          />
        );
      case 3:
        return (
          <Step3Keepers
            config={config}
            updateConfig={updateConfig}
            createEmptyKeeper={createEmptyKeeper}
          />
        );
      case 4:
        return <Step4Message config={config} updateConfig={updateConfig} />;
      case 5:
        return <Step5Review config={config} />;
      case 6:
        return <Step6Download generatedShares={generatedShares} originalSecret={config.secret} />;
      case 7:
        return <Step7TestRecovery generatedShares={generatedShares} originalSecret={config.secret} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between pt-6 border-t">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {currentStep === 1 ? t('common.cancel') : t('common.back')}
        </Button>

        {currentStep < STEPS.length ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            {currentStep === 5 ? t('create.step5.generateButton') : t('common.continue')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleFinish}>
            {t('common.done')}
          </Button>
        )}
      </div>
    </div>
  );
}
