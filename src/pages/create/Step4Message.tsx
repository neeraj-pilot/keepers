import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Lightbulb } from 'lucide-react';
import type { SecretConfig } from '@/types';
import { SECRET_TYPE_LABELS } from '@/types';

interface Step4MessageProps {
  config: SecretConfig;
  updateConfig: (updates: Partial<SecretConfig>) => void;
}

export function Step4Message({ config, updateConfig }: Step4MessageProps) {
  const { t } = useTranslation();
  const secretTypeLabel = SECRET_TYPE_LABELS[config.secretType as keyof typeof SECRET_TYPE_LABELS] || config.secretType;

  const handleUseTemplate = () => {
    const template = t('create.step4.template', {
      secretType: secretTypeLabel,
      threshold: config.threshold,
      ownerName: config.ownerName,
    });
    updateConfig({ message: template });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('create.step4.title')}</h2>
        <p className="text-muted-foreground">
          {t('create.step4.description')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="message">{t('create.step4.messageLabel')}</Label>
          <Textarea
            id="message"
            placeholder={t('create.step4.messagePlaceholder')}
            value={config.message}
            onChange={(e) => updateConfig({ message: e.target.value })}
            className="min-h-[200px]"
          />
        </div>

        {!config.message && (
          <button
            onClick={handleUseTemplate}
            className="flex items-start gap-3 p-4 rounded-lg border border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors text-left w-full"
          >
            <Lightbulb className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">{t('create.step4.useTemplate')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('create.step4.templateDescription')}
              </p>
            </div>
          </button>
        )}

        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
          <p className="text-sm font-medium">{t('create.step4.suggestedTopics')}</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• {t('create.step4.topic1')}</li>
            <li>• {t('create.step4.topic2')}</li>
            <li>• {t('create.step4.topic3')}</li>
            <li>• {t('create.step4.topic4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
