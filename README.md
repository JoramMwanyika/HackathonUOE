# 🌾 AgriTwin — A Digital Farm Twin and Voice-Enabled Farming Assistant

**AgriTwin** is a digital farm twin platform and voice-enabled farming assistant designed specifically for African smallholder farmers. It provides real-time farm insights, daily recommendations, task management support, and a visual simulation of land to empower farmers to make informed decisions and manage their land more effectively.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Azure AI](https://img.shields.io/badge/Azure-AI%20Services-0078D4?style=flat-square&logo=microsoft-azure)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=flat-square&logo=three.js&logoColor=white)

---

## 📖 1. Introduction / Background
Agriculture remains the primary livelihood for millions of people across Africa, yet most smallholder farmers still rely on guesswork when making decisions about irrigation, crop selection, soil treatment, and daily farm operations. Access to agricultural experts is limited, farm data is rarely collected in a structured way, and farmers often lack a clear overview of how different sections of their land are performing.

Climate variability, soil degradation, and rising input costs further increase the difficulty of making informed decisions. While modern digital farming tools exist, they are often expensive, complex, or designed for large-scale farms rather than African smallholders.

**AgriTwin** is proposed as a digital farming assistant that gives farmers real-time insights, daily guidance, and a visual simulation of their farm so they can manage it proactively rather than reactively.

## ⚠️ 2. Problem Statement
African farmers often lack timely and localized agricultural guidance based on the actual condition of their land. Soil quality, moisture levels, and productivity vary across different portions of the farm, yet farmers typically treat the land as one uniform space. This leads to inefficient irrigation, poor crop management, and uneven productivity.

In addition, many farmers struggle to monitor the progress of their farms, coordinate workers effectively, and follow up on tasks such as planting, spraying, irrigation, or harvesting. Without a structured system, work is often delayed or poorly assigned, affecting overall output.

There is therefore a strong need for a digital solution that can act as a daily farming assistant — one that understands the condition of each part of the farm, provides timely recommendations, helps coordinate farm activities, and allows the farmer to visualize and simulate farm operations in one place.

## 🎯 3. Project Objectives

**General Objective**
To develop a digital farm twin platform that provides African farmers with real-time farm insights, daily recommendations, task management support, and a visual simulation of their land.

**Specific Objectives**
- To monitor soil health across different farm sections.
- To provide farmers with daily personalized farming recommendations.
- To help farmers assign and track farm tasks efficiently.
- To create a visual simulation of the farm showing progress and risks.
- To improve farm productivity through data-driven decision-making.

## 💡 4. Proposed Solution
**AgriTwin** is a digital farm assistant platform that combines data collection, farm simulation, and daily advisory support.

The system collects farm data from sensors, farmer inputs, and stored farm records to understand soil health, water conditions, and crop progress. Based on this data, the platform generates daily recommendations each morning, guiding farmers on irrigation, planting, treatment, or monitoring actions required for each portion of the farm.

A core feature of AgriTwin is the **Digital Farm Twin**, a visual model that represents the farmer’s land as a structured grid showing each section’s condition, progress, and risks. This allows farmers to see how their farm is performing as a whole rather than relying on memory or observation alone.

The platform also includes a task management system where farmers can assign responsibilities to workers, track progress, and receive reminders, improving coordination and accountability on the farm.

**Voice interaction** ensures accessibility, allowing farmers to receive spoken recommendations and alerts even if they have limited literacy or prefer hands-free interaction.

## ✨ 5. Key Features
- **Digital Farm Twin**: Visualization of land sections using an interactive 3D simulation.
- **Daily Recommendations**: Morning farming guidance tailored to farm data.
- **Soil Health Monitoring & Alerts**: Real-time tracking of soil conditions with proactive warnings.
- **Task Assignment & Tracking**: A coordinated system for farm task management.
- **Voice-Enabled Assistant**: Accessible voice guidance and updates (Speech-to-Text & Text-to-Speech) supporting African languages.
- **Data Dashboard**: Centralized view of farm progress and performance.
- **Mobile Payment Integration**: Support for PayHero (M-Pesa) for market services.

## 👥 6. Target Beneficiaries
- Smallholder farmers in Africa
- Youth engaged in agribusiness
- Farmer cooperatives and groups
- Agricultural extension officers
- Digital agriculture initiatives and NGOs

## 📏 7. Scope of the Project
The initial implementation will focus on crop farming and basic soil monitoring. The system will provide farm simulation, daily advisory support, and task coordination tools. Future phases may include livestock integration, predictive analytics, and market linkage features.

## 📅 8. Methodology / Implementation Plan
The project will be executed in phases:
- **Phase 1**: Requirement analysis and system design
- **Phase 2**: Development of database and farm data structure
- **Phase 3**: Implementation of digital farm twin simulation
- **Phase 4**: Integration of voice interaction and advisory logic
- **Phase 5**: User interface development and testing
- **Phase 6**: Pilot testing with farmers and refinement

## 📈 9. Expected Outcomes
- Improved farmer decision-making through real-time insights.
- Increased productivity from better soil and task management.
- Reduced crop losses due to early alerts and monitoring.
- Greater adoption of digital agriculture tools.
- Improved coordination between farmers and farm workers.

## 🌱 10. Sustainability and Impact
AgriTwin can operate through partnerships with agricultural organizations, subscription services for advanced features, and integrations with cooperatives and development programs. By providing farmers with actionable data and clear farm visibility, the platform contributes to food security, climate resilience, and modernization of African agriculture.

## ✅ 11. Conclusion
AgriTwin offers a practical and scalable approach to improving African agriculture by turning farms into data-driven systems. Through continuous monitoring, daily recommendations, task coordination, and visual simulation, the platform empowers farmers to make informed decisions and manage their land more effectively. This solution has the potential to transform smallholder farming into a more productive, resilient, and sustainable sector.

---

## 🛠️ Technology Stack

AgriTwin is built using a modern full-stack architecture designed for scalability and accessibility.

**Core Platform**
- **Framework**: [Next.js 16](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: PostgreSQL via [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

**Farm Simulation**
- Logic-driven digital twin using crop lifecycle models.
- Rules-based health engine based on soil and sensor thresholds.
- Structured farm grid showing section performance.
- Data seeded for demonstration but designed for IoT syncing.

**Voice & Accessibility**
- Voice interaction powered by **Microsoft Azure Speech services**.
- Speech-to-Text for commands.
- Text-to-Speech for spoken guidance.
- Support for African languages.

**3D Visualization & Interface**
- Interactive farm simulation using **Three.js**.
- Low-poly farm assets and grid visualization.
- **Tailwind CSS**-based responsive UI.
- Charts and analytics dashboards.

**Payments & Integrations**
- Mobile payments via **PayHero** (M-Pesa support).
- Backend logic via Next.js API routes.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18+
- **PostgreSQL**: Installed locally or via a cloud provider (e.g., Supabase, Neon, Render).
- **Azure Account**: For AI speech services ([Sign up](https://azure.microsoft.com/free/))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JoramMwanyika/AgriTwin-AI.git
   cd AgriTwin-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` to include your Azure keys, Database URL, NextAuth secret, and PayHero credentials.

---

## 🗄️ Database Setup Guide

AgriTwin uses **PostgreSQL** in combination with **Prisma ORM** for robust related data storage. Follow these steps to set up your database:

### 1. Configure the Database Connection
In your `.env.local` (or `.env`) file, set the `DATABASE_URL` to point to your PostgreSQL database.
Example format:
```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public"
```
*(If you are running PostgreSQL locally, it usually looks like `postgresql://postgres:password@localhost:5432/agritwin`)*

### 2. Initialize Prisma & Push Schema
Generate the Prisma Client so TypeScript knows your database types, and then push the current schema to your PostgreSQL database:

```bash
# Generate the Prisma Client
npx prisma generate

# Push the schema structure to your database
npx prisma db push
```
*(Note: If you are using migrations for production, use `npx prisma migrate dev` instead of `db push` to track schema changes.)*

### 3. Seed the Database
To populate the application with initial demonstration data (dummy users, farm plots, and tasks), run the seed script:

```bash
npx prisma db seed
# OR if you have a specific custom TS script:
npx tsx prisma/seed.ts
```

### 4. Explore your Data (Optional)
You can view and manage your database easily using Prisma Studio:
```bash
npx prisma studio
```
This will open a local web interface at `http://localhost:5555`.

---

## 🏃‍♂️ Running the App

Once everything is installed and the database is configured, start the development server:

```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```text
AgriTwin/
├── app/                  # Next.js App Router (pages, layout, API routes)
├── components/           # React components (UI, Three.js 3D models)
├── lib/                  # Utility functions & Azure integrations
├── prisma/               # Database schema and seed scripts
├── public/               # Static assets & 3D models (.glb/.gltf)
└── ...config files (tailwind, next, tsconfig)
```

## 👨‍💻 Author

**Joram Mwanyika**
- GitHub: [@JoramMwanyika](https://github.com/JoramMwanyika)

*This project is built and maintained entirely as a solo endeavor to empower smallholder farmers across Africa.*

## 🔗 Links
- **� Demo Video**: [https://youtu.be/K4i1GegokY4](https://youtu.be/K4i1GegokY4)
- **�💻 Repository**: [https://github.com/JoramMwanyika/AgriTwin-AI.git](https://github.com/JoramMwanyika/AgriTwin-AI.git)

## 📄 License

This project is licensed under the MIT License.
