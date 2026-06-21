# SurveyTools: Gamification, Vouchers, and Visualization System

This document provides a comprehensive overview of the newly added features to the SurveyTools backend platform. The additions span across Gamification mechanics, a Vouchers & Marketplace system, robust Survey Data Visualization processing, and an Admin Controller System.

---

## 1. Gamification System 🎮
We introduced a full suite of gamification mechanics to reward user participation and encourage engagement.

### **Core Components & Models**
- **XP & Levels (`LevelConfigSchema` & `UserGamification`):** Tracks non-spendable XP points. Automatically upgrades the user's level based on predefined brackets (`minXP`/`maxXP`) and grants them perks.
- **Daily Spin (`SpinHistory`):** Allows users to spin a wheel once per day. It mathematically handles probabilities for rewards like *Jackpots*, *2x Multipliers*, and raw points.
- **Missions (`Mission` & `UserMissionProgress`):** Daily and weekly challenges. Rewards are automatically stored but require the user to explicitly claim them.
- **Streaks:** Login monitoring to increment streaks or reset them if a day is missed.
- **Leaderboards (`LeaderboardEntry`):** Ranks users on a daily, weekly, or all-time scale based on their total XP.
- **VIP Tiers (`VIPTierConfig`):** Dynamic tier classification (Bronze, Silver, Gold, Platinum) based on the total `pointBalance` of the user.

### **API Endpoints (User Facing)**
* `GET /gamification/dashboard` - Get full user stats (XP, Level, Streaks, point balance).
* `POST /gamification/spin` - Trigger the daily wheel spin.
* `GET /gamification/missions` - List available/completed missions for the user.
* `POST /gamification/missions/:id/claim` - Claim points/XP for a completed mission.
* `GET /gamification/leaderboard` - Fetch the top ranked users.
* `GET /gamification/vip-status` - Check current VIP tier and perks.

---

## 2. Vouchers & Marketplace (Rewards) 🛒
The rewards system allows users to spend the **Points** they accumulated from completing surveys and gamification features.

### **Core Components & Models**
- **Marketplace Listings (`MarketplaceListing`):** The store database containing items like Premium Upgrades, Discount Codes, and Gift Cards. Tracks inventory and point costs.
- **Voucher Wallet (`Voucher`):** Automatically generates secure alphanumeric codes when points are converted. The vouchers are stored in a wallet with statuses (`active`, `redeemed`, `expired`).
- **Transaction History (`PointTransaction`):** A strict ledger that tracks every point earned, spent, or converted into cash vouchers.

### **API Endpoints (User Facing)**
* `GET /marketplace/listings` - Retrieves available store items, grouped by premium upgrades and rewards.
* `POST /marketplace/convert` - Core transaction endpoint. Converts points into either a predefined listing purchase or a generic raw cash value voucher.
* `GET /marketplace/wallet` - Fetches all purchased and active vouchers for the user.
* `GET /marketplace/transactions` - Returns the last 50 transactions to populate the "Transaction Summary" page.

---

## 3. Administrative System & Cron Job Automations ⚙️
To prevent hard-coding data and give server owners full control, a dedicated Admin gamification router and an automated Cron scheduler have been implemented.

### **Admin Control APIs**
These endpoints require both the `authMiddleware` and `adminMiddleware` to be accessed. They allow an admin to dynamically build the economy.
* `POST /admin/gamification/missions` - Create a new daily or weekly mission.
* `GET /admin/gamification/missions` - List all active missions.
* `POST /admin/gamification/levels` - Create a new Level with custom XP requirements and perks.
* `POST /admin/gamification/vip` - Create a new VIP tier with custom point thresholds.
* `POST /admin/marketplace/listings` - Create a new item in the Marketplace (e.g. 10% Off Amazon Voucher).
* `GET /admin/marketplace/listings` - View all items in the Marketplace.

### **Cron Job Scheduler (`gamificationCron.js`)**
A lightweight interval-based scheduler runs continuously on the server, listening for **midnight (`00:00`)**.
* When midnight strikes, the cron job automatically looks at all active Missions created by the admin.
* It performs a highly efficient bulk write operation into the database, generating brand new `UserMissionProgress` trackers for **every single user**. 
* This means users will wake up to fresh daily challenges without any manual intervention!

---

## 4. Advanced Data Visualization (Graphs) 📈
To support dynamic analytics on the frontend, a dedicated visualization controller processes survey data natively for multiple chart libraries (Chart.js, Recharts, D3, ECharts).

### **Core Processing Pipeline**
The system processes data across three complex tiers based on the frontend's request:

* **Basic Level (Bar, Pie, Histogram, Line, Area)**
  * **Processing:** Iterates through `analytics.distribution` to aggregate raw `labels` and `values` mapped identically to straightforward arrays.

* **Intermediate Level (Stacked Bar, Clustered Bar, Heatmap, Box Plot, Scatter)**
  * **Processing:** Introduces **Cross-Tabulation Matrix** analysis. Requires a `questionId` and a `crossQuestionId`. Computes relationships between variables (e.g., how Males responded to Question A vs Females). 
  * Calculates `min`, `q1`, `median`, `q3`, `max`, and mathematical `outliers` for Box Plots using array sorting and Interquartile Ranges (IQR).

* **Advanced Level (Treemap, Dendrogram, Network, Map)**
  * **Processing:** Maps flat categorical arrays into multi-level hierarchical nested JSON objects (`children` arrays) for Treemaps and Dendrograms.
  * Builds `nodes` and `links` arrays to simulate graph networking relations.
  * Extrapolates mapping locational metrics using the survey's `faculty_participants` object maps.

### **API Endpoints**
* `GET /surveys/:surveyId/visualizations?graphType={type}&questionId={qId}&crossQuestionId={cqId}`
  * Automatically handles the routing and heavy data formatting for the precise requested graph type.
