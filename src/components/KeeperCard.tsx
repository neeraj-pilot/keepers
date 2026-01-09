import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, User, Globe } from 'lucide-react';
import type { Keeper } from '@/types';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n';

interface KeeperCardProps {
  keeper: Keeper;
  index: number;
  onChange: (keeper: Keeper) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

export function KeeperCard({
  keeper,
  index,
  onChange,
  onRemove,
  canRemove = true,
}: KeeperCardProps) {
  const { t } = useTranslation();
  const updateField = (field: keyof Keeper, value: string) => {
    onChange({ ...keeper, [field]: value });
  };

  return (
    <Card className="relative group">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{t('create.step3.keeperTitle', { number: index + 1 })}</h3>
              {canRemove && onRemove && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor={`keeper-${keeper.id}-name`}>{t('create.step3.nameLabel')}</Label>
                <Input
                  id={`keeper-${keeper.id}-name`}
                  placeholder={t('create.step3.namePlaceholder')}
                  value={keeper.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`keeper-${keeper.id}-phone`}>{t('create.step3.phoneLabel')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
                  <Input
                    id={`keeper-${keeper.id}-phone`}
                    type="tel"
                    placeholder={t('create.step3.phonePlaceholder')}
                    value={keeper.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`keeper-${keeper.id}-email`}>{t('create.step3.emailLabel')} <span className="text-muted-foreground font-normal">({t('common.optional')})</span></Label>
                  <Input
                    id={`keeper-${keeper.id}-email`}
                    type="email"
                    placeholder={t('create.step3.emailPlaceholder')}
                    value={keeper.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('create.step3.languageLabel')}</Label>
                <Select
                  value={keeper.language}
                  onValueChange={(value) => updateField('language', value as LanguageCode)}
                >
                  <SelectTrigger className="w-full">
                    <Globe className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t('create.step3.languageHelp')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`keeper-${keeper.id}-storage`}>
                  {t('create.step3.storageLabel')}
                </Label>
                <Input
                  id={`keeper-${keeper.id}-storage`}
                  placeholder={t('create.step3.storagePlaceholder')}
                  value={keeper.storageNote}
                  onChange={(e) => updateField('storageNote', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {t('create.step3.storageHelp')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
