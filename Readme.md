<div align="center">

# 🃏 Blackjack <span style="color:#F59E0B">Royale</span> — Single-Player Blackjack & Admin Control Platform

<a href="https://blackjack-bice-omega.vercel.app">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=700&size=22&pause=1000&color=F59E0B&center=true&vCenter=true&width=680&lines=Single-player+Blackjack+gameplay+%26+room+session+flow;Spring+Boot+4.1.2+%2B+WebSocket%2FSTOMP+%2B+Redis;Payments%2C+OAuth2+%26+interactive+system+architecture" alt="Typing SVG" />
</a>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Blackjack_Royale-F59E0B?style=for-the-badge&logo=vercel&logoColor=black)](https://blackjack-bice-omega.vercel.app)
[![Architecture](https://img.shields.io/badge/System-Architecture-0F172A?style=for-the-badge&logo=diagramsdotnet&logoColor=F59E0B)](https://blackjack-bice-omega.vercel.app/architecture)
[![Backend API](https://img.shields.io/badge/API_Host-OCI_HTTPS-10B981?style=for-the-badge&logo=linux&logoColor=white)](https://blackjack-royale.duckdns.org/swagger-ui/index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

<br />

<a href="https://blackjack-bice-omega.vercel.app/architecture" target="_blank">
  <img src="./docs/architecture-preview.png" alt="Blackjack Royale System Architecture" width="100%" style="border-radius: 12px; border: 1px solid #1E293B; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);" />
</a>

<br />
<i>Single-player Blackjack tables, STOMP WebSocket state sync, Redis caching, and HTTPS-secured payments & auth.<br/><b>Click the architecture diagram above to explore the interactive system topology!</b></i>
<br /><br />

</div>

---

## 💻 Tech Stack

<div align="center">
  <img src="https://img.shields.io/badge/Spring_Boot_4.1.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot 4.1.2" />
  <img src="https://img.shields.io/badge/React_%26_Vite-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React & Vite" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis_Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis Cache" />
  <img src="https://img.shields.io/badge/WebSocket_%26_STOMP-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="WebSocket & STOMP" />
  <img src="https://img.shields.io/badge/Nginx_%26_Certbot-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx & Certbot" />
  <img src="https://img.shields.io/badge/Oracle_Cloud-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle Cloud Infrastructure" />
</div>

---

## 🏗️ System Architecture

Blackjack Royale splits single-player table state synchronization, transactional persistence, caching, and role-based control flows across a React client and a Spring Boot backend deployed behind Nginx TLS termination:

| Layer / Component | Stack & Role | Responsibility |
| :--- | :--- | :--- |
| **Frontend Client** | React + Vite + TypeScript + Tailwind CSS | Single-player room selection, live table UI, JWT/refresh token session handling, one-click demo access, admin console, and interactive `/architecture` view. |
| **Backend API & Game Engine** | Spring Boot 4.1.2 + Java + Spring Security | Authentication (email/OTP, Google OAuth2, JWT + `refresh_token` cookie), single-player Blackjack rules & hand flow, wallet/chip operations, payment webhook handling, and admin endpoints. |
| **Real-Time Messaging** | WebSocket + STOMP | Streams live single-player table updates, dealer/player actions (`hit`, `stand`, `double`, betting rounds), and room events smoothly. |
| **Relational Data Store** | PostgreSQL | Stores users, roles (`USER` / `ADMIN`), wallets/transactions, rooms, and persistent application state. |
| **Cache Layer** | Redis Cache | Accelerates hot read paths, session/state caching, and transient lookups to keep gameplay responsive. |
| **Reverse Proxy & TLS** | Oracle Linux VM + Nginx + Let's Encrypt (Certbot) | Terminates HTTPS on `blackjack-royale.duckdns.org`, upgrades WebSocket connections, and forwards `X-Forwarded-Proto` / `X-Forwarded-Host` headers. |


---

## ✨ Core Features

Click to expand and explore Blackjack Royale's capabilities:

<details>
<summary><b>🃏 Single-Player Blackjack Tables via WebSocket & STOMP</b></summary>
Enter single-player rooms, place bets, and play synchronized rounds against the dealer with live table state updates pushed over WebSocket + STOMP topics and queues.
</details>

<details>
<summary><b>⚡ Redis Caching & PostgreSQL Persistence</b></summary>
Combines <b>PostgreSQL</b> for durable relational data (accounts, balances, game/transaction records) with <b>Redis Cache</b> to reduce repeated read latency during active play.
</details>

<details>
<summary><b>🔐 JWT, Refresh Cookies, Google OAuth2 & One-Click Demo Access</b></summary>
Supports standard credential login, email OTP verification, Google OAuth2 sign-in with proxy-aware forwarded headers, cross-site <code>SameSite=None; Secure</code> refresh cookies, and instant portfolio demo buttons for both User and Admin views.
</details>

<details>
<summary><b>🛡️ Role-Based Access Control & Admin Panel</b></summary>
Separates single-player routes (<code>/rooms</code>) from protected administrative views (<code>/admin</code>) using role guards on both the frontend and Spring Security backend.
</details>

<details>
<summary><b>🌐 Production HTTPS Reverse Proxy & Interactive Topology</b></summary>
Deployed with Nginx + Certbot auto-renewal on Oracle Cloud Infrastructure alongside an interactive system architecture page at <code>/architecture</code>.
</details>

---

## 🚀 Getting Started

Follow these steps to run Blackjack Royale locally or connect the frontend to your deployed backend.

### Prerequisites
- **Java 21+** (or Java 25) & Maven (`./mvnw`)
- **Node.js 18+** & npm
- **PostgreSQL** & **Redis** (local instances or managed cloud providers such as Neon and Upstash)

---

### 1. Clone the Repository
```bash
git clone https://github.com/Aayush6377/blackjack
cd blackjack
```

### 2. Configure Environment Variables (`.env`)

Each folder has its own `.env.example` template—copy `.env.example` to `.env` inside both `backend/` and `frontend/`, then fill in your local or deployment values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Run the Services

#### Option A: Run Locally (Backend + Frontend)
Open two terminals and start each layer:

```bash
# Terminal 1 — Spring Boot 4.1.2 Backend (Port 8080)
cd backend
set -a && source .env && set +a
./mvnw spring-boot:run
```

```bash
# Terminal 2 — React + Vite Frontend (Port 5173)
cd frontend
npm install
npm run dev
```

#### Option B: Package JAR & Serve via Nginx on Linux VM
Build the Spring Boot JAR and run it behind Nginx with HTTPS enabled via Certbot:

```bash
cd backend
./mvnw clean package -DskipTests
set -a && source .env && set +a
nohup java -XX:MaxRAMPercentage=50.0 -jar target/*.jar > app.log 2>&1 &
```

---

## 👨‍💻 Connect with the Developer

**Aayush Kukreja** *Full Stack & Distributed Systems Developer.*

[![Portfolio](https://img.shields.io/badge/Portfolio-23005C?style=for-the-badge&logo=Vercel&logoColor=white)](https://aayush-kukreja-portfolio.vercel.app)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/aayush-kukreja-b5885324a)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Aayush6377)

<div align="center">
  <br />
  <i>If you found this project interesting, please consider giving it a ⭐!</i>
</div>