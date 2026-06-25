import { useState, useEffect } from "react";
import { adminAPI } from "../utils/api";
import toast from "react-hot-toast";
import { Users, Activity, Shield, Trash2, ChevronLeft, ChevronRight, BarChart3, User } from "lucide-react";
import { format } from "date-fns";

function StatCard({ icon: Icon, label, value, color }) {
  const colorMap = {
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
  };
  return (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [tab, setTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [userPage, setUserPage] = useState(0);
  const [predPage, setPredPage] = useState(0);
  const [userTotal, setUserTotal] = useState(0);
  const [predTotal, setPredTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    adminAPI.getStats()
      .then((r) => setStats(r.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    adminAPI.getUsers(userPage * limit, limit)
      .then((r) => { setUsers(r.data.users); setUserTotal(r.data.total); })
      .catch(() => toast.error("Failed to load users"));
  }, [userPage]);

  useEffect(() => {
    adminAPI.getPredictions(predPage * limit, limit)
      .then((r) => { setPredictions(r.data.predictions); setPredTotal(r.data.total); })
      .catch(() => toast.error("Failed to load predictions"));
  }, [predPage]);

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? All their data will be removed.`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success("User deleted");
      setUsers((u) => u.filter((x) => x.id !== id));
      setUserTotal((t) => t - 1);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Delete failed");
    }
  };

  const handleDeletePred = async (id) => {
    if (!confirm("Delete this prediction?")) return;
    try {
      await adminAPI.deletePrediction(id);
      toast.success("Deleted");
      setPredictions((p) => p.filter((x) => x.id !== id));
      setPredTotal((t) => t - 1);
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const RISK_BADGE = {
    Low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    High: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    Critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage users and predictions</p>
        </div>
      </div>

      {/* Stats */}
      <StatCard
        icon={Shield}
        label="System Status"
        value="Online"
        color="green"
      />
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats.total_users} color="teal" />
          <StatCard icon={Activity} label="Total Predictions" value={stats.total_predictions} color="blue" />
          <StatCard icon={User} label="Active Today" value={stats.active_users_today} color="green" />
          <StatCard icon={BarChart3} label="Top Disease" value={stats.top_diseases?.[0]?.disease?.split(" ").slice(0, 2).join(" ") || "—"} color="purple" />
        </div>
      )}

      {/* Top diseases */}
      {stats?.top_diseases?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top 5 Predicted Diseases</h3>
          <div className="space-y-3">
            {stats.top_diseases.slice(0, 5).map((d, i) => {
              const max = stats.top_diseases[0].count;
              const pct = (d.count / max) * 100;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-gray-400 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{d.disease}</span>
                      <span className="text-xs text-gray-400">{d.count} predictions</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card p-5">
        <h3 className="font-semibold mb-4">
          Platform Insights
        </h3>

        <div className="grid md:grid-cols-3 gap-4">

          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20">
            <p className="text-sm text-gray-500">
              Most Common Disease
            </p>
            <p className="font-bold mt-1">
              {stats.top_diseases?.[0]?.disease}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20">
            <p className="text-sm text-gray-500">
              Total Users
            </p>
            <p className="font-bold mt-1">
              {stats.total_users}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
            <p className="text-sm text-gray-500">
              Predictions Made
            </p>
            <p className="font-bold mt-1">
              {stats.total_predictions}
            </p>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          {[
            { key: "users", label: `Users (${userTotal})`, icon: Users },
            { key: "predictions", label: `Predictions (${predTotal})`, icon: Activity },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-teal-600 text-teal-600 dark:text-teal-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "users" && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["User", "Email", "Role", "Predictions", "Last Login", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {u.picture ? (
                            <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${u.is_admin ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                          {u.is_admin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{u.prediction_count}</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {u.last_login ? format(new Date(u.last_login), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {!u.is_admin && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  No users found
                </div>
              )}
            </div>
            {Math.ceil(userTotal / limit) > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500">Page {userPage + 1} of {Math.ceil(userTotal / limit)}</p>
                <div className="flex gap-2">
                  <button onClick={() => setUserPage((p) => Math.max(0, p - 1))} disabled={userPage === 0} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40 flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button onClick={() => setUserPage((p) => p + 1)} disabled={userPage >= Math.ceil(userTotal / limit) - 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40 flex items-center gap-1">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "predictions" && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["Disease", "Risk", "Confidence", "Symptoms", "Date", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {predictions.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{p.disease}</td>
                      <td className="px-5 py-3">
                        <span className={`badge ${RISK_BADGE[p.risk_level] || "bg-gray-100 text-gray-600"}`}>
                          {p.risk_level || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{p.confidence?.toFixed(1)}%</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {(p.symptoms || []).slice(0, 3).join(", ")}{p.symptoms?.length > 3 ? "..." : ""}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs">
                        {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleDeletePred(p.id)}
                          className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="p-10 text-center text-gray-400">
                  No users found
                </div>
              )}
            </div>
            {Math.ceil(predTotal / limit) > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500">Page {predPage + 1} of {Math.ceil(predTotal / limit)}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPredPage((p) => Math.max(0, p - 1))} disabled={predPage === 0} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40 flex items-center gap-1">
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <button onClick={() => setPredPage((p) => p + 1)} disabled={predPage >= Math.ceil(predTotal / limit) - 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40 flex items-center gap-1">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}