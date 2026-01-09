import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, AlertTriangle } from 'lucide-react';
import type { SecretConfig } from '@/types';
import { SECRET_TYPE_LABELS } from '@/types';

interface Step5ReviewProps {
  config: SecretConfig;
}

export function Step5Review({ config }: Step5ReviewProps) {
  const { t } = useTranslation();
  const secretTypeLabel =
    SECRET_TYPE_LABELS[config.secretType as keyof typeof SECRET_TYPE_LABELS] ||
    config.secretType;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('create.step5.title')}</h2>
        <p className="text-muted-foreground">
          {t('create.step5.description')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('create.step5.summary')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('create.step5.secretFor')}</span>
              <Badge variant="secondary">{secretTypeLabel}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('create.step5.recoveryRequires')}</span>
              <Badge variant="secondary">
                {t('create.step3.thresholdOption', { threshold: config.threshold, total: config.keepers.length })}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">{t('create.step5.owner')}</span>
              <span className="font-medium">{config.ownerName}</span>
            </div>
          </CardContent>
        </Card>

        {/* Keepers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('create.steps.keepers')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {config.keepers.map((keeper) => (
                <div
                  key={keeper.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{keeper.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {keeper.email || keeper.phone || t('create.step5.noContactInfo')}
                    </p>
                    {keeper.storageNote && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {keeper.storageNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message preview */}
        {config.message && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t('create.step4.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {config.message.length > 200
                  ? `${config.message.slice(0, 200)}...`
                  : config.message}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200">
              {t('create.step5.afterGenerating')}
            </p>
            <ul className="mt-2 space-y-1 text-amber-700 dark:text-amber-300">
              <li>• {t('create.step5.warning1')}</li>
              <li>• {t('create.step5.warning2')}</li>
              <li>• {t('create.step5.warning3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
