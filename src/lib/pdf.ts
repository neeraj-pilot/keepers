import jsPDF from 'jspdf';
import type { GeneratedShares } from '@/types';
import { SECRET_TYPE_LABELS } from '@/types';
import { getTranslation, type LanguageCode } from '@/i18n';

const COLORS = {
  primary: '#18181b',
  muted: '#71717a',
  border: '#e4e4e7',
  background: '#ffffff',
};

function drawHeader(doc: jsPDF, y: number, lang: LanguageCode): number {
  const t = (key: string) => getTranslation(lang, key);

  // Logo/title
  doc.setFontSize(20);
  doc.setTextColor(COLORS.primary);
  doc.text('KEEPERS', 20, y);

  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted);
  doc.text(t('pdf.subtitle'), 20, y + 6);

  return y + 15;
}

function drawSection(doc: jsPDF, title: string, y: number): number {
  doc.setDrawColor(COLORS.border);
  doc.line(20, y, 190, y);

  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted);
  doc.text(title.toUpperCase(), 20, y + 8);

  return y + 14;
}

function wrapText(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split('\n');

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      lines.push('');
      continue;
    }
    const wrapped = doc.splitTextToSize(paragraph, maxWidth);
    lines.push(...wrapped);
  }

  return lines;
}

function getSecretTypeLabel(secretType: string, customSecretType: string | undefined, lang: LanguageCode): string {
  if (secretType === 'other' && customSecretType) {
    return customSecretType;
  }
  // Try to get translated label
  const translationKey = `create.step2.types.${secretType === 'crypto-wallet' ? 'cryptoWallet' : secretType === 'password-manager' ? 'passwordManager' : secretType === 'encryption-key' ? 'encryptionKey' : 'other'}`;
  const translated = getTranslation(lang, translationKey);
  if (translated && translated !== translationKey) {
    return translated;
  }
  return SECRET_TYPE_LABELS[secretType as keyof typeof SECRET_TYPE_LABELS] || secretType;
}

function generateKeeperPDFPage(
  doc: jsPDF,
  shares: GeneratedShares,
  keeperIndex: number,
  lang: LanguageCode,
  startY: number = 25
): number {
  const t = (key: string, options?: Record<string, unknown>) => getTranslation(lang, key, options);
  const keeper = shares.config.keepers[keeperIndex];
  const share = shares.shares[keeperIndex];
  const otherKeepers = shares.config.keepers.filter((_, i) => i !== keeperIndex);
  const secretTypeLabel = getSecretTypeLabel(shares.config.secretType, shares.config.customSecretType, lang);

  let y = startY;

  // Header
  y = drawHeader(doc, y, lang);

  // Keeper info
  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  doc.text(t('pdf.forKeeper', { name: keeper.name }), 20, y);
  doc.text(t('pdf.createdBy', { name: shares.config.ownerName }), 20, y + 6);
  doc.text(t('pdf.date', { date: shares.createdAt }), 20, y + 12);

  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted);
  doc.text(t('pdf.protects', { type: secretTypeLabel }), 20, y + 20);

  let infoY = y + 26;

  // Add account/service name if provided
  if (shares.config.toolName) {
    doc.text(t('pdf.accountName', { name: shares.config.toolName }), 20, infoY);
    infoY += 6;
  }

  // Add service URL if provided
  if (shares.config.toolWebsite) {
    doc.text(t('pdf.serviceUrl', { url: shares.config.toolWebsite }), 20, infoY);
    infoY += 6;
  }

  doc.text(t('pdf.recoveryRequires', { threshold: shares.config.threshold, total: shares.config.keepers.length }), 20, infoY);

  y = infoY + 9;

  // When to use
  y = drawSection(doc, t('pdf.whenToUse'), y);

  doc.setFontSize(10);
  doc.setTextColor(COLORS.primary);

  // First scenario - owner asks for help
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.ifOwnerAsks', { name: shares.config.ownerName }), 20, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const askLines = wrapText(doc, t('pdf.ifOwnerAsksDesc'), 170);
  for (const line of askLines) {
    doc.text(line, 20, y);
    y += 5;
  }
  y += 4;

  // Second scenario - owner unavailable
  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.ifOwnerUnavailable', { name: shares.config.ownerName }), 20, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  const unavailLines = wrapText(doc, t('pdf.ifOwnerUnavailableDesc', { threshold: shares.config.threshold }), 170);
  for (const line of unavailLines) {
    doc.text(line, 20, y);
    y += 5;
  }

  y += 4;

  // Message from owner
  if (shares.config.message) {
    y = drawSection(doc, t('pdf.messageSection', { name: shares.config.ownerName }), y);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(COLORS.primary);

    const messageLines = wrapText(doc, `"${shares.config.message}"`, 170);
    for (const line of messageLines) {
      if (y > 260) {
        doc.addPage();
        y = 25;
      }
      doc.text(line, 20, y);
      y += 5;
    }
    doc.setFont('helvetica', 'normal');
    y += 4;
  }

  // Check if we need a new page for the secret piece
  if (y > 160) {
    doc.addPage();
    y = 25;
  }

  // Secret piece
  y = drawSection(doc, t('pdf.yourPiece'), y);

  // Code box
  doc.setFillColor('#f4f4f5');
  doc.roundedRect(20, y, 170, 20, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('courier', 'normal');
  doc.setTextColor(COLORS.primary);

  // Show raw share without K{n}- prefix for compatibility with other Shamir tools
  const shareCode = share.shareData;
  const codeLines = doc.splitTextToSize(shareCode, 165);
  let codeY = y + 8;
  for (const line of codeLines) {
    doc.text(line, 25, codeY);
    codeY += 5;
  }

  y += 28;

  // Check if we need a new page
  if (y > 200) {
    doc.addPage();
    y = 25;
  }

  // Other keepers
  y = drawSection(doc, t('pdf.otherKeepers'), y);

  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted);
  doc.text(t('pdf.otherKeepersDesc'), 20, y);
  y += 8;

  for (const other of otherKeepers) {
    if (y > 260) {
      doc.addPage();
      y = 25;
    }

    doc.setFillColor('#fafafa');
    doc.roundedRect(20, y, 170, 22, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary);
    doc.text(other.name, 25, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.muted);

    const contactParts = [other.phone, other.email].filter(Boolean).join(' | ');
    doc.text(contactParts, 25, y + 13);

    if (other.storageNote) {
      doc.text(t('pdf.theirCopy', { location: other.storageNote }), 25, y + 19);
    }

    y += 26;
  }

  // Owner contact
  if (shares.config.ownerContact) {
    y = drawSection(doc, t('pdf.ownerContact'), y);

    doc.setFontSize(10);
    doc.setTextColor(COLORS.primary);
    doc.text(shares.config.ownerName, 20, y);

    doc.setFontSize(9);
    doc.setTextColor(COLORS.muted);
    doc.text(shares.config.ownerContact, 20, y + 6);

    y += 14;
  }

  // How to recover
  y = drawSection(doc, t('pdf.howToRecover'), y);

  doc.setFontSize(9);
  doc.setTextColor(COLORS.primary);

  doc.text(t('pdf.recoverStep1'), 20, y);
  y += 5;
  doc.text(t('pdf.recoverStep2'), 20, y);
  y += 5;
  doc.text(t('pdf.recoverStep3'), 20, y);
  y += 5;
  doc.text(t('pdf.recoverStep4'), 20, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.text(t('pdf.ifSiteUnavailable'), 20, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(t('pdf.ifSiteUnavailableDesc'), 20, y);
  y += 5;

  // Footer
  y += 10;
  doc.setDrawColor(COLORS.border);
  doc.line(20, y, 190, y);

  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted);
  doc.text(
    t('pdf.footer'),
    105,
    y + 6,
    { align: 'center', maxWidth: 170 }
  );

  return y + 15;
}

export function generateKeeperPDF(
  shares: GeneratedShares,
  keeperIndex: number
): jsPDF {
  const doc = new jsPDF();
  const keeper = shares.config.keepers[keeperIndex];
  const keeperLang = (keeper.language || 'en') as LanguageCode;

  // Generate PDF in keeper's language
  generateKeeperPDFPage(doc, shares, keeperIndex, keeperLang);

  // If not English, add English version on next pages
  if (keeperLang !== 'en') {
    doc.addPage();

    // Add a separator page indicating English version
    doc.setFontSize(14);
    doc.setTextColor(COLORS.muted);
    doc.text('--- English Version ---', 105, 20, { align: 'center' });

    generateKeeperPDFPage(doc, shares, keeperIndex, 'en', 35);
  }

  return doc;
}

export function generateOwnerPDF(shares: GeneratedShares): jsPDF {
  const doc = new jsPDF();
  const secretTypeLabel =
    SECRET_TYPE_LABELS[shares.config.secretType as keyof typeof SECRET_TYPE_LABELS] ||
    shares.config.secretType;

  let y = 25;

  // Header
  y = drawHeader(doc, y);

  doc.setFontSize(11);
  doc.setTextColor(COLORS.primary);
  doc.text('Your Reference Copy', 20, y);

  y += 10;

  // Summary
  doc.setFontSize(10);
  doc.text(`Owner: ${shares.config.ownerName}`, 20, y);
  doc.text(`Created: ${shares.createdAt}`, 20, y + 6);

  doc.setTextColor(COLORS.muted);
  doc.text(`Protects: ${secretTypeLabel}`, 20, y + 14);

  let ownerInfoY = y + 20;

  // Add account/service name if provided
  if (shares.config.toolName) {
    doc.text(`Account/Service: ${shares.config.toolName}`, 20, ownerInfoY);
    ownerInfoY += 6;
  }

  // Add service URL if provided
  if (shares.config.toolWebsite) {
    doc.text(`Service URL: ${shares.config.toolWebsite}`, 20, ownerInfoY);
    ownerInfoY += 6;
  }

  doc.text(`Recovery: Any ${shares.config.threshold} of ${shares.config.keepers.length} keepers`, 20, ownerInfoY);

  y = ownerInfoY + 10;

  // Keepers list
  y = drawSection(doc, 'Your Keepers', y);

  for (const keeper of shares.config.keepers) {
    if (y > 250) {
      doc.addPage();
      y = 25;
    }

    doc.setFillColor('#fafafa');
    doc.roundedRect(20, y, 170, 24, 2, 2, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary);
    doc.text(keeper.name, 25, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.muted);

    const contactParts = [keeper.phone, keeper.email].filter(Boolean).join(' | ');
    doc.text(contactParts, 25, y + 14);

    if (keeper.storageNote) {
      doc.text(`Stored: ${keeper.storageNote}`, 25, y + 20);
    }

    y += 28;
  }

  y += 5;

  // How to recover
  y = drawSection(doc, 'To Recover Your Secret', y);

  doc.setFontSize(9);
  doc.setTextColor(COLORS.primary);

  const howToRecover = [
    `1. Contact any ${shares.config.threshold} keepers above`,
    '2. Go to keepers.io/recover together',
    '3. Each person enters their piece',
    '4. Your secret is restored',
  ];

  for (const line of howToRecover) {
    doc.text(line, 20, y);
    y += 6;
  }

  y += 10;

  // Warning
  doc.setFillColor('#fef3c7');
  doc.roundedRect(20, y, 170, 20, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setTextColor('#92400e');
  doc.text('This document does NOT contain any secret piece.', 25, y + 8);
  doc.text("It's safe to keep but not useful for recovery alone.", 25, y + 14);

  return doc;
}
