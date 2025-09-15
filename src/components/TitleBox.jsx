import React from "react";

const TitleBox = ({ title, routes, current }) => {
  return (
    <div className="page-title-box">
      <div className="page-title" style={{ paddingLeft: "20px" }}>
        <h4>{title}</h4>
        <ol className="breadcrumb m-0">
          {routes &&
            routes.map((route, index) => (
              <li key={index} className="breadcrumb-item">
                <a>{route}</a>
              </li>
            ))}
          <li className="breadcrumb-item active">{current}</li>
        </ol>
      </div>
    </div>
  );
};

export default TitleBox;
