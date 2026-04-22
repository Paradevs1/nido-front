"use client";

import { useState } from "react";

interface AccordionItem {
  title: string;
  content?: string;
  isOpen?: boolean;
}

interface CampaignAccordionProps {
  items: AccordionItem[];
}

export default function CampaignAccordion({ items }: CampaignAccordionProps) {
  // Initialize with all items open
  const safeItems = items || [];
  const [openItems, setOpenItems] = useState<Set<number>>(
    () => new Set(safeItems.map((_, index) => index))
  );

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  if (safeItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {safeItems.map((item, index) => (
        <div key={index} className="rounded-2xl overflow-hidden hover:bg-[#1C3545] transition-colors">
          <button
            className="cursor-pointer w-full flex justify-between items-center py-3 px-6 text-left font-normal text-white bg-transparent"
            onClick={() => toggleItem(index)}
          >
            <span className="text-lg   text-white">{item.title}</span>
            <svg
              className={`w-4 h-4 transition-transform ${
                openItems.has(index) ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {openItems.has(index) && (
            <div className="px-6 py-3 text-white text-md bg-[var(--color-background-card-campaign)]">
              {item.content && <p className="mb-2">{item.content}</p>}
              {/* Fixed disclaimer for Pagamentos */}
              {item.title === "Pagamentos" && (
                <p className="text-gray-400 text-md mt-2">
                  We are not responsible for wallets registered incorrectly in
                  your profile.
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
