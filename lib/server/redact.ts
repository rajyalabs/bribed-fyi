/**
 * Server-side masking of personal information in free-text fields.
 *
 * Layers (all applied; later layers can only add masks):
 *  1. Hard patterns — phone numbers, emails, Aadhaar/PAN, vehicle plates, UPI ids, URLs, long digit runs.
 *  2. Name list — tokens found in `redact_names` (≈200k first/last names across Indian, South-Asian, Arabic,
 *     Western and other backgrounds; common English words and site vocabulary removed).
 *     Guarded by a place-name allow-list (`redact_places`, e.g. "karol bagh", "gandhi nagar") and a
 *     place-suffix rule ("<Name> Nagar/Road/Colony…" is a place, not a person).
 *  3. Honorific rule — a capitalised token right after Mr/Mrs/Shri/Smt/Md/Dr/etc. is a name even if unlisted.
 *  4. Optional Workers AI pass (binding `AI`) — asks a model to list person names it sees; those spans are masked.
 *
 * Output uses the literal token "[name]" (and "[phone]", "[email]", "[id]", "[link]").
 */

const NAME = "[name]";

const HARD: Array<[RegExp, string]> = [
  [/https?:\/\/\S+|www\.\S+/gi, "[link]"],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]"],
  [/\b[\w.\-]{2,}@(?:upi|ybl|okaxis|okicici|oksbi|okhdfcbank|paytm|apl|ibl|axl|fbl|jio|airtel|kotak|sbi|icici|hdfc|ptyes|ptaxis)\b/gi, "[id]"],
  [/(?<!\d)(?:\+?91[\s-]?|0)?[6-9](?:[\s-]?\d){9}(?!\d)/g, "[phone]"],
  [/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "[id]"], // Aadhaar
  [/\b[A-Z]{5}\d{4}[A-Z]\b/g, "[id]"], // PAN
  [/\b[A-Z]{2}[\s-]?\d{1,2}[A-Z]?[\s-]?[A-Z]{1,3}[\s-]?\d{3,4}\b/g, "[id]"], // vehicle plate
  [/\b\d{7,}\b/g, "[id]"], // any other long number
];

const HONORIFICS = new Set(
  "mr mrs ms miss shri shree sri smt kumari dr prof md mohd mohammad muhammad syed sayyid janab hazrat sardar sardarni thiru thirumathi selvi sir madam ji".split(" "),
);
const PLACE_SUFFIX = new Set(
  "nagar nagr colony road rd marg chowk chauraha vihar puram pura pur palya halli park market bazaar bazar ganj gunj mandi layout enclave extension extn sector circle cross street lane gali mohalla basti chawl complex tower towers apartments apartment society heights garden gardens estate phase block village gaon gram taluk taluka tehsil district dist mandal town city".split(
    " ",
  ),
);
// Words we never mask regardless of any list (site + Hinglish vocabulary that collides with names).
const NEVER = new Set(
  "sahab saab sahib ji bhai bhaiya didi madam sir uncle aunty aunti babu beta beti bhabhi constable inspector clerk officer agent dalal tehsildar patwari peon sarpanch pradhan collector police station thana chowki counter office court hospital school college bank post seva sewa kendra suvidha jan india indian".split(
    " ",
  ),
);

type Tok = { text: string; start: number; end: number; lower: string; isWord: boolean };

function tokenize(s: string): Tok[] {
  const out: Tok[] = [];
  const re = /[A-Za-z][A-Za-z'’\-]*|\S/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    const text = m[0];
    out.push({ text, start: m.index, end: m.index + text.length, lower: text.toLowerCase().replace(/’/g, "'"), isWord: /^[A-Za-z]/.test(text) });
  }
  return out;
}

export type Redactor = {
  redact: (text: string) => Promise<string>;
};

export function makeRedactor(db: D1Database, ai?: Ai | null): Redactor {
  async function lookupNames(words: string[]): Promise<Set<string>> {
    const uniq = Array.from(new Set(words)).filter((w) => w.length >= 3);
    const found = new Set<string>();
    for (let i = 0; i < uniq.length; i += 90) {
      const chunk = uniq.slice(i, i + 90);
      const { results } = await db
        .prepare(`SELECT tok FROM redact_names WHERE tok IN (${chunk.map(() => "?").join(",")})`)
        .bind(...chunk)
        .all<{ tok: string }>();
      for (const r of results ?? []) found.add(r.tok);
    }
    return found;
  }
  async function lookupPlaces(phrases: string[]): Promise<Set<string>> {
    const uniq = Array.from(new Set(phrases));
    const found = new Set<string>();
    for (let i = 0; i < uniq.length; i += 90) {
      const chunk = uniq.slice(i, i + 90);
      const { results } = await db
        .prepare(`SELECT phrase FROM redact_places WHERE phrase IN (${chunk.map(() => "?").join(",")})`)
        .bind(...chunk)
        .all<{ phrase: string }>();
      for (const r of results ?? []) found.add(r.phrase);
    }
    return found;
  }

  async function aiNames(text: string): Promise<string[]> {
    if (!ai) return [];
    try {
      const res = (await ai.run("@cf/meta/llama-3.1-8b-instruct-fast" as never, {
        messages: [
          {
            role: "system",
            content:
              "You extract personal names from short complaint texts written in Indian English / Hinglish. " +
              "Return ONLY a JSON array of strings: every token or phrase that is the name or nickname of a specific person " +
              "(officials, agents, relatives, anyone). Do NOT include place names, department names, job titles, or common words. " +
              "If there are none, return [].",
          },
          { role: "user", content: text.slice(0, 2000) },
        ],
        max_tokens: 200,
      })) as { response?: string };
      const raw = res?.response ?? "";
      const m = raw.match(/\[[\s\S]*\]/);
      if (!m) return [];
      const arr = JSON.parse(m[0]);
      return Array.isArray(arr) ? arr.filter((x) => typeof x === "string" && x.trim().length >= 3).map((x) => x.trim()) : [];
    } catch {
      return [];
    }
  }

  return {
    async redact(input: string): Promise<string> {
      let text = input;
      for (const [re, rep] of HARD) text = text.replace(re, rep);

      const toks = tokenize(text);
      const words = toks.filter((t) => t.isWord);
      const [names, aiFound] = await Promise.all([lookupNames(words.map((w) => w.lower)), aiNames(text)]);

      // Bigrams / trigrams of word tokens for the place allow-list
      const wordIdx = toks.map((t, i) => (t.isWord ? i : -1)).filter((i) => i >= 0);
      const phraseAt: string[] = [];
      for (let k = 0; k < wordIdx.length; k++) {
        for (const n of [2, 3]) {
          const ids = wordIdx.slice(k, k + n);
          if (ids.length === n && ids[n - 1] - ids[0] === n - 1) phraseAt.push(ids.map((i) => toks[i].lower).join(" "));
        }
      }
      const places = await lookupPlaces(phraseAt);
      const protectedIdx = new Set<number>();
      for (let k = 0; k < wordIdx.length; k++) {
        for (const n of [2, 3]) {
          const ids = wordIdx.slice(k, k + n);
          if (ids.length !== n || ids[n - 1] - ids[0] !== n - 1) continue;
          const phrase = ids.map((i) => toks[i].lower).join(" ");
          if (places.has(phrase)) ids.forEach((i) => protectedIdx.add(i));
        }
        // "<X> Nagar" style — X is a place, not a person
        const i = wordIdx[k], j = wordIdx[k + 1];
        if (j === i + 1 && PLACE_SUFFIX.has(toks[j].lower)) protectedIdx.add(i);
      }

      const mask = new Set<number>();
      for (let k = 0; k < wordIdx.length; k++) {
        const i = wordIdx[k];
        const t = toks[i];
        if (protectedIdx.has(i) || NEVER.has(t.lower)) continue;
        const allCapsAcronym = t.text.length <= 4 && t.text === t.text.toUpperCase();
        if (names.has(t.lower) && !allCapsAcronym) {
          mask.add(i);
          continue;
        }
        // Honorific rule: "Mr Xyz", "Shri Xyz", "Md Xyz"
        const prev = k > 0 ? toks[wordIdx[k - 1]] : null;
        if (prev && wordIdx[k - 1] === i - 1 && HONORIFICS.has(prev.lower.replace(/\.$/, "")) && /^[A-Z]/.test(t.text) && t.text.length >= 3) {
          mask.add(i);
        }
      }
      // AI-found spans: mask each word of the span if it appears in the text
      for (const span of aiFound) {
        const spanToks = span.toLowerCase().split(/\s+/).filter(Boolean);
        for (let k = 0; k < wordIdx.length; k++) {
          const ids = wordIdx.slice(k, k + spanToks.length);
          if (ids.length !== spanToks.length) continue;
          if (ids.every((i, n) => toks[i].lower === spanToks[n]) && !ids.some((i) => protectedIdx.has(i) || NEVER.has(toks[i].lower))) {
            ids.forEach((i) => mask.add(i));
          }
        }
      }

      // Rebuild, collapsing runs of masked words into one [name]
      let out = "";
      let cursor = 0;
      let lastWasMask = false;
      for (const [i, t] of toks.entries()) {
        if (mask.has(i)) {
          const between = text.slice(cursor, t.start);
          if (lastWasMask && /^[\s.,'’-]*$/.test(between)) {
            // merge: keep a single space between merged names
            cursor = t.end;
            continue;
          }
          out += between + NAME;
          cursor = t.end;
          lastWasMask = true;
        } else {
          out += text.slice(cursor, t.end);
          cursor = t.end;
          lastWasMask = false;
        }
      }
      out += text.slice(cursor);
      return out;
    },
  };
}
