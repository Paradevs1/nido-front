"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlatformName, createCommunity, CreateCommunityRequest } from "@/lib/api/community";
import { getMyPlan } from "@/lib/api/plan";
import { ImageUpload } from "@/components/communities";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useToast } from "@/hooks/useToast";
import { Toast } from "@/components/ui/Toast";

const ALL_PLATFORMS: PlatformName[] = ["TWITTER", "INSTAGRAM", "TIKTOK", "YOUTUBE", "DISCORD", "TELEGRAM"];

export default function CreateCommunityPage() {
  const router = useRouter();

  useEffect(() => {
    getMyPlan().then((r) => {
      const name = String(r?.plan?.name ?? "").toUpperCase();
      const active = Boolean(r?.is_active);
      if (!(name === "ENTERPRISE" && active)) {
        router.replace("/host/communities");
      }
    }).catch(() => router.replace("/host/communities"));
  }, []);
  const [formData, setFormData] = useState<CreateCommunityRequest>({
    name: "",
    description: "",
    rules: "",
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<PlatformName[]>([]);
  const [logo, setLogo] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast, hideToast, toast } = useToast();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.rules.trim()) errs.rules = "Rules are required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { enrollment_start, enrollment_end, ...rest } = formData;
      const payload: CreateCommunityRequest = {
        ...rest,
        ...(logo && { logo }),
        ...(selectedPlatforms.length > 0 && { required_platforms: selectedPlatforms }),
        ...(enrollment_start && { enrollment_start: new Date(enrollment_start).toISOString() }),
        ...(enrollment_end && { enrollment_end: new Date(enrollment_end).toISOString() }),
      };
      const res = await createCommunity(payload);
      showToast("Community created successfully!", "success");
      router.push(`/host/communities/${res.data.id}`);
    } catch (err: any) {
      const data = (err as any).response?.data;
      if (data?.details) {
        showToast(data.details.join(", "), "error");
      } else {
        showToast(err.message || "Failed to create community", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (p: PlatformName) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-6">
      <div className="max-w-[700px] mx-auto">
        <button
          onClick={() => router.back()}
          className="cursor-pointer text-white/50 text-sm hover:text-white transition-colors mb-6 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-white text-2xl font-bold mb-2">Create Community</h1>
        <p className="text-white/50 text-sm mb-8">
          Set up a new community to connect with creators
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Logo */}
          <div>
            <label className="text-white text-sm font-medium mb-1.5 block">
              Logo
            </label>
            <ImageUpload value={logo} onChange={setLogo} />
          </div>

          {/* Name */}
          <div>
            <label className="text-white text-sm font-medium mb-1.5 block">
              Community Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Enter community name"
              className={`w-full bg-white/5 border ${errors.name ? "border-red-500" : "border-white/10"} rounded-lg px-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[var(--color-primary)]`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-white text-sm font-medium mb-1.5 block">
              Description
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData((p) => ({ ...p, description: value }))}
              placeholder="Describe your community"
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Rules */}
          <div>
            <label className="text-white text-sm font-medium mb-1.5 block">
              Rules <span className="text-red-400">*</span>
            </label>
            <RichTextEditor
              value={formData.rules}
              onChange={(value) => setFormData((p) => ({ ...p, rules: value }))}
              placeholder="Community rules"
              rows={5}
              maxLength={2000}
            />
            {errors.rules && <p className="text-red-400 text-xs mt-1">{errors.rules}</p>}
          </div>

          {/* Enrollment Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-white text-sm font-medium mb-1.5 block">
                Enrollment Start
              </label>
              <input
                type="datetime-local"
                value={formData.enrollment_start || ""}
                onChange={(e) => setFormData((p) => ({ ...p, enrollment_start: e.target.value || undefined }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-white text-sm font-medium mb-1.5 block">
                Enrollment End
              </label>
              <input
                type="datetime-local"
                value={formData.enrollment_end || ""}
                onChange={(e) => setFormData((p) => ({ ...p, enrollment_end: e.target.value || undefined }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--color-primary)] [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Required Platforms */}
          <div>
            <label className="text-white text-sm font-medium mb-1.5 block">
              Required Platforms
            </label>
            <p className="text-white/40 text-xs mb-2">
              Creators must have these platforms configured to join
            </p>
            <div className="flex gap-2 flex-wrap">
              {ALL_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`cursor-pointer px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedPlatforms.includes(p)
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-white/5 text-white/50 hover:bg-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer w-full py-3 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Community"}
            </button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} duration={toast.duration} onClose={hideToast} />}
    </div>
  );
}
