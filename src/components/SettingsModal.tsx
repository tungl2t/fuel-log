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

// ─── Chip selector row ────────────────────────────────────────────────────────
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

  // Fully remounts on each open (App.tsx conditionally renders this),
  // so `draft` always initialises from the latest loaded settings.
  const [draft, setDraft] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const isDirty = (Object.keys(draft) as (keyof AppSettings)[]).some(
    (k) => draft[k] !== settings[k]
  );

  const patch = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    updateSettings(draft);
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
        {/* Header — same as Modal.tsx */}
        <div className="modal-header">
          <h2 className="card-title" style={{ marginBottom: 0 }}>
            {isFirstTime ? '👋 ' : ''}{t('settingsTitle')}
          </h2>
          <button onClick={onClose} className="modal-close-btn" title={t('close')}>
            <X size={20} />
          </button>
        </div>

        {/* Body — same scrollable container as Modal.tsx modal-body */}
        <div className="modal-body">

          {/* First-time welcome banner */}
          {isFirstTime && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'rgba(154,177,122,0.12)',
              border: '1.5px solid rgba(154,177,122,0.35)',
              borderRadius: '0.875rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginBottom: '0.5rem',
            }}>
              Welcome! Set your preferred units and language. You can change these any time from the Settings button.
            </div>
          )}

          {/* Language */}
          <SectionLabel icon={<Globe size={13} />}>{t('language')}</SectionLabel>
          <OptionChip options={langOptions} selected={draft.lang} onSelect={(v) => patch('lang', v)} />

          <div style={{ height: '1px', background: 'var(--border-color)', margin: '1.25rem 0 0' }} />
          <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-secondary)', marginTop: '1.25rem' }}>
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

          {/* ── CTA buttons — inline, same style as FuelLogForm ── */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              {t('close')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!isDirty}
              style={{
                flex: 2,
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
