function MarketMovers({ summary }) {

  if (!summary) {
    return (
      <section className="movers-panel">
        <p>Loading market movers...</p>
      </section>
    );
  }


  const gainer = summary.top_gainer;
  const loser = summary.top_loser;


  return (
    <section className="movers-panel">

      <div className="movers-header">

        <div>
          <span className="panel-eyebrow">
            PERFORMANCE
          </span>

          <h2>Market Movers</h2>
        </div>

        <span className="period-badge">
          STORED PERIOD
        </span>

      </div>


      <div className="movers-content">


        <div className="mover-item">

          <div className="mover-direction gain">
            ↗
          </div>

          <div className="mover-info">

            <span className="mover-label">
              TOP GAINER
            </span>

            <strong>
              {gainer?.ticker.replace(
                ".NS",
                ""
              )}
            </strong>

          </div>

          <div className="mover-return positive">
            +{gainer?.return_percent}%
          </div>

        </div>


        <div className="mover-divider"></div>


        <div className="mover-item">

          <div className="mover-direction loss">
            ↘
          </div>

          <div className="mover-info">

            <span className="mover-label">
              TOP LOSER
            </span>

            <strong>
              {loser?.ticker.replace(
                ".NS",
                ""
              )}
            </strong>

          </div>

          <div
            className={
              loser?.return_percent >= 0
                ? "mover-return positive"
                : "mover-return negative"
            }
          >
            {loser?.return_percent >= 0
              ? "+"
              : ""}

            {loser?.return_percent}%
          </div>

        </div>


      </div>


      <div className="movers-footer">

        <span>
          Performance calculated from stored historical prices
        </span>

      </div>

    </section>
  );
}


export default MarketMovers;