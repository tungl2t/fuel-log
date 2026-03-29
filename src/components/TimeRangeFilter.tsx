import React, { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import Modal from './Modal';
import DatePicker from './DatePicker';
import { useLanguage } from '../context/LanguageContext';

// RangeType is now a 4-digit year string or 'custom'
export type RangeType = string; // e.g. '2024', '2025', '2026', 'custom'

interface TimeRangeFilterProps {
  rangeType: RangeType;
  startDate: string;
  endDate: string;
  onRangeTypeChange: (type: RangeType) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

// Generate last 2 years + current year
function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return [current - 2, current - 1, current];
}

const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  rangeType,
  startDate,
  endDate,
  onRangeTypeChange,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const yearOptions = getYearOptions();
  const today = new Date().toISOString().split('T')[0];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
    } catch { return dateStr; }
  };

  const customLabel =
    rangeType === 'custom' && startDate && endDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)}`
      : t('customRange');

  const handleTagClick = (type: RangeType) => {
    if (type === 'custom') {
      setTempStart(startDate || today);
      setTempEnd(endDate || today);
      setIsModalOpen(true);
    } else {
      onRangeTypeChange(type);
    }
  };

  const handleApplyCustom = () => {
    onStartDateChange(tempStart);
    onEndDateChange(tempEnd);
    onRangeTypeChange('custom');
    setIsModalOpen(false);
  };

  return (
    <div className="glass-panel fade-in" style={{ marginBottom: '2rem', padding: '1.125rem 1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.625rem' }}>
        {/* Label */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.8rem',
          textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
          marginRight: '0.25rem',
        }}>
          <CalendarDays size={15} />
          {t('filterTitle')}
        </div>

        {/* All tag */}
        <button
          className={`filter-tag ${rangeType === 'all' ? 'active' : ''}`}
          onClick={() => onRangeTypeChange('all')}
        >
          {t('allTime')}
        </button>

        {/* Year tags */}
        {yearOptions.map((year) => (
          <button
            key={year}
            className={`filter-tag ${rangeType === String(year) ? 'active' : ''}`}
            onClick={() => handleTagClick(String(year))}
          >
            {year}
          </button>
        ))}

        {/* Custom tag */}
        <button
          className={`filter-tag ${rangeType === 'custom' ? 'active' : ''}`}
          onClick={() => handleTagClick('custom')}
          style={{ maxWidth: rangeType === 'custom' ? '220px' : undefined, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {customLabel}
        </button>
      </div>

      {/* Custom range modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('selectCustomRange')}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="label">{t('startDate')}</label>
            <DatePicker
              value={tempStart}
              onChange={setTempStart}
              placeholder={t('pickStartDate')}
              max={tempEnd || today}
              required
            />
          </div>
          <div className="input-group">
            <label className="label">{t('endDate')}</label>
            <DatePicker
              value={tempEnd}
              onChange={setTempEnd}
              placeholder={t('pickEndDate')}
              min={tempStart}
              max={today}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleApplyCustom} disabled={!tempStart || !tempEnd}>
              {t('applyFilter')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimeRangeFilter;
