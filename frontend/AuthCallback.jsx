import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login, fetchMe } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      toast.error("Authentication failed");
      navigate("/login");
      return;
    }
    localStorage.setItem("token", token);
    fetchMe().then(() => {
      toast.success("Welcome to CuraAI!");
      navigate("/");
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Signing you in...</p>
      </div>
    </div>
  );
}