import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Check, Archive } from 'lucide-react';
import type { GeneratedShares } from '@/types';
import { generateKeeperPDF, generateOwnerPDF } from '@/lib/pdf';
import JSZip from 'jszip';

interface Step6DownloadProps {
  generatedShares: GeneratedShares | null;
  originalSecret: string;
}

export function Step6Download({ generatedShares }: Step6DownloadProps) {
  const { t } = useTranslation();
  const [downloadedPDFs, setDownloadedPDFs] = useState<Set<string>>(new Set());

  if (!generatedShares) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('create.step6.generating')}</p>
      </div>
    );
  }

  const downloadKeeperPDF = (keeperIndex: number) => {
    const keeper = generatedShares.config.keepers[keeperIndex];

    const pdf = generateKeeperPDF(generatedShares, keeperIndex);
    pdf.save(`keeper-${keeper.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);

    setDownloadedPDFs((prev) => new Set([...prev, keeper.id]));
  };

  const downloadOwnerPDF = () => {
    const pdf = generateOwnerPDF(generatedShares);
    pdf.save('keepers-reference.pdf');
    setDownloadedPDFs((prev) => new Set([...prev, 'owner']));
  };

  const downloadAllAsZip = async () => {
    const zip = new JSZip();

    // Add keeper PDFs
    for (let i = 0; i < generatedShares.config.keepers.length; i++) {
      const keeper = generatedShares.config.keepers[i];
      const pdf = generateKeeperPDF(generatedShares, i);
      const pdfBlob = pdf.output('blob');
      zip.file(`keeper-${keeper.name.toLowerCase().replace(/\s+/g, '-')}.pdf`, pdfBlob);
    }

    // Add owner PDF
    const ownerPdf = generateOwnerPDF(generatedShares);
    zip.file('keepers-reference.pdf', ownerPdf.output('blob'));

    // Generate and download zip
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keepers-documents.zip';
    a.click();
    URL.revokeObjectURL(url);

    // Mark all as downloaded
    const allIds = new Set([
      ...generatedShares.config.keepers.map((k) => k.id),
      'owner',
    ]);
    setDownloadedPDFs(allIds);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Check className="w-6 h-6 text-green-600" />
          {t('create.step6.title')}
        </h2>
        <p className="text-muted-foreground">
          {t('create.step6.description')}
        </p>
      </div>

      <div className="space-y-3">
        {generatedShares.config.keepers.map((keeper, index) => (
          <Card key={keeper.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t('create.step6.keeperDocument', { name: keeper.name })}</p>
                    {keeper.storageNote && (
                      <p className="text-sm text-muted-foreground">
                        {t('create.step6.share')}: {keeper.storageNote}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant={downloadedPDFs.has(keeper.id) ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => downloadKeeperPDF(index)}
                >
                  {downloadedPDFs.has(keeper.id) ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {t('create.step6.downloaded')}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {t('common.download')}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={downloadAllAsZip} variant="outline" className="w-full">
        <Archive className="w-4 h-4 mr-2" />
        {t('common.downloadAll')}
      </Button>

      <div className="border-t pt-6">
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{t('create.step6.referenceCopy')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('create.step6.referenceCopyDesc')}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadOwnerPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('common.download')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 text-sm text-center">
        <p className="text-muted-foreground">
          {t('create.step6.secretCleared')}
        </p>
      </div>
    </div>
  );
}
