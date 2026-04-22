"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { HOST_PENDING_ACTIVATION_PATH } from "@/lib/auth/hostAccountStatus";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const categories = [
  "DeFi", "NFT", "Social", "RWA","Layer 1", "Layer 2",
  "Game", "Play to earn", "Staking", "DAO", "Trading", "Neo Bank", "Prediction Market"
];

export default function CreateCompanyForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string>("");

  const toggleCategory = (c: string) => {
    setSelected((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG or JPG image');
      return;
    }

    // Validar tamanho (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image size must be less than 10MB');
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setLogoBase64(base64String);
      setLogoPreview(base64String);
      setError(""); // Limpar erro se houver
    };
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user?.id) {
      setError("User ID not found. Please login again.");
      return;
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const username = formData.get('username') as string;
    const position_company = formData.get('position_company') as string;
    const twitter_username = formData.get('twitter_username') as string;
    const telegram_username = formData.get('telegram_username') as string;
    const name_company = formData.get('name_company') as string;
    const website_company = formData.get('website_company') as string;
    const introduction_company = formData.get('introduction_company') as string;

    // Validações básicas
    if (!username || !position_company || !name_company || !introduction_company) {
      setError("Please fill in all required fields");
      return;
    }

    if (selected.length === 0) {
      setError("Please select at least one category");
      return;
    }

    try {
      setIsLoading(true);

      // Importar dinamicamente para evitar problemas de SSR
      const { registerHostPartTwo } = await import('@/lib/api/host');

      const data = {
        username,
        position_company,
        twitter_username,
        telegram_username,
        name_company,
        website_company,
        introduction_company,
        logo_company: logoBase64 || undefined,
        categories_atuation: selected.map(slug => ({ slug })),
      };

      const response = await registerHostPartTwo(user.id, data);

      const ru = response.user as { status?: string; username?: string };
      const nextAccountStatus =
        ru.status !== undefined
          ? String(ru.status).toLowerCase() === "inactive"
            ? ("inactive" as const)
            : ("active" as const)
          : user.accountStatus;

      const updatedUser = {
        ...user,
        username: ru.username ?? user.username,
        registerCompleted: true as const,
        ...(nextAccountStatus && { accountStatus: nextAccountStatus }),
      };

      await login(updatedUser, response.token);

      if (nextAccountStatus === "inactive") {
        window.location.href = HOST_PENDING_ACTIVATION_PATH;
        return;
      }
      router.push("/host/campaign");
    } catch (error: unknown) {
      console.error('Error completing registration:', error);
      setError(error.message || 'Error completing registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivationSuccess = () => {
    // Após pagamento confirmado, redirecionar para /host/campaign
    router.push('/host/campaign');
  };

  return (
    <div className="pb-20">
      <form
        onSubmit={onSubmit}
        className="max-w-4xl mx-auto px-6 flex flex-col gap-8"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* About You */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-md mb-2">Full name or Handle <span className="text-[var(--color-primary)]">*</span></label>
            <input
              type="text"
              name="username"
              placeholder="Enter your name..."
              required
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-md mb-2">Company position <span className="text-[var(--color-primary)]">*</span></label>
            <input
              type="text"
              name="position_company"
              placeholder="Enter your role..."
              required
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-md mb-2">X (Twitter) <span className="text-[var(--color-primary)]">*</span> </label>
            <input
              type="text"
              name="twitter_username"
              placeholder="x.com/username"
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-md mb-2">Telegram</label>
            <input
              type="text"
              name="telegram_username"
              placeholder="t.me/username"
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
        </div>

        {/* About Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-md mb-2">Company name <span className="text-[var(--color-primary)]">*</span></label>
            <input
              type="text"
              name="name_company"
              placeholder="Company name"
              required
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-md mb-2">Website URL <span className="text-[var(--color-primary)]">*</span></label>
            <input
              type="url"
              name="website_company"
              placeholder="https://www.yoursite.com"
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
        </div>

        {/* Introduction */}
        <div>
          <label className="block text-white text-md mb-2">Introduction about your company <span className="text-[var(--color-primary)]">*</span></label>
          <textarea
            name="introduction_company"
            rows={5}
            placeholder="Enter introduction..."
            required
            className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-3xl border border-white outline-none resize-none"
          />
        </div>

        {/* Logo */}
        <div>
          <label className="block text-white text-md mb-2">Logo</label>
          <input
            type="file"
            id="logo-upload"
            accept="image/png,image/jpg,image/jpeg"
            onChange={handleLogoChange}
            className="hidden"
          />
          <label
            htmlFor="logo-upload"
            className="w-full h-32 rounded-2xl border border-dashed border-white/70 flex flex-col items-center justify-center text-white/70 text-sm cursor-pointer hover:border-white transition-colors"
          >
            {logoPreview ? (
              <div className="relative w-full h-full p-2">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Click to upload</span>
                <span className="text-xs mt-1">PNG, JPG - Max 10MB</span>
              </>
            )}
          </label>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-white text-md mb-3">Categories <span className="text-[var(--color-primary)]">*</span></label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const isSel = selected.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  className={`${
                    isSel ? "bg-[var(--color-background-card-campaign)] text-white" : "bg-transparent text-white"
                  } border border-white rounded-full px-3 py-1 text-sm`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 text-[14px] font-bold disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'CREATING...' : 'CREATE YOUR ACCOUNT'}
          </Button>
        </div>
      </form>
    </div>
  );
}
