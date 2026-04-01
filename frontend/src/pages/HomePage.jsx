import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user } = useAuth();

  const dashboardPath = user?.role === "admin" ? "/adminDashboard" : "/dashboard";

  return (
    <div className="app-page min-h-screen">
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="app-surface rounded-3xl p-8 md:p-12 shadow-2xl">
          <p className="app-text-muted text-xs uppercase tracking-[0.2em] font-bold mb-4">
            UniConnect
          </p>

          <h1 className="text-4xl md:text-6xl font-black leading-tight text-[var(--app-text)] mb-5">
            Learn together.
            <br />
            Build together.
          </h1>

          <p className="app-text-muted text-base md:text-lg max-w-2xl mb-8">
            UniConnect is your student collaboration hub for forum discussions, study groups,
            and material sharing.
          </p>

          <div className="flex flex-wrap gap-3">
            {user ? (
              <Link
                to={dashboardPath}
                className="app-btn-primary px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
              >
                Go To Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="app-btn-primary px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="app-surface-soft px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
