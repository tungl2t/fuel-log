import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n';
import { supabase } from '../lib/supabase';

// ─── Unit types ──────────────────────────────────────────────────────────────
export type VolumeUnit = 'liter' | 'gallon';
export type DistanceUnit = 'km' | 'mile';
export type CurrencyUnit = 'vnd' | 'usd' | 'eur';

export interface AppSettings {
  lang: Language;
  volume: VolumeUnit;
  distance: DistanceUnit;
  currency: CurrencyUnit;
}

// Default settings for new users
const DEFAULT_SETTINGS: AppSettings = {
  lang: 'en',
  volume: 'gallon',
  distance: 'mile',
  currency: 'usd',
};


const CURRENCY_SYMBOLS: Record<CurrencyUnit, string> = {
  vnd: 'đ',
  usd: '$',
  eur: '€',
};

// ─── Context interface ───────────────────────────────────────────────────────
export interface AppContextType {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  lang: Language;
  t: (key: TranslationKey) => string;

  // Loading / first-time state
  settingsLoaded: boolean;
  isFirstTime: boolean;

  // Formatters (inputs always in stored units: km, liters, raw currency)
  fmtDistance: (km: number, dec?: number) => string;
  fmtVolume: (liters: number, dec?: number) => string;
  fmtCurrency: (amount: number, dec?: number) => string;
  fmtConsumption: (lPer100km: number | null) => string;
  fmtCostPer100: (costPer100km: number | null) => string;
  fmtPricePerUnit: (pricePerLiter: number) => string;
  fmtTotal: (amount: number) => string;

  // Dynamic labels for column headers & form fields
  distanceLabel: string;
  volumeLabel: string;
  consumptionLabel: string;
  costPer100Label: string;
  pricePerUnitLabel: string;
  currencySymbol: string;
}

const LanguageContext = createContext<AppContextType>({} as AppContextType);

// ─── Provider ────────────────────────────────────────────────────────────────
interface LanguageProviderProps {
  children: React.ReactNode;
  userId?: string; // Supabase user id for cloud persistence
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, userId }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // ── Load settings from Supabase when user logs in ────────────────────────
  // When userId is absent (logged out), reset is handled by re-initialisation
  // of provider via key prop in App.tsx. So the effect only runs for actual users.
  useEffect(() => {
    if (!userId) return;

    supabase
      .from('user_settings')
      .select('lang, currency, distance, volume')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings({
            lang: (data.lang as Language) || DEFAULT_SETTINGS.lang,
            currency: (data.currency as CurrencyUnit) || DEFAULT_SETTINGS.currency,
            distance: (data.distance as DistanceUnit) || DEFAULT_SETTINGS.distance,
            volume: (data.volume as VolumeUnit) || DEFAULT_SETTINGS.volume,
          });
          setIsFirstTime(false);
        } else {
          // First time — seed defaults into Supabase so next login doesn't repeat this
          supabase.from('user_settings').insert({
            user_id: userId,
            lang: DEFAULT_SETTINGS.lang,
            currency: DEFAULT_SETTINGS.currency,
            distance: DEFAULT_SETTINGS.distance,
            volume: DEFAULT_SETTINGS.volume,
          }).then();
          setSettings(DEFAULT_SETTINGS);
          setIsFirstTime(true);
        }
        setSettingsLoaded(true);
      });
  }, [userId]);

  // ── Save settings to Supabase ────────────────────────────────────────────
  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };

      if (userId) {
        supabase.from('user_settings').upsert({
          user_id: userId,
          lang: next.lang,
          currency: next.currency,
          distance: next.distance,
          volume: next.volume,
          updated_at: new Date().toISOString(),
        }).then();
      }

      return next;
    });
    // Once they interact with settings, no longer "first time"
    setIsFirstTime(false);
  }, [userId]);

  const t = useCallback((key: TranslationKey): string => {
    return translations[settings.lang][key] ?? translations.en[key];
  }, [settings.lang]);

  // ── Derived formatting values (memoised) ─────────────────────────────────
  const value = useMemo((): AppContextType => {
    const { volume, distance, currency, lang } = settings;
    const sym = CURRENCY_SYMBOLS[currency];
    const isPrefix = currency !== 'vnd';

    const fmtNum = (n: number, dec: number): string =>
      new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec,
      }).format(n);

    const fmtCurrency = (amount: number, dec?: number): string => {
      const d = dec ?? (currency === 'vnd' ? 0 : 2);
      return isPrefix ? `${sym}${fmtNum(amount, d)}` : `${fmtNum(amount, d)} ${sym}`;
    };

    const fmtDistance = (km: number, dec?: number): string =>
      fmtNum(km, dec ?? 0);

    const fmtVolume = (liters: number, dec?: number): string =>
      fmtNum(liters, dec ?? 3);

    const fmtConsumption = (lPer100km: number | null): string => {
      if (lPer100km == null || lPer100km === 0) return '-';
      return fmtNum(lPer100km, 3);
    };

    const fmtCostPer100 = (costPer100km: number | null): string => {
      if (costPer100km == null) return '-';
      return fmtCurrency(costPer100km);
    };

    const fmtPricePerUnit = (pricePerLiter: number): string => {
      return fmtCurrency(pricePerLiter);
    };

    const fmtTotal = (amount: number): string => fmtCurrency(amount);

    const distanceLabel = distance === 'mile' ? 'mi' : 'km';
    const volumeLabel = volume === 'gallon' ? 'gal' : 'L';
    const consumptionLabel =
      volume === 'gallon' && distance === 'mile'
        ? 'MPG'
        : `${volumeLabel}/100${distanceLabel}`;
    const costPer100Label = `${sym}/100${distanceLabel}`;
    const pricePerUnitLabel = `${sym}/${volumeLabel}`;

    return {
      settings,
      updateSettings,
      lang,
      t,
      settingsLoaded,
      isFirstTime,
      fmtDistance,
      fmtVolume,
      fmtCurrency,
      fmtConsumption,
      fmtCostPer100,
      fmtPricePerUnit,
      fmtTotal,
      distanceLabel,
      volumeLabel,
      consumptionLabel,
      costPer100Label,
      pricePerUnitLabel,
      currencySymbol: sym,
    };
  }, [settings, updateSettings, t, settingsLoaded, isFirstTime]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
