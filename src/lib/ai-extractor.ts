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
    
    // Try to parse line-by-line for structured input
    // Patterns: "Name | NIK | Location | Area | Type"
    // or "Name - Location - Area"
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 5) continue;

      // Pattern: pipe-separated or comma-separated
      const parts = trimmed.split(/[|,;]\s*/);
      
      if (parts.length >= 3) {
        const ownerName = parts[0].replace(/^[\d.)\s]+/, '').trim();
        const nikMatch = trimmed.match(/\b(\d{16})\b/);
        const areaMatch = trimmed.match(/(\d+[\s.,]?\d*)\s*(m²|m2|meter|hektar|ha|are)/i);
        const typeMatch = trimmed.match(/\b(SHM|SHGB|AJB|HGB|HP|GIRIK|LETTER\s*C|SKT)\b/i);
        
        // Find location (usually the longest part that's not a name or number)
        let location = '';
        for (const part of parts) {
          const clean = part.trim();
          if (clean.length > location.length && clean !== ownerName && !clean.match(/^\d{16}$/)) {
            if (clean.match(/jl|jalan|desa|kec|kab|kel|rt|rw|no|blok/i) || clean.length > 20) {
              location = clean;
            }
          }
        }
        if (!location && parts.length >= 2) {
          location = parts[1].trim();
        }

        if (ownerName && ownerName.length > 1) {
          results.push({
            owner_name: ownerName.split(' ')
              .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
              .join(' '),
            owner_id: nikMatch ? nikMatch[1] : '',
            land_location: location || 'Lokasi tidak terdeteksi',
            land_area: areaMatch ? `${areaMatch[1]} ${areaMatch[2]}` : '0 m²',
            land_type: typeMatch ? typeMatch[1].toUpperCase() : 'SHM',
          });
        }
      } else {
        // Single line with embedded data
        const nameMatch = trimmed.match(/^([A-Za-z\s]+?)(?:\s*[-:|,]|\s+\d)/);
        const nikMatch = trimmed.match(/\b(\d{16})\b/);
        const areaMatch = trimmed.match(/(\d+[\s.,]?\d*)\s*(m²|m2|meter|hektar|ha|are)/i);
        const typeMatch = trimmed.match(/\b(SHM|SHGB|AJB|HGB|HP|GIRIK)\b/i);
        const locationMatch = trimmed.match(/(Jl\.|Jalan|Desa|Kel\.|Kec\.)[\s\w.,/-]+/i);

        if (nameMatch && nameMatch[1].trim().length > 1) {
          results.push({
            owner_name: nameMatch[1].trim(),
            owner_id: nikMatch ? nikMatch[1] : '',
            land_location: locationMatch ? locationMatch[0].trim() : '',
            land_area: areaMatch ? `${areaMatch[1]} ${areaMatch[2]}` : '0 m²',
            land_type: typeMatch ? typeMatch[1].toUpperCase() : 'SHM',
          });
        }
      }
    }

    return results;
  }
}
