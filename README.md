# 📦 TrackHub — B2B Multi-Courier Bulk Tracking Workspace

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**TrackHub** is a high-performance, client-side B2B logistics workspace designed specifically for e-commerce sellers, corporate logistics teams, and online retail aggregators in Indonesia. It allows operators to paste dozens or hundreds of parcel waybills (*nomor resi*) at once, automatically classifies couriers via heuristic regex pattern matching, generates direct official links (including proof-of-delivery photos) alongside zero-captcha mirror fallbacks, and exports interactive reports with active spreadsheet formulas (`=HYPERLINK()`).

---

## ✨ Key Features & Architecture

- **⚡ Zero Server Cost & Instant Processing:** 100% client-side computation. No expensive third-party tracking API subscriptions or rate-limiting bottlenecks.
- **🔍 Heuristic Courier Auto-Detection:** Automatically matches tracking number formats for 11 Indonesian courier networks without manual dropdown selection.
- **🧹 Smart Multi-Line Sanitizer & Deduplication:** Cleans messy copy-pastes from WhatsApp chats, spreadsheets, or text files, stripping extra whitespaces and automatically dropping duplicates with counter badges.
- **🔗 Dual-Action Link & Automatic Clipboard Sync:**
  - **Official Direct Link:** Opens the official courier portal while automatically copying the waybill number to the user's clipboard for instant `Ctrl+V` pasting.
  - **Pos Indonesia Proof-of-Delivery (POD):** Generates direct deeplinks to official PosAja Kibana endpoints displaying recipient photo proof and geolocation timestamps.
  - **Mirror Aggregator Deeplink:** Secondary link to CekResi query-based views for zero-captcha instant checks.
- **🚀 Throttled Batch Tab Launcher:** Select 10–50 waybills and open all tracking tabs sequentially with a 250ms asynchronous throttle to prevent browser popup blockers.
- **📊 Native Excel Spreadsheet Exporter (`.xlsx` & `.csv`):** Generates professional reports where tracking links are formatted as active Excel `=HYPERLINK(url, label)` formulas, clickable directly inside Microsoft Excel, LibreOffice, and Google Sheets.
- **🌐 100% Symmetrical Multi-Locale (`next-intl`):** Complete bilingual interface (Bahasa Indonesia & English) with zero hardcoded UI strings.
- **💾 Local Storage Resilience:** Automatically persists active workspace batches (`trackhub:workspace:v1`) so working data survives accidental page reloads.

---

## 🚚 Supported Courier Networks

| Courier Network | Identifier | Pattern Characteristics | Direct Official Action | Mirror Deeplink |
| :--- | :---: | :--- | :--- | :--- |
| **Pos Indonesia** | `pos` | `P` + 11-13 digits, or 11 digits | Direct POD Photo & Location | CekResi POS |
| **J&T Express** | `jnt` | Starts with `JP`, `JX`, `JB` + digits | Official Portal + Auto-Copy | CekResi JET |
| **SiCepat Ekspres** | `sicepat` | 12 digits starting with `00` | Official Portal + Auto-Copy | CekResi SICEPAT |
| **Shopee Xpress (SPX)** | `spx` | Starts with `SPXID` | Official Portal + Auto-Copy | CekResi SPX |
| **JNE Express** | `jne` | 13-16 alphanumeric characters | Official Portal + Auto-Copy | CekResi JNE |
| **Anteraja** | `anteraja` | 13-14 digits starting with `1000` | Official Portal + Auto-Copy | CekResi ANTERAJA |
| **TIKI** | `tiki` | 12 digits starting with `66` or `03` | Official Portal + Auto-Copy | CekResi TIKI |
| **Wahana Express** | `wahana` | 8 alphanumeric characters | Official Portal + Auto-Copy | CekResi WAHANA |
| **Lion Parcel** | `lion` | Starts with `LP` or `11` | Official Portal + Auto-Copy | CekResi LION |
| **Ninja Xpress** | `ninja` | Starts with `NINJA` or `SHP` | Official Portal + Auto-Copy | CekResi NINJA |
| **ID Express** | `idexpress` | Starts with `IDS` or ends with `ID` | Official Portal + Auto-Copy | CekResi IDE |

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React Server Components)
- **Runtime:** [React 19](https://react.dev/) + [Node.js 22 LTS](https://nodejs.org/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) (Strict Mode, Zero `any`/`unknown`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with `@theme` CSS semantic variables
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) primitives (Button, Card, Textarea, Table, Badge)
- **Table Engine:** [@tanstack/react-table](https://tanstack.com/table/v8) v8
- **Spreadsheet Generation:** [SheetJS (xlsx)](https://sheetjs.com/)
- **Internationalization:** [next-intl](https://next-intl.dev/) v4 (App Router proxy routing)
- **Icons:** [lucide-react](https://lucide.dev/)

---

## 💻 Local Development Setup

### Prerequisites
- Node.js `20.x` or `22.x`
- npm `10.x+` (or pnpm/yarn)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/OctaLectzz/trackhub.git
cd trackhub

# 2. Install dependencies
npm install

# 3. Run development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quality Verification Scripts
```bash
# Typecheck (Strict TypeScript Verification)
npm run typecheck

# Production Build (Turbopack SSG Compilation)
npm run build

# Start Production Server
npm run start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

Developed with precision by **OctaLectzz** for the Indonesian e-commerce & logistics community.
