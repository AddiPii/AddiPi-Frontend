import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useStore();

  const toggleLanguage = () => {
    const newLang = language === 'pl' ? 'en' : 'pl';
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
      title="Zmień język / Change language"
      aria-label="Change language"
    >
      <Languages size={18} className="text-foreground" />
      <span className="font-medium text-sm uppercase text-foreground">
        {language}
      </span>
    </button>
  );
}
