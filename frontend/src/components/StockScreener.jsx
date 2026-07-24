import { useMemo, useState } from "react";


function formatMarketCap(value) {
  if (!value) return "N/A";

  const crore = value / 10000000;

  if (crore >= 100000) {
    return `₹${(crore / 100000).toFixed(2)}L Cr`;
  }

  return `₹${crore.toFixed(0)} Cr`;
}


function StockScreener({ stocks, onSelectStock }) {

  const [search, setSearch] = useState("");
  const [maxPE, setMaxPE] = useState("");
  const [minEPS, setMinEPS] = useState("");
  const [minMarketCap, setMinMarketCap] = useState("");


  const filteredStocks = useMemo(() => {

    return stocks.filter((stock) => {

      const searchText = search.toLowerCase();

      const matchesSearch =
        stock.company_name
          ?.toLowerCase()
          .includes(searchText) ||
        stock.ticker
          ?.toLowerCase()
          .includes(searchText);


      const matchesPE =
        maxPE === "" ||
        (
          stock.pe_ratio !== null &&
          stock.pe_ratio <= Number(maxPE)
        );


      const matchesEPS =
        minEPS === "" ||
        (
          stock.eps !== null &&
          stock.eps >= Number(minEPS)
        );


      const marketCapCrore =
        stock.market_cap
          ? stock.market_cap / 10000000
          : 0;


      const matchesMarketCap =
        minMarketCap === "" ||
        marketCapCrore >= Number(minMarketCap);


      return (
        matchesSearch &&
        matchesPE &&
        matchesEPS &&
        matchesMarketCap
      );

    });

  }, [
    stocks,
    search,
    maxPE,
    minEPS,
    minMarketCap
  ]);


  function clearFilters() {
    setSearch("");
    setMaxPE("");
    setMinEPS("");
    setMinMarketCap("");
  }


  return (

    <section className="screener-section">

      <div className="section-heading">

        <div>
          <h2>Stock Screener</h2>

          <p>
            Filter companies using valuation,
            earnings and market-cap criteria
          </p>
        </div>

      </div>


      <div className="screener-controls">

        <div className="filter-group">

          <label>Search</label>

          <input
            type="text"
            placeholder="Company or ticker"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <div className="filter-group">

          <label>Maximum P/E</label>

          <input
            type="number"
            placeholder="e.g. 25"
            value={maxPE}
            onChange={(event) =>
              setMaxPE(event.target.value)
            }
          />

        </div>


        <div className="filter-group">

          <label>Minimum EPS</label>

          <input
            type="number"
            placeholder="e.g. 30"
            value={minEPS}
            onChange={(event) =>
              setMinEPS(event.target.value)
            }
          />

        </div>


        <div className="filter-group">

          <label>Min Market Cap (₹ Cr)</label>

          <input
            type="number"
            placeholder="e.g. 100000"
            value={minMarketCap}
            onChange={(event) =>
              setMinMarketCap(event.target.value)
            }
          />

        </div>


        <button
          className="clear-button"
          onClick={clearFilters}
        >
          Clear Filters
        </button>

      </div>


      <div className="screener-count">
        {filteredStocks.length} of {stocks.length} companies match
      </div>


      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>Company</th>
              <th>Ticker</th>
              <th>Price</th>
              <th>Market Cap</th>
              <th>P/E</th>
              <th>EPS</th>
            </tr>
          </thead>


          <tbody>

            {filteredStocks.map((stock) => (

              <tr
                key={stock.ticker}
                onClick={() =>
                  onSelectStock(stock.ticker)
                }
              >

                <td className="company-name">
                  {stock.company_name}
                </td>

                <td>
                  <span className="ticker-badge">
                    {stock.ticker.replace(".NS", "")}
                  </span>
                </td>

                <td>
                  ₹{stock.price?.toLocaleString("en-IN")}
                </td>

                <td>
                  {formatMarketCap(stock.market_cap)}
                </td>

                <td>
                  {stock.pe_ratio?.toFixed(2) ?? "N/A"}
                </td>

                <td>
                  {stock.eps?.toFixed(2) ?? "N/A"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </section>

  );
}


export default StockScreener;