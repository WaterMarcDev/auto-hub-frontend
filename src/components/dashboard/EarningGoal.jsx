import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { dashboardAPI } from "../../utils/api";

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
  const [fromScrap, setFromScrap] = useState({
    amount: 13545.65,
    percentageOfGoal: 70,
  });
  const [fromJunk, setFromJunk] = useState({
    amount: 84265.45,
    percentageOfGoal: 80,
  });

  useEffect(() => {
    let mounted = true;
    const fetchGoal = async () => {
      try {
        const res = await dashboardAPI.getEarningGoal();
        const payload = res.data || res;
        if (!mounted) return;
        if (payload.fromScrap) setFromScrap(payload.fromScrap);
        if (payload.fromJunk) setFromJunk(payload.fromJunk);
      } catch {
        console.error("Failed to load earning goal");
      }
    };

    fetchGoal();
    return () => {
      mounted = false;
    };
  }, []);

  const lc1 = listChart1 || {
    options: defaultListChart1.options,
    series: [fromScrap.percentageOfGoal || 0],
  };
  const lc2 = listChart2 || {
    options: defaultListChart2.options,
    series: [fromJunk.percentageOfGoal || 0],
  };

  const formatUSD = (v) => {
    try {
      return `USD ${Number(v || 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    } catch (e) {
      return `USD ${v}`;
    }
  };

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
              <h5 className="font-size-18 mb-1">
                {formatUSD(fromScrap.amount)}
              </h5>
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
              <h5 className="font-size-18 mb-1">
                {formatUSD(fromJunk.amount)}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningGoal;
