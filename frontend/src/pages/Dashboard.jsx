import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const modules = [
  {
    title: 'Materials',
    description: 'Access lecture notes, tutorials, and study resources shared by the community.',
    icon: 'BK',
    to: '/materials',
    gradient: 'from-blue-600 to-indigo-600',
    count: '120+ Files',
  },
  {
    title: 'Forum',
    description: 'Ask questions, share ideas, and participate in academic discussions.',
    icon: 'CH',
    to: '/posts',
    gradient: 'from-purple-600 to-pink-600',
    count: '45 Active Threads',
  },
  {
    title: 'Groups',
    description: 'Collaborate with classmates through group tasks, chat, and shared goals.',
    icon: 'GR',
    to: '/groups',
    gradient: 'from-emerald-500 to-teal-600',
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

      {/* 2. Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon="ST" label="Credits" value="1,240" />
        <StatCard icon="TM" label="Study Hours" value="42h" />
        <StatCard icon="UP" label="Rank" value="#12" />
        <StatCard icon="ZP" label="Streak" value="5 Days" />
      </div>

      {/* 3. Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {modules.map((mod, index) => (
          <Link
            key={mod.title}
            to={mod.to}
            style={{ animationDelay: `${index * 100}ms` }}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-8 transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-2 animate-in slide-in-from-bottom-4"
          >
            <div className={`w-14 h-14 bg-gradient-to-br ${mod.gradient} rounded-xl flex items-center justify-center text-2xl text-white mb-6 shadow-lg transform transition-transform group-hover:rotate-6 group-hover:scale-110`}>
              <span className="text-sm font-black tracking-wider">{mod.icon}</span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-white">{mod.title}</h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                {mod.count}
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{mod.description}</p>
            <div className="flex items-center gap-2 text-blue-400 text-sm font-bold group-hover:text-blue-300 transition-colors">
              Enter Module <span className="transition-transform group-hover:translate-x-1">&gt;</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 4. Tips & Activity Footer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
            <span className="text-yellow-400 font-black">ZP</span> Pro Tips
          </h2>
          <div className="space-y-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-8 h-8 flex-shrink-0 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 font-bold text-xs group-hover:bg-blue-500 group-hover:text-white transition-all">
                  {i + 1}
                </div>
                <p className="text-slate-400 text-sm pt-1 leading-relaxed group-hover:text-slate-200">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">Want to level up?</h2>
          <p className="text-blue-100 mb-6 text-sm opacity-80">
            Contributors get 2x more visibility in the community and access to exclusive study materials.
          </p>
          <button className="bg-white text-blue-600 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors self-start shadow-xl">
            Upload Your First Note
          </button>
        </div>
      </div>
    </div>
  );
};

// Internal Helper Component for Stats
const StatCard = ({ icon, label, value }) => (
  <div className="bg-slate-900/60 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-colors">
    <div className="text-xs font-black tracking-wider bg-white/5 p-3 rounded-xl text-slate-200">{icon}</div>
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{label}</p>
      <p className="text-white text-xl font-black">{value}</p>
    </div>
  </div>
);

export default Dashboard;