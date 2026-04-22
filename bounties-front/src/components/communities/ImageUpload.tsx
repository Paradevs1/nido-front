"use client";

import { useRef } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

interface ImageUploadProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Only JPG, PNG, and WebP images are accepted.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && <label className="text-white/60 text-xs mb-1 block">{label}</label>}
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="rounded-lg max-w-[150px] sm:max-w-[200px] max-h-[100px] sm:max-h-[120px] object-cover" />
          <button
            type="button"
            onClick={() => { onChange(undefined); if (inputRef.current) inputRef.current.value = ""; }}
            className="absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-700"
            aria-label="Remove image"
          >
            x
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer px-4 py-2.5 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm sm:text-xs hover:bg-white/10 transition-colors"
        >
          Upload Image
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
