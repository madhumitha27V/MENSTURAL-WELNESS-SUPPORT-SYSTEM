const RED_FLAG_RULES = [
  { pattern: /\b(severe|unbearable|excruciating)\s+(pain|cramps?)\b/i, label: 'severe pain' },
  { pattern: /\b(soak|soaking)\b.{0,30}\b(pad|tampon)s?\b/i, label: 'very heavy bleeding' },
  { pattern: /\b(heavy|very heavy)\s+bleeding\b/i, label: 'very heavy bleeding' },
  { pattern: /\b(faint|fainted|fainting|passed out|unconscious|dizzy)\b/i, label: 'fainting or dizziness' },
  { pattern: /\bpositive pregnancy test\b/i, label: 'pregnancy with symptoms' },
  { pattern: /\b(missed|late)\s+period\b.{0,40}\b(pregnan|test|positive)\b/i, label: 'missed period with possible pregnancy' },
  { pattern: /\b(chest pain|trouble breathing|shortness of breath)\b/i, label: 'emergency symptoms' },
];

const INJECTION_RULES = [
  /\b(ignore|disregard|forget)\b.{0,40}\b(previous|above|system|developer|instructions?)\b/i,
  /\b(reveal|show|print|repeat)\b.{0,40}\b(system prompt|hidden instructions?)\b/i,
  /\b(pretend|act as|roleplay)\b.{0,30}\b(system|developer|unrestricted)\b/i,
];

const sanitizeMessage = (message) => String(message || '')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 2000);

const detectRedFlags = (message) => RED_FLAG_RULES
  .filter((rule) => rule.pattern.test(message))
  .map((rule) => rule.label);

const isPromptInjection = (message) => INJECTION_RULES.some((rule) => rule.test(message));

const medicalAlert = (redFlags) => redFlags.length > 0
  ? `This may need prompt medical attention because it mentions ${redFlags.join(', ')}. Please contact a healthcare professional or local emergency service now, especially if symptoms are worsening.`
  : null;

module.exports = { sanitizeMessage, detectRedFlags, isPromptInjection, medicalAlert };
