/**
 * SPRACHEN-DATENBANK
 * 
 * Liste aller 50 unterstützten Sprachen mit Flaggen
 */

export interface Language {
  code: string;      // z.B. 'de', 'en'
  name: string;      // Deutscher Name
  nativeName: string; // Name in der Sprache selbst
  flag: string;      // Emoji-Flagge
}

export const LANGUAGES: Language[] = [
  { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'Englisch', nativeName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Mandarin-Chinesisch', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanisch', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabisch (MSA)', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Französisch', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'tr', name: 'Türkisch', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Russisch', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'am', name: 'Amharisch', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'az', name: 'Aserbaidschanisch', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'bn', name: 'Bengalisch', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'my', name: 'Burmese (Myanmar)', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Cebuano', flag: '🇵🇭' },
  { code: 'cs', name: 'Tschechisch', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'nl', name: 'Niederländisch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'fil', name: 'Filipino/Tagalog', nativeName: 'Filipino', flag: '🇵🇭' },
  { code: 'el', name: 'Griechisch', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'he', name: 'Hebräisch', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
  { code: 'id', name: 'Indonesisch', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'it', name: 'Italienisch', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: 'Japanisch', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'jv', name: 'Javanisch', nativeName: 'Basa Jawa', flag: '🇮🇩' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ko', name: 'Koreanisch', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ms', name: 'Malaiisch', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'ne', name: 'Nepalesisch', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'fa', name: 'Persisch (Farsi/Dari)', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'pl', name: 'Polnisch', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ro', name: 'Rumänisch', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'sr', name: 'Serbo-Kroatisch', nativeName: 'Srpski/Hrvatski', flag: '🇷🇸' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
  { code: 'th', name: 'Thailändisch', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'uk', name: 'Ukrainisch', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'vi', name: 'Vietnamesisch', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'pt', name: 'Portugiesisch', nativeName: 'Português', flag: '🇵🇹' },
];

// Standard-Sprache
export const DEFAULT_LANGUAGE = 'de';

// Sprache anhand des Codes finden
export function getLanguageByCode(code: string): Language | undefined {
  return LANGUAGES.find(lang => lang.code === code);
}

// Sprachen durchsuchen
export function searchLanguages(query: string): Language[] {
  const lowerQuery = query.toLowerCase();
  return LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(lowerQuery) ||
    lang.nativeName.toLowerCase().includes(lowerQuery) ||
    lang.code.toLowerCase().includes(lowerQuery)
  );
}
