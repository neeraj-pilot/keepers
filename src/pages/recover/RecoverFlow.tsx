import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Key,
  Copy,
  RefreshCw,
} from 'lucide-react';
import { combineShares, validateShare } from '@/lib/shamir';
import { cn } from '@/lib/utils';

interface CollectedPiece {
  id: string;
  raw: string;
  share: string;
}

export function RecoverFlow() {
  const { t } = useTranslation();
  const [pieces, setPieces] = useState<CollectedPiece[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recoveredSecret, setRecoveredSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const addPiece = (raw: string) => {
    // Remove all whitespace (spaces, newlines, tabs) - users often copy from PDFs with line breaks
    const cleaned = raw.replace(/\s+/g, '');
    if (!cleaned) return;

    const share = cleaned;

    // Check for duplicates
    if (pieces.some((p) => p.share === share)) {
      setError(t('recover.errors.duplicate'));
      return;
    }

    // Validate share format
    if (!validateShare(share)) {
      setError(t('recover.errors.invalidFormat'));
      return;
    }

    setPieces((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        raw: cleaned,
        share,
      },
    ]);
    setCurrentInput('');
    setError(null);
  };

  const removePiece = (id: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
    setError(null);
    setRecoveredSecret(null);
  };

  const attemptRecovery = () => {
    if (pieces.length < 2) {
      setError(t('recover.errors.needAtLeast2'));
      return;
    }

    try {
      const shares = pieces.map((p) => p.share);
      const recovered = combineShares(shares);

      if (recovered && recovered.length > 0) {
        setRecoveredSecret(recovered);
        setError(null);
      } else {
        setError(t('recover.errors.recoveryFailed'));
      }
    } catch {
      setError(t('recover.errors.piecesMismatch'));
    }
  };

  const copyToClipboard = async () => {
    if (!recoveredSecret) return;
    await navigator.clipboard.writeText(recoveredSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setPieces([]);
    setCurrentInput('');
    setError(null);
    setRecoveredSecret(null);
  };

  // Success state
  if (recoveredSecret) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
            <Key className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-semibold">{t('recover.success.title')}</h2>
          <p className="text-muted-foreground">
            {t('recover.success.description', { count: pieces.length })}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted font-mono text-sm break-all">
                {recoveredSecret}
              </div>
              <Button onClick={copyToClipboard} className="w-full">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('common.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    {t('common.copyToClipboard')}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('recover.success.warning')}
          </AlertDescription>
        </Alert>

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.startOver')}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">{t('recover.title')}</h2>
        <p className="text-muted-foreground">
          {t('recover.description')}
        </p>
      </div>

      {/* Collected pieces */}
      <AnimatePresence>
        {pieces.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium">{t('recover.collectedPieces')}</p>
            {pieces.map((piece, index) => (
              <motion.div
                key={piece.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {t('recover.pieceNumber', { number: index + 1 })}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {piece.share.slice(0, 12)}...
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePiece(piece.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add piece */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-sm font-medium">
              {pieces.length === 0 ? t('recover.addFirstPiece') : t('recover.addAnotherPiece')}
            </p>

            <div className="flex gap-2">
              <Input
                placeholder={t('recover.inputPlaceholder')}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addPiece(currentInput);
                  }
                }}
                className="font-mono text-sm"
              />
              <Button
                onClick={() => addPiece(currentInput)}
                disabled={!currentInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recover button */}
      <Button
        onClick={attemptRecovery}
        disabled={pieces.length < 2}
        className={cn('w-full', pieces.length >= 2 && 'animate-pulse')}
        size="lg"
      >
        {pieces.length < 2
          ? t('recover.needMorePieces', { count: 2 - pieces.length })
          : t('recover.recoverSecret')}
      </Button>

      {/* Help text */}
      <div className="p-4 rounded-lg bg-muted/50 text-sm text-center text-muted-foreground">
        {t('recover.help')}
      </div>
    </div>
  );
}
