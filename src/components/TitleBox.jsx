import React from "react";

const TitleBox = ({ title, routes, current, extra, subtitle }) => {
  return (
    <div className="page-title-box">
      <div className="page-title-container">
        <div className="page-title-main">
          <h4 className="page-heading">{title}</h4>
          {subtitle && <p className="page-subheading">{subtitle}</p>}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb m-0">
              {routes &&
                routes.map((route, index) => (
                  <li key={index} className="breadcrumb-item">
                    <span>{route}</span>
                  </li>
                ))}
              {current && <li className="breadcrumb-item active">{current}</li>}
            </ol>
          </nav>
        </div>
        {extra && <div className="page-title-extra">{extra}</div>}
      </div>
    </div>
  );
};

export default TitleBox;
