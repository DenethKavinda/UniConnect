import React from "react";
import { Link } from "react-router-dom";
import {
  FiBook,
  FiMessageSquare,
  FiUsers,
  FiArrowRight,
  FiZap,
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiTrendingUp,
  FiHelpCircle,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const modules = [
  {
    title: "Materials",
    description:
      "Access lecture notes, tutorials, and study resources shared by the community.",
    icon: <FiBook />,
    to: "/materials",
    gradient: "from-blue-500 to-blue-700",
    count: "120+ Files",
  },
  {
    title: "Forum",
    description:
      "Ask questions, share ideas, and participate in academic discussions.",
    icon: <FiMessageSquare />,
    to: "/posts",
    gradient: "from-blue-600 to-amber-500",
    count: "45 Active Threads",
  },
  {
    title: "Groups",
    description:
      "Collaborate with classmates through group tasks, chat, and shared goals.",
    icon: <FiUsers />,
    to: "/groups",
    gradient: "from-amber-500 to-yellow-500",
    count: "12 My Groups",
  },
  {
    title: "Inquiry",
    description:
      "Submit inquiries, track your requests, and get responses from the admin team.",
    icon: <FiHelpCircle />,
    to: "/inquiry",
    gradient: "from-indigo-500 to-purple-600",
    count: "Track Requests",
  },
  {
    title: "Feedback",
    description:
      "Rate UniConnect and share suggestions. Help us improve the platform for everyone.",
    icon: <FiStar />,
    to: "/dashboard/feedback",
    gradient: "from-amber-400 to-orange-500",
    count: "Rate & review",
  },
];

const tips = [
  "Upload materials to help your peers & earn recognition.",
  "Join study groups to stay on track with assignments.",
  "Use the forum to ask questions – the community is here to help!",
  "Leave a star rating and feedback — it helps us improve UniConnect.",
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="app-page min-h-screen font-sans selection:bg-amber-500/30 pb-20">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header */}
            <header className="relative overflow-hidden bg-[rgba(255,255,255,0.03)] rounded-[2.5rem] p-10 md:p-14 border border-white/10 shadow-2xl">
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                  Student Dashboard
                </span>

                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                  Welcome back,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">
                    {user?.name || "Scholar"}
                  </span>{" "}
                  👋
                </h1>

                <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
                  Ready to continue? You have{" "}
                  <span className="text-white font-bold underline decoration-amber-500 decoration-2 underline-offset-4">
                    3 tasks
                  </span>{" "}
                  pending today.
                </p>
              </div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<FiCheckCircle className="text-blue-400" />}
                label="Progress"
                value="78%"
              />
              <StatCard
                icon={<FiClock className="text-blue-400" />}
                label="Hours"
                value="42h"
              />
              <StatCard
                icon={<FiStar className="text-amber-400" />}
                label="Credits"
                value="1.2k"
              />
              <StatCard
                icon={<FiTrendingUp className="text-amber-400" />}
                label="Rank"
                value="#12"
              />
            </div>

            {/* Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {modules.map((mod, index) => (
                <Link
                  key={mod.title}
                  to={mod.to}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="group relative bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:-translate-y-2"
                >
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${mod.gradient} rounded-2xl flex items-center justify-center text-2xl text-white mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                  >
                    {mod.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {mod.title}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed mb-8">
                    {mod.description}
                  </p>

                  <div className="flex items-center gap-2 text-blue-400 text-sm font-black group-hover:text-amber-400 transition-colors">
                    Explore{" "}
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Activity */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                <FiActivity className="text-amber-500" /> Live Updates
              </h3>

              <div className="space-y-8">
                <ActivityItem
                  name="Pasindu W."
                  action="shared"
                  target="IT Notes"
                  time="2m ago"
                  color="blue"
                />
                <ActivityItem
                  name="Ishini R."
                  action="commented"
                  target="Forum"
                  time="15m ago"
                  color="amber"
                />
                <ActivityItem
                  name="Group 04"
                  action="uploaded"
                  target="Lab 08"
                  time="1h ago"
                  color="blue"
                />
              </div>
            </div>

            {/* Level Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <FiZap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />

              <h3 className="text-2xl font-black mb-2">Want more?</h3>

              <p className="text-blue-100/80 text-sm mb-6">
                Contribute materials to unlock the{" "}
                <span className="text-amber-400 font-bold">Gold Scholar</span>{" "}
                badge.
              </p>

              <button className="app-btn-primary w-full font-bold py-4 rounded-2xl">
                Upload Now
              </button>
            </div>

            {/* Tips */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[2rem] p-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                Pro Tips
              </h4>

              <div className="space-y-4">
                {tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400">
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-400">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

/* Components */

const StatCard = ({ icon, label, value }) => (
  <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 p-5 rounded-2xl flex items-center gap-4">
    <div className="text-xl bg-white/5 p-3 rounded-xl">{icon}</div>
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase">{label}</p>
      <p className="text-white text-xl font-black">{value}</p>
    </div>
  </div>
);

const ActivityItem = ({ name, action, target, time, color }) => (
  <div className="flex gap-4">
    <div
      className={`w-10 h-10 rounded-full ${color === "blue" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"} flex items-center justify-center text-xs font-bold`}
    >
      {name.charAt(0)}
    </div>

    <div>
      <p className="text-sm text-slate-300">
        <span className="font-bold text-white">{name}</span> {action}{" "}
        <span className={color === "blue" ? "text-blue-400" : "text-amber-400"}>
          {target}
        </span>
      </p>

      <p className="text-[10px] text-slate-600">{time}</p>
    </div>
  </div>
);

export default Dashboard;
