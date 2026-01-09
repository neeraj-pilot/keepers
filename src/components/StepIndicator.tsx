import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      {/* Mobile: dots only */}
      <div className="flex justify-center gap-2 sm:hidden">
        {steps.map((step) => (
          <motion.div
            key={step.id}
            className={cn(
              'w-2 h-2 rounded-full transition-colors duration-200',
              step.id < currentStep
                ? 'bg-primary'
                : step.id === currentStep
                ? 'bg-primary'
                : 'bg-muted'
            )}
            initial={false}
            animate={{
              scale: step.id === currentStep ? 1.25 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      {/* Desktop: full indicator */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200',
                    step.id < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                  initial={false}
                  animate={{
                    scale: step.id === currentStep ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {step.id < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <span
                  className={cn(
                    'mt-2 text-xs transition-colors duration-200 max-w-[80px] text-center',
                    step.id === currentStep
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-12 h-0.5 mx-2 mt-[-1rem] transition-colors duration-200',
                    step.id < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current step label for mobile */}
      <p className="text-center text-sm text-muted-foreground mt-3 sm:hidden">
        {steps.find((s) => s.id === currentStep)?.label}
      </p>
    </div>
  );
}
