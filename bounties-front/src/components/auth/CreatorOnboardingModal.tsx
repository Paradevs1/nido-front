"use client";

import React, { useState } from "react";
import { UpdateProfileAfterLoginData, creatorApi } from "@/lib/api/creator";
import { useAuth } from "@/lib/contexts/AuthContext";
import BaseButton from "@/components/ui/Button";
import CustomSelect from "@/components/ui/CustomSelect";
import LanguageMultiSelect from "@/components/ui/LanguageMultiSelect";
import { ALL_LANGUAGES } from "@/data/allLanguages";
import { BRAND_DISPLAY_NAME } from "@/lib/branding/links";
import {
  CREATOR_AVERAGE_VIEWS_OPTIONS as AVERAGE_VIEWS,
  CREATOR_AUDIENCE_REGIONS as REGIONS,
  CREATOR_CATEGORY_OPTIONS as CATEGORIES,
  CREATOR_CONTENT_FORMAT_OPTIONS as CONTENT_FORMATS,
  CREATOR_CRYPTO_EXPERIENCE_OPTIONS as CRYPTO_EXP,
  CREATOR_MAIN_CHAINS as CHAINS,
  CREATOR_TRADING_EXPERIENCE_OPTIONS as TRADING_EXP,
} from "@/data/creatorFilterOptions";

interface CreatorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (updatedUser?: any) => void;
  /** When "edit", pre-fills from initialData and calls updateProfile instead of updateProfileAfterLogin */
  mode?: "onboarding" | "edit";
  /** Profile data to pre-fill when mode is "edit" */
  initialData?: Record<string, any>;
}

const AUDIENCE_SIZES = [
  { value: "1k", label: "< 1k followers" },
  { value: "1k – 5k", label: "1K - 5K followers" },
  { value: "5k – 20k", label: "5K - 20K followers" },
  { value: "20k – 100k", label: "20K - 100K followers" },
  { value: "100k+", label: "100K+ followers" },
];

const SPECIALIZATIONS = [
  "Educational Content", "Protocol Reviews", "NFTs", "Web3 News", "Technical Analysis (TA)",
  "Fundamental Analysis (FA)", "On-Chain Analysis", "Market Analysis", "Trading Signals",
  "DeFi", "Token Research", "Airdrop Guides", "Developer/Tech", "Interviews/Podcasts",
  "Memes/Comedy", "Meme coins"
];

const INVESTMENT_STYLE = [
  { value: "Airdrops", label: "Airdrops" },
  { value: "IDO/ICO", label: "IDO/ICO" },
  { value: "Spot Trading", label: "Spot Trading" },
  { value: "Futures/Leverage", label: "Futures/Leverage" },
  { value: "DeFi Farmer", label: "DeFi Farmer" },
  { value: "NFTs", label: "NFTs" }
];

const getInitialFormData = (initialData?: Record<string, any>) => {
  const d = initialData || {};
  const audienceRegion = d.audience_region;
  const regionArray = Array.isArray(audienceRegion) ? audienceRegion : typeof audienceRegion === "string" ? (audienceRegion ? [audienceRegion] : ["Global"]) : ["Global"];
  const fluentLang = d.fluent_language;
  // "Fluent Languages" não deve vir preselecionado no onboarding.
  // Se não existir fluent_language no initialData, mantemos vazio.
  const fluentLanguages =
    typeof fluentLang === "string" && fluentLang.trim()
      ? fluentLang
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];
  return {
    username_twitter: d.username_twitter ?? d.twitter_username ?? "",
    username_youtube: d.username_youtube ?? "",
    username_tiktok: d.username_tiktok ?? "",
    username_instagram: d.username_instagram ?? "",
    username_telegram: d.username_telegram ?? "",
    username_discord: d.username_discord ?? "",
    primary_language: d.primary_language ?? "en",
    // Para o onboarding, deixa vazio para a pessoa procurar manualmente.
    // Em modo edit, se houver valor no banco, o initialData vai preencher.
    fluent_language: d.fluent_language ?? "",
    fluent_language_others: d.fluent_language_others ?? "",
    fluent_languages: fluentLanguages,
    audience_region: regionArray,
    average_views_per_post: d.average_views_per_post ?? "< 1k",
    content_category_list: Array.isArray(d.content_category_list) ? d.content_category_list : [],
    content_formats: Array.isArray(d.content_formats) ? d.content_formats : [],
    example_content_links: d.example_content_links ?? "",
    audience_size: d.audience_size ?? "1k",
    crypto_experience: d.crypto_experience ?? "1-3 years",
    main_chains: Array.isArray(d.main_chains) ? d.main_chains : [],
    main_chains_other: d.main_chains_other ?? "",
    trading_experience: d.trading_experience ?? "Intermediate",
    crypto_content_specialization: Array.isArray(d.crypto_content_specialization) ? d.crypto_content_specialization : [],
    favorite_protocols_projects: d.favorite_protocols_projects ?? "",
    investment_participation_style: d.investment_participation_style ?? "Spot Trading",
    wallet_evm: d.wallet_evm ?? "",
    wallet_sol: d.wallet_sol ?? "",
    wallet_sui: d.wallet_sui ?? "",
    wallet_stellar: d.wallet_stellar ?? "",
  };
};

export default function CreatorOnboardingModal({ isOpen, onClose, onComplete, mode = "onboarding", initialData }: CreatorOnboardingModalProps) {
  const { user, setUserData } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const totalSteps = 5;
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState<UpdateProfileAfterLoginData & { fluent_languages: string[] }>(() => getInitialFormData(initialData));

  React.useEffect(() => {
    if (isOpen && isEditMode) {
      setFormData(getInitialFormData(initialData));
      setStep(1);
    }
  }, [isOpen, isEditMode]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { fluent_languages, ...rest } = formData;
      const dataToSubmit: UpdateProfileAfterLoginData = {
        ...rest,
        fluent_language: fluent_languages?.length ? fluent_languages.join(",") : "",
        content_formats: formData.content_formats ?? [],
        example_content_links: formData.example_content_links ?? "",
        audience_region: formData.audience_region ?? [],
        content_category_list: formData.content_category_list ?? [],
        main_chains: formData.main_chains ?? [],
        crypto_content_specialization: formData.crypto_content_specialization ?? [],
      };

      if (isEditMode) {
        const response = await creatorApi.updateProfile(dataToSubmit);
        // O backend retorna { message, user }. No modo "edit" precisamos usar response.user.
        const updatedUser = (response as any)?.user ?? response;
        // Garanta que o estado global reflita que o onboarding está concluído.
        // (Isso evita o monitor reabrir o modal por causa de "first_login" vindo como string.)
        if (user) {
          setUserData({
            ...user,
            ...updatedUser,
            id:
              (updatedUser as any)._id ??
              (updatedUser as any).id ??
              user.id,
            role:
              ((updatedUser as any).user_type ??
                (updatedUser as any).role ??
                user.role)?.toLowerCase?.() ?? user.role,
            first_login: false,
          });
        }
        onComplete(updatedUser);
      } else {
        const response = await creatorApi.updateProfileAfterLogin(dataToSubmit);
        const updatedUser = response?.user;
        if (user && updatedUser) {
          setUserData({
            ...user,
            ...updatedUser,
            id: (updatedUser as any)._id ?? (updatedUser as any).id ?? user.id,
            role: ((updatedUser as any).user_type ?? (updatedUser as any).role ?? user.role)?.toLowerCase?.() ?? user.role,
            // Forçamos boolean aqui para impedir "false" (string) reabrir o monitor.
            first_login: false,
          });
        }
        onComplete();
      }
      onClose();
    } catch (error: unknown) {
      console.error("Failed to complete onboarding:", error);
      setSubmitError(error instanceof Error ? error.message : "Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArrayField = (field: keyof UpdateProfileAfterLoginData, item: string) => {
    setFormData((prev: any) => {
      const list: string[] = prev[field] || [];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter(c => c !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay Blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl bg-[var(--color-card)] rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {isEditMode && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {/* Header & Progress */}
        <div className="p-8 pb-4 text-center rounded-t-2xl">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isEditMode ? "Edit profile" : `Welcome to ${BRAND_DISPLAY_NAME}!`}
          </h2>
          <p className="text-gray-400 text-sm">
            {isEditMode
              ? "Update your profile information below."
              : "Let's get your profile set up so you can start connecting with the perfect opportunities."}
          </p>

          <div className="mt-8 flex items-center justify-between text-xs text-gray-500 font-medium mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[var(--color-primary)] h-full transition-all duration-300 ease-in-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 pb-8 pt-4 flex-1 relative z-30 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          
          {/* STEP 1: Social Presence */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white">Your Social Presence</h3>
                <p className="text-gray-400 text-sm mt-1">Help us understand your reach across different platforms</p>
              </div>

              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">Total Audience Size</label>
                <CustomSelect
                  value={formData.audience_size || ""}
                  onChange={(val) => setFormData({ ...formData, audience_size: val as any })}
                  options={AUDIENCE_SIZES}
                  placeholder="Select Size"
                />
              </div>

              <div className="space-y-4">
                {[
                  { label: "Twitter/X Handle", key: "username_twitter", placeholder: "@yourusername" },
                  { label: "YouTube Handle", key: "username_youtube", placeholder: "@yourchannel" },
                  { label: "TikTok Handle", key: "username_tiktok", placeholder: "@yourusername" },
                  { label: "Instagram Handle", key: "username_instagram", placeholder: "@yourusername" },
                  { label: "Telegram Handle", key: "username_telegram", placeholder: "@yourusername" },
                  { label: "Discord Handle", key: "username_discord", placeholder: "username#1234" },
                ].map((input) => (
                  <div key={input.key}>
                    <label className="block text-white text-sm font-medium mb-2">{input.label}</label>
                    <input
                      type="text"
                      value={(formData as any)[input.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [input.key]: e.target.value })}
                      placeholder={input.placeholder}
                      className="w-full bg-transparent text-white placeholder:text-white/40 px-5 py-3.5 rounded-full border border-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Rates & Audience & Languages */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white">Rates & Audience</h3>
                <p className="text-gray-400 text-sm mt-1">Help brands understand your audience demographics and languages</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Native Language</label>
                  <LanguageMultiSelect
                    options={ALL_LANGUAGES}
                    value={formData.primary_language ? [formData.primary_language] : []}
                    onChange={(val) => setFormData({ ...formData, primary_language: val[0] ?? "" })}
                    placeholder="Search and select language..."
                    maxDropdownHeight={280}
                    multiple={false}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-white text-sm font-medium mb-2">Fluent Languages</label>
                  <LanguageMultiSelect
                    options={ALL_LANGUAGES}
                    value={formData.fluent_languages ?? []}
                    onChange={(val) => setFormData({ ...formData, fluent_languages: val })}
                    placeholder="Search and select languages..."
                    maxDropdownHeight={280}
                  />
                </div>

                <div className="sm:col-span-2 mt-4">
                  <label className="block text-white text-sm font-medium mb-3">Average Views (per post)</label>
                  <CustomSelect
                    value={formData.average_views_per_post || ""}
                    onChange={(val) => setFormData({ ...formData, average_views_per_post: val as any })}
                    options={AVERAGE_VIEWS}
                    placeholder="Select your typical views / rate range"
                  />
                </div>

                <div className="sm:col-span-2 mt-6 p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                  <label className="block text-white text-sm font-medium mb-4">Target Regions</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                    {REGIONS.map(region => {
                      const isSelected = formData.audience_region?.includes(region);
                      return (
                        <div
                          key={region}
                          onClick={() => toggleArrayField('audience_region', region)}
                          className="cursor-pointer flex items-center gap-3 transition-opacity hover:opacity-80"
                        >
                          <div className={`flex-shrink-0 w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' 
                              : 'border-white/30 bg-transparent'
                          }`}>
                            {isSelected && <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm font-medium text-gray-200">
                            {region}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Content Categories */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white">Content</h3>
                <p className="text-gray-400 text-sm mt-1">Tell us about your content style</p>
              </div>

              <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                <label className="block text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">Content Categories</label>
                <div className="grid grid-cols-1 min-[401px]:grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 sm:gap-y-4">
                  {CATEGORIES.map(category => {
                    const isSelected = formData.content_category_list?.includes(category.value as any);
                    return (
                      <div
                        key={category.value}
                        onClick={() => toggleArrayField('content_category_list', category.value)}
                        className="cursor-pointer flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80 min-w-0"
                      >
                        <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' 
                            : 'border-white/30 bg-transparent'
                        }`}>
                          {isSelected && <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-200 break-words min-w-0">
                          {category.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                <label className="block text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">Content Formats</label>
                <div className="grid grid-cols-1 min-[401px]:grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 sm:gap-y-4">
                  {CONTENT_FORMATS.map(format => {
                    const isSelected = formData.content_formats?.includes(format.value);
                    return (
                      <div
                        key={format.value}
                        onClick={() => toggleArrayField('content_formats', format.value)}
                        className="cursor-pointer flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80 min-w-0"
                      >
                        <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                          isSelected 
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' 
                            : 'border-white/30 bg-transparent'
                        }`}>
                          {isSelected && <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-200 break-words min-w-0">
                          {format.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mb-0">
                <label className="block text-white text-sm font-medium mb-2">Example content links</label>
                <textarea
                  value={formData.example_content_links ?? ""}
                  onChange={(e) => setFormData({ ...formData, example_content_links: e.target.value })}
                  placeholder="Paste links to your best content (e.g. tweets, videos, articles)..."
                  className="w-full bg-transparent text-white placeholder:text-white/40 px-5 py-3.5 rounded-2xl border border-white focus:outline-none focus:border-[var(--color-primary)] transition-all min-h-[100px] resize-y"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Crypto Experience */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white">Crypto Profile</h3>
                <p className="text-gray-400 text-sm mt-1">Tell us about your experience in the Web3 space</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Crypto Experience</label>
                    <CustomSelect
                      value={formData.crypto_experience || ""}
                      onChange={(val) => setFormData({ ...formData, crypto_experience: val as any })}
                      options={CRYPTO_EXP}
                      placeholder="Select Experience"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Trading Experience</label>
                    <CustomSelect
                      value={formData.trading_experience || ""}
                      onChange={(val) => setFormData({ ...formData, trading_experience: val as any })}
                      options={TRADING_EXP}
                      placeholder="Select Trading Level"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Favorite Protocols / Projects</label>
                    <input
                      type="text"
                      value={formData.favorite_protocols_projects || ""}
                      onChange={(e) => setFormData({ ...formData, favorite_protocols_projects: e.target.value })}
                      placeholder="e.g. Uniswap, Aave, Solana"
                      className="w-full bg-transparent text-white placeholder:text-white/40 px-5 py-3.5 rounded-full border border-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Investment Style</label>
                    <CustomSelect
                      value={formData.investment_participation_style || ""}
                      onChange={(val) => setFormData({ ...formData, investment_participation_style: val as any })}
                      options={INVESTMENT_STYLE}
                      placeholder="Select Style"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">Main Chains</label>
                  <div className="grid grid-cols-1 min-[401px]:grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 sm:gap-y-4 mb-4">
                    {CHAINS.map(chain => {
                      const isSelected = formData.main_chains?.includes(chain);
                      return (
                        <div
                          key={chain}
                          onClick={() => toggleArrayField('main_chains', chain)}
                          className="cursor-pointer flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80 min-w-0"
                        >
                          <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' 
                              : 'border-white/30 bg-transparent'
                          }`}>
                            {isSelected && <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-200 break-words min-w-0">
                            {chain}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {formData.main_chains?.includes('Other') && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <input
                        type="text"
                        value={formData.main_chains_other || ""}
                        onChange={(e) => setFormData({ ...formData, main_chains_other: e.target.value })}
                        placeholder="Please specify other chains"
                        className="w-full sm:w-1/2 bg-transparent text-white placeholder:text-white/40 px-5 py-3.5 rounded-full border border-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-6 bg-white/[0.02] border border-white/10 rounded-2xl">
                  <label className="block text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">Crypto Content Specialization</label>
                  <div className="grid grid-cols-1 min-[401px]:grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2 sm:gap-y-4">
                    {SPECIALIZATIONS.map(spec => {
                      const isSelected = formData.crypto_content_specialization?.includes(spec);
                      return (
                        <div
                          key={spec}
                          onClick={() => toggleArrayField('crypto_content_specialization', spec)}
                          className="cursor-pointer flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80 min-w-0"
                        >
                          <div className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-[4px] border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' 
                              : 'border-white/30 bg-transparent'
                          }`}>
                            {isSelected && <svg className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-200 break-words min-w-0">
                            {spec}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* STEP 5: Wallets */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white">Wallets (Optional)</h3>
                <p className="text-gray-400 text-sm mt-1">Share your wallet addresses to receive rewards directly</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "EVM Wallet Address", key: "wallet_evm", placeholder: "0x..." },
                  { label: "Solana Wallet Address", key: "wallet_sol", placeholder: "Solana address..." },
                  { label: "Sui Wallet Address", key: "wallet_sui", placeholder: "0x..." },
                  { label: "Stellar Wallet Address", key: "wallet_stellar", placeholder: "G..." },
                ].map((input) => (
                  <div key={input.key}>
                    <label className="block text-white text-sm font-medium mb-2">{input.label}</label>
                    <input
                      type="text"
                      value={(formData as any)[input.key] || ""}
                      onChange={(e) => setFormData({ ...formData, [input.key]: e.target.value })}
                      placeholder={input.placeholder}
                      className="w-full bg-transparent text-white placeholder:text-white/40 px-5 py-3.5 rounded-full border border-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {submitError && (
          <div className="px-8 pt-2 pb-0">
            <p className="text-red-400 text-sm text-center" role="alert">{submitError}</p>
          </div>
        )}
        {/* Footer Buttons */}
        <div className="px-8 py-6 border-t border-gray-800 flex items-center justify-between bg-[var(--color-card)] relative z-20 rounded-b-2xl">
          <button
            onClick={handleBack}
            className={`px-8 py-3 rounded-full font-bold transition-all text-gray-400 hover:text-white hover:bg-white/5 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
          >
            Back
          </button>

          <BaseButton
            variant="default"
            onClick={handleNext}
            disabled={
              isSubmitting || 
              (step === 3 && (formData.content_category_list?.length === 0)) ||
              (step === 4 && (formData.main_chains?.length === 0 || formData.crypto_content_specialization?.length === 0))
            }
            className="px-8 py-3  text-sm sm:text-base font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : step === totalSteps ? (
              "Confirm"
            ) : (
              "Next"
            )}
          </BaseButton>
        </div>
      </div>
    </div>
  );
}
