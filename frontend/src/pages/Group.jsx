import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import groupService from '../services/groupService';
import { io } from 'socket.io-client';
import {
  FiMessageSquare, FiCheckSquare, FiCalendar,
  FiPaperclip, FiAlertCircle, FiPlus, FiClock, FiSend, FiSearch, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const FACULTY_FALLBACK = 'General';

const isValidObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isValidDateKey = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);

const mapGroup = (raw, index) => ({
  id: String(raw?._id || raw?.id || `group-${index}`),
  groupName: raw?.groupName || raw?.name || 'Untitled Group',
  memberCount: Number(raw?.memberCount || raw?.membersCount || raw?.members?.length || 0),
  facultyTag: raw?.facultyTag || raw?.faculty || FACULTY_FALLBACK,
  isJoined: Boolean(raw?.isJoined),
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
  const [groupFiles, setGroupFiles] = useState([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isFilesUploading, setIsFilesUploading] = useState(false);
  const [imagePreviewUrls, setImagePreviewUrls] = useState({});
  const [imagePreviewErrors, setImagePreviewErrors] = useState({});
  const imagePreviewUrlsRef = useRef({});

  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', date: '' });
  const [newReminder, setNewReminder] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);

  const [joinState, setJoinState] = useState({ isJoining: false, error: '', groupId: '' });
  const [taskError, setTaskError] = useState('');
  const [reminderError, setReminderError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [fileError, setFileError] = useState('');

  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));

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

  useEffect(() => {
    setImagePreviewUrls({});
    setImagePreviewErrors({});
  }, [groupId]);

  useEffect(() => {
    imagePreviewUrlsRef.current = imagePreviewUrls;
  }, [imagePreviewUrls]);

  useEffect(() => {
    const loadFiles = async () => {
      if (!groupId || !activeGroup?.isJoined) return;
      setIsFilesLoading(true);
      setFileError('');
      try {
        const payload = await groupService.getGroupFiles(groupId);
        const files = Array.isArray(payload?.files) ? payload.files : [];
        setGroupFiles(files);
      } catch (error) {
        const status = error?.response?.status;
        const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
        const message = apiMessage
          ? `${apiMessage}${status ? ` (HTTP ${status})` : ''}`
          : 'Unable to load shared files right now.';
        setFileError(message);
      } finally {
        setIsFilesLoading(false);
      }
    };

    loadFiles();
  }, [groupId, activeGroup?.isJoined]);

  useEffect(() => {
    setImagePreviewUrls((prev) => {
      if (!prev || Object.keys(prev).length === 0) return prev;
      const ids = new Set(groupFiles.map((f) => String(f?._id || '')));
      const next = {};
      for (const [id, url] of Object.entries(prev)) {
        if (ids.has(String(id))) {
          next[id] = url;
        } else if (url) {
          try {
            window.URL.revokeObjectURL(url);
          } catch {
            // ignore
          }
        }
      }
      return next;
    });
  }, [groupFiles]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(imagePreviewUrlsRef.current || {})) {
        if (!url) continue;
        try {
          window.URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      }
      imagePreviewUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    const MAX_PREVIEW_BYTES = 5 * 1024 * 1024;
    if (!groupId || !activeGroup?.isJoined) return;

    let cancelled = false;

    const fetchPreviews = async () => {
      const candidates = groupFiles.filter((fileDoc) => {
        if (!fileDoc?._id) return false;
        const mime = String(fileDoc.mimeType || '');
        if (!mime.startsWith('image/')) return false;
        if (imagePreviewUrls[fileDoc._id] || imagePreviewErrors[fileDoc._id]) return false;
        const size = Number(fileDoc.size || 0);
        if (Number.isFinite(size) && size > MAX_PREVIEW_BYTES) return false;
        return true;
      });

      for (const fileDoc of candidates) {
        if (cancelled) return;
        try {
          const response = await groupService.downloadGroupFile(groupId, fileDoc._id);
          if (cancelled) return;
          const blob = new Blob([response.data], { type: fileDoc.mimeType || 'image/*' });
          const url = window.URL.createObjectURL(blob);
          setImagePreviewUrls((prev) => {
            const old = prev[fileDoc._id];
            if (old && old !== url) {
              try {
                window.URL.revokeObjectURL(old);
              } catch {
                // ignore
              }
            }
            return { ...prev, [fileDoc._id]: url };
          });
        } catch {
          if (cancelled) return;
          setImagePreviewErrors((prev) => ({ ...prev, [fileDoc._id]: true }));
        }
      }
    };

    fetchPreviews();

    return () => {
      cancelled = true;
    };
  }, [activeGroup?.isJoined, groupFiles, groupId, imagePreviewErrors, imagePreviewUrls]);

  const progress = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [tasks]);

  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const tasksByDate = useMemo(() => {
    const map = new Map();
    for (const task of tasks) {
      if (!task?.date || !isValidDateKey(task.date)) continue;
      const list = map.get(task.date) || [];
      list.push(task);
      map.set(task.date, list);
    }

    for (const [key, list] of map.entries()) {
      list.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')));
      map.set(key, list);
    }

    return map;
  }, [tasks]);

  const calendarTitle = useMemo(() => {
    const date = new Date(calendarCursor.year, calendarCursor.month, 1);
    return date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }, [calendarCursor.month, calendarCursor.year]);

  const calendarCells = useMemo(() => {
    const firstOfMonth = new Date(calendarCursor.year, calendarCursor.month, 1);
    const mondayIndex = (firstOfMonth.getDay() + 6) % 7;
    const gridStart = new Date(calendarCursor.year, calendarCursor.month, 1 - mondayIndex);

    return Array.from({ length: 42 }, (_, idx) => {
      const cellDate = new Date(gridStart);
      cellDate.setDate(gridStart.getDate() + idx);
      const key = toDateKey(cellDate);
      const isCurrentMonth = cellDate.getMonth() === calendarCursor.month;
      const dayTasks = tasksByDate.get(key) || [];
      return {
        key,
        dayNumber: cellDate.getDate(),
        isCurrentMonth,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        tasks: dayTasks,
      };
    });
  }, [calendarCursor.month, calendarCursor.year, selectedDateKey, tasksByDate, todayKey]);

  const selectedDayTasks = useMemo(() => tasksByDate.get(selectedDateKey) || [], [selectedDateKey, tasksByDate]);

  const moveCalendarMonth = (delta) => {
    setCalendarCursor((prev) => {
      let nextMonth = prev.month + delta;
      let nextYear = prev.year;
      if (nextMonth < 0) {
        nextMonth = 11;
        nextYear -= 1;
      }
      if (nextMonth > 11) {
        nextMonth = 0;
        nextYear += 1;
      }
      setSelectedDateKey(`${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`);
      return { year: nextYear, month: nextMonth };
    });
  };

  const getPriorityDot = (priority) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'low') return 'bg-green-500';
    return 'bg-amber-500';
  };

  const attemptJoinGroup = async (id) => {
    setJoinState({ isJoining: true, error: '', groupId: String(id || '') });
    try {
      if (!isValidObjectId(String(id || ''))) {
        setJoinState({ isJoining: false, error: 'Invalid group id.', groupId: String(id || '') });
        return;
      }

      const response = await groupService.joinGroup(String(id));
      const joined = response?.group;

      setGroups((prev) =>
        prev.map((g) =>
          String(g.id) === String(id)
            ? {
                ...g,
                isJoined: true,
                memberCount: typeof joined?.memberCount === 'number' ? joined.memberCount : g.memberCount,
              }
            : g
        )
      );

      setJoinState({ isJoining: false, error: '', groupId: '' });
      navigate(`/groups/${id}`);
    } catch (error) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      const message = apiMessage
        ? `${apiMessage}${status ? ` (HTTP ${status})` : ''}`
        : 'Unable to join this group right now. Please try again.';
      setJoinState({ isJoining: false, error: message, groupId: String(id || '') });
    }
  };

  const toggleTaskComplete = (taskId) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)));
  };

  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return query
      ? groups.filter((g) => {
          const name = g.groupName.toLowerCase();
          const faculty = (g.facultyTag || '').toLowerCase();
          return name.includes(query) || faculty.includes(query);
        })
      : groups;
  }, [groups, searchQuery]);

  const handleAddTask = (e) => {
    e.preventDefault();

    setTaskError('');
    const title = newTask.title.trim();
    const allowedPriorities = ['high', 'medium', 'low'];

    if (!title) {
      setTaskError('Task title is required.');
      return;
    }

    if (title.length > 120) {
      setTaskError('Task title must be 120 characters or less.');
      return;
    }

    if (!allowedPriorities.includes(newTask.priority)) {
      setTaskError('Please select a valid priority.');
      return;
    }

    if (!newTask.date) {
      setTaskError('Due date is required.');
      return;
    }

    const due = new Date(`${newTask.date}T00:00:00`);
    if (Number.isNaN(due.getTime())) {
      setTaskError('Please provide a valid due date.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (due.getTime() < today.getTime()) {
      setTaskError('Due date cannot be in the past.');
      return;
    }

    setTasks((prev) => [
      ...prev,
      { ...newTask, title, id: Date.now(), completed: false },
    ]);
    setNewTask({ title: '', priority: 'medium', date: '' });
  };

  const handleAddReminder = (e) => {
    e.preventDefault();

    setReminderError('');
    const reminderText = newReminder.trim();
    if (!reminderText) {
      setReminderError('Reminder text is required.');
      return;
    }
    if (reminderText.length > 160) {
      setReminderError('Reminder must be 160 characters or less.');
      return;
    }

    setReminders((prev) => [{ id: Date.now(), text: reminderText }, ...prev]);
    setNewReminder('');
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    setMessageError('');
    const messageText = newMessage.trim();
    if (!messageText) {
      setMessageError('Message cannot be empty.');
      return;
    }
    if (messageText.length > 500) {
      setMessageError('Message must be 500 characters or less.');
      return;
    }
    if (socket) {
      socket.emit('sendMessage', { groupId, text: messageText });
    } else {
      setMessages([
        ...messages,
        {
          text: messageText,
          sender: 'Me',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
    setNewMessage('');
  };

  const handleFilesSelected = (event) => {
    const input = event.target;
    setFileError('');

    const files = Array.from(input.files || []);
    if (files.length === 0) return;

    if (!groupId || !activeGroup?.isJoined) {
      setFileError('Join the group to upload files.');
      input.value = '';
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    const oversized = files.find((f) => f.size > maxBytes);
    if (oversized) {
      setFileError('Each file must be 10MB or less.');
      input.value = '';
      return;
    }

    const doUpload = async () => {
      setIsFilesUploading(true);
      try {
        const result = await groupService.uploadGroupFiles(groupId, files);
        const created = Array.isArray(result?.files) ? result.files : [];
        setGroupFiles((prev) => [...created, ...prev]);
      } catch (error) {
        const status = error?.response?.status;
        const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
        const message = apiMessage
          ? `${apiMessage}${status ? ` (HTTP ${status})` : ''}`
          : 'Unable to upload files right now.';
        setFileError(message);
      } finally {
        setIsFilesUploading(false);
        input.value = '';
      }
    };

    doUpload();
  };

  const formatFileSize = (size) => {
    const bytes = Number(size || 0);
    if (!Number.isFinite(bytes) || bytes <= 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadGroupFile = async (fileDoc) => {
    setFileError('');
    try {
      const response = await groupService.downloadGroupFile(groupId, fileDoc._id);
      const blob = new Blob([response.data], { type: fileDoc.mimeType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileDoc.originalName || 'download';
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      const status = error?.response?.status;
      const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      const message = apiMessage
        ? `${apiMessage}${status ? ` (HTTP ${status})` : ''}`
        : 'Unable to download this file right now.';
      setFileError(message);
    }
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

    if (!activeGroup.isJoined) {
      return (
        <div className="app-page min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-slate-200 font-black mb-2">Join this group to continue</p>
          <p className="text-slate-500 text-sm mb-6">You need to join {activeGroup.groupName} before accessing tasks, chat and resources.</p>
          {joinState.error ? (
            <div className="max-w-lg w-full bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-2xl mb-4">
              {joinState.error}
            </div>
          ) : null}
          <div className="flex gap-3">
            <button
              onClick={() => attemptJoinGroup(activeGroup.id)}
              disabled={joinState.isJoining}
              className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors disabled:opacity-60"
            >
              {joinState.isJoining ? 'Joining...' : 'Join Group'}
            </button>
            <button
              onClick={() => navigate('/groups')}
              className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Back
            </button>
          </div>
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
                <span className="text-amber-500">{progress.total > 0 ? `${progress.percent}%` : 'Stable'}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-700 shadow-[0_0_10px_#3b82f6]"
                  style={{ width: `${progress.percent}%` }}
                />
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
                  <div>
                    <label className="text-[10px] uppercase font-black text-slate-500 block mb-2 tracking-widest">Due Date</label>
                    <input
                      type="date"
                      value={newTask.date}
                      onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                      className="app-input rounded-xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <button type="submit" className="bg-blue-600 p-3.5 rounded-xl hover:bg-blue-500 transition-all text-white shadow-lg shadow-blue-600/20">
                    <FiPlus />
                  </button>
                </form>

                {taskError ? (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-2xl">
                    {taskError}
                  </div>
                ) : null}

                <div className="bg-white/5 rounded-3xl border border-white/10 p-6 space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-[0.2em] flex items-center gap-2"><FiPaperclip /> Shared Files</h3>
                    {isFilesUploading ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Uploading...</span>
                    ) : null}
                  </div>

                  <input
                    type="file"
                    multiple
                    onChange={handleFilesSelected}
                    disabled={isFilesUploading}
                    className="w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/30 file:px-3 file:py-1.5 file:text-blue-100"
                  />

                  {fileError ? (
                    <p className="text-xs text-red-200">{fileError}</p>
                  ) : null}

                  {isFilesLoading ? (
                    <p className="text-[10px] text-slate-500 font-bold italic">Loading shared files...</p>
                  ) : groupFiles.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-bold italic">No files shared yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {groupFiles.map((fileDoc) => (
                        <div key={fileDoc._id} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {String(fileDoc?.mimeType || '').startsWith('image/') ? (
                              <button
                                type="button"
                                onClick={() => handleDownloadGroupFile(fileDoc)}
                                className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0"
                                title="Click to download"
                              >
                                {imagePreviewUrls[fileDoc._id] ? (
                                  <img
                                    src={imagePreviewUrls[fileDoc._id]}
                                    alt={fileDoc.originalName || 'Shared image'}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">IMG</span>
                                )}
                              </button>
                            ) : (
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-slate-500">
                                <FiPaperclip />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-xs text-slate-200 truncate max-w-[420px]">{fileDoc.originalName}</p>
                              <p className="text-[10px] text-slate-500 font-bold">
                                {formatFileSize(fileDoc.size)}{fileDoc.uploadedByLabel ? ` • ${fileDoc.uploadedByLabel}` : ''}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadGroupFile(fileDoc)}
                            className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-200"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {tasks.length === 0 && <p className="text-center text-slate-500 py-10 italic border border-dashed border-white/5 rounded-3xl">No tasks assigned yet.</p>}
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      title={task.title}
                      priority={task.priority}
                      date={task.date || 'No Deadline'}
                      completed={Boolean(task.completed)}
                      onToggle={() => toggleTaskComplete(task.id)}
                    />
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

                {messageError ? (
                  <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-2xl">
                    {messageError}
                  </div>
                ) : null}
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

              {reminderError ? (
                <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-2xl">
                  {reminderError}
                </div>
              ) : null}

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
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-slate-100 tracking-tight truncate">{calendarTitle}</p>
                    <p className="text-[11px] text-slate-500 font-bold">Click a day to view deadlines.</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => moveCalendarMonth(-1)}
                      className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center text-slate-200"
                      aria-label="Previous month"
                    >
                      <FiChevronLeft />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveCalendarMonth(1)}
                      className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex items-center justify-center text-slate-200"
                      aria-label="Next month"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                    <div key={label} className="text-center">{label}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarCells.map((cell) => (
                    <button
                      key={cell.key}
                      type="button"
                      onClick={() => setSelectedDateKey(cell.key)}
                      className={
                        `relative rounded-xl border transition-colors px-2 py-2 text-left ` +
                        (cell.isSelected
                          ? 'bg-blue-600/20 border-blue-500/50'
                          : cell.isCurrentMonth
                          ? 'bg-white/5 border-white/10 hover:bg-white/10'
                          : 'bg-white/[0.02] border-white/5 opacity-60 hover:opacity-80')
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className={
                          `text-[11px] font-black ` +
                          (cell.isToday ? 'text-blue-300' : cell.isCurrentMonth ? 'text-slate-200' : 'text-slate-500')
                        }>
                          {cell.dayNumber}
                        </span>
                        {cell.tasks.length > 0 ? (
                          <span className="text-[10px] font-black text-slate-500">{cell.tasks.length}</span>
                        ) : null}
                      </div>

                      {cell.tasks.length > 0 ? (
                        <div className="mt-2 flex items-center gap-1">
                          {cell.tasks.slice(0, 3).map((task) => (
                            <span
                              key={task.id}
                              className={
                                `h-1.5 w-1.5 rounded-full ` +
                                (task.completed ? 'bg-emerald-400' : getPriorityDot(task.priority))
                              }
                            />
                          ))}
                          {cell.tasks.length > 3 ? <span className="text-[10px] font-black text-slate-500">+</span> : null}
                        </div>
                      ) : (
                        <div className="mt-2 h-1.5" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Selected day</p>
                    <p className="text-[11px] font-bold text-slate-300">{selectedDateKey}</p>
                  </div>

                  {selectedDayTasks.length === 0 ? (
                    <p className="text-[11px] text-slate-500 font-bold italic">No deadlines for this day.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayTasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${task.completed ? 'bg-emerald-400' : getPriorityDot(task.priority)}`} />
                              <p className={`text-xs font-bold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{task.title}</p>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-0.5">
                              {task.completed ? 'Done' : 'Pending'} • {task.priority}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleTaskComplete(task.id)}
                            className="flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-200"
                          >
                            Toggle
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

        {joinState.error ? (
          <div className="mb-8 bg-red-500/10 border border-red-500/30 text-red-200 text-sm px-4 py-3 rounded-2xl">
            {joinState.error}
          </div>
        ) : null}

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
                {group.isJoined ? (
                  <button onClick={() => navigate(`/groups/${group.id}`)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                    Enter Workspace
                  </button>
                ) : (
                  <button
                    onClick={() => attemptJoinGroup(group.id)}
                    disabled={joinState.isJoining && joinState.groupId === String(group.id)}
                    className="w-full py-4 bg-blue-600 border border-blue-600 rounded-2xl font-bold hover:bg-blue-500 hover:border-blue-500 transition-all disabled:opacity-60"
                  >
                    {joinState.isJoining && joinState.groupId === String(group.id) ? 'Joining...' : 'Join Group'}
                  </button>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ title, priority, date, completed, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full text-left bg-white/[0.03] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all cursor-pointer backdrop-blur-sm"
  >
    <div className="flex items-center gap-4">
      <div className={`w-3 h-3 rounded-full ${priority === 'high' ? 'bg-red-500 shadow-[0_0_12px_#f43f5e]' : priority === 'medium' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-green-500'}`} />
      <div className="flex items-center gap-3">
        <FiCheckSquare className={completed ? 'text-emerald-400' : 'text-slate-600'} />
        <span className={`font-bold transition-colors ${completed ? 'text-slate-500 line-through' : 'text-white group-hover:text-blue-400'}`}>{title}</span>
      </div>
    </div>
    <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
      <FiClock className="text-blue-500" /> {date}
    </div>
  </button>
);

export default Group;
