import { ExtractedParticipant } from './types';

/**
 * Intelligent AI Extractor using Gemini 1.5 Flash API with heuristic NLP fallback
 */
export class AiExtractor {
  static async extractParticipants(rawText: string): Promise<ExtractedParticipant[]> {
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
        console.warn('Gemini API call failed or quota exceeded, falling back to heuristic AI parser:', err);
      }
    }

    // Heuristic NLP fallback for offline/demo robustness
    return this.heuristicParser(rawText);
  }

  private static async callGeminiApi(rawText: string, apiKey: string): Promise<ExtractedParticipant[]> {
    const prompt = `You are an AI data assistant. Extract participant names and their email addresses from the following messy, unstructured text (such as Zoom chat, Telegram logs, attendance dumps).
Output must be a valid JSON array of objects with keys "name" and "email".
Capitalize names nicely. If only email exists and no name, derive a clean name from the email prefix.

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
          name: String(item.name || item.fullName || 'Participant').trim(),
          email: String(item.email || '').trim().toLowerCase(),
        })).filter(item => item.email.includes('@'));
      }
    }

    return [];
  }

  /**
   * Advanced regex & heuristic parser for chats (Telegram, Zoom, WhatsApp, CSV-like)
   */
  private static heuristicParser(text: string): ExtractedParticipant[] {
    const results: ExtractedParticipant[] = [];
    const seenEmails = new Set<string>();

    // Pattern 1: Email regex
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const lines = text.split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const emailsInLine = trimmed.match(emailRegex);
      if (emailsInLine) {
        for (const email of emailsInLine) {
          const cleanEmail = email.toLowerCase();
          if (seenEmails.has(cleanEmail)) continue;

          // Try to extract name nearby
          let name = '';

          // e.g. "Budi (budi@gmail.com)" or "budi: budi@gmail.com" or "Budi Santoso - budi@gmail.com"
          const nameBeforeParen = trimmed.match(new RegExp(`([A-Za-z\\s]+)\\s*[\\(\\[<]${email}[\\)\\]>]`));
          const nameBeforeHyphen = trimmed.match(new RegExp(`([A-Za-z\\s]+)\\s*[-:|]\\s*${email}`));
          const nameAfterNameIs = trimmed.match(new RegExp(`(?:namanya|nama|name is|name)\\s*[:\\s]*([A-Za-z]+)`, 'i'));

          if (nameBeforeParen && nameBeforeParen[1].trim()) {
            name = nameBeforeParen[1].trim();
          } else if (nameBeforeHyphen && nameBeforeHyphen[1].trim()) {
            name = nameBeforeHyphen[1].trim();
          } else if (nameAfterNameIs && nameAfterNameIs[1].trim()) {
            name = nameAfterNameIs[1].trim();
          } else {
            // Clean from email prefix
            const prefix = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
            name = prefix
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }

          // Clean words like "hadir", "bang", "min", "iya", "ada" if present
          name = name.replace(/\b(hadir|bang|min|admin|iya|bro|si|om|pak|bu)\b/gi, '').trim();
          if (!name || name.length < 2) {
            name = cleanEmail.split('@')[0];
            name = name.charAt(0).toUpperCase() + name.slice(1);
          }

          results.push({
            name,
            email: cleanEmail,
          });
          seenEmails.add(cleanEmail);
        }
      }
    }

    // If no line-by-line emails matched, search across entire text
    if (results.length === 0) {
      const allEmails = text.match(emailRegex) || [];
      for (const email of allEmails) {
        const cleanEmail = email.toLowerCase();
        if (!seenEmails.has(cleanEmail)) {
          const prefix = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
          const name = prefix
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          results.push({ name, email: cleanEmail });
          seenEmails.add(cleanEmail);
        }
      }
    }

    return results;
  }
}
