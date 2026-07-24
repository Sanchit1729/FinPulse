import { useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";


function formatMarketCap(value) {

  if (!value) return "N/A";

  const crore = value / 10000000;

  if (crore >= 100000) {
    return `₹${(crore / 100000).toFixed(2)}L Cr`;
  }

  return `₹${crore.toFixed(0)} Cr`;
}


function Comparison({ stocks }) {

  const [ticker1, setTicker1] =
    useState("RELIANCE.NS");

  const [ticker2, setTicker2] =
    useState("TCS.NS");

  const [ticker3, setTicker3] =
    useState("");

  const [comparisonData, setComparisonData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  function handleCompare() {

    const selectedTickers = [
      ticker1,
      ticker2,
      ticker3
    ].filter(Boolean);


    const uniqueTickers = [
      ...new Set(selectedTickers)
    ];


    if (uniqueTickers.length < 2) {

      setError(
        "Please select at least two different companies."
      );

      return;
    }


    setError("");

    setLoading(true);


    const tickerQuery =
      uniqueTickers.join(",");


    fetch(
      `http://127.0.0.1:8000/compare?tickers=${tickerQuery}`
    )

      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Unable to fetch comparison data."
          );
        }

        return response.json();

      })

      .then((data) => {

        setComparisonData(data.data);

        setLoading(false);

      })

      .catch((error) => {

        console.error(
          "Comparison error:",
          error
        );

        setError(
          "Something went wrong while comparing companies."
        );

        setLoading(false);

      });

  }


  return (

    <section className="comparison-section">


      <div className="section-heading">

        <div>

          <h2>Company Comparison</h2>

          <p>
            Compare fundamentals and performance
            across selected companies
          </p>

        </div>

      </div>


      <div className="comparison-controls">


        <select
          value={ticker1}
          onChange={(event) =>
            setTicker1(event.target.value)
          }
        >

          {stocks.map((stock) => (

            <option
              key={stock.ticker}
              value={stock.ticker}
            >

              {stock.ticker.replace(".NS", "")}

            </option>

          ))}

        </select>


        <select
          value={ticker2}
          onChange={(event) =>
            setTicker2(event.target.value)
          }
        >

          {stocks.map((stock) => (

            <option
              key={stock.ticker}
              value={stock.ticker}
            >

              {stock.ticker.replace(".NS", "")}

            </option>

          ))}

        </select>


        <select
          value={ticker3}
          onChange={(event) =>
            setTicker3(event.target.value)
          }
        >

          <option value="">
            Optional third company
          </option>


          {stocks.map((stock) => (

            <option
              key={stock.ticker}
              value={stock.ticker}
            >

              {stock.ticker.replace(".NS", "")}

            </option>

          ))}

        </select>


        <button
          className="compare-button"
          onClick={handleCompare}
        >

          Compare

        </button>


      </div>


      {error && (

        <p className="comparison-error">
          {error}
        </p>

      )}


      {loading && (

        <p className="comparison-loading">
          Loading comparison...
        </p>

      )}


      {comparisonData.length > 0 && !loading && (

        <div className="comparison-results">


          <div className="comparison-table-container">

            <table className="comparison-table">

              <thead>

                <tr>

                  <th>Metric</th>

                  {comparisonData.map((stock) => (

                    <th key={stock.ticker}>

                      {stock.ticker.replace(
                        ".NS",
                        ""
                      )}

                    </th>

                  ))}

                </tr>

              </thead>


              <tbody>


                <tr>

                  <td>Price</td>

                  {comparisonData.map((stock) => (

                    <td key={stock.ticker}>

                      ₹{stock.price?.toLocaleString(
                        "en-IN"
                      )}

                    </td>

                  ))}

                </tr>


                <tr>

                  <td>Market Cap</td>

                  {comparisonData.map((stock) => (

                    <td key={stock.ticker}>

                      {formatMarketCap(
                        stock.market_cap
                      )}

                    </td>

                  ))}

                </tr>


                <tr>

                  <td>P/E Ratio</td>

                  {comparisonData.map((stock) => (

                    <td key={stock.ticker}>

                      {stock.pe_ratio?.toFixed(2)
                        ?? "N/A"}

                    </td>

                  ))}

                </tr>


                <tr>

                  <td>EPS</td>

                  {comparisonData.map((stock) => (

                    <td key={stock.ticker}>

                      {stock.eps?.toFixed(2)
                        ?? "N/A"}

                    </td>

                  ))}

                </tr>


                <tr>

                  <td>1M Return</td>

                  {comparisonData.map((stock) => (

                    <td
                      key={stock.ticker}

                      className={
                        stock.return_percent >= 0
                          ? "positive"
                          : "negative"
                      }
                    >

                      {stock.return_percent >= 0
                        ? "+"
                        : ""}

                      {stock.return_percent}%

                    </td>

                  ))}

                </tr>


              </tbody>

            </table>

          </div>


          <div className="comparison-chart">

            <h3>P/E Ratio Comparison</h3>


            <ResponsiveContainer
              width="100%"
              height={320}
            >

              <BarChart
                data={comparisonData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />


                <XAxis
                  dataKey="ticker"

                  tickFormatter={(ticker) =>
                    ticker.replace(".NS", "")
                  }
                />


                <YAxis />


                <Tooltip />


                <Bar
                  dataKey="pe_ratio"
                  fill="#31c48d"
                  radius={[6, 6, 0, 0]}
                />


              </BarChart>

            </ResponsiveContainer>

          </div>


        </div>

      )}


    </section>

  );

}


export default Comparison;