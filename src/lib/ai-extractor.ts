import { ExtractedLandData } from './types';

/**
 * AI Extractor for Land Certificate data using Gemini API with heuristic NLP fallback
 */
export class AiExtractor {
  static async extractLandData(rawText: string): Promise<ExtractedLandData[]> {
    if (!rawText || !rawText.trim()) {
      return [];
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 5) {
      try {
        const geminiResult = await this.callGeminiApi(rawText, apiKey);
        if (geminiResult && geminiResult.length > 0) {
          return geminiResult;
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to heuristic parser:', err);
      }
    }

    // Heuristic NLP fallback for offline/demo robustness
    return this.heuristicParser(rawText);
  }

  private static async callGeminiApi(rawText: string, apiKey: string): Promise<ExtractedLandData[]> {
    const prompt = `You are an AI data assistant specializing in Indonesian land registration. Extract land ownership data from the following unstructured text (could be from BPN records, notarial deeds, or property listing data).
Output must be a valid JSON array of objects with keys:
- "owner_name": Full name of land owner
- "owner_id": NIK/KTP number (16 digits), or empty string if not found
- "land_location": Full address or location of the land
- "land_area": Area measurement (e.g. "500 m²")
- "land_type": Type of certificate (SHM, SHGB, AJB, HGB, HP, etc.)

Capitalize names nicely. If land type is not mentioned, default to "SHM".

Raw text:
"""
${rawText}
"""
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => ({
          owner_name: String(item.owner_name || 'Pemilik').trim(),
          owner_id: String(item.owner_id || '').trim(),
          land_location: String(item.land_location || '').trim(),
          land_area: String(item.land_area || '').trim(),
          land_type: String(item.land_type || 'SHM').trim().toUpperCase(),
        })).filter(item => item.owner_name.length > 1);
      }
    }

    return [];
  }

  /**
   * Heuristic parser for land data from various text formats
   */
  private static heuristicParser(text: string): ExtractedLandData[] {
    const results: ExtractedLandData[] = [];
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) continue;

      // Extract general patterns across the whole line
      const nikMatch = trimmed.match(/\b(\d{16})\b/);
      const areaMatch = trimmed.match(/(\d+[\s.,]?\d*)\s*(m²|m2|meter\s*persegi|meter|hektar|ha|are)/i);
      const typeMatch = trimmed.match(/\b(SHM|SHGB|AJB|HGB|HP|GIRIK|LETTER\s*C|SKT)\b/i);

      // Determine delimiter: prefer | or ; or - over comma
      let parts: string[] = [];
      if (trimmed.includes('|')) {
        parts = trimmed.split('|').map(p => p.trim()).filter(Boolean);
      } else if (trimmed.includes(';')) {
        parts = trimmed.split(';').map(p => p.trim()).filter(Boolean);
      } else if (trimmed.includes(' - ')) {
        parts = trimmed.split(' - ').map(p => p.trim()).filter(Boolean);
      } else if (trimmed.includes('\t')) {
        parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean);
      } else if ((trimmed.match(/,/g) || []).length >= 3 && !trimmed.match(/,\s*(rt|rw|kel|kec|kab|kota|desa|no|blok)/i)) {
        parts = trimmed.split(',').map(p => p.trim()).filter(Boolean);
      }

      if (parts.length >= 2) {
        // Name is the first part, stripped of bullets/numbers
        let rawName = parts[0]
          .replace(/^[\d.)\s\-#*]+/, '')
          .replace(/^(nama|pemilik|atas\s*nama|a\.n\.?)\s*[:=\-]?\s*/i, '')
          .trim();

        // Find location by filtering out parts that are NIK, area, or certificate type
        let candidateLocation = '';
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          const isNikPart = /\b\d{16}\b/.test(part) || /^nik\b/i.test(part);
          const isAreaPart = /^(\d+[\s.,]?\d*)\s*(m²|m2|meter|hektar|ha|are)$/i.test(part);
          const isTypePart = /^(SHM|SHGB|AJB|HGB|HP|GIRIK)$/i.test(part);

          if (!isNikPart && !isAreaPart && !isTypePart) {
            if (part.length > candidateLocation.length) {
              candidateLocation = part;
            }
          }
        }

        // Clean up location
        candidateLocation = candidateLocation.replace(/^(lokasi|alamat|letak)\s*[:=\-]?\s*/i, '').trim();

        if (rawName && rawName.length > 1) {
          results.push({
            owner_name: rawName
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' '),
            owner_id: nikMatch ? nikMatch[1] : '',
            land_location: candidateLocation || 'DKI Jakarta',
            land_area: areaMatch ? `${areaMatch[1]} ${areaMatch[2].replace(/m2/i, 'm²')}` : '500 m²',
            land_type: typeMatch ? typeMatch[1].toUpperCase() : 'SHM',
          });
        }
      } else {
        // Unstructured sentence fallback
        const nameMatch = trimmed.match(/^[\d.)\s\-#*]*([A-Za-z\s]+?)(?:\s*(?:NIK|dengan NIK|alamat|luas|[-:,|])|\s+\d{16})/i);
        const locationMatch = trimmed.match(/(?:Jl\.|Jalan|Desa|Kel\.|Kec\.|Kab\.|Kp\.|Blok|Kav\.)[\s\w.,/-]+/i);

        let extractedName = nameMatch ? nameMatch[1].trim() : '';
        extractedName = extractedName.replace(/^(nama|pemilik|atas\s*nama|a\.n\.?)\s*[:=\-]?\s*/i, '').trim();

        if (extractedName && extractedName.length > 1) {
          results.push({
            owner_name: extractedName
              .split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' '),
            owner_id: nikMatch ? nikMatch[1] : '',
            land_location: locationMatch ? locationMatch[0].trim() : 'DKI Jakarta',
            land_area: areaMatch ? `${areaMatch[1]} ${areaMatch[2].replace(/m2/i, 'm²')}` : '500 m²',
            land_type: typeMatch ? typeMatch[1].toUpperCase() : 'SHM',
          });
        }
      }
    }

    return results;
  }
}
