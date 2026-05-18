import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { buttonClass, selectClass } from '@ops-forward/keel';
import { Upload } from 'lucide-react';
import { api } from '../api';
import { APPLICATION_STATUSES } from '../types';

interface Props {
  onClose: () => void;
  onImported: (count: number) => void;
}

const APP_FIELDS = [
  { key: 'company',    label: 'Company',       required: true },
  { key: 'role',       label: 'Role / Title',   required: false },
  { key: 'location',   label: 'Location',       required: false },
  { key: 'work_mode',  label: 'Work mode',      required: false },
  { key: 'size',       label: 'Company size',   required: false },
  { key: 'industry',   label: 'Industry',       required: false },
  { key: 'status',     label: 'Status',         required: false },
  { key: 'applied_at', label: 'Applied date',   required: false },
  { key: 'notes',      label: 'Notes',          required: false },
] as const;

type FieldKey = (typeof APP_FIELDS)[number]['key'];

const AUTO_DETECT: Record<FieldKey, string[]> = {
  company:    ['company', 'company name', 'organization', 'employer', 'org'],
  role:       ['role', 'title', 'job title', 'position', 'job'],
  location:   ['location', 'city', 'office', 'loc'],
  work_mode:  ['work mode', 'workmode', 'remote', 'mode', 'hybrid', 'type'],
  size:       ['size', 'company size', 'employees', 'headcount'],
  industry:   ['industry', 'sector', 'vertical'],
  status:     ['status', 'stage', 'state'],
  applied_at: ['applied', 'applied at', 'date applied', 'application date', 'date', 'applied date'],
  notes:      ['notes', 'note', 'comments', 'comment', 'description'],
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuote) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') { inQuote = false; }
      else { cell += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\n') {
        row.push(cell); cell = '';
        if (row.some(c => c.trim())) rows.push(row);
        row = [];
      } else if (ch !== '\r') { cell += ch; }
    }
  }
  row.push(cell);
  if (row.some(c => c.trim())) rows.push(row);
  return rows;
}

function autoDetect(headers: string[]): Record<FieldKey, string> {
  const mapping: Record<string, string> = {};
  for (const field of APP_FIELDS) {
    const synonyms = AUTO_DETECT[field.key];
    const match = headers.find(h => synonyms.includes(h.toLowerCase().trim()));
    mapping[field.key] = match ?? '';
  }
  return mapping as Record<FieldKey, string>;
}

function coerceStatus(val: string): string {
  const normalized = val.trim().toLowerCase();
  const match = APPLICATION_STATUSES.find(s => s.toLowerCase() === normalized);
  return match ?? 'Applied';
}

function coerceDate(val: string): string | undefined {
  if (!val.trim()) return undefined;
  const d = new Date(val.trim());
  if (isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

export function CsvImportModal({ onClose, onImported }: Props) {
  const [step, setStep] = useState<'upload' | 'map'>('upload');
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<FieldKey, string>>({} as Record<FieldKey, string>);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCsv(text);
      if (rows.length < 2) { setError('CSV must have a header row and at least one data row.'); return; }
      const hdrs = rows[0].map(h => h.trim());
      setHeaders(hdrs);
      setDataRows(rows.slice(1));
      setMapping(autoDetect(hdrs));
      setError(null);
      setStep('map');
    };
    reader.readAsText(file);
  };

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadFile(file);
  };

  const setField = (key: FieldKey, col: string) =>
    setMapping(prev => ({ ...prev, [key]: col }));

  const doImport = async () => {
    const companyCol = mapping.company;
    if (!companyCol) { setError('Map the Company column to continue.'); return; }

    const rows = dataRows.map(row => {
      const obj: Record<string, unknown> = {};
      for (const field of APP_FIELDS) {
        const col = mapping[field.key];
        if (!col) continue;
        const idx = headers.indexOf(col);
        if (idx < 0) continue;
        const raw = row[idx]?.trim() ?? '';
        if (!raw) continue;
        if (field.key === 'status') obj[field.key] = coerceStatus(raw);
        else if (field.key === 'applied_at') { const d = coerceDate(raw); if (d) obj[field.key] = d; }
        else obj[field.key] = raw;
      }
      return obj;
    }).filter(r => r.company);

    if (rows.length === 0) { setError('No valid rows found — ensure Company column is mapped correctly.'); return; }

    setImporting(true);
    setError(null);
    try {
      const { imported } = await api.importApplications(rows);
      onImported(imported);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const preview = dataRows.slice(0, 3);

  return (
    <div className="rung-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rung-modal" style={{ maxWidth: 640 }}>
        <h2>Import from CSV</h2>

        {step === 'upload' && (
          <div>
            <div
              className={`rung-csv-drop${dragging ? ' drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={28} />
              <p>Drop a CSV file here or <strong>click to browse</strong></p>
              <p style={{ fontSize: 13, color: 'var(--rung-text-muted)', margin: 0 }}>
                First row must be column headers. Max 500 rows.
              </p>
              <input ref={fileRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={onFileInput} />
            </div>
            {error && <p style={{ color: '#C0392B', margin: '8px 0 0', fontSize: 13 }}>{error}</p>}
            <div className="rung-modal-actions">
              <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}

        {step === 'map' && (
          <div>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--rung-text-muted)' }}>
              Match your CSV columns to Rung fields. {dataRows.length} rows detected.
            </p>

            <table className="rung-csv-map-table">
              <thead>
                <tr>
                  <th>Rung field</th>
                  <th>Your CSV column</th>
                  <th>Sample value</th>
                </tr>
              </thead>
              <tbody>
                {APP_FIELDS.map(field => {
                  const col = mapping[field.key];
                  const idx = col ? headers.indexOf(col) : -1;
                  const sample = idx >= 0 ? (preview[0]?.[idx] ?? '') : '';
                  return (
                    <tr key={field.key}>
                      <td>
                        {field.label}
                        {field.required && <span style={{ color: '#C0392B' }}> *</span>}
                      </td>
                      <td>
                        <select
                          className={selectClass?.() ?? 'rung-select'}
                          value={col}
                          onChange={e => setField(field.key, e.target.value)}
                        >
                          <option value="">— skip —</option>
                          {headers.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </td>
                      <td style={{ color: 'var(--rung-text-muted)', fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sample || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {error && <p style={{ color: '#C0392B', margin: '8px 0 0', fontSize: 13 }}>{error}</p>}

            <div className="rung-modal-actions">
              <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={() => setStep('upload')}>Back</button>
              <button type="button" className={buttonClass({ variant: 'ghost' })} onClick={onClose}>Cancel</button>
              <button
                type="button"
                className={buttonClass({ variant: 'primary' })}
                onClick={doImport}
                disabled={importing || !mapping.company}
              >
                {importing ? 'Importing…' : `Import ${dataRows.length} rows`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
