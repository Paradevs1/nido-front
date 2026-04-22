"use client";

import React, { useEffect, useRef, useState } from "react";
import { BRAND_DISPLAY_NAME } from "@/lib/branding/links";

export default function WaitlistText() {
  const phrases = ["for Creators!"];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
  }, []);

  return (
    <div className="pt-24 pb-2">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
          {BRAND_DISPLAY_NAME} is{" "}
          <span className={`text-[var(--color-primary)] inline-block transition-all duration-500 ease-in-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}>for Creators!</span>
        </h1>

        <p
          className="w-full max-w-4xl mx-auto px-6  flex justify-content text-base text-gray-300 mb-8"
          style={{ fontSize: "18px" }}
        >
          {BRAND_DISPLAY_NAME} lets you join campaigns, complete tasks, and get paid
          instantly—all on-chain and transparent. It&apos;s simple: you create,
          deliver, and earn. Join the waitlist and be part of the first
          wave of creators earning real rewards.
        </p>
      </div>
    </div>
  );
}
