import { useState, useEffect } from "react";
import Select from "react-select";
import { predictAPI } from "../utils/api";
import toast from "react-hot-toast";
import { Search, Zap, X } from "lucide-react";

export default function PredictionForm({ onResult, loading, setLoading }) {
  const [symptoms, setSymptoms] = useState([]);
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);

  useEffect(() => {
    predictAPI.getSymptoms()
      .then((res) => {
        const opts = res.data.symptoms.map((s) => ({
          value: s,
          label: s.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
        }));
        setAllSymptoms(opts);
      })
      .catch(() => toast.error("Could not load symptoms list"))
      .finally(() => setLoadingSymptoms(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (symptoms.length === 0) {
      toast.error("Please select at least one symptom");
      return;
    }
    setLoading(true);
    try {
      const res = await predictAPI.predict(symptoms.map((s) => s.value));
      onResult(res.data);
      toast.success(`Prediction complete: ${res.data.disease}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-xl flex items-center justify-center">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Symptom Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Select all symptoms you're experiencing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search & select symptoms
          </label>
          <Select
            isMulti
            isSearchable
            isLoading={loadingSymptoms}
            options={allSymptoms}
            value={symptoms}
            onChange={setSymptoms}
            placeholder="Type to search symptoms (e.g. fever, headache, cough...)"
            classNamePrefix="react-select"
            noOptionsMessage={() => "No matching symptoms found"}
            loadingMessage={() => "Loading symptoms..."}
            styles={{
              control: (base) => ({
                ...base,
                minHeight: 58,
                borderRadius: 16,
              }),
            }}
          />
          {symptoms.length > 0 && (
            <div className="mt-3">

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">
                  {symptoms.length} selected
                </p>

                <button
                  type="button"
                  onClick={() => setSymptoms([])}
                  className="text-red-500 text-sm"
                >
                  Clear All
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {symptoms.map((s) => (
                  <span
                    key={s.value}
                    className="
                    px-3
                    py-1
                    rounded-full
                    bg-teal-100
                    text-teal-700
                    text-sm
                    "
                  >
                    {s.label}
                  </span>
                ))}
              </div>

            </div>
          )}
        </div>
        

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Popular Symptoms
          </p>

          <div className="flex flex-wrap gap-2">
            {[
              "fever",
              "headache",
              "cough",
              "fatigue",
              "vomiting",
              "nausea",
              "chest pain",
              "abdominal pain"
            ].map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => {
                  const exists = symptoms.find(
                    (s) => s.value === symptom
                  );

                  if (!exists) {
                    const item = allSymptoms.find(
                      (s) => s.value === symptom
                    );

                    if (item) {
                      setSymptoms([...symptoms, item]);
                    }
                  }
                }}
                className="
                px-3
                py-2
                rounded-full
                bg-teal-50
                text-teal-700
                hover:bg-teal-100
                text-sm
                "
              >
                {symptom}
              </button>
            ))}
          </div>
        </div>


        <button
          type="submit"
          disabled={loading || symptoms.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing symptoms...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analyze Symptoms
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3">
          AI-powered predictions are for informational purposes only.
        </p>
      </form>
    </div>
  );
}