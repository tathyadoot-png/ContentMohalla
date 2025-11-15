// "use client";
// import React, { useEffect, useState } from "react";
// import { Line, Bar, Pie } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import api from "@/utils/api"; // <-- use your Axios instance with token

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Tooltip,
//   Legend
// );

// const AnalyticsDashboard = () => {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         const res = await api.get("/analytics"); // use Axios instance
//         setData(res.data);
//       } catch (err) {
//         console.error("Failed to fetch analytics:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, []);

//   if (loading) return <div>Loading analytics...</div>;
//   if (!data) return <div>No data available</div>;

//   const {
//     summary,
//     trend,
//     topPages,
//     trafficSources,
//     geo,
//     devices,
//     events,
//     browsers,
//     os,
//     referrals,
//   } = data;

//   return (
//     <div className="p-6 space-y-6">
//       {/* Summary */}
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
//         {Object.entries(summary).map(([key, value]) => (
//           <div key={key} className="p-4 bg-white shadow rounded text-center">
//             <h4 className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
//             <p className="text-xl font-bold">{value}</p>
//           </div>
//         ))}
//       </div>

//       {/* Trend Chart */}
//       <div className="bg-white shadow p-4 rounded">
//         <h3 className="font-bold mb-2">Weekly Trend</h3>
//         <Line
//           data={{
//             labels: trend.dates,
//             datasets: [
//               { label: "Active Users", data: trend.activeUsers, borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.2)", tension: 0.1 },
//               { label: "Sessions", data: trend.sessions, borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.2)", tension: 0.1 },
//               { label: "Page Views", data: trend.pageViews, borderColor: "#10b981", backgroundColor: "rgba(16,185,129,0.2)", tension: 0.1 },
//             ],
//           }}
//           options={{ responsive: true }}
//         />
//       </div>

//       {/* Top Pages */}
//       <div className="bg-white shadow p-4 rounded">
//         <h3 className="font-bold mb-2">Top Pages</h3>
//         <ul>
//           {topPages.map((p, i) => (
//             <li key={i} className="flex justify-between py-1 border-b">
//               <span>{p.title || '(not set)'}</span>
//               <span>{p.value}</span>
//             </li>
//           ))}
//         </ul>
//       </div>

//       {/* Traffic Sources & Geo */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-white shadow p-4 rounded">
//           <h3 className="font-bold mb-2">Traffic Sources</h3>
//           <Bar
//             data={{
//               labels: trafficSources.map(s => `${s.source || '(direct)'} / ${s.medium || '(none)'}`),
//               datasets: [{ label: "Sessions", data: trafficSources.map(s => s.sessions), backgroundColor: "#3b82f6" }],
//             }}
//             options={{ indexAxis: "y", responsive: true }}
//           />
//         </div>

//         <div className="bg-white shadow p-4 rounded">
//           <h3 className="font-bold mb-2">Top Countries</h3>
//           <Bar
//             data={{
//               labels: geo.map(c => c.country || 'Unknown'),
//               datasets: [{ label: "Active Users", data: geo.map(c => c.count), backgroundColor: "#10b981" }],
//             }}
//             options={{ indexAxis: "y", responsive: true }}
//           />
//         </div>
//       </div>

//       {/* Devices & Browsers */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="bg-white shadow p-4 rounded">
//           <h3 className="font-bold mb-2">Devices</h3>
//           <Pie
//             data={{
//               labels: devices.map(d => d.device || 'Unknown'),
//               datasets: [{ data: devices.map(d => d.count), backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"] }],
//             }}
//           />
//         </div>

//         <div className="bg-white shadow p-4 rounded">
//           <h3 className="font-bold mb-2">Browsers</h3>
//           <Pie
//             data={{
//               labels: browsers.map(b => b.browser || 'Unknown'),
//               datasets: [{ data: browsers.map(b => b.count), backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444"] }],
//             }}
//           />
//         </div>
//       </div>

//       {/* OS, Events, Referrals */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white shadow p-4 rounded">
//           <h3 className="font-bold mb-2">Operating Systems</h3>
//           <ul>{os.map((o,i)=><li key={i}>{o.os || 'Unknown'}: {o.count}</li>)}</ul>
//         </div>
//         <div className="bg-white shadow p-4 rounded">
//           <h3 className="font-bold mb-2">Top Events</h3>
//           <ul>{events.map((e,i)=><li key={i}>{e.event}: {e.value}</li>)}</ul>
//         </div>
//         <div className="bg-white shadow p-4 rounded">
//           <h3 className="font-bold mb-2">Referral URLs</h3>
//           <ul>{referrals.map((r,i)=><li key={i} className="truncate">{r.url || '(direct)'}: {r.count}</li>)}</ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AnalyticsDashboard;