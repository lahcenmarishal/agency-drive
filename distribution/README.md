# 🚗 AutoRent Pro — Vehicle Rental Management Software

<p align="center">
  <img src="assets/preview-dashboard.png" alt="AutoRent Pro Dashboard" width="800" />
</p>

---

## ✨ Overview

**AutoRent Pro** is a complete and modern vehicle rental management solution, designed for car rental agencies. Multi-agency, multi-user, with built-in accounting and a license system.

---

## 🎯 Key Features

| Module | Description |
|--------|-------------|
| 🏢 **Multi-Agency** | Centralized management of multiple agencies |
| 🚗 **Fleet** | Vehicle tracking, statuses, documents (insurance, technical inspection, registration card) |
| 👥 **Clients** | Client database with blacklist system |
| 📅 **Reservations** | Reservation management with conversion to rentals |
| 📋 **Rentals** | Rental contracts with payment tracking |
| 💰 **Accounting** | Income, expenses, charts, categories |
| 👨‍✈️ **Drivers** | Driver management and license tracking |
| 👨‍💼 **Employees** | Staff management per agency |
| 🔐 **Authentication** | Role-based system (Super Admin, Admin, Agent) |
| 🌙 **Dark Theme** | Built-in light / dark mode |
| 📱 **Responsive** | Mobile, tablet, and desktop-ready interface |
| 🔑 **License** | Domain-based activation system with server-side verification |

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| **React 18** | Frontend framework |
| **TypeScript** | Static typing |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | UI components |
| **Supabase** | Backend (PostgreSQL, Auth, Edge Functions) |
| **TanStack Query** | Data management & caching |
| **Recharts** | Charts and visualizations |
| **React Router** | SPA navigation |
| **Vite** | Ultra-fast build tool |

---

## 📁 Package Structure

```
AutoRent-Pro-v1.0/
├── 📁 app/                  # Full source code
│   ├── src/                 # React/TypeScript sources
│   ├── public/              # Static assets
│   ├── supabase/            # Edge Functions
│   └── package.json
├── 📁 docs/                 # Documentation
│   ├── INSTALLATION.md
│   ├── CONFIGURATION.md
│   ├── ACTIVATION.md
│   ├── DEPLOYMENT.md
│   └── FAQ.md
├── 📁 database/             # SQL Schema
│   └── schema.sql
├── 📁 assets/               # Screenshots
├── 📄 README.md             # This file
├── 📄 LICENSE.txt           # Commercial license
├── 📄 CHANGELOG.md          # Version history
└── 📄 SUPPORT.txt           # Support contact
```

---

## ⚡ Quick Start

```bash
cd app/
npm install
cp .env.example .env
# Configure your Supabase keys in .env
npm run dev
```

📖 Full guide: [`docs/INSTALLATION.md`](docs/INSTALLATION.md)

---

## 📸 Screenshots

| Dashboard | Vehicles | Accounting |
|-----------|----------|------------|
| ![Dashboard](assets/preview-dashboard.png) | ![Vehicles](assets/preview-vehicles.png) | ![Accounting](assets/preview-accounting.png) |

---

## 📄 License

This product is distributed under a commercial license. See [`LICENSE.txt`](LICENSE.txt) for details.

**One license = one domain.**

---

## 💬 Support

📧 See [`SUPPORT.txt`](SUPPORT.txt) to contact us.

---

<p align="center">
  Made with ❤️ for vehicle rental agencies
</p>
