import { useState, useEffect, useCallback } from "react";

export interface VerseData {
  text: string;
  reference: string;
  loading: boolean;
  error: string | null;
}

const REFRESH_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours

// Curated list of meaningful verses (fallback + rotation)
const CURATED_VERSES: Array<{ text: string; reference: string }> = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", reference: "Jeremiah 29:11" },
  { text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.", reference: "Psalm 23:1-2" },
  { text: "Trust in the Lord with all your heart, and do not lean on your own understanding.", reference: "Proverbs 3:5" },
  { text: "I can do all things through him who strengthens me.", reference: "Philippians 4:13" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", reference: "Joshua 1:9" },
  { text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", reference: "Romans 8:28" },
  { text: "The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?", reference: "Psalm 27:1" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", reference: "Matthew 11:28" },
  { text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.", reference: "Philippians 4:6" },
  { text: "The grass withers and the flowers fall, but the word of our God endures forever.", reference: "Isaiah 40:8" },
  { text: "Create in me a pure heart, O God, and renew a steadfast spirit within me.", reference: "Psalm 51:10" },
  { text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", reference: "John 3:16" },
];

let lastVerseIndex = -1;

function getNextVerse(): { text: string; reference: string } {
  let idx = Math.floor(Math.random() * CURATED_VERSES.length);
  while (idx === lastVerseIndex && CURATED_VERSES.length > 1) {
    idx = Math.floor(Math.random() * CURATED_VERSES.length);
  }
  lastVerseIndex = idx;
  return CURATED_VERSES[idx];
}

export function useBibleVerse(): VerseData {
  const [data, setData] = useState<VerseData>({
    text: "",
    reference: "",
    loading: true,
    error: null,
  });

  const fetchVerse = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      // Try the free bible-api.com (random verse, no key needed)
      const randomRefs = ["jhn.3.16", "psa.23.1", "phi.4.13", "jer.29.11", "pro.3.5", "rom.8.28"];
      const ref = randomRefs[Math.floor(Math.random() * randomRefs.length)];
      const res = await fetch(`https://bible-api.com/${ref}?translation=kjv`);
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      if (json.text && json.reference) {
        setData({
          text: json.text.trim().replace(/\n/g, " "),
          reference: json.reference,
          loading: false,
          error: null,
        });
        return;
      }
      throw new Error("No data");
    } catch {
      // Fallback to curated local verses
      const verse = getNextVerse();
      setData({ ...verse, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchVerse();
    const id = setInterval(fetchVerse, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchVerse]);

  return data;
}
