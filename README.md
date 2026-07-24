# 📈 FinPulse

## Indian Market Intelligence Dashboard

FinPulse is a full-stack stock market intelligence dashboard built using **React, FastAPI, SQLite, and Yahoo Finance**. It tracks 20 NSE-listed companies, stores historical market data, exposes REST APIs, and visualizes market trends through an interactive dashboard.

## Features
- Track 20 NSE-listed companies
- SQLite database
- FastAPI REST APIs
- Historical line chart
- Candlestick chart
- Company comparison
- Stock screener
- Market summary dashboard
- React frontend

## Tech Stack
**Frontend:** React, Vite, Recharts

**Backend:** FastAPI, Python

**Database:** SQLite

**Data Source:** Yahoo Finance (yFinance)

## REST API Endpoints

- GET `/stocks`
- GET `/stocks/{ticker}`
- GET `/stocks/{ticker}/history`
- GET `/market-summary`
- GET `/compare?tickers=A,B,C`
- POST `/update/{ticker}`
- POST `/update-all`

## Database
### stocks
ticker, company_name, price, market_cap, pe_ratio, eps, return_percent

### price_history
ticker, date, open, high, low, close, volume

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
python -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Author
**Sanchit Mishra**  
BITS Pilani Goa Campus
