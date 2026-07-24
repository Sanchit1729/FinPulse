import { useMemo, useState } from "react";


const SECTOR_MAP = {
  "RELIANCE.NS": "Energy",
  "TCS.NS": "IT",
  "INFY.NS": "IT",
  "HDFCBANK.NS": "Banking",
  "ICICIBANK.NS": "Banking",
  "SBIN.NS": "Banking",
  "AXISBANK.NS": "Banking",
  "KOTAKBANK.NS": "Banking",
  "ITC.NS": "FMCG",
  "HINDUNILVR.NS": "FMCG",
  "BHARTIARTL.NS": "Telecom",
  "LT.NS": "Infrastructure",
  "M&M.NS": "Auto",
  "MARUTI.NS": "Auto",
  "TATAMOTORS.NS": "Auto",
  "SUNPHARMA.NS": "Pharma",
  "DRREDDY.NS": "Pharma",
  "ASIANPAINT.NS": "Consumer",
  "NTPC.NS": "Energy",
  "POWERGRID.NS": "Energy"
};


const FILTERS = [
  "All",
  "Banking",
  "IT",
  "Auto",
  "Pharma",
  "Energy"
];


function formatCurrency(value) {
  if (value === null || value === undefined) {
    return "—";
  }

  return `₹${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;
}


function formatMarketCap(value) {
  if (!value) return "—";

  const crore = value / 10000000;

  if (crore >= 100000) {
    return `₹${(crore / 100000).toFixed(2)}L Cr`;
  }

  return `₹${crore.toLocaleString("en-IN", {
    maximumFractionDigits: 0
  })} Cr`;
}


function StockTable({
  stocks,
  selectedTicker,
  onSelectStock
}) {

  const [search, setSearch] = useState("");

  const [activeSector, setActiveSector] =
    useState("All");

  const [sortConfig, setSortConfig] = useState({
    key: "market_cap",
    direction: "desc"
  });


  const filteredStocks = useMemo(() => {

    const result = stocks.filter((stock) => {

      const sector =
        SECTOR_MAP[stock.ticker] || "Other";

      const matchesSearch =
        stock.company_name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        stock.ticker
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesSector =
        activeSector === "All" ||
        sector === activeSector;

      return matchesSearch && matchesSector;

    });


    return [...result].sort((a, b) => {

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) {
        return 1;
      }

      if (bValue === null || bValue === undefined) {
        return -1;
      }

      if (sortConfig.direction === "asc") {
        return aValue > bValue ? 1 : -1;
      }

      return aValue < bValue ? 1 : -1;

    });

  }, [
    stocks,
    search,
    activeSector,
    sortConfig
  ]);


  const handleSort = (key) => {

    setSortConfig((current) => ({
      key,
      direction:
        current.key === key &&
        current.direction === "desc"
          ? "asc"
          : "desc"
    }));

  };


  const sortArrow = (key) => {

    if (sortConfig.key !== key) {
      return "↕";
    }

    return sortConfig.direction === "asc"
      ? "↑"
      : "↓";

  };


  return (
    <section className="table-section explore-stocks">

      <div className="explore-header">

        <div>
          <span className="panel-eyebrow">
            MARKET DISCOVERY
          </span>

          <h2>Explore Stocks</h2>

          <p>
            Discover and analyse companies across
            key Indian market sectors.
          </p>
        </div>

        <div className="stock-count-badge">
          {filteredStocks.length} companies
        </div>

      </div>


      <div className="stock-discovery-toolbar">

        <div className="stock-search-wrapper">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search company or ticker..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>


        <div className="sector-tabs">

          {FILTERS.map((sector) => (

            <button
              key={sector}
              className={
                activeSector === sector
                  ? "sector-tab active"
                  : "sector-tab"
              }
              onClick={() =>
                setActiveSector(sector)
              }
            >
              {sector}
            </button>

          ))}

        </div>

      </div>


      <div className="table-container">

        <table className="stocks-table">

          <thead>

            <tr>

              <th>Company</th>

              <th>Sector</th>

              <th
                className="sortable-header"
                onClick={() =>
                  handleSort("price")
                }
              >
                Price
                <span>
                  {sortArrow("price")}
                </span>
              </th>

              <th
                className="sortable-header"
                onClick={() =>
                  handleSort("market_cap")
                }
              >
                Market Cap
                <span>
                  {sortArrow("market_cap")}
                </span>
              </th>

              <th
                className="sortable-header"
                onClick={() =>
                  handleSort("pe_ratio")
                }
              >
                P/E
                <span>
                  {sortArrow("pe_ratio")}
                </span>
              </th>

              <th
                className="sortable-header"
                onClick={() =>
                  handleSort("eps")
                }
              >
                EPS
                <span>
                  {sortArrow("eps")}
                </span>
              </th>

              <th
                className="sortable-header"
                onClick={() =>
                  handleSort("return_percent")
                }
              >
                Return
                <span>
                  {sortArrow("return_percent")}
                </span>
              </th>

              <th></th>

            </tr>

          </thead>


          <tbody>

            {filteredStocks.map((stock) => {

              const isSelected =
                selectedTicker === stock.ticker;

              const stockReturn =
                stock.return_percent;

              return (

                <tr
                  key={stock.ticker}
                  className={
                    isSelected
                      ? "selected-row"
                      : ""
                  }
                  onClick={() =>
                    onSelectStock(stock.ticker)
                  }
                >

                  <td>

                    <div className="stock-company-cell">

                      <div className="stock-avatar">
                        {stock.company_name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {stock.company_name}
                        </strong>

                        <span>
                          {stock.ticker.replace(
                            ".NS",
                            ""
                          )}
                        </span>

                      </div>

                    </div>

                  </td>


                  <td>

                    <span className="sector-label">
                      {SECTOR_MAP[stock.ticker] ||
                        "Other"}
                    </span>

                  </td>


                  <td className="numeric-cell price-cell">
                    {formatCurrency(stock.price)}
                  </td>


                  <td className="numeric-cell">
                    {formatMarketCap(
                      stock.market_cap
                    )}
                  </td>


                  <td className="numeric-cell">
                    {stock.pe_ratio?.toFixed
                      ? stock.pe_ratio.toFixed(2)
                      : stock.pe_ratio ?? "—"}
                  </td>


                  <td className="numeric-cell">
                    {stock.eps?.toFixed
                      ? stock.eps.toFixed(2)
                      : stock.eps ?? "—"}
                  </td>


                  <td>

                    {stockReturn !== null &&
                    stockReturn !== undefined ? (

                      <span
                        className={
                          stockReturn >= 0
                            ? "return-pill gain"
                            : "return-pill loss"
                        }
                      >
                        {stockReturn >= 0
                          ? "+"
                          : ""}

                        {Number(
                          stockReturn
                        ).toFixed(2)}
                        %
                      </span>

                    ) : (
                      <span className="return-empty">
                        —
                      </span>
                    )}

                  </td>


                  <td>

                    <button
                      className={
                        isSelected
                          ? "view-stock-button selected"
                          : "view-stock-button"
                      }
                      onClick={(event) => {
                        event.stopPropagation();

                        onSelectStock(
                          stock.ticker
                        );

                        document
                          .getElementById("markets")
                          ?.scrollIntoView({
                            behavior: "smooth"
                          });
                      }}
                    >
                      {isSelected
                        ? "Viewing"
                        : "View"}
                    </button>

                  </td>

                </tr>

              );

            })}

          </tbody>

        </table>


        {filteredStocks.length === 0 && (

          <div className="no-stocks-state">

            <div className="empty-search-icon">
              ⌕
            </div>

            <h3>No companies found</h3>

            <p>
              Try another search term or sector.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setActiveSector("All");
              }}
            >
              Clear filters
            </button>

          </div>

        )}

      </div>

    </section>
  );
}


export default StockTable;