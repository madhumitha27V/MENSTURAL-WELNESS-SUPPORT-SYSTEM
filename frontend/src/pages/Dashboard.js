import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip, Filler } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import api, { getAuthConfig } from '../lib/api';

ChartJS.register(ArcElement, CategoryScale, Legend, LinearScale, LineElement, PointElement, Tooltip, Filler);

const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getCycleDuration = (cycle) => {
  if (!cycle?.start_date) {
    return 0;
  }

  const startDate = new Date(cycle.start_date);
  const endDate = cycle.end_date ? new Date(cycle.end_date) : null;

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return cycle.predicted_length || 5;
  }

  return Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
};

const Dashboard = () => {
  const { user, token } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [insightsOpen, setInsightsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const authConfig = getAuthConfig(token);
      const [cycleRes, symptomRes, predictRes] = await Promise.all([
        api.get('/cycle/all', authConfig),
        api.get('/symptoms/all', authConfig),
        api.get('/cycle/predict', authConfig),
      ]);

      setCycles(cycleRes.data || []);
      setSymptoms(symptomRes.data || []);
      setPrediction(predictRes.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const averagePain = useMemo(() => {
    if (!symptoms.length) {
      return 0;
    }

    return symptoms.reduce((sum, symptom) => sum + Number(symptom.pain_level || 0), 0) / symptoms.length;
  }, [symptoms]);

  const activityFeed = useMemo(() => {
    const cycleItems = cycles.map((cycle) => ({
      id: `cycle-${cycle.id}`,
      type: 'cycle',
      title: 'Cycle logged',
      date: cycle.start_date,
      meta: `Flow ${cycle.flow_intensity || 'unspecified'} · ${formatDate(cycle.start_date)}${cycle.end_date ? ` - ${formatDate(cycle.end_date)}` : ''}`,
      detail: cycle.notes || 'No notes added for this cycle.',
      searchText: `${cycle.flow_intensity || ''} ${cycle.notes || ''} ${cycle.start_date || ''}`.toLowerCase(),
    }));

    const symptomItems = symptoms.map((symptom) => ({
      id: `symptom-${symptom.id}`,
      type: 'symptom',
      title: `${symptom.mood || 'Mood'} check-in`,
      date: symptom.date,
      meta: `Pain ${symptom.pain_level || 0}/10 · ${symptom.water_intake || '0'}L water · ${symptom.sleep_hours || '0'}h sleep`,
      detail: symptom.symptoms || 'No symptoms provided.',
      searchText: `${symptom.mood || ''} ${symptom.symptoms || ''} ${symptom.date || ''}`.toLowerCase(),
    }));

    return [...cycleItems, ...symptomItems]
      .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0));
  }, [cycles, symptoms]);

  const filteredFeed = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activityFeed.filter((item) => {
      const matchesType = filter === 'all' || item.type === filter;
      const matchesQuery = !query || item.searchText.includes(query);
      return matchesType && matchesQuery;
    });
  }, [activityFeed, filter, search]);

  const cycleChartData = useMemo(() => {
    const labels = cycles.slice(0, 6).reverse().map((cycle) => formatDate(cycle.start_date));
    const durations = cycles.slice(0, 6).reverse().map((cycle) => getCycleDuration(cycle));

    return {
      labels,
      datasets: [
        {
          label: 'Cycle duration',
          data: durations,
          borderColor: '#5b6cff',
          backgroundColor: 'rgba(91, 108, 255, 0.16)',
          fill: true,
          tension: 0.45,
          pointRadius: 4,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [cycles]);

  const moodChartData = useMemo(() => {
    const moodCounts = symptoms.reduce((accumulator, symptom) => {
      const mood = symptom.mood || 'unknown';
      accumulator[mood] = (accumulator[mood] || 0) + 1;
      return accumulator;
    }, {});

    return {
      labels: Object.keys(moodCounts),
      datasets: [
        {
          data: Object.values(moodCounts),
          backgroundColor: ['#5b6cff', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [symptoms]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10, 15, 28, 0.92)',
        titleColor: '#fff',
        bodyColor: '#f8fbff',
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#7b879f' },
      },
      y: {
        grid: { color: 'rgba(123, 135, 159, 0.16)' },
        ticks: { color: '#7b879f', precision: 0 },
      },
    },
  };

  const metricCards = [
    {
      label: 'Logged cycles',
      value: cycles.length,
      note: 'Covers every period event captured this month.',
      icon: '◔',
    },
    {
      label: 'Symptom check-ins',
      value: symptoms.length,
      note: 'Structured wellbeing observations and daily context.',
      icon: '◌',
    },
    {
      label: 'Avg. cycle length',
      value: prediction?.average_cycle_length ? `${prediction.average_cycle_length} days` : 'N/A',
      note: 'Model-based estimate from historical cycles.',
      icon: '◉',
    },
    {
      label: 'Avg. pain score',
      value: symptoms.length ? averagePain.toFixed(1) : '0.0',
      note: 'Lower values indicate a smoother monthly pattern.',
      icon: '◈',
    },
  ];

  return (
    <div className="page">
      <section className="page__hero">
        <div className="hero-copy">
          <div className="eyebrow">Executive dashboard</div>
          <h1 className="hero-title">Hello {user?.name}, your wellness operations are up to date.</h1>
          <p className="hero-subtitle">
            A premium control center for cycle tracking, symptom intelligence, and care planning. Monitor trends, review predictions,
            and act on signals before they become friction.
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn--primary" onClick={() => setInsightsOpen(true)}>
              Open insights
            </button>
            <Link to="/cycle" className="btn btn--secondary">
              Log new cycle
            </Link>
            <Link to="/chatbot" className="btn btn--ghost">
              Ask AI assistant
            </Link>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__content">
            <div className="hero-art__metric">
              <span className="helper-text">Next period prediction</span>
              <strong>{prediction?.next_period_predicted || 'Updating soon'}</strong>
            </div>
            <div className="hero-art__metric">
              <span className="helper-text">Fertile window</span>
              <strong>
                {prediction?.fertile_window_start && prediction?.fertile_window_end
                  ? `${prediction.fertile_window_start} - ${prediction.fertile_window_end}`
                  : 'Not enough data yet'}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="metric-card skeleton skeleton--card" />)
          : metricCards.map((card) => (
            <article key={card.label} className="metric-card">
              <div>
                <div className="metric-card__label">{card.label}</div>
                <div className="metric-card__value">{card.value}</div>
                <div className="metric-card__note">{card.note}</div>
              </div>
              <div className="metric-card__icon" aria-hidden="true">
                {card.icon}
              </div>
            </article>
          ))}
      </section>

      <section className="section-grid">
        <article className="section-card section-card--wide">
          <div className="section-card__header">
            <div>
              <h2 className="section-card__title">Trend analytics</h2>
              <p className="section-card__subtitle">Interactive performance view with cycle duration and mood distribution.</p>
            </div>
            <button type="button" className="btn btn--secondary" onClick={fetchData}>
              Refresh data
            </button>
          </div>

          {loading ? (
            <div className="chart-card skeleton skeleton--card" />
          ) : (
            <div className="chart-grid">
              <div className="chart-card">
                <Line data={cycleChartData} options={chartOptions} />
              </div>
              <div className="chart-card">
                <Doughnut
                  data={moodChartData}
                  options={{
                    ...chartOptions,
                    scales: undefined,
                    cutout: '68%',
                    plugins: {
                      ...chartOptions.plugins,
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </article>

        <aside className="section-card section-card--narrow">
          <div className="section-card__header">
            <div>
              <h2 className="section-card__title">Operational insights</h2>
              <p className="section-card__subtitle">One-screen view for likely next actions.</p>
            </div>
          </div>

          <div className="mini-panel">
            <div className="mini-panel__icon">↗</div>
            <h3 className="quick-card__title">Forecast confidence</h3>
            <p className="quick-card__copy">{prediction?.average_cycle_length ? 'Predictions are anchored to your recent cycle history.' : 'Continue logging cycles to unlock better forecast quality.'}</p>
          </div>

          <div className="mini-panel">
            <div className="mini-panel__icon">⌁</div>
            <h3 className="quick-card__title">Care signal</h3>
            <p className="quick-card__copy">
              {averagePain > 6
                ? 'Pain scores are trending higher than ideal. Review hydration, rest, and symptom patterns.'
                : 'Your symptom intensity is currently within a manageable range.'}
            </p>
          </div>

          <button type="button" className="btn btn--primary" onClick={() => setInsightsOpen(true)}>
            View recommendation set
          </button>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Quick actions</h2>
            <p className="section-card__subtitle">Task shortcuts that mirror a modern SaaS command surface.</p>
          </div>
        </div>

        <div className="section-grid">
          <Link to="/cycle" className="quick-card section-card--narrow" style={{ textAlign: 'left' }}>
            <div className="quick-card__icon">📅</div>
            <h3 className="quick-card__title">Track a cycle</h3>
            <p className="quick-card__copy">Capture start/end dates, flow, and contextual notes in a streamlined flow.</p>
          </Link>
          <Link to="/symptoms" className="quick-card section-card--narrow" style={{ textAlign: 'left' }}>
            <div className="quick-card__icon">🫶</div>
            <h3 className="quick-card__title">Log symptoms</h3>
            <p className="quick-card__copy">Add mood, pain, hydration, and rest data for richer analysis.</p>
          </Link>
          <Link to="/chatbot" className="quick-card section-card--narrow" style={{ textAlign: 'left' }}>
            <div className="quick-card__icon">✦</div>
            <h3 className="quick-card__title">Ask the assistant</h3>
            <p className="quick-card__copy">Get contextual guidance with a polished conversational interface.</p>
          </Link>
        </div>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Recent activity</h2>
            <p className="section-card__subtitle">Search and filter the latest cycle and symptom entries.</p>
          </div>
        </div>

        <div className="control-bar">
          <input
            className="search-input"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes, moods, flow, dates..."
            aria-label="Search activity"
          />
          <select className="select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter activity by type">
            <option value="all">All activity</option>
            <option value="cycle">Cycles</option>
            <option value="symptom">Symptoms</option>
          </select>
          <button type="button" className="btn btn--secondary" onClick={() => { setSearch(''); setFilter('all'); }}>
            Reset filters
          </button>
        </div>

        {loading ? (
          <div className="section-grid">
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
            <div className="skeleton skeleton--card" style={{ gridColumn: 'span 12' }} />
          </div>
        ) : filteredFeed.length > 0 ? (
          <div className="chip-grid">
            {filteredFeed.slice(0, 6).map((item) => (
              <article key={item.id} className="log-card">
                <div className="auth-meta">
                  <div>
                    <h3 className="log-card__title">{item.title}</h3>
                    <div className="log-card__meta">{formatDate(item.date)} · {item.type === 'cycle' ? 'Cycle' : 'Symptom'}</div>
                  </div>
                  <span className="pill pill--active">{item.type}</span>
                </div>
                <p className="quick-card__copy">{item.detail}</p>
                <div className="helper-text">{item.meta}</div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state__icon">◎</div>
            <strong>No matching activity</strong>
            <p className="empty-state__copy">
              Try a different keyword or clear the filter to surface your latest health events.
            </p>
          </div>
        )}
      </section>

      {insightsOpen && (
        <div className="modal-backdrop" role="presentation" onClick={() => setInsightsOpen(false)}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="dashboard-insights-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2 id="dashboard-insights-title" className="section-card__title">Care insights</h2>
                <p className="section-card__subtitle">A concise summary of what the current data suggests.</p>
              </div>
              <button type="button" className="icon-button icon-button--ghost" onClick={() => setInsightsOpen(false)} aria-label="Close insights dialog">
                ×
              </button>
            </div>

            <div className="modal__content">
              <div className="mini-panel">
                <h3 className="quick-card__title">Prediction summary</h3>
                <p className="quick-card__copy">
                  Next period: <strong>{prediction?.next_period_predicted || 'Pending'}</strong>
                  <br />
                  Ovulation: <strong>{prediction?.ovulation_date || 'Pending'}</strong>
                </p>
              </div>
              <div className="mini-panel">
                <h3 className="quick-card__title">Suggested follow-up</h3>
                <p className="quick-card__copy">
                  {symptoms.length
                    ? 'Review symptom spikes against sleep and hydration. The data is strong enough for proactive planning.'
                    : 'Start logging symptoms to unlock targeted, personalized recommendations.'}
                </p>
              </div>
              <div className="hero-actions">
                <button type="button" className="btn btn--primary" onClick={() => setInsightsOpen(false)}>
                  Close panel
                </button>
                <Link to="/chatbot" className="btn btn--secondary">
                  Ask the assistant
                </Link>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;