import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";

interface CompressedResult {
  file: File;
  originalSize: number;
  compressedSize: number;
}

interface UseImageUploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

export const compressImage = async (
  file: File,
  options?: UseImageUploadOptions
): Promise<CompressedResult> => {
  const originalSize = file.size;

  // Skip compression for non-image files
  if (!file.type.startsWith("image/")) {
    return { file, originalSize, compressedSize: originalSize };
  }

  const compressionOptions = {
    maxSizeMB: options?.maxSizeMB ?? 1,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
    useWebWorker: options?.useWebWorker ?? true,
    fileType: options?.fileType ?? "image/webp",
  };

  const compressedBlob = await imageCompression(file, compressionOptions);

  // Create a new File with .webp extension
  const nameWithoutExt = file.name.replace(/\.[^.]+$/, "");
  const compressedFile = new File([compressedBlob], `${nameWithoutExt}.webp`, {
    type: "image/webp",
  });

  const compressedSize = compressedFile.size;

  console.log(
    `🖼️ Image Compression: "${file.name}" — Original: ${(originalSize / 1024).toFixed(1)}KB → Compressed: ${(compressedSize / 1024).toFixed(1)}KB (${((1 - compressedSize / originalSize) * 100).toFixed(0)}% reduction)`
  );

  return { file: compressedFile, originalSize, compressedSize };
};

export const useImageUpload = (options?: UseImageUploadOptions) => {
  const [isCompressing, setIsCompressing] = useState(false);

  const compress = useCallback(
    async (file: File): Promise<CompressedResult> => {
      setIsCompressing(true);
      try {
        return await compressImage(file, options);
      } finally {
        setIsCompressing(false);
      }
    },
    [options]
  );

  const compressMultiple = useCallback(
    async (files: File[]): Promise<CompressedResult[]> => {
      setIsCompressing(true);
      try {
        return await Promise.all(files.map((f) => compressImage(f, options)));
      } finally {
        setIsCompressing(false);
      }
    },
    [options]
  );

  return { compress, compressMultiple, isCompressing };
};
