import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import SummaryCards from "./components/SummaryCards";
import PriceChart from "./components/PriceChart";
import MarketMovers from "./components/MarketMovers";
import Comparison from "./components/Comparison";
import StockScreener from "./components/StockScreener";
import StockTable from "./components/StockTable";

import "./App.css";


function App() {

  const [stocks, setStocks] = useState([]);
  const [summary, setSummary] = useState(null);

  const [selectedTicker, setSelectedTicker] =
    useState("RELIANCE.NS");

  const [history, setHistory] = useState([]);

  const [historyLoading, setHistoryLoading] =
    useState(false);


  useEffect(() => {

    fetch("http://127.0.0.1:8000/stocks")

      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Unable to fetch stocks"
          );
        }

        return response.json();

      })

      .then((data) => {
        setStocks(data);
      })

      .catch((error) => {

        console.error(
          "Error fetching stocks:",
          error
        );

      });


    fetch(
      "http://127.0.0.1:8000/market-summary"
    )

      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Unable to fetch market summary"
          );
        }

        return response.json();

      })

      .then((data) => {
        setSummary(data);
      })

      .catch((error) => {

        console.error(
          "Error fetching summary:",
          error
        );

      });

  }, []);


  useEffect(() => {

    if (!selectedTicker) return;


    setHistoryLoading(true);


    fetch(
      `http://127.0.0.1:8000/stocks/${selectedTicker}/history`
    )

      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Unable to fetch price history"
          );
        }

        return response.json();

      })

      .then((data) => {

        setHistory(data.data);

        setHistoryLoading(false);

      })

      .catch((error) => {

        console.error(
          "Error fetching price history:",
          error
        );

        setHistory([]);

        setHistoryLoading(false);

      });

  }, [selectedTicker]);


  return (
    <div className="app-shell">

      <Sidebar />


      <div className="main-area">

        <TopBar />


        <main className="dashboard">


          <section id="overview">

            <SummaryCards
              summary={summary}
            />

          </section>


          <section
            id="markets"
            className="market-analysis-grid"
          >

            <div className="price-chart-column">

              <PriceChart
                ticker={selectedTicker}
                history={history}
                loading={historyLoading}
              />

            </div>


            <MarketMovers
              summary={summary}
            />

          </section>


          <section id="compare">

            <Comparison
              stocks={stocks}
            />

          </section>


          <section id="screener">

            <StockScreener
              stocks={stocks}
              onSelectStock={setSelectedTicker}
            />

          </section>


          <StockTable
            stocks={stocks}
            selectedTicker={selectedTicker}
            onSelectStock={setSelectedTicker}
          />


        </main>

      </div>

    </div>
  );
}


export default App;