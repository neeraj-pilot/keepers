import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SecretConfig } from '@/types';

interface Step1AboutProps {
  config: SecretConfig;
  updateConfig: (updates: Partial<SecretConfig>) => void;
}

export function Step1About({ config, updateConfig }: Step1AboutProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('create.step1.title')}</h2>
        <p className="text-muted-foreground">
          {t('create.step1.description')}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ownerName">{t('create.step1.nameLabel')}</Label>
          <Input
            id="ownerName"
            placeholder={t('create.step1.namePlaceholder')}
            value={config.ownerName}
            onChange={(e) => updateConfig({ ownerName: e.target.value })}
            autoFocus
          />
          <p className="text-sm text-muted-foreground">
            {t('create.step1.nameHelp')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerContact">{t('create.step1.contactLabel')}</Label>
          <Input
            id="ownerContact"
            placeholder={t('create.step1.contactPlaceholder')}
            value={config.ownerContact}
            onChange={(e) => updateConfig({ ownerContact: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            {t('create.step1.contactHelp')}
          </p>
        </div>
      </div>
    </div>
  );
}
