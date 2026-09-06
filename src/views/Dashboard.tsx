import { useState, useRef, useEffect, useCallback } from 'react';
import {
  User, FolderOpen, MessageSquare, LogOut, ExternalLink,
  Plus, Pencil, Trash2, Check, ChevronDown, Menu,
  LayoutDashboard, Upload, Star, Settings, FileText,
  Package, Store, Code2, Share2, Link2, Image as ImageIcon, Pin, PinOff, Sparkles, X, BadgeCheck,
} from 'lucide-react';
import { useView } from '../context/ViewContext';
import { useRefreshSiteData } from '../lib/queries';
import { MAX_CATEGORIES_PER_PROJECT } from '../components/ProjectShared';
import { supabase, uploadMedia } from '../lib/supabaseClient';
import {
  fetchProfile, saveProfile, deleteCV,
  fetchSocial, saveSocial,
  fetchSocialIcons, addSocialIcon, updateSocialIcon, deleteSocialIcon,
  fetchProjects, addProject, updateProject, deleteProject,
  fetchSkills, addSkill, updateSkill, deleteSkill,
  fetchTrustedBy, addTrustedBrand, updateTrustedBrand, deleteTrustedBrand,
  fetchTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
  fetchPackages, updatePackage,
  fetchGabzstoreSettings, saveGabzstoreSettings,
  getLastSupabaseError,
  DEFAULT_PROFILE, DEFAULT_SOCIAL, DEFAULT_GABZSTORE_SETTINGS,
  type DashProject, type DashTestimonial, type DashSkill, type TrustedBrand, type SocialLinks, type SocialIcon,
  type ProfileData, type GabzstorePackage, type PackageFeature, type GabzstoreSettings, type SiteKey,
} from '../lib/storage';

type SiteMode = SiteKey; // 'gabzdev' | 'gabzstore'
type GabzdevNav = 'profile' | 'projects' | 'skills' | 'testimonials' | 'trusted' | 'social' | 'settings';
type GabzstoreNav = 'packages' | 'projects' | 'testimonials' | 'social' | 'settings';

const categories = ['UI/UX', 'Website Design', 'App Design', 'Graphic Design'];

// ============================================================
// SHARED UI PRIMITIVES
// ============================================================
function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <button key={i} type="button" onClick={() => onChange(i + 1)}
          onMouseEnter={() => setHovered(i + 1)} onMouseLeave={() => setHovered(0)}
          className="focus-ring rounded" aria-label={`${i + 1} bintang`}>
          <Star size={20} fill={(hovered || value) > i ? '#FBBF24' : 'none'}
            style={{ color: (hovered || value) > i ? '#FBBF24' : '#CBD5E1' }} />
        </button>
      ))}
    </div>
  );
}

function FieldInput({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-200 focus-ring"
        style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B', backdropFilter: 'blur(8px)' }} />
    </div>
  );
}

function FieldTextarea({ label, value, onChange, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
        className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-200 focus-ring resize-none"
        style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B', backdropFilter: 'blur(8px)' }} />
    </div>
  );
}

function PanelCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-6 ${className}`} style={{
      background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(18px) saturate(125%)',
      WebkitBackdropFilter: 'blur(18px) saturate(125%)', border: '1px solid rgba(255,255,255,0.55)',
      borderRadius: '20px', boxShadow: '0 4px 24px rgba(31,38,135,0.06)',
    }}>
      {children}
    </div>
  );
}

function SavingButton({ onClick, saved, saving }: { onClick: () => void; saved: boolean; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving}
      className={`inline-flex items-center gap-2 text-sm font-semibold py-3 px-6 rounded-full transition-all duration-300 focus-ring ${saved ? 'bg-green-500 text-white' : 'btn-primary'}`}
      style={{ opacity: saving ? 0.7 : 1 }}>
      {saved ? <><Check size={15} /> Tersimpan</> : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
    </button>
  );
}

// ============================================================
// GABZDEV — PROFILE PANEL
// ============================================================
function ProfilePanel() {
  const [profile, setProfileState] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile().then((p) => { setProfileState(p); setLoading(false); });
  }, []);

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const url = await uploadMedia(file, 'cv');
      await saveProfile({ cv_url: url, cv_filename: file.name });
      setProfileState((p) => ({ ...p, cv_url: url, cv_filename: file.name }));
    } catch (err) {
      alert('Upload CV gagal: ' + (err as Error).message);
    } finally {
      setUploadingCv(false);
    }
  };

  const handleDeleteCv = async () => {
    await deleteCV();
    setProfileState((p) => ({ ...p, cv_url: null, cv_filename: null }));
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveProfile({ name: profile.name, headline: profile.headline, bio: profile.bio });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert('Gagal menyimpan. Cek koneksi Supabase kamu.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
    }
  };

  if (loading) return <p className="text-sm" style={{ color: '#94A3B8' }}>Memuat data profil...</p>;

  return (
    <div className="space-y-6">
      <PanelCard>
        <h3 className="text-base font-bold mb-5" style={{ color: '#1E293B' }}>Informasi Profil</h3>
        <div className="space-y-4">
          <FieldInput label="Nama Lengkap" value={profile.name} onChange={(v) => setProfileState((p) => ({ ...p, name: v }))} placeholder="Gabriel Gonzales" />
          <FieldInput label="Judul / Role Headline" value={profile.headline} onChange={(v) => setProfileState((p) => ({ ...p, headline: v }))} placeholder="Web Developer & Tech Enthusiast" />
          <FieldTextarea label="Bio Singkat" value={profile.bio} onChange={(v) => setProfileState((p) => ({ ...p, bio: v }))} rows={4} />
          <SavingButton onClick={handleSave} saved={saved} saving={saving} />
        </div>
      </PanelCard>

      <PanelCard>
        <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: '#1E293B' }}>
          <FileText size={18} style={{ color: '#2563EB' }} /> CV / Resume
        </h3>
        {profile.cv_url ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgba(37,99,235,0.06)' }}>
              <div className="flex items-center gap-2 min-w-0">
                <FileText size={16} style={{ color: '#2563EB' }} />
                <span className="text-sm font-medium truncate" style={{ color: '#1E293B' }}>{profile.cv_filename || 'CV.pdf'}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={profile.cv_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 focus-ring"
                  style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB' }}>
                  Lihat
                </a>
                <button onClick={handleDeleteCv}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 focus-ring"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                  Hapus
                </button>
              </div>
            </div>
            <button onClick={() => cvInputRef.current?.click()} disabled={uploadingCv}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
              style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.3)' }}>
              <Upload size={14} /> {uploadingCv ? 'Mengunggah...' : 'Ganti CV'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: '#94A3B8' }}>Belum ada CV yang diupload. Upload CV agar bisa diunduh visitor.</p>
            <button onClick={() => cvInputRef.current?.click()} disabled={uploadingCv}
              className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 focus-ring">
              <Upload size={14} /> {uploadingCv ? 'Mengunggah...' : 'Upload CV'}
            </button>
          </div>
        )}
        <input type="file" accept=".pdf,.doc,.docx" ref={cvInputRef} onChange={handleCvChange} className="hidden" />
      </PanelCard>
    </div>
  );
}

// ============================================================
// PROJECTS PANEL (dipakai untuk kedua site, dibedakan lewat prop `site`)
// ============================================================
function ProjectsPanel({ site }: { site: SiteMode }) {
  const [projects, setProjects] = useState<DashProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategories, setFormCategories] = useState<string[]>(['Website Design']);
  const [formDescription, setFormDescription] = useState('');
  const [formLink, setFormLink] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    fetchProjects(site).then((data) => { setProjects(data); setLoading(false); });
  }, [site]);

  useEffect(() => { setLoading(true); reload(); }, [reload]);

  const availableCategories = Array.from(
    new Set([...categories, ...projects.flatMap((p) => p.categories?.length ? p.categories : [p.category]).filter(Boolean)])
  );

  const toggleCategory = (cat: string) => {
    setFormCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      if (prev.length >= MAX_CATEGORIES_PER_PROJECT) {
        alert(`Maksimal ${MAX_CATEGORIES_PER_PROJECT} kategori per proyek. Hapus salah satu dulu kalau mau ganti.`);
        return prev;
      }
      return [...prev, cat];
    });
  };

  const handleAddCategory = () => {
    const name = newCategoryInput.trim();
    if (!name) return;
    if (formCategories.length >= MAX_CATEGORIES_PER_PROJECT) {
      alert(`Maksimal ${MAX_CATEGORIES_PER_PROJECT} kategori per proyek. Hapus salah satu dulu kalau mau ganti.`);
      return;
    }
    if (!formCategories.includes(name)) setFormCategories((prev) => [...prev, name]);
    setNewCategoryInput('');
    setAddingCategory(false);
  };

  const resetForm = () => {
    setFormTitle(''); setFormCategories(['Website Design']);
    setFormDescription(''); setFormLink(''); setFormImage('');
    setFormIsPinned(false);
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (p: DashProject) => {
    setFormTitle(p.title);
    setFormCategories(p.categories?.length ? p.categories : (p.category ? [p.category] : []));
    setFormDescription(p.description); setFormLink(p.link);
    setFormImage(p.image_url || ''); setFormIsPinned(Boolean(p.is_pinned));
    setEditingId(p.id); setShowForm(true);
  };

  const handleTogglePin = async (p: DashProject) => {
    const ok = await updateProject(p.id, { is_pinned: !p.is_pinned });
    if (!ok) {
      alert('Gagal mengubah status pin. Cek console browser (F12) untuk detail errornya.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
      return;
    }
    reload();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus proyek ini?')) return;
    await deleteProject(id);
    reload();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, 'projects');
      setFormImage(url);
    } catch (err) {
      alert('Upload gambar gagal: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    if (formCategories.length === 0) {
      alert('Pilih minimal 1 kategori.');
      return;
    }
    setSubmitting(true);
    let ok: boolean | DashProject | null;
    if (editingId !== null) {
      ok = await updateProject(editingId, {
        title: formTitle, category: formCategories[0], categories: formCategories, description: formDescription,
        link: formLink, image_url: formImage || null, is_pinned: formIsPinned,
      });
    } else {
      ok = await addProject(site, {
        title: formTitle, category: formCategories[0], categories: formCategories, description: formDescription,
        link: formLink, image_url: formImage || null, sort_order: projects.length, is_pinned: formIsPinned,
        tags: [], highlights: [], repo_url: null, demo_url: null,
      });
    }
    setSubmitting(false);
    if (!ok) {
      alert('Gagal menyimpan proyek. Kemungkinan sesi login habis atau izin akses (RLS) di Supabase belum diatur — cek console browser (F12) untuk detail errornya, atau pastikan migrasi MIGRATION_fix_gabzstore_admin_bugs.sql sudah dijalankan.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
      return;
    }
    resetForm();
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1E293B' }}>
            Manajemen Proyek {site === 'gabzstore' ? '(Galeri GabzStore)' : '(Portofolio)'}
          </h3>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            {loading ? 'Memuat...' : `${projects.length} proyek terdaftar · ${projects.filter((p) => p.is_pinned).length} tampil di dashboard utama`}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 focus-ring">
            <Plus size={15} /> Tambah Proyek
          </button>
        )}
      </div>

      {showForm && (
        <PanelCard>
          <h4 className="text-sm font-bold mb-4" style={{ color: '#1E293B' }}>
            {editingId !== null ? 'Edit Proyek' : 'Tambah Proyek Baru'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldInput label="Judul Proyek" value={formTitle} onChange={setFormTitle} placeholder="Nama proyek..." />

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                Kategori (maks {MAX_CATEGORIES_PER_PROJECT})
              </label>

              {formCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {formCategories.map((cat) => (
                    <span key={cat} className="inline-flex items-center gap-1.5 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-full"
                      style={{ background: 'rgba(37,99,235,0.1)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.18)' }}>
                      {cat}
                      <button type="button" onClick={() => toggleCategory(cat)} className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-100 focus-ring" aria-label={`Hapus kategori ${cat}`}>
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <button type="button" onClick={() => setCatOpen(!catOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all duration-200 focus-ring"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B' }}>
                  {formCategories.length >= MAX_CATEGORIES_PER_PROJECT ? 'Batas kategori tercapai' : 'Pilih atau tambah kategori...'}
                  <ChevronDown size={16} style={{ color: '#94A3B8', transform: catOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 200ms' }} />
                </button>
                {catOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 8px 30px rgba(31,38,135,0.10)' }}>
                    <div className="max-h-56 overflow-y-auto">
                      {availableCategories.map((cat) => {
                        const selected = formCategories.includes(cat);
                        return (
                          <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                            className="w-full flex items-center justify-between text-left px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-blue-50"
                            style={{ color: selected ? '#2563EB' : '#1E293B', fontWeight: selected ? 600 : 400 }}>
                            {cat}
                            {selected && <Check size={14} />}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {addingCategory ? (
                        <div className="flex items-center gap-2 p-2">
                          <input
                            type="text"
                            autoFocus
                            value={newCategoryInput}
                            onChange={(e) => setNewCategoryInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                            placeholder="Nama kategori baru..."
                            className="flex-grow px-3 py-2 text-sm rounded-lg outline-none focus-ring"
                            style={{ background: 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(37,99,235,0.25)', color: '#1E293B' }}
                          />
                          <button type="button" onClick={handleAddCategory}
                            className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 focus-ring" style={{ background: '#2563EB' }}>
                            <Check size={14} style={{ color: '#fff' }} />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setAddingCategory(true)}
                          className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm font-semibold transition-colors duration-150 hover:bg-blue-50"
                          style={{ color: '#2563EB' }}>
                          <Plus size={14} /> Tambah Kategori Baru
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                Tiap kategori tampil sebagai label warna-warni di kartu proyek, mis. "School Project", "Client Project".
              </p>
            </div>

            <FieldTextarea label="Deskripsi" value={formDescription} onChange={setFormDescription} rows={3} />
            <FieldInput label="Link Proyek" value={formLink} onChange={setFormLink} placeholder="https://..." type="url" />

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Gambar Proyek</label>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageChange} className="hidden" />
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading}
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
                style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.3)' }}>
                <Upload size={14} /> {uploading ? 'Mengunggah...' : formImage ? 'Ganti Gambar' : 'Upload Gambar'}
              </button>
              {formImage && (
                <div className="mt-3 relative inline-block">
                  <img src={formImage} alt="Preview" className="w-32 h-20 object-cover rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.6)' }} />
                </div>
              )}
            </div>

            <label
              className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
              style={{ background: formIsPinned ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.55)', border: formIsPinned ? '1.5px solid rgba(37,99,235,0.35)' : '1.5px solid rgba(255,255,255,0.55)' }}
            >
              <input type="checkbox" checked={formIsPinned} onChange={(e) => setFormIsPinned(e.target.checked)} className="w-4 h-4 accent-[#2563EB]" />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>Tampilkan di Dashboard Utama (Pinned)</p>
                <p className="text-xs" style={{ color: '#94A3B8' }}>Proyek pinned muncul di halaman utama portofolio. Sisanya tetap bisa dilihat lewat "Lihat Semua Proyek".</p>
              </div>
            </label>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary text-sm py-2.5 px-5 focus-ring inline-flex items-center gap-2">
                <Check size={15} /> {submitting ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
              <button type="button" onClick={resetForm} className="glass-button px-5 py-2.5 text-sm font-semibold focus-ring" style={{ color: '#475569' }}>
                Batal
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="space-y-4">
        {projects.map((p) => (
          <PanelCard key={p.id}>
            <div className="flex items-start gap-4">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title} className="w-14 h-14 rounded-xl object-cover shrink-0" style={{ border: '1px solid rgba(255,255,255,0.6)' }} />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,99,235,0.08)' }}>
                  <FolderOpen size={20} style={{ color: '#2563EB' }} strokeWidth={1.6} />
                </div>
              )}
              <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1E293B' }}>{p.title}</p>
                    <div className="flex items-center flex-wrap gap-1.5 mt-1">
                      {(p.categories?.length ? p.categories : (p.category ? [p.category] : [])).map((cat) => (
                        <span key={cat} className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB' }}>{cat}</span>
                      ))}
                      {p.is_pinned && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(37,99,235,0.9)', color: '#fff' }}>
                          <Pin size={10} /> Pinned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleTogglePin(p)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-50 focus-ring"
                      aria-label={p.is_pinned ? 'Lepas dari dashboard utama' : 'Tampilkan di dashboard utama'}
                      title={p.is_pinned ? 'Lepas dari dashboard utama' : 'Tampilkan di dashboard utama'}>
                      {p.is_pinned ? <PinOff size={14} style={{ color: '#EF4444' }} /> : <Pin size={14} style={{ color: '#2563EB' }} />}
                    </button>
                    <button onClick={() => handleEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-50 focus-ring" aria-label="Edit proyek">
                      <Pencil size={14} style={{ color: '#2563EB' }} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-50 focus-ring" aria-label="Hapus proyek">
                      <Trash2 size={14} style={{ color: '#EF4444' }} />
                    </button>
                  </div>
                </div>
                {p.description && (
                  <p className="text-xs mt-1.5 line-clamp-2" style={{ color: '#94A3B8', lineHeight: 1.6 }}>{p.description}</p>
                )}
              </div>
            </div>
          </PanelCard>
        ))}
        {!loading && projects.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>Belum ada proyek. Klik "Tambah Proyek" untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TESTIMONIALS PANEL (dipakai untuk kedua site)
// ============================================================
function TestimonialsPanel({ site }: { site: SiteMode }) {
  const [testimonials, setTestimonials] = useState<DashTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formQuote, setFormQuote] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formPhoto, setFormPhoto] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [photoMode, setPhotoMode] = useState<'upload' | 'link'>('link');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    fetchTestimonials(site).then((data) => { setTestimonials(data); setLoading(false); });
  }, [site]);

  useEffect(() => { setLoading(true); reload(); }, [reload]);

  const resetForm = () => {
    setFormName(''); setFormDesignation(''); setFormQuote(''); setFormRating(5);
    setFormPhoto(''); setFormWhatsapp(''); setPhotoMode('link');
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (t: DashTestimonial) => {
    setFormName(t.name); setFormDesignation(t.designation);
    setFormQuote(t.quote); setFormRating(t.rating);
    setFormPhoto(t.photo_url || ''); setFormWhatsapp(t.whatsapp || '');
    setPhotoMode('link');
    setEditingId(t.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus testimoni ini?')) return;
    await deleteTestimonial(id);
    reload();
  };

  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadMedia(file, 'social');
      setFormPhoto(url);
    } catch (err) {
      alert('Upload foto gagal: ' + (err as Error).message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    const payload = {
      name: formName, designation: formDesignation, quote: formQuote, rating: formRating,
      photo_url: formPhoto || null, whatsapp: formWhatsapp.replace(/\D/g, '') || null,
    };
    const ok = editingId !== null
      ? await updateTestimonial(editingId, payload)
      : await addTestimonial(site, { ...payload, sort_order: testimonials.length });
    setSubmitting(false);
    if (!ok) {
      alert('Gagal menyimpan testimoni. Cek console browser (F12) untuk detail errornya, atau pastikan migrasi SQL terbaru sudah dijalankan.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
      return;
    }
    resetForm();
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1E293B' }}>
            Manajemen Testimoni {site === 'gabzstore' ? '(GabzStore)' : '(Portofolio)'}
          </h3>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{loading ? 'Memuat...' : `${testimonials.length} testimoni terdaftar`}</p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 focus-ring">
            <Plus size={15} /> Tambah Testimoni
          </button>
        )}
      </div>

      {showForm && (
        <PanelCard>
          <h4 className="text-sm font-bold mb-4" style={{ color: '#1E293B' }}>
            {editingId !== null ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldInput label="Nama" value={formName} onChange={setFormName} placeholder="Nama klien..." />
            <FieldInput label="Jabatan / Usaha" value={formDesignation} onChange={setFormDesignation} placeholder="Owner Toko..." />
            <FieldTextarea label="Testimoni" value={formQuote} onChange={setFormQuote} rows={4} />
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Rating</label>
              <StarInput value={formRating} onChange={setFormRating} />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Foto Profil (opsional)</label>
              <div className="flex gap-1.5 p-1 rounded-lg mb-3 w-fit" style={{ background: 'rgba(37,99,235,0.06)' }}>
                <button type="button" onClick={() => setPhotoMode('link')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: photoMode === 'link' ? '#2563EB' : 'transparent', color: photoMode === 'link' ? '#fff' : '#475569' }}>
                  <Link2 size={12} /> Pakai URL
                </button>
                <button type="button" onClick={() => setPhotoMode('upload')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: photoMode === 'upload' ? '#2563EB' : 'transparent', color: photoMode === 'upload' ? '#fff' : '#475569' }}>
                  <Upload size={12} /> Upload File
                </button>
              </div>
              {photoMode === 'upload' ? (
                <>
                  <input type="file" accept="image/*" ref={photoInputRef} onChange={handlePhotoFileChange} className="hidden" />
                  <button type="button" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
                    style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.3)' }}>
                    <Upload size={14} /> {uploadingPhoto ? 'Mengunggah...' : formPhoto ? 'Ganti Foto' : 'Upload Foto'}
                  </button>
                </>
              ) : (
                <input type="url" value={formPhoto} onChange={(e) => setFormPhoto(e.target.value)} placeholder="https://..."
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none focus-ring"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B' }} />
              )}
              {formPhoto && (
                <img src={formPhoto} alt="Preview" className="mt-3 w-14 h-14 object-cover rounded-full" style={{ border: '1px solid rgba(255,255,255,0.6)' }} />
              )}
              <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>Kalau kosong, avatar bakal tampil pakai inisial nama.</p>
            </div>

            <FieldInput label="Nomor WhatsApp (opsional, format 62xxx)" value={formWhatsapp} onChange={setFormWhatsapp} placeholder="6281234567890" />
            <p className="text-xs -mt-2" style={{ color: '#94A3B8' }}>Kalau diisi, kartu testimoni ini bisa diklik pengunjung buat langsung chat WA orang ini.</p>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary text-sm py-2.5 px-5 focus-ring inline-flex items-center gap-2">
                <Check size={15} /> {submitting ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
              <button type="button" onClick={resetForm} className="glass-button px-5 py-2.5 text-sm font-semibold focus-ring" style={{ color: '#475569' }}>
                Batal
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="space-y-4">
        {testimonials.map((t) => (
          <PanelCard key={t.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex gap-3">
                {t.photo_url ? (
                  <img src={t.photo_url} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB' }}>
                    {t.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{t.name}</p>
                    {t.whatsapp && <MessageSquare size={12} style={{ color: '#22C55E' }} />}
                  </div>
                  <p className="text-xs mb-1.5" style={{ color: '#94A3B8' }}>{t.designation}</p>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill={i < t.rating ? '#FBBF24' : 'none'} style={{ color: i < t.rating ? '#FBBF24' : '#CBD5E1' }} />
                    ))}
                  </div>
                  <p className="text-xs line-clamp-2" style={{ color: '#64748B', lineHeight: 1.6 }}>{t.quote}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleEdit(t)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-50 focus-ring" aria-label="Edit testimoni">
                  <Pencil size={14} style={{ color: '#2563EB' }} />
                </button>
                <button onClick={() => handleDelete(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-50 focus-ring" aria-label="Hapus testimoni">
                  <Trash2 size={14} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </PanelCard>
        ))}
        {!loading && testimonials.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>Belum ada testimoni. Klik "Tambah Testimoni" untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GABZDEV — SETTINGS PANEL (social links)
// ============================================================
function GabzdevSettingsPanel() {
  const [social, setSocial] = useState<SocialLinks>(DEFAULT_SOCIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSocial().then((s) => { setSocial(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveSocial(social);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert('Gagal menyimpan. Cek console browser (F12) untuk detail errornya.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
    }
  };

  if (loading) return <p className="text-sm" style={{ color: '#94A3B8' }}>Memuat pengaturan...</p>;

  return (
    <div className="space-y-6">
      <PanelCard>
        <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: '#1E293B' }}>
          <Settings size={18} style={{ color: '#2563EB' }} /> Kontak (Portofolio)
        </h3>
        <div className="space-y-4">
          <FieldInput label="Nomor WhatsApp" value={social.whatsapp} onChange={(v) => setSocial((s) => ({ ...s, whatsapp: v }))} placeholder="08xxxxxxxxxx" />
          <FieldInput label="Email" value={social.gmail} onChange={(v) => setSocial((s) => ({ ...s, gmail: v }))} type="email" />
          <SavingButton onClick={handleSave} saved={saved} saving={saving} />
        </div>
      </PanelCard>
      <p className="text-xs" style={{ color: '#94A3B8' }}>
        Link GitHub, Instagram, LinkedIn, dan sosial media lainnya sekarang diatur di menu <strong>Sosial Media</strong>.
      </p>
    </div>
  );
}

// ============================================================
// SKILLS PANEL — daftar keahlian untuk carousel di dashboard utama
// ============================================================
function SkillsPanel({ site }: { site: SiteMode }) {
  const [skills, setSkills] = useState<DashSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [logoMode, setLogoMode] = useState<'upload' | 'link'>('link');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    fetchSkills(site).then((data) => { setSkills(data); setLoading(false); });
  }, [site]);

  useEffect(() => { setLoading(true); reload(); }, [reload]);

  const resetForm = () => {
    setFormName(''); setFormLogo(''); setLogoMode('link');
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (s: DashSkill) => {
    setFormName(s.name); setFormLogo(s.logo_url || '');
    setLogoMode('link'); setEditingId(s.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus skill ini?')) return;
    await deleteSkill(id);
    reload();
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, 'skills');
      setFormLogo(url);
    } catch (err) {
      alert('Upload logo gagal: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    const ok = editingId !== null
      ? await updateSkill(editingId, { name: formName, logo_url: formLogo || null })
      : await addSkill(site, { name: formName, logo_url: formLogo || null, sort_order: skills.length });
    setSubmitting(false);
    if (!ok) {
      alert('Gagal menyimpan skill. Cek console browser (F12) untuk detail errornya, atau pastikan migrasi SQL terbaru sudah dijalankan.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
      return;
    }
    resetForm();
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1E293B' }}>Skills / Keahlian</h3>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            {loading ? 'Memuat...' : `${skills.length} skill terdaftar — tampil sebagai carousel berjalan di halaman utama`}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 focus-ring">
            <Plus size={15} /> Tambah Skill
          </button>
        )}
      </div>

      {showForm && (
        <PanelCard>
          <h4 className="text-sm font-bold mb-4" style={{ color: '#1E293B' }}>
            {editingId !== null ? 'Edit Skill' : 'Tambah Skill'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldInput label="Nama Skill" value={formName} onChange={setFormName} placeholder="React, Node.js, Figma, dll" />

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Logo</label>
              <div className="flex gap-1.5 p-1 rounded-lg mb-3 w-fit" style={{ background: 'rgba(37,99,235,0.06)' }}>
                <button type="button" onClick={() => setLogoMode('link')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: logoMode === 'link' ? '#2563EB' : 'transparent', color: logoMode === 'link' ? '#fff' : '#475569' }}>
                  <Link2 size={12} /> Pakai URL Gambar
                </button>
                <button type="button" onClick={() => setLogoMode('upload')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: logoMode === 'upload' ? '#2563EB' : 'transparent', color: logoMode === 'upload' ? '#fff' : '#475569' }}>
                  <Upload size={12} /> Upload File
                </button>
              </div>

              {logoMode === 'upload' ? (
                <>
                  <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoFileChange} className="hidden" />
                  <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploading}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
                    style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.3)' }}>
                    <Upload size={14} /> {uploading ? 'Mengunggah...' : formLogo ? 'Ganti Logo' : 'Upload Logo'}
                  </button>
                </>
              ) : (
                <input type="url" value={formLogo} onChange={(e) => setFormLogo(e.target.value)} placeholder="https://cdn.simpleicons.org/react/2563EB"
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-200 focus-ring"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B', backdropFilter: 'blur(8px)' }} />
              )}

              {formLogo && (
                <div className="mt-3 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}>
                  <img src={formLogo} alt="Preview logo" className="w-6 h-6 object-contain" />
                </div>
              )}
              <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                Tips: cari logo gratis di <span style={{ color: '#2563EB' }}>simpleicons.org</span> — tinggal copy URL-nya (contoh: cdn.simpleicons.org/react).
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary text-sm py-2.5 px-5 focus-ring inline-flex items-center gap-2">
                <Check size={15} /> {submitting ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
              <button type="button" onClick={resetForm} className="glass-button px-5 py-2.5 text-sm font-semibold focus-ring" style={{ color: '#475569' }}>
                Batal
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="space-y-4">
        {skills.map((s) => (
          <PanelCard key={s.id}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,99,235,0.06)' }}>
                {s.logo_url ? (
                  <img src={s.logo_url} alt={s.name} className="w-5 h-5 object-contain" />
                ) : (
                  <Sparkles size={18} style={{ color: '#94A3B8' }} />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{s.name}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleEdit(s)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-50 focus-ring" aria-label="Edit skill">
                  <Pencil size={14} style={{ color: '#2563EB' }} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-50 focus-ring" aria-label="Hapus skill">
                  <Trash2 size={14} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </PanelCard>
        ))}
        {!loading && skills.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>Belum ada skill. Klik "Tambah Skill" untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TRUSTED BY PANEL — logo brand/klien di section "Dipercaya Oleh"
// ============================================================
function TrustedByPanel({ site }: { site: SiteMode }) {
  const [brands, setBrands] = useState<TrustedBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formLogo, setFormLogo] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [logoMode, setLogoMode] = useState<'upload' | 'link'>('link');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    fetchTrustedBy(site).then((data) => { setBrands(data); setLoading(false); });
  }, [site]);

  useEffect(() => { setLoading(true); reload(); }, [reload]);

  const resetForm = () => {
    setFormName(''); setFormLogo(''); setFormUrl(''); setLogoMode('link');
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (b: TrustedBrand) => {
    setFormName(b.name); setFormLogo(b.logo_url || ''); setFormUrl(b.url || '');
    setLogoMode('link'); setEditingId(b.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus brand ini dari section Dipercaya Oleh?')) return;
    await deleteTrustedBrand(id);
    reload();
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, 'trusted');
      setFormLogo(url);
    } catch (err) {
      alert('Upload logo gagal: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    const payload = { name: formName, logo_url: formLogo || null, url: formUrl || null };
    const ok = editingId !== null
      ? await updateTrustedBrand(editingId, payload)
      : await addTrustedBrand(site, { ...payload, sort_order: brands.length });
    setSubmitting(false);
    if (!ok) {
      alert('Gagal menyimpan brand. Pastikan MIGRATION_trusted_by.sql sudah dijalankan di Supabase.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
      return;
    }
    resetForm();
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1E293B' }}>Dipercaya Oleh</h3>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            {loading ? 'Memuat...' : `${brands.length} brand terdaftar — tampil sebagai marquee logo di bawah testimoni`}
          </p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 focus-ring">
            <Plus size={15} /> Tambah Brand
          </button>
        )}
      </div>

      {showForm && (
        <PanelCard>
          <h4 className="text-sm font-bold mb-4" style={{ color: '#1E293B' }}>
            {editingId !== null ? 'Edit Brand' : 'Tambah Brand'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldInput label="Nama Brand / Klien" value={formName} onChange={setFormName} placeholder="GabzStore, SMKS Poncol, dll" />
            <FieldInput label="Link Website (opsional)" value={formUrl} onChange={setFormUrl} type="url" placeholder="https://contoh.com" />

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Logo</label>
              <div className="flex gap-1.5 p-1 rounded-lg mb-3 w-fit" style={{ background: 'rgba(37,99,235,0.06)' }}>
                <button type="button" onClick={() => setLogoMode('link')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: logoMode === 'link' ? '#2563EB' : 'transparent', color: logoMode === 'link' ? '#fff' : '#475569' }}>
                  <Link2 size={12} /> Pakai URL Gambar
                </button>
                <button type="button" onClick={() => setLogoMode('upload')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: logoMode === 'upload' ? '#2563EB' : 'transparent', color: logoMode === 'upload' ? '#fff' : '#475569' }}>
                  <Upload size={12} /> Upload File
                </button>
              </div>

              {logoMode === 'upload' ? (
                <>
                  <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoFileChange} className="hidden" />
                  <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploading}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
                    style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.3)' }}>
                    <Upload size={14} /> {uploading ? 'Mengunggah...' : formLogo ? 'Ganti Logo' : 'Upload Logo'}
                  </button>
                </>
              ) : (
                <input type="url" value={formLogo} onChange={(e) => setFormLogo(e.target.value)} placeholder="https://cdn.simpleicons.org/shopify/2563EB"
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-200 focus-ring"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B', backdropFilter: 'blur(8px)' }} />
              )}

              {formLogo && (
                <div className="mt-3 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}>
                  <img src={formLogo} alt="Preview logo" className="w-6 h-6 object-contain" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary text-sm py-2.5 px-5 focus-ring inline-flex items-center gap-2">
                <Check size={15} /> {submitting ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
              <button type="button" onClick={resetForm} className="glass-button px-5 py-2.5 text-sm font-semibold focus-ring" style={{ color: '#475569' }}>
                Batal
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="space-y-4">
        {brands.map((b) => (
          <PanelCard key={b.id}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,99,235,0.06)' }}>
                {b.logo_url ? (
                  <img src={b.logo_url} alt={b.name} className="w-5 h-5 object-contain" />
                ) : (
                  <BadgeCheck size={18} style={{ color: '#94A3B8' }} />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{b.name}</p>
                {b.url && <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{b.url}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleEdit(b)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-50 focus-ring" aria-label="Edit brand">
                  <Pencil size={14} style={{ color: '#2563EB' }} />
                </button>
                <button onClick={() => handleDelete(b.id)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-50 focus-ring" aria-label="Hapus brand">
                  <Trash2 size={14} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </PanelCard>
        ))}
        {!loading && brands.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>Belum ada brand. Klik "Tambah Brand" untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SOCIAL ICONS PANEL — list custom (GitHub, LinkedIn, dll), dipakai kedua site
// ============================================================
function SocialIconsPanel({ site }: { site: SiteMode }) {
  const [icons, setIcons] = useState<SocialIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLabel, setFormLabel] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formIcon, setFormIcon] = useState('');
  const [iconMode, setIconMode] = useState<'upload' | 'link'>('upload');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    fetchSocialIcons(site).then((data) => { setIcons(data); setLoading(false); });
  }, [site]);

  useEffect(() => { setLoading(true); reload(); }, [reload]);

  const resetForm = () => {
    setFormLabel(''); setFormUrl(''); setFormIcon(''); setIconMode('upload');
    setEditingId(null); setShowForm(false);
  };

  const handleEdit = (s: SocialIcon) => {
    setFormLabel(s.label); setFormUrl(s.url); setFormIcon(s.icon_url || '');
    setIconMode('link'); setEditingId(s.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus link sosial media ini?')) return;
    await deleteSocialIcon(id);
    reload();
  };

  const handleIconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMedia(file, 'social');
      setFormIcon(url);
    } catch (err) {
      alert('Upload ikon gagal: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim() || !formUrl.trim()) return;
    setSubmitting(true);
    if (editingId !== null) {
      await updateSocialIcon(editingId, { label: formLabel, url: formUrl, icon_url: formIcon || null });
    } else {
      await addSocialIcon(site, { label: formLabel, url: formUrl, icon_url: formIcon || null, sort_order: icons.length });
    }
    setSubmitting(false);
    resetForm();
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1E293B' }}>
            Sosial Media {site === 'gabzstore' ? '(GabzStore)' : '(Portofolio)'}
          </h3>
          <p className="text-sm" style={{ color: '#94A3B8' }}>{loading ? 'Memuat...' : `${icons.length} link terdaftar — GitHub, LinkedIn, atau link custom apa saja`}</p>
        </div>
        {!showForm && (
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-5 focus-ring">
            <Plus size={15} /> Tambah Link
          </button>
        )}
      </div>

      {showForm && (
        <PanelCard>
          <h4 className="text-sm font-bold mb-4" style={{ color: '#1E293B' }}>
            {editingId !== null ? 'Edit Link Sosial Media' : 'Tambah Link Sosial Media'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldInput label="Nama / Label" value={formLabel} onChange={setFormLabel} placeholder="GitHub, LinkedIn, dll" />
            <FieldInput label="URL Tujuan" value={formUrl} onChange={setFormUrl} placeholder="https://linkedin.com/in/username" type="url" />

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Ikon</label>
              <div className="flex gap-1.5 p-1 rounded-lg mb-3 w-fit" style={{ background: 'rgba(37,99,235,0.06)' }}>
                <button type="button" onClick={() => setIconMode('upload')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: iconMode === 'upload' ? '#2563EB' : 'transparent', color: iconMode === 'upload' ? '#fff' : '#475569' }}>
                  <Upload size={12} /> Upload File
                </button>
                <button type="button" onClick={() => setIconMode('link')}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                  style={{ background: iconMode === 'link' ? '#2563EB' : 'transparent', color: iconMode === 'link' ? '#fff' : '#475569' }}>
                  <Link2 size={12} /> Pakai URL Gambar
                </button>
              </div>

              {iconMode === 'upload' ? (
                <>
                  <input type="file" accept="image/*" ref={iconInputRef} onChange={handleIconFileChange} className="hidden" />
                  <button type="button" onClick={() => iconInputRef.current?.click()} disabled={uploading}
                    className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
                    style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.3)' }}>
                    <Upload size={14} /> {uploading ? 'Mengunggah...' : formIcon ? 'Ganti Ikon' : 'Upload Ikon'}
                  </button>
                </>
              ) : (
                <input type="url" value={formIcon} onChange={(e) => setFormIcon(e.target.value)} placeholder="https://cdn.simpleicons.org/linkedin/2563EB"
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all duration-200 focus-ring"
                  style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B', backdropFilter: 'blur(8px)' }} />
              )}

              {formIcon && (
                <div className="mt-3 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(255,255,255,0.6)' }}>
                  <img src={formIcon} alt="Preview ikon" className="w-6 h-6 object-contain" />
                </div>
              )}
              <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                Tips: cari ikon gratis di <span style={{ color: '#2563EB' }}>simpleicons.org</span> — tinggal copy URL-nya (contoh: cdn.simpleicons.org/linkedin).
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={submitting} className="btn-primary text-sm py-2.5 px-5 focus-ring inline-flex items-center gap-2">
                <Check size={15} /> {submitting ? 'Menyimpan...' : editingId !== null ? 'Simpan Perubahan' : 'Tambahkan'}
              </button>
              <button type="button" onClick={resetForm} className="glass-button px-5 py-2.5 text-sm font-semibold focus-ring" style={{ color: '#475569' }}>
                Batal
              </button>
            </div>
          </form>
        </PanelCard>
      )}

      <div className="space-y-4">
        {icons.map((s) => (
          <PanelCard key={s.id}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(37,99,235,0.06)' }}>
                {s.icon_url ? (
                  <img src={s.icon_url} alt={s.label} className="w-5 h-5 object-contain" />
                ) : (
                  <ImageIcon size={18} style={{ color: '#94A3B8' }} />
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{s.label}</p>
                <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{s.url}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleEdit(s)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-50 focus-ring" aria-label="Edit link">
                  <Pencil size={14} style={{ color: '#2563EB' }} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-red-50 focus-ring" aria-label="Hapus link">
                  <Trash2 size={14} style={{ color: '#EF4444' }} />
                </button>
              </div>
            </div>
          </PanelCard>
        ))}
        {!loading && icons.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>Belum ada link sosial media. Klik "Tambah Link" untuk memulai.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GABZSTORE — PACKAGES PANEL (paket harga)
// ============================================================
function PackagesPanel() {
  const [packages, setPackages] = useState<GabzstorePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    title: string; badge: string; badgeClass: string; rating: string; price: string;
    description: string; includesText: string; imageUrl: string; isPopular: boolean;
    features: PackageFeature[];
  }>({
    title: '', badge: '', badgeClass: 'std', rating: '5.0', price: '', description: '',
    includesText: '', imageUrl: '', isPopular: false, features: [],
  });
  const [imageMode, setImageMode] = useState<'upload' | 'link'>('link');
  const [uploadingImg, setUploadingImg] = useState(false);
  const [saving, setSaving] = useState(false);
  const imgInputRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(() => {
    fetchPackages().then((data) => { setPackages(data); setLoading(false); });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleEdit = (p: GabzstorePackage) => {
    setEditingId(p.id);
    setForm({
      title: p.title, badge: p.badge, badgeClass: p.badge_class || 'std', rating: p.rating,
      price: String(p.price), description: p.description,
      includesText: p.includes.join(', '), imageUrl: p.image_url || '',
      isPopular: Boolean(p.is_popular), features: p.features && p.features.length > 0 ? p.features : [{ icon: 'fa-check', text: '' }],
    });
    setImageMode('link');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const url = await uploadMedia(file, 'packages');
      setForm((f) => ({ ...f, imageUrl: url }));
    } catch (err) {
      alert('Upload gambar gagal: ' + (err as Error).message);
    } finally {
      setUploadingImg(false);
    }
  };

  const updateFeature = (i: number, patch: Partial<PackageFeature>) => {
    setForm((f) => ({ ...f, features: f.features.map((feat, idx) => (idx === i ? { ...feat, ...patch } : feat)) }));
  };
  const addFeature = () => setForm((f) => ({ ...f, features: [...f.features, { icon: 'fa-check', text: '' }] }));
  const removeFeature = (i: number) => setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!editingId) return;
    setSaving(true);
    const ok = await updatePackage(editingId, {
      title: form.title,
      badge: form.badge,
      badge_class: form.badgeClass,
      rating: form.rating,
      price: Number(form.price) || 0,
      description: form.description,
      includes: form.includesText.split(',').map((s) => s.trim()).filter(Boolean),
      image_url: form.imageUrl || null,
      is_popular: form.isPopular,
      features: form.features.filter((f) => f.text.trim()),
    });
    setSaving(false);
    if (!ok) {
      alert('Gagal menyimpan paket. Cek console browser (F12) untuk detail errornya, atau pastikan migrasi MIGRATION_fix_gabzstore_admin_bugs.sql sudah dijalankan.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
      return;
    }
    setEditingId(null);
    reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold" style={{ color: '#1E293B' }}>Paket Harga GabzStore</h3>
        <p className="text-sm" style={{ color: '#94A3B8' }}>{loading ? 'Memuat...' : `${packages.length} paket tersedia`}</p>
      </div>

      <div className="space-y-4">
        {packages.map((p) => (
          <PanelCard key={p.id}>
            {editingId === p.id ? (
              <div className="space-y-4">
                <FieldInput label="Nama Paket" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Badge" value={form.badge} onChange={(v) => setForm((f) => ({ ...f, badge: v }))} placeholder="Basic / Standard / Premium" />
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Warna Badge</label>
                    <select value={form.badgeClass} onChange={(e) => setForm((f) => ({ ...f, badgeClass: e.target.value }))}
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none focus-ring"
                      style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B' }}>
                      <option value="std">Standar (std)</option>
                      <option value="dlx">Deluxe (dlx)</option>
                      <option value="fam">Premium (fam)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Rating" value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} placeholder="4.9" />
                  <FieldInput label="Harga (Rp)" value={form.price} onChange={(v) => setForm((f) => ({ ...f, price: v }))} type="number" placeholder="450000" />
                </div>
                <FieldTextarea label="Deskripsi" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} rows={3} />
                <FieldTextarea label="Includes (pisahkan dengan koma)" value={form.includesText} onChange={(v) => setForm((f) => ({ ...f, includesText: v }))} rows={2} />

                <label className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={{ background: form.isPopular ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.55)', border: form.isPopular ? '1.5px solid rgba(251,191,36,0.4)' : '1.5px solid rgba(255,255,255,0.55)' }}>
                  <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))} className="w-4 h-4 accent-[#2563EB]" />
                  <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>Tandai sebagai "Paling Banyak Dicari" (Terpopuler)</p>
                </label>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Gambar Paket</label>
                  <div className="flex gap-1.5 p-1 rounded-lg mb-3 w-fit" style={{ background: 'rgba(37,99,235,0.06)' }}>
                    <button type="button" onClick={() => setImageMode('link')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                      style={{ background: imageMode === 'link' ? '#2563EB' : 'transparent', color: imageMode === 'link' ? '#fff' : '#475569' }}>
                      <Link2 size={12} /> Pakai URL
                    </button>
                    <button type="button" onClick={() => setImageMode('upload')}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md transition-all duration-200 focus-ring"
                      style={{ background: imageMode === 'upload' ? '#2563EB' : 'transparent', color: imageMode === 'upload' ? '#fff' : '#475569' }}>
                      <Upload size={12} /> Upload File
                    </button>
                  </div>
                  {imageMode === 'upload' ? (
                    <>
                      <input type="file" accept="image/*" ref={imgInputRef} onChange={handleImageFileChange} className="hidden" />
                      <button type="button" onClick={() => imgInputRef.current?.click()} disabled={uploadingImg}
                        className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 focus-ring"
                        style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB', border: '1.5px dashed rgba(37,99,235,0.3)' }}>
                        <Upload size={14} /> {uploadingImg ? 'Mengunggah...' : form.imageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
                      </button>
                    </>
                  ) : (
                    <input type="url" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..."
                      className="w-full px-4 py-3 text-sm rounded-xl outline-none focus-ring"
                      style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B' }} />
                  )}
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="Preview" className="mt-3 w-32 h-20 object-cover rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.6)' }} />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#94A3B8' }}>Daftar Fitur (ditampilkan di kartu & modal detail)</label>
                  <div className="space-y-2">
                    {form.features.map((feat, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input type="text" value={feat.icon} onChange={(e) => updateFeature(i, { icon: e.target.value })}
                          placeholder="fa-mobile" title="Nama ikon Font Awesome, contoh: fa-mobile, fa-globe, fa-bolt"
                          className="w-28 px-3 py-2.5 text-xs rounded-xl outline-none focus-ring shrink-0"
                          style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B' }} />
                        <input type="text" value={feat.text} onChange={(e) => updateFeature(i, { text: e.target.value })}
                          placeholder="Teks fitur, mis. Fully Responsive"
                          className="flex-grow px-3 py-2.5 text-sm rounded-xl outline-none focus-ring"
                          style={{ background: 'rgba(255,255,255,0.55)', border: '1.5px solid rgba(255,255,255,0.55)', color: '#1E293B' }} />
                        <button type="button" onClick={() => removeFeature(i)} className="w-9 h-9 flex items-center justify-center rounded-lg shrink-0 hover:bg-red-50 focus-ring" aria-label="Hapus fitur">
                          <Trash2 size={14} style={{ color: '#EF4444' }} />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addFeature} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg focus-ring" style={{ color: '#2563EB', background: 'rgba(37,99,235,0.06)' }}>
                      <Plus size={12} /> Tambah Fitur
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#94A3B8' }}>
                    Nama ikon pakai format Font Awesome (tanpa "fa-solid"), contoh: fa-mobile, fa-globe, fa-shopping-cart, fa-infinity.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 px-5 focus-ring inline-flex items-center gap-2">
                    <Check size={15} /> {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button onClick={() => setEditingId(null)} className="glass-button px-5 py-2.5 text-sm font-semibold focus-ring" style={{ color: '#475569' }}>
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-sm font-semibold" style={{ color: '#1E293B' }}>{p.title}</p>
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB' }}>{p.badge}</span>
                    {p.is_popular && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#B45309' }}>Terpopuler</span>}
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: '#2563EB' }}>Rp {p.price.toLocaleString('id-ID')}</p>
                  <p className="text-xs line-clamp-2" style={{ color: '#64748B', lineHeight: 1.6 }}>{p.description}</p>
                </div>
                <button onClick={() => handleEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-blue-50 focus-ring shrink-0" aria-label="Edit paket">
                  <Pencil size={14} style={{ color: '#2563EB' }} />
                </button>
              </div>
            )}
          </PanelCard>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// GABZSTORE — SETTINGS PANEL (kontak & info)
// ============================================================
function GabzstoreSettingsPanel() {
  const [settings, setSettingsState] = useState<GabzstoreSettings>(DEFAULT_GABZSTORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchGabzstoreSettings().then((s) => { setSettingsState(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveGabzstoreSettings(settings);
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } else {
      alert('Gagal menyimpan. Cek console browser (F12) untuk detail errornya, atau pastikan migrasi MIGRATION_fix_gabzstore_admin_bugs.sql sudah dijalankan.' + (getLastSupabaseError() ? '\n\nDetail: ' + getLastSupabaseError() : ''));
    }
  };

  if (loading) return <p className="text-sm" style={{ color: '#94A3B8' }}>Memuat pengaturan...</p>;

  return (
    <div className="space-y-6">
      <PanelCard>
        <h3 className="text-base font-bold mb-5 flex items-center gap-2" style={{ color: '#1E293B' }}>
          <Store size={18} style={{ color: '#2563EB' }} /> Kontak & Info GabzStore
        </h3>
        <div className="space-y-4">
          <FieldInput label="Nomor WhatsApp (format 62xxx, tanpa +)" value={settings.whatsapp} onChange={(v) => setSettingsState((s) => ({ ...s, whatsapp: v }))} placeholder="628811494688" />
          <FieldInput label="Email" value={settings.email} onChange={(v) => setSettingsState((s) => ({ ...s, email: v }))} type="email" />
          <FieldInput label="Jam Operasional" value={settings.jam_operasional} onChange={(v) => setSettingsState((s) => ({ ...s, jam_operasional: v }))} />
          <SavingButton onClick={handleSave} saved={saved} saving={saving} />
        </div>
      </PanelCard>
      <p className="text-xs" style={{ color: '#94A3B8' }}>
        Perubahan di sini otomatis update semua link WhatsApp &amp; email di halaman GabzStore setelah halaman di-refresh.
        Link Instagram, TikTok, GitHub, dll diatur di menu <strong>Sosial Media</strong>.
      </p>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function Dashboard() {
  const { setView } = useView();
  // Buang cache React Query pas balik ke halaman publik, biar perubahan
  // dari panel admin langsung kelihatan tanpa perlu hard refresh.
  const refreshSiteData = useRefreshSiteData();
  const backToPortfolio = () => {
    refreshSiteData();
    setView('portfolio');
  };
  const [siteMode, setSiteMode] = useState<SiteMode>('gabzdev');
  const [activeNavGabzdev, setActiveNavGabzdev] = useState<GabzdevNav>('profile');
  const [activeNavGabzstore, setActiveNavGabzstore] = useState<GabzstoreNav>('packages');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const gabzdevNavItems: { id: GabzdevNav; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'projects', label: 'Proyek', icon: FolderOpen },
    { id: 'skills', label: 'Skills', icon: Sparkles },
    { id: 'testimonials', label: 'Testimoni', icon: MessageSquare },
    { id: 'trusted', label: 'Dipercaya Oleh', icon: BadgeCheck },
    { id: 'social', label: 'Sosial Media', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const gabzstoreNavItems: { id: GabzstoreNav; label: string; icon: React.ElementType }[] = [
    { id: 'packages', label: 'Paket Harga', icon: Package },
    { id: 'projects', label: 'Galeri', icon: FolderOpen },
    { id: 'testimonials', label: 'Testimoni', icon: MessageSquare },
    { id: 'social', label: 'Sosial Media', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = siteMode === 'gabzdev' ? gabzdevNavItems : gabzstoreNavItems;
  const activeNav = siteMode === 'gabzdev' ? activeNavGabzdev : activeNavGabzstore;
  const setActiveNav = (id: string) => {
    if (siteMode === 'gabzdev') setActiveNavGabzdev(id as GabzdevNav);
    else setActiveNavGabzstore(id as GabzstoreNav);
  };
  const activeLabel = navItems.find((n) => n.id === activeNav)?.label ?? 'Panel';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    refreshSiteData();
    setView('portfolio');
  };

  const SiteSwitcher = () => (
    <div className="flex gap-1.5 p-1.5 rounded-xl mb-6" style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.1)' }}>
      <button onClick={() => setSiteMode('gabzdev')}
        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 focus-ring"
        style={{ background: siteMode === 'gabzdev' ? '#2563EB' : 'transparent', color: siteMode === 'gabzdev' ? '#fff' : '#475569' }}>
        <Code2 size={14} /> GabzDev
      </button>
      <button onClick={() => setSiteMode('gabzstore')}
        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 focus-ring"
        style={{ background: siteMode === 'gabzstore' ? '#2563EB' : 'transparent', color: siteMode === 'gabzstore' ? '#fff' : '#475569' }}>
        <Store size={14} /> GabzStore
      </button>
    </div>
  );

  return (
    <div className="flex min-h-[100dvh]">
      <aside className="hidden lg:flex flex-col shrink-0 w-64 pt-6 pb-6 px-4" style={{
        background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(20px) saturate(130%)',
        WebkitBackdropFilter: 'blur(20px) saturate(130%)', borderRight: '1px solid rgba(255,255,255,0.5)',
        position: 'sticky', top: 0, height: '100dvh',
      }}>
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <img src="/images/logo.png" alt="GabzDev" width={26} height={26} style={{ objectFit: 'contain' }} />
          <span className="text-base font-bold" style={{ color: '#2563EB' }}>Gabz Admin</span>
        </div>

        <SiteSwitcher />

        <div className="mb-2 px-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#CBD5E1' }}>Menu</span>
        </div>

        <nav className="flex flex-col gap-1 flex-grow">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveNav(id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-ring w-full text-left"
              style={{ background: activeNav === id ? 'rgba(37,99,235,0.10)' : 'transparent', color: activeNav === id ? '#2563EB' : '#475569', fontWeight: activeNav === id ? 600 : 500 }}>
              <Icon size={17} strokeWidth={activeNav === id ? 2.2 : 1.8} /> {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-2">
          <button onClick={backToPortfolio}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-blue-50 focus-ring"
            style={{ color: '#2563EB' }}>
            <ExternalLink size={16} strokeWidth={1.8} /> Lihat Live Portfolio
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-red-50 focus-ring"
            style={{ color: '#EF4444' }}>
            <LogOut size={16} strokeWidth={1.8} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex flex-col flex-grow min-w-0">
        <header className="sticky top-0 z-50 px-5 md:px-8 py-4 flex items-center justify-between gap-4" style={{
          background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(18px) saturate(125%)',
          WebkitBackdropFilter: 'blur(18px) saturate(125%)', borderBottom: '1px solid rgba(255,255,255,0.5)',
        }}>
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg focus-ring" onClick={() => setMobileNavOpen(!mobileNavOpen)} aria-label="Toggle sidebar">
              <Menu size={20} style={{ color: '#1E293B' }} />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                Panel Admin — {siteMode === 'gabzdev' ? 'GabzDev' : 'GabzStore'}
              </p>
              <h2 className="text-base font-bold" style={{ color: '#1E293B' }}>{activeLabel}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={backToPortfolio}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full transition-all duration-200 hover:bg-blue-50 focus-ring"
              style={{ color: '#2563EB', border: '1.5px solid rgba(37,99,235,0.2)' }}>
              <ExternalLink size={14} /> Lihat Portfolio
            </button>
            <button onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full transition-all duration-200 hover:bg-red-50 focus-ring"
              style={{ color: '#EF4444', border: '1.5px solid rgba(239,68,68,0.2)' }}>
              <LogOut size={14} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {mobileNavOpen && (
          <div className="lg:hidden px-5 py-3 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.72)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
            <SiteSwitcher />
            <div className="flex gap-2 overflow-x-auto">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => { setActiveNav(id); setMobileNavOpen(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 focus-ring"
                  style={{ background: activeNav === id ? '#2563EB' : 'rgba(255,255,255,0.5)', color: activeNav === id ? 'white' : '#475569', border: '1px solid rgba(255,255,255,0.6)' }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="flex-grow px-5 md:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            {siteMode === 'gabzdev' && (
              <>
                {activeNav === 'profile' && (
                  <div>
                    <div className="flex items-center gap-2.5 mb-6">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(37,99,235,0.08)' }}>
                        <LayoutDashboard size={17} style={{ color: '#2563EB' }} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold" style={{ color: '#1E293B' }}>Manajemen Profil</h3>
                        <p className="text-xs" style={{ color: '#94A3B8' }}>Perbarui informasi publik Anda</p>
                      </div>
                    </div>
                    <ProfilePanel />
                  </div>
                )}
                {activeNav === 'projects' && <ProjectsPanel site="gabzdev" />}
                {activeNav === 'skills' && <SkillsPanel site="gabzdev" />}
                {activeNav === 'testimonials' && <TestimonialsPanel site="gabzdev" />}
                {activeNav === 'trusted' && <TrustedByPanel site="gabzdev" />}
                {activeNav === 'social' && <SocialIconsPanel site="gabzdev" />}
                {activeNav === 'settings' && <GabzdevSettingsPanel />}
              </>
            )}
            {siteMode === 'gabzstore' && (
              <>
                {activeNav === 'packages' && <PackagesPanel />}
                {activeNav === 'projects' && <ProjectsPanel site="gabzstore" />}
                {activeNav === 'testimonials' && <TestimonialsPanel site="gabzstore" />}
                {activeNav === 'social' && <SocialIconsPanel site="gabzstore" />}
                {activeNav === 'settings' && <GabzstoreSettingsPanel />}
              </>
            )}
          </div>
        </main>

        <footer className="px-5 md:px-8 py-4 text-center text-xs" style={{ color: '#CBD5E1', borderTop: '1px solid rgba(255,255,255,0.4)' }}>
          Gabz Admin Panel &copy; 2026 — 1 Dashboard untuk GabzDev &amp; GabzStore
        </footer>
      </div>
    </div>
  );
}
