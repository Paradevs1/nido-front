"use client";

import CustomSelect from "@/components/ui/CustomSelect";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";
import { CreateCampaignRequest } from "@/lib/api/host";
import { CampaignFormData } from "../types";

interface TaskStepProps {
  data: CampaignFormData;
  onChange: (data: CampaignFormData) => void;
}

export default function TaskStep({ data, onChange }: TaskStepProps) {
  const handleChange = (field: keyof CreateCampaignRequest, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleMultiSelectChange = (
    field: "submission_format" | "content_format",
    value: string[]
  ) => {
    // "feedback" é exclusivo: se selecionado, não pode ter outro; se outro for selecionado, feedback é removido
    const next = value.includes("feedback") ? ["feedback"] : value;
    onChange({ ...data, [field]: next.map((v) => ({ type: v })) });
  };

  const handleCategoryChange = (slug: string) => {
    onChange({ ...data, content_categories: [{ slug }] });
  };

  const contentFormatOptions = [
    { value: "video", label: "Videos" },
    { value: "thread", label: "Thread" },
    { value: "post", label: "Post" },
    { value: "meme", label: "Meme" },
    { value: "article", label: "Article" },
    { value: "feedback", label: "Feedback" },
  ];

  const socialMediaOptions = [
    {
      value: "twitter",
      label: "X (Twitter)",
      icon: (
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      value: "tiktok",
      label: "Tiktok",
      icon: <FaTiktok className="w-5 h-5 text-white" />,
    },
    {
      value: "instagram",
      label: "Instagram",
      icon: <FaInstagram className="w-5 h-5 text-white" />,
    },
    {
      value: "youtube",
      label: "YouTube",
      icon: <FaYoutube className="w-5 h-5 text-white" />,
    },
    {
      value: "feedback",
      label: "Feedback",
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      ),
    },
  ];

  const categories = [
    "DeFi",
    "Game",
    "RWA",
    "NFT",
    "Social",
    "DAO",
    "Staking",
    "GameFi",
    "Trading",
    "Neo Bank",
    "Prediction Market",
    "Wallet",
    "Exchange",
  ];

  const contentFormatOnlyFeedback =
    data.content_format?.length === 1 && data.content_format[0]?.type === "feedback";
  const submissionFormatOnlyFeedback =
    data.submission_format?.length === 1 && data.submission_format[0]?.type === "feedback";

  const contentFormatOptionsWithDisabled = contentFormatOptions.map((opt) => ({
    ...opt,
    disabled: contentFormatOnlyFeedback ? opt.value !== "feedback" : false,
  }));
  const submissionFormatOptionsWithDisabled = socialMediaOptions.map((opt) => ({
    ...opt,
    disabled: submissionFormatOnlyFeedback ? opt.value !== "feedback" : false,
  }));

  return (
    <div className="space-y-6">
      {/* Campaign Title */}
      <div>
        <label className="block text-white text-md font-medium mb-2">
          Campaign Title <span className="text-[var(--color-primary)]">*</span>
        </label>
        <input
          id="campaign-title"
          type="text"
          placeholder="Enter your title about campaign..."
          value={data.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white/50 outline-none"
        />
      </div>

      {/* About Project */}
      <div>
        <label className="block text-white text-md font-medium mb-2">
          About Project <span className="text-[var(--color-primary)]">*</span>
        </label>
        <RichTextEditor
          id="campaign-about-project"
          rows={4}
          placeholder="Provide a brief description of the project as a whole..."
          value={data.about_project || ""}
          onChange={(value) => handleChange("about_project", value)}
          maxLength={1000}
        />
      </div>

      {/* What they need */}
      <div>
        <label className="block text-white text-md font-medium mb-2">
          What we need? <span className="text-[var(--color-primary)]">*</span>
        </label>
        <RichTextEditor
          id="campaign-what-we-need"
          rows={4}
          placeholder="Explain exactly what you need content creators to talk about."
          value={data.what_we_need || ""}
          onChange={(value) => handleChange("what_we_need", value)}
          maxLength={1000}
        />
      </div>

      {/* Content Type */}
      <div>
        <label className="block text-white text-md font-medium mb-2">
          Content Type <span className="text-[var(--color-primary)]">*</span>
        </label>
        <RichTextEditor
          id="campaign-content-type"
          rows={4}
          placeholder="Describe the main functions of your project that creators need to talk about."
          value={data.content_type || ""}
          onChange={(value) => handleChange("content_type", value)}
          maxLength={1000}
        />
      </div>

      {/* Content Pillars */}
      <div>
        <label className="block text-white text-md font-medium mb-2">
          Content Pillars <span className="text-[var(--color-primary)]">*</span>
        </label>
        <RichTextEditor
          id="campaign-content-pillars"
          rows={4}
          placeholder="Describe your product's key differentiators in topics."
          value={data.content_pillars || ""}
          onChange={(value) => handleChange("content_pillars", value)}
          maxLength={1000}
        />
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-white text-md font-medium mb-2">
          Benefits:
        </label>
        <RichTextEditor
          id="campaign-benefits"
          rows={4}
          placeholder="If you have any important benefits to share, put them here."
          value={data.benefits || ""}
          onChange={(value) => handleChange("benefits", value)}
          maxLength={1000}
        />
      </div>

      {/* Requirements */}
      <div>
        <label className="block text-white text-md font-medium mb-2">
          Judging Criteria:
        </label>
        <RichTextEditor
          id="campaign-requirements"
          rows={4}
          placeholder="Here you can create rules to facilitate content creation. Creating a 'do's and don'ts' can make your campaign more effective."
          value={data.requirements || ""}
          onChange={(value) => handleChange("requirements", value)}
          maxLength={1000}
        />
      </div>

      {/* Content Format and Social Media - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Format */}
        <div>
          <label className="block text-white text-md font-medium mb-2">
            Content Format:{" "}
            <span className="text-[var(--color-primary)]">*</span>
          </label>
          <CustomSelect
            id="campaign-content-format"
            options={contentFormatOptionsWithDisabled}
            value={data.content_format?.map((cf) => cf.type) || []}
            onChange={(value) =>
              handleMultiSelectChange("content_format", value as string[])
            }
            placeholder="Select"
            multiple={true}
          />
        </div>

        {/* Social Media */}
        <div>
          <label className="block text-white text-md font-medium mb-2">
            Submission format:{" "}
            <span className="text-[var(--color-primary)]">*</span>
          </label>
          <CustomSelect
            id="campaign-submission-format"
            options={submissionFormatOptionsWithDisabled}
            value={data.submission_format?.map((sf) => sf.type) || []}
            onChange={(value) =>
              handleMultiSelectChange("submission_format", value as string[])
            }
            placeholder="Select"
            multiple={true}
          />
        </div>
      </div>

      {/* Content Categories */}
      <div id="campaign-categories">
        <label className="block text-white text-md font-medium mb-2">
          Content Categories{" "}
          <span className="text-[var(--color-primary)]">*</span>
        </label>
        <p className="text-gray-400 text-sm mb-4">Select a maximum of 1 tag</p>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() =>
                handleCategoryChange(category.toLowerCase().replace(/ /g, "-"))
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                data.content_categories?.[0]?.slug ===
                category.toLowerCase().replace(/ /g, "-")
                  ? "bg-[var(--color-background-card-campaign)] text-white"
                  : "bg-transparent text-white border border-white hover:bg-white hover:text-black"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
