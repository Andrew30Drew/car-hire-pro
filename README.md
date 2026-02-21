# 🚗 CarHirePro Enterprise

**CarHirePro Enterprise** is a sophisticated, full-stack car rental management system designed for corporate luxury and high-performance logistics. Built with the latest web technologies, it offers a seamless experience for both customers and fleet administrators.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## ✨ Key Features

### 🏢 Corporate Dashboard (Admin)
- **Fleet Control Center**: Full CRUD (Create, Read, Update, Delete) operations for vehicle inventory.
- **Order Management**: Review system-wide reservations, approve (Confirm), or reject orders.
- **Analytics View**: Real-time monitoring of fleet status and system-wide revenue.
- **Asset Registration**: Integrated image upload and detailed vehicle categorization.

### 👤 Member Experience (Users)
- **Self-Service Booking**: Dynamic reservation engine with real-time price calculation based on daily rates and duration.
- **Reservation Ledger**: View personal booking history with real-time status updates (Pending, Confirmed, Cancelled).
- **Modify & Cancel**: Empowerment to adjust reservation dates or cancel bookings directly from the profile.
- **Premium UI**: Glassmorphic interface with dark mode optimization and fluid micro-animations.

### 🔐 Security & Infrastructure
- **RBAC (Role-Based Access Control)**: Strict permission boundaries between 'Admin' and 'User' roles.
- **JWT Authentication**: Secure stateless authentication using `JOSE` and cross-component session management.
- **Data Integrity**: Optimized MongoDB aggregation pipelines for performant car-booking relational lookups.
- **Responsive Architecture**: Fully optimized for Desktop, Tablet, and Mobile workflows.

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Runtime**: [React 19](https://react.dev/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Native Driver)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Auth**: [JOSE](https://github.com/panva/jose) (JWT) & [BcryptJS](https://github.com/dcodeIO/bcrypt.js)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- MongoDB instance (Cloud or Local)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Andrew30Drew/car-hire-pro.git
   cd car-hire-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_ultra_secure_secret
   ```

4. **Run in Development Mode**
   ```bash
   npm run dev
   ```

---

## 📁 Project Structure

```text
src/
├── app/              # Next.js App Router (Pages & API Routes)
│   ├── admin/        # Fleet & Booking Management
│   ├── api/          # Stateless Backend Endpoints
│   ├── login/        # Authentication Flow
│   ├── profile/      # User Management UI
│   └── page.tsx      # Corporate Landing Page
├── components/       # Reusable UI Components
├── lib/              # Core Utilities (Auth, DB Client)
├── models/           # Data Interface Definitions
└── styles/           # Global CSS and Tailwind Config
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Built with pride by [Andrew30Drew](https://github.com/Andrew30Drew)**
