

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// hien thi footer chung voi link dieu huong va form nhan tin.
export default function Footer() {
  const { t } = useTranslation();

  return (
      <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined text-3xl font-bold">school</span>
                <h2 className="text-xl font-extrabold tracking-tight">EduLearn</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                {t('footer.description')}
              </p>
              <div className="flex gap-4">
                <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-sm">social_leaderboard</span>
                </a>
                <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-sm">link</span>
                </a>
                <a className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-all" href="#">
                  <span className="material-symbols-outlined text-sm">alternate_email</span>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">{t('footer.aboutTitle')}</h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link className="hover:text-primary" to="/coming-soon">
                    {t('footer.about')}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" to="/teachers">
                    {t('footer.teachers')}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" to="/coming-soon">
                    {t('footer.careers')}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" to="/coming-soon">
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">{t('footer.exploreTitle')}</h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li>
                  <Link className="hover:text-primary" to="/courses">
                    {t('footer.newCourses')}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" to="/coming-soon">
                    {t('footer.freeCourses')}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" to="/coming-soon">
                    {t('footer.certificates')}
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-primary" to="/coming-soon">
                    {t('footer.blog')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">{t('footer.newsletterTitle')}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                {t('footer.newsletterDescription')}
              </p>
              <form className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border-slate-200 bg-slate-50 py-2 text-sm focus:ring-primary dark:border-slate-800 dark:bg-slate-900"
                  placeholder={t('footer.emailPlaceholder')}
                  type="email"
                />
                <button className="rounded-lg bg-primary px-4 py-2 font-bold text-white">{t('footer.send')}</button>
              </form>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>{t('footer.rights')}</p>
            <div className="flex gap-6">
              <Link className="hover:text-primary" to="/coming-soon">
                {t('footer.terms')}
              </Link>
              <Link className="hover:text-primary" to="/coming-soon">
                {t('footer.privacy')}
              </Link>
              <Link className="hover:text-primary" to="/coming-soon">
                {t('footer.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </footer>
  );
}
