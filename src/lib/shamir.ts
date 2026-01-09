/**
 * Browser-native Shamir Secret Sharing implementation
 * Uses Web Crypto API for secure random number generation
 */

// GF(256) field operations for Shamir Secret Sharing
const PRIMITIVE_POLYNOMIAL = 0x11d; // x^8 + x^4 + x^3 + x^2 + 1

// Precomputed log and exp tables for GF(256)
const LOG_TABLE = new Uint8Array(256);
const EXP_TABLE = new Uint8Array(256);

// Initialize lookup tables
(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x = x << 1;
    if (x & 0x100) {
      x ^= PRIMITIVE_POLYNOMIAL;
    }
  }
  EXP_TABLE[255] = EXP_TABLE[0];
})();

// GF(256) multiplication
function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + LOG_TABLE[b]) % 255];
}

// GF(256) division
function gfDiv(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero');
  if (a === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] - LOG_TABLE[b] + 255) % 255];
}

// Evaluate polynomial at x
function evalPolynomial(coefficients: Uint8Array, x: number): number {
  if (x === 0) return coefficients[0];

  let result = 0;
  for (let i = coefficients.length - 1; i >= 0; i--) {
    result = gfMul(result, x) ^ coefficients[i];
  }
  return result;
}

// Lagrange interpolation to find f(0)
function lagrangeInterpolate(
  points: Array<{ x: number; y: number }>
): number {
  let result = 0;

  for (let i = 0; i < points.length; i++) {
    let numerator = 1;
    let denominator = 1;

    for (let j = 0; j < points.length; j++) {
      if (i !== j) {
        numerator = gfMul(numerator, points[j].x);
        denominator = gfMul(denominator, points[i].x ^ points[j].x);
      }
    }

    result ^= gfMul(points[i].y, gfDiv(numerator, denominator));
  }

  return result;
}

// Generate cryptographically secure random bytes
function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

// Convert string to bytes (UTF-8)
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert bytes to string (UTF-8)
function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

// Convert bytes to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to bytes
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Split a secret into shares
 * @param secret The secret string to split
 * @param totalShares Total number of shares to create
 * @param threshold Minimum shares needed to reconstruct
 * @returns Array of share strings (hex encoded with metadata)
 */
export function splitSecret(
  secret: string,
  totalShares: number,
  threshold: number
): string[] {
  if (threshold > totalShares) {
    throw new Error('Threshold cannot be greater than total shares');
  }
  if (threshold < 2) {
    throw new Error('Threshold must be at least 2');
  }
  if (totalShares > 255) {
    throw new Error('Cannot have more than 255 shares');
  }

  const secretBytes = stringToBytes(secret);
  const shares: Uint8Array[] = Array.from(
    { length: totalShares },
    () => new Uint8Array(secretBytes.length)
  );

  // For each byte of the secret
  for (let byteIndex = 0; byteIndex < secretBytes.length; byteIndex++) {
    // Generate random polynomial coefficients
    // coefficients[0] = secret byte, rest are random
    const coefficients = new Uint8Array(threshold);
    coefficients[0] = secretBytes[byteIndex];
    const randomCoeffs = getRandomBytes(threshold - 1);
    coefficients.set(randomCoeffs, 1);

    // Evaluate polynomial at x = 1, 2, 3, ...
    for (let shareIndex = 0; shareIndex < totalShares; shareIndex++) {
      const x = shareIndex + 1;
      shares[shareIndex][byteIndex] = evalPolynomial(coefficients, x);
    }
  }

  // Encode shares with metadata: threshold (1 byte) + share index (1 byte) + data
  return shares.map((shareData, index) => {
    const encoded = new Uint8Array(2 + shareData.length);
    encoded[0] = threshold;
    encoded[1] = index + 1; // x value (1-indexed)
    encoded.set(shareData, 2);
    return bytesToHex(encoded);
  });
}

/**
 * Combine shares to reconstruct the secret
 * @param shares Array of share strings (hex encoded)
 * @returns The reconstructed secret string
 */
export function combineShares(shares: string[]): string {
  if (shares.length < 2) {
    throw new Error('Need at least 2 shares');
  }

  // Decode shares
  const decodedShares = shares.map((share) => {
    const bytes = hexToBytes(share);
    return {
      threshold: bytes[0],
      x: bytes[1],
      data: bytes.slice(2),
    };
  });

  // Verify all shares have same threshold and data length
  const threshold = decodedShares[0].threshold;
  const dataLength = decodedShares[0].data.length;

  for (const share of decodedShares) {
    if (share.threshold !== threshold) {
      throw new Error('Shares have mismatched thresholds');
    }
    if (share.data.length !== dataLength) {
      throw new Error('Shares have mismatched data lengths');
    }
  }

  if (shares.length < threshold) {
    throw new Error(`Need at least ${threshold} shares to reconstruct`);
  }

  // Reconstruct each byte using Lagrange interpolation
  const secretBytes = new Uint8Array(dataLength);

  for (let byteIndex = 0; byteIndex < dataLength; byteIndex++) {
    const points = decodedShares.map((share) => ({
      x: share.x,
      y: share.data[byteIndex],
    }));
    secretBytes[byteIndex] = lagrangeInterpolate(points);
  }

  return bytesToString(secretBytes);
}

/**
 * Validate if a string looks like a valid share
 */
export function validateShare(share: string): boolean {
  try {
    if (!/^[0-9a-f]+$/i.test(share)) {
      return false;
    }
    if (share.length < 6) {
      // Minimum: threshold (2) + index (2) + at least 1 byte data (2)
      return false;
    }
    const bytes = hexToBytes(share);
    const threshold = bytes[0];
    const index = bytes[1];
    return threshold >= 2 && threshold <= 255 && index >= 1 && index <= 255;
  } catch {
    return false;
  }
}

/**
 * Get the share identifier (for deduplication)
 */
export function getShareId(share: string): string {
  if (share.length < 4) return share;
  // Return threshold + index as identifier
  return share.slice(0, 4);
}
