import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UiContext';
import api, { getApiErrorMessage, getAuthConfig } from '../lib/api';
import confetti from 'canvas-confetti';

ChartJS.register(BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip);

const moodEmoji = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  angry: '😠',
  calm: '😌',
  tired: '😴',
};

const initialForm = {
  date: '',
  mood: 'happy',
  pain_level: 1,
  symptoms: '',
  water_intake: '',
  sleep_hours: '',
};

const commonSymptomTags = ['Cramps', 'Bloating', 'Headache', 'Nausea', 'Fatigue', 'Backache', 'Stomach pain', 'Breast tenderness'];

const formatDate = (value) => {
  const text = String(value || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return '—';
  return new Date(`${text}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

const toDateInputValue = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

const Symptoms = () => {
  const { token } = useAuth();
  const { notify } = useUI();
  const [form, setForm] = useState(initialForm);
  const [symptomsList, setSymptomsList] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [moodFilter, setMoodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const authConfig = getAuthConfig(token);
      const [symptomRes, analyticsRes] = await Promise.all([
        api.get('/symptoms/all', authConfig),
        api.get('/symptoms/analytics', authConfig),
      ]);
      setSymptomsList(symptomRes.data || []);
      setAnalytics(analyticsRes.data || []);
    } catch (error) {
      console.error(error);
      notify(getApiErrorMessage(error, 'Unable to load symptom data right now.'), 'warning');
    } finally {
      setLoading(false);
    }
  }, [notify, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---- Live validation ----
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const formErrors = useMemo(() => {
    const errors = {};
    if (form.date && form.date > todayStr) errors.date = 'Date is in the future.';
    if (form.water_intake !== '' && (Number(form.water_intake) < 0 || Number(form.water_intake) > 10)) {
      errors.water_intake = 'Enter a value between 0 and 10 litres.';
    }
    if (form.sleep_hours !== '' && (Number(form.sleep_hours) < 0 || Number(form.sleep_hours) > 24)) {
      errors.sleep_hours = 'Enter a value between 0 and 24 hours.';
    }
    if (!form.date) errors.dateRequired = 'Date is required.';
    return errors;
  }, [form, todayStr]);

  const isFormValid = !formErrors.date && !formErrors.water_intake && !formErrors.sleep_hours && !formErrors.dateRequired;

  const formCompletion = useMemo(() => {
    const fields = ['date', 'mood', 'pain_level', 'symptoms', 'water_intake', 'sleep_hours'];
    const filled = fields.filter((key) => form[key] !== '' && form[key] !== null && form[key] !== undefined).length;
    return Math.round((filled / fields.length) * 100);
  }, [form]);

  const painFace = (level) => {
    const n = Number(level);
    if (n <= 2) return '😌';
    if (n <= 4) return '🙂';
    if (n <= 6) return '😖';
    if (n <= 8) return '😣';
    return '😫';
  };

  const resetFormState = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const scrollToForm = () => {
    document.getElementById('symptom-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEdit = (item) => {
    setForm({
      date: toDateInputValue(item.date),
      mood: item.mood || 'happy',
      pain_level: item.pain_level || 1,
      symptoms: item.symptoms || '',
      water_intake: item.water_intake ?? '',
      sleep_hours: item.sleep_hours ?? '',
    });
    setEditingId(item.id);
    scrollToForm();
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete the check-in from ${formatDate(item.date)}? This can't be undone.`);
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await api.delete(`/symptoms/${item.id}`, getAuthConfig(token));
      notify('Check-in deleted.', 'success');
      if (editingId === item.id) resetFormState();
      await fetchData();
    } catch (error) {
      notify(getApiErrorMessage(error, 'Unable to delete this entry right now.'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid) {
      notify('Please fix the highlighted fields before saving.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const authConfig = getAuthConfig(token);
      if (editingId) {
        await api.put(`/symptoms/${editingId}`, form, authConfig);
        notify('Check-in updated successfully.', 'success');
      } else {
        await api.post('/symptoms/log', form, authConfig);
        notify('Symptoms logged successfully.', 'success');
        confetti({
          particleCount: 80,
          spread: 60,
          colors: ['#5b6cff', '#ec4899', '#8b5cf6'],
          origin: { y: 0.7 },
        });
      }
      resetFormState();
      await fetchData();
    } catch (error) {
      notify(getApiErrorMessage(error, editingId ? 'Error updating check-in.' : 'Error logging symptoms.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSymptomTag = (tag) => {
    setForm((prev) => {
      const current = prev.symptoms ? prev.symptoms.split(',').map((s) => s.trim()).filter(Boolean) : [];
      const exists = current.some((s) => s.toLowerCase() === tag.toLowerCase());
      const next = exists ? current.filter((s) => s.toLowerCase() !== tag.toLowerCase()) : [...current, tag];
      return { ...prev, symptoms: next.join(', ') };
    });
  };

  const isTagActive = (tag) => {
    const current = form.symptoms ? form.symptoms.split(',').map((s) => s.trim().toLowerCase()) : [];
    return current.includes(tag.toLowerCase());
  };

  const summaryCards = useMemo(() => {
    const averagePain = symptomsList.length
      ? symptomsList.reduce((sum, item) => sum + Number(item.pain_level || 0), 0) / symptomsList.length
      : 0;
    return [
      { label: 'Entries', value: symptomsList.length, note: 'Wellness check-ins across your timeline.' },
      { label: 'Avg. pain', value: symptomsList.length ? averagePain.toFixed(1) : '0.0', note: 'A quick signal of monthly comfort.' },
      { label: 'Mood buckets', value: analytics.length, note: 'Distinct moods captured in the current data set.' },
    ];
  }, [analytics.length, symptomsList]);

  const filteredSymptoms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...symptomsList]
      .filter((item) => {
        const matchesMood = moodFilter === 'all' || item.mood === moodFilter;
        const haystack = `${item.date || ''} ${item.mood || ''} ${item.symptoms || ''}`.toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        return matchesMood && matchesQuery;
      })
      .sort((left, right) => {
        if (sortBy === 'pain') return Number(right.pain_level || 0) - Number(left.pain_level || 0);
        return new Date(right.date || 0) - new Date(left.date || 0);
      });
  }, [moodFilter, search, sortBy, symptomsList]);

  // ---- Chart data with click-to-filter support ----
  const moodChartData = useMemo(() => ({
    labels: analytics.map((item) => item.mood),
    datasets: [{
      label: 'Mood count',
      data: analytics.map((item) => item.mood_count),
      backgroundColor: analytics.map((item) => (moodFilter === item.mood ? '#3546e0' : '#5b6cff')),
      hoverBackgroundColor: '#3546e0',
      borderRadius: 16,
    }],
  }), [analytics, moodFilter]);

  const painChartData = useMemo(() => {
    const recent = symptomsList.slice(0, 6).reverse();
    return {
      labels: recent.map((item) => formatDate(item.date)),
      datasets: [{
        label: 'Pain level',
        data: recent.map((item) => Number(item.pain_level || 0)),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.16)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#ec4899',
      }],
    };
  }, [symptomsList]);

  const moodChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event, elements) => {
      if (event?.native?.target) {
        event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
      }
    },
    onClick: (_event, elements) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const clickedMood = analytics[index]?.mood;
      if (!clickedMood) return;
      setMoodFilter((prev) => (prev === clickedMood ? 'all' : clickedMood));
      document.getElementById('recent-logs')?.scrollIntoView({ behavior: 'smooth' });
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.parsed.y} entr${context.parsed.y === 1 ? 'y' : 'ies'} (click to filter)`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#7b879f' } },
      y: { grid: { color: 'rgba(123, 135, 159, 0.16)' }, ticks: { color: '#7b879f', precision: 0 } },
    },
  };

  const painChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event, elements) => {
      if (event?.native?.target) {
        event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
      }
    },
    onClick: (_event, elements) => {
      if (!elements.length) return;
      const index = elements[0].index;
      const recent = symptomsList.slice(0, 6).reverse();
      const clickedItem = recent[index];
      if (!clickedItem) return;
      setSearch(formatDate(clickedItem.date));
      document.getElementById('recent-logs')?.scrollIntoView({ behavior: 'smooth' });
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `Pain ${context.parsed.y}/10 (click to find this entry)`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#7b879f' } },
      y: { grid: { color: 'rgba(123, 135, 159, 0.16)' }, ticks: { color: '#7b879f', precision: 0 } },
    },
  };

  const nutritionTips = [
    {
      emoji: '🩸',
      phase: 'Menstrual Phase (Days 1-5)',
      tip: 'Eat iron-rich foods like spinach, lentils, and red meat to replenish blood loss. Dark chocolate and ginger tea help reduce cramps naturally. Rest as much as possible and avoid intense workouts.',
      color: '#ef4444',
    },
    {
      emoji: '🌱',
      phase: 'Follicular Phase (Days 6-13)',
      tip: 'Focus on light proteins like eggs and legumes to support rising estrogen. Fermented foods like yogurt boost gut health. Great time for strength training and high energy workouts.',
      color: '#8b5cf6',
    },
    {
      emoji: '✨',
      phase: 'Ovulation Phase (Days 14-16)',
      tip: 'Antioxidant-rich foods like berries, nuts, and seeds support egg health. Stay hydrated with coconut water and fresh juices. Peak energy phase — great for HIIT and social activities.',
      color: '#ec4899',
    },
    {
      emoji: '🌙',
      phase: 'Luteal Phase (Days 17-28)',
      tip: 'Complex carbs like sweet potato and oats stabilise mood swings. Magnesium-rich foods like bananas and avocado reduce bloating and PMS. Gentle yoga and journaling work best this phase.',
      color: '#f59e0b',
    },
  ];

  return (
    <div className="page">
      <style>{`
        @keyframes swuiFadeInUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-section {
          animation: swuiFadeInUp 0.5s ease both;
        }
        .interactive-card {
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }
        .interactive-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.09);
        }
        .btn-interactive {
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
        }
        .btn-interactive:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.04);
        }
        .btn-interactive:active:not(:disabled) {
          transform: translateY(0) scale(0.97);
        }
        .mood-select-btn {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .mood-select-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 18px rgba(91, 108, 255, 0.18);
        }
        .mood-select-btn.is-active {
          transform: scale(1.1);
        }
        .tag-chip-hover {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .tag-chip-hover:hover {
          transform: scale(1.06);
          box-shadow: 0 4px 10px rgba(91, 108, 255, 0.15);
        }
        .progress-fill-animated {
          transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pain-range-input {
          transition: filter 0.15s ease;
        }
        .pain-range-input:hover {
          filter: brightness(1.05);
        }
      `}</style>

      <section className="page__hero fade-in-section" style={{ animationDelay: '0s' }}>
        <div className="hero-copy">
          <div className="eyebrow">Symptom analytics</div>
          <h1 className="hero-title">A calm, data-rich workspace for daily wellbeing logs.</h1>
          <p className="hero-subtitle">
            Log pain, sleep, hydration, and mood in one place, then review the trends in a dashboard that feels more like an executive product than a simple form.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn--primary btn-interactive" onClick={scrollToForm}>
              Add a check-in
            </button>
            <button type="button" className="btn btn--secondary btn-interactive" onClick={fetchData}>
              Refresh analytics
            </button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__content">
            <div className="hero-art__metric">
              <span className="helper-text">Most recent mood</span>
              <strong>{symptomsList[0] ? moodEmoji[symptomsList[0].mood] || '•' : 'No data'}</strong>
            </div>
            <div className="hero-art__metric">
              <span className="helper-text">Latest entry</span>
              <strong>{symptomsList[0] ? formatDate(symptomsList[0].date) : 'Waiting for first log'}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-grid fade-in-section" style={{ animationDelay: '0.05s' }}>
        {summaryCards.map((card, index) => (
          <article key={card.label} className="metric-card interactive-card fade-in-section" style={{ animationDelay: `${0.05 + index * 0.05}s` }}>
            <div>
              <div className="metric-card__label">{card.label}</div>
              <div className="metric-card__value">{card.value}</div>
              <div className="metric-card__note">{card.note}</div>
            </div>
            <div className="metric-card__icon" aria-hidden="true">✦</div>
          </article>
        ))}
      </section>

      <section className="section-grid fade-in-section" style={{ animationDelay: '0.15s' }}>
        <article className="section-card section-card--wide">
          <div className="section-card__header">
            <div>
              <h2 className="section-card__title">Analytics</h2>
              <p className="section-card__subtitle">
                Compare mood frequency and pain trend lines across your latest sessions. Click a bar or point to filter the log list below.
              </p>
            </div>
            {moodFilter !== 'all' && (
              <button type="button" className="btn btn--ghost btn-interactive" onClick={() => setMoodFilter('all')}>
                Clear mood filter ({moodFilter}) ×
              </button>
            )}
          </div>
          {loading ? (
            <div className="chart-card skeleton skeleton--card" />
          ) : (
            <div className="chart-grid">
              <div className="chart-card interactive-card">
                <div className="chart-card__header">
                  <div>
                    <span className="chart-card__eyebrow">Wellbeing</span>
                    <h3 className="chart-card__title">Mood frequency</h3>
                  </div>
                  <span className="chart-card__unit">Entries</span>
                </div>
                {analytics.length > 0 ? (
                  <Bar data={moodChartData} options={moodChartOptions} />
                ) : (
                  <div className="chart-empty-state">
                    <div className="chart-empty-state__icon">◌</div>
                    <strong>No mood data yet</strong>
                    <p>Log a symptom check-in with a mood to see your distribution.</p>
                  </div>
                )}
              </div>
              <div className="chart-card interactive-card">
                <div className="chart-card__header">
                  <div>
                    <span className="chart-card__eyebrow">Comfort</span>
                    <h3 className="chart-card__title">Pain trend</h3>
                  </div>
                  <span className="chart-card__unit">Last 6 logs</span>
                </div>
                {symptomsList.length > 0 ? (
                  <Line data={painChartData} options={painChartOptions} />
                ) : (
                  <div className="chart-empty-state">
                    <div className="chart-empty-state__icon">⌁</div>
                    <strong>No pain trend yet</strong>
                    <p>Your pain pattern will appear here after your first check-in.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>

        <aside className="section-card section-card--narrow">
          <div className="section-card__header">
            <div>
              <h2 className="section-card__title">Logging tips</h2>
              <p className="section-card__subtitle">Small nudges for better data quality.</p>
            </div>
          </div>
          <div className="mini-panel interactive-card">
            <h3 className="quick-card__title">Hydration</h3>
            <p className="quick-card__copy">Capture water intake in liters to correlate fluid balance with pain and mood.</p>
          </div>
          <div className="mini-panel interactive-card">
            <h3 className="quick-card__title">Recovery</h3>
            <p className="quick-card__copy">Include sleep hours to understand the recovery context behind each mood entry.</p>
          </div>
          <div className="mini-panel interactive-card">
            <h3 className="quick-card__title">Pain scale</h3>
            <p className="quick-card__copy">A 1-10 slider gives the model a cleaner signal for pattern detection.</p>
          </div>
        </aside>
      </section>

      {/* MOOD SELECTOR - Interactive */}
      <section className="section-card fade-in-section" style={{ animationDelay: '0.2s' }}>
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">😊 How are you feeling today?</h2>
            <p className="section-card__subtitle">Tap your current mood to pre-fill the check-in form below.</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', padding: '8px 0' }}>
          {Object.entries(moodEmoji).map(([mood, emoji]) => (
            <button
              key={mood}
              type="button"
              className={`mood-select-btn${form.mood === mood ? ' is-active' : ''}`}
              onClick={() => {
                setForm((prev) => ({ ...prev, mood }));
                scrollToForm();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                padding: '16px 20px',
                borderRadius: '16px',
                border: form.mood === mood ? '2px solid #5b6cff' : '2px solid var(--border)',
                background: form.mood === mood ? 'rgba(91,108,255,0.1)' : 'var(--surface-raised)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '32px' }}>{emoji}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: form.mood === mood ? '#5b6cff' : 'var(--text-muted)', textTransform: 'capitalize' }}>{mood}</span>
            </button>
          ))}
        </div>
      </section>

      <section id="symptom-form" className="section-card fade-in-section" style={{ animationDelay: '0.25s' }}>
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">{editingId ? 'Edit check-in' : 'Daily health check-in'}</h2>
            <p className="section-card__subtitle">
              {editingId ? 'You are editing an existing entry.' : 'Enterprise-style form layout with clear spacing and visual hierarchy.'}
            </p>
          </div>
          <div style={{ fontSize: '28px' }}>{moodEmoji[form.mood]}</div>
        </div>

        {/* FORM COMPLETION PROGRESS */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span>Form completion</span>
            <span>{formCompletion}%</span>
          </div>
          <div style={{ height: '6px', borderRadius: '999px', background: 'var(--surface-raised)', overflow: 'hidden' }}>
            <div
              className="progress-fill-animated"
              style={{
                width: `${formCompletion}%`,
                height: '100%',
                borderRadius: '999px',
                background: formCompletion === 100 ? '#22c55e' : '#5b6cff',
              }}
            />
          </div>
        </div>

        {editingId && (
          <div style={{
            background: 'rgba(91,108,255,0.08)',
            border: '1px solid rgba(91,108,255,0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text-body)' }}>Editing the check-in from {formatDate(form.date)}.</span>
            <button type="button" className="btn btn--ghost btn-interactive" onClick={resetFormState}>Cancel edit</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label className="field__label" htmlFor="symptom-date">Date</label>
            <input
              id="symptom-date"
              type="date"
              className="field__input"
              value={form.date}
              max={todayStr}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
              required
              style={formErrors.date ? { borderColor: '#ef4444' } : undefined}
            />
            {formErrors.date && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{formErrors.date}</div>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="mood">Mood</label>
            <select id="mood" className="select" value={form.mood} onChange={(event) => setForm({ ...form, mood: event.target.value })}>
              {Object.keys(moodEmoji).map((mood) => (
                <option key={mood} value={mood}>{moodEmoji[mood]} {mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="field__label" htmlFor="pain-level">
              Pain level: <strong style={{ color: form.pain_level >= 7 ? '#ef4444' : form.pain_level >= 4 ? '#f59e0b' : '#22c55e' }}>{form.pain_level}/10</strong>
              <span style={{ marginLeft: '8px', fontSize: '18px' }}>{painFace(form.pain_level)}</span>
            </label>
            <input
              id="pain-level"
              type="range"
              min="1"
              max="10"
              className="pain-range-input"
              value={form.pain_level}
              onChange={(event) => setForm({ ...form, pain_level: event.target.value })}
              style={{ accentColor: form.pain_level >= 7 ? '#ef4444' : form.pain_level >= 4 ? '#f59e0b' : '#22c55e', width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>1 - No pain</span>
              <span>5 - Moderate</span>
              <span>10 - Severe</span>
            </div>
          </div>

          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label className="field__label" htmlFor="symptoms">Symptoms</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {commonSymptomTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="tag-chip-hover"
                  onClick={() => toggleSymptomTag(tag)}
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    border: isTagActive(tag) ? '1px solid #5b6cff' : '1px solid var(--border)',
                    background: isTagActive(tag) ? 'rgba(91,108,255,0.12)' : 'transparent',
                    color: isTagActive(tag) ? '#5b6cff' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {isTagActive(tag) ? '✓ ' : '+ '}{tag}
                </button>
              ))}
            </div>
            <input id="symptoms" type="text" className="field__input" value={form.symptoms} placeholder="Cramps, bloating, nausea..." onChange={(event) => setForm({ ...form, symptoms: event.target.value })} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="water">
              💧 Water intake (L)
              {form.water_intake && Number(form.water_intake) < 1.5 && !formErrors.water_intake && (
                <span style={{ color: '#f59e0b', fontSize: '11px', marginLeft: '8px' }}>⚠️ Drink more water!</span>
              )}
            </label>
            <input
              id="water"
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="field__input"
              value={form.water_intake}
              placeholder="2.5"
              onChange={(event) => setForm({ ...form, water_intake: event.target.value })}
              style={formErrors.water_intake ? { borderColor: '#ef4444' } : undefined}
            />
            {formErrors.water_intake && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{formErrors.water_intake}</div>}
          </div>

          <div className="field">
            <label className="field__label" htmlFor="sleep">
              😴 Sleep hours
              {form.sleep_hours && Number(form.sleep_hours) < 6 && !formErrors.sleep_hours && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginLeft: '8px' }}>⚠️ Low sleep detected!</span>
              )}
            </label>
            <input
              id="sleep"
              type="number"
              step="0.5"
              min="0"
              max="24"
              className="field__input"
              value={form.sleep_hours}
              placeholder="7"
              onChange={(event) => setForm({ ...form, sleep_hours: event.target.value })}
              style={formErrors.sleep_hours ? { borderColor: '#ef4444' } : undefined}
            />
            {formErrors.sleep_hours && <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{formErrors.sleep_hours}</div>}
          </div>

          <div className="hero-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn--primary btn-interactive" disabled={saving || !isFormValid}>
              {saving ? 'Saving...' : editingId ? `Update check-in ${moodEmoji[form.mood]}` : `Log check-in ${moodEmoji[form.mood]}`}
            </button>
            <button type="button" className="btn btn--secondary btn-interactive" onClick={resetFormState}>
              {editingId ? 'Cancel edit' : 'Reset form'}
            </button>
          </div>
        </form>
      </section>

      {/* NUTRITION TIPS */}
      <section className="section-card fade-in-section" style={{ animationDelay: '0.3s' }}>
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">🥗 Nutrition & Wellness Tips</h2>
            <p className="section-card__subtitle">General food and lifestyle ideas for each cycle phase.</p>
          </div>
        </div>
        <div className="section-grid">
          {nutritionTips.map((tip, index) => (
            <div
              key={tip.phase}
              className="mini-panel section-card--narrow interactive-card fade-in-section"
              style={{ borderLeft: `3px solid ${tip.color}`, animationDelay: `${0.3 + index * 0.06}s` }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{tip.emoji}</div>
              <h3 className="quick-card__title" style={{ color: tip.color }}>{tip.phase}</h3>
              <p className="quick-card__copy">{tip.tip}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="recent-logs" className="section-card fade-in-section" style={{ animationDelay: '0.35s' }}>
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Recent logs</h2>
            <p className="section-card__subtitle">Search and sort recent wellbeing entries, or edit/delete an entry directly.</p>
          </div>
        </div>

        <div className="control-bar">
          <input className="search-input" type="search" placeholder="Search symptoms, moods, or dates..." value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="select" value={moodFilter} onChange={(event) => setMoodFilter(event.target.value)}>
            <option value="all">All moods</option>
            {Object.keys(moodEmoji).map((mood) => <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>)}
          </select>
          <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Most recent</option>
            <option value="pain">Highest pain</option>
          </select>
          {(search || moodFilter !== 'all') && (
            <button type="button" className="btn btn--secondary btn-interactive" onClick={() => { setSearch(''); setMoodFilter('all'); }}>
              Reset filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="section-grid">
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
          </div>
        ) : filteredSymptoms.length > 0 ? (
          <div className="chip-grid">
            {filteredSymptoms.slice(0, 6).map((item, index) => (
              <article
                key={item.id}
                className="log-card interactive-card fade-in-section"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  ...(editingId === item.id ? { border: '2px solid #5b6cff' } : {}),
                }}
              >
                <div className="auth-meta">
                  <div>
                    <h3 className="log-card__title">{formatDate(item.date)}</h3>
                    <div className="log-card__meta">Pain {item.pain_level}/10 · {item.water_intake || '0'}L water · {item.sleep_hours || '0'}h sleep</div>
                  </div>
                  <div style={{ fontSize: '28px' }}>{moodEmoji[item.mood] || '•'}</div>
                </div>
                <p className="quick-card__copy">{item.symptoms || 'No symptom description added.'}</p>
                {Number(item.pain_level) >= 7 && (
                  <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px', fontWeight: 600 }}>
                    ⚠️ High pain level recorded on this day
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button type="button" className="btn btn--secondary btn-interactive" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn-interactive"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    style={{ color: '#ef4444' }}
                  >
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">◎</div>
            <strong>No symptom logs found</strong>
            <p className="empty-state__copy">Use the form above to capture the first data point.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Symptoms;