function formatMarketCap(value) {
  if (!value) return "N/A";

  const lakhCrore = value / 1000000000000;

  return `₹${lakhCrore.toFixed(2)}L Cr`;
}


function SummaryCards({ summary }) {
  if (!summary) {
    return (
      <section className="summary-grid">
        <div className="summary-card loading-card">
          Loading market data...
        </div>
      </section>
    );
  }


  return (
    <section className="summary-grid">

      <div className="summary-card">

        <div className="card-top-row">
          <span className="card-label">
            TRACKED COMPANIES
          </span>

          <span className="card-icon">
            ◫
          </span>
        </div>

        <h2>{summary.total_stocks}</h2>

        <p className="card-caption">
          NSE-listed companies monitored
        </p>

      </div>


      <div className="summary-card">

        <div className="card-top-row">
          <span className="card-label">
            COMBINED MARKET CAP
          </span>

          <span className="card-icon">
            ₹
          </span>
        </div>

        <h2>
          {formatMarketCap(
            summary.total_market_cap
          )}
        </h2>

        <p className="card-caption">
          Across tracked companies
        </p>

      </div>


      <div className="summary-card">

        <div className="card-top-row">
          <span className="card-label">
            AVERAGE P/E
          </span>

          <span className="card-icon">
            PE
          </span>
        </div>

        <h2>
          {summary.average_pe}
        </h2>

        <p className="card-caption">
          Market valuation multiple
        </p>

      </div>


      <div className="summary-card performance-card">

        <div className="card-top-row">
          <span className="card-label">
            TOP PERFORMER
          </span>

          <span className="card-icon positive">
            ↗
          </span>
        </div>

        <div className="performance-value">

          <h2>
            {summary.top_gainer?.ticker.replace(
              ".NS",
              ""
            )}
          </h2>

          <span className="performance-return positive">
            +{summary.top_gainer?.return_percent}%
          </span>

        </div>

        <p className="card-caption">
          Best stored-period return
        </p>

      </div>

    </section>
  );
}


export default SummaryCards;