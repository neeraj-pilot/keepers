import { useTranslation } from 'react-i18next';
import { KeeperCard } from '@/components/KeeperCard';
import { Label } from '@/components/ui/label';
import { AlertCircle, Users } from 'lucide-react';
import type { SecretConfig, Keeper } from '@/types';
import { KEEPER_COUNT_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

interface Step3KeepersProps {
  config: SecretConfig;
  updateConfig: (updates: Partial<SecretConfig>) => void;
  createEmptyKeeper: () => Keeper;
}

export function Step3Keepers({ config, updateConfig, createEmptyKeeper }: Step3KeepersProps) {
  const { t } = useTranslation();
  const handleKeeperChange = (index: number, keeper: Keeper) => {
    const newKeepers = [...config.keepers];
    newKeepers[index] = keeper;
    updateConfig({ keepers: newKeepers });
  };

  const handleRemoveKeeper = (index: number) => {
    const newKeepers = config.keepers.filter((_, i) => i !== index);
    // Adjust threshold if necessary (minimum 2 for Shamir)
    const newThreshold = Math.min(config.threshold, newKeepers.length - 1);
    updateConfig({ keepers: newKeepers, threshold: Math.max(newThreshold, 2) });
  };

  const handleKeeperCountChange = (count: number) => {
    const currentCount = config.keepers.length;
    if (count === currentCount) return;

    if (count > currentCount) {
      // Add keepers
      const newKeepers = [...config.keepers];
      while (newKeepers.length < count) {
        newKeepers.push(createEmptyKeeper());
      }
      updateConfig({ keepers: newKeepers });
    } else {
      // Remove keepers from end
      const newKeepers = config.keepers.slice(0, count);
      // Adjust threshold if necessary (minimum 2 for Shamir)
      const newThreshold = Math.min(config.threshold, count - 1);
      updateConfig({ keepers: newKeepers, threshold: Math.max(newThreshold, 2) });
    }
  };

  const canRemove = config.keepers.length > Math.min(...KEEPER_COUNT_OPTIONS);

  // Calculate valid thresholds (from 2 to n-1, where n is keeper count)
  // Minimum threshold is 2 to ensure security (Shamir requires threshold >= 2)
  const maxThreshold = config.keepers.length - 1;
  const thresholdOptions = maxThreshold >= 2
    ? Array.from({ length: maxThreshold - 1 }, (_, i) => i + 2)
    : [2]; // Minimum 2

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('create.step3.title')}</h2>
        <p className="text-muted-foreground">
          {t('create.step3.description')}
        </p>
      </div>

      {/* Keeper count chips */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {t('create.step3.keeperCountLabel')}
        </Label>
        <div className="flex gap-2">
          {KEEPER_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              onClick={() => handleKeeperCountChange(count)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                config.keepers.length === count
                  ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {count} {t('create.step3.keepersChip')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {config.keepers.map((keeper, index) => (
          <KeeperCard
            key={keeper.id}
            keeper={keeper}
            index={index}
            onChange={(k) => handleKeeperChange(index, k)}
            onRemove={() => handleRemoveKeeper(index)}
            canRemove={canRemove}
          />
        ))}
      </div>

      <div className="space-y-3 pt-4 border-t">
        <Label>{t('create.step3.thresholdLabel')}</Label>
        <div className="grid grid-cols-3 gap-3">
          {thresholdOptions.map((threshold) => {
            const isRecommended = threshold === config.keepers.length - 1;
            const isSelected = config.threshold === threshold;

            return (
              <button
                key={threshold}
                onClick={() => updateConfig({ threshold })}
                className={cn(
                  'p-4 rounded-lg border text-left transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                    : 'hover:border-primary/50'
                )}
              >
                <div className="font-medium">
                  {t('create.step3.thresholdOption', { threshold, total: config.keepers.length })}
                </div>
                {isRecommended && (
                  <div className="text-xs text-primary mt-1">{t('create.step3.recommended')}</div>
                )}
              </button>
            );
          })}
        </div>

        {config.threshold === config.keepers.length && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              {t('create.step3.warningHighThreshold')}
            </span>
          </div>
        )}

        {config.threshold > 1 && config.threshold < config.keepers.length && (
          <p className="text-sm text-muted-foreground">
            {t('create.step3.protectionInfo', { count: config.keepers.length - config.threshold })}
          </p>
        )}
      </div>
    </div>
  );
}
