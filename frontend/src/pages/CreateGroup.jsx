import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import groupService from '../services/groupService';

const COURSE_CODE_OPTIONS = [
	'IT1010',
	'IT1020',
	'IT2010',
	'IT2020',
	'IT3020',
	'IT3030',
	'SE3040',
	'SE3050',
	'CS1050',
	'CS2010',
	'EN1010',
	'BM2020'
];

const FACULTIES = [
	'Computing',
	'Business',
	'Engineering',
	'Architecture',
	'Science',
	'Humanities',
	'Law',
	'Medicine'
];

const ACADEMIC_ICONS = [
	{ key: 'book-stack', label: 'Book Stack' },
	{ key: 'lab-flask', label: 'Lab Flask' },
	{ key: 'code-brackets', label: 'Code Brackets' },
	{ key: 'graduation-cap', label: 'Graduation Cap' },
	{ key: 'clipboard-check', label: 'Clipboard Check' },
	{ key: 'atom', label: 'Atom' }
];

const PRIVACY_CHOICES = [
	{
		value: 'public',
		title: 'Public',
		description: 'Anyone can join and see materials.'
	},
	{
		value: 'private',
		title: 'Private',
		description: 'Membership is invite-only and hidden from search.'
	},
	{
		value: 'request',
		title: 'Request to Join',
		description: 'Visible in search but creator approval is required.'
	}
];

const mapPrivacyToPayload = (privacyMode) => {
	if (privacyMode === 'private') {
		return {
			visibility: 'hidden',
			joinPolicy: 'invite_only'
		};
	}

	if (privacyMode === 'request') {
		return {
			visibility: 'searchable',
			joinPolicy: 'approval_required'
		};
	}

	return {
		visibility: 'searchable',
		joinPolicy: 'open'
	};
};

const CreateGroup = () => {
	const navigate = useNavigate();

	const [groupName, setGroupName] = useState('');
	const [moduleInput, setModuleInput] = useState('');
	const [moduleTags, setModuleTags] = useState([]);
	const [facultyTag, setFacultyTag] = useState(FACULTIES[0]);
	const [selectedIcon, setSelectedIcon] = useState(ACADEMIC_ICONS[0].key);
	const [avatarPreview, setAvatarPreview] = useState('');
	const [privacyMode, setPrivacyMode] = useState('public');
	const [memberLimit, setMemberLimit] = useState(6);
	const [description, setDescription] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [feedback, setFeedback] = useState({ type: '', message: '' });

	const canAddModule = useMemo(() => {
		const value = moduleInput.trim().toUpperCase();
		return value.length > 0 && !moduleTags.includes(value) && moduleTags.length < 6;
	}, [moduleInput, moduleTags]);

	const onAddModule = () => {
		const normalized = moduleInput.trim().toUpperCase();
		if (!normalized || moduleTags.includes(normalized) || moduleTags.length >= 6) {
			return;
		}

		setModuleTags((prev) => [...prev, normalized]);
		setModuleInput('');
	};

	const onRemoveModule = (tag) => {
		setModuleTags((prev) => prev.filter((item) => item !== tag));
	};

	const onAvatarUpload = (event) => {
		const file = event.target.files?.[0];
		if (!file) {
			return;
		}

		if (!file.type.startsWith('image/')) {
			setFeedback({ type: 'error', message: 'Please upload an image file for the group avatar.' });
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			setAvatarPreview(String(reader.result || ''));
		};
		reader.readAsDataURL(file);
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		setFeedback({ type: '', message: '' });

		if (!groupName.trim()) {
			setFeedback({ type: 'error', message: 'Group name is required.' });
			return;
		}

		if (moduleTags.length === 0) {
			setFeedback({ type: 'error', message: 'Add at least one module or subject code.' });
			return;
		}

		if (!description.trim()) {
			setFeedback({ type: 'error', message: 'Please provide a short group goal or description.' });
			return;
		}

		const payload = {
			groupName: groupName.trim(),
			modules: moduleTags,
			facultyTag,
			iconKey: selectedIcon,
			avatarImage: avatarPreview || null,
			privacyMode,
			memberLimit,
			description: description.trim(),
			...mapPrivacyToPayload(privacyMode)
		};

		setIsSubmitting(true);

		try {
			await groupService.createGroup(payload);
			setFeedback({ type: 'success', message: 'Group created successfully.' });
			setTimeout(() => {
				navigate('/groups');
			}, 700);
		} catch (error) {
			setFeedback({
				type: 'error',
				message:
					error?.response?.data?.message ||
					'Could not create group right now. Please verify backend route and try again.'
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="min-h-screen px-4 md:px-8 py-8"
			style={{
				backgroundColor: '#0A0D17',
				backgroundImage:
					'radial-gradient(circle at 10% 8%, rgba(34,197,94,0.16), transparent 30%), radial-gradient(circle at 90% 85%, rgba(234,179,8,0.15), transparent 34%)'
			}}
		>
			<div className="mx-auto max-w-5xl space-y-6">
				<header className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 md:p-7">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-50">Create a Study Group</h1>
							<p className="mt-2 text-slate-300 max-w-2xl">
								Set a clear identity, define privacy rules, and launch a focused academic community.
							</p>
						</div>
						<Link
							to="/groups"
							className="h-10 px-4 rounded-xl border border-white/20 bg-white/5 text-slate-200 font-medium flex items-center"
						>
							Back to Explore
						</Link>
					</div>
				</header>

				<form onSubmit={onSubmit} className="space-y-6">
					<section className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 md:p-7">
						<h2 className="text-xl font-semibold text-slate-100">1. Group Identity</h2>
						<p className="text-sm text-slate-400 mt-1">This defines how your group appears in Explore.</p>

						<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="block">
								<span className="text-sm text-slate-300">Group Name</span>
								<input
									value={groupName}
									onChange={(event) => setGroupName(event.target.value)}
									placeholder="Software Engineering - Batch 01"
									className="mt-2 w-full h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-yellow-300/60"
								/>
							</label>

							<label className="block">
								<span className="text-sm text-slate-300">Faculty Tag</span>
								<select
									value={facultyTag}
									onChange={(event) => setFacultyTag(event.target.value)}
									className="mt-2 w-full h-11 rounded-xl border border-white/15 bg-white/5 px-3 text-slate-100 outline-none focus:border-yellow-300/60"
								>
									{FACULTIES.map((faculty) => (
										<option key={faculty} value={faculty} className="bg-slate-900 text-slate-100">
											{faculty}
										</option>
									))}
								</select>
							</label>
						</div>

						<div className="mt-5">
							<label className="block">
								<span className="text-sm text-slate-300">Module or Subject Codes</span>
								<div className="mt-2 rounded-xl border border-white/15 bg-white/5 p-3">
									<div className="flex flex-col sm:flex-row gap-2">
										<input
											list="course-codes"
											value={moduleInput}
											onChange={(event) => setModuleInput(event.target.value)}
											onKeyDown={(event) => {
												if (event.key === 'Enter') {
													event.preventDefault();
													onAddModule();
												}
											}}
											placeholder="Add course code (e.g., IT3020)"
											className="flex-1 h-11 rounded-xl border border-white/15 bg-slate-900/60 px-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-yellow-300/60"
										/>
										<datalist id="course-codes">
											{COURSE_CODE_OPTIONS.map((code) => (
												<option key={code} value={code} />
											))}
										</datalist>
										<button
											type="button"
											onClick={onAddModule}
											disabled={!canAddModule}
											className="h-11 px-5 rounded-xl bg-[#EAB308] text-slate-900 font-semibold disabled:opacity-40"
										>
											Add
										</button>
									</div>

									<div className="mt-3 flex flex-wrap gap-2">
										{moduleTags.length === 0 ? (
											<p className="text-sm text-slate-500">No modules added yet.</p>
										) : (
											moduleTags.map((tag) => (
												<span
													key={tag}
													className="inline-flex items-center gap-2 rounded-full border border-blue-400/35 bg-blue-400/10 px-3 py-1 text-sm text-blue-200"
												>
													{tag}
													<button
														type="button"
														onClick={() => onRemoveModule(tag)}
														className="text-blue-100/90 hover:text-white"
														aria-label={`Remove ${tag}`}
													>
														x
													</button>
												</span>
											))
										)}
									</div>
								</div>
							</label>
						</div>

						<div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<p className="text-sm text-slate-300">Group Icon</p>
								<div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
									{ACADEMIC_ICONS.map((icon) => {
										const active = selectedIcon === icon.key;
										return (
											<button
												key={icon.key}
												type="button"
												onClick={() => setSelectedIcon(icon.key)}
												className="h-10 rounded-lg border text-sm font-medium"
												style={
													active
														? {
																borderColor: 'rgba(234,179,8,0.55)',
																backgroundColor: 'rgba(234,179,8,0.2)',
																color: '#FDE68A'
															}
														: {
																borderColor: 'rgba(255,255,255,0.18)',
																backgroundColor: 'rgba(255,255,255,0.02)',
																color: '#CBD5E1'
															}
												}
											>
												{icon.label}
											</button>
										);
									})}
								</div>
							</div>

							<div>
								<p className="text-sm text-slate-300">Group Avatar</p>
								<div className="mt-2 rounded-xl border border-white/15 bg-white/5 p-3">
									<input
										type="file"
										accept="image/*"
										onChange={onAvatarUpload}
										className="block w-full text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-yellow-300 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-900"
									/>
									{avatarPreview ? (
										<img
											src={avatarPreview}
											alt="Group avatar preview"
											className="mt-3 h-20 w-20 rounded-xl object-cover border border-white/15"
										/>
									) : (
										<p className="mt-3 text-xs text-slate-500">Upload an avatar or keep icon-only identity.</p>
									)}
								</div>
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 md:p-7">
						<h2 className="text-xl font-semibold text-slate-100">2. Access and Privacy</h2>
						<p className="text-sm text-slate-400 mt-1">Control how people discover and join this group.</p>

						<div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
							{PRIVACY_CHOICES.map((choice) => {
								const active = privacyMode === choice.value;
								return (
									<button
										key={choice.value}
										type="button"
										onClick={() => setPrivacyMode(choice.value)}
										className="rounded-xl border p-4 text-left transition-colors"
										style={
											active
												? {
														borderColor: 'rgba(34,197,94,0.6)',
														backgroundColor: 'rgba(34,197,94,0.14)'
													}
												: {
														borderColor: 'rgba(255,255,255,0.15)',
														backgroundColor: 'rgba(255,255,255,0.02)'
													}
										}
									>
										<p className="text-slate-100 font-semibold">{choice.title}</p>
										<p className="text-sm text-slate-400 mt-1">{choice.description}</p>
									</button>
								);
							})}
						</div>

						<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
							<label className="block rounded-xl border border-white/15 bg-white/5 p-4">
								<span className="text-sm text-slate-300">Member Limit: {memberLimit}</span>
								<input
									type="range"
									min={2}
									max={200}
									value={memberLimit}
									onChange={(event) => setMemberLimit(Number(event.target.value))}
									className="mt-3 w-full accent-yellow-400"
								/>
								<p className="mt-2 text-xs text-slate-500">Use 6 for tight project teams, or raise for larger study circles.</p>
							</label>

							<label className="block">
								<span className="text-sm text-slate-300">Group Description / Goal</span>
								<textarea
									value={description}
									onChange={(event) => setDescription(event.target.value)}
									rows={5}
									placeholder="Preparing for the Mid-term Exam for OOP"
									className="mt-2 w-full rounded-xl border border-white/15 bg-white/5 p-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-yellow-300/60 resize-y"
								/>
							</label>
						</div>
					</section>

					<section className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-5 md:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div>
							<p className="text-slate-100 font-semibold">Ready to launch this group?</p>
							<p className="text-sm text-slate-400">You can refine settings later from group management.</p>
						</div>
						<button
							type="submit"
							disabled={isSubmitting}
							className="h-11 px-6 rounded-xl bg-[#EAB308] text-slate-900 font-semibold disabled:opacity-50"
						>
							{isSubmitting ? 'Creating...' : 'Create Group'}
						</button>
					</section>

					{feedback.message ? (
						<div
							className="rounded-xl px-4 py-3 text-sm"
							style={
								feedback.type === 'success'
									? {
											border: '1px solid rgba(34,197,94,0.4)',
											backgroundColor: 'rgba(34,197,94,0.12)',
											color: '#BBF7D0'
										}
									: {
											border: '1px solid rgba(248,113,113,0.42)',
											backgroundColor: 'rgba(239,68,68,0.12)',
											color: '#FECACA'
										}
							}
						>
							{feedback.message}
						</div>
					) : null}
				</form>
			</div>
		</div>
	);
};

export default CreateGroup;
