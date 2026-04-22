"use client";

import { useState, useEffect } from "react";
import { HostProfile, UpdateHostProfileRequest } from "@/lib/api/host";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: HostProfile | null;
  onUpdate: (updatedHost: UpdateHostProfileRequest) => Promise<void>;
}

const categories = [
  "DeFi", "NFT", "Social", "RWA","Layer 1", "Layer 2",
  "Game", "Play to earn", "Staking", "DAO", "Trading", "Neo Bank", "Prediction Market"
];

export default function EditProfileModal({ isOpen, onClose, host, onUpdate }: EditProfileModalProps) {
  const [formData, setFormData] = useState<UpdateHostProfileRequest>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (host) {
      setFormData({
        username: host.username || '',
        name_company: host.name_company || '',
        position_company: host.position_company || '',
        telegram_username: host.telegram_username || '',
        website_company: host.website_company || '',
        introduction_company: host.introduction_company || '',
        logo_company: host.logo_company || '',
        twitter_username: host.twitter_username || '',
        social_media: host.social_media || [],
      });
      setSelectedCategories(host.categories_atuation?.map(c => c.slug) || []);
      setLogoPreview(host.logo_company || null);
    }
  }, [host]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, logo_company: base64String }));
      setLogoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };
  
  const toggleCategory = (slug: string) => {
    const updatedCategories = selectedCategories.includes(slug)
      ? selectedCategories.filter(s => s !== slug)
      : [...selectedCategories, slug];
    setSelectedCategories(updatedCategories);
    setFormData(prev => ({
        ...prev,
        categories_atuation: updatedCategories.map(s => ({ slug: s }))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await onUpdate(formData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1500);
    } catch (err: unknown) {
      setError(err.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f2637] rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
          <button
            aria-label="Close"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-2xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-2xl">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username, Email, Company... */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Username</label>
              <input type="text" name="username" value={formData.username || ''} onChange={handleInputChange} className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="Enter your username" />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
              <input type="email" name="email" value={host?.email || ''} disabled className="w-full bg-white/5 text-white/50 placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Company</label>
              <input type="text" name="name_company" value={formData.name_company || ''} onChange={handleInputChange} className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="Enter your company name" />
            </div>
            <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Position in Company</label>
                <input type="text" name="position_company" value={formData.position_company || ''} onChange={handleInputChange} className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="Ex: CEO, Marketing Manager" />
            </div>
          </div>
          
          {/* Introduction */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Introduction about your company</label>
            <textarea name="introduction_company" rows={4} value={formData.introduction_company || ''} onChange={handleInputChange} className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all resize-none" placeholder="Tell us a bit about your company..."></textarea>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Logo</label>
            <input type="file" id="logo-upload" accept="image/png,image/jpg,image/jpeg" onChange={handleLogoChange} className="hidden" />
            <label htmlFor="logo-upload" className="w-full h-32 rounded-2xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center text-white/70 cursor-pointer hover:border-[var(--color-primary)] transition-colors">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain rounded-xl p-2" />
              ) : (
                <>
                  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span>Click to upload</span>
                  <span className="text-xs mt-1">PNG, JPG</span>
                </>
              )}
            </label>
          </div>

          {/* Social Links */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-white font-medium text-lg">Links e Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Twitter/X</label>
                    <input type="text" name="twitter_username" value={formData.twitter_username || ''} onChange={handleInputChange} className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="@username" />
                </div>
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Telegram</label>
                    <input type="text" name="telegram_username" value={formData.telegram_username || ''} onChange={handleInputChange} className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="@username" />
                </div>
                <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Website</label>
                    <input type="url" name="website_company" value={formData.website_company || ''} onChange={handleInputChange} className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-xl border border-white/30 outline-none focus:border-[var(--color-primary)] transition-all" placeholder="https://seusite.com" />
                </div>
            </div>
          </div>

          {/* Categories */}
          <div className="pt-4 border-t border-white/10">
            <label className="block text-white/80 text-md mb-3 font-medium">Categories of Operation</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat.toLowerCase())}
                  className={`border rounded-full px-4 py-2 text-sm transition-colors ${selectedCategories.includes(cat.toLowerCase()) ? "bg-orange-600 border-orange-600 text-white" : "bg-transparent border-white/30 text-white/80 hover:border-orange-600"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-6 py-3 text-white border border-white/50 rounded-full hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer flex-1 px-6 py-3 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
