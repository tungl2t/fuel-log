import React, { useState } from 'react';
import type { CalculatedEntry } from '../hooks/useFuelLog';
import { Trash2, Edit2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PlusCircle, Upload, Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FuelLogTableProps {
  entries: CalculatedEntry[];
  onDelete: (id: string) => void;
  onEdit: (entry: CalculatedEntry) => void;
  onAddClick: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
}

const FuelLogTable: React.FC<FuelLogTableProps> = ({ 
  entries, 
  onDelete, 
  onEdit, 
  onAddClick, 
  onImport, 
  onExport 
}) => {
  const { t, fmtDistance, fmtVolume, fmtCurrency, fmtConsumption, fmtCostPer100, fmtPricePerUnit, distanceLabel, volumeLabel, consumptionLabel, costPer100Label, lang } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fmtDate = (dateStr: string) =>
    new Intl.DateTimeFormat(lang === 'vi' ? 'vi-VN' : 'en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    }).format(new Date(dateStr));

  // Pagination Logic
  const totalPages = Math.ceil(entries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = entries.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    const targetPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(targetPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="glass-panel fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="table-header-row" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="card-title" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>{t('recentLogs')}</h2>
        
        <div className="table-toolbar">
          <button 
            onClick={onAddClick} 
            className="btn btn-primary"
            style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
          >
            <PlusCircle size={18} />
            <span>{t('addRecord')}</span>
          </button>
          
          <label className="btn btn-secondary" style={{ cursor: 'pointer', padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
            <Upload size={18} />
            <span className="toolbar-btn-label">{t('import')}</span>
            <input type="file" accept=".json" onChange={onImport} style={{ display: 'none' }} />
          </label>
          <button onClick={onExport} className="btn btn-secondary" style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}>
            <Download size={18} />
            <span className="toolbar-btn-label">{t('export')}</span>
          </button>

          <div className="toolbar-divider" style={{ height: '24px', width: '1px', background: 'var(--border-color)', margin: '0 0.25rem' }} />

          <div className="pagination-group toolbar-pagesize">
            <span className="label" style={{ marginBottom: 0, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{t('show')}</span>
            <select 
              className="pagination-select" 
              value={itemsPerPage} 
              onChange={handlePageSizeChange}
              style={{ padding: '0.4rem 2rem 0.4rem 0.75rem' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="table-container">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>{t('colDate')}</th>
              <th>{t('colKm')}</th>
              <th>{t('colLiters')} ({volumeLabel})</th>
              <th>{t('colPriceL')}</th>
              <th>{t('colTotal')}</th>
              <th>{t('colDistance')} ({distanceLabel})</th>
              <th>{t('colL100')} ({consumptionLabel})</th>
              <th>{t('colCost100')} ({costPer100Label})</th>
              <th style={{ textAlign: 'right' }}>{t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                  {t('noRecords')}
                </td>
              </tr>
            ) : (
              paginatedEntries.map((entry) => (
                <tr key={entry.id}>
                  <td data-label={t('colDate')}>{fmtDate(entry.date)}</td>
                  <td data-label={t('colKm')}>{fmtDistance(entry.km)}</td>
                  <td data-label={t('colLiters')}>{fmtVolume(entry.liters)}</td>
                  <td data-label={t('colPriceL')}>{fmtPricePerUnit(entry.pricePerLiter)}</td>
                  <td data-label={t('colTotal')}>{fmtCurrency(entry.totalCost)}</td>
                  <td data-label={t('colDistance')}>{entry.distance ? fmtDistance(entry.distance) : '-'}</td>
                  <td data-label={t('colL100')} style={{ color: entry.consumption ? 'var(--accent-color)' : 'inherit', fontWeight: 600 }}>
                    {fmtConsumption(entry.consumption ?? null)}
                  </td>
                  <td data-label={t('colCost100')}>{fmtCostPer100(entry.pricePer100km ?? null)}</td>
                  <td style={{ textAlign: 'right' }} className="actions-cell">
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => onEdit(entry)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', color: 'var(--accent-color)' }}
                        title="Edit Entry"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(entry.id)}
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem', color: 'var(--danger-color)' }}
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-group">
            <button 
              onClick={() => goToPage(1)} 
              disabled={currentPage === 1}
              className="pagination-btn"
              title="First Page"
            >
              <ChevronsLeft size={18} />
            </button>
            <button 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-btn"
              title="Previous"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
          
          <div className="pagination-info">
            <div className="pagination-group">
              {t('page')}
              <select 
                className="pagination-select"
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {t('of')} <strong>{totalPages}</strong>
              <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }} className="record-count">
                ({entries.length} {t('records')})
              </span>
            </div>
          </div>

          <div className="pagination-group">
            <button 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Next"
            >
              <ChevronRight size={18} />
            </button>
            <button 
              onClick={() => goToPage(totalPages)} 
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Last Page"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuelLogTable;
