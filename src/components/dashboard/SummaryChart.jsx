import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { dashboardAPI } from "../../utils/api";

const defaultOptions = {
  chart: {
    type: "bar",
    stacked: true,
    toolbar: { show: false },
    zoom: { enabled: true },
  },
  plotOptions: {
    bar: { horizontal: false, columnWidth: "20%", endingShape: "rounded" },
  },
  dataLabels: {
    enabled: true,
    style: {
      colors: ["#ffffff"],
    },
  },
  xaxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  colors: ["#525ce5", "#34c38f"],
  legend: { show: false },
  fill: { opacity: 1 },
  tooltip: {
    theme: "dark",
    style: {
      fontSize: "12px",
      fontFamily: "inherit",
      backgroundColor: "#1F293D",
    },
    x: {
      show: true,
    },
    y: {
      formatter: function (val) {
        return val;
      },
    },
  },
};

const defaultSeries = [
  { name: "Total Cars", data: [5, 7, 7, 6, 7, 5, 7, 6, 7, 4, 6, 7] },
  { name: "Scraped", data: [3, 4, 5, 4, 5, 3, 4, 4, 5, 2, 4, 5] },
];

const SummaryChart = ({
  options,
  series,
  groupBy = "month",
  startDate,
  endDate,
}) => {
  const [labels, setLabels] = useState(defaultOptions.xaxis.categories);
  const [dataSeries, setDataSeries] = useState(defaultSeries);

  useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      try {
        const params = { groupBy };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        console.debug("SummaryChart.fetchSummary params:", params);
        const res = await dashboardAPI.getSummary(params);
        const payload = res.data || res;
        console.debug(
          "SummaryChart.fetchSummary payload:",
          payload && {
            labelsLen: payload.labels?.length,
            seriesLen: payload.series?.map?.((s) => s.data?.length),
          }
        );
        if (!mounted) return;
        if (Array.isArray(payload.labels) && Array.isArray(payload.series)) {
          // Format labels based on groupBy
          let displayLabels = payload.labels;
          try {
            if (groupBy === "hour") {
              // For hourly grouping, show time only in 24-hour format (HH:00)
              displayLabels = payload.labels.map((lbl) => {
                // Expecting formats like 'YYYY-MM-DDTHH' or 'YYYY-MM-DDTHH:mm' or ISO strings
                const m = String(lbl).match(/T?(\d{2})(?::\d{2})?$/);
                if (m && m[1] !== undefined) return `${m[1]}:00`;
                // Fallback: parse date and extract hour
                const d = new Date(lbl);
                if (!isNaN(d))
                  return `${String(d.getHours()).padStart(2, "0")}:00`;
                return lbl;
              });
            } else if (groupBy === "day") {
              // For daily grouping, show day only (1, 2, 3, ...)
              displayLabels = payload.labels.map((lbl) => {
                // Expecting format 'YYYY-MM-DD'
                const m = String(lbl).match(/\d{4}-\d{2}-(\d{2})$/);
                if (m && m[1] !== undefined) return String(parseInt(m[1], 10));
                // Fallback: parse date and extract day
                const d = new Date(lbl);
                if (!isNaN(d)) return String(d.getDate());
                return lbl;
              });
            } else if (groupBy === "month") {
              // For monthly grouping (year view), convert labels like '2025-01' to month names
              const monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              displayLabels = payload.labels.map((lbl) => {
                // Expecting format 'YYYY-MM' or 'YYYY-MM-DD' sometimes
                const m = String(lbl).match(/\d{4}-(\d{2})$/);
                if (m && m[1] !== undefined) {
                  const mi = parseInt(m[1], 10) - 1;
                  if (mi >= 0 && mi < 12) return monthNames[mi];
                }
                // Fallback: try parsing as date and get month
                const d = new Date(lbl);
                if (!isNaN(d)) return monthNames[d.getMonth()];
                return lbl;
              });
            }
          } catch (e) {
            console.warn("Failed to format labels", e);
            displayLabels = payload.labels;
          }

          // normalize series lengths to labels length (pad with zeros)
          const normalizedSeries = (payload.series || []).map((s) => {
            const data = Array.isArray(s.data) ? s.data.slice() : [];
            if (data.length < displayLabels.length) {
              return {
                name: s.name,
                data: [
                  ...data,
                  ...Array(displayLabels.length - data.length).fill(0),
                ],
              };
            }
            if (data.length > displayLabels.length) {
              return {
                name: s.name,
                data: data.slice(0, displayLabels.length),
              };
            }
            return s;
          });

          setLabels(displayLabels);
          setDataSeries(normalizedSeries);
        }
      } catch (err) {
        console.error("Failed to load dashboard summary:", err);
      }
    };

    fetchSummary();
    return () => {
      mounted = false;
    };
  }, [groupBy, startDate, endDate]);

  const opts = options
    ? { ...options, xaxis: { ...(options.xaxis || {}), categories: labels } }
    : {
        ...defaultOptions,
        xaxis: { ...defaultOptions.xaxis, categories: labels },
      };

  const s = series || dataSeries;
  const chartKey = `${labels.join("|")}-${s
    .map((sr) => (sr.data ? sr.data.length : 0))
    .join(",")}`;

  return (
    <div>
      <Chart key={chartKey} options={opts} series={s} type="bar" height={380} />
    </div>
  );
};

export default SummaryChart;
