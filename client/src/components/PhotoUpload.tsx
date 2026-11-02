"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState } from "react";
import { MAX_PHOTOS_PER_PROPERTY, PHOTO_MIME_TYPES } from "@/lib/constants";

function PhotoPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [url] = useState(() => URL.createObjectURL(file));
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <li className="relative size-28 overflow-hidden rounded-lg border">
      <Image src={url} alt={file.name} fill unoptimized sizes="7rem" className="object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute top-1 right-1 rounded-full bg-white/90 p-1 hover:bg-white"
      >
        <X className="size-3" aria-hidden />
      </button>
    </li>
  );
}

function fileKey(file: File): string {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

type PhotoUploadProps = {
  id?: string;
  value: File[];
  onChange: (files: File[]) => void;
  onBlur?: () => void;
  invalid?: boolean;
};

export function PhotoUpload({ id, value, onChange, onBlur, invalid }: PhotoUploadProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const known = new Set(value.map(fileKey));
    const added = Array.from(list).filter((file) => !known.has(fileKey(file)));
    onChange([...value, ...added]);
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-sm text-gray-600 hover:bg-gray-50 data-[invalid=true]:border-destructive"
        data-invalid={invalid}
      >
        <ImagePlus className="size-6" aria-hidden />
        <span>Choose up to {MAX_PHOTOS_PER_PROPERTY} photos (JPEG, PNG or WebP, 5 MB each)</span>
      </label>
      <input
        id={inputId}
        type="file"
        multiple
        accept={PHOTO_MIME_TYPES.join(",")}
        className="sr-only"
        aria-invalid={invalid}
        onBlur={onBlur}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-3" aria-label="Selected photos">
          {value.map((file) => (
            <PhotoPreview
              key={fileKey(file)}
              file={file}
              onRemove={() => onChange(value.filter((item) => item !== file))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
