"use client";

import { Campaign } from "@/lib/api/campaign";
import { renderMarkdown } from "@/utils/markdown";

interface CampaignDetailsProps {
  campaignId: string;
  campaign: Campaign;
}

export default function CampaignDetails({
  campaignId,
  campaign,
}: CampaignDetailsProps) {
  const isEmpty = (value: string | null | undefined): boolean => {
    return !value || value.trim() === "";
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Details:</h2>

      <div className="divide-y divide-gray-700 text-gray-300 leading-relaxed">
        {!isEmpty(campaign.about_project) && (
          <div className="py-6 first:pt-0">
            <h3 className="font-semibold text-xl text-white mb-2">
              About the project
            </h3>
            <div className="whitespace-pre-wrap">
              {renderMarkdown(campaign.about_project)}
            </div>
          </div>
        )}

        {!isEmpty(campaign.what_we_need) && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">
              What do we need?
            </h3>
            <div className="whitespace-pre-wrap">
              {renderMarkdown(campaign.what_we_need)}
            </div>
          </div>
        )}

        {!isEmpty(campaign.content_pillars) && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">
              Content pillars:
            </h3>
            <div className="whitespace-pre-wrap">
              {renderMarkdown(campaign.content_pillars)}
            </div>
          </div>
        )}

        {!isEmpty(campaign.benefits) && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">Benefits:</h3>
            <div className="whitespace-pre-wrap">
              {renderMarkdown(campaign.benefits)}
            </div>
          </div>
        )}

        {!isEmpty(campaign.requirements) && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">Judging Criteria:</h3>
            <div className="whitespace-pre-wrap">
              {renderMarkdown(campaign.requirements)}
            </div>
          </div>
        )}

        {!isEmpty(campaign.content_type) && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">
              Content Type
            </h3>
            <div className="whitespace-pre-wrap">
              {renderMarkdown(campaign.content_type)}
            </div>
          </div>
        )}

        {campaign.content_format && campaign.content_format.length > 0 && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">
              Content Format
            </h3>
            <div className="flex flex-wrap gap-2">
              {campaign.content_format.map((format, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                >
                  {format.type}
                </span>
              ))}
            </div>
          </div>
        )}

        {campaign.content_categories &&
          campaign.content_categories.length > 0 && (
            <div className="py-6">
              <h3 className="font-semibold text-xl text-white mb-2">
                Content Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {campaign.content_categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                  >
                    {category.slug}
                  </span>
                ))}
              </div>
            </div>
          )}

        {campaign.official_links && campaign.official_links.length > 0 && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">
              Official Links
            </h3>
            <div className="flex flex-col space-y-2">
              {campaign.official_links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-white font-medium">
                    {link.title}:
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline text-sm break-all"
                  >
                    {link.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {campaign.support_contact && campaign.support_contact.length > 0 && (
          <div className="py-6">
            <h3 className="font-semibold text-xl text-white mb-2">
              Support Contact
            </h3>
            <div className="flex flex-col space-y-2">
              {campaign.support_contact.map((contact, index) => {
                const getContactLabel = (type: string) => {
                  switch (type.toLowerCase()) {
                    case "discord":
                      return "Discord";
                    case "email":
                      return "Email";
                    default:
                      return "Discord";
                  }
                };

                const getContactLink = (type: string, value: string) => {
                  if (type.toLowerCase() === "email") {
                    return `mailto:${value}`;
                  }
                  if (
                    type.toLowerCase() === "discord" &&
                    !value.startsWith("http")
                  ) {
                    return `https://${value}`;
                  }
                  if (value.startsWith("http")) {
                    return value;
                  }
                  return value;
                };

                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      {getContactLabel(contact.type)}:
                    </span>
                    {contact.type.toLowerCase() === "email" ? (
                      <a
                        href={getContactLink(contact.type, contact.value)}
                        className="text-blue-400 hover:underline"
                      >
                        {contact.value}
                      </a>
                    ) : (
                      <a
                        href={getContactLink(contact.type, contact.value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {contact.value}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
