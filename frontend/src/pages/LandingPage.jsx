import { useState, useEffect } from "react";
export default function LandingPage() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
    if (darkMode) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
    }, [darkMode]);

  return (
    <div className="
    min-h-screen
    bg-gradient-to-br
    from-[#f8faf9]
    via-[#f5fbfa]
    to-[#eaf8f6]
    dark:from-slate-950
    dark:via-slate-900
    dark:to-slate-950
    ">

      {/* NAVBAR */}
      <nav className="
        max-w-[1400px]
        mx-auto
        mt-4
        rounded-3xl
        bg-white/90
        dark:bg-slate-900/90
        backdrop-blur-xl
        shadow-lg
        ">
        <div className="max-w-[2000px] mx-auto px-8 h-24 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <img
                src="/logo.png"
                alt="CuraAI"
                className="w-10 h-10 object-contain"
            />
            <h1 className="text-3xl font-bold text-teal-600">
                CuraAI
            </h1>
            </div>

          <div className="hidden md:flex gap-10 text-slate-700 dark:text-slate-200 font-medium">
            <a href="#">Home</a>
            <a href="#">Features</a>
            <a href="#">How It Works</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </div>

          <div className="flex items-center gap-4">

            <button
            onClick={() => setDarkMode(!darkMode)}
            className="
            w-12
            h-12
            rounded-full
            bg-white
            flex
            items-center
            justify-center
            text-xl
            "
            >
            {darkMode ? "☀️" : "🌙"}
            </button>

            <a
                href="/login"
                className="
                bg-gradient-to-r
                from-teal-500
                to-cyan-500
                text-white
                px-6
                py-3
                rounded-xl
                "
            >
                Login
            </a>

            </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="relative max-w-[1450px] mx-auto px-8 md: px-8 pt-7 pb-16">
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-teal-200/30 blur-[120px] rounded-full" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">

          <div>

            <span className="bg-teal-100 text-teal-700 px-4 py-2 rounded-full">
              AI-Powered Healthcare
            </span>

            <h1 className="text-6xl md:text-7xl lg:text-[90px] font-extrabold mt-6 leading-[1.05] text-slate-900 dark:text-white">
                Smarter Health
                <br />
                <span className="text-teal-500">
                    Starts Here
                </span>
                </h1>

            <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">
              CuraAI analyzes symptoms using AI and
              provides disease prediction,
              medication recommendations,
              diet plans and health insights.
            </p>

            <div className="flex gap-4 mt-8">

                <a
                    href="/login"
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-semibold whitespace-nowrap"
                >
                    Get Started
                </a>

                <button
                    className="border border-slate-300 bg-white text-slate-700 px-8 py-4 rounded-2xl font-semibold whitespace-nowrap"
                >
                    Learn More
                </button>
            </div>


              <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-8 text-slate-600 border-t border-slate-200 pt-8">
                <div>
                    <h4 className="font-semibold">Secure & Private</h4>
                    <p className="text-sm">Your data is protected</p>
                </div>

                <div>
                    <h4 className="font-semibold">Instant Results</h4>
                    <p className="text-sm">Get answers in seconds</p>
                </div>

                <div>
                    <h4 className="font-semibold">Trusted Guidance</h4>
                    <p className="text-sm">AI + Medical Insights</p>
                </div>
              </div>

            </div>

          <div className="relative h-[280px] md:h-[450px] flex items-center justify-center">

            {/* Background circles */}
            <div className="absolute top-[80px] right-[120px] w-[450px] h-[450px] bg-cyan-200/30 rounded-full blur-[80px]" />

            <div className="absolute top-[40px] right-0 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-[100px]" />

            {/* Doctor */}
            <img
                src="/doctor.png"
                alt="Doctor"
                className="absolute right-[-20px] bottom-0 w-[710px] max-w-none"
            />

        </div>

        </div>

      </section>

            {/* WHY CHOOSE CURAAI */}
      <section className="bg-white dark:bg-slate-950 pt-12 pb-16">

        <div className="max-w-[1450px] mx-auto px-8 md:px-8">

          <div className="text-center">

            <p className="uppercase tracking-[6px] text-teal-600 font-semibold">
              Why Choose CuraAI
            </p>

            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">
              Advanced AI. Real Health Insights.
            </h2>

            <div className="w-20 h-1 bg-teal-500 rounded-full mx-auto mt-6" />

          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">

            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">

              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-3xl mb-6">
                🧠
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                AI-Powered Predictions
              </h3>

              <p className="text-slate-600">
                Our advanced machine learning model analyzes symptoms to predict possible conditions.
              </p>

            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">

              <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center text-3xl mb-6">
                💊
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Personalized Recommendations
              </h3>

              <p className="text-slate-600">
                Get medicines, diet plans and health suggestions tailored to your condition.
              </p>

            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">

              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-3xl mb-6">
                📊
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Health Analytics
              </h3>

              <p className="text-slate-600">
                Monitor trends and gain deeper insights into your wellness journey.
              </p>

            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300">

              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center text-3xl mb-6">
                🔒
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Secure & Private
              </h3>

              <p className="text-slate-600">
                Your health data is encrypted and protected with industry-grade security.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white py-16">

        <div className="max-w-[1450px] mx-auto px-8">

          <div className="grid md:grid-cols-3 gap-10">

            <div>
              <h3 className="text-3xl font-bold text-teal-400">
                CuraAI
              </h3>

              <p className="mt-4 text-slate-400">
                AI-Powered Healthcare Platform helping users
                understand symptoms and receive intelligent
                health recommendations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">
                Quick Links
              </h4>

              <div className="flex flex-col gap-2 text-slate-400">
                <a href="#">Home</a>
                <a href="#">Features</a>
                <a href="#">How It Works</a>
                <a href="#">Contact</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4">
                Platform
              </h4>

              <div className="flex flex-col gap-2 text-slate-400">
                <p>AI Disease Prediction</p>
                <p>Health Analytics</p>
                <p>Medical Reports</p>
                <p>Recommendations</p>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-700 mt-12 pt-6 text-center text-slate-500">
            © 2026 CuraAI. All Rights Reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}