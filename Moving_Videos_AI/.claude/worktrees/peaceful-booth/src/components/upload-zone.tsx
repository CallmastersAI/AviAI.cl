"use client";

import { useCallback, useRef } from "react";
import { Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectImage, RoomType } from "@/lib/types";
import { ROOM_TYPES } from "@/lib/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/heic"];
const MAX_IMAGES = 10;

interface UploadZoneProps {
  images: ProjectImage[];
  onImagesChange: (images: ProjectImage[]) => void;
}

export function UploadZone({ images, onImagesChange }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const incoming = Array.from(files).filter((f) =>
        ACCEPTED_TYPES.includes(f.type)
      );
      const remaining = MAX_IMAGES - images.length;
      const toAdd = incoming.slice(0, remaining);

      const newImages: ProjectImage[] = toAdd.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        roomType: "living" as RoomType,
        originalName: file.name,
      }));

      onImagesChange([...images, ...newImages]);
    },
    [images, onImagesChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback(
    (id: string) => {
      const img = images.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      onImagesChange(images.filter((i) => i.id !== id));
    },
    [images, onImagesChange]
  );

  const updateRoomType = useCallback(
    (id: string, roomType: RoomType) => {
      onImagesChange(
        images.map((img) => (img.id === id ? { ...img, roomType } : img))
      );
    },
    [images, onImagesChange]
  );

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 transition-colors",
          "border-zinc-700 bg-zinc-900/50 hover:border-violet-500/60 hover:bg-zinc-900"
        )}
      >
        <Upload className="mb-3 h-10 w-10 text-zinc-500" />
        <p className="text-sm font-medium text-zinc-300">
          Arrastra imágenes aquí o haz click para seleccionar
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          JPG, PNG o HEIC — máximo {MAX_IMAGES} imágenes
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.heic"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {images.map((img) => (
              <motion.div
                key={img.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="group relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900"
              >
                <div className="relative aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.preview}
                    alt={img.originalName}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(img.id);
                    }}
                    className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="p-2">
                  <Select
                    value={img.roomType}
                    onValueChange={(v) =>
                      updateRoomType(img.id, v as RoomType)
                    }
                  >
                    <SelectTrigger className="h-8 w-full text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROOM_TYPES) as RoomType[]).map((key) => (
                        <SelectItem key={key} value={key}>
                          {ROOM_TYPES[key].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-zinc-500">
          {images.length} / {MAX_IMAGES} imágenes
        </p>
      )}
    </div>
  );
}
