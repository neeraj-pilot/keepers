// QR code utilities

export function formatShareForQR(share: string, keeperIndex: number): string {
  // Format: K{index}-{share}
  // This makes it clear which keeper's share it is
  return `K${keeperIndex + 1}-${share}`;
}

export function parseShareFromQR(qrData: string): { index: number; share: string } | null {
  const match = qrData.match(/^K(\d+)-(.+)$/);
  if (!match) return null;

  return {
    index: parseInt(match[1], 10) - 1,
    share: match[2],
  };
}

export function isValidQRFormat(qrData: string): boolean {
  return /^K\d+-[0-9a-f]+$/i.test(qrData);
}
