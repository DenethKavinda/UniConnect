import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiCheckCircle, FiFileText, FiMessageSquare, FiTarget, FiUsers } from 'react-icons/fi';
import groupService from '../services/groupService';

const COURSE_CODES = [
	'IT1010',
	'IT1020',
	'IT2010',
	'IT2020',
	'IT3020',
	'IT3030',
	'SE3040',
	'SE3050',
	'CS4010',
	'CS4020',
	'BM2010',
	'EN3010'
];

const FACULTIES = ['Computing', 'Business', 'Engineering', 'Architecture', 'Humanities', 'Science'];

const PRESET_ICONS = [
	{ id: 'book', label: 'Book Stack', emoji: '📚' },
	{ id: 'code', label: 'Code Lab', emoji: '💻' },
	{ id: 'project', label: 'Project Hub', emoji: '🧩' },
	{ id: 'exam', label: 'Exam Prep', emoji: '📝' },
	{ id: 'research', label: 'Research', emoji: '🔬' },
	{ id: 'team', label: 'Teamwork', emoji: '🤝' }
];

const PRIVACY_OPTIONS = [
	{
		value: 'public',
		label: 'Public',
		description: 'Anyone can join and view materials.'
	},
	{
		value: 'private',
		label: 'Private',
		description: 'Hidden group. Invite-only membership.'
	},
	{
		value: 'request',
		label: 'Request to Join',
		description: 'Visible in search but creator approval is required.'
	}
];

const CreateGroup = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		groupName: '',
		moduleSubject: '',
		facultyTag: FACULTIES[0],
		description: '',
		privacy: 'public',
		memberLimit: 40,
		avatarPreset: PRESET_ICONS[0].id,
		sharedMaterials: true,
		discussionForum: true,
		taskTracker: false
	});
	const [avatarFile, setAvatarFile] = useState(null);
	const [avatarPreview, setAvatarPreview] = useState('');
	const [moduleSearch, setModuleSearch] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [feedback, setFeedback] = useState({ type: '', message: '' });

	const filteredCodes = useMemo(() => {
		const query = moduleSearch.trim().toLowerCase();

		if (!query) {
			return COURSE_CODES;
		}

		return COURSE_CODES.filter((code) => code.toLowerCase().includes(query));
	}, [moduleSearch]);

	const handleFieldChange = (event) => {
		const { name, value, type, checked } = event.target;
		setForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const handleModuleSelect = (code) => {
		setForm((prev) => ({ ...prev, moduleSubject: code }));
		setModuleSearch(code);
	};

	const handleAvatarUpload = (event) => {
		const nextFile = event.target.files?.[0] || null;
		setAvatarFile(nextFile);

		if (!nextFile) {
			setAvatarPreview('');
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			setAvatarPreview(typeof reader.result === 'string' ? reader.result : '');
		};
		reader.readAsDataURL(nextFile);
	};

	const validateForm = () => {
		if (!form.groupName.trim()) {
			return 'Group Name is required.';
		}
		if (!form.moduleSubject.trim()) {
			return 'Module/Subject is required.';
		}
		if (!form.description.trim()) {
			return 'Group Description is required.';
		}
		if (form.memberLimit < 2) {
			return 'Member limit must be at least 2.';
		}
		return '';
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setFeedback({ type: '', message: '' });

		const validationError = validateForm();
		if (validationError) {
			setFeedback({ type: 'error', message: validationError });
			return;
		}

		setIsSubmitting(true);

		const payload = {
			groupName: form.groupName.trim(),
			moduleSubject: form.moduleSubject.trim().toUpperCase(),
			facultyTag: form.facultyTag,
			description: form.description.trim(),
			privacy: form.privacy,
			memberLimit: Number(form.memberLimit),
			avatarPreset: form.avatarPreset,
			avatarFileName: avatarFile?.name || '',
			features: {
				sharedMaterials: form.sharedMaterials,
				discussionForum: form.discussionForum,
				taskTracker: form.taskTracker
			}
		};

		try {
			await groupService.createGroup(payload);
			setFeedback({ type: 'success', message: 'Group created successfully. Redirecting to Groups...' });
			setTimeout(() => {
				navigate('/groups');
			}, 900);
		} catch (error) {
			const status = error?.response?.status;
			const apiMessage =
				error?.response?.data?.message ||
				error?.response?.data?.error ||
				error?.message;
			const message = apiMessage
				? `${apiMessage}${status ? ` (HTTP ${status})` : ''}`
				: 'Unable to create group right now. Please try again.';
			setFeedback({ type: 'error', message });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div
			className="min-h-screen px-4 md:px-8 xl:px-12 py-8"
			style={{
				backgroundColor: '#0A0D17',
				backgroundImage:
					'radial-gradient(circle at 7% 12%, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at 88% 90%, rgba(234,179,8,0.14), transparent 36%)'
			}}
		>
			<div className="mx-auto w-full max-w-5xl space-y-6">
				<header className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 md:p-8">
					<Link
						to="/groups"
						className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
					>
						<FiArrowLeft /> Back to Groups
					</Link>
					<h1 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight text-slate-50">Create A New Group</h1>
					<p className="mt-2 text-slate-300 max-w-2xl">
						Define your group identity, set privacy rules, and activate collaboration tools for your squad.
					</p>
				</header>

				<form onSubmit={handleSubmit} className="space-y-6">
					<section className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 md:p-8 space-y-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center">
								<FiTarget />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-slate-100">1. Group Identity</h2>
								<p className="text-sm text-slate-400">How the group appears in the Explore grid.</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<label className="space-y-2">
								<span className="text-sm font-medium text-slate-200">Group Name</span>
								<input
									name="groupName"
									value={form.groupName}
									onChange={handleFieldChange}
									placeholder="Software Engineering - Batch 01"
									className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70"
								/>
							</label>

							<div className="space-y-2">
								<span className="text-sm font-medium text-slate-200">Module / Subject</span>
								<input
									value={moduleSearch}
									onChange={(event) => {
										setModuleSearch(event.target.value);
										setForm((prev) => ({ ...prev, moduleSubject: event.target.value }));
									}}
									placeholder="Search or type course code (e.g., IT3020)"
									className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70"
								/>
								<div className="rounded-xl border border-white/10 bg-[#111726] max-h-40 overflow-y-auto">
									{filteredCodes.length === 0 ? (
										<p className="px-3 py-2 text-sm text-slate-400">No matching course codes.</p>
									) : (
										filteredCodes.map((code) => (
											<button
												type="button"
												key={code}
												onClick={() => handleModuleSelect(code)}
												className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-blue-500/20 transition-colors"
											>
												{code}
											</button>
										))
									)}
								</div>
							</div>

							<label className="space-y-2">
								<span className="text-sm font-medium text-slate-200">Faculty Tag</span>
								<select
									name="facultyTag"
									value={form.facultyTag}
									onChange={handleFieldChange}
									className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-slate-100 outline-none focus:border-blue-400/70"
								>
									{FACULTIES.map((faculty) => (
										<option key={faculty} value={faculty} className="bg-[#0f172a] text-slate-100">
											{faculty}
										</option>
									))}
								</select>
							</label>

							<div className="space-y-2">
								<span className="text-sm font-medium text-slate-200">Group Icon / Avatar</span>
								<div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
									{PRESET_ICONS.map((icon) => (
										<button
											type="button"
											key={icon.id}
											onClick={() => setForm((prev) => ({ ...prev, avatarPreset: icon.id }))}
											className={`h-12 rounded-xl border text-xl transition-colors ${
												form.avatarPreset === icon.id
													? 'border-amber-400/60 bg-amber-400/20'
													: 'border-white/10 bg-white/5 hover:bg-white/10'
											}`}
											title={icon.label}
										>
											{icon.emoji}
										</button>
									))}
								</div>

								<label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer mt-1">
									<input
										type="file"
										accept="image/*"
										onChange={handleAvatarUpload}
										className="text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/30 file:px-3 file:py-1.5 file:text-blue-100"
									/>
								</label>

								{avatarPreview ? (
									<img
										src={avatarPreview}
										alt="Group avatar preview"
										className="h-16 w-16 rounded-xl border border-white/20 object-cover"
									/>
								) : null}
							</div>
						</div>
					</section>

					<section className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 md:p-8 space-y-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
								<FiUsers />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-slate-100">2. Access & Privacy</h2>
								<p className="text-sm text-slate-400">Control who can discover and join this group.</p>
							</div>
						</div>

						<div className="space-y-3">
							<p className="text-sm font-medium text-slate-200">Privacy Toggle</p>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{PRIVACY_OPTIONS.map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() => setForm((prev) => ({ ...prev, privacy: option.value }))}
										className={`rounded-xl border p-4 text-left transition-colors ${
											form.privacy === option.value
												? 'border-amber-400/50 bg-amber-400/15'
												: 'border-white/10 bg-white/5 hover:bg-white/10'
										}`}
									>
										<p className="text-sm font-semibold text-slate-100">{option.label}</p>
										<p className="text-xs text-slate-400 mt-1">{option.description}</p>
									</button>
								))}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<label className="space-y-2">
								<span className="text-sm font-medium text-slate-200">Member Limit: {form.memberLimit}</span>
								<input
									type="range"
									name="memberLimit"
									min="2"
									max="200"
									value={form.memberLimit}
									onChange={handleFieldChange}
									className="w-full accent-amber-400"
								/>
							</label>

							<label className="space-y-2">
								<span className="text-sm font-medium text-slate-200">Group Description</span>
								<textarea
									name="description"
									value={form.description}
									onChange={handleFieldChange}
									rows={5}
									placeholder="Preparing for the Mid-term Exam for OOP"
									className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-400/70 resize-none"
								/>
							</label>
						</div>
					</section>

					<section className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-6 md:p-8 space-y-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
								<FiCheckCircle />
							</div>
							<div>
								<h2 className="text-xl font-semibold text-slate-100">3. Tool Integration</h2>
								<p className="text-sm text-slate-400">Choose which modules are active for your group.</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<FeatureToggle
								icon={<FiBookOpen className="text-blue-300" />}
								title="Shared Materials"
								description="Enable a dedicated folder for PDFs and notes."
								checked={form.sharedMaterials}
								name="sharedMaterials"
								onChange={handleFieldChange}
							/>
							<FeatureToggle
								icon={<FiMessageSquare className="text-amber-300" />}
								title="Discussion Forum"
								description="Enable a Q&A message board for members."
								checked={form.discussionForum}
								name="discussionForum"
								onChange={handleFieldChange}
							/>
							<FeatureToggle
								icon={<FiFileText className="text-emerald-300" />}
								title="Task Tracker"
								description="Enable a simple to-do list for milestones."
								checked={form.taskTracker}
								name="taskTracker"
								onChange={handleFieldChange}
							/>
						</div>
					</section>

					{feedback.message ? (
						<div
							className={`rounded-xl px-4 py-3 text-sm border ${
								feedback.type === 'success'
									? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
									: 'bg-red-500/15 border-red-400/40 text-red-200'
							}`}
						>
							{feedback.message}
						</div>
					) : null}

					<div className="flex flex-wrap items-center gap-3 pb-10">
						<button
							type="submit"
							disabled={isSubmitting}
							className="h-12 px-6 rounded-xl font-semibold text-slate-900 bg-[#EAB308] border border-amber-400/50 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'Creating Group...' : 'Create Group'}
						</button>
						<Link
							to="/groups"
							className="h-12 px-5 rounded-xl font-semibold text-slate-200 border border-white/15 bg-white/5 hover:bg-white/10 transition inline-flex items-center"
						>
							Cancel
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

const FeatureToggle = ({ icon, title, description, checked, name, onChange }) => (
	<label className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-4 cursor-pointer hover:bg-white/10 transition-colors">
		<div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-lg">{icon}</div>
		<div>
			<p className="text-sm font-semibold text-slate-100">{title}</p>
			<p className="text-xs text-slate-400 mt-1">{description}</p>
		</div>
		<input
			type="checkbox"
			name={name}
			checked={checked}
			onChange={onChange}
			className="h-5 w-5 accent-amber-400"
		/>
	</label>
);

export default CreateGroup;
