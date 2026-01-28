# Full-Stack Engineering Take-Home Assignment
## Energy Contract Marketplace

**Duration:** 2 to 3 days from the time of reciving this 
**Tech Stack:** FastAPI (Backend) + React (Frontend)  
**AI Tools:** You are encouraged to use AI coding assistants (GitHub Copilot, Claude Code, Cursor, etc.)

---

## Overview

Build a simplified energy contract marketplace where traders can browse available energy supply contracts, filter options, and build a portfolio of contracts to purchase.

This assignment evaluates your ability to:
- Design and implement RESTful APIs
- Create intuitive user interfaces
- Design database schemas
- Handle business logic and calculations
- Write clean, maintainable code
- Deploy services (local or containerized)

---

## Project Requirements

### Core Features (MVP)

#### 1. Contract Browsing & Management
**Backend:**
- CRUD API endpoints for energy contracts
- Each contract should include:
  - Contract ID
  - Energy type (Solar, Wind, Natural Gas, Nuclear, Coal, Hydro, etc.)
  - Quantity (MWh - Megawatt hours)
  - Price per MWh ($/MWh)
  - Delivery start date
  - Delivery end date (contract duration)
  - Location/Grid zone (e.g., "Northeast", "Texas", "California")
  - Status (Available, Reserved, Sold)

**Frontend:**
- Display list of available contracts in a table/card view
- Show key details for each contract
- Responsive design (mobile-friendly)

#### 2. Filtering & Search
**Backend:**
- Filter contracts by:
  - Energy type (multi-select)
  - Price range (min/max)
  - Quantity range
  - Location
  - Delivery date range

**Frontend:**
- Filter panel with dropdowns, sliders, or inputs
- Real-time filter application
- Clear filters option
- Display count of matching results

#### 3. Portfolio Builder
**Backend:**
- API to add/remove contracts to a user's portfolio
- Calculate portfolio metrics:
  - Total contracts
  - Total capacity (sum of MWh)
  - Total cost (sum of quantity × price)
  - Breakdown by energy type
  - Weighted average price per MWh

**Frontend:**
- "Add to Portfolio" button on each contract
- Portfolio summary view showing:
  - List of selected contracts
  - Remove contract option
  - Portfolio metrics (total cost, capacity, avg price)
  - Visual breakdown (pie chart or bar chart recommended but not required)

#### 4. Contract Comparison (Nice-to-Have)
**Frontend:**
- Select 2-3 contracts to compare side-by-side
- Highlight differences in price, quantity, duration

---

## Technical Requirements

### Backend (FastAPI)
- **Framework:** FastAPI with Python 3.11+
- **Database:** Your choice (PostgreSQL, SQLite, MySQL, MongoDB)
- **Requirements:**
  - RESTful API design
  - Input validation using Pydantic models
  - Proper HTTP status codes
  - CORS configuration for frontend
  - API documentation (FastAPI auto-generates this)
- **Optional:**
  - Database migrations (Liquibase, Alembic)
  - Error handling and logging
  - Unit tests for key endpoints
  - Authentication (simple token-based is sufficient)

### Frontend (React)
- **Framework:** React 18+ (Create React App, Vite, or Next.js)
- **Requirements:**
  - Component-based architecture
  - State management (useState/useContext or Redux/Zustand)
  - API integration with fetch/axios
  - Basic styling (CSS modules, Tailwind, MUI, or your preference)
- **Optional:**
  - TypeScript
  - Data visualization library (AG Grid)
  - Loading states and error handling
  - Form validation

### Database Design
You must design your own schema. Consider:
- Contracts table with all required fields
- Portfolio/Cart table to track user selections
- Relationships between entities
- Indexes for query performance
- Data types appropriate for energy trading (decimal precision for prices)

### Deployment
**Choose ONE:**
1. **Local Setup:** Provide clear instructions to run both services
2. **Docker Compose:** Containerize both frontend and backend

---

## Deliverables

### 1. Source Code
- Clean, organized repository structure
- Separate frontend and backend directories
- Git history showing incremental progress (optional but appreciated)

### 2. Documentation
- **README.md** with:
  - Setup instructions (prerequisites, installation, running the app)
  - Environment variables needed
  - Database setup steps
  - API endpoint documentation (or link to FastAPI `/docs`)
  - Assumptions and design decisions
  - Known limitations or future improvements
  
### 3. Database
- Schema definition (SQL file or ORM models)
- Seed data script (at least 10-15 sample contracts)

### 4. Working Application
- Fully functional backend API
- Functional frontend UI
- Both services can communicate

---

## What We're Looking For

- All core features work as expected, no critical bugs
- Clean, readable, well-organized code with consistent style
- RESTful principles, proper endpoints, validation, error handling
- Appropriate schema, relationships, data types
- Intuitive interface, good visual hierarchy, responsive
- Clear setup instructions, code comments where needed

---

## Sample Data Suggestions

Here are some example contracts to get you started:

```json
[
  {
    "id": 1,
    "energy_type": "Solar",
    "quantity_mwh": 500,
    "price_per_mwh": 45.50,
    "delivery_start": "2026-03-01",
    "delivery_end": "2026-05-31",
    "location": "California",
    "status": "Available"
  },
  {
    "id": 2,
    "energy_type": "Wind",
    "quantity_mwh": 1200,
    "price_per_mwh": 38.75,
    "delivery_start": "2026-04-01",
    "delivery_end": "2026-09-30",
    "location": "Texas",
    "status": "Available"
  },
  {
    "id": 3,
    "energy_type": "Natural Gas",
    "quantity_mwh": 800,
    "price_per_mwh": 52.00,
    "delivery_start": "2026-02-15",
    "delivery_end": "2026-08-15",
    "location": "Northeast",
    "status": "Available"
  }
]
```

---

## Submission Guidelines

1. **GitHub Repository:** Share a public or private repo (grant access if private)
2. **Deployment (Optional):** If deployed, provide live URLs
3. **Timeline:** Complete within 3 days of receiving this assignment
4. **Questions:** Feel free to ask clarifying questions - we value communication

---

## Tips for Success

- **Start with the database schema** - good foundation makes everything easier
- **Build incrementally** - get basic CRUD working before adding filters
- **Seed realistic data** - makes testing easier and demo more impressive
- **Focus on core features** - better to have solid MVP than half-finished advanced features
- **Test as you go** - verify each feature works before moving to the next
- **Document assumptions** - explain your design choices in the README
- **Use AI tools effectively** - they're allowed, but ensure you understand the code

---

## Optional Enhancements (If Time Permits)

- Contract details modal/page
- Sorting (by price, quantity, date)
- Export portfolio to CSV/PDF
- Price trend visualization
- Contract status updates (mark as sold)
- Pagination for large datasets
- Dark mode
- Simple user authentication

---

## Questions?

If you have any questions about requirements or need clarification, please reach out. We're looking forward to seeing your solution!
