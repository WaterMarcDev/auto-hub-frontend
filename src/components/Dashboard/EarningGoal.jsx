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
  series: [0],
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
  series: [0],
};

const EarningGoal = ({ listChart1, listChart2 }) => {
  const [fromScrap, setFromScrap] = useState({
    amount: 0,
    percentageOfGoal: 70,
  });
  const [fromCheckIn, setFromCheckIn] = useState({
    amount: 0,
    percentageOfGoal: 80,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchGoal = async () => {
      try {
        setLoading(true);
        const res = await dashboardAPI.getEarningGoal();
        const payload = res.data || res;
        console.log('EarningGoal API response:', payload);
        if (!mounted) return;
        if (payload.fromScrap) {
          console.log('Setting fromScrap:', payload.fromScrap);
          setFromScrap({
            amount: payload.fromScrap.amount || 0,
            percentageOfGoal: payload.fromScrap.percentageOfGoal || 70
          });
        }
        if (payload.fromCheckIn) {
          console.log('Setting fromCheckIn:', payload.fromCheckIn);
          setFromCheckIn({
            amount: payload.fromCheckIn.amount || 0,
            percentageOfGoal: payload.fromCheckIn.percentageOfGoal || 80
          });
        }
      } catch (err) {
        console.error("Failed to load earning goal:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGoal();
    return () => {
      mounted = false;
    };
  }, []);

  const lc1 = listChart1 || {
    options: defaultListChart1.options,
    series: [fromScrap.percentageOfGoal],
  };
  const lc2 = listChart2 || {
    options: defaultListChart2.options,
    series: [fromCheckIn.percentageOfGoal],
  };

  console.log('EarningGoal rendering:', { 
    fromScrap, 
    fromCheckIn, 
    lc1Series: lc1.series, 
    lc2Series: lc2.series 
  });

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
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6", height: "240px" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-2">Earning Goal</h4>
        <div className="text-center" style={{ marginTop: "10px" }}>
          <div className="row">
            <div className="col-md-6 d-flex flex-column align-items-center">
              <Chart
                key={`scrap-${fromScrap.percentageOfGoal}-${fromScrap.amount}`}
                options={lc1.options}
                series={lc1.series}
                type="radialBar"
                width={70}
                height={70}
              />
              <p className="text-muted mb-1 mt-2">From Scrap:</p>
              <h5 className="font-size-16 mb-0">
                {formatUSD(fromScrap.amount)}
              </h5>
            </div>

            <div className="col-md-6 d-flex flex-column align-items-center">
              <Chart
                key={`checkin-${fromCheckIn.percentageOfGoal}-${fromCheckIn.amount}`}
                options={lc2.options}
                series={lc2.series}
                type="radialBar"
                width={70}
                height={70}
              />
              <p className="text-muted mb-1 mt-2">From Check-in:</p>
              <h5 className="font-size-16 mb-0">
                {formatUSD(fromCheckIn.amount)}
              </h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningGoal;
