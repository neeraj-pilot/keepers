import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { wordlists } from 'bip39';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Eye, EyeOff, Lock, HelpCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import type { SecretConfig, SecretType } from '@/types';

interface Step2SecretProps {
  config: SecretConfig;
  updateConfig: (updates: Partial<SecretConfig>) => void;
  validationError?: { valid: boolean; invalidWords: string[] } | null;
  onValidationClear?: () => void;
}

// BIP39 English wordlist
const bip39Words = new Set(wordlists.english);

export function validateBip39Words(phrase: string): { valid: boolean; invalidWords: string[] } {
  const words = phrase.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) {
    return { valid: false, invalidWords: [] };
  }
  const invalidWords = words.filter(word => !bip39Words.has(word));
  return { valid: invalidWords.length === 0, invalidWords };
}

export function Step2Secret({ config, updateConfig, validationError, onValidationClear }: Step2SecretProps) {
  const { t } = useTranslation();
  const [showSecret, setShowSecret] = useState(false);
  const [localValidationResult, setLocalValidationResult] = useState<{ valid: boolean; invalidWords: string[] } | null>(null);

  // Use external validation error if provided, otherwise use local state
  const validationResult = validationError !== undefined ? validationError : localValidationResult;

  const secretTypes: { value: SecretType; labelKey: string; website?: string }[] = [
    { value: 'ente-recovery', labelKey: 'create.step2.types.enteRecovery', website: 'https://ente.io' },
    { value: 'crypto-wallet', labelKey: 'create.step2.types.cryptoWallet' },
    { value: 'password-manager', labelKey: 'create.step2.types.passwordManager' },
    { value: 'other', labelKey: 'create.step2.types.other' },
  ];

  const handleVerify = () => {
    if (!config.secret.trim()) {
      setLocalValidationResult({ valid: false, invalidWords: [] });
      return;
    }
    setLocalValidationResult(validateBip39Words(config.secret));
  };

  const clearValidation = () => {
    setLocalValidationResult(null);
    onValidationClear?.();
  };

  const handleSecretTypeChange = (value: string) => {
    updateConfig({
      secretType: value as SecretType,
      customSecretType: value === 'other' ? config.customSecretType : '',
      // Clear account ID and website when changing type - user should enter manually
      toolWebsite: '',
      toolName: '',
    });
    clearValidation();
  };

  // Get dynamic placeholders based on secret type
  const getAccountIdPlaceholder = () => {
    if (config.secretType === 'ente-recovery') {
      return 'user@ente.io';
    }
    return t('create.step2.accountIdPlaceholder');
  };

  const getServiceWebsitePlaceholder = () => {
    if (config.secretType === 'ente-recovery') {
      return 'https://ente.io';
    }
    return t('create.step2.serviceWebsitePlaceholder');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('create.step2.title')}</h2>
        <p className="text-muted-foreground">
          {t('create.step2.description')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="secretType">{t('create.step2.typeLabel')}</Label>
          <Select
            value={config.secretType}
            onValueChange={handleSecretTypeChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('create.step2.typeLabel')} />
            </SelectTrigger>
            <SelectContent>
              {secretTypes.map(({ value, labelKey }) => (
                <SelectItem key={value} value={value}>
                  {t(labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {config.secretType === 'other' && (
          <div className="space-y-2">
            <Label htmlFor="customSecretType">{t('create.step2.customTypeLabel')}</Label>
            <Input
              id="customSecretType"
              placeholder={t('create.step2.customTypePlaceholder')}
              value={config.customSecretType}
              onChange={(e) => updateConfig({ customSecretType: e.target.value })}
            />
          </div>
        )}

        {/* Account ID and Service Website fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="toolName">{t('create.step2.accountIdLabel')}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('create.step2.accountIdTooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="toolName"
              placeholder={getAccountIdPlaceholder()}
              value={config.toolName}
              onChange={(e) => updateConfig({ toolName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="toolWebsite">{t('create.step2.serviceWebsiteLabel')}</Label>
            <div className="flex gap-2">
              <Input
                id="toolWebsite"
                type="url"
                placeholder={getServiceWebsitePlaceholder()}
                value={config.toolWebsite}
                onChange={(e) => updateConfig({ toolWebsite: e.target.value })}
              />
              {config.toolWebsite && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => window.open(config.toolWebsite, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="secret">{t('create.step2.secretLabel')}</Label>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleVerify}
                      className="h-8 px-2"
                    >
                      <HelpCircle className="w-4 h-4 mr-1" />
                      {t('create.step2.verifyBip39')}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t('create.step2.verifyBip39Tooltip')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
                className="h-8 px-2"
              >
                {showSecret ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    {t('create.step2.hide')}
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    {t('create.step2.show')}
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="relative">
            <Textarea
              id="secret"
              placeholder={t('create.step2.secretPlaceholder')}
              value={config.secret}
              onChange={(e) => {
                updateConfig({ secret: e.target.value });
                clearValidation();
              }}
              className={`min-h-[120px] pr-10 ${!showSecret ? 'text-security-disc' : ''}`}
              style={!showSecret ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
            />
          </div>

          {/* Validation result */}
          {validationResult !== null && (
            <Alert variant={validationResult.valid ? 'default' : 'destructive'} className="mt-2">
              {validationResult.valid ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {!config.secret.trim()
                  ? t('create.step2.validationEmpty')
                  : validationResult.valid
                  ? t('create.step2.validationSuccess')
                  : t('create.step2.validationError', { words: validationResult.invalidWords.join(', ') })}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
          <Lock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">{t('home.features.trulyPrivate.title')}</p>
            <p className="text-muted-foreground mt-1">
              {t('create.step2.secretHelp')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
