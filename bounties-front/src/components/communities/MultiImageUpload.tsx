"use client";

import { useRef } from "react";
import AnnouncementImageThumb from "./AnnouncementImageThumb";

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_IMAGES = 5;

interface MultiImageUploadProps {
  values: string[];
  onChange: (images: string[]) => void;
  label?: string;
}

export default function MultiImageUpload({ values, onChange, label }: MultiImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = MAX_IMAGES - values.length;
    if (remaining <= 0) {
      alert(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remaining);

    for (const file of filesToProcess) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert(`${file.name}: Only JPG, PNG, and WebP images are accepted.`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${file.name}: Image must be smaller than ${MAX_SIZE_MB}MB.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        onChange([...values, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div>
      {label && <label className="text-white/60 text-xs mb-1.5 block">{label}</label>}

      {values.length > 0 && (
        <div className="flex flex-wrap items-start gap-2 mb-2 overflow-x-auto pb-1">
          {values.map((src, i) => (
            <div key={i} className="relative flex-shrink-0">
              <AnnouncementImageThumb src={src} alt={`Image ${i + 1}`} variant="form" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="cursor-pointer absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full w-7 h-7 sm:w-5 sm:h-5 flex items-center justify-center text-xs hover:bg-red-700"
                aria-label="Remove image"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {values.length < MAX_IMAGES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer px-4 py-2.5 sm:px-3 sm:py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 text-sm sm:text-xs hover:bg-white/10 transition-colors"
        >
          + Add Image{values.length > 0 ? ` (${values.length}/${MAX_IMAGES})` : ""}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}
