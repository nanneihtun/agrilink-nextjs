# 🌾 AgriLink - Agricultural Marketplace

AgriLink is a comprehensive agricultural marketplace platform built with Next.js, connecting farmers, traders, and buyers across Myanmar.

## 🚀 Quick Start

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📚 Documentation

All documentation is organized in the [`docs/`](docs/) folder:

- **[📖 Documentation Hub](docs/README.md)** - Complete documentation index
- **[👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md)** - Setup, architecture, and development guide
- **[🧩 Component Guide](docs/COMPONENT_GUIDE.md)** - Comprehensive component documentation
- **[🚀 Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Neon Database (PostgreSQL)
- **UI Components**: shadcn/ui
- **Authentication**: JWT tokens
- **File Storage**: Base64 encoding in database
- **Deployment**: Vercel

## 🌟 Features

- **Multi-user Marketplace**: Farmers, traders, and buyers
- **Product Management**: Create, edit, and manage agricultural products
- **Real-time Chat**: Direct communication between users
- **Offer System**: Negotiate prices and terms
- **User Verification**: ID and business verification system
- **Price Comparison**: Compare prices across sellers
- **Review System**: Rate and review transactions

## 📁 Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                 # Utilities and database
├── services/           # API services
└── utils/              # Helper functions
```

For detailed project structure, see [Project Structure Guide](docs/PROJECT_STRUCTURE.md).

## 🔧 Development

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [AgriLink Developer Guide](docs/DEVELOPER_GUIDE.md) - comprehensive development guide

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

*AgriLink - Connecting Myanmar's Agricultural Community* 🌾
