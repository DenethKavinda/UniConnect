import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import groupService from '../services/groupService';
import { 
  FiMessageSquare, FiCheckSquare, FiCalendar, 
  FiPaperclip, FiAlertCircle, FiPlus, FiClock, FiSend, FiSearch, FiUsers 
} from 'react-icons/fi';

const FACULTY_FALLBACK = 'General';

const mapGroup = (raw, index) => ({
  id: String(raw?._id || raw?.id || `group-${index}`),
  groupName: raw?.groupName || raw?.name || 'Untitled Group',
  memberCount: Number(raw?.memberCount || raw?.membersCount || raw?.members?.length || 0),
  facultyTag: raw?.facultyTag || raw?.faculty || FACULTY_FALLBACK,
  userAvatars: Array.isArray(raw?.userAvatars) ? raw.userAvatars : [],
  isJoined: Boolean(raw?.isJoined || raw?.joined)
});

const Group = () => {
  const [selectedGroupId, setSelectedGroupId] = useState(null); 
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');

  // 1. Fetch Groups (Keep your existing logic)
  useEffect(() => {
    const fetchGroups = async () => {
      setIsLoading(true);
      try {
        const payload = await groupService.getGroups();
        const source = Array.isArray(payload) ? payload : payload?.groups || [];
        setGroups(source.map((item, index) => mapGroup(item, index)));
      } catch (error) {
        console.error("Failed to fetch groups");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter(g => 
      g.groupName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [groups, searchQuery]);

  // --- MEMBER 4: THE WORKSPACE VIEW ---
  if (selectedGroupId) {
    const activeGroup = groups.find(g => g.id === selectedGroupId);
    return (
      <div className="min-h-screen bg-[#0a0d17] text-slate-200">
        <header className="fixed top-0 w-full z-50 bg-[#0a0d17]/80 backdrop-blur-md border-b border-white/10 px-8 py-4">
          <div className="max-w-[1800px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedGroupId(null)} className="text-blue-400 font-bold hover:underline">← Exit</button>
              <h1 className="text-xl font-black text-white">{activeGroup?.groupName}</h1>
            </div>
            <div className="hidden md:block w-64">
              <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                <span>Duty 8: Progress</span>
                <span className="text-amber-500">65%</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-amber-500 w-[65%] shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 h-screen pt-20">
          {/* Main Workspace (Duty 3 & 4) */}
          <main className="lg:col-span-8 border-r border-white/5 p-8 overflow-y-auto">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2 rounded-xl font-bold ${activeTab === 'tasks' ? 'bg-blue-600' : 'bg-white/5'}`}>Tasks</button>
              <button onClick={() => setActiveTab('chat')} className={`px-6 py-2 rounded-xl font-bold ${activeTab === 'chat' ? 'bg-blue-600' : 'bg-white/5'}`}>Chat</button>
            </div>

            {activeTab === 'tasks' ? (
              <div className="space-y-4">
                <TaskCard title="Final Report" priority="high" date="Today" />
                <TaskCard title="UI Implementation" priority="medium" date="Oct 28" />
              </div>
            ) : (
              <div className="bg-white/5 rounded-3xl p-10 text-center border border-white/5">
                <FiMessageSquare className="mx-auto text-4xl mb-4 text-blue-500" />
                <p className="text-slate-400">Duty 3: Basic Group Communication active.</p>
              </div>
            )}
          </main>

          {/* Sidebar (Duty 10: Reminders) */}
          <aside className="lg:col-span-4 p-8 space-y-8">
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl">
              <h3 className="text-amber-500 text-xs font-black uppercase tracking-widest flex items-center gap-2 mb-4"><FiAlertCircle /> Reminder</h3>
              <p className="text-sm italic text-amber-200/70">"Duty 10: Your assignment is due in 4 hours!"</p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // --- DISCOVERY VIEW (Your Main Page) ---
  return (
    <div className="min-h-screen bg-[#0a0d17] text-slate-200 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 leading-none">
                Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-500">Squad.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl">Join a community, collaborate with classmates, and share ideas in real-time.</p>
            </div>
            <Link to="/groups/create" className="bg-amber-500 text-[#0a0d17] px-8 py-4 rounded-2xl font-black shadow-xl shadow-amber-500/20 hover:scale-105 transition-all">
              + Create New Group
            </Link>
          </div>

          <div className="relative">
            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 text-xl" />
            <input 
              type="text" 
              placeholder="Search groups by faculty, subject or name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-5 pl-14 pr-6 outline-none focus:border-blue-500/50 backdrop-blur-md transition-all"
            />
          </div>
        </header>

        {/* --- DYNAMIC GRID --- */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white/5 rounded-[2.5rem]" />)}
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGroups.map(group => (
              <article key={group.id} className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] hover:border-blue-500/40 transition-all group backdrop-blur-md">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 font-black">
                    {group.groupName.charAt(0)}
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    {group.facultyTag}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{group.groupName}</h3>
                <p className="text-slate-500 text-sm mb-8">{group.memberCount} members active</p>
                <button 
                  onClick={() => setSelectedGroupId(group.id)}
                  className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/0 hover:shadow-blue-600/20"
                >
                  Enter Workspace
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-20 text-center backdrop-blur-md">
            <FiUsers className="text-5xl text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">No squads found</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">We couldn't find any groups matching your search. Why not start one yourself?</p>
            <Link to="/groups/create" className="text-blue-400 font-bold hover:underline">Start a new group &rarr;</Link>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ title, priority, date }) => (
  <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer">
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${priority === 'high' ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-amber-500'}`} />
      <span className="font-bold text-white">{title}</span>
    </div>
    <div className="flex items-center gap-4 text-slate-500 text-xs font-black uppercase">
      <FiClock className="text-blue-400" /> {date}
    </div>
  </div>
);

export default Group;