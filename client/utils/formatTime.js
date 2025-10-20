export default function formatTimeFlexible(input, opts = {}) {
  const { timeZone = 'Asia/Manila', includeDate = true, locale = 'en-PH' } = opts;
  if (input == null) return '';

  let d = null;
  try {
    if (typeof input === 'object' && input) {
      if (input instanceof Date) {
        d = input;
      } else if (typeof input.seconds === 'number') {
        d = new Date(input.seconds * 1000 + Math.floor((input.nanoseconds || 0) / 1e6));
      }
    }
    if (!d) {
      if (typeof input === 'number') {
        d = new Date(input < 1e12 ? input * 1000 : input);
      } else if (typeof input === 'string') {
        const s = input.trim();
        if (/^\d+$/.test(s)) {
          const n = Number(s);
          d = new Date(s.length === 10 ? n * 1000 : n);
        } else {
          const hasTZ = /(?:[zZ]|[+-]\d{2}:?\d{2}|\b(?:GMT|UTC)\b)/.test(s);
          const isoNaive = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)$/;
          const monthNaive = /^(?:[A-Za-z]{3,9})\s+\d{1,2},?\s+\d{4}(?:\s+\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/;
          if (!hasTZ && (isoNaive.test(s) || monthNaive.test(s))) {
            const isoLike = isoNaive.test(s) ? s.replace(' ', 'T') : s;
            d = new Date(isoLike + 'Z');
          } else {
            d = new Date(s);
          }
        }
      }
    }
  } catch { }

  if (!d || isNaN(d)) return String(input);

  const options = includeDate
    ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone }
    : { hour: '2-digit', minute: '2-digit', hour12: true, timeZone };
  return new Intl.DateTimeFormat(locale, options).format(d);
}