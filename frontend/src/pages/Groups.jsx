import React from "react";
import { Link } from "react-router-dom";
import { FiUsers, FiPlus, FiMessageCircle, FiCalendar } from "react-icons/fi";

const groups = [
  { id: 1, name: "SE3040 Lab Squad", members: 8, next: "Tomorrow 6:00 PM" },
  { id: 2, name: "IT2020 Revision Circle", members: 12, next: "Monday 7:30 PM" },
  { id: 3, name: "CS4020 Exam Prep", members: 6, next: "Wednesday 5:00 PM" },
];

function Groups() {
  return (
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 pb-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-10 space-y-6">
        <header className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-amber-400 font-black mb-2">Groups</p>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-2">
                <FiUsers className="text-blue-400" /> Study Groups
              </h1>
              <p className="text-slate-300 mt-2">Collaborate with classmates and keep each other on track.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-[#0a0d17] font-bold hover:bg-amber-400 transition-colors">
              <FiPlus /> Create Group
            </button>
          </div>
        </header>

        <section className="space-y-4">
          {groups.map((group) => (
            <article key={group.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.06] transition-colors">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{group.name}</h2>
                  <p className="mt-1 text-sm text-slate-300">{group.members} members</p>
                  <p className="mt-1 text-xs text-slate-400 inline-flex items-center gap-2">
                    <FiCalendar /> Next session: {group.next}
                  </p>
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-sm font-semibold text-slate-100 hover:border-blue-400/40 hover:text-blue-300 transition-colors">
                  <FiMessageCircle /> Open Chat
                </button>
              </div>
            </article>
          ))}
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/dashboard" className="px-4 py-2 rounded-lg border border-white/15 text-sm font-semibold hover:border-amber-400/40 hover:text-amber-300 transition-colors">
            Back to Dashboard
          </Link>
          <Link to="/posts" className="px-4 py-2 rounded-lg border border-white/15 text-sm font-semibold hover:border-blue-400/40 hover:text-blue-300 transition-colors">
            Open Forum
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Groups;