import { useState, useEffect } from "react";
import { historyAPI } from "../utils/api";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, Activity, Target, Heart, BarChart3, AlertTriangle } from "lucide-react";

const COLORS = ["#0d9488", "#0891b2", "#7c3aed", "#d97706", "#dc2626", "#059669", "#c026d3", "#ea580c"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 shadow-xl text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, label, value, sub, color = "teal" }) {
  const colorMap = {
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400",
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold md:text-3xl text-gray-900 dark:text-white break-words">{value}</p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historyAPI.getAnalytics()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || data.total_predictions === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h1>
        <div className="card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No data yet</h3>
            <p className="text-sm text-gray-400">Make some predictions to see your analytics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your health prediction insights</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Total Predictions" sub="Across all health assessments" value={data.total_predictions} color="teal" />
        <StatCard
          icon={Target}
          label="Most Common Disease"
          value={data.most_frequent_disease}
          color="blue"
        />
        <StatCard
          icon={AlertTriangle}
          label="Most Common Risk"
          value={data.most_common_risk}
          color="yellow"
        />
        <StatCard
          icon={Heart}
          label="Avg Health Score"
          value={`${data.avg_health_score.toFixed(0)}/100`}
          color="green"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disease distribution bar chart */}
        <div className="card p-4 md:p-5 overflow-x-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Disease Distribution</h3>
          <div className="min-w-[500px] h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.disease_distribution} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis type="number" tick={{ fontSize: 11 }} className="fill-gray-400" />
              <YAxis
                type="category"
                dataKey="disease"
                width={100}
                tick={{ fontSize: 12 }}
                className="fill-gray-500 dark:fill-gray-400"
                tickFormatter={(v) =>
                  v.length > 12 ? v.substring(0, 12) + "…" : v
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Predictions" radius={[0, 4, 4, 0]}>
                {data.disease_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="card p-4 md:p-5 overflow-x-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Prediction Share</h3>
          {data.disease_distribution.length > 0 ? (
            <div className="min-w-[450px] h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.disease_distribution}
                  dataKey="count"
                  nameKey="disease"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  paddingAngle={3}
                  label={({ disease, percent }) =>
                    percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {data.disease_distribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend
                  formatter={(value) => value.length > 100 ? value.slice(0, 18) + "…" : value}
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">No data</div>
          )}
        </div>
      </div>

      {/* Trend line chart */}
      {data.prediction_trend.length > 0 && (
        <div className="card p-4 md:p-5 overflow-x-auto">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Prediction Trend (Last 30 Days)</h3>
          <div className="min-w-[500px] h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.prediction_trend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-gray-800" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                className="fill-gray-400"
                tickFormatter={(v) => {
                  const d = new Date(v);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis tick={{ fontSize: 11 }} className="fill-gray-400" allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Predictions"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ fill: "#0d9488", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}