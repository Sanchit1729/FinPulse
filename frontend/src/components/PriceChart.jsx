import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_BASE = "http://127.0.0.1:8000";

const RANGE_OPTIONS = [
  { label: "1D", value: "1d" },
  { label: "1M", value: "1mo" },
  { label: "1Y", value: "1y" },
];

function formatAxisDate(value, range) {
  const date = new Date(value);

  if (range === "1d") {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (range === "1y") {
    return date.toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    });
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function PriceTooltip({ active, payload, label, chartType, range }) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const date = new Date(label);
  const dateLabel =
    range === "1d"
      ? date.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

  return (
    <div className="custom-chart-tooltip">
      <span className="tooltip-date">{dateLabel}</span>

      {chartType === "candlestick" ? (
        <div className="ohlc-tooltip-grid">
          <span>Open</span>
          <strong>₹{Number(data.open).toLocaleString("en-IN")}</strong>

          <span>High</span>
          <strong>₹{Number(data.high).toLocaleString("en-IN")}</strong>

          <span>Low</span>
          <strong>₹{Number(data.low).toLocaleString("en-IN")}</strong>

          <span>Close</span>
          <strong>₹{Number(data.close).toLocaleString("en-IN")}</strong>
        </div>
      ) : (
        <>
          <strong>
            ₹{Number(data.close).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>
          <span className="tooltip-label">Closing Price</span>
        </>
      )}
    </div>
  );
}

function CandleBody({ x, y, width, height, payload }) {
  if (!payload) return null;

  const bullish = Number(payload.close) >= Number(payload.open);
  const color = bullish ? "#00a86b" : "#e5484d";
  const candleWidth = Math.min(Math.max(width * 0.55, 3), 11);
  const centerX = x + width / 2;
  const bodyHeight = Math.max(height, 2);

  return (
    <g>
      <rect
        x={centerX - candleWidth / 2}
        y={y}
        width={candleWidth}
        height={bodyHeight}
        fill={color}
        rx={1}
      />
    </g>
  );
}

function PriceChart({ ticker }) {
  const [chartType, setChartType] = useState("line");
  const [selectedRange, setSelectedRange] = useState("1mo");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ticker) return;

    const controller = new AbortController();

    async function loadHistory() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE}/stocks/${ticker}/history?range=${selectedRange}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch price history");
        }

        const result = await response.json();
        setHistory(result.data ?? []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setHistory([]);
          setError("Could not load price history.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadHistory();

    return () => controller.abort();
  }, [ticker, selectedRange]);

  const chartData = useMemo(
    () =>
      history
        .filter(
          (item) =>
            item.open != null &&
            item.high != null &&
            item.low != null &&
            item.close != null
        )
        .map((item) => {
          const open = Number(item.open);
          const close = Number(item.close);

          return {
            ...item,
            open,
            high: Number(item.high),
            low: Number(item.low),
            close,
            candleBody: [Math.min(open, close), Math.max(open, close)],
          };
        }),
    [history]
  );

  if (loading) {
    return (
      <section className="chart-section chart-loading-state">
        <div className="chart-loading-content">
          <div className="loading-pulse"></div>
          <p>Loading price history...</p>
        </div>
      </section>
    );
  }

  if (error || !ticker || chartData.length === 0) {
    return (
      <section className="chart-section chart-empty-state">
        <p>{error || "No price history available."}</p>
      </section>
    );
  }

  const firstPrice = chartData[0].close;
  const latestPrice = chartData[chartData.length - 1].close;
  const returnPercent = ((latestPrice - firstPrice) / firstPrice) * 100;
  const isPositive = returnPercent >= 0;
  const chartColor = isPositive ? "#00a86b" : "#e5484d";

  const minimumPrice = Math.min(...chartData.map((item) => item.low));
  const maximumPrice = Math.max(...chartData.map((item) => item.high));
  const difference = maximumPrice - minimumPrice;
  const padding =
    difference === 0 ? maximumPrice * 0.02 : difference * 0.08;
  const yDomain = [
    Math.floor(minimumPrice - padding),
    Math.ceil(maximumPrice + padding),
  ];

  const commonXAxis = {
    dataKey: "date",
    axisLine: false,
    tickLine: false,
    minTickGap: selectedRange === "1d" ? 45 : 35,
  };

  return (
    <section className="chart-section upgraded-chart">
      <div className="price-chart-header">
        <div>
          <div className="chart-title-row">
            <h2>{ticker.replace(".NS", "")}</h2>
            <span className="exchange-badge">NSE</span>
          </div>
          <p className="chart-subtitle">Historical market performance</p>
        </div>

        <div className="chart-price-summary">
          <strong>
            ₹{latestPrice.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}
          </strong>

          <span
            className={
              isPositive
                ? "chart-return positive"
                : "chart-return negative"
            }
          >
            {isPositive ? "↗ +" : "↘ "}
            {returnPercent.toFixed(2)}%
          </span>

          <small>{RANGE_OPTIONS.find((r) => r.value === selectedRange)?.label} RETURN</small>
        </div>
      </div>

      <div className="chart-toolbar">
        <div className="chart-legend">
          {chartType === "line" ? (
            <>
              <span
                className="legend-dot"
                style={{ backgroundColor: chartColor }}
              />
              Closing Price
            </>
          ) : (
            <>
              <span className="candle-legend gain"></span>
              Bullish
              <span className="candle-legend loss"></span>
              Bearish
            </>
          )}
        </div>

        <div className="chart-actions">
          <div className="chart-type-toggle">
            <button
              className={chartType === "line" ? "active" : ""}
              onClick={() => setChartType("line")}
            >
              Line
            </button>
            <button
              className={chartType === "candlestick" ? "active" : ""}
              onClick={() => setChartType("candlestick")}
            >
              Candles
            </button>
          </div>

          <div className="chart-type-toggle range-toggle">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={selectedRange === option.value ? "active" : ""}
                onClick={() => setSelectedRange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-container upgraded-chart-container">
        {chartType === "line" ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 5, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id={`priceGradient-${ticker}-${selectedRange}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={chartColor}
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="60%"
                    stopColor={chartColor}
                    stopOpacity={0.06}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                {...commonXAxis}
                tickFormatter={(value) =>
                  formatAxisDate(value, selectedRange)
                }
              />

              <YAxis
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                width={72}
                tickFormatter={(value) =>
                  `₹${Math.round(value).toLocaleString("en-IN")}`
                }
              />

              <Tooltip
                content={
                  <PriceTooltip
                    chartType="line"
                    range={selectedRange}
                  />
                }
                cursor={{
                  stroke: "#98a2b3",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />

              <Area
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={2.5}
                fill={`url(#priceGradient-${ticker}-${selectedRange})`}
                activeDot={{
                  r: 5,
                  fill: chartColor,
                  stroke: "#ffffff",
                  strokeWidth: 3,
                }}
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 12, left: 5, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                {...commonXAxis}
                tickFormatter={(value) =>
                  formatAxisDate(value, selectedRange)
                }
              />

              <YAxis
                domain={yDomain}
                axisLine={false}
                tickLine={false}
                width={72}
                allowDataOverflow={false}
                tickFormatter={(value) =>
                  `₹${Math.round(value).toLocaleString("en-IN")}`
                }
              />

              <Tooltip
                content={
                  <PriceTooltip
                    chartType="candlestick"
                    range={selectedRange}
                  />
                }
                cursor={{ fill: "rgba(16, 24, 40, 0.025)" }}
              />

              <Bar
                dataKey="candleBody"
                shape={<CandleBody />}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}

export default PriceChart;
