import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import groupService from '../services/groupService';

const isValidObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

const GroupTasksRoute = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!groupId || !isValidObjectId(groupId)) {
        navigate('/dashboard', { replace: true });
        return;
      }

      try {
        const payload = await groupService.getGroups();
        const source = Array.isArray(payload) ? payload : payload?.groups || [];
        const group = source.find((g) => String(g?._id || g?.id) === String(groupId));
        const modules = group?.modules || group?.features || {};

        if (!modules.taskTracker) {
          navigate('/dashboard', { replace: true });
          return;
        }

        navigate(`/groups/${groupId}`, { replace: true, state: { activeTab: 'tasks' } });
      } catch (e) {
        const status = e?.response?.status;
        const apiMessage = e?.response?.data?.message || e?.response?.data?.error || e?.message;
        const message = apiMessage
          ? `${apiMessage}${status ? ` (HTTP ${status})` : ''}`
          : 'Unable to load group tools.';
        setError(message);
      }
    };

    run();
  }, [groupId, navigate]);

  if (error) {
    return (
      <div className="app-page min-h-screen flex items-center justify-center px-6 text-center">
        <p className="text-slate-200 font-black mb-2">Unable to open Tasks</p>
        <p className="text-slate-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="app-page min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
};

export default GroupTasksRoute;
