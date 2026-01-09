import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function Layout({ children, showNav = true }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNav && (
        <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-semibold text-lg">{t('common.appName')}</span>
              </Link>
              <div className="flex items-center gap-4">
                {!isHome && (
                  <nav className="flex items-center gap-4">
                    <Link
                      to="/create"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('home.createNew')}
                    </Link>
                    <Link
                      to="/recover"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t('home.recoverExisting')}
                    </Link>
                  </nav>
                )}
                <LanguageSelector variant="minimal" />
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </div>
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            {t('home.footer.privacy')}
          </p>
        </div>
      </footer>
    </div>
  );
}
