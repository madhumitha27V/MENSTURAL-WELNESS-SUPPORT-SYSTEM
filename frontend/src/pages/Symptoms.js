import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UiContext';
import api, { getApiErrorMessage, getAuthConfig } from '../lib/api';

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

const formatDate = (value) => (value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—');

const Symptoms = () => {
  const { token } = useAuth();
  const { notify } = useUI();
  const [form, setForm] = useState(initialForm);
  const [symptomsList, setSymptomsList] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await api.post('/symptoms/log', form, getAuthConfig(token));
      notify('Symptoms logged successfully.', 'success');
      setForm(initialForm);
      await fetchData();
    } catch (error) {
      notify(getApiErrorMessage(error, 'Error logging symptoms.'), 'error');
    } finally {
      setSaving(false);
    }
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
        if (sortBy === 'pain') {
          return Number(right.pain_level || 0) - Number(left.pain_level || 0);
        }

        return new Date(right.date || 0) - new Date(left.date || 0);
      });
  }, [moodFilter, search, sortBy, symptomsList]);

  const moodChartData = useMemo(() => ({
    labels: analytics.map((item) => item.mood),
    datasets: [
      {
        label: 'Mood count',
        data: analytics.map((item) => item.mood_count),
        backgroundColor: '#5b6cff',
        borderRadius: 16,
      },
    ],
  }), [analytics]);

  const painChartData = useMemo(() => ({
    labels: symptomsList.slice(0, 6).reverse().map((item) => formatDate(item.date)),
    datasets: [
      {
        label: 'Pain level',
        data: symptomsList.slice(0, 6).reverse().map((item) => Number(item.pain_level || 0)),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.16)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  }), [symptomsList]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#7b879f' } },
      y: { grid: { color: 'rgba(123, 135, 159, 0.16)' }, ticks: { color: '#7b879f', precision: 0 } },
    },
  };

  return (
    <div className="page">
      <section className="page__hero">
        <div className="hero-copy">
          <div className="eyebrow">Symptom analytics</div>
          <h1 className="hero-title">A calm, data-rich workspace for daily wellbeing logs.</h1>
          <p className="hero-subtitle">
            Log pain, sleep, hydration, and mood in one place, then review the trends in a dashboard that feels more like an executive product than a simple form.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => document.getElementById('symptom-form')?.scrollIntoView({ behavior: 'smooth' })}>
              Add a check-in
            </button>
            <button type="button" className="btn btn--secondary" onClick={fetchData}>
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

      <section className="metric-grid">
        {summaryCards.map((card) => (
          <article key={card.label} className="metric-card">
            <div>
              <div className="metric-card__label">{card.label}</div>
              <div className="metric-card__value">{card.value}</div>
              <div className="metric-card__note">{card.note}</div>
            </div>
            <div className="metric-card__icon" aria-hidden="true">✦</div>
          </article>
        ))}
      </section>

      <section className="section-grid">
        <article className="section-card section-card--wide">
          <div className="section-card__header">
            <div>
              <h2 className="section-card__title">Analytics</h2>
              <p className="section-card__subtitle">Compare mood frequency and pain trend lines across your latest sessions.</p>
            </div>
          </div>

          {loading ? (
            <div className="chart-card skeleton skeleton--card" />
          ) : (
            <div className="chart-grid">
              <div className="chart-card">
                <Bar data={moodChartData} options={chartOptions} />
              </div>
              <div className="chart-card">
                <Line data={painChartData} options={chartOptions} />
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

          <div className="mini-panel">
            <h3 className="quick-card__title">Hydration</h3>
            <p className="quick-card__copy">Capture water intake in liters to correlate fluid balance with pain and mood.</p>
          </div>
          <div className="mini-panel">
            <h3 className="quick-card__title">Recovery</h3>
            <p className="quick-card__copy">Include sleep hours to understand the recovery context behind each mood entry.</p>
          </div>
          <div className="mini-panel">
            <h3 className="quick-card__title">Pain scale</h3>
            <p className="quick-card__copy">A 1-10 slider gives the model a cleaner signal for pattern detection.</p>
          </div>
        </aside>
      </section>

      <section id="symptom-form" className="section-card">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Daily health check-in</h2>
            <p className="section-card__subtitle">Enterprise-style form layout with clear spacing and visual hierarchy.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label className="field__label" htmlFor="symptom-date">Date</label>
            <input id="symptom-date" type="date" className="field__input" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
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
            <label className="field__label" htmlFor="pain-level">Pain level: {form.pain_level}/10</label>
            <input id="pain-level" type="range" min="1" max="10" value={form.pain_level} onChange={(event) => setForm({ ...form, pain_level: event.target.value })} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="symptoms">Symptoms</label>
            <input id="symptoms" type="text" className="field__input" value={form.symptoms} placeholder="Cramps, bloating, nausea..." onChange={(event) => setForm({ ...form, symptoms: event.target.value })} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="water">Water intake (L)</label>
            <input id="water" type="number" step="0.1" className="field__input" value={form.water_intake} placeholder="2.5" onChange={(event) => setForm({ ...form, water_intake: event.target.value })} />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="sleep">Sleep hours</label>
            <input id="sleep" type="number" step="0.5" className="field__input" value={form.sleep_hours} placeholder="7" onChange={(event) => setForm({ ...form, sleep_hours: event.target.value })} />
          </div>

          <div className="hero-actions" style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Log symptom check-in'}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setForm(initialForm)}>
              Reset form
            </button>
          </div>
        </form>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Recent logs</h2>
            <p className="section-card__subtitle">Search and sort recent wellbeing entries for quick review.</p>
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
        </div>

        {loading ? (
          <div className="section-grid">
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
          </div>
        ) : filteredSymptoms.length > 0 ? (
          <div className="chip-grid">
            {filteredSymptoms.slice(0, 6).map((item) => (
              <article key={item.id} className="log-card">
                <div className="auth-meta">
                  <div>
                    <h3 className="log-card__title">{formatDate(item.date)}</h3>
                    <div className="log-card__meta">Pain {item.pain_level}/10 · {item.water_intake || '0'}L water · {item.sleep_hours || '0'}h sleep</div>
                  </div>
                  <div className="metric-card__icon" aria-hidden="true">{moodEmoji[item.mood] || '•'}</div>
                </div>
                <p className="quick-card__copy">{item.symptoms || 'No symptom description added.'}</p>
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