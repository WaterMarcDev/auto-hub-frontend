import React from "react";
import Chart from "react-apexcharts";

const defaultListChart1 = {
  options: {
    fill: { colors: ["#525ce5"] },
    chart: {
      type: "radialBar",
      width: 65,
      height: 65,
      sparkline: { enabled: true },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      radialBar: {
        hollow: { margin: 0, size: "60%" },
        track: { margin: 0 },
        dataLabels: { show: false },
      },
    },
  },
  series: [70],
};

const defaultListChart2 = {
  options: {
    fill: { colors: ["#23c58f"] },
    chart: {
      type: "radialBar",
      width: 65,
      height: 65,
      sparkline: { enabled: true },
    },
    dataLabels: { enabled: false },
    plotOptions: {
      radialBar: {
        hollow: { margin: 0, size: "60%" },
        track: { margin: 0 },
        dataLabels: { show: false },
      },
    },
  },
  series: [80],
};

const EarningGoal = ({ listChart1, listChart2 }) => {
  const lc1 = listChart1 || defaultListChart1;
  const lc2 = listChart2 || defaultListChart2;
  return (
    <div
      className="card"
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-4">Earning Goal</h4>
        <div className="mt-2 text-center">
          <div className="row">
            <div className="col-md-6 d-flex flex-column align-items-center">
              <Chart
                options={lc1.options}
                series={lc1.series}
                type="radialBar"
                width={65}
                height={65}
              />
              <p className="text-muted mb-2 mt-2 pt-1">From Scrap:</p>
              <h5 className="font-size-18 mb-1">USD 13,545.65</h5>
            </div>

            <div className="col-md-6 d-flex flex-column align-items-center">
              <Chart
                options={lc2.options}
                series={lc2.series}
                type="radialBar"
                width={65}
                height={65}
              />
              <p className="text-muted mb-2 mt-2 pt-1">From Junk:</p>
              <h5 className="font-size-18 mb-1">USD 84,265.45</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningGoal;
