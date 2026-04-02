import { useState, useEffect, useCallback } from "react";

export interface FactData {
  text: string;
  category: string;
  loading: boolean;
  error: string | null;
}

const REFRESH_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours

// Rich curated facts about history, philosophy, and religion
const CURATED_FACTS: Array<{ text: string; category: string }> = [
  { text: "The Library of Alexandria was not destroyed in a single catastrophic event. It declined gradually over centuries as funding was cut and scholars moved to other cities.", category: "History" },
  { text: "Socrates never wrote anything down. Everything we know about his philosophy comes from the writings of his students, primarily Plato.", category: "Philosophy" },
  { text: "The Dead Sea Scrolls, discovered in 1947, contain the oldest known manuscripts of the Hebrew Bible, dating back over 2,000 years.", category: "Religion" },
  { text: "The ancient Stoic philosopher Epictetus was born into slavery. His philosophy of focusing only on what we can control emerged directly from his personal experience of powerlessness.", category: "Philosophy" },
  { text: "The Great Wall of China was not built all at once — it was constructed over centuries by multiple dynasties and the sections are not always connected.", category: "History" },
  { text: "Buddhism spread across Asia not through war but through trade routes. Merchants carried Buddhist texts along the Silk Road, making it one of history's most peaceful religious expansions.", category: "Religion" },
  { text: "The word 'philosophy' comes from the Greek words 'philo' (love) and 'sophia' (wisdom). Pythagoras is credited with coining the term, calling himself a 'lover of wisdom.'", category: "Philosophy" },
  { text: "Cleopatra VII lived closer in time to the Moon landing than to the construction of the Great Pyramid of Giza.", category: "History" },
  { text: "The Talmud, a central text of Jewish law, took over 300 years to compile, with contributions from thousands of rabbis across Babylonia and the Land of Israel.", category: "Religion" },
  { text: "Marcus Aurelius, Roman Emperor and Stoic philosopher, wrote his 'Meditations' as a private journal, never intending it to be published. It was discovered after his death.", category: "Philosophy" },
  { text: "The printing press, invented by Gutenberg around 1440, made the Bible the first mass-produced book in European history, fundamentally changing how religion spread.", category: "History" },
  { text: "The concept of zero as a number was developed in India by the mathematician Brahmagupta around 628 CE — before it was known in Europe.", category: "History" },
  { text: "Aristotle believed that happiness (eudaimonia) was not a feeling but an activity — the ongoing practice of living virtuously and fulfilling one's potential.", category: "Philosophy" },
  { text: "Islam spread to Southeast Asia primarily through Muslim traders, not conquest — making Indonesia, now the world's largest Muslim-majority country, a product of commerce and cultural exchange.", category: "Religion" },
  { text: "The Roman Empire did not 'fall' in 476 CE — the Eastern Roman Empire (Byzantium) continued for nearly 1,000 more years until 1453 CE.", category: "History" },
  { text: "Plato's 'Allegory of the Cave' suggests that most humans perceive only shadows of reality, and that philosophical education is the process of turning toward the light of truth.", category: "Philosophy" },
  { text: "The Zoroastrian religion, founded in ancient Persia, may be the world's first monotheistic religion and directly influenced Judaism, Christianity, and Islam.", category: "Religion" },
  { text: "The word 'assassin' comes from the Arabic 'Hashshashin,' a medieval Ismaili Muslim sect whose enemies claimed they used hashish before carrying out killings.", category: "History" },
];

let lastFactIndex = -1;

function getNextFact(): { text: string; category: string } {
  let idx = Math.floor(Math.random() * CURATED_FACTS.length);
  while (idx === lastFactIndex && CURATED_FACTS.length > 1) {
    idx = Math.floor(Math.random() * CURATED_FACTS.length);
  }
  lastFactIndex = idx;
  return CURATED_FACTS[idx];
}

export function useRandomFact(): FactData {
  const [data, setData] = useState<FactData>({
    text: "",
    category: "",
    loading: true,
    error: null,
  });

  const fetchFact = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      // Try uselessfacts.jsph.pl (free, no key)
      const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      if (json.text) {
        // Only use API fact if it seems interesting enough
        if (json.text.length > 40) {
          setData({ text: json.text, category: "Curiosity", loading: false, error: null });
          return;
        }
      }
      throw new Error("Fact too short");
    } catch {
      const fact = getNextFact();
      setData({ ...fact, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchFact();
    const id = setInterval(fetchFact, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchFact]);

  return data;
}
