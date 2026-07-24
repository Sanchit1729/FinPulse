function TopBar() {
  const today = new Date().toLocaleDateString(
    "en-IN",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">MARKET DASHBOARD</p>
        <h2>Overview</h2>
      </div>

      <div className="topbar-right">
        <span className="dashboard-date">
          {today}
        </span>

        <div className="live-badge">
          <span className="status-dot"></span>
          DATA ACTIVE
        </div>
      </div>
    </header>
  );
}

export default TopBar;