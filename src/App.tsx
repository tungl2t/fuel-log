import { useState, useEffect, useMemo } from 'react';
import { useFuelLog } from './hooks/useFuelLog';
import FuelLogForm from './components/FuelLogForm';
import FuelLogTable from './components/FuelLogTable';
import FuelLogDashboard from './components/FuelLogDashboard';
import Modal from './components/Modal';
import Auth from './components/Auth';
import TimeRangeFilter, { type RangeType } from './components/TimeRangeFilter';
import SettingsModal from './components/SettingsModal';
import { supabase } from './lib/supabase';
import { Droplets, LogOut, Settings, Menu, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { CalculatedEntry } from './hooks/useFuelLog';
import { LanguageProvider, useLanguage } from './context/LanguageContext';



// ─── Inner app (has access to LanguageContext) ───────────────────────────────
function AppInner({ session }: { session: Session }) {
  const { t, isFirstTime } = useLanguage();
  const [editingEntry, setEditingEntry] = useState<CalculatedEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [rangeType, setRangeType] = useState<RangeType>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle body scroll locking when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMobileMenuOpen]);

  // Open settings on first login or when user clicks settings button
  // isFirstTime drives the initial open; after that it's user-controlled
  const settingsOpen = isSettingsOpen || isFirstTime;

  // Derived date filter
  const dateFilter = useMemo(() => {
    if (rangeType === 'custom') {
      return {
        start: customStartDate ? new Date(customStartDate) : undefined,
        end: customEndDate ? new Date(customEndDate) : undefined,
      };
    }
    const year = parseInt(rangeType);
    if (!isNaN(year)) {
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31, 23, 59, 59),
      };
    }
    return undefined; // 'all'
  }, [rangeType, customStartDate, customEndDate]);

  const { entries, stats, loading, addEntry, updateEntry, deleteEntry, exportData, importData } =
    useFuelLog(session.user.id, dateFilter);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try { importData(JSON.parse(e.target?.result as string)); }
        catch (err) { alert('Invalid JSON file'); console.error(err); }
      };
      reader.readAsText(file);
    }
  };

  const handleAdd = async (data: { date: string; km: number; liters: number; pricePerLiter: number }) => {
    await addEntry(data);
    setIsModalOpen(false);
  };

  const handleUpdate = async (id: string, data: { date: string; km: number; liters: number; pricePerLiter: number }) => {
    await updateEntry(id, data);
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const handleEdit = (entry: CalculatedEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  return (
    <div className="container">
      <header className="actions fade-in">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ padding: '0.625rem', background: 'var(--accent-color)', borderRadius: '0.875rem', boxShadow: '0 4px 12px rgba(154,177,122,0.4)' }}>
            <Droplets size={28} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>
              Fuel <span style={{ color: 'var(--accent-color)' }}>Log</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Desktop actions: settings + sign out */}
        <div className="desktop-actions" style={{ gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '0.5rem 0.875rem', gap: '0.375rem', fontSize: '0.875rem' }}
            title={t('settings')}
          >
            <Settings size={17} />
            <span className="toolbar-btn-label">{t('settings')}</span>
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn btn-secondary"
            style={{ color: 'var(--danger-color)', padding: '0.5rem' }}
            title={t('signOut')}
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="mobile-actions">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="btn btn-secondary"
            style={{ padding: '0.5rem', borderRadius: '0.75rem', border: 'none', background: 'transparent' }}
          >
            <Menu size={28} />
          </button>
        </div>
      </header>

      <main style={{ marginTop: '1.75rem' }}>
        <TimeRangeFilter
          rangeType={rangeType}
          startDate={customStartDate}
          endDate={customEndDate}
          onRangeTypeChange={setRangeType}
          onStartDateChange={setCustomStartDate}
          onEndDateChange={setCustomEndDate}
        />

        {loading ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{t('loading')}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <FuelLogDashboard stats={stats} entries={entries} />
            <FuelLogTable
              entries={entries}
              onDelete={deleteEntry}
              onEdit={handleEdit}
              onAddClick={() => setIsModalOpen(true)}
              onImport={handleFileUpload}
              onExport={exportData}
            />
          </div>
        )}
      </main>

      {/* Add/Edit record modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEntry ? t('formEditTitle') : t('formAddTitle')}
      >
        <FuelLogForm
          key={editingEntry?.id ?? 'new'}
          onAdd={handleAdd}
          editEntry={editingEntry}
          onUpdate={handleUpdate}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Settings modal */}
      {settingsOpen && (
        <SettingsModal
          isOpen={true}
          isFirstTime={isFirstTime}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      <footer style={{ marginTop: '3rem', textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
        <p>&copy; {new Date().getFullYear()} Fuel Log Tracker.</p>
      </footer>

      {/* Mobile sidebar (rendered outside main content to avoid stacking context issues) */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="mobile-sidebar">
            <div className="mobile-sidebar-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--accent-color)', borderRadius: '0.625rem' }}>
                  <Droplets size={20} color="white" />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Fuel <span style={{ color: 'var(--accent-color)' }}>Log</span>
                </h2>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="modal-close-btn"
                style={{ background: 'rgba(0,0,0,0.05)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-sidebar-content">
              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-menu-item"
              >
                <Settings size={22} />
                <span>{t('settings')}</span>
              </button>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="mobile-menu-item"
                style={{ color: 'var(--danger-color)' }}
              >
                <LogOut size={22} />
                <span>{t('signOut')}</span>
              </button>
            </div>

            <div className="mobile-sidebar-footer">
              <p style={{ opacity: 0.7 }}>{t('appTagline')}</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>
                &copy; {new Date().getFullYear()} Fuel Log Tracker
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Root App — manages auth, wraps LanguageProvider with userId ─────────────
function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Auth />;

  return (
    <LanguageProvider userId={session.user.id}>
      <AppInner session={session} />
    </LanguageProvider>
  );
}

export default App;
