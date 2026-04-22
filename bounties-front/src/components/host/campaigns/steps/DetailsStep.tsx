"use client";

import { useState, useEffect } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import CustomDateTimePicker from "@/components/ui/CustomDateTimePicker";
import { CreateCampaignRequest } from "@/lib/api/host";
import { CampaignFormData } from "../types";
import { FaPlus, FaXmark } from "react-icons/fa6";

interface DetailsStepProps {
  data: CampaignFormData;
  onChange: (data: CampaignFormData) => void;
}

export default function DetailsStep({ data, onChange }: DetailsStepProps) {
  const [additionalLinks, setAdditionalLinks] = useState<
    Array<{ id: string; title: string; url: string }>
  >([]);

  useEffect(() => {
    const fixedTypes = ["twitter", "telegram", "website", "docs"];
    const additional =
      data.official_links?.filter((link) => !fixedTypes.includes(link.type)) ||
      [];
    const formattedLinks = additional.map((link, index) => ({
      id: `link-${link.type}-${index}-${link.url}`,
      title: link.title || link.type,
      url: link.url || "",
    }));
    if (formattedLinks.length > 0) {
      setAdditionalLinks(formattedLinks);
    }
  }, []);

  const handleChange = (field: keyof CreateCampaignRequest, value: any) => {
    const newData = { ...data, [field]: value };
    // Sync payment_chain with target_blockchain
    if (field === "target_blockchain") {
      newData.payment_chain = value;
      newData.payment_token = "";
    }
    onChange(newData);
  };

  const getFixedLinkDefaultTitle = (type: string) => {
    switch (type) {
      case "twitter":
        return "X (Twitter)";
      case "telegram":
        return "Telegram";
      case "website":
        return "Website";
      case "docs":
        return "Docs";
      default:
        return type;
    }
  };

  const upsertFixedLink = (
    type: string,
    patch: Partial<{ title: string; url: string }>
  ) => {
    const otherLinks =
      data.official_links?.filter((link) => link.type !== type) || [];
    const existing = data.official_links?.find((link) => link.type === type);

    onChange({
      ...data,
      official_links: [
        ...otherLinks,
        {
          type,
          title:
            patch.title ??
            existing?.title ??
            getFixedLinkDefaultTitle(type),
          url: patch.url ?? existing?.url ?? "",
        },
      ],
    });
  };

  const handleAdditionalLinkChange = (
    id: string,
    field: "title" | "url",
    value: string
  ) => {
    const updatedLinks = additionalLinks.map((link) =>
      link.id === id ? { ...link, [field]: value } : link
    );
    setAdditionalLinks(updatedLinks);

    const fixedTypes = ["twitter", "telegram", "website", "docs"];
    const fixedLinks =
      data.official_links?.filter((link) => fixedTypes.includes(link.type)) ||
      [];
    const newAdditionalLinks = updatedLinks
      .filter((link) => link.url.trim() !== "")
      .map((link, index) => ({
        type:
          link.title.toLowerCase().replace(/\s+/g, "_") ||
          `additional_${index}`,
        title: link.title || link.url,
        url: link.url,
      }));
    onChange({
      ...data,
      official_links: [...fixedLinks, ...newAdditionalLinks],
    });
  };

  const handleAddLink = () => {
    const newLink = { id: `link-${Date.now()}`, title: "", url: "" };
    setAdditionalLinks([...additionalLinks, newLink]);
  };

  const handleRemoveLink = (id: string) => {
    const updatedLinks = additionalLinks.filter((link) => link.id !== id);
    setAdditionalLinks(updatedLinks);

    const fixedTypes = ["twitter", "telegram", "website", "docs"];
    const fixedLinks =
      data.official_links?.filter((link) => fixedTypes.includes(link.type)) ||
      [];
    const newAdditionalLinks = updatedLinks
      .filter((link) => link.url.trim() !== "")
      .map((link, index) => ({
        type:
          link.title.toLowerCase().replace(/\s+/g, "_") ||
          `additional_${index}`,
        title: link.title || link.url,
        url: link.url,
      }));
    onChange({
      ...data,
      official_links: [...fixedLinks, ...newAdditionalLinks],
    });
  };

  const handleSupportChange = (type: string, value: string) => {
    const existingContacts =
      data.support_contact?.filter((c) => c.type !== type) || [];
    onChange({
      ...data,
      support_contact: [
        ...existingContacts,
        { type, value, is_primary: type === "discord" },
      ],
    });
  };

  const getLink = (type: string) =>
    data.official_links?.find((link) => link.type === type)?.url || "";
  const getLinkTitle = (type: string) =>
    data.official_links?.find((link) => link.type === type)?.title || "";
  const getSupport = (type: string) =>
    data.support_contact?.find((c) => c.type === type)?.value || "";

  const chainOptions = [
    { value: "base", label: "Base" },
    { value: "sui", label: "Sui" },
    { value: "solana", label: "Solana" },
    { value: "hyperevm", label: "HyperEVM" },
    { value: "stellar", label: "Stellar" },
  ];

  const countryOptions = [
    { value: "global", label: "Global" },
    { value: "latam", label: "Latam" },
    { value: "brazil", label: "Brazil" },
    { value: "united_states", label: "United States" },
  ];

  const timezoneOptions = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "New York (EST)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
    { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  ];

  return (
    <div className="space-y-8">
      {/* Target Blockchain */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Target Blockchain{" "}
          <span className="text-[var(--color-primary)]">*</span>
        </label>
        <CustomSelect
          id="campaign-target-blockchain"
          options={chainOptions}
          value={data.target_blockchain || ""}
          onChange={(value) => handleChange("target_blockchain", value)}
          placeholder="Select"
        />
        <p className="text-gray-400 text-sm mt-2">
          Can't find your chain?{" "}
          <span className="text-[var(--color-primary)] cursor-pointer">
            Contact support
          </span>
        </p>
      </div>

      {/* Official Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-medium">Official Links</h3>
          <button
            type="button"
            onClick={handleAddLink}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-full hover:opacity-90 transition-opacity text-sm font-medium"
          >
            <FaPlus className="w-4 h-4" />
            Add Link
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              X (Twitter) <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input
              id="campaign-official-twitter"
              type="text"
              placeholder="x.com/@username"
              value={getLink("twitter")}
              onChange={(e) =>
                upsertFixedLink("twitter", { url: e.target.value })
              }
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Telegram
            </label>
            <input
              id="campaign-official-telegram"
              type="text"
              placeholder="t.me/@username"
              value={getLink("telegram")}
              onChange={(e) =>
                upsertFixedLink("telegram", { url: e.target.value })
              }
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Website URL <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input
              id="campaign-official-website"
              type="url"
              placeholder="https://yoursite.com"
              value={getLink("website")}
              onChange={(e) =>
                upsertFixedLink("website", { url: e.target.value })
              }
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Docs
            </label>
            <input
              id="campaign-official-docs"
              type="url"
              placeholder="https://docs.yoursite.com"
              value={getLink("docs")}
              onChange={(e) => upsertFixedLink("docs", { url: e.target.value })}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
        </div>

        {/* Links Adicionais */}
        {additionalLinks.length > 0 && (
          <div className="mt-4 space-y-4">
            {additionalLinks.map((link) => (
              <div
                key={link.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
              >
                <div className="md:col-span-5">
                  <label className="block text-white text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: GitHub, Medium, etc."
                    value={link.title}
                    onChange={(e) =>
                      handleAdditionalLinkChange(
                        link.id,
                        "title",
                        e.target.value
                      )
                    }
                    className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
                  />
                </div>
                <div className="md:col-span-6">
                  <label className="block text-white text-sm font-medium mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) =>
                      handleAdditionalLinkChange(link.id, "url", e.target.value)
                    }
                    className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
                  />
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(link.id)}
                    className="cursor-pointer h-[42px] w-[42px] flex items-center justify-center bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors"
                    title="Remover link"
                  >
                    <FaXmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Support Contact */}
      <div>
        <h3 className="text-white text-lg font-medium mb-4">Support Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Discord
            </label>
            <input
              id="campaign-support-discord"
              type="text"
              placeholder="discord.gg/invite"
              value={getSupport("discord")}
              onChange={(e) => handleSupportChange("discord", e.target.value)}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="campaign-support-email"
              type="email"
              placeholder="support@yoursite.com"
              value={getSupport("email")}
              onChange={(e) => handleSupportChange("email", e.target.value)}
              className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
            />
          </div>
        </div>
      </div>

      {/* Original URL Shortener */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-white text-sm font-medium">
            URL Shortener
          </label>
          <div className="relative group">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-400 cursor-help hover:text-gray-300 transition-colors cursor-pointer"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
              <p>Enter the URL you want creators to share here.</p>
              <p className="mt-1">
                We will generate a short link optimized for viewing and click
                measurement.
              </p>
              <div className="absolute left-4 bottom-0 transform translate-y-full">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </div>
        <input
          id="campaign-original-url-shortener"
          type="url"
          placeholder="https://..."
          value={data.original_url_shortener || ""}
          onChange={(e) =>
            handleChange("original_url_shortener", e.target.value)
          }
          className="w-full bg-transparent text-white placeholder:text-white/60 px-4 py-3 rounded-full border border-white outline-none"
        />
      </div>

      {/* Country Selection */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Target Country for Content:{" "}
          <span className="text-[var(--color-primary)]">*</span>
        </label>
        <CustomSelect
          id="campaign-target-country"
          options={countryOptions}
          value={data.country?.[0]?.name || ""}
          onChange={(value) => handleChange("country", [{ name: value }])}
          placeholder="Select"
        />
      </div>

      {/* Campaign Duration */}
      <div>
        <h3 className="text-white text-lg font-medium mb-4">
          Select the campaign duration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Start Date <span className="text-[var(--color-primary)]">*</span>
            </label>
            <div id="campaign-start-date">
              <CustomDateTimePicker
                value={data.start_date || ""}
                onChange={(value) => handleChange("start_date", value)}
                placeholder="Select Date"
              />
            </div>
          </div>
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              End Date <span className="text-[var(--color-primary)]">*</span>
            </label>
            <div id="campaign-end-date">
              <CustomDateTimePicker
                value={data.end_date || ""}
                onChange={(value) => handleChange("end_date", value)}
                placeholder="Select Date"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
