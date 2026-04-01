import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import groupService from '../services/groupService';
import { io } from 'socket.io-client';
import {
  FiMessageSquare, FiCheckSquare, FiCalendar,
  FiPaperclip, FiAlertCircle, FiPlus, FiClock, FiSend, FiSearch
} from 'react-icons/fi';

const FACULTY_FALLBACK = 'General';

const mapGroup = (raw, index) => ({
  id: String(raw?._id || raw?.id || `group-${index}`),
  groupName: raw?.groupName || raw?.name || 'Untitled Group',
  memberCount: Number(raw?.memberCount || raw?.membersCount || raw?.members?.length || 0),
  facultyTag: raw?.facultyTag || raw?.faculty || FACULTY_FALLBACK,
});

const Group = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');

  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [reminders, setReminders] = useState([{ id: 1, text: 'Welcome to the squad!', type: 'info' }]);

  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', date: '' });
  const [newReminder, setNewReminder] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      setIsLoading(true);
      try {
        const payload = await groupService.getGroups();
        const source = Array.isArray(payload) ? payload : payload?.groups || [];
        setGroups(source.map((item, index) => mapGroup(item, index)));
      } catch {
        console.error('Failed to fetch workspace data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '/';

    const s = io(socketUrl, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    s.on('connect', () => {
      s.emit('joinGroup', { groupId });
    });

    s.on('message', (msg) => {
      setMessages((prev) => [
        ...prev,
        {
          text: msg?.text || '',
          sender: msg?.sender || 'User',
          time: msg?.time
            ? new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [groupId]);

  const activeGroup = groups.find((g) => String(g.id) === String(groupId));

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query ? groups.filter((g) => g.groupName.toLowerCase().includes(query)) : groups;
  }, [groups, searchQuery]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    setTasks([...tasks, { ...newTask, id: Date.now() }]);
    setNewTask({ title: '', priority: 'medium', date: '' });
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminder) return;
    setReminders([{ id: Date.now(), text: newReminder }, ...reminders]);
    setNewReminder('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage) return;
    if (socket) {
      socket.emit('sendMessage', { groupId, text: newMessage });
    } else {
      setMessages([
        ...messages,
        {
          text: newMessage,
          sender: 'Me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    setNewMessage('');
  };

  if (groupId) {
    if (isLoading) {
      return (
        <div className="app-page min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!activeGroup) {
      return (
        <div className="app-page min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-slate-300 font-bold mb-2">Group not found</p>
          <p className="text-slate-500 text-sm mb-6">The group may have been deleted or you do not have access.</p>
          <button onClick={() => navigate('/groups')} className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors">
            Back to Groups
          </button>
        </div>
      );
    }

    return (
      <div className="app-page min-h-screen">
        <header className="fixed top-0 w-full z-50 app-page backdrop-blur-md border-b border-white/10 px-8 py-4">
          <div className="max-w-[1800px] mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/groups')} className="text-blue-400 font-bold hover:underline">← Exit</button>
              <h1 className="text-xl font-black text-white">{activeGroup.groupName}</h1>
            </div>
            <div className="hidden md:block w-64">
              <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
                <span>Progress</span>
                <span className="text-amber-500">{tasks.length > 0 ? 'Active' : 'Stable'}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[65%] transition-all duration-700 shadow-[0_0_10px_#3b82f6]" />
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 h-screen pt-20">
          <main className="lg:col-span-8 border-r border-white/5 p-8 overflow-y-auto">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'tasks' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-400'}`}>Tasks & Deadlines</button>
              <button onClick={() => setActiveTab('chat')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-slate-400'}`}>Group Chat</button>
            </div>

            {activeTab === 'tasks' ? (
              <div className="space-y-6">
                <form onSubmit={handleAddTask} className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-wrap gap-4 items-end backdrop-blur-sm">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] uppercase font-black text-slate-500 block mb-2 tracking-widest">New Task</label>
                    <input
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="app-input w-full rounded-xl px-4 py-2.5 text-sm"
                      placeholder="Assign a task..."
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-500 block mb-2 tracking-widest">Priority</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="app-input rounded-xl px-4 py-2.5 text-sm cursor-pointer">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-blue-600 p-3.5 rounded-xl hover:bg-blue-500 transition-all text-white shadow-lg shadow-blue-600/20">
                    <FiPlus />
                  </button>
                </form>

                <div className="space-y-3">
                  {tasks.length === 0 && <p className="text-center text-slate-500 py-10 italic border border-dashed border-white/5 rounded-3xl">No tasks assigned yet.</p>}
                  {tasks.map((task) => (
                    <TaskCard key={task.id} title={task.title} priority={task.priority} date={task.date || 'No Deadline'} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-[70vh]">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.map((m, i) => (
                    <div key={i} className="flex flex-col items-start">
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-bl-none max-w-[80%]">
                        <p className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-tighter">{m.sender}</p>
                        <p className="text-sm leading-relaxed">{m.text}</p>
                      </div>
                      <span className="text-[9px] text-slate-600 mt-1 ml-2 font-bold uppercase">{m.time}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="relative mt-auto">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message the squad..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500 transition-all backdrop-blur-md"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 p-2.5 rounded-xl text-white">
                    <FiSend />
                  </button>
                </form>
              </div>
            )}
          </main>

          <aside className="lg:col-span-4 p-8 space-y-8 bg-white/[0.01]">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-4">Squad Reminders</h3>

              <form onSubmit={handleAddReminder} className="relative mb-6">
                <input
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  placeholder="Add quick reminder..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 text-xs outline-none focus:border-amber-500/50"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-500 p-1 hover:scale-110 transition-transform">
                  <FiPlus />
                </button>
              </form>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {reminders.map((rem) => (
                  <div key={rem.id} className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl">
                    <div className="flex gap-3">
                      <FiAlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-200/80 leading-relaxed font-medium">{rem.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2"><FiCalendar /> Calendar Sync</h3>
              <div className="bg-white/5 rounded-2xl p-4 text-center">
                <p className="text-[10px] text-slate-500 font-bold italic">Automatic calendar sync active for {activeGroup.groupName}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="app-page min-h-screen relative pt-32 px-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">Discover <span className="text-blue-500">Squads.</span></h1>
            <p className="text-slate-400 mt-2 font-medium">Join a squad and collaborate with classmates.</p>
          </div>
          <Link to="/groups/create" className="app-btn-primary px-8 py-4 rounded-2xl font-black hover:brightness-110 transition-all shadow-xl shadow-amber-500/20">
            + New Group
          </Link>
        </div>

        <div className="relative mb-16">
          <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 text-xl" />
          <input
            type="text"
            placeholder="Search by faculty, subject or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] py-5 pl-16 pr-6 outline-none focus:border-blue-500/50 backdrop-blur-md transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 flex justify-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : (
            filteredGroups.map((group) => (
              <article key={group.id} className="bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 hover:border-blue-500/40 transition-all group backdrop-blur-sm">
                <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 font-black mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {group.groupName.charAt(0)}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">{group.groupName}</h3>
                <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-8">{group.facultyTag} • {group.memberCount} Members</p>
                <button onClick={() => navigate(`/groups/${group.id}`)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                  Enter Workspace
                </button>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ title, priority, date }) => (
  <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer backdrop-blur-sm">
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${priority === 'high' ? 'bg-red-500 shadow-[0_0_12px_#f43f5e]' : priority === 'medium' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-green-500'}`} />
      <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{title}</span>
    </div>
    <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
      <FiClock className="text-blue-500" /> {date}
    </div>
  </div>
);

export default Group;
