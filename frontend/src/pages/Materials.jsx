import React from "react";
import { Link } from "react-router-dom";
import { FiBookOpen, FiDownload, FiUploadCloud, FiFileText } from "react-icons/fi";

const sampleMaterials = [
  { id: 1, title: "IT1010 - Week 04 Notes", type: "PDF", size: "2.1 MB" },
  { id: 2, title: "SE3040 - Lab Guide", type: "DOCX", size: "1.3 MB" },
  { id: 3, title: "CS4020 - Revision Sheet", type: "PDF", size: "900 KB" },
];

function Materials() {
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
              <p className="text-[10px] tracking-[0.2em] uppercase text-amber-400 font-black mb-2">Materials</p>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-2">
                <FiBookOpen className="text-blue-400" /> Study Library
              </h1>
              <p className="text-slate-300 mt-2">Browse and share curated notes, guides, and revision packs.</p>
            </div>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-[#0a0d17] font-bold hover:bg-amber-400 transition-colors">
              <FiUploadCloud /> Upload Material
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleMaterials.map((item) => (
            <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:bg-white/[0.06] transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-blue-300">
                  <FiFileText />
                  <span className="text-xs font-bold tracking-wide uppercase">{item.type}</span>
                </div>
                <span className="text-xs text-slate-400">{item.size}</span>
              </div>
              <h2 className="mt-3 text-lg font-bold text-white leading-snug">{item.title}</h2>
              <button className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 text-sm font-semibold text-slate-100 hover:border-blue-400/40 hover:text-blue-300 transition-colors">
                <FiDownload /> Download
              </button>
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

export default Materials;