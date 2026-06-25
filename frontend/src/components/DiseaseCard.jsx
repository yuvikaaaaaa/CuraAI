import { useState } from "react";
import { reportAPI } from "../utils/api";
import toast from "react-hot-toast";
import {
  AlertTriangle, Download, Pill, Salad, ShieldCheck,
  Dumbbell, Info, TrendingUp, Activity, ChevronDown, ChevronUp
} from "lucide-react";

const RISK_COLORS = {
  Low: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800",
  Moderate: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  High: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  Critical: "text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800",
};

const RISK_DOT = {
  Low: "bg-green-500",
  Moderate: "bg-yellow-500",
  High: "bg-orange-500",
  Critical: "bg-red-500",
};

function HealthGauge({ score }) {
  const pct = Math.min(100, Math.max(0, score));
  const color = pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444";
  const dashArray = 188.5;
  const dashOffset = dashArray - (pct / 100) * dashArray;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 80 60" className="w-32">
        <path d="M10 40 A30 30 0 0 1 70 40" fill="none" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" className="dark:stroke-gray-700" />
        <path
          d="M10 40 A30 30 0 0 1 70 40"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 94.25} 94.25`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        <text x="40" y="44" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>{pct.toFixed(0)}</text>
      </svg>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Health Score / 100</p>
    </div>
  );
}

function Section({ icon: Icon, title, items, color = "teal", emptyText }) {
  const [open, setOpen] = useState(true);
  const colorMap = {
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  };
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
          <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
        </div>
        <span className="flex-1 text-left font-semibold text-gray-900 dark:text-white text-sm">{title}</span>
        <span className="text-xs text-gray-400 mr-2">{items?.length || 0} items</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {open && (
        <div className="px-5 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
          {items && items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-semibold text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5">{i + 1}</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">{emptyText || "No data available"}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiseaseCard({ prediction }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await reportAPI.downloadReport(prediction.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `health_report_${prediction.disease.replace(/ /g, "_")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  const riskColor = RISK_COLORS[prediction.risk_level] || RISK_COLORS.Moderate;
  const riskDot = RISK_DOT[prediction.risk_level] || "bg-yellow-500";

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Main disease card */}
      <div className="card p-6 animate-fade-in">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200 dark:shadow-teal-900/50 flex-shrink-0">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Predicted Condition</p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{prediction.disease}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`badge border ${riskColor} flex items-center gap-1.5 px-4 py-1.5`}>
                  <span className={`w-2 h-2 rounded-full ${riskDot} animate-pulse-slow`} />
                  {prediction.risk_level} Risk
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download Report
          </button>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">

          <div className="flex flex-col items-center p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <HealthGauge score={prediction.health_score || 0} />
          </div>

          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {prediction.severity_score?.toFixed(1) || "—"}
            </p>
            <p className="text-sm text-gray-500">
              Severity Score
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
            <TrendingUp className="w-6 h-6 text-teal-500 mb-2" />
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {prediction.risk_level || "—"}
            </p>
            <p className="text-sm text-gray-500">
              Risk Level
            </p>
          </div>

        </div>
      </div>

      {/* Description */}
      <div className="card p-5 flex items-start gap-3">
        <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
            About {prediction.disease}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {prediction.description ||
              "Detailed information for this condition is currently unavailable."}
          </p>
        </div>
      </div>

      {/* Detailed sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section
          icon={Pill}
          title="Recommended Medications"
          items={prediction.medications}
          color="blue"
          emptyText="No medication data available"
        />

        <Section
          icon={Salad}
          title="Diet Plan"
          items={prediction.diet}
          color="green"
          emptyText="No diet data available"
        />

        <Section
          icon={ShieldCheck}
          title="Precautions"
          items={prediction.precautions}
          color="purple"
          emptyText="No precaution data available"
        />

        <Section
          icon={Dumbbell}
          title="Exercise & Workout"
          items={prediction.workout}
          color="orange"
          emptyText="No workout data available"
        />
      </div>
    </div>
  );
}