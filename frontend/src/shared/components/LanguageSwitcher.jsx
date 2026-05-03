import React, { useContext } from 'react';
import { GlobalState } from '../../app/providers/GlobalState';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
    const state = useContext(GlobalState);
    const [language, changeLanguage] = state?.language || ['en', () => {}];
    const { t } = useTranslation();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1.5 rounded-md font-medium text-sm transition-colors ${
                    language === 'en'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
                title="English"
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage('vi')}
                className={`px-3 py-1.5 rounded-md font-medium text-sm transition-colors ${
                    language === 'vi'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
                title="Tiếng Việt"
            >
                VI
            </button>
        </div>
    );
}

export default LanguageSwitcher;
