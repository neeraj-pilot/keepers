import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ShieldCheck, AlertCircle } from 'lucide-react';
import type { GeneratedShares } from '@/types';
import { combineShares } from '@/lib/shamir';
import { cn } from '@/lib/utils';

interface Step7TestRecoveryProps {
  generatedShares: GeneratedShares | null;
  originalSecret: string;
}

export function Step7TestRecovery({
  generatedShares,
  originalSecret,
}: Step7TestRecoveryProps) {
  const { t } = useTranslation();
  const [selectedShares, setSelectedShares] = useState<Set<number>>(new Set());
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [recoveredSecret, setRecoveredSecret] = useState<string | null>(null);

  if (!generatedShares) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('create.step7.noShares')}</p>
      </div>
    );
  }

  const threshold = generatedShares.config.threshold;

  const toggleShare = (index: number) => {
    const newSelected = new Set(selectedShares);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedShares(newSelected);
    setTestResult(null);
    setRecoveredSecret(null);
  };

  const runTest = () => {
    try {
      const sharesToCombine = Array.from(selectedShares).map(
        (i) => generatedShares.shares[i].shareData
      );
      const recovered = combineShares(sharesToCombine);

      if (recovered === originalSecret) {
        setTestResult('success');
        setRecoveredSecret(recovered);
      } else {
        setTestResult('error');
        setRecoveredSecret(null);
      }
    } catch {
      setTestResult('error');
      setRecoveredSecret(null);
    }
  };

  const canTest = selectedShares.size >= threshold;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('create.step7.title')}</h2>
        <p className="text-muted-foreground">
          {t('create.step7.description', { threshold })}
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            {t('create.step7.selectPiecesLabel')}
            <Badge variant="outline">
              {selectedShares.size} / {threshold} {t('create.step7.required')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {generatedShares.config.keepers.map((keeper, index) => {
              const isSelected = selectedShares.has(index);
              return (
                <button
                  key={keeper.id}
                  onClick={() => toggleShare(index)}
                  className={cn(
                    'p-4 rounded-lg border text-left transition-all',
                    isSelected
                      ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                      : 'hover:border-primary/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                        isSelected
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                    <div>
                      <p className="font-medium">{t('create.step7.pieceButton', { name: keeper.name })}</p>
                      <p className="text-xs text-muted-foreground">{t('recover.pieceNumber', { number: index + 1 })}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Button onClick={runTest} disabled={!canTest} className="w-full">
        {t('create.step7.testRecovery')}
      </Button>

      {testResult === 'success' && (
        <div className="p-6 rounded-lg bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                {t('create.step7.recoverySuccess')}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('create.step7.recoverySuccessDesc', { count: selectedShares.size })}
              </p>
              {recoveredSecret && (
                <div className="mt-3 p-3 rounded bg-green-100 dark:bg-green-900/50">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">
                    {t('create.step7.recoveredSecretPreview')}
                  </p>
                  <code className="text-sm text-green-800 dark:text-green-200">
                    {recoveredSecret.slice(0, 20)}
                    {recoveredSecret.length > 20 ? '...' : ''}
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {testResult === 'error' && (
        <div className="p-6 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center flex-shrink-0">
              <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-red-800 dark:text-red-200">
                {t('create.step7.recoveryFailed')}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                {t('create.step7.recoveryFailedDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg bg-muted/50 border">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{t('create.step7.testDifferent')}</p>
            <p className="mt-1">
              {t('create.step7.testDifferentDesc', { threshold })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
