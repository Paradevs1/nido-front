"use client";
import { FormEvent } from "react";
import { BRAND } from "@/lib/branding/links";

export default function HostContactForm() {
  const handleSend = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value;

    const subject = encodeURIComponent("Contato via site Nido - Host");
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    const mailtoLink = `mailto:nidocontact@proton.me?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="pb-16">
      <div className="max-w-4xl mx-auto px-6">
        <form onSubmit={handleSend} className="flex flex-col items-center gap-6">
          <div className="w-full flex flex-col md:flex-row gap-6">
            <input
              name="name"
              type="text"
              placeholder="Enter your name..."
              required
              className="flex-1 bg-transparent text-white placeholder:text-white/60 px-6 py-4 rounded-full outline-none border border-white"
            />
            <input
              name="email"
              type="email"
              placeholder="Enter your email address..."
              required
              className="flex-1 bg-transparent text-white placeholder:text-white/60 px-6 py-4 rounded-full outline-none border border-white"
            />
          </div>
          <textarea
            name="message"
            placeholder="message..."
            rows={5}
            required
            className="w-full bg-transparent text-white text-[16px] placeholder:text-white/60 px-6 py-4 rounded-3xl outline-none resize-none border border-white"
          />
          <div className="flex flex-row gap-2 sm:gap-4 w-full max-w-md">
            <button
              type="submit"
              className="group flex-1 h-[44px] sm:h-[50px]
                         bg-[var(--color-primary)] 
                         text-white 
                         text-xs sm:text-sm md:text-base font-semibold rounded-full 
                         hover:opacity-90 transition-opacity
                         flex items-center justify-center gap-1 sm:gap-2 min-h-[44px] sm:min-h-[50px] px-3 sm:px-4"
            >
              <span className="whitespace-nowrap">GET STARTED</span>
              <span className="w-0 opacity-0 group-hover:w-3 sm:group-hover:w-4 md:group-hover:w-5 group-hover:opacity-100 transition-all duration-300">
                <svg 
                  width="14" 
                  height="14" 
                  viewBox="0 0 73 46" 
                  fill="none" 
                  className="text-white sm:w-4 sm:h-4 md:w-5 md:h-5"
                >
                  <rect y="10" width="24" height="2" rx="1" fill="currentColor"/>
                  <rect x="7.5" y="22" width="16.5" height="2" rx="1" fill="currentColor"/>
                  <rect x="11" y="34" width="13" height="2" rx="1" fill="currentColor"/>
                  <path d="M72.3684 9.3453L49.7781 0.07575C49.4719 -0.050056 49.1231 -0.017798 48.8449 0.162386L29.467 12.6932C29.4643 12.6951 29.462 12.6974 29.4593 12.6987C29.4565 12.7006 29.4533 12.702 29.4501 12.7043C29.4235 12.7222 29.3988 12.7425 29.374 12.7628C29.3667 12.7688 29.3589 12.7739 29.352 12.7798C29.3185 12.8089 29.2874 12.8402 29.258 12.8729C29.2498 12.8822 29.2429 12.8923 29.2356 12.9015C29.2154 12.9259 29.1957 12.9508 29.1778 12.9771C29.1687 12.9904 29.1609 13.0052 29.1522 13.019C29.138 13.0425 29.1237 13.066 29.1114 13.0904C29.1036 13.1061 29.0967 13.1227 29.0894 13.1388C29.0788 13.1628 29.0687 13.1868 29.06 13.2116C29.0541 13.2287 29.0486 13.2467 29.0435 13.2642C29.0362 13.2886 29.0298 13.3135 29.0243 13.3388C29.0202 13.3573 29.017 13.3757 29.0137 13.3941C29.0096 13.4195 29.0069 13.4448 29.005 13.4706C29.0037 13.4895 29.0018 13.5084 29.0014 13.5278C29.0014 13.5365 29 13.5448 29 13.5531V35.677C29 36.0917 29.2493 36.465 29.6311 36.6222L52.21 45.9189C52.2128 45.9203 52.216 45.9203 52.2187 45.9217C52.3429 45.9733 52.4745 46 52.606 46C52.7976 46 52.9887 45.9456 53.1555 45.8378L59.4443 41.771L64.1207 43.6963C64.1207 43.6963 64.134 43.7019 64.1354 43.7023C64.151 43.7088 64.1675 43.7111 64.183 43.7166C64.2147 43.7277 64.2454 43.7406 64.2784 43.7484C64.2866 43.7502 64.2944 43.7502 64.3027 43.7521C64.3283 43.7576 64.354 43.7604 64.3797 43.7641C64.414 43.7687 64.4484 43.7728 64.4832 43.7742C64.4933 43.7742 64.5039 43.7774 64.5144 43.7774C64.535 43.7774 64.5557 43.7742 64.5763 43.7728C64.5978 43.7714 64.6194 43.7705 64.6405 43.7682C64.6689 43.7645 64.6968 43.7585 64.7243 43.7525C64.75 43.747 64.7757 43.7429 64.8004 43.735C64.8142 43.7309 64.8275 43.7249 64.8412 43.7203C65.0846 43.6373 65.2968 43.4654 65.4205 43.2226L69.469 35.2885L72.5334 33.307C72.824 33.1189 73 32.7954 73 32.448V10.2923C73 9.8771 72.7502 9.50336 72.368 9.34668L72.3684 9.3453ZM68.4089 18.9006C68.7123 19.3748 68.5757 20.007 68.1036 20.3121L57.5858 27.1134C57.4158 27.2231 57.2255 27.2761 57.0372 27.2761C56.703 27.2761 56.3758 27.1107 56.1819 26.807C55.8785 26.3323 56.0151 25.7005 56.4867 25.3955L67.0045 18.5941C67.4766 18.289 68.105 18.4264 68.4084 18.9006H68.4089ZM62.4615 34.2586C62.2915 34.3682 62.1008 34.4212 61.9129 34.4212C61.5788 34.4212 61.2515 34.2558 61.0577 33.9521C60.7543 33.4779 60.8908 32.8457 61.3625 32.5406L67.0045 28.8918C67.4771 28.5867 68.105 28.724 68.4084 29.1982C68.7118 29.6724 68.5753 30.3047 68.1032 30.6097L62.4611 34.2586H62.4615ZM56.4872 35.6927L58.3379 34.4959C58.81 34.1908 59.4384 34.3282 59.7418 34.8023C60.0452 35.2765 59.9086 35.9088 59.437 36.2139L57.5863 37.4106C57.4162 37.5203 57.226 37.5733 57.0376 37.5733C56.7035 37.5733 56.3763 37.4079 56.1824 37.1042C55.879 36.63 56.0155 35.9977 56.4872 35.6927ZM68.1041 25.4609L61.7273 29.5844C61.5573 29.6941 61.367 29.7471 61.1787 29.7471C60.8445 29.7471 60.5173 29.5816 60.3234 29.2779C60.02 28.8038 60.1566 28.1715 60.6282 27.8664L67.005 23.7429C67.4771 23.4379 68.1055 23.5752 68.4089 24.0494C68.7123 24.5236 68.5757 25.1558 68.1036 25.4609H68.1041ZM49.4994 2.16791L69.8219 10.5066L52.5313 21.6876L32.2088 13.3485L49.4994 2.16791ZM31.0323 34.9908V15.0743L51.5903 23.5388L51.5803 43.4512L31.0323 34.9908ZM63.5015 39.1466V41.2327L61.5302 40.4212L63.5015 39.1466Z" fill="currentColor"/>
                </svg>
              </span>
            </button>
            <a 
              href={BRAND.social.telegramSupport}
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex-1 border border-white text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm md:text-base font-medium hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1 sm:gap-2 min-h-[44px] sm:min-h-[50px]"
            >
              <span className="whitespace-nowrap">CONTACT SALES</span>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
