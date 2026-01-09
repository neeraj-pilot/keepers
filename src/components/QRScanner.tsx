import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X, Keyboard } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scannerId = 'qr-scanner-container';

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode(scannerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
            scanner.stop();
          },
          () => {
            // Ignore scan errors (no QR found)
          }
        );
        setIsStarting(false);
      } catch (err) {
        setError(t('qrScanner.cameraError'));
        setIsStarting(false);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">{t('qrScanner.title')}</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {error ? (
          <div className="text-center space-y-4">
            <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={onClose} variant="outline">
              <Keyboard className="w-4 h-4 mr-2" />
              {t('qrScanner.manualEntry')}
            </Button>
          </div>
        ) : (
          <>
            <div
              ref={containerRef}
              id="qr-scanner-container"
              className="w-full max-w-sm aspect-square rounded-lg overflow-hidden bg-muted"
            />
            {isStarting && (
              <p className="mt-4 text-sm text-muted-foreground">{t('qrScanner.starting')}</p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">
              {t('qrScanner.instruction')}
            </p>
          </>
        )}
      </div>

      <div className="p-4 border-t">
        <Button onClick={onClose} variant="outline" className="w-full">
          <Keyboard className="w-4 h-4 mr-2" />
          {t('qrScanner.manualEntry')}
        </Button>
      </div>
    </div>
  );
}
