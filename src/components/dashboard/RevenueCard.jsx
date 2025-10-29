import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { dashboardAPI } from "../../utils/api";

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

const RevenueCard = ({
  chartOptions,
  chartSeries,
  startDate: propStart,
  endDate: propEnd,
}) => {
  const [total, setTotal] = useState(0);
  const [points, setPoints] = useState([]);
  const [label, setLabel] = useState("All time");

  const computeRangeForLabel = (l) => {
    const now = new Date();
    let start;
    let end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );
    if (l === "All time") {
      start = new Date(0);
    } else if (l === "Today") {
      start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0,
        0,
        0,
        0
      );
    } else if (l === "Yesterday") {
      const y = new Date(now);
      y.setDate(now.getDate() - 1);
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      end = new Date(
        y.getFullYear(),
        y.getMonth(),
        y.getDate(),
        23,
        59,
        59,
        999
      );
    } else if (l === "Last Week") {
      const endDay = new Date(now);
      endDay.setDate(now.getDate() - 1);
      end = new Date(
        endDay.getFullYear(),
        endDay.getMonth(),
        endDay.getDate(),
        23,
        59,
        59,
        999
      );
      const s = new Date(endDay);
      s.setDate(endDay.getDate() - 6);
      start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
    } else if (l === "Last Month") {
      const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastOfPrev = new Date(firstOfThisMonth);
      lastOfPrev.setDate(0);
      start = new Date(
        lastOfPrev.getFullYear(),
        lastOfPrev.getMonth(),
        1,
        0,
        0,
        0,
        0
      );
      end = new Date(
        lastOfPrev.getFullYear(),
        lastOfPrev.getMonth(),
        lastOfPrev.getDate(),
        23,
        59,
        59,
        999
      );
    } else {
      // default last 30 days
      start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    }
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const fetchTrend = async (sISO, eISO) => {
    try {
      const res = await dashboardAPI.getRevenueTrend({
        startDate: sISO,
        endDate: eISO,
      });
      const payload = res.data || res;
      setTotal(typeof payload.total !== "undefined" ? payload.total : 0);
      setPoints(Array.isArray(payload.points) ? payload.points : []);
    } catch (err) {
      console.error("Failed to load revenue trend:", err);
      setTotal(0);
      setPoints([]);
    }
  };

  useEffect(() => {
    // prefer parent-provided range when available
    if (propStart && propEnd) {
      setLabel("Custom");
      fetchTrend(propStart, propEnd);
      return;
    }
    // otherwise default to All time on mount
    const r = computeRangeForLabel(label);
    fetchTrend(r.start, r.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (propStart && propEnd) {
      setLabel("Custom");
      fetchTrend(propStart, propEnd);
    }
  }, [propStart, propEnd]);

  const handleSelect = (l, e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLabel(l);
    const r = computeRangeForLabel(l);
    fetchTrend(r.start, r.end);
  };

  const opts = chartOptions || defaultChart.options;
  const series =
    chartSeries ||
    (points.length ? [{ name: "Revenue", data: points }] : defaultChart.series);

  const displayTotal = `$${Number(total || 0).toLocaleString()}`;

  return (
    <div
      className="card"
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-4">Revenue Statistics</h4>
        <div className="d-flex align-items-center">
          <h4 className="mb-0">{displayTotal}</h4>
          <div className="media-body ps-3 ms-auto">
            <div className="dropdown">
              <button
                className="btn btn-light btn-sm dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {label}
                <i className="mdi mdi-chevron-down ms-1" />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => handleSelect("All time", e)}
                  >
                    All time
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => handleSelect("Today", e)}
                  >
                    Today
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => handleSelect("Yesterday", e)}
                  >
                    Yesterday
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => handleSelect("Last Week", e)}
                  >
                    Last Week
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="#"
                    onClick={(e) => handleSelect("Last Month", e)}
                  >
                    Last Month
                  </a>
                </li>
              </ul>
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
