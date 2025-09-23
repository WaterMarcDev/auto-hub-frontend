import React from "react";
import Chart from "react-apexcharts";

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
  dataLabels: { enabled: true },
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
  colors: ["#525ce5", "#edf1f5"],
  legend: { show: false },
  fill: { opacity: 1 },
};

const defaultSeries = [
  { name: "Earning", data: [5, 7, 7, 6, 7, 5, 7, 6, 7, 4, 6, 7] },
  { name: "Paid", data: [5, 6, 4, 5, 6, 4, 3, 5, 4, 6, 4, 3] },
];

const SummaryChart = ({ options, series }) => {
  const opts = options || defaultOptions;
  const s = series || defaultSeries;
  return (
    <div>
      <Chart options={opts} series={s} type="bar" height={380} />
    </div>
  );
};

export default SummaryChart;
