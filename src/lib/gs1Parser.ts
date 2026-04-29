/**
 * GS1 Application Identifiers (AIs) used in this parser:
 * (01) - GTIN (Ignore)
 * (17) - Expiry Date (YYMMDD) -> Extract MM and YYYY
 * (10) - Batch / Lot Number (Variable length) -> Extract
 * (21) - Serial Number (Variable length) -> Ignore
 */

export interface GS1Data {
  gtin: string | null;
  batchNumber: string | null;
  expiryMonth: string | null;
  expiryYear: string | null;
}

export function parseGS1QRCode(rawString: string): GS1Data | null {
  if (!rawString) return null;

  let cleanString = rawString.trim();

  // 1. Handle GS1 Digital Link (URL format)
  // Example: https://id.gs1.org/gtin/08901072001015/exp/251231/lot/ABC123
  if (cleanString.startsWith('http')) {
    try {
      const url = new URL(cleanString);
      const pathParts = url.pathname.split('/').filter(Boolean);
      
      let gtin: string | null = null;
      let batchNumber: string | null = null;
      let expiryMonth: string | null = null;
      let expiryYear: string | null = null;

      // Map common segment names to AIs
      const segmentMap: Record<string, string> = {
        'gtin': '01',
        'lot': '10',
        'batch': '10',
        'exp': '17',
        'expiry': '17',
        'best-before': '15'
      };

      // Helper to process YYMMDD
      const applyDate = (val: string) => {
        if (val.length >= 4) {
          const yy = val.substring(0, 2);
          const mm = parseInt(val.substring(2, 4));
          if (mm >= 1 && mm <= 12) {
            expiryYear = `20${yy}`;
            expiryMonth = mm.toString();
          }
        }
      };

      // Check Path segments
      for (let i = 0; i < pathParts.length; i += 2) {
        let aiKey = pathParts[i].toLowerCase();
        // Handle mapped names or raw AIs
        const ai = segmentMap[aiKey] || aiKey;
        const val = pathParts[i+1];
        if (!val) break;

        if (ai === '01') gtin = val;
        else if (ai === '10') batchNumber = val;
        else if (ai === '17' || ai === '15') applyDate(val);
      }

      // Check Query Parameters for AIs or keys
      url.searchParams.forEach((val, key) => {
        const ai = segmentMap[key.toLowerCase()] || key;
        if (ai === '01') gtin = gtin || val;
        else if (ai === '10') batchNumber = batchNumber || val;
        else if (ai === '17' || ai === '15') applyDate(val);
      });
      
      if (gtin || batchNumber || expiryMonth) {
        return { gtin, batchNumber, expiryMonth, expiryYear };
      }
    } catch (e) {
      // Not a valid URL structure, fallback to raw parsing
    }
  }

  // 2. Clean prefixes and control characters for raw GS1 parsing
  cleanString = cleanString.replace(/^[\x1d\x1e\x1f\x00-\x1f\x7f]+/, '');
  if (cleanString.startsWith(']d2')) {
    cleanString = cleanString.substring(3);
  }

  let gtin: string | null = null;
  let batchNumber: string | null = null;
  let expiryMonth: string | null = null;
  let expiryYear: string | null = null;

  const parseDate = (value: string) => {
    if (value && value.length >= 4) { // Allow YYMM format just in case
      const yy = value.substring(0, 2);
      const mm = value.substring(2, 4);
      const monthNum = parseInt(mm);
      if (monthNum >= 1 && monthNum <= 12) {
        expiryYear = `20${yy}`;
        expiryMonth = monthNum.toString();
        return true;
      }
    }
    return false;
  };

  if (cleanString.includes('(')) {
    const aiRegex = /\((\d{2,4})\)([^()]+)/g;
    let match;
    
    while ((match = aiRegex.exec(cleanString)) !== null) {
      const ai = match[1];
      const value = match[2].trim();
      
      if (ai === '01') {
        gtin = value.substring(0, 14);
      } else if (ai === '10') {
        batchNumber = value.split(/[\x1d\x1e\x1f]/)[0];
      } else if (ai === '17' || ai === '15') {
        parseDate(value);
      }
    }
  } else {
    // Structural parsing for GS1 without parentheses (Deterministic Scan)
    let currentPos = 0;
    while (currentPos < cleanString.length) {
      if (/[\x1d\x1e\x1f]/.test(cleanString[currentPos])) {
        currentPos++;
        continue;
      }

      const ai2 = cleanString.substring(currentPos, currentPos + 2);
      
      if (ai2 === '01') { // GTIN - MUST be 14 digits plus AI
        gtin = cleanString.substring(currentPos + 2, currentPos + 16);
        currentPos += 16;
      } else if (ai2 === '17' || ai2 === '15') { // Expiry/Best Before - 6 digits
        const dateVal = cleanString.substring(currentPos + 2, currentPos + 8);
        parseDate(dateVal);
        currentPos += 8;
      } else if (ai2 === '11') { // Manufacturing Date - 6 digits
        currentPos += 8;
      } else if (ai2 === '10' || ai2 === '21') { // Batch or Serial - Variable length
        const remaining = cleanString.substring(currentPos + 2);
        const nextSeparator = remaining.search(/[\x1d\x1e\x1f]/);
        // Look for boundaries of next possible fixed-length AIs (01, 17, 15, 11)
        const nextDateMatch = remaining.match(/(17|15|11)\d{6}/);
        const nextDateIndex = nextDateMatch ? nextDateMatch.index : -1;
        const nextGtinMatch = remaining.match(/01\d{14}/);
        const nextGtinIndex = nextGtinMatch ? nextGtinMatch.index : -1;
        
        let stopIndex = remaining.length;
        if (nextSeparator !== -1) stopIndex = nextSeparator;
        if (nextDateIndex !== -1 && nextDateIndex < stopIndex) stopIndex = nextDateIndex;
        if (nextGtinIndex !== -1 && nextGtinIndex < stopIndex) stopIndex = nextGtinIndex;

        const val = remaining.substring(0, stopIndex);
        if (ai2 === '10') batchNumber = val;
        currentPos += 2 + val.length;
      } else if (ai2 === '30' || ai2 === '37') { // Quantity AIs (Variable length)
        const remaining = cleanString.substring(currentPos + 2);
        const nextSeparator = remaining.search(/[\x1d\x1e\x1f]/);
        const stopIndex = nextSeparator !== -1 ? nextSeparator : remaining.length;
        currentPos += 2 + stopIndex;
      } else {
        currentPos++;
      }
    }
  }

  if (!gtin && !batchNumber && !expiryMonth && !expiryYear) {
    return null;
  }

  return { gtin, batchNumber, expiryMonth, expiryYear };
}
