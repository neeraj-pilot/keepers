import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '@/i18n';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (language: LanguageCode) => {
    i18n.changeLanguage(language);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (l) => l.code === i18n.language
  ) || SUPPORTED_LANGUAGES[0];

  if (variant === 'minimal') {
    return (
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-auto gap-2 ${className}`}>
          <Globe className="h-4 w-4" />
          <SelectValue>{currentLanguage.nativeName}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[180px] ${className}`}>
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue>{currentLanguage.nativeName}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.nativeName}</span>
              {lang.code !== 'en' && (
                <span className="text-muted-foreground text-xs">({lang.name})</span>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
