import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  required?: boolean;
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
];
const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function parseDate(str: string): Date | null {
  if (!str) return null;
  const parts = str.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

function formatDisplay(str: string, lang: string): string {
  const d = parseDate(str);
  if (!d) return '';
  return new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(d);
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder,
  min,
  max,
  required,
}) => {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const [viewOverride, setViewOverride] = useState<{ year: number; month: number } | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [isMobileMode, setIsMobileMode] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MONTHS = lang === 'vi' ? MONTHS_VI : MONTHS_EN;
  const DAY_LABELS = lang === 'vi' ? DAYS_VI : DAYS_EN;

  const baseDate = parseDate(value) || new Date();
  const viewYear = viewOverride?.year ?? baseDate.getFullYear();
  const viewMonth = viewOverride?.month ?? baseDate.getMonth();

  const handleOpen = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const isMobile = window.innerWidth <= 768;
    setIsMobileMode(isMobile);

    if (!isMobile && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const calHeight = 380;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top = spaceBelow > calHeight
        ? rect.bottom + 8
        : rect.top - calHeight - 8;

      setDropdownStyle({
        position: 'fixed',
        top,
        left: rect.left,
        width: Math.max(rect.width, 280),
        zIndex: 3000,
      });
    }
    setOpen(true);
    setYearPickerOpen(false);
  };

  // Close on outside click (desktop mode)
  useEffect(() => {
    if (!open || isMobileMode) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        const target = e.target as Node;
        // Check if click is inside the portal dropdown
        const portal = document.getElementById('datepicker-portal');
        if (portal && portal.contains(target)) return;
        setOpen(false);
        setYearPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isMobileMode]);

  const minDate = parseDate(min || '');
  const maxDate = parseDate(max || '');

  const isDisabled = useCallback((d: Date): boolean => {
    if (minDate && d < minDate) return true;
    if (maxDate && d > maxDate) return true;
    return false;
  }, [minDate, maxDate]);

  const selected = parseDate(value);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let n = 1; n <= daysInMonth; n++) cells.push(new Date(viewYear, viewMonth, n));

  const prevMonth = () => {
    const newMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    setViewOverride({ year: viewMonth === 0 ? viewYear - 1 : viewYear, month: newMonth });
  };
  const nextMonth = () => {
    const newMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    setViewOverride({ year: viewMonth === 11 ? viewYear + 1 : viewYear, month: newMonth });
  };
  const selectYear = (y: number) => {
    setViewOverride({ year: y, month: viewMonth });
    setYearPickerOpen(false);
  };
  const selectDay = (d: Date) => {
    if (!isDisabled(d)) {
      onChange(toYMD(d));
      setOpen(false);
      setYearPickerOpen(false);
      setViewOverride(null);
    }
  };
  const close = () => { setOpen(false); setYearPickerOpen(false); };

  const startYear = minDate?.getFullYear() ?? 2000;
  const endYear = maxDate?.getFullYear() ?? new Date().getFullYear() + 1;
  const yearRange: number[] = [];
  for (let y = endYear; y >= startYear; y--) yearRange.push(y);

  const calendarContent = (
    <div onClick={(e) => e.stopPropagation()}>
      {yearPickerOpen ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t('selectYear')}</span>
            <button type="button" onClick={() => setYearPickerOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.25rem', lineHeight: 1, padding: '0.25rem' }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.25rem', maxHeight: '200px', overflowY: 'auto' }}>
            {yearRange.map(y => (
              <button key={y} type="button" onClick={() => selectYear(y)}
                className={y === viewYear ? 'datepicker-year-btn active' : 'datepicker-year-btn'}
                style={{
                  padding: '0.4rem 0.25rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                  fontWeight: y === viewYear ? 700 : 400,
                  background: y === viewYear ? 'var(--accent-color)' : 'transparent',
                  color: y === viewYear ? 'white' : 'var(--text-primary)',
                  fontSize: '0.8rem', transition: 'background 0.15s', fontFamily: 'inherit',
                }}>
                {y}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
            <button type="button" onClick={prevMonth} className="datepicker-nav-btn"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => setYearPickerOpen(true)} className="datepicker-month-btn" style={{ flex: 1, fontFamily: 'inherit' }}>
              {MONTHS[viewMonth]} {viewYear}
            </button>
            <button type="button" onClick={nextMonth} className="datepicker-nav-btn"><ChevronRight size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAY_LABELS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0.2rem 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((cell, i) => {
              if (!cell) return <div key={`e-${i}`} />;
              const isToday = cell.getTime() === todayDate.getTime();
              const isSelected = !!selected && toYMD(cell) === value;
              const disabled = isDisabled(cell);
              return (
                <button key={i} type="button" disabled={disabled} onClick={() => selectDay(cell)}
                  className={isSelected ? 'datepicker-day selected' : isToday ? 'datepicker-day today' : 'datepicker-day'}
                  style={{ opacity: disabled ? 0.3 : 1, fontFamily: 'inherit' }}>
                  {cell.getDate()}
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.75rem', paddingTop: '0.5rem', textAlign: 'center' }}>
            <button type="button" onClick={() => !isDisabled(todayDate) && selectDay(todayDate)}
              className="datepicker-today-btn" style={{ fontFamily: 'inherit' }}>
              {t('today')}
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="input datepicker-trigger"
        style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textAlign: 'left', cursor: 'pointer', background: 'rgba(255,255,255,0.8)' }}
        aria-required={required}
      >
        <Calendar size={18} style={{ color: 'var(--accent-color)', flexShrink: 0 }} />
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, fontSize: '1rem' }}>
          {value ? formatDisplay(value, lang) : (placeholder ?? t('selectDate'))}
        </span>
      </button>

      {/* Desktop: fixed dropdown anchored to trigger */}
      {open && !isMobileMode && ReactDOM.createPortal(
        <div id="datepicker-portal" style={{ ...dropdownStyle, background: 'white', borderRadius: '1rem', boxShadow: '0 16px 48px rgba(0,0,0,0.18)', border: '1px solid var(--border-color)', padding: '0.75rem', animation: 'slideUp 0.2s ease forwards' }}>
          {calendarContent}
        </div>,
        document.body
      )}

      {/* Mobile: centered fixed overlay with backdrop */}
      {open && isMobileMode && ReactDOM.createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={close}
        >
          <div
            style={{ background: 'white', borderRadius: '1.25rem', padding: '1rem', width: '100%', maxWidth: '320px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'slideUp 0.25s ease forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile header with close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {t('selectDate')}
              </span>
              <button type="button" onClick={close} style={{ background: '#f1f2f6', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.15s' }}>
                <X size={16} />
              </button>
            </div>
            {calendarContent}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DatePicker;
