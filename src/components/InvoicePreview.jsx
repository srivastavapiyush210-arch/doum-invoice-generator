import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency, numberToWords, generateUPIString, getSettings } from '../utils';

export default function InvoicePreview({ data, settings, previewRef }) {
  if (!data) return null;

  const activeSettings = settings || getSettings();

  const {
    customerName,
    billingAddress,
    orderType,
    orderDate,
    invoiceDate,
    orderId,
    invoiceNumber,
    items = [],
    discountPercent = 0,
    bankChoice = 'axis',
  } = data;

  // Calculations
  const subtotal = items.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10) || 0;
    const price = parseFloat(item.pricePerUnit) || 0;
    return sum + qty * price;
  }, 0);

  const discountAmount = subtotal * ((parseFloat(discountPercent) || 0) / 100);
  const total = subtotal - discountAmount;
  const totalQty = items.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
  const amountInWords = numberToWords(total);
  const upiString = generateUPIString(total.toFixed(2));

  const bank = bankChoice === 'sbi' ? {
    companyName: activeSettings.bankSbiName,
    accNo: activeSettings.bankSbiAccNo,
    ifsc: activeSettings.bankSbiIfsc,
    bank: activeSettings.bankSbiBank,
    branch: activeSettings.bankSbiBranch,
  } : {
    companyName: activeSettings.bankAxisName,
    accNo: activeSettings.bankAxisAccNo,
    ifsc: activeSettings.bankAxisIfsc,
    bank: activeSettings.bankAxisBank,
    branch: activeSettings.bankAxisBranch,
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="invoice-page"
      ref={previewRef}
      id="invoice-preview"
      style={{
        width: '210mm',
        height: '295mm',
        backgroundColor: '#ffffff',
        position: 'relative',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
        color: '#000',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
    >
      {/* 1. HIGH RESOLUTION BACKGROUND IMAGE */}
      <img
        src="/invoice_template_bg.png"
        alt="Invoice Template Background"
        style={{
          width: '210mm',
          height: '295mm',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      />

      {/* 2. OVERLAYS */}
      {/* Invoice Number */}
      <div style={{
        position: 'absolute',
        left: '173.98mm',
        top: '18.3mm',
        width: '26.3mm',
        height: '4.0mm',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '8.5px',
        fontWeight: '700',
        color: '#000',
        zIndex: 10,
        whiteSpace: 'nowrap',
      }}>
        # {invoiceNumber}
      </div>

      {/* Order Info Left Column (Covers and replaces all labels & values for alignment) */}
      <div style={{
        position: 'absolute',
        left: '6.96mm',
        top: '46.8mm',
        width: '52.0mm',
        height: '24.5mm',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontSize: '9.8px',
        color: '#000',
        zIndex: 10,
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ display: 'flex', gap: '1mm' }}>
          <strong>Order Type:</strong>
          <span style={{ fontWeight: 500 }}>{orderType || '-'}</span>
        </div>
        <div style={{ display: 'flex', gap: '1mm' }}>
          <strong>Order ID:</strong>
          <span style={{ fontWeight: 500 }}>{orderId}</span>
        </div>
        <div style={{ display: 'flex', gap: '1mm' }}>
          <strong>Order Date:</strong>
          <span style={{ fontWeight: 500 }}>{formatDate(orderDate)}</span>
        </div>
        <div style={{ display: 'flex', gap: '1mm' }}>
          <strong>Invoice Date:</strong>
          <span style={{ fontWeight: 500 }}>{formatDate(invoiceDate)}</span>
        </div>
      </div>

      {/* Customer Name & Billing Address */}
      <div style={{
        position: 'absolute',
        left: '64.49mm',
        top: '51.8mm',
        width: '90.0mm',
        height: '25.0mm',
        fontSize: '9.8px',
        lineHeight: '1.4',
        color: '#000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        boxSizing: 'border-box',
        zIndex: 10,
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{ fontWeight: '700', color: '#000', marginBottom: '0.6mm' }}>{customerName || 'Customer Name'}</div>
        <div style={{ color: '#333', whiteSpace: 'pre-line' }}>{billingAddress || 'Billing Address'}</div>
      </div>

      {/* 3. DYNAMIC MIDDLE SECTION: TABLE & SUMMARIES */}
      {/* This white container covers the pre-printed empty table grid of the template */}
      <div style={{
        position: 'absolute',
        left: '9.8mm',
        top: '89.0mm',
        width: '190.4mm',
        minHeight: '67.0mm',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        zIndex: 5,
        paddingLeft: '1.82mm',
        paddingRight: '2.09mm',
        paddingTop: '3.0mm',
        fontFamily: "'Outfit', sans-serif",
      }}>
        {/* Dynamic Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '6.5%' }} />
            <col style={{ width: '53.5%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead>
            <tr style={{ background: '#0C2340', color: '#ffffff' }}>
              <th style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'center', fontWeight: '600', border: '1px solid #0C2340' }}>#</th>
              <th style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'left', fontWeight: '600', border: '1px solid #0C2340' }}>Item name</th>
              <th style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'center', fontWeight: '600', border: '1px solid #0C2340' }}>Quantity</th>
              <th style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'right', fontWeight: '600', border: '1px solid #0C2340' }}>Price/ unit</th>
              <th style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'right', fontWeight: '600', border: '1px solid #0C2340' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'center', fontWeight: 500, border: '1px solid #cbd5e1', color: '#000' }}>{idx + 1}</td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'left', fontWeight: 500, border: '1px solid #cbd5e1', color: '#000' }}>{item.itemName || '-'}</td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'center', fontWeight: 500, border: '1px solid #cbd5e1', color: '#000' }}>{item.quantity}</td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'right', fontWeight: 500, border: '1px solid #cbd5e1', color: '#000' }}>{formatCurrency(item.pricePerUnit)}</td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'right', fontWeight: 600, border: '1px solid #cbd5e1', color: '#000' }}>{formatCurrency(item.quantity * item.pricePerUnit)}</td>
              </tr>
            ))}
            {parseFloat(discountPercent) > 0 && (
              <tr className="discount-row">
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'center', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'left', color: '#16a34a', fontWeight: 500, border: '1px solid #cbd5e1' }}>Discount (-{discountPercent}%)</td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'center', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'right', border: '1px solid #cbd5e1' }}></td>
                <td style={{ padding: '5.5px 8px', fontSize: '9px', textAlign: 'right', color: '#16a34a', fontWeight: 600, border: '1px solid #cbd5e1' }}>-{formatCurrency(discountAmount)}</td>
              </tr>
            )}
            {/* Total Row */}
            <tr style={{ background: '#f8fafc', fontWeight: '700' }}>
              <td style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'center', border: '1px solid #cbd5e1' }}></td>
              <td style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'left', border: '1px solid #cbd5e1', color: '#000' }}>Total</td>
              <td style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'center', border: '1px solid #cbd5e1', color: '#000' }}>{totalQty}</td>
              <td style={{ padding: '6px 8px', fontSize: '9.5px', border: '1px solid #cbd5e1' }}></td>
              <td style={{ padding: '6px 8px', fontSize: '9.5px', textAlign: 'right', border: '1px solid #cbd5e1', color: '#000' }}>{formatCurrency(total)}</td>
            </tr>
          </tbody>
        </table>

        {/* Amount in words & Totals blocks */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', gap: '15px' }}>
          {/* Words Block */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '8.2px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estimate Amount In Words</div>
            <div style={{ fontSize: '9.8px', fontWeight: '600', color: '#000', marginTop: '2px', lineHeight: '1.35' }}>{amountInWords}</div>
          </div>
          
          {/* Totals Block */}
          <div style={{ width: '180px', textAlign: 'right' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '3px 0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Sub Total</span>
              <span style={{ fontWeight: '600', color: '#000' }}>{formatCurrency(subtotal)}</span>
            </div>
            {parseFloat(discountPercent) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', padding: '3px 0', borderBottom: '1px solid #e2e8f0', color: '#16a34a' }}>
                <span>Discount ({discountPercent}%)</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.2px', fontWeight: '700', padding: '5px 8px', background: '#0C2340', color: '#ffffff', marginTop: '3px' }}>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM DYNAMIC OVERLAYS */}
      {/* UPI QR Code */}
      <div style={{
        position: 'absolute',
        left: '8.0mm',
        top: '205.0mm',
        width: '25.0mm',
        height: '33.0mm',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 10,
        boxSizing: 'border-box',
        fontFamily: "'Outfit', sans-serif",
      }}>
        {activeSettings.upiId ? (
          <>
            <QRCodeSVG
              value={upiString}
              size={80}
              style={{ width: '21.0mm', height: '21.0mm' }}
              level="M"
              includeMargin={false}
            />
            <div style={{ 
              fontSize: '5.8px', 
              color: '#555', 
              marginTop: '1.5mm', 
              textAlign: 'center', 
              fontWeight: '700', 
              lineHeight: 1.1,
              width: '100%',
              whiteSpace: 'nowrap',
            }}>
              UPI: {activeSettings.upiId}
            </div>
          </>
        ) : (
          <div style={{
            width: '100%',
            height: '21.0mm',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            border: '0.5px dashed #cbd5e1',
            padding: '1mm',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#64748b', textAlign: 'center', lineHeight: '1.2' }}>QR Code Pending</div>
          </div>
        )}
      </div>

      {/* Bank Details Box (covers static Axis text and renders selected bank details) */}
      <div style={{
        position: 'absolute',
        left: '33.0mm',
        top: '205.0mm',
        width: '92.0mm',
        height: '33.0mm',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        zIndex: 10,
        paddingLeft: '1.0mm',
        fontFamily: "'Outfit', sans-serif",
      }}>
        <div style={{
          fontSize: '8.5px',
          lineHeight: '1.45',
          color: '#333',
        }}>
          <div style={{ fontWeight: '700', color: '#0C2340', fontSize: '10.0px', marginBottom: '2.5px' }}>Pay To:</div>
          <div><strong>Company Name:</strong> {bank.companyName}</div>
          <div><strong>Acc No. :</strong> {bank.accNo}</div>
          <div><strong>IFSC:</strong> {bank.ifsc}</div>
          <div><strong>Bank:</strong> {bank.bank}</div>
          <div><strong>Branch:</strong> {bank.branch}</div>
        </div>
      </div>

      {/* Transparent Company Seal Image overlay (Commented out to prevent duplication since it is already pre-printed on the background template image) */}
      {/* 
      <img
        src="/seal.png"
        alt="Company Seal"
        style={{
          position: 'absolute',
          left: '87.21mm',
          top: '240.43mm',
          width: '30.63mm',
          height: '30.91mm',
          zIndex: 15,
          pointerEvents: 'none',
        }}
      />
      */}
    </div>
  );
}
