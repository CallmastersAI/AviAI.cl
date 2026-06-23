export type DesignStyle =
  | "modern"
  | "scandinavian"
  | "industrial"
  | "minimalist"
  | "bohemian"
  | "luxury"
  | "coastal"
  | "japandi";

export type RoomType =
  | "living"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "office"
  | "dining";

export type PipelineStage =
  | "uploading"
  | "color_grade"
  | "ai_furnish"
  | "animate"
  | "compose"
  | "export"
  | "complete"
  | "error";

export interface PipelineStep {
  id: PipelineStage;
  label: string;
  description: string;
  estimatedSeconds: number;
  tool: string;
}

export interface ProjectImage {
  id: string;
  file: File | null;
  preview: string;
  roomType: RoomType;
  originalName: string;
}

export interface Project {
  id: string;
  name: string;
  style: DesignStyle;
  images: ProjectImage[];
  status: PipelineStage;
  progress: number;
  currentStep: number;
  logs: LogEntry[];
  videoUrl: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface LogEntry {
  timestamp: string;
  stage: PipelineStage;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "color_grade",
    label: "Color Grade",
    description: "Normalizing exposure, white balance, and color space",
    estimatedSeconds: 3,
    tool: "Sharp + ffmpeg",
  },
  {
    id: "ai_furnish",
    label: "AI Furnish",
    description: "Generating furnished room with proportional furniture",
    estimatedSeconds: 8,
    tool: "Higsfield API",
  },
  {
    id: "animate",
    label: "Animation",
    description: "Creating img2video transition with furniture pop-in effect",
    estimatedSeconds: 9,
    tool: "Kling AI 2.1",
  },
  {
    id: "compose",
    label: "Composition",
    description: "Speed ramping and motion blur transition compositing",
    estimatedSeconds: 6,
    tool: "Remotion",
  },
  {
    id: "export",
    label: "Export 4K",
    description: "AI upscaling and H.264 encoding at 4K resolution",
    estimatedSeconds: 4,
    tool: "ffmpeg + Real-ESRGAN",
  },
];

export const DESIGN_STYLES: Record<
  DesignStyle,
  { label: string; description: string; palette: string[]; prompt: string }
> = {
  modern: {
    label: "Moderno",
    description: "Clean lines, neutral tones, bold accents",
    palette: ["#2D2D2D", "#F5F5F0", "#C9A96E", "#4A6741"],
    prompt:
      "A modern living room, proportional sectional sofa, geometric coffee table, area rug, accent lighting, architectural photography style",
  },
  scandinavian: {
    label: "Escandinavo",
    description: "Light wood, soft textures, natural light",
    palette: ["#E8DDD3", "#F7F5F0", "#B8C4B8", "#D4A574"],
    prompt:
      "A scandinavian room, proportional light oak furniture, wool throws, natural plants, soft white walls, warm lighting, hygge atmosphere",
  },
  industrial: {
    label: "Industrial",
    description: "Raw materials, exposed elements, urban edge",
    palette: ["#3D3D3D", "#8B7355", "#C0C0C0", "#6B4226"],
    prompt:
      "An industrial loft room, proportional leather sofa, metal shelving, exposed brick, Edison bulbs, reclaimed wood table, urban photography",
  },
  minimalist: {
    label: "Minimalista",
    description: "Essential forms, monochrome, curated space",
    palette: ["#FFFFFF", "#F0F0F0", "#333333", "#999999"],
    prompt:
      "A minimalist room, proportional simple furniture, clean surfaces, monochrome palette, single accent piece, zen atmosphere, architectural photography",
  },
  bohemian: {
    label: "Bohemio",
    description: "Layered textiles, warm colors, eclectic mix",
    palette: ["#D4956A", "#8B4513", "#2E5A4C", "#E8C07D"],
    prompt:
      "A bohemian room, proportional low sofa with cushions, layered rugs, macrame wall hangings, tropical plants, warm terracotta tones, cozy photography",
  },
  luxury: {
    label: "Lujo",
    description: "Premium materials, rich textures, statement pieces",
    palette: ["#1A1A2E", "#C9A96E", "#4A3728", "#E8E8E8"],
    prompt:
      "A luxury room, proportional velvet sofa, marble coffee table, gold accents, crystal chandelier, dark walls, premium materials, editorial photography",
  },
  coastal: {
    label: "Costero",
    description: "Ocean blues, natural fibers, breezy atmosphere",
    palette: ["#D4E6F1", "#FAF0E6", "#5B9BD5", "#C19A6B"],
    prompt:
      "A coastal room, proportional linen sofa, rattan furniture, blue accent pillows, driftwood decor, ocean-inspired palette, bright natural light",
  },
  japandi: {
    label: "Japandi",
    description: "Japanese minimalism meets Scandinavian warmth",
    palette: ["#D7CEC7", "#565656", "#8B7355", "#E8E0D8"],
    prompt:
      "A japandi room, proportional low platform furniture, shoji screens, bonsai, wabi-sabi ceramics, warm wood tones, muted earth palette, serene photography",
  },
};

export const ROOM_TYPES: Record<RoomType, { label: string; icon: string }> = {
  living: { label: "Sala de estar", icon: "sofa" },
  bedroom: { label: "Dormitorio", icon: "bed" },
  kitchen: { label: "Cocina", icon: "cooking-pot" },
  bathroom: { label: "Baño", icon: "bath" },
  office: { label: "Oficina", icon: "monitor" },
  dining: { label: "Comedor", icon: "utensils" },
};
