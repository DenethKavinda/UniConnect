import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBook, FiMessageSquare, FiUsers, FiArrowRight, 
  FiZap, FiActivity, FiCheckCircle, FiClock, FiStar, FiTrendingUp 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const modules = [
  {
    title: 'Materials',
    description: 'Access lecture notes, tutorials, and study resources shared by the community.',
    icon: <FiBook />,
    to: '/materials',
    gradient: 'from-blue-500 to-blue-700',
    count: '120+ Files',
  },
  {
    title: 'Forum',
    description: 'Ask questions, share ideas, and participate in academic discussions.',
    icon: 'CH',
    to: '/forum',
    gradient: 'from-purple-600 to-pink-600',
    count: '45 Active Threads',
  },
  {
    title: 'Groups',
    description: 'Collaborate with classmates through group tasks, chat, and shared goals.',
    icon: <FiUsers />,
    to: '/groups',
    gradient: 'from-amber-500 to-yellow-500',
    count: '12 My Groups',
  },
];

const tips = [
  'Upload materials to help your peers & earn recognition.',
  'Join study groups to stay on track with assignments.',
  'Use the forum to ask questions – the community is here to help!',
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in duration-700">
      
      {/* 1. Welcome Header */}
      <header className="relative overflow-hidden bg-slate-900 rounded-3xl p-10 mb-10 border border-white/10 shadow-2xl">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
              Student Dashboard
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
              {user?.name || 'Scholar'}
            </span> 👋
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            Ready to continue your journey? You have <span className="text-white font-semibold">3 pending assignments</span> and 5 new messages in your study groups.
          </p>
        </div>
      </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={<FiCheckCircle className="text-blue-400" />} label="Progress" value="78%" />
              <StatCard icon={<FiClock className="text-blue-400" />} label="Hours" value="42h" />
              <StatCard icon={<FiStar className="text-amber-400" />} label="Credits" value="1.2k" />
              <StatCard icon={<FiTrendingUp className="text-amber-400" />} label="Rank" value="#12" />
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {modules.map((mod, index) => (
                <Link
                  key={mod.title}
                  to={mod.to}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="group relative bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 transition-all duration-500 hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:-translate-y-2 animate-in slide-in-from-bottom-4"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${mod.gradient} rounded-2xl flex items-center justify-center text-2xl text-white mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                    {mod.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">{mod.description}</p>
                  <div className="flex items-center gap-2 text-blue-400 text-sm font-black group-hover:text-amber-400 transition-colors">
                    Explore <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Live Activity Feed */}
            <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8 flex items-center gap-2">
                <FiActivity className="text-amber-500" /> Live Updates
              </h3>
              <div className="space-y-8">
                <ActivityItem name="Pasindu W." action="shared" target="IT Notes" time="2m ago" color="blue" />
                <ActivityItem name="Ishini R." action="commented" target="Forum" time="15m ago" color="amber" />
                <ActivityItem name="Group 04" action="uploaded" target="Lab 08" time="1h ago" color="blue" />
              </div>
            </div>

            {/* Gamified Level Up Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
               <FiZap className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12 group-hover:scale-125 transition-transform duration-700" />
               <h3 className="text-2xl font-black mb-2">Want more?</h3>
               <p className="text-blue-100/80 text-sm mb-6 leading-relaxed">
                 Contribute materials to unlock the <span className="text-amber-400 font-bold">Gold Scholar</span> badge.
               </p>
               <button className="w-full bg-amber-500 text-[#0a0d17] font-bold py-4 rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">
                 Upload Now
               </button>
            </div>

            {/* Quick Tips */}
            <div className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-[2rem] p-8">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Pro Tips</h4>
              <div className="space-y-4">
                {tips.map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400 group-hover:bg-amber-500 group-hover:text-[#0a0d17] transition-all">
                      {i + 1}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-200">{tip}</p>
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

/* --- MINI COMPONENTS --- */

const StatCard = ({ icon, label, value }) => (
  <div className="bg-[rgba(255,255,255,0.03)] border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all group">
    <div className="text-xl bg-white/5 p-3 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
    <div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <p className="text-white text-xl font-black">{value}</p>
    </div>
  </div>
);

const ActivityItem = ({ name, action, target, time, color }) => (
  <div className="flex gap-4 group cursor-default">
    <div className={`w-10 h-10 rounded-full ${color === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'} flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:scale-110 transition-transform`}>
      {name.charAt(0)}
    </div>
    <div className="space-y-0.5">
      <p className="text-sm leading-snug text-slate-300">
        <span className="font-bold text-white">{name}</span> {action} <span className={`${color === 'blue' ? 'text-blue-400' : 'text-amber-400'} font-medium`}>{target}</span>
      </p>
      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{time}</p>
    </div>
  </div>
);

export default Dashboard;