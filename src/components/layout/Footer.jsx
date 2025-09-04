import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div style={{ background: "transparent", padding: "0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            background: "transparent",
          }}
        >
          <div style={{ background: "transparent" }}>
            {new Date().getFullYear()} © Copyright Scrap Yard, All Right
            Reserved
          </div>
          <div style={{ background: "transparent", textAlign: "right" }}>
            Developed by WaterMarc | For Support Email at : info@watermarc.in
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
