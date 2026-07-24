from datetime import datetime
import math

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

from database import (
    create_tables,
    save_stock_fundamentals,
    save_price_history,
    get_all_stocks,
    get_stock_by_ticker,
    get_history_by_ticker,
    get_market_summary_data,
    get_comparison_data,
)

app = FastAPI(
    title="FinPulse API",
    description="Backend API for the FinPulse stock market monitoring platform",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173","https://fin-pulse-n6o23jz27-sofi-844b.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

STOCK_UNIVERSE = [
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
    "SBIN.NS", "BHARTIARTL.NS", "ITC.NS", "HINDUNILVR.NS", "LT.NS",
    "MARUTI.NS", "M&M.NS", "SUNPHARMA.NS", "DRREDDY.NS", "AXISBANK.NS",
    "KOTAKBANK.NS", "ASIANPAINT.NS", "TITAN.NS", "NTPC.NS", "POWERGRID.NS",
]

RANGE_CONFIG = {
    "1d": {"period": "1d", "interval": "5m"},
    "1mo": {"period": "1mo", "interval": "1d"},
    "1y": {"period": "1y", "interval": "1d"},
}


@app.on_event("startup")
def startup_event():
    create_tables()


@app.get("/")
def home():
    return {"message": "FinPulse API is running"}


@app.get("/stocks")
def get_stocks():
    return get_all_stocks()


@app.get("/market-summary")
def market_summary():
    return get_market_summary_data()


@app.get("/compare")
def compare_stocks(
    tickers: str = Query(..., description="Comma-separated stock tickers")
):
    ticker_list = [
        ticker.strip().upper()
        for ticker in tickers.split(",")
        if ticker.strip()
    ]

    if len(ticker_list) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least two tickers",
        )

    comparison = get_comparison_data(ticker_list)

    if len(comparison) == 0:
        raise HTTPException(
            status_code=404,
            detail="No requested stocks found in database",
        )

    return {
        "requested_tickers": ticker_list,
        "stocks_found": len(comparison),
        "data": comparison,
    }


def clean_number(value):
    if value is None:
        return None

    try:
        number = float(value)
        return number if math.isfinite(number) else None
    except (TypeError, ValueError):
        return None


def dataframe_to_history(history, range_key):
    data = []

    for index, row in history.iterrows():
        open_price = clean_number(row.get("Open"))
        high_price = clean_number(row.get("High"))
        low_price = clean_number(row.get("Low"))
        close_price = clean_number(row.get("Close"))
        volume = clean_number(row.get("Volume"))

        if None in (open_price, high_price, low_price, close_price):
            continue

        if range_key == "1d":
            date_value = index.isoformat()
        else:
            date_value = index.strftime("%Y-%m-%d")

        data.append({
            "date": date_value,
            "open": open_price,
            "high": high_price,
            "low": low_price,
            "close": close_price,
            "volume": int(volume) if volume is not None else 0,
        })

    return data


@app.get("/stocks/{ticker}/history")
def get_stock_history(
    ticker: str,
    range: str = Query("1mo", description="Allowed values: 1d, 1mo, 1y"),
):
    ticker = ticker.upper()

    stock = get_stock_by_ticker(ticker)
    if stock is None:
        raise HTTPException(status_code=404, detail="Stock not found in database")

    if range not in RANGE_CONFIG:
        raise HTTPException(
            status_code=400,
            detail="Invalid range. Use 1d, 1mo, or 1y",
        )

    config = RANGE_CONFIG[range]

    try:
        history = yf.Ticker(ticker).history(
            period=config["period"],
            interval=config["interval"],
            auto_adjust=False,
        )

        if history.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No {range} historical data found for {ticker}",
            )

        data = dataframe_to_history(history, range)

        return {
            "ticker": ticker,
            "range": range,
            "interval": config["interval"],
            "data": data,
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.get("/stocks/{ticker}")
def get_stock(ticker: str):
    ticker = ticker.upper()
    stock = get_stock_by_ticker(ticker)

    if stock is None:
        raise HTTPException(status_code=404, detail="Stock not found in database")

    return stock


def fetch_and_save_stock(ticker: str):
    stock = yf.Ticker(ticker)
    info = stock.info
    history = stock.history(period="1mo")

    history = history.dropna(
        subset=["Open", "High", "Low", "Close", "Volume"]
    )

    if history.empty:
        raise ValueError("No historical data found")

    save_stock_fundamentals(
        ticker=ticker,
        company_name=info.get("longName"),
        price=info.get("currentPrice"),
        market_cap=info.get("marketCap"),
        pe_ratio=info.get("trailingPE"),
        eps=info.get("trailingEps"),
        last_updated=datetime.now().isoformat(),
    )

    save_price_history(ticker=ticker, history=history)
    return len(history)


@app.post("/update/{ticker}")
def update_stock(ticker: str):
    ticker = ticker.upper()

    try:
        rows_processed = fetch_and_save_stock(ticker)
        return {
            "message": f"{ticker} data saved successfully",
            "history_rows_processed": rows_processed,
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/update-all")
def update_all_stocks():
    successful = []
    failed = []

    for ticker in STOCK_UNIVERSE:
        try:
            rows_processed = fetch_and_save_stock(ticker)
            successful.append({
                "ticker": ticker,
                "history_rows_processed": rows_processed,
            })
        except Exception as error:
            failed.append({"ticker": ticker, "error": str(error)})

    return {
        "total_stocks": len(STOCK_UNIVERSE),
        "successful_count": len(successful),
        "failed_count": len(failed),
        "successful": successful,
        "failed": failed,
    }
