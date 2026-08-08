import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Loader from '../components/common/Loader';
import {
  User, Mail, FileText, Lock, Camera, Save,
  Shield, Eye, EyeOff, ChevronRight
} from 'lucide-react';

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const { success, error: toastError } = useToast();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await userService.getProfile();
      const data = res.data?.data ?? res.data;
      setProfile(data);
      setEditForm({ name: data.name ?? '', bio: data.bio ?? '' });
    } catch { toastError('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.updateProfile(editForm);
      const data = res.data?.data ?? res.data;
      setProfile(data);
      updateUser(data);
      success('Profile updated!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toastError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }
    setChangingPwd(true);
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      success('Password changed! All other sessions have been logged out.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      toastError(err.response?.data?.message || 'Password change failed');
    } finally { setChangingPwd(false); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate
    if (file.size > 5 * 1024 * 1024) { toastError('Image must be under 5MB'); return; }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await userService.uploadAvatar(formData);
      const data = res.data?.data ?? res.data;
      const avatarUrl = data?.avatar ?? data;
      setProfile(prev => ({ ...prev, avatar: avatarUrl }));
      updateUser({ avatar: avatarUrl });
      success('Avatar updated!');
    } catch { toastError('Failed to upload avatar'); }
  };

  const togglePwd = (field) => setShowPwd(p => ({ ...p, [field]: !p[field] }));

  if (loading) return <div className="flex items-center justify-center py-20"><Loader size="lg" /></div>;

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div className="page-wrapper">
      <h1 className="page-title mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Avatar + identity ── */}
        <div className="lg:col-span-1">
          <div className="card text-center">
            {/* Avatar */}
            <div className="relative inline-block mx-auto mb-4">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt=""
                  className="h-28 w-28 rounded-2xl object-cover ring-4 ring-blue-50 mx-auto"
                />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-primary-600 flex items-center justify-center ring-4 ring-blue-50 mx-auto">
                  <span className="text-3xl font-bold text-white">{initials}</span>
                </div>
              )}
              <label className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-md">
                <Camera className="h-4 w-4" />
                <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} />
              </label>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-2">{profile?.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{profile?.email}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className={profile?.role === 'ADMIN' ? 'badge badge-admin' : 'badge badge-member'}>
                {profile?.role === 'ADMIN' ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {profile?.role}
              </span>
            </div>
            {profile?.bio && (
              <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        {/* ── Right: Edit forms ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Edit Profile */}
          <div className="card">
            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-primary-500" />
              Personal Information
            </h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    className="input pl-10"
                    value={editForm.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                    required
                    placeholder="Your full name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    className="input pl-10 bg-slate-50 cursor-not-allowed"
                    value={profile?.email ?? ''}
                    disabled
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="label">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    className="input pl-10"
                    rows={3}
                    value={editForm.bio}
                    onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                    maxLength={500}
                    placeholder="Tell your teammates about yourself..."
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-right">{editForm.bio.length}/500</p>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <Loader size="sm" className="border-white/40 border-t-white" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <button
              onClick={() => setShowPasswordForm(p => !p)}
              className="w-full flex items-center justify-between text-left"
            >
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary-500" />
                Change Password
              </h3>
              <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${showPasswordForm ? 'rotate-90' : ''}`} />
            </button>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-4 mt-5 pt-5 border-t border-slate-100">
                {[
                  { field: 'currentPassword', label: 'Current Password',  autocomplete: 'current-password' },
                  { field: 'newPassword',     label: 'New Password',      autocomplete: 'new-password' },
                  { field: 'confirmPassword', label: 'Confirm New Password', autocomplete: 'new-password' },
                ].map(({ field, label, autocomplete }) => (
                  <div key={field}>
                    <label className="label">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPwd[field] ? 'text' : 'password'}
                        className="input pl-10 pr-10"
                        value={passwordForm[field]}
                        onChange={e => setPasswordForm(p => ({ ...p, [field]: e.target.value }))}
                        required
                        minLength={field !== 'currentPassword' ? 6 : 1}
                        autoComplete={autocomplete}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => togglePwd(field)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPwd[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <button type="submit" disabled={changingPwd} className="btn-primary flex items-center gap-2">
                    {changingPwd ? <Loader size="sm" className="border-white/40 border-t-white" /> : <Lock className="h-4 w-4" />}
                    {changingPwd ? 'Changing...' : 'Change Password'}
                  </button>
                  <button type="button" onClick={() => setShowPasswordForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
