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

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const DEFAULT_SETTINGS = {
  companyName: 'DOUM TECHNOLOGIES & INNOVATIONS PRIVATE LIMITED',
  companyAddress: '32, CHOWRINGHEE ROAD, OM TOWER, 7TH FLOOR, UNIT NO- 706, PARK STREET KOLKATA-700071',
  companyCin: 'U63122WB2025PTC279262',
  companyPhone: '+91 8910973623',
  companyEmail: 'info@doum.in',
  companyWebsite: 'www.doum.in',
  upiId: 'sohammandal1979@oksbi',
  orderPrefix: 'OD3338195487615',
  invoicePrefix: 'FBF60250002',
  nextOrderVal: 4,
  nextInvoiceVal: 4,
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

const KEY_MAPPING = {
  companyName: 'company_name',
  companyAddress: 'company_address',
  companyCin: 'company_cin',
  companyPhone: 'company_phone',
  companyEmail: 'company_email',
  companyWebsite: 'company_website',
  orderPrefix: 'order_prefix',
  invoicePrefix: 'invoice_prefix',
  nextOrderVal: 'next_order_val',
  nextInvoiceVal: 'next_invoice_val',
  upiId: 'upi_id',
  bankAxisName: 'bank_payee_name',
  bankAxisAccNo: 'bank_acc_no',
  bankAxisIfsc: 'bank_ifsc',
  bankAxisBank: 'bank_name',
  bankAxisBranch: 'bank_branch',
  bankSbiName: 'bank_sbi_name',
  bankSbiAccNo: 'bank_sbi_acc_no',
  bankSbiIfsc: 'bank_sbi_ifsc',
  bankSbiBank: 'bank_sbi_bank',
  bankSbiBranch: 'bank_sbi_branch',
};

// Map DB settings keys (snake_case) to Frontend keys (camelCase)
export function mapDbSettingsToFrontend(dbSettings) {
  const frontendSettings = { ...DEFAULT_SETTINGS };
  Object.entries(KEY_MAPPING).forEach(([feKey, dbKey]) => {
    if (dbSettings[dbKey] !== undefined && dbSettings[dbKey] !== null) {
      frontendSettings[feKey] = dbSettings[dbKey];
    }
  });
  return frontendSettings;
}

// Map Frontend settings keys (camelCase) to DB keys (snake_case)
export function mapFrontendSettingsToDb(frontendSettings) {
  const dbSettings = {};
  Object.entries(KEY_MAPPING).forEach(([feKey, dbKey]) => {
    if (frontendSettings[feKey] !== undefined) {
      dbSettings[dbKey] = String(frontendSettings[feKey]);
    }
  });
  dbSettings['upi_confirmed'] = frontendSettings.upiId ? 'true' : 'false';
  return dbSettings;
}

// Map DB invoice (snake_case) to Frontend invoice (camelCase)
export function mapDbInvoiceToFrontend(dbInv) {
  return {
    id: dbInv.id,
    orderId: dbInv.order_id,
    invoiceNumber: dbInv.invoice_number,
    customerName: dbInv.customer_name,
    billingAddress: dbInv.billing_address,
    orderType: dbInv.order_type,
    orderDate: dbInv.order_date || dbInv.invoice_date,
    invoiceDate: dbInv.invoice_date,
    discountPercent: dbInv.discount_percent || 0,
    bankChoice: dbInv.bank_choice || 'axis',
    subtotal: dbInv.subtotal,
    discountAmount: dbInv.discount_amount,
    total: dbInv.total,
    createdAt: dbInv.created_at,
    items: (dbInv.items || []).map(item => ({
      itemName: item.item_name || item.itemName || '',
      quantity: item.quantity || 0,
      pricePerUnit: item.price_per_unit || item.pricePerUnit || 0
    }))
  };
}

// Map Frontend invoice (camelCase) to DB invoice (snake_case)
export function mapFrontendInvoiceToDb(feInv) {
  return {
    customer_name: feInv.customerName,
    billing_address: feInv.billingAddress,
    order_type: feInv.orderType,
    order_date: feInv.orderDate || feInv.invoiceDate,
    invoice_date: feInv.invoiceDate,
    discount_percent: feInv.discountPercent || 0,
    bank_choice: feInv.bankChoice || 'axis',
    custom_order_id: feInv.orderId,
    custom_invoice_number: feInv.invoiceNumber,
    items: (feInv.items || []).map(item => ({
      item_name: item.itemName,
      quantity: item.quantity,
      price_per_unit: item.pricePerUnit
    }))
  };
}

/**
 * Returns currently saved settings from the backend SQLite DB, falling back to localStorage.
 */
export async function getSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings from server');
    const dbSettings = await res.json();
    return mapDbSettingsToFrontend(dbSettings);
  } catch (err) {
    console.warn('Backend settings unreachable. Falling back to localStorage.', err);
    const stored = localStorage.getItem('doum_settings');
    if (!stored) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
}

/**
 * Persists the given settings object to the backend SQLite DB, falling back to localStorage.
 */
export async function saveSettings(settings) {
  try {
    const dbSettings = mapFrontendSettingsToDb(settings);
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbSettings),
    });
    if (!res.ok) {
      throw new Error('Failed to save settings to server');
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend saveSettings unreachable. Saving to localStorage.', err);
    localStorage.setItem('doum_settings', JSON.stringify(settings));
    return { success: true };
  }
}

/**
 * Returns the next Order ID and Invoice Number from the backend database, falling back to localStorage.
 */
export async function fetchCounters() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/counters`);
    if (!res.ok) throw new Error('Failed to fetch counters');
    const data = await res.json();
    return {
      orderId: data.order_id,
      invoiceNumber: data.invoice_number,
      nextOrderVal: data.next_order_val,
      nextInvoiceVal: data.next_invoice_val,
    };
  } catch (err) {
    console.warn('Backend fetchCounters unreachable. Using localStorage counters.', err);
    const settings = await getSettings();
    const orderCounter = parseInt(localStorage.getItem('doum_order_counter'), 10) || 4;
    const invoiceCounter = parseInt(localStorage.getItem('doum_invoice_counter'), 10) || 4;
    return {
      orderId: `${settings.orderPrefix}${String(orderCounter).padStart(5, '0')}`,
      invoiceNumber: `${settings.invoicePrefix}${String(invoiceCounter).padStart(5, '0')}`,
      nextOrderVal: orderCounter,
      nextInvoiceVal: invoiceCounter,
    };
  }
}

/**
 * Saves an invoice object to the backend SQLite database, falling back to localStorage.
 */
export async function saveInvoice(invoiceData) {
  try {
    const dbInvoice = mapFrontendInvoiceToDb(invoiceData);
    const res = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbInvoice),
    });
    if (!res.ok) {
      throw new Error('Failed to save invoice to server');
    }
    const savedDbInvoice = await res.json();
    return mapDbInvoiceToFrontend(savedDbInvoice);
  } catch (err) {
    console.warn('Backend saveInvoice unreachable. Saving to localStorage.', err);
    
    // Save to localStorage
    const invoices = JSON.parse(localStorage.getItem('doum_invoices') || '[]');
    const newInvoice = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...invoiceData
    };
    invoices.push(newInvoice);
    localStorage.setItem('doum_invoices', JSON.stringify(invoices));
    
    // Increment local counters
    const settings = await getSettings();
    const orderCounter = (parseInt(localStorage.getItem('doum_order_counter'), 10) || settings.nextOrderVal || 4) + 1;
    const invoiceCounter = (parseInt(localStorage.getItem('doum_invoice_counter'), 10) || settings.nextInvoiceVal || 4) + 1;
    localStorage.setItem('doum_order_counter', String(orderCounter));
    localStorage.setItem('doum_invoice_counter', String(invoiceCounter));
    
    return newInvoice;
  }
}

/**
 * Returns all saved invoices from SQLite database, falling back to localStorage.
 */
export async function getInvoices() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/invoices`);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    const dbInvoices = await res.json();
    return dbInvoices.map(mapDbInvoiceToFrontend);
  } catch (err) {
    console.warn('Backend getInvoices unreachable. Loading from localStorage.', err);
    const invoices = JSON.parse(localStorage.getItem('doum_invoices') || '[]');
    return invoices.sort((a, b) => b.id - a.id);
  }
}

/**
 * Deletes an invoice from SQLite database by id, falling back to localStorage.
 */
export async function deleteInvoice(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/invoices/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('Failed to delete invoice');
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend deleteInvoice unreachable. Deleting from localStorage.', err);
    const invoices = JSON.parse(localStorage.getItem('doum_invoices') || '[]');
    const filtered = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('doum_invoices', JSON.stringify(filtered));
    return { success: true };
  }
}

/**
 * Filters invoices by invoice_number or customer_name, falling back to localStorage.
 */
export async function searchInvoices(query) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/invoices?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search invoices');
    const dbInvoices = await res.json();
    return dbInvoices.map(mapDbInvoiceToFrontend);
  } catch (err) {
    console.warn('Backend searchInvoices unreachable. Searching from localStorage.', err);
    if (!query) return getInvoices();
    const q = query.toLowerCase();
    const invoices = JSON.parse(localStorage.getItem('doum_invoices') || '[]');
    return invoices
      .filter(inv => {
        const invoiceNum = (inv.invoiceNumber || '').toLowerCase();
        const customerName = (inv.customerName || '').toLowerCase();
        return invoiceNum.includes(q) || customerName.includes(q);
      })
      .sort((a, b) => b.id - a.id);
  }
}

// ── UPI Payment String ────────────────────────────────────────────────────────

/**
 * Generates a UPI payment URI for the given amount.
 */
export function generateUPIString(amount, settings) {
  const activeSettings = settings || DEFAULT_SETTINGS;
  const encodedName = encodeURIComponent(activeSettings.companyName);
  return `upi://pay?pa=${activeSettings.upiId}&pn=${encodedName}&am=${amount}&cu=INR`;
}
