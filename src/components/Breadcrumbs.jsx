// src/components/Breadcrumbs.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

function Breadcrumbs() {
  const location = useLocation();

  // Split the pathname and filter out empty paths
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav>
      <ul className="breadcrumbs">
        <li>
          <Link to="/">Home</Link>
        </li>
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;

          // Capitalize the breadcrumb text
          const formattedValue = value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to}>
              <Link to={to}>{formattedValue}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default Breadcrumbs;
