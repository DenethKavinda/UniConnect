import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import groupService from '../services/groupService';

const isValidObjectId = (value) => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

const JoinGroup = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [state, setState] = useState({ isLoading: true, error: '' });

  useEffect(() => {
    const run = async () => {
      if (!groupId || !isValidObjectId(groupId)) {
        setState({ isLoading: false, error: 'Invalid invite link.' });
        return;
      }

      setState({ isLoading: true, error: '' });
      try {
        await groupService.joinGroup(groupId);
        navigate(`/groups/${groupId}`);
      } catch (error) {
        const status = error?.response?.status;
        const apiMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message;
        const message = apiMessage
          ? `${apiMessage}${status ? ` (HTTP ${status})` : ''}`
          : 'Unable to join this group right now. Please try again.';
        setState({ isLoading: false, error: message });
      }
    };

    run();
  }, [groupId, navigate]);

  if (state.isLoading) {
    return (
      <div className="app-page min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="app-page min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-200 font-black mb-2">Unable to join</p>
        <p className="text-slate-500 text-sm mb-6">{state.error}</p>
        <Link
          to="/groups"
          className="bg-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-colors"
        >
          Back to Groups
        </Link>
      </div>
    );
  }

  return null;
};

export default JoinGroup;
