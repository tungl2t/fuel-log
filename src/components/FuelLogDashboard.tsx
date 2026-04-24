import React from 'react';
import type { Stats, CalculatedEntry } from '../hooks/useFuelLog';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Gauge, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FuelLogDashboardProps {
  stats: Stats;
  entries: CalculatedEntry[];
}

const FuelLogDashboard: React.FC<FuelLogDashboardProps> = ({ stats, entries }) => {
  const { t, fmtDistance, fmtConsumption, fmtTotal, fmtCostPer100, fmtPricePerUnit, fmtCurrency, distanceLabel, consumptionLabel, costPer100Label, lang } = useLanguage();

  const fmtDate = (dateStr: string) =>
    new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }).format(new Date(dateStr));

  const chartData = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(entry => ({
      date: new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      price: entry.pricePerLiter,
    }));

  // ── Record mini-card ──────────────────────────────────────────────────────
  const RecordCard = ({
    label,
    value,
    date,
    icon,
    color,
  }: {
    label: string;
    value: string;
    date: string | null;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      padding: '0.875rem 1rem',
      background: 'rgba(255,255,255,0.04)',
      borderRadius: '0.875rem',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color, marginBottom: '0.1rem' }}>
        {icon}
        <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {date ? value : '—'}
      </div>
      {date && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
          {t('statAt')} {fmtDate(date)}
        </div>
      )}
    </div>
  );

  return (
    <div className="fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="stats-grid">
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <TrendingUp size={24} color="var(--accent-color)" />
          </div>
          <div className="stat-value">{fmtDistance(stats.totalKm)}</div>
          <div className="stat-label">{t('totalKilometers')} ({distanceLabel})</div>
        </div>
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <BarChart3 size={24} color="#10b981" />
          </div>
          <div className="stat-value">{fmtConsumption(stats.avgConsumption)}</div>
          <div className="stat-label">{t('avgConsumption')} ({consumptionLabel})</div>
        </div>
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <DollarSign size={24} color="#f59e0b" />
          </div>
          <div className="stat-value">{fmtTotal(stats.totalSpent)}</div>
          <div className="stat-label">{t('totalSpending')}</div>
        </div>
        <div className="glass-panel stat-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
            <Gauge size={24} color="var(--accent-color)" />
          </div>
          <div className="stat-value">{fmtCostPer100(stats.avgPricePer100km)}</div>
          <div className="stat-label">{t('avgCostPer100km')} ({costPer100Label})</div>
        </div>
      </div>

      {/* ── Records panel ── */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title" style={{ marginBottom: '1rem' }}>
          <TrendingUp size={20} color="var(--accent-color)" />
          Records
        </h2>
        <div className="records-grid">
          <RecordCard
            label={t('longestDistance')}
            value={stats.longestDistance ? fmtDistance(stats.longestDistance.value) + ' ' + distanceLabel : '—'}
            date={stats.longestDistance?.date ?? null}
            icon={<ArrowUp size={14} />}
            color="var(--accent-color)"
          />
          <RecordCard
            label={t('shortestDistance')}
            value={stats.shortestDistance ? fmtDistance(stats.shortestDistance.value) + ' ' + distanceLabel : '—'}
            date={stats.shortestDistance?.date ?? null}
            icon={<ArrowDown size={14} />}
            color="#10b981"
          />
          <RecordCard
            label={t('highestPrice')}
            value={stats.highestPrice ? fmtCurrency(stats.highestPrice.value) : '—'}
            date={stats.highestPrice?.date ?? null}
            icon={<ArrowUp size={14} />}
            color="#ef4444"
          />
          <RecordCard
            label={t('lowestPrice')}
            value={stats.lowestPrice ? fmtCurrency(stats.lowestPrice.value) : '—'}
            date={stats.lowestPrice?.date ?? null}
            icon={<ArrowDown size={14} />}
            color="#f59e0b"
          />
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <h2 className="card-title">
          <TrendingUp size={20} color="var(--accent-color)" />
          {t('fuelPriceTrend')}
        </h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(v) => {
                  const val = v / 1000;
                  return new Intl.NumberFormat(lang === 'vi' ? 'vi-VN' : 'en-US', {
                    maximumFractionDigits: 0
                  }).format(val) + 'k';
                }} 
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(15,15,20,0.95)', borderColor: 'var(--border-color)', borderRadius: '0.75rem', color: 'white' }}
                itemStyle={{ color: 'var(--accent-color)' }}
                formatter={(v) => [typeof v === 'number' ? fmtPricePerUnit(v) : v, 'Price']}
              />
              <Area type="monotone" dataKey="price" stroke="var(--accent-color)" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default FuelLogDashboard;

