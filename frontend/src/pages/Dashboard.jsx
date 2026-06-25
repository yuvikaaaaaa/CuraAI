import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import PredictionForm from "../components/PredictionForm";
import DiseaseCard from "../components/DiseaseCard";
import { Activity, Clock, TrendingUp, Heart } from "lucide-react";
import { format } from "date-fns";
import { historyAPI } from "../utils/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };
  useEffect(() => {
    const loadDashboardData = async () => {
        try {
        const analyticsRes = await historyAPI.getAnalytics();
        const historyRes = await historyAPI.getHistory(0, 5);

        setAnalytics(analyticsRes.data);
        setRecentPredictions(historyRes.data.predictions);
        } catch (err) {
        console.error(err);
        }
    };

    loadDashboardData();
    }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome card */}
      <div className="card p-6 bg-gradient-to-r from-teal-600 to-cyan-600 border-0 text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-14 h-14 rounded-full ring-2 ring-white/50 object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-teal-100 text-sm font-medium">Welcome Back!</p>
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <p className="text-teal-100 text-xs mt-0.5">  Your AI Health Assistant is here.</p>
            </div>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 rounded-xl px-4 py-3 backdrop-blur text-sm">
            <Clock className="w-4 h-4 text-teal-200" />
            <span className="text-teal-100">{format(new Date(), "EEEE, MMMM d, yyyy")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-5 border-t border-white/20">
          {[
            { label: "AI Powered", icon: Activity, desc: "Health Assistant" },
            { label: "Personalized Recommendations", icon: TrendingUp, desc: "Disease types" },
            { label: "Instant Results", icon: Heart, desc: "With recommendations" },
          ].map(({ label, icon: Icon, desc }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-teal-100" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-teal-200">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-lg mb-3">
            Today's Health Tip
        </h3>

        <p className="text-gray-600 dark:text-gray-400">
            Staying hydrated, maintaining a balanced diet,
            and exercising regularly can significantly improve
            overall health and reduce future risks.
        </p>
        </div>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="card p-5">
            <p className="text-sm text-gray-500">
                Predictions
            </p>
            <h3 className="text-3xl font-bold text-teal-600">
                {analytics.total_predictions}
            </h3>
            </div>

            <div className="card p-5">
            <p className="text-sm text-gray-500">
                Health Score
            </p>
            <h3 className="text-3xl font-bold text-green-600">
                {analytics.avg_health_score}
            </h3>
            </div>

            <div className="card p-5">
            <p className="text-sm text-gray-500">
                Most Common Disease
            </p>
            <h3 className="text-lg font-bold text-yellow-600">
                {analytics.most_frequent_disease || "N/A"}
            </h3>
            </div>

            <div className="card p-5">
            <p className="text-sm text-gray-500">
                Disease Types
            </p>
            <h3 className="text-3xl font-bold text-cyan-600">
                {analytics.disease_distribution?.length || 0}
            </h3>
            </div>

        </div>
        )}

      {/* Prediction form */}
      <PredictionForm
        onResult={setPrediction}
        loading={loading}
        setLoading={setLoading}
      />

      {/* Results */}
      {!prediction && !loading && (
        <div className="card p-12 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center">
            <Activity className="w-8 h-8 text-teal-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Ready to analyze</h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Select your symptoms above and click "Predict Disease" to get AI-powered health recommendations.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-teal-50 dark:bg-teal-900/20 rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Analyzing symptoms...</h3>
            <p className="text-sm text-gray-400">Our AI model is processing your inputs</p>
          </div>
        </div>
      )}

      {prediction && !loading && <DiseaseCard prediction={prediction} />}

      {recentPredictions.length > 0 && (
        <div className="card p-5">

            <h3 className="font-semibold text-lg mb-4">
            Recent Activity
            </h3>

            <div className="space-y-3">

            {recentPredictions.slice(0, 5).map((item) => (
                <div
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
                >
                <span className="font-medium">
                    {item.disease}
                </span>

                <span className="text-sm text-gray-400">
                    {item.confidence.toFixed(1)}%
                </span>
                </div>
            ))}

            </div>

        </div>
        )}
    </div>
  );
}