
export enum AppMode {
  REFERENCE_TO_DIFFUSE = 'REFERENCE_TO_DIFFUSE',
  DIFFUSE_TO_PBR = 'DIFFUSE_TO_PBR'
}

export enum ModelType {
  FLASH = 'gemini-2.5-flash-image',
  PRO = 'gemini-3-pro-image-preview'
}

export type Resolution = '1K' | '2K' | '4K';

export type MaterialType = 
  | 'Fabric' 
  | 'Wood' 
  | 'Stone' 
  | 'Concrete' 
  | 'Leather' 
  | 'Metal' 
  | 'Plaster' 
  | 'Tile';

export type Language = 'EN' | 'VN';

export type Theme = 'blue' | 'orange';

export interface ImageAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  offsetX: number;
  offsetY: number;
}

export interface PBRMap {
  id: string;
  name: string;
  nameVN: string;
  suffix: string;
  url: string | null;
  loading: boolean;
  error: string | null;
  selected: boolean;
  adjustments: ImageAdjustments;
}

export interface HistoryItem {
  id: string;
  name: string;
  timestamp: number;
  maps: PBRMap[];
}

export interface AppState {
  isLanding: boolean;
  language: Language;
  theme: Theme;
  mode: AppMode;
  model: ModelType;
  resolution: Resolution;
  selectedMaterial: MaterialType;
  sourceImage: string | null;
  materialName: string;
  isGenerating: boolean;
  maps: PBRMap[];
  activeMapId: string;
  history: HistoryItem[];
}
