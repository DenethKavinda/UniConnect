import React, { useEffect, useMemo, useState } from 'react';
import groupService from '../services/groupService';

const FACULTY_FALLBACK = 'General';

const mapGroup = (raw, index) => ({
	id: String(raw?._id || raw?.id || `group-${index}`),
	groupName: raw?.groupName || raw?.name || 'Untitled Group',
	memberCount: Number(raw?.memberCount || raw?.membersCount || raw?.members?.length || 0),
	facultyTag: raw?.facultyTag || raw?.faculty || FACULTY_FALLBACK,
	userAvatars: Array.isArray(raw?.userAvatars)
		? raw.userAvatars
		: Array.isArray(raw?.members)
			? raw.members
					.map((member) => member?.avatar || member?.profileImage || member?.photo)
					.filter(Boolean)
			: [],
	isJoined: Boolean(raw?.isJoined || raw?.joined)
});

const Group = () => {
	const [groups, setGroups] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedFaculty, setSelectedFaculty] = useState('All');
	const [joiningIds, setJoiningIds] = useState(new Set());
	const [activityItems, setActivityItems] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		let isMounted = true;

		const fetchGroups = async () => {
			setIsLoading(true);
			setErrorMessage('');

			try {
				const payload = await groupService.getGroups();
				const source = Array.isArray(payload) ? payload : payload?.groups || [];
				const mapped = source.map((item, index) => mapGroup(item, index));

				if (isMounted) {
					setGroups(mapped);
					setActivityItems((prev) => {
						if (prev.length > 0) {
							return prev;
						}

						return mapped.slice(0, 4).map((item, idx) => ({
							id: `boot-${item.id}-${idx}`,
							message: `New material uploaded in ${item.groupName}`,
							relativeTime: `${idx + 1}m ago`
						}));
					});
				}
			} catch (error) {
				if (isMounted) {
					setErrorMessage('Unable to load groups right now. Please try again.');
					setGroups([]);
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		fetchGroups();

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;

		const fetchActivity = async () => {
			try {
				const payload = await groupService.getLiveActivity();
				const source = Array.isArray(payload) ? payload : payload?.items || payload?.activity || [];

				if (!isMounted || source.length === 0) {
					return;
				}

				const mapped = source.slice(0, 8).map((item, index) => ({
					id: String(item?.id || item?._id || `activity-${index}`),
					message: item?.message || item?.text || 'New activity in your groups',
					relativeTime: item?.relativeTime || item?.time || 'Just now'
				}));

				setActivityItems(mapped);
			} catch (error) {
				// Keep the last good state if activity endpoint is unavailable.
			}
		};

		fetchActivity();
		const intervalId = setInterval(fetchActivity, 15000);

		return () => {
			isMounted = false;
			clearInterval(intervalId);
		};
	}, []);

	const faculties = useMemo(() => {
		const values = new Set(groups.map((group) => group.facultyTag || FACULTY_FALLBACK));
		return ['All', ...Array.from(values)];
	}, [groups]);

	const filteredGroups = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		return groups.filter((group) => {
			const matchesFaculty = selectedFaculty === 'All' || group.facultyTag === selectedFaculty;
			const matchesQuery =
				query.length === 0 ||
				group.groupName.toLowerCase().includes(query) ||
				group.facultyTag.toLowerCase().includes(query);

			return matchesFaculty && matchesQuery;
		});
	}, [groups, searchQuery, selectedFaculty]);

	const handleJoin = async (groupId) => {
		if (joiningIds.has(groupId)) {
			return;
		}

		const before = groups;

		setJoiningIds((prev) => new Set(prev).add(groupId));
		setGroups((prev) =>
			prev.map((group) =>
				group.id === groupId
					? {
							...group,
							isJoined: true,
							memberCount: group.isJoined ? group.memberCount : group.memberCount + 1
						}
					: group
			)
		);

		try {
			await groupService.joinGroup(groupId);

			setActivityItems((prev) => [
				{
					id: `join-${groupId}-${Date.now()}`,
					message: 'You joined a new study group',
					relativeTime: 'Just now'
				},
				...prev
			].slice(0, 10));
		} catch (error) {
			setGroups(before);
			setErrorMessage('Join failed. Please retry.');
		} finally {
			setJoiningIds((prev) => {
				const next = new Set(prev);
				next.delete(groupId);
				return next;
			});
		}
	};

	const renderAvatarStack = (avatars) => {
		if (!avatars || avatars.length === 0) {
			return (
				<div className="text-xs text-slate-400">No members visible yet</div>
			);
		}

		const visible = avatars.slice(0, 5);
		const remaining = avatars.length - visible.length;

		return (
			<div className="flex items-center">
				{visible.map((avatarUrl, index) => (
					<img
						key={`${avatarUrl}-${index}`}
						src={avatarUrl}
						alt="Group member avatar"
						loading="lazy"
						className="h-8 w-8 rounded-full border border-white/20 object-cover"
						style={{ marginLeft: index === 0 ? 0 : '-8px' }}
					/>
				))}
				{remaining > 0 ? (
					<div className="h-8 w-8 rounded-full border border-white/20 bg-slate-800 text-[10px] font-bold text-slate-200 flex items-center justify-center" style={{ marginLeft: '-8px' }}>
						+{remaining}
					</div>
				) : null}
			</div>
		);
	};

	return (
		<div
			className="min-h-screen px-4 md:px-8 xl:px-12 py-8"
			style={{
				backgroundColor: '#0A0D17',
				backgroundImage:
					'radial-gradient(circle at 8% 12%, rgba(59,130,246,0.16), transparent 32%), radial-gradient(circle at 88% 88%, rgba(234,179,8,0.12), transparent 36%)'
			}}
		>
			<div className="mx-auto w-full max-w-[1880px] space-y-6">
				<header className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 md:p-7">
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-50">UniConnect Groups</h1>
					<p className="mt-2 text-slate-300 max-w-2xl">
						Discover communities, collaborate with classmates, and join your faculty network in real time.
					</p>

					<div className="mt-5">
						<div className="h-12 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl flex items-center px-4 focus-within:border-blue-400/70 transition-colors">
							<span className="text-slate-400 mr-3">/</span>
							<input
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
								placeholder="Search groups by name, faculty, or topic"
								aria-label="Search groups"
								className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500"
							/>
						</div>
					</div>

					<div className="mt-4 flex gap-2 overflow-x-auto pb-1">
						{faculties.map((faculty) => {
							const isActive = selectedFaculty === faculty;
							return (
								<button
									key={faculty}
									onClick={() => setSelectedFaculty(faculty)}
									className="rounded-full px-4 h-9 text-sm font-semibold border transition-colors whitespace-nowrap"
									style={
										isActive
											? {
													borderColor: 'rgba(234,179,8,0.45)',
													backgroundColor: 'rgba(234,179,8,0.18)',
													color: '#FDE68A'
												}
											: {
													borderColor: 'rgba(255,255,255,0.12)',
													backgroundColor: 'rgba(255,255,255,0.03)',
													color: '#CBD5E1'
												}
									}
								>
									{faculty}
								</button>
							);
						})}
					</div>
				</header>

				<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,3fr)_360px] gap-6">
					<section>
						{isLoading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
								{Array.from({ length: 6 }).map((_, index) => (
									<div
										key={index}
										className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 min-h-[220px]"
									>
										<div className="h-5 w-2/3 rounded bg-white/10 animate-pulse" />
										<div className="mt-3 h-4 w-24 rounded bg-white/10 animate-pulse" />
										<div className="mt-10 h-8 w-36 rounded bg-white/10 animate-pulse" />
										<div className="mt-8 h-10 w-full rounded-xl bg-white/10 animate-pulse" />
									</div>
								))}
							</div>
						) : filteredGroups.length === 0 ? (
							<div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl min-h-[420px] flex flex-col items-center justify-center text-center px-6">
								<div className="relative w-48 h-48 mb-6">
									<div className="absolute inset-0 rounded-full bg-blue-500/20 blur-2xl" />
									<div className="absolute inset-5 rounded-full border border-white/20 bg-white/5 flex items-center justify-center">
										<div className="h-20 w-20 rounded-full border border-yellow-400/40 bg-yellow-400/10" />
									</div>
								</div>
								<h2 className="text-2xl font-semibold text-slate-100">No groups found</h2>
								<p className="mt-2 text-slate-400 max-w-md">
									Try a different faculty filter and check back for new communities in your department.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
								{filteredGroups.map((group, index) => {
									const isJoining = joiningIds.has(group.id);

									return (
										<article
											key={group.id}
											className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 min-h-[220px] flex flex-col transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-[0_16px_40px_rgba(2,6,23,0.45)]"
											style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
										>
											<div className="flex items-start justify-between gap-4">
												<h3 className="text-lg font-semibold text-slate-100 line-clamp-2">{group.groupName}</h3>
												<span className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-300">
													{group.facultyTag}
												</span>
											</div>

											<p className="mt-3 text-sm text-slate-400">
												{group.memberCount.toLocaleString()} members
											</p>

											<div className="mt-5">{renderAvatarStack(group.userAvatars)}</div>

											<button
												onClick={() => handleJoin(group.id)}
												disabled={group.isJoined || isJoining}
												aria-label={group.isJoined ? `Joined ${group.groupName}` : `Join ${group.groupName}`}
												className="mt-auto h-11 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed"
												style={
													group.isJoined
														? {
																backgroundColor: 'rgba(34,197,94,0.2)',
																border: '1px solid rgba(34,197,94,0.45)',
																color: '#BBF7D0'
															}
														: {
																backgroundColor: '#EAB308',
																border: '1px solid rgba(234,179,8,0.6)',
																color: '#111827'
															}
												}
											>
												{isJoining ? 'Joining...' : group.isJoined ? 'Joined' : 'Join'}
											</button>
										</article>
									);
								})}
							</div>
						)}
					</section>

					<aside className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 h-fit xl:sticky xl:top-[92px]">
						<h2 className="text-lg font-semibold text-slate-100">Live Activity</h2>
						<p className="text-xs text-slate-400 mt-1">Real-time updates from active groups</p>

						<div className="mt-4 divide-y divide-white/10">
							{activityItems.length === 0 ? (
								<div className="py-6 text-sm text-slate-400">No recent activity yet</div>
							) : (
								activityItems.slice(0, 8).map((item) => (
									<div key={item.id} className="py-3 animate-in fade-in duration-300">
										<p className="text-sm text-slate-200">{item.message}</p>
										<p className="text-xs text-slate-500 mt-1">{item.relativeTime}</p>
									</div>
								))
							)}
						</div>
					</aside>
				</div>

				{errorMessage ? (
					<div className="rounded-xl border border-red-400/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">
						{errorMessage}
					</div>
				) : null}
			</div>
		</div>
	);
};

export default Group;
