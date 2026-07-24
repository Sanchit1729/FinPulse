import { useEffect, useState } from "react";


const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: "◈",
  },
  {
    id: "markets",
    label: "Markets",
    icon: "↗",
  },
  {
    id: "compare",
    label: "Compare",
    icon: "⇄",
  },
  {
    id: "screener",
    label: "Screener",
    icon: "⌕",
  },
];


function Sidebar() {
  const [activeSection, setActiveSection] =
    useState("overview");


  useEffect(() => {
    const handleScroll = () => {
      const sections = NAV_ITEMS
        .map((item) =>
          document.getElementById(item.id)
        )
        .filter(Boolean);


      const scrollPosition =
        window.scrollY + 180;


      let currentSection = "overview";


      sections.forEach((section) => {
        if (
          section.offsetTop <= scrollPosition
        ) {
          currentSection = section.id;
        }
      });


      setActiveSection(currentSection);
    };


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );


    handleScroll();


    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);


  const scrollToSection = (id) => {
    const section =
      document.getElementById(id);


    if (!section) return;


    setActiveSection(id);


    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };


  return (
    <aside className="sidebar">


      {/* BRAND */}

      <div className="sidebar-brand">

        <div className="brand-mark">
          <span>FP</span>
        </div>


        <div className="brand-copy">

          <h1>
            FinPulse
          </h1>

          <span>
            Markets & Analytics
          </span>

        </div>

      </div>


      {/* NAVIGATION */}

      <nav className="sidebar-nav">

        {NAV_ITEMS.map((item) => (

          <button
            key={item.id}

            className={
              activeSection === item.id
                ? "nav-item active"
                : "nav-item"
            }

            onClick={() =>
              scrollToSection(item.id)
            }
          >

            <span className="nav-icon">
              {item.icon}
            </span>


            <span className="nav-label">
              {item.label}
            </span>


            {activeSection === item.id && (
              <span className="nav-active-indicator" />
            )}

          </button>

        ))}

      </nav>


      {/* FOOTER STATUS */}

      <div className="sidebar-footer">

        <div className="data-status">

          <span className="status-dot" />


          <div>

            <strong>
              Market data connected
            </strong>

            <span>
              20 NSE companies tracked
            </span>

          </div>

        </div>

      </div>


    </aside>
  );
}


export default Sidebar;