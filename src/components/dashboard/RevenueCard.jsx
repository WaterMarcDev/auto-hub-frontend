import React from "react";
import Chart from "react-apexcharts";

const defaultChart = {
  options: {
    chart: { type: "area", height: 80, sparkline: { enabled: true } },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#525ce5"],
    tooltip: {
      fixed: { enabled: false },
      x: { show: false },
      y: { title: { formatter: () => "Revenue" } },
      marker: { show: false },
    },
  },
  series: [{ name: "Revenue", data: [24, 66, 42, 88, 62, 24, 45, 12, 36, 10] }],
};

const RevenueCard = ({ chartOptions, chartSeries }) => {
  const opts = chartOptions || defaultChart.options;
  const series = chartSeries || defaultChart.series;
  return (
    <div
      className="card"
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-4">Revenue Statistics</h4>
        <div className="d-flex align-items-center">
          <h4 className="mb-0">$14,235</h4>
          <div className="media-body ps-3 ms-auto">
            <div className="dropdown">
              <button
                className="btn btn-light btn-sm dropdown-toggle"
                type="button"
              >
                Today
                <i className="mdi mdi-chevron-down ms-1" />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <Chart options={opts} series={series} type="area" height={80} />
        </div>
      </div>
    </div>
  );
};

export default RevenueCard;
