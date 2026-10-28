const toIsoDateString = (dateObject) => {
  if (!(dateObject instanceof Date) || Number.isNaN(dateObject.getTime())) {
    return null;
  }

  return dateObject.toISOString().split('T')[0];
};

const parseDateInput = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return toIsoDateString(value);
  }

  const text = String(value).trim();

  // Supports YYYY-MM-DD
  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const parsed = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00Z`);
    return toIsoDateString(parsed);
  }

  // Supports DD-MM-YYYY or DD/MM/YYYY
  const localMatch = text.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (localMatch) {
    const parsed = new Date(`${localMatch[3]}-${localMatch[2]}-${localMatch[1]}T00:00:00Z`);
    return toIsoDateString(parsed);
  }

  const fallbackDate = new Date(text);
  return toIsoDateString(fallbackDate);
};

const parsePlainDate = (value) => {
  const text = String(value || '').slice(0, 10);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
};

const addDaysToPlainDate = (value, days) => {
  const date = parsePlainDate(value);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + Number(days));
  return toIsoDateString(date);
};

module.exports = { parseDateInput, toIsoDateString, parsePlainDate, addDaysToPlainDate };