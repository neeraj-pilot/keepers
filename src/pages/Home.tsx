import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Shield, Users, FileKey, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export function Home() {
  const { t } = useTranslation();

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {t('common.appName')}
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto">
            {t('home.tagline')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Button asChild size="lg" className="gap-2">
            <Link to="/create">
              {t('home.createNew')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/recover">{t('home.recoverExisting')}</Link>
          </Button>
        </motion.div>
      </section>

      {/* Features */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid sm:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-xl border bg-card">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <FileKey className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">{t('home.features.splitSecure.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('home.features.splitSecure.description')}
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">{t('home.features.trustedCircle.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('home.features.trustedCircle.description')}
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">{t('home.features.trulyPrivate.title')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('home.features.trulyPrivate.description')}
          </p>
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center">{t('home.howItWorks.title')}</h2>
        <div className="space-y-4">
          {[
            { step: 1, text: t('home.howItWorks.step1.title') },
            { step: 2, text: t('home.howItWorks.step2.title') },
            { step: 3, text: t('home.howItWorks.step3.title') },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 text-sm font-medium">
                {item.step}
              </div>
              <p className="pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Trust indicators */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="border rounded-xl p-6 bg-muted/30"
      >
        <h3 className="font-semibold mb-4 text-center">{t('home.security.title')}</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            t('home.security.noServers'),
            t('home.security.browserOnly'),
            t('home.security.openSource'),
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
