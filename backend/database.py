import sqlite3


DATABASE_NAME = "finpulse.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection


def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS stocks (
            ticker TEXT PRIMARY KEY,
            company_name TEXT,
            price REAL,
            market_cap INTEGER,
            pe_ratio REAL,
            eps REAL,
            last_updated TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS price_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticker TEXT NOT NULL,
            date TEXT NOT NULL,
            open REAL,
            high REAL,
            low REAL,
            close REAL,
            volume INTEGER,
            UNIQUE(ticker, date)
        )
    """)

    connection.commit()
    connection.close()


def save_stock_fundamentals(
    ticker,
    company_name,
    price,
    market_cap,
    pe_ratio,
    eps,
    last_updated
):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO stocks (
            ticker,
            company_name,
            price,
            market_cap,
            pe_ratio,
            eps,
            last_updated
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)

        ON CONFLICT(ticker) DO UPDATE SET
            company_name = excluded.company_name,
            price = excluded.price,
            market_cap = excluded.market_cap,
            pe_ratio = excluded.pe_ratio,
            eps = excluded.eps,
            last_updated = excluded.last_updated
    """, (
        ticker,
        company_name,
        price,
        market_cap,
        pe_ratio,
        eps,
        last_updated
    ))

    connection.commit()
    connection.close()


def save_price_history(ticker, history):
    connection = get_connection()
    cursor = connection.cursor()

    for date, row in history.iterrows():

        cursor.execute("""
            INSERT INTO price_history (
                ticker,
                date,
                open,
                high,
                low,
                close,
                volume
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)

            ON CONFLICT(ticker, date) DO UPDATE SET
                open = excluded.open,
                high = excluded.high,
                low = excluded.low,
                close = excluded.close,
                volume = excluded.volume
        """, (
            ticker,
            date.strftime("%Y-%m-%d"),
            float(row["Open"]),
            float(row["High"]),
            float(row["Low"]),
            float(row["Close"]),
            int(row["Volume"])
        ))

    connection.commit()
    connection.close()


def get_all_stocks():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM stocks
        ORDER BY ticker
    """)

    rows = cursor.fetchall()
    connection.close()

    return [dict(row) for row in rows]


def get_stock_by_ticker(ticker):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT *
        FROM stocks
        WHERE ticker = ?
    """, (ticker,))

    row = cursor.fetchone()
    connection.close()

    if row is None:
        return None

    return dict(row)


def get_history_by_ticker(ticker):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            date,
            open,
            high,
            low,
            close,
            volume
        FROM price_history
        WHERE ticker = ?
        ORDER BY date
    """, (ticker,))

    rows = cursor.fetchall()
    connection.close()

    return [dict(row) for row in rows]


def calculate_stock_return(cursor, ticker):

    cursor.execute("""
        SELECT close
        FROM price_history
        WHERE ticker = ?
        ORDER BY date ASC
        LIMIT 1
    """, (ticker,))

    first_row = cursor.fetchone()

    cursor.execute("""
        SELECT close
        FROM price_history
        WHERE ticker = ?
        ORDER BY date DESC
        LIMIT 1
    """, (ticker,))

    last_row = cursor.fetchone()

    if first_row is None or last_row is None:
        return None

    first_close = first_row["close"]
    last_close = last_row["close"]

    if first_close == 0:
        return None

    return round(
        ((last_close - first_close) / first_close) * 100,
        2
    )


def get_market_summary_data():
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            COUNT(*) AS total_stocks,
            SUM(market_cap) AS total_market_cap,
            AVG(pe_ratio) AS average_pe
        FROM stocks
    """)

    summary = dict(cursor.fetchone())

    cursor.execute("""
        SELECT ticker
        FROM stocks
    """)

    ticker_rows = cursor.fetchall()

    returns = []

    for row in ticker_rows:

        ticker = row["ticker"]

        return_percent = calculate_stock_return(
            cursor,
            ticker
        )

        if return_percent is not None:

            returns.append({
                "ticker": ticker,
                "return_percent": return_percent
            })

    connection.close()

    top_gainer = None
    top_loser = None

    if returns:

        top_gainer = max(
            returns,
            key=lambda stock: stock["return_percent"]
        )

        top_loser = min(
            returns,
            key=lambda stock: stock["return_percent"]
        )

    return {
        "total_stocks": summary["total_stocks"],
        "total_market_cap": summary["total_market_cap"],
        "average_pe": (
            round(summary["average_pe"], 2)
            if summary["average_pe"] is not None
            else None
        ),
        "top_gainer": top_gainer,
        "top_loser": top_loser
    }


def get_comparison_data(tickers):
    connection = get_connection()
    cursor = connection.cursor()

    comparison = []

    for ticker in tickers:

        cursor.execute("""
            SELECT
                ticker,
                company_name,
                price,
                market_cap,
                pe_ratio,
                eps
            FROM stocks
            WHERE ticker = ?
        """, (ticker,))

        stock = cursor.fetchone()

        if stock is not None:

            stock_data = dict(stock)

            stock_data["return_percent"] = (
                calculate_stock_return(cursor, ticker)
            )

            comparison.append(stock_data)

    connection.close()

    return comparison