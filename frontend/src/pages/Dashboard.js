import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import api, { getAuthConfig } from '../lib/api';
// Add these imports at the top of Dashboard.js
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';

// Cycle phase calculator
const getCyclePhase = (lastPeriodDate, avgCycleLength = 28) => {
  if (!lastPeriodDate) return null;
  const today = new Date();
  const last = parsePlainDate(lastPeriodDate);
  const dayOfCycle = Math.floor((today - last) / (1000 * 60 * 60 * 24)) + 1;

  if (dayOfCycle <= 5) return { phase: 'Menstrual', day: dayOfCycle, color: '#ef4444', emoji: '🩸', tip: 'Rest, stay warm, and hydrate well today.' };
  if (dayOfCycle <= 13) return { phase: 'Follicular', day: dayOfCycle, color: '#8b5cf6', emoji: '🌱', tip: 'Energy is rising — great time to start new things!' };
  if (dayOfCycle <= 16) return { phase: 'Ovulation', day: dayOfCycle, color: '#ec4899', emoji: '✨', tip: 'Peak energy and confidence. You are unstoppable today!' };
  if (dayOfCycle <= avgCycleLength) return { phase: 'Luteal', day: dayOfCycle, color: '#f59e0b', emoji: '🌙', tip: 'Wind down, journal, and be gentle with yourself.' };
  return { phase: 'Late Luteal', day: dayOfCycle, color: '#6366f1', emoji: '💜', tip: 'Period may be approaching. Rest and prepare.' };
};

// Days until next period
const getDaysUntil = (nextPeriodDate) => {
  if (!nextPeriodDate) return null;
  const today = new Date();
  const next = parsePlainDate(nextPeriodDate);
  const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
  return diff;
};

// Daily motivational quotes by phase
const phaseQuotes = {
  Menstrual: ['Your body is doing something incredible. Rest is productive.', 'Honour your need for slowness today.', 'Healing is happening right now.'],
  Follicular: ['New beginnings are your superpower this week.', 'Your clarity and creativity are peaking.', 'This is your fresh start energy.'],
  Ovulation: ['You are magnetic and powerful today.', 'Your communication skills are at their peak.', 'Step into the spotlight — you are ready.'],
  Luteal: ['Gentle productivity is still productivity.', 'Rest without guilt. You have earned it.'],
  'Late Luteal': ['Your body knows what it needs. Listen.', 'Nourish yourself deeply today.', 'The cycle completes and renews.'],
};

const getDailyQuote = (phase) => {
  if (!phase) return 'Track your cycle to unlock personalised daily guidance.';
  const quotes = phaseQuotes[phase] || phaseQuotes.Luteal;
  const index = new Date().getDate() % quotes.length;
  return quotes[index];
};

const getDateKey = (value) => {
  return String(value || '').slice(0, 10);
};

const parsePlainDate = (value) => {
  const text = String(value || '').slice(0, 10);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
};

const moodOptions = [
  { key: 'calm', label: 'Calm', icon: '🌿' },
  { key: 'energized', label: 'Energized', icon: '⚡' },
  { key: 'reflective', label: 'Reflective', icon: '🫶' },
  { key: 'restful', label: 'Restful', icon: '☁️' },
  { key: 'focused', label: 'Focused', icon: '✨' },
  { key: 'uplifted', label: 'Uplifted', icon: '🌈' },
];

// PDF Export
const exportPDF = (user, cycles, symptoms, prediction) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(91, 108, 255);
  doc.text('Menstrual Wellness Report', 20, 25);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Name: ${user?.name || 'User'}`, 20, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);

  doc.setFontSize(14);
  doc.setTextColor(91, 108, 255);
  doc.text('Cycle Summary', 20, 70);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total cycles logged: ${cycles.length}`, 20, 82);
  doc.text(`Average cycle length: ${prediction?.average_cycle_length || 'N/A'} days`, 20, 92);
  doc.text(`Median cycle length: ${prediction?.median_cycle_length || 'N/A'} days`, 20, 102);
  doc.text(`Next period range: ${prediction?.prediction_range_start || 'N/A'} to ${prediction?.prediction_range_end || 'N/A'}`, 20, 112);
  doc.text(`Ovulation date: ${prediction?.ovulation_date || 'N/A'}`, 20, 112);
  doc.text(`Fertile window: ${prediction?.fertile_window_start || 'N/A'} to ${prediction?.fertile_window_end || 'N/A'}`, 20, 122);

  doc.setFontSize(14);
  doc.setTextColor(91, 108, 255);
  doc.text('Symptom Summary', 20, 142);

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total symptom logs: ${symptoms.length}`, 20, 154);

  if (symptoms.length > 0) {
    const avgPain = (symptoms.reduce((sum, s) => sum + Number(s.pain_level || 0), 0) / symptoms.length).toFixed(1);
    const avgWater = (symptoms.reduce((sum, s) => sum + Number(s.water_intake || 0), 0) / symptoms.length).toFixed(1);
    const avgSleep = (symptoms.reduce((sum, s) => sum + Number(s.sleep_hours || 0), 0) / symptoms.length).toFixed(1);
    doc.text(`Average pain level: ${avgPain}/10`, 20, 164);
    doc.text(`Average water intake: ${avgWater}L`, 20, 174);
    doc.text(`Average sleep: ${avgSleep} hours`, 20, 184);
  }

  doc.setFontSize(14);
  doc.setTextColor(91, 108, 255);
  doc.text('Recent Cycles', 20, 204);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  cycles.slice(0, 5).forEach((cycle, index) => {
    doc.text(
      `${index + 1}. ${cycle.start_date?.split('T')[0]} → ${cycle.end_date?.split('T')[0] || 'Ongoing'} | Flow: ${cycle.flow_intensity}`,
      20,
      216 + index * 12
    );
  });

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Menstrual Wellness OS', 20, 280);

  doc.save(`wellness-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Big segmented cycle ring — hero visual (period / follicular / ovulation / luteal arcs)
const CycleHeroRing = ({ cyclePhase, avgCycleLength, daysUntil }) => {
  const size = 220;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = avgCycleLength || 28;

  const ovulationDays = 3;
  const menstrualDays = 5;
  const follicularDays = Math.max(1, 13 - menstrualDays);
  const lutealDays = Math.max(1, total - menstrualDays - follicularDays - ovulationDays);

  const segments = [
    { phase: 'Menstrual', days: menstrualDays, color: '#ef4444' },
    { phase: 'Follicular', days: follicularDays, color: '#8b5cf6' },
    { phase: 'Ovulation', days: ovulationDays, color: '#ec4899' },
    { phase: 'Luteal', days: lutealDays, color: '#f59e0b' },
  ];

  let cumulativeBefore = 0;
  const arcs = segments.map((seg) => {
    const segLength = (seg.days / total) * circumference;
    const dashoffset = -((cumulativeBefore / total) * circumference);
    cumulativeBefore += seg.days;
    return { ...seg, segLength, dashoffset };
  });

  const currentDay = cyclePhase?.day || 0;
  const dayFraction = total > 0 ? Math.min(1, Math.max(0, currentDay / total)) : 0;
  const markerAngleDeg = dayFraction * 360 - 90;
  const markerAngleRad = (markerAngleDeg * Math.PI) / 180;
  const markerX = size / 2 + radius * Math.cos(markerAngleRad);
  const markerY = size / 2 + radius * Math.sin(markerAngleRad);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-raised)" strokeWidth={strokeWidth} />
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcs.map((arc) => (
            <circle
              key={arc.phase}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arc.segLength} ${circumference - arc.segLength}`}
              strokeDashoffset={arc.dashoffset}
            />
          ))}
        </g>
        {cyclePhase && (
          <circle cx={markerX} cy={markerY} r={9} fill="#fff" stroke={cyclePhase.color} strokeWidth={4} />
        )}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {cyclePhase ? cyclePhase.phase : 'Cycle'}
        </div>
        <div style={{ fontSize: '38px', fontWeight: 700, color: 'var(--text-heading)', lineHeight: 1.1, marginTop: '4px' }}>
          {cyclePhase ? `Day ${cyclePhase.day}` : '—'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '150px' }}>
          {daysUntil !== null
            ? (daysUntil <= 0 ? 'Period expected today' : `Period in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`)
            : 'Log a cycle to begin tracking'}
        </div>
      </div>
    </div>
  );
};

ChartJS.register(ArcElement, BarElement, CategoryScale, Legend, LinearScale, Tooltip);

const formatDate = (value) => {
  if (!value) {
    return '—';
  }

  const date = parsePlainDate(value);
  return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) : '—';
};

const getCycleDuration = (cycle) => {
  if (!cycle?.start_date) {
    return 0;
  }

  const startDate = parsePlainDate(cycle.start_date);
  const endDate = cycle.end_date ? parsePlainDate(cycle.end_date) : null;

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
  const [dailyCheckins, setDailyCheckins] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('wellness_checkins');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedDay, setSelectedDay] = useState(() => {
    if (typeof window === 'undefined') return new Date().toISOString().split('T')[0];
    try {
      return localStorage.getItem('wellness_selected_day') || new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  const defaultWeeklyGoals = { hydration: false, rest: false, movement: false, journal: false };

  const getWeekKey = (value = new Date()) => {
    const date = new Date(value);
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDays = Math.floor((date - firstDayOfYear) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil((pastDays + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-W${String(weekNumber).padStart(2, '0')}`;
  };

  const [weeklyWellnessGoals, setWeeklyWellnessGoals] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('wellness_goals_weekly');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [currentWeekKey] = useState(() => getWeekKey());
  const currentWeekLabel = `Week ${currentWeekKey.split('-W')[1] || '01'}`;

  const wellnessGoals = weeklyWellnessGoals[currentWeekKey] || defaultWeeklyGoals;

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

  useEffect(() => {
    try {
      localStorage.setItem('wellness_goals_weekly', JSON.stringify(weeklyWellnessGoals));
    } catch {
      // ignore storage errors
    }
  }, [weeklyWellnessGoals]);

  useEffect(() => {
    try {
      localStorage.setItem('wellness_checkins', JSON.stringify(dailyCheckins));
      localStorage.setItem('wellness_selected_day', selectedDay);
    } catch {
      // ignore storage errors
    }
  }, [dailyCheckins, selectedDay]);

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
          backgroundColor: '#b84f6f',
          hoverBackgroundColor: '#963d59',
          borderRadius: 10,
          maxBarThickness: 48,
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
          backgroundColor: ['#b84f6f', '#d87992', '#e7a0b2', '#8d5367', '#c18a9a', '#6f394e'],
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
      note: 'All period events captured to date.',
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
      note: prediction?.median_cycle_length
        ? `Median ${prediction.median_cycle_length} days across historical cycles.`
        : 'Need at least two cycles for an estimate.',
      icon: '◉',
    },
    {
      label: 'Avg. pain score',
      value: symptoms.length ? averagePain.toFixed(1) : '0.0',
      note: 'Lower values indicate a smoother monthly pattern.',
      icon: '◈',
    },
  ];

  // Cycle phase + countdown + daily quote
  const cyclePhase = useMemo(() => {
    if (!cycles.length) return null;
    return getCyclePhase(cycles[0]?.start_date, prediction?.average_cycle_length);
  }, [cycles, prediction]);

  const daysUntil = useMemo(() => getDaysUntil(prediction?.next_period_predicted), [prediction]);
  const dailyQuote = useMemo(() => getDailyQuote(cyclePhase?.phase), [cyclePhase]);

  const wellnessGoalList = useMemo(() => [
    { key: 'hydration', label: 'Hydration reset', hint: 'Sip water regularly', icon: '💧' },
    { key: 'rest', label: 'Rest first', hint: 'Let your body recover', icon: '🛏️' },
    { key: 'movement', label: 'Gentle movement', hint: 'Walk or stretch', icon: '🪷' },
    { key: 'journal', label: 'Mood check-in', hint: 'Note how you feel', icon: '✍️' },
  ], []);

  const completedGoals = useMemo(() => wellnessGoalList.filter((goal) => wellnessGoals[goal.key]).length, [wellnessGoalList, wellnessGoals]);
  const goalProgress = Math.round((completedGoals / wellnessGoalList.length) * 100);
  const careInsight = useMemo(() => {
    if (averagePain > 6) return 'Pain is trending high — a slower pace, hydration, and extra rest may help.';
    if (cyclePhase?.phase === 'Ovulation') return 'Your energy looks strong — this is a lovely time to focus on big tasks.';
    if (cyclePhase?.phase === 'Luteal') return 'Your body may want extra comfort today — keep the plan gentle and calm.';
    return 'Your wellness rhythm looks balanced — keep the day soft and intentional.';
  }, [averagePain, cyclePhase]);

  const toggleGoal = (key) => {
    setWeeklyWellnessGoals((current) => ({
      ...current,
      [currentWeekKey]: {
        ...current[currentWeekKey],
        [key]: !current[currentWeekKey]?.[key],
      },
    }));
  };

  useEffect(() => {
    if (goalProgress === 100) {
      triggerConfetti();
    }
  }, [goalProgress]);

  const currentCheckin = dailyCheckins[selectedDay] || { mood: '', reflection: '' };

  const moodCalendar = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let index = 6; index >= 0; index -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - index);
      const key = getDateKey(date);
      const savedCheckin = dailyCheckins[key];
      const matchingEntry = symptoms.find((item) => getDateKey(item.date) === key);
      const mood = savedCheckin?.mood || matchingEntry?.mood || '';
      days.push({
        key,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        shortLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood,
        isToday: key === getDateKey(new Date()),
      });
    }

    return days;
  }, [dailyCheckins, symptoms]);

  const currentDayInsight = useMemo(() => {
    const selected = moodCalendar.find((item) => item.key === selectedDay);
    return selected || moodCalendar[moodCalendar.length - 1];
  }, [moodCalendar, selectedDay]);

  const handleDaySelect = (dayKey) => {
    setSelectedDay(dayKey);
    setSearch(dayKey);
  };

  const updateCheckinField = (field, value) => {
    setDailyCheckins((current) => ({
      ...current,
      [selectedDay]: {
        mood: current[selectedDay]?.mood || 'calm',
        reflection: current[selectedDay]?.reflection || '',
        [field]: value,
      },
    }));
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      colors: ['#5b6cff', '#ec4899', '#8b5cf6', '#f59e0b'],
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="page">
      {/* CYCLE HERO RING */}
      <div style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <CycleHeroRing cyclePhase={cyclePhase} avgCycleLength={prediction?.average_cycle_length} daysUntil={daysUntil} />

        <div style={{ flex: '1 1 240px', minWidth: '220px' }}>
          {cyclePhase ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '22px' }}>{cyclePhase.emoji}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: cyclePhase.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {cyclePhase.phase} Phase
                </span>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-body)', marginBottom: '16px' }}>{dailyQuote}</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>{cyclePhase.tip}</p>
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '18px' }}>
                {['Menstrual', 'Follicular', 'Ovulation', 'Luteal'].map((label) => {
                  const colorMap = { Menstrual: '#ef4444', Follicular: '#8b5cf6', Ovulation: '#ec4899', Luteal: '#f59e0b' };
                  return (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: colorMap[label], display: 'inline-block' }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="btn btn--primary"
                onClick={triggerConfetti}
                style={{ background: cyclePhase.color }}
              >
                {cyclePhase.emoji} I feel this!
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '15px', color: 'var(--text-body)', marginBottom: '12px' }}>{dailyQuote}</p>
              <Link to="/cycle" className="btn btn--primary">Log your first cycle</Link>
            </>
          )}
        </div>
      </div>

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
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => exportPDF(user, cycles, symptoms, prediction)}
            >
              Export PDF 📄
            </button>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-art__content">
            <div className="hero-art__metric">
              <span className="helper-text">Next period prediction</span>
              <strong>
                {prediction?.prediction_range_start && prediction?.prediction_range_end
                  ? `${prediction.prediction_range_start} - ${prediction.prediction_range_end}`
                  : 'Not enough data yet'}
              </strong>
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

      {/* METRIC CARDS */}
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
              <div className="metric-card__icon" aria-hidden="true">{card.icon}</div>
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
                <div className="chart-card__header">
                  <div>
                    <span className="chart-card__eyebrow">Cycle history</span>
                    <h3 className="chart-card__title">Cycle duration</h3>
                  </div>
                  <span className="chart-card__unit">Days</span>
                </div>
                <Bar data={cycleChartData} options={chartOptions} />
              </div>
              <div className="chart-card">
                <div className="chart-card__header">
                  <div>
                    <span className="chart-card__eyebrow">Wellbeing</span>
                    <h3 className="chart-card__title">Mood distribution</h3>
                  </div>
                  <span className="chart-card__unit">Check-ins</span>
                </div>
                {moodChartData.labels.length > 1 ? (
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
                ) : (
                  <div className="empty-state">
                    <div className="empty-state__icon">◎</div>
                    <strong>Not enough mood variety yet</strong>
                    <p className="empty-state__copy">
                      Log a few more check-ins with different moods to see your mood distribution.
                    </p>
                  </div>
                )}
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
            <p className="quick-card__copy">
              {prediction?.forecast_confidence
                ? `Confidence: ${prediction.forecast_confidence}. Recent cycles vary from ${prediction.cycle_length_min} to ${prediction.cycle_length_max} days.`
                : 'Continue logging cycles to unlock a forecast range.'}
            </p>
          </div>

          <div className="mini-panel">
            <div className="mini-panel__icon">⌁</div>
            <h3 className="quick-card__title">Care signal</h3>
            <p className="quick-card__copy">
              {!symptoms.length
                ? 'Not enough symptom data yet. Add check-ins to see a care signal.'
                : averagePain > 6
                ? 'Pain scores are trending higher than ideal. Review hydration, rest, and symptom patterns.'
                : 'Your symptom intensity is currently within a manageable range.'}
            </p>
          </div>

          <button type="button" className="btn btn--primary" onClick={() => setInsightsOpen(true)}>
            View recommendation set
          </button>
        </aside>
      </section>

      <section className="section-card reveal-element">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Daily wellness planner</h2>
            <p className="section-card__subtitle">A calm, interactive routine builder that turns wellness habits into a visible streak.</p>
          </div>
        </div>

        <div className="wellness-planner">
          <div className="wellness-planner__summary">
            <div className="wellness-planner__ring" style={{ '--progress': goalProgress }}>
              <span>{goalProgress}%</span>
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div className="pill pill--ghost" style={{ padding: '8px 14px', borderRadius: '999px', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex' }}>
                {currentWeekLabel}
              </div>
              <h3 className="quick-card__title" style={{ marginTop: '8px' }}>You are {completedGoals}/{wellnessGoalList.length} steps into your gentle care plan.</h3>
              <p className="quick-card__copy" style={{ marginTop: '8px' }}>{careInsight}</p>
            </div>
          </div>

          <div className="wellness-goals">
            {wellnessGoalList.map((goal) => (
              <button
                key={goal.key}
                type="button"
                className={`wellness-goal${wellnessGoals[goal.key] ? ' wellness-goal--done' : ''}`}
                onClick={() => toggleGoal(goal.key)}
              >
                <div className="wellness-goal__meta">
                  <span className="wellness-goal__icon">{goal.icon}</span>
                  <span>
                    <div className="wellness-goal__label">{goal.label}</div>
                    <div className="wellness-goal__hint">{goal.hint}</div>
                  </span>
                </div>
                <span className="wellness-goal__status">{wellnessGoals[goal.key] ? '✓' : '○'}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <h2 className="section-card__title">Daily check-in</h2>
            <p className="section-card__subtitle">Capture how you feel today and save a small reflection for later.</p>
          </div>
        </div>

        <div className="wellness-grid">
          <div className="wellness-card">
            <div className="wellness-card__title">How are you feeling?</div>
            <div className="mood-pills">
              {moodOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={`mood-pill${currentCheckin.mood === option.key ? ' mood-pill--active' : ''}`}
                  onClick={() => updateCheckinField('mood', option.key)}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
            <textarea
              className="reflection-box"
              value={currentCheckin.reflection}
              onChange={(event) => updateCheckinField('reflection', event.target.value)}
              placeholder="Write a short note about your energy, needs, or comfort today..."
            />
            <div className="wellness-card__copy">Every day’s mood and note are saved separately so you can review your personal rhythm later.</div>
          </div>

          <div className="wellness-card">
            <div className="wellness-card__title">Week mood calendar</div>
            <div className="mood-calendar">
              {moodCalendar.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  className={`calendar-day${selectedDay === day.key ? ' calendar-day--active' : ''}`}
                  onClick={() => handleDaySelect(day.key)}
                >
                  <strong>{day.label.slice(0, 1)}</strong>
                  <span>{day.shortLabel}</span>
                  <span>{moodOptions.find((option) => option.key === day.mood)?.icon || '—'}</span>
                </button>
              ))}
            </div>
            <div className="wellness-card__copy">
              {currentDayInsight?.mood ? `Showing ${currentDayInsight.shortLabel} — ${currentDayInsight.mood}` : 'Not enough data yet'}
            </div>
          </div>
        </div>
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
                  Next period range: <strong>{prediction?.prediction_range_start && prediction?.prediction_range_end
                    ? `${prediction.prediction_range_start} to ${prediction.prediction_range_end}`
                    : 'Not enough data'}</strong>
                  <br />
                  Ovulation: <strong>{prediction?.ovulation_date || 'Pending'}</strong>
                </p>
              </div>
              {cyclePhase && (
                <div className="mini-panel">
                  <h3 className="quick-card__title">Current phase insight</h3>
                  <p className="quick-card__copy">
                    {cyclePhase.emoji} You are in the <strong>{cyclePhase.phase}</strong> phase (Day {cyclePhase.day}).
                    <br />
                    {cyclePhase.tip}
                  </p>
                </div>
              )}
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
                <button type="button" className="btn btn--ghost" onClick={() => exportPDF(user, cycles, symptoms, prediction)}>
                  Export PDF 📄
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;