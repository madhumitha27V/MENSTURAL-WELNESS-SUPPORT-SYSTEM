import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UiContext';
import api, { getApiErrorMessage, getAuthConfig } from '../lib/api';

const initialForm = {
  start_date: '',
  end_date: '',
  flow_intensity: 'medium',
  notes: '',
  symptoms: '',
  energy_level: 'steady',
};

const flowLabels = {
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

const formatDate = (date) => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const getIsoDateString = (date) => {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

const CycleTracker = () => {
  const { token } = useAuth();
  const { notify } = useUI();
  const [form, setForm] = useState(initialForm);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState([null, null]);

  const fetchCycles = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get('/cycle/all', getAuthConfig(token));
      setCycles(res.data || []);
    } catch (error) {
      console.error(error);
      notify(getApiErrorMessage(error, 'Unable to load cycle history right now.'), 'warning');
    } finally {
      setLoading(false);
    }
  }, [notify, token]);

  useEffect(() => {
    fetchCycles();
  }, [fetchCycles]);

  const updateField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const setRangeFromCalendar = (value) => {
    const [start, end] = Array.isArray(value) ? value : [value, value];
    setDateRange([start, end]);
    setForm((currentForm) => ({
      ...currentForm,
      start_date: formatDate(start),
      end_date: end ? formatDate(end) : '',
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setDateRange([null, null]);
    setStep(1);
    setConfirmOpen(false);
  };

  const handleCommit = async () => {
    setSaving(true);

    try {
      await api.post('/cycle/log', form, getAuthConfig(token));
      notify('Cycle logged successfully.', 'success');
      resetForm();
      await fetchCycles();
    } catch (error) {
      notify(getApiErrorMessage(error, 'Error logging cycle.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const loggedStartDates = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());

    return new Set(
      cycles
        .map((cycle) => {
          if (!cycle.start_date) return '';
          const parsed = new Date(`${String(cycle.start_date).slice(0, 10)}T00:00:00Z`);
          if (Number.isNaN(parsed.getTime())) return '';
          if (parsed < sixMonthsAgo) return '';
          return getIsoDateString(parsed);
        })
        .filter(Boolean)
    );
  }, [cycles]);

  const filteredCycles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return cycles.filter((cycle) => {
      const matchesFilter = filter === 'all' || cycle.flow_intensity === filter;
      const haystack = `${cycle.start_date || ''} ${cycle.end_date || ''} ${cycle.notes || ''}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      return matchesFilter && matchesQuery;
    });
  }, [cycles, filter, search]);

  const completion = Math.round((step / 3) * 100);

  const stepTitles = [
    'Date range',
    'Flow and notes',
    'Review and submit',
  ];

  const canContinue =
    (step === 1 && form.start_date) ||
    (step === 2 && form.flow_intensity) ||
    step === 3;

  return (
    <div className="page">
      <section className="page__hero">
        <div className="hero-copy">
          <div className="eyebrow">Cycle intelligence</div>
          <h1 className="hero-title">Track your cycle with enterprise-grade clarity.</h1>
          <p className="hero-subtitle">
            Structured logging, a guided three-step flow, and a history view designed to make recurring patterns easier to interpret.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => setStep(1)}>
              Start logging flow
            </button>
            <button type="button" className="btn btn--secondary" onClick={fetchCycles}>
              Refresh history
            </button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__content">
            <div className="hero-art__metric">
              <span className="helper-text">Log completion</span>
              <strong>{completion}%</strong>
            </div>
            <div className="hero-art__metric">
              <span className="helper-text">Saved entries</span>
              <strong>{cycles.length}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">New cycle log</h2>
            <p className="section-card__subtitle">A guided, multi-step form with a confirmation checkpoint before submission.</p>
          </div>
          <div className="pill pill--ghost">Step {step} of 3</div>
        </div>

        <div className="progress" aria-hidden="true">
          <div className="progress__fill" style={{ width: `${completion}%` }} />
        </div>

        <div className="stepper" aria-label="Cycle logging steps">
          {stepTitles.map((title, index) => (
            <div key={title} className={`stepper__step${step === index + 1 ? ' stepper__step--active' : ''}`}>
              {index + 1}. {title}
            </div>
          ))}
        </div>

        <div className="form-grid">
          {step === 1 && (
            <div className="calendar-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="field">
                <label className="field__label" htmlFor="calendar">Cycle range</label>
                <Calendar
                  id="calendar"
                  className="cycle-calendar"
                  selectRange
                  value={dateRange}
                  onChange={setRangeFromCalendar}
                  minDetail="month"
                  maxDetail="month"
                  prevLabel="‹"
                  nextLabel="›"
                  tileClassName={({ date, view }) => {
                    if (view !== 'month') return null;

                    const iso = getIsoDateString(new Date(date));
                    if (dateRange[0]) {
                      const start = new Date(dateRange[0]).setHours(0, 0, 0, 0);
                      const current = new Date(date).setHours(0, 0, 0, 0);
                      if (current === start) return 'calendar__tile--selected-start';
                    }

                    if (loggedStartDates.has(iso)) {
                      return 'calendar__tile--logged-start';
                    }

                    return null;
                  }}
                />
                <p className="field__hint">Tap the calendar to select your cycle start and end dates.</p>
              </div>
              <div className="calendar-summary">
                <div className="summary-card">
                  <span>Selected start</span>
                  <strong>{form.start_date || 'Choose a date'}</strong>
                </div>
                <div className="summary-card">
                  <span>Selected end</span>
                  <strong>{form.end_date || 'Ongoing'}</strong>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <>
              <div className="field">
                <label className="field__label" htmlFor="flow_intensity">Flow intensity</label>
                <select id="flow_intensity" className="select" value={form.flow_intensity} onChange={(event) => updateField('flow_intensity', event.target.value)}>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </select>
              </div>
              <div className="field">
                <label className="field__label" htmlFor="energy_level">Energy level</label>
                <select id="energy_level" className="select" value={form.energy_level} onChange={(event) => updateField('energy_level', event.target.value)}>
                  <option value="steady">Steady</option>
                  <option value="low">Low</option>
                  <option value="fragile">Fragile</option>
                  <option value="strong">Strong</option>
                </select>
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="notes">Notes</label>
                <textarea id="notes" className="textarea" rows="4" placeholder="Any patterns, triggers, or contextual notes?" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: '1 / -1' }}>
                <label className="field__label" htmlFor="symptoms">Symptoms during this cycle</label>
                <textarea id="symptoms" className="textarea" rows="3" placeholder="Cramps, fatigue, headaches, bloating..." value={form.symptoms} onChange={(event) => updateField('symptoms', event.target.value)} />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="mini-panel" style={{ gridColumn: '1 / -1' }}>
              <h3 className="quick-card__title">Review your entry</h3>
              <p className="quick-card__copy">
                <strong>Start:</strong> {form.start_date || 'Not set'}<br />
                <strong>End:</strong> {form.end_date || 'Ongoing'}<br />
                <strong>Flow:</strong> {flowLabels[form.flow_intensity]}<br />
                <strong>Energy:</strong> {form.energy_level}<br />
                <strong>Notes:</strong> {form.notes || 'No notes added'}<br />
                <strong>Symptoms:</strong> {form.symptoms || 'None added'}
              </p>
            </div>
          )}
        </div>

        <div className="hero-actions">
          <button type="button" className="btn btn--ghost" onClick={() => setStep((currentStep) => Math.max(1, currentStep - 1))} disabled={step === 1}>
            Back
          </button>
          {step < 3 ? (
            <button type="button" className="btn btn--primary" disabled={!canContinue} onClick={() => setStep((currentStep) => Math.min(3, currentStep + 1))}>
              Continue
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={() => setConfirmOpen(true)}>
              Review & submit
            </button>
          )}
        </div>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Cycle history</h2>
            <p className="section-card__subtitle">Search, filter, and review the latest entries at a glance.</p>
          </div>
        </div>

        <div className="control-bar">
          <input className="search-input" type="search" placeholder="Search start dates, notes, or symptoms..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="select" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All flow levels</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="heavy">Heavy</option>
          </select>
          <button type="button" className="btn btn--secondary" onClick={() => { setSearch(''); setFilter('all'); }}>
            Clear filters
          </button>
        </div>

        {loading ? (
          <div className="section-grid">
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
          </div>
        ) : filteredCycles.length > 0 ? (
          <div className="chip-grid">
            {filteredCycles.map((cycle) => (
              <article key={cycle.id} className="log-card">
                <div className="auth-meta">
                  <div>
                    <h3 className="log-card__title">{cycle.start_date?.split('T')[0] || 'Unknown start'}</h3>
                    <div className="log-card__meta">
                      End: {cycle.end_date?.split('T')[0] || 'Ongoing'} · Flow: {flowLabels[cycle.flow_intensity] || cycle.flow_intensity || 'Not specified'}
                    </div>
                  </div>
                  <span className="pill pill--active">{cycle.flow_intensity}</span>
                </div>
                <p className="quick-card__copy">{cycle.notes || 'No notes captured for this cycle.'}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">◎</div>
            <strong>No cycles logged yet</strong>
            <p className="empty-state__copy">Use the form above to log your first cycle and unlock predictions.</p>
          </div>
        )}
      </section>

      {confirmOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setConfirmOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="cycle-confirm-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2 id="cycle-confirm-title" className="section-card__title">Confirm cycle log</h2>
                <p className="section-card__subtitle">This is the final checkpoint before the record is saved.</p>
              </div>
              <button type="button" className="icon-button icon-button--ghost" onClick={() => setConfirmOpen(false)} aria-label="Close confirmation dialog">×</button>
            </div>

            <div className="mini-panel">
              <p className="quick-card__copy">
                <strong>Start:</strong> {form.start_date || 'Not set'}<br />
                <strong>End:</strong> {form.end_date || 'Ongoing'}<br />
                <strong>Flow:</strong> {flowLabels[form.flow_intensity]}<br />
                <strong>Energy:</strong> {form.energy_level}
              </p>
            </div>

            <div className="hero-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn--primary" disabled={saving} onClick={handleCommit}>
                {saving ? 'Saving...' : 'Confirm & save'}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default CycleTracker;