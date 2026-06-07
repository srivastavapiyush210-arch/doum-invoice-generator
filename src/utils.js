// ── Number-to-Words (Indian English with Rupees / Paise) ──────────────────────

const ones = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty',
  'Ninety',
];

/**
 * Convert an integer (0 – 99) to words.
 */
function twoDigitWords(n) {
  if (n < 20) return ones[n];
  const t = tens[Math.floor(n / 10)];
  const o = ones[n % 10];
  return o ? `${t} ${o}` : t;
}

/**
 * Convert an integer to Indian-English words
 * (Crore → Lakh → Thousand → Hundred).
 */
function intToWords(num) {
  if (num === 0) return 'Zero';

  let words = '';

  // Crores (1,00,00,000+)
  if (num >= 10000000) {
    words += intToWords(Math.floor(num / 10000000)) + ' Crore';
    num %= 10000000;
  }

  // Lakhs (1,00,000 – 99,99,999)
  if (num >= 100000) {
    words += (words ? ' ' : '') + intToWords(Math.floor(num / 100000)) + ' Lakh';
    num %= 100000;
  }

  // Thousands (1,000 – 99,999)
  if (num >= 1000) {
    words += (words ? ' ' : '') + intToWords(Math.floor(num / 1000)) + ' Thousand';
    num %= 1000;
  }

  // Hundreds (100 – 999)
  if (num >= 100) {
    words += (words ? ' ' : '') + ones[Math.floor(num / 100)] + ' Hundred';
    num %= 100;
  }

  // Remaining two digits
  if (num > 0) {
    words += (words ? ' and ' : '') + twoDigitWords(num);
  }

  return words;
}

/**
 * Converts a number to Indian-English words with Rupees and optional Paise.
 *
 * Examples:
 *   999      → "Nine Hundred and Ninety Nine Rupees only"
 *   3297     → "Three Thousand Two Hundred and Ninety Seven Rupees only"
 *   15000    → "Fifteen Thousand Rupees only"
 *   150000   → "One Lakh Fifty Thousand Rupees only"
 *   1500000  → "Fifteen Lakh Rupees only"
 *   10000000 → "One Crore Rupees only"
 *   999.50   → "Nine Hundred and Ninety Nine Rupees and Fifty Paise only"
 */
export function numberToWords(num) {
  if (num === undefined || num === null || isNaN(num)) return '';

  const rupees = Math.floor(Math.abs(num));
  const paise = Math.round((Math.abs(num) - rupees) * 100);

  let result = '';

  if (rupees > 0) {
    result += intToWords(rupees) + ' Rupees';
  } else {
    result += 'Zero Rupees';
  }

  if (paise > 0) {
    result += ' and ' + intToWords(paise) + ' Paise';
  }

  result += ' only';
  return result;
}

// ── Currency Formatter ────────────────────────────────────────────────────────

/**
 * Formats a number to Indian currency string: ₹ 1,899.00
 */
export function formatCurrency(val) {
  const num = Number(val);
  if (isNaN(num)) return '₹ 0.00';

  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `₹ ${formatted}`;
}

// ── Settings Configuration and Persistence ───────────────────────────────────

const ORDER_COUNTER_KEY = 'doum_order_counter';
const INVOICE_COUNTER_KEY = 'doum_invoice_counter';

const DEFAULT_SETTINGS = {
  companyName: 'DOUM TECHNOLOGIES & INNOVATIONS PRIVATE LIMITED',
  companyAddress: '32, CHOWRINGHEE ROAD, OM TOWER, 7TH FLOOR, UNIT NO- 706, PARK STREET KOLKATA-700071',
  companyCin: 'U63122WB2025PTC279262',
  companyPhone: '+91 8910973623',
  companyEmail: 'info@doum.in',
  companyWebsite: 'www.doum.in',
  upiId: 'sohammandal1979@oksbi',
  orderPrefix: 'OD3338195487615',
  invoicePrefix: 'FBF60250002',
  bankAxisName: 'DOUM & TECHNOLOGIES INNOVATIONS PVT. LTD.',
  bankAxisAccNo: '925020025783209',
  bankAxisIfsc: 'UTIB0002783',
  bankAxisBank: 'Axis Bank',
  bankAxisBranch: 'Metropolitan Branch',
  bankSbiName: 'Soham Mandal',
  bankSbiAccNo: '41259528848',
  bankSbiIfsc: 'SBIN0010092',
  bankSbiBank: 'STATE BANK OF INDIA',
  bankSbiBranch: 'BANKURA TOWN BRANCH',
};

/**
 * Returns currently saved settings or the default values.
 */
export function getSettings() {
  const stored = localStorage.getItem('doum_settings');
  if (!stored) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(stored);
    let updated = false;
    if (parsed.orderPrefix === 'OD333819548761') {
      parsed.orderPrefix = 'OD3338195487615';
      updated = true;
    }
    if (parsed.invoicePrefix === 'FBF6025000') {
      parsed.invoicePrefix = 'FBF60250002';
      updated = true;
    }
    if (updated) {
      localStorage.setItem('doum_settings', JSON.stringify(parsed));
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Persists the given settings object to localStorage.
 */
export function saveSettings(settings) {
  localStorage.setItem('doum_settings', JSON.stringify(settings));
}

// ── Order / Invoice ID Helpers ────────────────────────────────────────────────

/**
 * Returns the next Order ID without incrementing the counter.
 * Format: [Prefix][5-digit padded counter]
 */
export function getNextOrderId() {
  const settings = getSettings();
  const counter = parseInt(localStorage.getItem(ORDER_COUNTER_KEY), 10) || 4;
  return `${settings.orderPrefix}${String(counter).padStart(5, '0')}`;
}

/**
 * Returns the next Invoice Number without incrementing the counter.
 * Format: [Prefix][5-digit padded counter]
 */
export function getNextInvoiceNumber() {
  const settings = getSettings();
  const counter = parseInt(localStorage.getItem(INVOICE_COUNTER_KEY), 10) || 4;
  return `${settings.invoicePrefix}${String(counter).padStart(5, '0')}`;
}

/**
 * Increments both order and invoice counters in localStorage.
 */
export function incrementCounters() {
  const orderCounter =
    (parseInt(localStorage.getItem(ORDER_COUNTER_KEY), 10) || 4) + 1;
  const invoiceCounter =
    (parseInt(localStorage.getItem(INVOICE_COUNTER_KEY), 10) || 4) + 1;

  localStorage.setItem(ORDER_COUNTER_KEY, String(orderCounter));
  localStorage.setItem(INVOICE_COUNTER_KEY, String(invoiceCounter));
}

// ── Invoice Persistence ───────────────────────────────────────────────────────

const INVOICES_KEY = 'doum_invoices';

/**
 * Saves an invoice object to the localStorage array `doum_invoices`.
 * Appends to the existing array.
 */
export function saveInvoice(invoiceData) {
  const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
  invoices.push(invoiceData);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

/**
 * Returns all saved invoices sorted by `id` descending.
 */
export function getInvoices() {
  const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
  return invoices.sort((a, b) => b.id - a.id);
}

/**
 * Deletes an invoice from local storage by id.
 */
export function deleteInvoice(id) {
  const invoices = JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]');
  const filtered = invoices.filter(inv => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(filtered));
}

/**
 * Filters invoices by `invoice_number` or `customer_name` (case-insensitive).
 */
export function searchInvoices(query) {
  if (!query) return getInvoices();

  const q = query.toLowerCase();
  return getInvoices().filter((inv) => {
    const invoiceNum = (inv.invoiceNumber || '').toLowerCase();
    const customerName = (inv.customerName || '').toLowerCase();
    return invoiceNum.includes(q) || customerName.includes(q);
  });
}

// ── UPI Payment String ────────────────────────────────────────────────────────

/**
 * Generates a UPI payment URI for the given amount.
 */
export function generateUPIString(amount) {
  const settings = getSettings();
  const encodedName = encodeURIComponent(settings.companyName);
  return `upi://pay?pa=${settings.upiId}&pn=${encodedName}&am=${amount}&cu=INR`;
}
