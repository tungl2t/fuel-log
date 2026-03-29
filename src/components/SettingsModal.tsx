import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Globe, Ruler, Droplets, DollarSign, Check, Save } from 'lucide-react';
import { useLanguage, type VolumeUnit, type DistanceUnit, type CurrencyUnit, type AppSettings } from '../context/LanguageContext';
import type { Language } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

// ─── Generic option type ──────────────────────────────────────────────────────
interface Option<T extends string> {
  value: T;
  label: string;
  sub: string;
  badge: string;
}

// ─── Chip row ─────────────────────────────────────────────────────────────────
function OptionChip<T extends string>({
  options,
  selected,
  onSelect,
}: {
  options: Option<T>[];
  selected: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.875rem',
              borderRadius: '0.875rem',
              border: active ? '2px solid var(--accent-color)' : '1.5px solid var(--border-color)',
              background: active ? 'rgba(154,177,122,0.1)' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
              flex: '1 1 auto',
            }}
          >
            <span style={{
              fontSize: '0.75rem', fontWeight: 700,
              background: active ? 'var(--accent-color)' : 'var(--border-color)',
              color: active ? 'white' : 'var(--text-secondary)',
              borderRadius: '0.4rem', padding: '0.1rem 0.4rem',
              minWidth: '2rem', textAlign: 'center', transition: 'all 0.15s',
            }}>
              {opt.badge}
            </span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: active ? 'var(--accent-color)' : 'var(--text-primary)', transition: 'color 0.15s' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.05rem' }}>
                {opt.sub}
              </div>
            </div>
            {active && <Check size={13} color="var(--accent-color)" strokeWidth={3} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.07em', color: 'var(--text-secondary)',
      marginBottom: '0.625rem', marginTop: '1.1rem',
    }}>
      {icon}{children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, isFirstTime = false }) => {
  const { settings, updateSettings, t } = useLanguage();

  // Component fully remounts when opened (conditionally rendered in App.tsx),
  // so `draft` natively initialises with the most up-to-date Supabase settings.
  const [draft, setDraft] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  // Dirty check — has anything changed compared to saved settings?
  const isDirty = (Object.keys(draft) as (keyof AppSettings)[]).some(
    (k) => draft[k] !== settings[k]
  );

  const patch = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateSettings(draft); // saves state + upserts to Supabase
    onClose();
  };

  // ── Option lists ──────────────────────────────────────────────────────────
  const langOptions: Option<Language>[] = [
    { value: 'en', label: 'English',    sub: 'English',    badge: '🇺🇸' },
    { value: 'vi', label: 'Tiếng Việt', sub: 'Vietnamese', badge: '🇻🇳' },
  ];
  const volumeOptions: Option<VolumeUnit>[] = [
    { value: 'liter',  label: t('unitLiter'),  sub: 'Metric',   badge: 'L'   },
    { value: 'gallon', label: t('unitGallon'), sub: 'Imperial', badge: 'gal' },
  ];
  const distanceOptions: Option<DistanceUnit>[] = [
    { value: 'km',   label: t('unitKm'),   sub: 'Metric',   badge: 'km' },
    { value: 'mile', label: t('unitMile'), sub: 'Imperial', badge: 'mi' },
  ];
  const currencyOptions: Option<CurrencyUnit>[] = [
    { value: 'vnd', label: t('unitVND'), sub: 'Vietnamese Đồng', badge: 'đ' },
    { value: 'usd', label: t('unitUSD'), sub: 'US Dollar',       badge: '$' },
    { value: 'eur', label: t('unitEUR'), sub: 'Euro',            badge: '€' },
  ];

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content settings-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideUp 0.3s ease forwards' }}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="card-title" style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            {isFirstTime ? '👋 ' : ''}{t('settingsTitle')}
          </h2>
          <button onClick={onClose} className="modal-close-btn" title={t('close')}>
            <X size={20} />
          </button>
        </div>

        {/* First-time welcome banner */}
        {isFirstTime && (
          <div style={{
            margin: '0 1.5rem',
            padding: '0.875rem 1rem',
            background: 'rgba(154,177,122,0.12)',
            border: '1.5px solid rgba(154,177,122,0.35)',
            borderRadius: '0.875rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            Welcome! Set your preferred units and language below. You can change these any time.
          </div>
        )}

        {/* Body */}
        <div className="modal-body" style={{ padding: '0.5rem 1.5rem 0', flex: 1 }}>

          {/* Language */}
          <SectionLabel icon={<Globe size={13} />}>{t('language')}</SectionLabel>
          <OptionChip options={langOptions} selected={draft.lang} onSelect={(v) => patch('lang', v)} />

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '1.1rem 0 0' }} />
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginTop: '1.1rem' }}>
            {t('units')}
          </div>

          {/* Volume */}
          <SectionLabel icon={<Droplets size={13} />}>{t('volumeUnit')}</SectionLabel>
          <OptionChip options={volumeOptions} selected={draft.volume} onSelect={(v) => patch('volume', v)} />

          {/* Distance */}
          <SectionLabel icon={<Ruler size={13} />}>{t('distanceUnit')}</SectionLabel>
          <OptionChip options={distanceOptions} selected={draft.distance} onSelect={(v) => patch('distance', v)} />

          {/* Currency */}
          <SectionLabel icon={<DollarSign size={13} />}>{t('currencyUnit')}</SectionLabel>
          <OptionChip options={currencyOptions} selected={draft.currency} onSelect={(v) => patch('currency', v)} />
        </div>

        {/* Footer — Save button */}
        <div style={{
          padding: '1.25rem 1.5rem calc(2rem + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          borderTop: `1px solid ${isDirty ? 'rgba(154,177,122,0.3)' : 'var(--border-color)'}`,
          marginTop: '0',
          transition: 'border-color 0.2s',
          backgroundColor: 'white',
        }}>
          {isDirty && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>
              Unsaved changes
            </span>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
            <button className="btn btn-secondary" onClick={onClose} style={{ minWidth: '80px' }}>
              {t('close')}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!isDirty}
              style={{
                minWidth: '140px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: isDirty ? 1 : 0.45,
                cursor: isDirty ? 'pointer' : 'not-allowed',
                transition: 'opacity 0.2s',
              }}
            >
              <Save size={16} />
              {t('saveSettings')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;
