# DOUM Technologies — Invoice Hub 🚀

A high-fidelity, pixel-perfect Invoice Generator web application built for **DOUM Technologies & Innovations Private Limited**. 

This application uses a template overlay architecture. It projects dynamic customer data, invoice numbers, service items, and payment details onto the company's high-resolution Canva PDF template design with millimeter-level coordinate precision.

Live Application: **[doum-invoice-generator.netlify.app](https://doum-invoice-generator.netlify.app)**

---

## 🌟 Key Features

- **Canva Coordinate Replication**: Uses a high-resolution 300 DPI conversion of the official Canva invoice PDF (`invoice_template_bg.png`) as the page background.
- **Absolute Coordinate Projection**: Overlays Invoice Number, Order ID, Order Date, Invoice Date, and Billing Address at precise A4 coordinates in `mm`.
- **Dynamic Items Grid**: Hides the template's static table grid with a clean white cover mask and draws a dynamic HTML table on top. Automatically scales row heights and calculates Subtotals and Totals on the fly.
- **UPI QR Code Generation**: Generates a scan-to-pay UPI payment QR Code dynamically based on the active total amount and configured company UPI ID.
- **Dynamic Bank Toggles**: Instantly switch between configured **Axis Bank** and **SBI Bank** account details, covering the pre-printed template details seamlessly.
- **Transparent Stamp & Signatures**: Extracts the high-res circular company seal and overlays it transparently (`seal.png`) on top of the bank details cover box (`zIndex: 15`).
- **System Settings Dashboard**: Manage company details, address, CIN, contact channels, bank account details, and custom order/invoice prefixes directly in the app.
- **LocalStorage Persistence**: Auto-saves invoice counter history and counters (padded 5-digit format starting with `00004` or custom settings). Keeps an invoice history database in the browser.
- **Single-Page PDF Export**: Configured print stylesheets with zero-margins to output a single A4 page PDF matching the Canva layout exactly using `html2pdf.js`.

---

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind CSS
- **Icons**: Lucide React
- **QR Codes**: qrcode.react (SVG rendering)
- **PDF Export**: html2pdf.js (with html2canvas & jsPDF configuration)
- **Persistence**: browser `localStorage`

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Steps to Run
1. Clone this repository to your local machine.
2. Open a terminal in the root folder and install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **`http://localhost:5173/`**.

---

## 🚢 Deployment

The application is deployed to production using **Netlify**. To deploy any future changes:
1. Build the production assets:
   ```bash
   npm run build
   ```
2. Upload the `dist/` folder using Netlify CLI:
   ```bash
   npx netlify deploy --prod --dir=dist
   ```
