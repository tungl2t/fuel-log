import React, { useState } from 'react';
import type { FuelEntry } from '../hooks/useFuelLog';
import DatePicker from './DatePicker';
import { Fuel, Navigation, Droplets, BadgeDollarSign } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FuelLogFormProps {
  onAdd: (entry: { date: string; km: number; liters: number; pricePerLiter: number }) => void;
  editEntry?: FuelEntry | null;
  onUpdate?: (id: string, entry: { date: string; km: number; liters: number; pricePerLiter: number }) => void;
  onCancel?: () => void;
}

const FuelLogForm: React.FC<FuelLogFormProps> = ({ onAdd, editEntry, onUpdate, onCancel }) => {
  const { t, distanceLabel, volumeLabel, fmtCurrency, settings } = useLanguage();

  const [formData, setFormData] = useState(() => ({
    date: editEntry?.date ?? new Date().toISOString().split('T')[0],
    km: editEntry?.km.toString() ?? '',
    liters: editEntry?.liters.toString() ?? '',
    pricePerLiter: editEntry?.pricePerLiter.toString() ?? '',
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.km || !formData.liters || !formData.pricePerLiter) return;

    const entryData = {
      date: formData.date,
      km: parseFloat(formData.km),
      liters: parseFloat(formData.liters),
      pricePerLiter: parseFloat(formData.pricePerLiter),
    };

    if (editEntry && onUpdate) {
      onUpdate(editEntry.id, entryData);
    } else {
      onAdd(entryData);
      setFormData(prev => ({ ...prev, km: '', liters: '', pricePerLiter: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalCost =
    formData.liters && formData.pricePerLiter
      ? parseFloat(formData.liters) * parseFloat(formData.pricePerLiter)
      : null;

  return (
    <form onSubmit={handleSubmit} className="fade-in">
      {/* Date */}
      <div className="input-group">
        <label className="label">{t('fieldDate')}</label>
        <DatePicker
          value={formData.date}
          onChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
          max={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      {/* Km + Liters in 2-col grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="input-group">
        <label className="label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Navigation size={13} />{t('fieldKm')} ({distanceLabel})
          </span>
        </label>
        <input type="number" name="km" value={formData.km} onChange={handleChange}
          placeholder={distanceLabel === 'mi' ? 'e.g. 90200' : 'e.g. 145061'} className="input" step="0.1" required />
      </div>
      <div className="input-group" style={{ marginBottom: 0 }}>
        <label className="label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Droplets size={13} />{t('fieldLiters')} ({volumeLabel})
          </span>
        </label>
        <input type="number" name="liters" value={formData.liters} onChange={handleChange}
          placeholder={volumeLabel === 'gal' ? 'e.g. 11.9' : 'e.g. 45.109'} className="input" step="0.001" required />
      </div>
      </div>

      <div className="input-group" style={{ marginTop: '1.25rem' }}>
        <label className="label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <BadgeDollarSign size={13} />{t('fieldPrice')} ({settings.currency.toUpperCase()}/{volumeLabel})
          </span>
        </label>
        <input type="number" name="pricePerLiter" value={formData.pricePerLiter} onChange={handleChange}
          placeholder={settings.currency === 'vnd' ? 'e.g. 18850' : 'e.g. 1.25'} className="input" step="10" required />
      </div>

      {/* Live cost preview */}
      {totalCost !== null && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.625rem 1rem',
          background: 'rgba(154, 177, 122, 0.1)',
          border: '1px solid rgba(154, 177, 122, 0.3)',
          borderRadius: '0.75rem', marginBottom: '0.5rem', fontSize: '0.875rem',
        }}>
          <Fuel size={16} style={{ color: 'var(--accent-color)' }} />
          <span style={{ color: 'var(--text-secondary)' }}>{t('estTotal')}</span>
          <strong style={{ marginLeft: 'auto', color: 'var(--accent-color)' }}>
            {totalCost !== null ? fmtCurrency(totalCost) : ''}
          </strong>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1 }}>
            {t('cancel')}
          </button>
        )}
        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
          {editEntry ? t('updateRecordBtn') : t('addRecordBtn')}
        </button>
      </div>
    </form>
  );
};

export default FuelLogForm;
