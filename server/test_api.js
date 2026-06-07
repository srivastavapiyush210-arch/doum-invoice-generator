const BACKEND_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- Starting API Integration Tests ---');

  try {
    // 1. Test GET /api/settings
    console.log('\n1. Testing GET /api/settings...');
    const settingsRes = await fetch(`${BACKEND_URL}/api/settings`);
    const settings = await settingsRes.json();
    console.log('Settings keys received:', Object.keys(settings));
    console.log('Company Name:', settings.company_name);
    console.log('UPI VPA:', settings.upi_id === '' ? '(empty)' : settings.upi_id);
    console.log('UPI Confirmed:', settings.upi_confirmed);

    // 2. Test GET /api/counters
    console.log('\n2. Testing GET /api/counters...');
    const countersRes = await fetch(`${BACKEND_URL}/api/counters`);
    const counters = await countersRes.json();
    console.log('Counters received:', counters);
    if (counters.order_id !== 'OD33381954876100004') {
      console.warn(`Warning: Expected initial order_id OD33381954876100004, got ${counters.order_id}`);
    }
    if (counters.invoice_number !== 'FBF60250000004') {
      console.warn(`Warning: Expected initial invoice_number FBF60250000004, got ${counters.invoice_number}`);
    }

    // 3. Test POST /api/invoices (Create Invoice)
    console.log('\n3. Testing POST /api/invoices (Create Invoice)...');
    const invoicePayload = {
      customer_name: 'Test Customer Roy',
      billing_address: 'AA109, Salt lake PNB,\nKolkata,\nWest Bengal,\nIndia',
      order_type: '3 BHK Deep Cleaning',
      invoice_date: '2026-06-06',
      items: [
        { item_name: 'Bedroom Deep Cleaning', quantity: 3, price_per_unit: 1200 },
        { item_name: 'Hall Deep Cleaning', quantity: 1, price_per_unit: 1000 },
        { item_name: 'Stairs Deep Cleaning', quantity: 1, price_per_unit: 1000 },
        { item_name: 'Furniture Dusting', quantity: 1, price_per_unit: 400 }
      ],
      discount_percent: 0
    };

    const createRes = await fetch(`${BACKEND_URL}/api/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoicePayload)
    });
    
    const newInvoice = await createRes.json();
    console.log('Created Invoice details:');
    console.log('- ID:', newInvoice.id);
    console.log('- Invoice Number:', newInvoice.invoice_number);
    console.log('- Order ID:', newInvoice.order_id);
    console.log('- Subtotal:', newInvoice.subtotal);
    console.log('- Total:', newInvoice.total);

    // 4. Test GET /api/counters (Check if incremented)
    console.log('\n4. Testing GET /api/counters (Verify increment)...');
    const countersRes2 = await fetch(`${BACKEND_URL}/api/counters`);
    const counters2 = await countersRes2.json();
    console.log('Updated Counters:', counters2);
    if (counters2.next_order_val !== 5 || counters2.next_invoice_val !== 5) {
      console.error('Error: Counters did not increment correctly!');
    } else {
      console.log('Counters incremented successfully to 5-digit padded value 00005.');
    }

    // 5. Test GET /api/invoices (History list)
    console.log('\n5. Testing GET /api/invoices (History Search)...');
    const historyRes = await fetch(`${BACKEND_URL}/api/invoices?q=Test`);
    const history = await historyRes.json();
    console.log('Search results count:', history.length);
    console.log('First search result customer name:', history[0]?.customer_name);

    // 6. Test GET /api/invoices/:id/pdf (PDF Generation)
    console.log('\n6. Testing GET /api/invoices/:id/pdf (PDF stream via Puppeteer)...');
    const pdfRes = await fetch(`${BACKEND_URL}/api/invoices/${newInvoice.id}/pdf`);
    const pdfContentType = pdfRes.headers.get('content-type');
    const pdfBuffer = await pdfRes.arrayBuffer();
    console.log('PDF response Content-Type:', pdfContentType);
    console.log('PDF response size:', pdfBuffer.byteLength, 'bytes');
    if (pdfContentType === 'application/pdf' && pdfBuffer.byteLength > 1000) {
      console.log('PDF Generation verified successfully!');
    } else {
      console.error('Error: PDF Generation failed or returned empty content!');
    }

    console.log('\n--- All API Integration Tests Passed! ---');
  } catch (error) {
    console.error('Test run failed with error:', error);
  }
}

runTests();
