import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import { query } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to convert images to base64 for embedding in PDF HTML
function getBase64Image(filename) {
  const filePath = path.join(__dirname, 'assets', filename);
  if (fs.existsSync(filePath)) {
    const fileBuffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  }
  console.warn(`Asset not found: ${filePath}`);
  return '';
}

// Convert numbers to Indian Rupees in Words
function numberToWords(num) {
  if (num === 0) return 'Zero Rupees only';
  
  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThanOneThousand = (n) => {
    if (n === 0) return '';
    let str = '';
    if (n >= 100) {
      str += a[Math.floor(n / 100)] + ' Hundred';
      n %= 100;
      if (n > 0) str += ' and ';
    }
    if (n >= 20) {
      str += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += a[n] + ' ';
    }
    return str.trim();
  };

  let rupee = Math.floor(num);
  let paise = Math.round((num - rupee) * 100);
  
  let rupeeStr = '';
  
  // Crores
  if (rupee >= 10000000) {
    rupeeStr += convertLessThanOneThousand(Math.floor(rupee / 10000000)) + ' Crore ';
    rupee %= 10000000;
  }
  // Lakhs
  if (rupee >= 100000) {
    rupeeStr += convertLessThanOneThousand(Math.floor(rupee / 100000)) + ' Lakh ';
    rupee %= 100000;
  }
  // Thousands
  if (rupee >= 1000) {
    rupeeStr += convertLessThanOneThousand(Math.floor(rupee / 1000)) + ' Thousand ';
    rupee %= 1000;
  }
  // Hundreds & units
  if (rupee > 0) {
    rupeeStr += convertLessThanOneThousand(rupee);
  }
  
  rupeeStr = rupeeStr.trim() + ' Rupees';
  
  let paiseStr = '';
  if (paise > 0) {
    paiseStr = ' and ' + convertLessThanOneThousand(paise) + ' Paise';
  }
  
  return rupeeStr + paiseStr + ' only';
}

// Format number to INR currency representation
function formatCurrency(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return '₹ 0.00';
  
  // Format with Indian locale and 2 decimal places
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `₹ ${formatted}`;
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// GET all settings
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await query.all('SELECT * FROM settings');
    const settingsMap = {};
    rows.forEach(r => {
      // Parse boolean values
      if (r.key === 'upi_confirmed') {
        settingsMap[r.key] = r.value === 'true';
      } else {
        settingsMap[r.key] = r.value;
      }
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST update settings
app.post('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      const stringValue = String(value);
      await query.run(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [key, stringValue, stringValue]
      );
    }
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET current counters (formatted to 5-digit padding)
app.get('/api/counters', async (req, res) => {
  try {
    const orderPrefix = (await query.get("SELECT value FROM settings WHERE key = 'order_prefix'"))?.value || 'OD333819548761';
    const invoicePrefix = (await query.get("SELECT value FROM settings WHERE key = 'invoice_prefix'"))?.value || 'FBF602500';
    
    const nextOrderVal = parseInt((await query.get("SELECT value FROM settings WHERE key = 'next_order_val'"))?.value || '4', 10);
    const nextInvoiceVal = parseInt((await query.get("SELECT value FROM settings WHERE key = 'next_invoice_val'"))?.value || '4', 10);
    
    const paddedOrder = String(nextOrderVal).padStart(5, '0');
    const paddedInvoice = String(nextInvoiceVal).padStart(5, '0');
    
    res.json({
      order_id: `${orderPrefix}${paddedOrder}`,
      invoice_number: `${invoicePrefix}${paddedInvoice}`,
      next_order_val: nextOrderVal,
      next_invoice_val: nextInvoiceVal
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all invoices (with search filter)
app.get('/api/invoices', async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    let rows;
    if (searchQuery) {
      rows = await query.all(
        `SELECT * FROM invoices 
         WHERE invoice_number LIKE ? 
         OR customer_name LIKE ? 
         OR invoice_date LIKE ? 
         ORDER BY id DESC`,
        [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]
      );
    } else {
      rows = await query.all('SELECT * FROM invoices ORDER BY id DESC');
    }
    
    // Parse items JSON
    const invoices = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items)
    }));
    
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create invoice
app.post('/api/invoices', async (req, res) => {
  const {
    customer_name,
    billing_address,
    order_type,
    invoice_date,
    items,
    discount_percent = 0,
    custom_order_id = '',
    custom_invoice_number = ''
  } = req.body;

  if (!customer_name || !billing_address || !order_type || !invoice_date || !items || !items.length) {
    return res.status(400).json({ error: 'Missing required invoice fields.' });
  }

  try {
    // 1. Calculate values
    let subtotal = 0;
    const sanitizedItems = items.map(item => {
      const qty = parseInt(item.quantity, 10) || 0;
      const price = parseFloat(item.price_per_unit) || 0;
      subtotal += qty * price;
      return {
        item_name: item.item_name,
        quantity: qty,
        price_per_unit: price
      };
    });

    const discPercent = parseFloat(discount_percent) || 0;
    const discountAmount = subtotal * (discPercent / 100);
    const total = subtotal - discountAmount;

    // 2. Determine Order ID and Invoice Number
    let orderId = custom_order_id;
    let invoiceNumber = custom_invoice_number;
    let incrementCounters = false;

    if (!orderId || !invoiceNumber) {
      incrementCounters = true;
      const orderPrefix = (await query.get("SELECT value FROM settings WHERE key = 'order_prefix'"))?.value || 'OD333819548761';
      const invoicePrefix = (await query.get("SELECT value FROM settings WHERE key = 'invoice_prefix'"))?.value || 'FBF602500';
      
      const nextOrderVal = parseInt((await query.get("SELECT value FROM settings WHERE key = 'next_order_val'"))?.value || '4', 10);
      const nextInvoiceVal = parseInt((await query.get("SELECT value FROM settings WHERE key = 'next_invoice_val'"))?.value || '4', 10);
      
      if (!orderId) {
        orderId = `${orderPrefix}${String(nextOrderVal).padStart(5, '0')}`;
      }
      if (!invoiceNumber) {
        invoiceNumber = `${invoicePrefix}${String(nextInvoiceVal).padStart(5, '0')}`;
      }
    }

    // 3. Save to database
    const result = await query.run(
      `INSERT INTO invoices (order_id, invoice_number, customer_name, billing_address, order_type, invoice_date, items, discount_percent, subtotal, discount_amount, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        invoiceNumber,
        customer_name,
        billing_address,
        order_type,
        invoice_date,
        JSON.stringify(sanitizedItems),
        discPercent,
        subtotal,
        discountAmount,
        total
      ]
    );

    // 4. Increment counters in DB if we used the auto-generated ones
    if (incrementCounters) {
      const nextOrderVal = parseInt((await query.get("SELECT value FROM settings WHERE key = 'next_order_val'"))?.value || '4', 10);
      const nextInvoiceVal = parseInt((await query.get("SELECT value FROM settings WHERE key = 'next_invoice_val'"))?.value || '4', 10);
      
      await query.run("UPDATE settings SET value = ? WHERE key = 'next_order_val'", [String(nextOrderVal + 1)]);
      await query.run("UPDATE settings SET value = ? WHERE key = 'next_invoice_val'", [String(nextInvoiceVal + 1)]);
    }

    const newInvoice = {
      id: result.lastID,
      order_id: orderId,
      invoice_number: invoiceNumber,
      customer_name,
      billing_address,
      order_type,
      invoice_date,
      items: sanitizedItems,
      discount_percent: discPercent,
      subtotal,
      discount_amount: discountAmount,
      total
    };

    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET HTML Invoice preview or render HTML code
// GET HTML Invoice preview or render HTML code
async function generateInvoiceHTML(invoice, settings, forceDebug = false) {
  // Load template coordinates dynamically on each call for live calibration adjustments
  const coordinatesPath = path.join(__dirname, 'config', 'templateCoordinates.json');
  let templateCoordinates = {};
  try {
    templateCoordinates = JSON.parse(fs.readFileSync(coordinatesPath, 'utf8'));
  } catch (err) {
    console.error('Error loading templateCoordinates.json:', err);
  }

  const isDebugMode = forceDebug || process.env.DEBUG_TEMPLATE === 'true';
  const templateBgBase64 = getBase64Image('invoice_template_bg.png');

  // Format date DD-MM-YYYY
  let formattedDate = invoice.invoice_date;
  try {
    const d = new Date(invoice.invoice_date);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      formattedDate = `${day}-${month}-${year}`;
    }
  } catch (e) {}

  // Generate QR code if VPA is confirmed and exists
  let qrCodeDataURL = '';
  if (settings.upi_confirmed && settings.upi_id) {
    const upiLink = `upi://pay?pa=${settings.upi_id}&pn=DOUM%20TECHNOLOGIES&am=${invoice.total.toFixed(2)}&cu=INR`;
    try {
      qrCodeDataURL = await QRCode.toDataURL(upiLink, { margin: 1, width: 150 });
    } catch (err) {
      console.error('Failed to generate UPI QR code:', err);
    }
  }

  // Construct items rows
  const itemsRows = invoice.items.map((item, idx) => `
    <tr>
      <td class="cell-center" style="font-weight: 500;">${idx + 1}</td>
      <td class="cell-left" style="font-weight: 500;">${item.item_name}</td>
      <td class="cell-center" style="font-weight: 500;">${item.quantity}</td>
      <td class="cell-right" style="font-weight: 500;">${formatCurrency(item.price_per_unit)}</td>
      <td class="cell-right" style="font-weight: 600;">${formatCurrency(item.quantity * item.price_per_unit)}</td>
    </tr>
  `).join('');

  // Discount row
  const discountRow = invoice.discount_percent > 0 ? `
    <tr class="discount-row">
      <td class="cell-center"></td>
      <td class="cell-left" style="color: #e53e3e; font-weight: 500;">Discount (-${invoice.discount_percent}%)</td>
      <td class="cell-center"></td>
      <td class="cell-right"></td>
      <td class="cell-right" style="color: #e53e3e; font-weight: 600;">-${formatCurrency(invoice.discount_amount)}</td>
    </tr>
  ` : '';

  const amountInWords = numberToWords(invoice.total);

  // Helper for inline overlays style & debug tags
  const getOverlay = (key, label, valueHtml) => {
    const coords = templateCoordinates[key];
    if (!coords) {
      console.warn(`No coordinates found for key: ${key}`);
      return `<!-- Error: coordinates for ${key} not found -->`;
    }
    
    let style = `position: absolute; left: ${coords.left}mm; top: ${coords.top}mm; `;
    if (coords.width) style += `width: ${coords.width}mm; `;
    if (coords.height) style += `height: ${coords.height}mm; `;
    
    if (isDebugMode) {
      style += `border: 1.2px solid red; box-sizing: border-box; background-color: rgba(255, 0, 0, 0.05); `;
    }
    
    const debugTag = isDebugMode 
      ? `<div style="position: absolute; top: -3.5mm; left: 0; font-size: 6.5px; line-height: 1; color: red; background: #ffffff; border: 0.5px solid red; padding: 0.2mm 0.8mm; font-family: monospace; z-index: 9999; white-space: nowrap;">[${label}] (${coords.left}, ${coords.top})</div>`
      : '';
      
    return `
      <div style="${style}">
        ${debugTag}
        ${valueHtml}
      </div>
    `;
  };

  // Compile final overlays
  const invoiceNumberOverlay = getOverlay(
    'invoiceNumber', 
    'Invoice Number', 
    `<div style="width: 100%; height: 100%; background-color: transparent; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: flex-start; padding-left: 1mm; box-sizing: border-box;"># ${invoice.invoice_number}</div>`
  );

  const orderTypeOverlay = getOverlay(
    'orderType', 
    'Order Type', 
    `<div style="width: 100%; height: 100%; background-color: transparent; font-size: 10px; font-weight: 500; display: flex; align-items: center; padding-left: 1mm; box-sizing: border-box;">${invoice.order_type}</div>`
  );

  const orderIdOverlay = getOverlay(
    'orderId', 
    'Order ID', 
    `<div style="width: 100%; height: 100%; background-color: transparent; font-size: 10px; font-weight: 500; display: flex; align-items: center; padding-left: 1mm; box-sizing: border-box;">${invoice.order_id}</div>`
  );

  const orderDateOverlay = getOverlay(
    'orderDate', 
    'Order Date', 
    `<div style="width: 100%; height: 100%; background-color: transparent; font-size: 10px; font-weight: 500; display: flex; align-items: center; padding-left: 1mm; box-sizing: border-box;">${formattedDate}</div>`
  );

  const invoiceDateOverlay = getOverlay(
    'invoiceDate', 
    'Invoice Date', 
    `<div style="width: 100%; height: 100%; background-color: transparent; font-size: 10px; font-weight: 500; display: flex; align-items: center; padding-left: 1mm; box-sizing: border-box;">${formattedDate}</div>`
  );

  const billingAddressOverlay = getOverlay(
    'customerNameAddress', 
    'Customer Details', 
    `
      <div style="width: 100%; height: 100%; background-color: transparent; font-size: 10px; line-height: 1.4; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start; padding-left: 1mm; box-sizing: border-box;">
        <div style="font-weight: 700; color: #003464; margin-bottom: 0.8mm;">Billing Address:</div>
        <div style="font-weight: 700; color: #000; margin-bottom: 0.8mm;">${invoice.customer_name}</div>
        <div style="color: #333; white-space: pre-line;">${invoice.billing_address}</div>
      </div>
    `
  );

  const tableOverlay = getOverlay(
    'serviceTable', 
    'Service Table', 
    `
      <table class="invoice-table-body" style="width: 100%; border-collapse: collapse; table-layout: fixed;">
        <colgroup>
          <col style="width: 6.5%;" />
          <col style="width: 53.5%;" />
          <col style="width: 12%;" />
          <col style="width: 14%;" />
          <col style="width: 14%;" />
        </colgroup>
        <tbody>
          ${itemsRows}
          ${discountRow}
        </tbody>
      </table>
    `
  );

  const subtotalOverlay = getOverlay(
    'subtotal', 
    'Sub Total', 
    `
      <div style="width: 100%; height: 100%; background-color: transparent; font-size: 11px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; padding-right: 1.5mm; box-sizing: border-box; color: #000;">
        <span style="font-weight: 500; color: #333;">Sub Total</span>
        <span>${formatCurrency(invoice.subtotal)}</span>
      </div>
    `
  );

  // Total amount goes into the blue box, so no background mask, white text color!
  const totalOverlay = getOverlay(
    'total', 
    'Total Amount', 
    `
      <div style="width: 100%; height: 100%; color: #ffffff; font-size: 11.5px; font-weight: 700; display: flex; align-items: center; justify-content: space-between; padding-left: 2mm; padding-right: 1.5mm; box-sizing: border-box;">
        <span>Total</span>
        <span>${formatCurrency(invoice.total)}</span>
      </div>
    `
  );

  const amountInWordsOverlay = getOverlay(
    'amountInWords', 
    'Amount In Words', 
    `<div style="width: 100%; height: 100%; background-color: transparent; font-size: 9.5px; font-weight: 600; line-height: 1.35; color: #000; display: flex; align-items: center; justify-content: flex-start; box-sizing: border-box; padding-left: 1mm;">${amountInWords}</div>`
  );

  let qrContentHtml = '';
  if (settings.upi_confirmed && settings.upi_id && qrCodeDataURL) {
    qrContentHtml = `
      <div style="width: 100%; height: 100%; background-color: #ffffff; display: flex; align-items: center; justify-content: center; box-sizing: border-box; padding: 1mm;">
        <img src="${qrCodeDataURL}" style="width: 25mm; height: 25mm;" />
      </div>
    `;
  } else {
    // If UPI ID is unconfirmed, completely mask the old QR area and show unconfirmed placeholder
    qrContentHtml = `
      <div style="width: 100%; height: 100%; background-color: #ffffff; display: flex; align-items: center; justify-content: center; flex-direction: column; border: 0.5px dashed #cbd5e1; padding: 2mm; box-sizing: border-box;">
        <div style="font-size: 7.5px; font-weight: 700; color: #64748b; text-align: center; text-transform: uppercase; line-height: 1.3;">QR Code Pending</div>
        <div style="font-size: 6.5px; font-weight: 500; color: #94a3b8; text-align: center; margin-top: 2px;">VPA Confirmation</div>
      </div>
    `;
  }
  const qrCodeOverlay = getOverlay('qrCode', 'QR Code Box', qrContentHtml);

  // Return full HTML string matching Canva template styles
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Invoice - ${invoice.invoice_number}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @page {
          size: A4;
          margin: 0;
        }

        body {
          font-family: 'Outfit', sans-serif;
          color: #000;
          background-image: url(${templateBgBase64});
          background-size: 210mm 297mm;
          background-repeat: no-repeat;
          background-position: center;
          width: 210mm;
          height: 297mm;
          position: relative;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Invoice Table Body cell styles */
        .invoice-table-body td {
          padding: 5.5px 8px;
          font-size: 10px;
          line-height: 1.3;
          vertical-align: middle;
          border-bottom: 0.8px solid #e2e8f0;
        }

        .invoice-table-body tr:last-child td {
          border-bottom: none;
        }

        .invoice-table-body .discount-row td {
          padding-top: 7px;
          padding-bottom: 7px;
          border-bottom: none;
        }

        .cell-center {
          text-align: center;
        }

        .cell-left {
          text-align: left;
        }

        .cell-right {
          text-align: right;
        }

        /* Debug Mode Ruler Grid lines (if debug is enabled) */
        ${isDebugMode ? `
          .debug-grid-h {
            position: absolute;
            left: 0;
            right: 0;
            height: 0.2px;
            background: rgba(255, 0, 0, 0.15);
            pointer-events: none;
          }
          .debug-grid-v {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 0.2px;
            background: rgba(255, 0, 0, 0.15);
            pointer-events: none;
          }
          .debug-grid-label {
            position: absolute;
            font-size: 5px;
            color: rgba(255, 0, 0, 0.4);
            font-family: monospace;
          }
        ` : ''}
      </style>
    </head>
    <body>
      <!-- Dynamic Overlays -->
      ${invoiceNumberOverlay}
      ${orderTypeOverlay}
      ${orderIdOverlay}
      ${orderDateOverlay}
      ${invoiceDateOverlay}
      ${billingAddressOverlay}
      ${tableOverlay}
      ${subtotalOverlay}
      ${totalOverlay}
      ${amountInWordsOverlay}
      ${qrCodeOverlay}

      <!-- Debug Grid Helper (only drawn when DEBUG_TEMPLATE=true) -->
      ${isDebugMode ? (() => {
        let gridHtml = '';
        // Horizontal lines every 20mm
        for (let y = 20; y < 297; y += 20) {
          gridHtml += `
            <div class="debug-grid-h" style="top: ${y}mm; z-index: 9998;"></div>
            <div class="debug-grid-label" style="top: ${y}mm; left: 2mm; z-index: 9998;">H ${y}mm</div>
          `;
        }
        // Vertical lines every 20mm
        for (let x = 20; x < 210; x += 20) {
          gridHtml += `
            <div class="debug-grid-v" style="left: ${x}mm; z-index: 9998;"></div>
            <div class="debug-grid-label" style="top: 2mm; left: ${x}mm; z-index: 9998;">V ${x}mm</div>
          `;
        }
        return gridHtml;
      })() : ''}
    </body>
    </html>
  `;
}

// Route to get invoice HTML preview directly
app.post('/api/invoices/preview', async (req, res) => {
  const invoiceData = req.body;
  try {
    // Fetch settings
    const rows = await query.all('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => {
      if (r.key === 'upi_confirmed') {
        settings[r.key] = r.value === 'true';
      } else {
        settings[r.key] = r.value;
      }
    });

    const html = await generateInvoiceHTML(invoiceData, settings, req.query.debug === 'true' || invoiceData.debug === 'true');
    res.send(html);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to download PDF
app.get('/api/invoices/:id/pdf', async (req, res) => {
  const invoiceId = req.params.id;
  try {
    // 1. Fetch invoice
    const invoiceRow = await query.get('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    if (!invoiceRow) {
      return res.status(404).json({ error: 'Invoice not found.' });
    }
    
    const invoice = {
      ...invoiceRow,
      items: JSON.parse(invoiceRow.items)
    };

    // 2. Fetch settings
    const rows = await query.all('SELECT * FROM settings');
    const settings = {};
    rows.forEach(r => {
      if (r.key === 'upi_confirmed') {
        settings[r.key] = r.value === 'true';
      } else {
        settings[r.key] = r.value;
      }
    });

    // 3. Generate HTML
    const htmlContent = await generateInvoiceHTML(invoice, settings, req.query.debug === 'true');

    // 4. Launch puppeteer and print to PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    // Print PDF with A4 settings and margins
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      }
    });

    await browser.close();

    // 5. Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoice_number}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start backend server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
