import { useState, useEffect } from "react";
import { historyAPI, reportAPI } from "../utils/api";
import toast from "react-hot-toast";
import { Trash2, Download, ChevronLeft, ChevronRight, History as HistoryIcon, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";

const RISK_BADGE = {
  Low: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  Moderate: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  High: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  Critical: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function History() {
  const [predictions, setPredictions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const limit = 10;

  const fetchHistory = async (p = 0) => {
    setLoading(true);
    try {
      const res = await historyAPI.getHistory(p * limit, limit);
      setPredictions(res.data.predictions);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(page); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this prediction?")) return;
    setDeletingId(id);
    try {
      await historyAPI.deleteHistory(id);
      toast.success("Deleted");
      fetchHistory(page);
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (id, disease) => {
    setDownloadingId(id);
    try {
      const res = await reportAPI.downloadReport(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${disease.replace(/ /g, "_")}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch {
      toast.error("Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prediction History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{total} total prediction{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl px-4 py-2 border border-gray-100 dark:border-gray-800">
          <HistoryIcon className="w-4 h-4" />
          <span>All time</span>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="card p-16 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
            <HistoryIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🩺 No health assessments yet</h3>
            <p className="text-sm text-gray-400">Make your first prediction to start tracking
your health journey.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {predictions.map((pred) => (
              <div key={pred.id} className="card p-5 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{pred.disease}</h3>
                        <span className={`badge ${RISK_BADGE[pred.risk_level] || RISK_BADGE.Moderate}`}>
                          {pred.risk_level}
                        </span>
                        <span className="badge bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800">
                          {pred.confidence.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(pred.symptoms || []).slice(0, 5).map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                            {s}
                          </span>
                        ))}
                        {pred.symptoms?.length > 5 && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-md">
                            +{pred.symptoms.length - 5} more
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(pred.created_at), "MMM d, yyyy 'at' h:mm a")}
                        {pred.health_score !== null && (
                          <span className="ml-2 text-teal-600 dark:text-teal-400 font-medium">
                            Health score: {pred.health_score?.toFixed(0)}/100
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDownload(pred.id, pred.disease)}
                      disabled={downloadingId === pred.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                      title="📄 Download Health Report"
                    >
                      {downloadingId === pred.id ? (
                        <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(pred.id)}
                      disabled={deletingId === pred.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      {deletingId === pred.id ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-secondary flex items-center gap-1 text-sm py-2 px-3 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary flex items-center gap-1 text-sm py-2 px-3 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}