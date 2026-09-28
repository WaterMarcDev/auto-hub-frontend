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
          // Compute canonical expected labels from startDate/endDate for month/day
          // to avoid an extra leading/trailing bucket returned by the API.
          let expectedLabels = null; // canonical labels like 'YYYY-MM' or 'YYYY-MM-DD'
          let displayLabels = payload.labels;

          const pad = (n) => (String(n).length === 1 ? `0${n}` : String(n));

          try {
            if (groupBy === "month" && startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const months = [];
              const cur = new Date(start.getFullYear(), start.getMonth(), 1);
              while (cur <= end) {
                months.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}`);
                cur.setMonth(cur.getMonth() + 1);
              }
              expectedLabels = months;

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
              displayLabels = expectedLabels.map((lbl) => {
                const m = String(lbl).match(/\d{4}-(\d{2})$/);
                if (m && m[1] !== undefined) {
                  const mi = parseInt(m[1], 10) - 1;
                  return monthNames[mi] || lbl;
                }
                return lbl;
              });
            } else if (groupBy === "day" && startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const days = [];
              const cur = new Date(
                start.getFullYear(),
                start.getMonth(),
                start.getDate()
              );
              while (cur <= end) {
                days.push(
                  `
                  ${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(
                    cur.getDate()
                  )}
                `.trim()
                );
                cur.setDate(cur.getDate() + 1);
              }
              expectedLabels = days;
              displayLabels = expectedLabels.map((lbl) => {
                const m = String(lbl).match(/\d{4}-\d{2}-(\d{2})$/);
                if (m && m[1] !== undefined) return String(parseInt(m[1], 10));
                return lbl;
              });
            } else if (groupBy === "hour") {
              displayLabels = payload.labels.map((lbl) => {
                const m = String(lbl).match(/T?(\d{2})(?::\d{2})?$/);
                if (m && m[1] !== undefined) return `${m[1]}:00`;
                const d = new Date(lbl);
                if (!isNaN(d))
                  return `${String(d.getHours()).padStart(2, "0")}:00`;
                return lbl;
              });
            }
          } catch (e) {
            console.warn("Failed to compute expected labels", e);
            displayLabels = payload.labels;
            expectedLabels = null;
          }

          const canonicalLabels = expectedLabels || payload.labels;

          const normalizedSeries = (payload.series || []).map((s) => {
            const srcData = Array.isArray(s.data) ? s.data.slice() : [];
            if (expectedLabels) {
              const labelToValue = {};
              (payload.labels || []).forEach((lab, idx) => {
                labelToValue[String(lab)] =
                  srcData[idx] !== undefined ? srcData[idx] : 0;
              });
              const mapped = canonicalLabels.map((cl) => {
                if (labelToValue[cl] !== undefined) return labelToValue[cl];
                const foundKey = Object.keys(labelToValue).find((k) =>
                  String(k).startsWith(String(cl))
                );
                if (foundKey) return labelToValue[foundKey];
                return 0;
              });
              return { name: s.name, data: mapped };
            }

            const data = srcData;
            if (data.length < canonicalLabels.length) {
              return {
                name: s.name,
                data: [
                  ...data,
                  ...Array(canonicalLabels.length - data.length).fill(0),
                ],
              };
            }
            if (data.length > canonicalLabels.length) {
              return {
                name: s.name,
                data: data.slice(0, canonicalLabels.length),
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
