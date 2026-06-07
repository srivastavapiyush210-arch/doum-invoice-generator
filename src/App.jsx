import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FilePlus, History, Plus, Trash2, Download, Copy, Search,
  CheckCircle2, AlertCircle, FileText, TrendingUp, Eye, X, Settings
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { createRoot } from 'react-dom/client';
import InvoicePreview from './components/InvoicePreview';
import {
  getNextOrderId, getNextInvoiceNumber, incrementCounters,
  saveInvoice, getInvoices, searchInvoices, formatCurrency,
  getSettings, saveSettings
} from './utils';

function App() {
  const [currentTab, setCurrentTab] = useState('create');
  const [searchQuery, setSearchQuery] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [toast, setToast] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef(null);

  // Settings State
  const [settings, setSettings] = useState(getSettings());
  const [settingsForm, setSettingsForm] = useState(getSettings());

  // Form state
  const [form, setForm] = useState({
    customerName: '',
    billingAddress: '',
    orderType: '',
    orderDate: new Date().toISOString().split('T')[0],
    invoiceDate: new Date().toISOString().split('T')[0],
    discountPercent: 0,
    bankChoice: 'axis',
    items: [{ itemName: '', quantity: 1, pricePerUnit: 0 }],
  });

  // Counters
  const [orderId, setOrderId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    refreshCounters();
    loadInvoices();
  }, []);

  const refreshCounters = () => {
    setOrderId(getNextOrderId());
    setInvoiceNumber(getNextInvoiceNumber());
  };

  const loadInvoices = () => {
    setInvoices(getInvoices());
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSettingsTab = () => {
    const s = getSettings();
    setSettings(s);
    setSettingsForm(s);
    setCurrentTab('settings');
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSettings(settingsForm);
    setSettings(settingsForm);
    refreshCounters();
    showToast('Settings saved successfully!');
  };

  // Form handlers
  const updateField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { itemName: '', quantity: 1, pricePerUnit: 0 }],
    }));
  };

  const removeItem = (index) => {
    if (form.items.length <= 1) return;
    setForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const resetForm = () => {
    setForm({
      customerName: '',
      billingAddress: '',
      orderType: '',
      orderDate: new Date().toISOString().split('T')[0],
      invoiceDate: new Date().toISOString().split('T')[0],
      discountPercent: 0,
      bankChoice: 'axis',
      items: [{ itemName: '', quantity: 1, pricePerUnit: 0 }],
    });
  };

  // Calculations
  const subtotal = form.items.reduce((sum, item) => {
    return sum + (parseInt(item.quantity, 10) || 0) * (parseFloat(item.pricePerUnit) || 0);
  }, 0);
  const discountAmount = subtotal * ((parseFloat(form.discountPercent) || 0) / 100);
  const total = subtotal - discountAmount;

  // Build preview data
  const previewData = {
    ...form,
    orderId,
    invoiceNumber,
  };

  // Generate PDF
  const generatePDF = useCallback(async () => {
    if (!form.customerName || !form.billingAddress || !form.orderType || !form.items.some(i => i.itemName)) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      const element = previewRef.current;
      if (!element) {
        showToast('Preview not ready', 'error');
        return;
      }

      const opt = {
        margin: 0,
        filename: `Invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
      };

      await html2pdf().set(opt).from(element).save();

      // Save invoice to history
      const invoiceData = {
        id: Date.now(),
        ...form,
        orderId,
        invoiceNumber,
        subtotal,
        discountAmount,
        total,
        createdAt: new Date().toISOString(),
      };
      saveInvoice(invoiceData);
      incrementCounters();
      refreshCounters();
      loadInvoices();
      resetForm();

      showToast(`Invoice ${invoiceNumber} generated successfully!`);
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Failed to generate PDF: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, [form, orderId, invoiceNumber, subtotal, discountAmount, total]);

  // Re-download from history
  const redownloadPDF = useCallback(async (invoice) => {
    setIsGenerating(true);
    try {
      // Temporarily set form to invoice data for preview
      const tempPreviewData = { ...invoice };

      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Render invoice preview into temp container
      const root = createRoot(container);

      await new Promise((resolve) => {
        root.render(
          <InvoicePreview data={tempPreviewData} settings={settings} previewRef={null} />
        );
        setTimeout(resolve, 500);
      });

      const element = container.querySelector('.invoice-page');
      if (!element) {
        throw new Error('Could not render invoice');
      }

      const opt = {
        margin: 0,
        filename: `Invoice-${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
      root.unmount();
      document.body.removeChild(container);
      showToast(`PDF re-downloaded: ${invoice.invoiceNumber}`);
    } catch (err) {
      console.error('Re-download error:', err);
      showToast('Failed to re-download: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Duplicate invoice
  const duplicateInvoice = (invoice) => {
    setForm({
      customerName: invoice.customerName,
      billingAddress: invoice.billingAddress,
      orderType: invoice.orderType,
      orderDate: new Date().toISOString().split('T')[0],
      invoiceDate: new Date().toISOString().split('T')[0],
      discountPercent: invoice.discountPercent || 0,
      bankChoice: invoice.bankChoice || 'axis',
      items: invoice.items.map(item => ({ ...item })),
    });
    setCurrentTab('create');
    showToast('Invoice duplicated — ready for new number');
  };

  // Search
  const filteredInvoices = searchQuery ? searchInvoices(searchQuery) : invoices;

  // Stats
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ===== SIDEBAR ===== */}
      <div className="w-64 min-h-screen flex flex-col glass-card rounded-none border-r border-white/5"
        style={{ background: 'rgba(15, 23, 42, 0.95)' }}>

        <div className="p-6 border-b border-white/5">
          <h1 className="text-2xl font-bold text-white tracking-wider">DOUM</h1>
          <p className="text-xs text-slate-500 mt-1 tracking-widest uppercase">Invoice Hub</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setCurrentTab('create')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent
              ${currentTab === 'create' ? 'tab-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <FilePlus size={18} /> Create Invoice
          </button>
          <button
            onClick={() => { setCurrentTab('history'); loadInvoices(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent
              ${currentTab === 'history' ? 'tab-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <History size={18} /> Invoice History
          </button>
          <button
            onClick={loadSettingsTab}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent
              ${currentTab === 'settings' ? 'tab-active' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-slate-600 text-center">DOUM Technologies © {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '100vh' }}>
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-2xl font-bold text-white">
            {currentTab === 'create' ? 'Generate Invoice' : currentTab === 'history' ? 'Invoice History' : 'System Settings'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {currentTab === 'create'
              ? 'Fill the form to generate a professional PDF invoice'
              : currentTab === 'history'
              ? `${invoices.length} invoices generated • Total: ${formatCurrency(totalRevenue)}`
              : 'Configure default company information, invoice prefixes, and bank details'}
          </p>
        </div>

        {/* Stats row */}
        <div className="px-8 pb-4 grid grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Invoices</p>
            <div className="flex items-center gap-3 mt-2">
              <FileText size={20} className="text-blue-400" />
              <span className="text-xl font-bold text-white">{invoices.length}</span>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Revenue</p>
            <div className="flex items-center gap-3 mt-2">
              <TrendingUp size={20} className="text-emerald-400" />
              <span className="text-lg font-bold text-white">{formatCurrency(totalRevenue)}</span>
            </div>
          </div>
          <div className="glass-card p-4 rounded-xl">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Next Invoice</p>
            <div className="flex items-center gap-3 mt-2">
              <Eye size={20} className="text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">{invoiceNumber}</span>
            </div>
          </div>
        </div>

        {/* ===== CREATE TAB ===== */}
        {currentTab === 'create' && (
          <div className="px-8 pb-8 flex gap-6">
            {/* FORM PANEL */}
            <div className="w-[420px] flex-shrink-0 space-y-5">
              <div className="glass-card p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-white font-semibold text-sm">Invoice Details</h3>
                  <div className="text-xs text-slate-500">
                    Order: <span className="text-blue-400 font-mono">{orderId}</span>
                  </div>
                </div>

                {/* Customer Name */}
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Customer Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Mr. Abhishek Sonkar"
                    value={form.customerName}
                    onChange={e => updateField('customerName', e.target.value)}
                  />
                </div>

                {/* Billing Address */}
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Billing Address *</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="14CA Swarnamani Apts, 33A Canal Circular Road,&#10;Kolkata - 700054&#10;West Bengal, India"
                    value={form.billingAddress}
                    onChange={e => updateField('billingAddress', e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Order Type */}
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Order Type *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 3 BHK Deep Cleaning"
                    value={form.orderType}
                    onChange={e => updateField('orderType', e.target.value)}
                  />
                </div>

                {/* Date Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Order Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.orderDate}
                      onChange={e => updateField('orderDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Invoice Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={form.invoiceDate}
                      onChange={e => updateField('invoiceDate', e.target.value)}
                    />
                  </div>
                </div>

                {/* Discount + Bank */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Discount %</label>
                    <input
                      type="number"
                      className="input-field"
                      placeholder="0"
                      min="0"
                      max="100"
                      value={form.discountPercent}
                      onChange={e => updateField('discountPercent', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Bank Account</label>
                    <div className="flex gap-2 mt-1">
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="bank"
                          value="axis"
                          checked={form.bankChoice === 'axis'}
                          onChange={() => updateField('bankChoice', 'axis')}
                          className="accent-blue-500"
                        />
                        Axis
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="bank"
                          value="sbi"
                          checked={form.bankChoice === 'sbi'}
                          onChange={() => updateField('bankChoice', 'sbi')}
                          className="accent-blue-500"
                        />
                        SBI
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* SERVICE ITEMS */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-white font-semibold text-sm">Service Items</h3>
                  <button onClick={addItem} className="btn-secondary text-xs !py-1.5 !px-3">
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {form.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      {index === 0 && <label className="text-xs text-slate-500 mb-1 block">Item Name</label>}
                      <input
                        type="text"
                        className="input-field text-xs !py-2"
                        placeholder="Bedroom Deep Cleaning"
                        value={item.itemName}
                        onChange={e => updateItem(index, 'itemName', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      {index === 0 && <label className="text-xs text-slate-500 mb-1 block">Qty</label>}
                      <input
                        type="number"
                        className="input-field text-xs !py-2 text-center"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      {index === 0 && <label className="text-xs text-slate-500 mb-1 block">Price (₹)</label>}
                      <input
                        type="number"
                        className="input-field text-xs !py-2"
                        min="0"
                        step="0.01"
                        value={item.pricePerUnit}
                        onChange={e => updateItem(index, 'pricePerUnit', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 flex justify-end">
                      {index === 0 && <label className="text-xs text-slate-500 mb-1 block">&nbsp;</label>}
                      <button
                        onClick={() => removeItem(index)}
                        className="btn-danger !p-2"
                        disabled={form.items.length <= 1}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Live totals */}
                <div className="border-t border-white/5 pt-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  {parseFloat(form.discountPercent) > 0 && (
                    <div className="flex justify-between text-sm text-red-400">
                      <span>Discount ({form.discountPercent}%)</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base text-white font-bold">
                    <span>Total</span>
                    <span className="text-emerald-400">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={resetForm} className="btn-secondary flex-1">
                  <X size={16} /> Clear
                </button>
                <button
                  onClick={generatePDF}
                  className="btn-success flex-1"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Generate PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PREVIEW PANEL */}
            <div className="flex-1 flex flex-col items-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Live Preview</div>
              <div
                className="shadow-2xl border border-white/10 rounded-lg overflow-hidden"
                style={{
                  transform: 'scale(0.72)',
                  transformOrigin: 'top center',
                  marginBottom: '-200px',
                }}
              >
                <InvoicePreview data={previewData} settings={settings} previewRef={previewRef} />
              </div>
            </div>
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {currentTab === 'history' && (
          <div className="px-8 pb-8">
            {/* Search */}
            <div className="glass-card p-4 rounded-xl mb-6">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  className="input-field !pl-12"
                  placeholder="Search by invoice number, customer name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Invoice list */}
            <div className="glass-card rounded-xl overflow-hidden">
              {filteredInvoices.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No invoices found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left text-xs text-slate-500 font-medium p-4 uppercase tracking-wider">Invoice #</th>
                      <th className="text-left text-xs text-slate-500 font-medium p-4 uppercase tracking-wider">Customer</th>
                      <th className="text-left text-xs text-slate-500 font-medium p-4 uppercase tracking-wider">Date</th>
                      <th className="text-right text-xs text-slate-500 font-medium p-4 uppercase tracking-wider">Amount</th>
                      <th className="text-center text-xs text-slate-500 font-medium p-4 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map(inv => (
                      <tr key={inv.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                        <td className="p-4">
                          <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2.5 py-1 rounded-md">
                            {inv.invoiceNumber}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-200 font-medium">{inv.customerName}</td>
                        <td className="p-4 text-sm text-slate-400">{inv.invoiceDate}</td>
                        <td className="p-4 text-sm text-amber-400 font-bold text-right">{formatCurrency(inv.total)}</td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => redownloadPDF(inv)}
                              className="btn-secondary !py-1.5 !px-2.5 text-xs"
                              title="Re-download PDF"
                              disabled={isGenerating}
                            >
                              <Download size={14} />
                            </button>
                            <button
                              onClick={() => duplicateInvoice(inv)}
                              className="btn-secondary !py-1.5 !px-2.5 text-xs"
                              title="Duplicate"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ===== SETTINGS TAB ===== */}
        {currentTab === 'settings' && (
          <div className="px-8 pb-8 max-w-4xl">
            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Company Details */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-white font-semibold text-base border-b border-white/5 pb-2">Company Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Company Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.companyName}
                      onChange={e => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">CIN</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.companyCin}
                      onChange={e => setSettingsForm({ ...settingsForm, companyCin: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Address</label>
                  <input
                    type="text"
                    className="input-field"
                    value={settingsForm.companyAddress}
                    onChange={e => setSettingsForm({ ...settingsForm, companyAddress: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Phone</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.companyPhone}
                      onChange={e => setSettingsForm({ ...settingsForm, companyPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
                    <input
                      type="email"
                      className="input-field"
                      value={settingsForm.companyEmail}
                      onChange={e => setSettingsForm({ ...settingsForm, companyEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Website</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.companyWebsite}
                      onChange={e => setSettingsForm({ ...settingsForm, companyWebsite: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Prefixes & Payments */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-white font-semibold text-base border-b border-white/5 pb-2">Invoice Prefixes & Payments</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Order Prefix</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.orderPrefix}
                      onChange={e => setSettingsForm({ ...settingsForm, orderPrefix: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Invoice Prefix</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.invoicePrefix}
                      onChange={e => setSettingsForm({ ...settingsForm, invoicePrefix: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">UPI ID</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.upiId}
                      onChange={e => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Axis Bank Details */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-white font-semibold text-base border-b border-white/5 pb-2">Bank Details - Axis Bank</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Account Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankAxisName}
                      onChange={e => setSettingsForm({ ...settingsForm, bankAxisName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Account Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankAxisAccNo}
                      onChange={e => setSettingsForm({ ...settingsForm, bankAxisAccNo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">IFSC Code</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankAxisIfsc}
                      onChange={e => setSettingsForm({ ...settingsForm, bankAxisIfsc: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Bank Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankAxisBank}
                      onChange={e => setSettingsForm({ ...settingsForm, bankAxisBank: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Branch Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankAxisBranch}
                      onChange={e => setSettingsForm({ ...settingsForm, bankAxisBranch: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* SBI Details */}
              <div className="glass-card p-6 rounded-xl space-y-4">
                <h3 className="text-white font-semibold text-base border-b border-white/5 pb-2">Bank Details - State Bank of India</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Account Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankSbiName}
                      onChange={e => setSettingsForm({ ...settingsForm, bankSbiName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Account Number</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankSbiAccNo}
                      onChange={e => setSettingsForm({ ...settingsForm, bankSbiAccNo: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">IFSC Code</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankSbiIfsc}
                      onChange={e => setSettingsForm({ ...settingsForm, bankSbiIfsc: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Bank Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankSbiBank}
                      onChange={e => setSettingsForm({ ...settingsForm, bankSbiBank: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium mb-1.5 block">Branch Name</label>
                    <input
                      type="text"
                      className="input-field"
                      value={settingsForm.bankSbiBranch}
                      onChange={e => setSettingsForm({ ...settingsForm, bankSbiBranch: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('create')}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-success">
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ===== TOAST ===== */}
      {toast && (
        <div
          className={`fixed top-6 right-6 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl z-50 toast-enter
            ${toast.type === 'error'
              ? 'bg-red-500/90 text-white'
              : 'bg-emerald-500/90 text-white'}`}
          style={{ backdropFilter: 'blur(12px)' }}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
