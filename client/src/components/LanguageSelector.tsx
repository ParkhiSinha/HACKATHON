import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

// Define available languages
const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)", flag: "🇮🇳" },
];

// This would connect to a proper translation system in production
const LanguageSelector = () => {
  const [currentLang, setCurrentLang] = useState("en");

  const handleLanguageChange = (lang: string) => {
    setCurrentLang(lang);
    // In a real implementation, we would set the language in a context or global state
    // And we would use something like i18next to handle translations
    localStorage.setItem("preferredLanguage", lang);
  };

  return (
    <div className="language-selector flex items-center">
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[160px] bg-transparent border-none">
          <div className="flex items-center">
            <Languages className="mr-2 h-4 w-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center">
                <span className="mr-2">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Mobile-friendly version
export const LanguageSelectorMobile = () => {
  const [currentLang, setCurrentLang] = useState("en");

  const toggleLanguage = () => {
    const langs = languages.map(l => l.code);
    const currentIndex = langs.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % langs.length;
    const nextLang = langs[nextIndex];
    
    setCurrentLang(nextLang);
    localStorage.setItem("preferredLanguage", nextLang);
  }

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={toggleLanguage}
      className="px-2"
    >
      <span className="mr-1">{currentLanguage?.flag}</span>
      <span className="sr-only">{currentLanguage?.name}</span>
    </Button>
  );
};

export default LanguageSelector;