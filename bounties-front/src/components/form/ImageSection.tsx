"use client";

import { BRAND_LOGO_ALT } from "@/lib/branding/links";

export default function ImageSection() {
  return (
    <div className=" sm:w-[70%] w-[40%] flex justify-center text-center mx-auto pt-2  px-8 pb-8">
      <img
              src="/assets/home/waitlist/bounties.png"
              alt={BRAND_LOGO_ALT}
              className="w-full mx-auto rounded-lg "
            /> 
    </div>
  );
}
