
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppMode, ModelType, MaterialType, AppState, PBRMap, Language, Resolution, ImageAdjustments, Theme, HistoryItem } from './types';
import { GeminiService } from './services/geminiService';
import { 
  Square3Stack3DIcon, 
  PhotoIcon, 
  ArrowDownTrayIcon, 
  SparklesIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BeakerIcon,
  CloudArrowUpIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  ArrowPathIcon,
  SwatchIcon,
  PaintBrushIcon,
  ClockIcon,
  ScissorsIcon,
  XMarkIcon,
  ArrowsRightLeftIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  offsetX: 0,
  offsetY: 0,
};

const INITIAL_MAPS: PBRMap[] = [
  { id: 'albedo', name: 'Albedo', nameVN: 'Albedo', suffix: 'albedo', url: null, loading: false, error: null, selected: true, adjustments: { ...DEFAULT_ADJUSTMENTS } },
  { id: 'roughness', name: 'Roughness', nameVN: 'Độ Nhám', suffix: 'roughness', url: null, loading: false, error: null, selected: true, adjustments: { ...DEFAULT_ADJUSTMENTS } },
  { id: 'normal', name: 'Normal', nameVN: 'Pháp Tuyến', suffix: 'normal', url: null, loading: false, error: null, selected: true, adjustments: { ...DEFAULT_ADJUSTMENTS } },
  { id: 'height', name: 'Height', nameVN: 'Gồ Ghề', suffix: 'height', url: null, loading: false, error: null, selected: true, adjustments: { ...DEFAULT_ADJUSTMENTS } },
  { id: 'ao', name: 'AO', nameVN: 'Bóng Kẽ', suffix: 'ao', url: null, loading: false, error: null, selected: true, adjustments: { ...DEFAULT_ADJUSTMENTS } },
  { id: 'metalness', name: 'Metalness', nameVN: 'Kim Loại', suffix: 'metalness', url: null, loading: false, error: null, selected: false, adjustments: { ...DEFAULT_ADJUSTMENTS } },
];

const MATERIAL_OPTIONS: MaterialType[] = ['Fabric', 'Wood', 'Stone', 'Concrete', 'Leather', 'Metal', 'Plaster', 'Tile'];

const TRANSLATIONS = {
  EN: {
    heroTitle: "TEXTURE LAB",
    heroSubtitle: "NBOX INTERNAL DISTRIBUTION",
    heroTag: "AI-POWERED ARCHITECTURAL RENDERING SYSTEM V1.0",
    getStarted: "START EXPERIENCE",
    copyright: "© 2026 NBOX TextureLab. All Rights Reserved.",
    sidebarTitle: "TEXTURE LAB",
    processMode: "Process Mode",
    aiModel: "AI Neural Engine",
    bananaPro: "Banana Pro (High Qual)",
    bananaFree: "Banana Free (Fast)",
    materialCat: "Material Category",
    inputAsset: "Input Asset",
    clickToUpload: "Click to upload / Drop image here",
    matName: "Material Name",
    generateAlbedo: "Generate Master Albedo",
    generatePBR: "Generate PBR Maps",
    generateSelected: "Generate Secondary Maps",
    prodGrid: "TEXTURE VIEWPORT",
    reviewDesc: "Fine-tune and export your seamless maps",
    downloadAll: "Export Full Project",
    awaiting: "Awaiting Albedo Master",
    ready: "Ready",
    processing: "Processing...",
    step1: "Step 1: Albedo",
    step2: "Step 2: PBR Maps",
    adjustments: "Color Adjust",
    brightness: "Brightness",
    contrast: "Contrast",
    saturation: "Saturation",
    temperature: "Temp / WB",
    resolution: "Resolution",
    reset: "Reset All",
    download: "Export Map",
    history: "Production History",
    historyEmpty: "No textures generated yet.",
    historyClear: "Clear History",
    cropTitle: "Adjust Texture Area",
    cropConfirm: "Apply Crop",
    cropCancel: "Use Original",
    dragHint: "Drag to move • Corner to resize",
    offsetTitle: "Seamless Check (Offset)",
    offsetX: "Horizontal Shift",
    offsetY: "Vertical Shift",
    resetOffset: "Reset Offset",
    safetyError: "Engine Filter",
    safetyAction: "Pattern generation failed or safety triggered. Try a different crop or material."
  },
  VN: {
    heroTitle: "TEXTURE LAB",
    heroSubtitle: "LƯU HÀNH NỘI BỘ NBOX",
    heroTag: "AI-POWERED ARCHITECTURAL RENDERING SYSTEM V1.0",
    getStarted: "BẮT ĐẦU TRẢI NGHIỆM",
    copyright: "© 2026 NBOX TextureLab. Bản quyền thuộc về NBOX.",
    sidebarTitle: "TEXTURE LAB",
    processMode: "Chế Độ Xử Lý",
    aiModel: "Mô Hình AI",
    bananaPro: "Banana Pro (Chất lượng)",
    bananaFree: "Banana Free (Tốc độ)",
    materialCat: "Loại Vật Liệu",
    inputAsset: "Dữ Liệu Đầu Vào",
    clickToUpload: "Bấm để tải / Kéo thả ảnh vào đây",
    matName: "Tên Vật Liệu",
    generateAlbedo: "Khởi Tạo Albedo Gốc",
    generatePBR: "Khởi Tạo PBR Maps",
    generateSelected: "Tạo Map PBR Đã Chọn",
    prodGrid: "KHUNG XEM TEXTURE",
    reviewDesc: "Hiệu chỉnh và xuất các bản đồ seamless",
    downloadAll: "Xuất Toàn Bộ Dự Án",
    awaiting: "Đang chờ Albedo gốc",
    ready: "Sẵn Sàng",
    processing: "Đang xử lý...",
    step1: "Bước 1: Albedo",
    step2: "Bước 2: PBR Maps",
    adjustments: "Chỉnh Màu",
    brightness: "Độ Sáng",
    contrast: "Tương Phản",
    saturation: "Bão Hòa",
    temperature: "Cân Bằng",
    resolution: "Độ Phân Giải",
    reset: "Đặt Lại",
    download: "Xuất Ảnh",
    history: "Lịch Sử Khởi Tạo",
    historyEmpty: "Chưa có texture nào được tạo.",
    historyClear: "Xóa Lịch Sử",
    cropTitle: "Căn Chỉnh Vùng Texture",
    cropConfirm: "Xác Nhận Cắt",
    cropCancel: "Dùng Ảnh Gốc",
    dragHint: "Kéo để di chuyển • Góc để thay đổi kích thước",
    offsetTitle: "Kiểm Tra Seamless (Offset)",
    offsetX: "Dịch Ngang",
    offsetY: "Dịch Dọc",
    resetOffset: "Đặt Lại Vị Trí",
    safetyError: "Lỗi Xử Lý AI",
    safetyAction: "Không thể tạo pattern hoặc bộ lọc an toàn đã kích hoạt. Hãy thử vùng cắt khác."
  }
};

interface CropState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    const savedHistory = localStorage.getItem('nbox_texturelab_history');
    let history: HistoryItem[] = [];
    if (savedHistory) {
      try { history = JSON.parse(savedHistory); } catch (e) { console.error(e); }
    }

    return {
      isLanding: true,
      language: 'VN',
      theme: 'orange',
      mode: AppMode.REFERENCE_TO_DIFFUSE,
      model: ModelType.FLASH,
      resolution: '1K',
      selectedMaterial: 'Fabric',
      sourceImage: null,
      materialName: 'nbox_texture_01',
      isGenerating: false,
      maps: INITIAL_MAPS,
      activeMapId: 'albedo',
      history: history
    };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, width: 0, height: 0 });
  const [isResizingCrop, setIsResizingCrop] = useState(false);
  const [isMovingCrop, setIsMovingCrop] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [genProgress, setGenProgress] = useState<{current: number, total: number} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[state.language];

  useEffect(() => {
    const updateSize = () => {
      if (viewportRef.current) {
        setViewportSize({
          width: viewportRef.current.clientWidth,
          height: viewportRef.current.clientHeight
        });
      }
    };
    if (!state.isLanding) {
      updateSize();
      const resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(viewportRef.current!);
      return () => resizeObserver.disconnect();
    }
  }, [state.isLanding, state.activeMapId]);

  // Use a debounced or throttled approach for localStorage as base64 data is huge
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('nbox_texturelab_history', JSON.stringify(state.history));
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [state.history]);

  const updateState = (updates: Partial<AppState>) => setState(prev => ({ ...prev, ...updates }));

  const updateMap = (id: string, updates: Partial<PBRMap>) => {
    setState(prev => ({
      ...prev,
      maps: prev.maps.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const toggleLanguage = (lang: Language) => updateState({ language: lang });
  const toggleTheme = () => updateState({ theme: state.theme === 'blue' ? 'orange' : 'blue' });

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setTempImage(result);
          const size = Math.min(img.width, img.height) * 0.8;
          setCrop({ 
            x: (img.width - size) / 2, 
            y: (img.height - size) / 2, 
            width: size,
            height: size 
          });
          setCropModalOpen(true);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const syncCurrentToHistory = (updatedMaps: PBRMap[]) => {
    setState(prev => {
      const lastHistoryItem = prev.history[0];
      const now = Date.now();
      if (lastHistoryItem && lastHistoryItem.name === prev.materialName && (now - lastHistoryItem.timestamp < 300000)) {
        const newHistory = [...prev.history];
        newHistory[0] = { ...lastHistoryItem, maps: updatedMaps, timestamp: now };
        return { ...prev, history: newHistory };
      } else {
        const newItem: HistoryItem = { id: now.toString(), name: prev.materialName, timestamp: now, maps: updatedMaps };
        return { ...prev, history: [newItem, ...prev.history].slice(0, 20) };
      }
    });
  };

  const generateAlbedo = async () => {
    // @ts-ignore
    if (state.model === ModelType.PRO && !(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
    updateState({ isGenerating: true });
    updateMap('albedo', { loading: true, error: null, url: null });
    try {
      const prompt = GeminiService.buildAlbedoPrompt(state.selectedMaterial);
      const resultUrl = await GeminiService.generateTexture(state.model, state.sourceImage, prompt, state.resolution);
      const newMaps = state.maps.map(m => m.id === 'albedo' ? { ...m, url: resultUrl, loading: false } : m);
      setState(prev => ({ ...prev, maps: newMaps, activeMapId: 'albedo', isGenerating: false }));
      syncCurrentToHistory(newMaps);
    } catch (err: any) {
      updateMap('albedo', { error: err.message, loading: false });
      updateState({ isGenerating: false });
    }
  };

  const generateSelectedPBR = async () => {
    const albedoUrl = state.maps.find(m => m.id === 'albedo')?.url;
    if (!albedoUrl) return;

    // @ts-ignore
    if (state.model === ModelType.PRO && !(await window.aistudio.hasSelectedApiKey())) {
       // @ts-ignore
      await window.aistudio.openSelectKey();
    }

    const selectedMaps = state.maps.filter(m => m.selected && m.id !== 'albedo');
    if (selectedMaps.length === 0) return;

    // Step 1: Set ALL selected maps to loading immediately
    setState(prev => ({
      ...prev,
      isGenerating: true,
      maps: prev.maps.map(m => (m.selected && m.id !== 'albedo') ? { ...m, loading: true, error: null } : m)
    }));
    setGenProgress({ current: 0, total: selectedMaps.length });

    // Internal loop state to track results without triggering history sync in loop
    let currentMapsState = [...state.maps];

    // Step 2: Process sequentially to avoid browser hanging
    for (let i = 0; i < selectedMaps.length; i++) {
      const map = selectedMaps[i];
      setGenProgress({ current: i + 1, total: selectedMaps.length });
      
      // Allow the UI to update and garbage collect before the next request
      await new Promise(resolve => setTimeout(resolve, 150));

      try {
        const prompt = GeminiService.buildPBRMapPrompt(map.name, state.selectedMaterial);
        const resultUrl = await GeminiService.generateTexture(state.model, albedoUrl, prompt, state.resolution);
        
        // Update the current UI state for the specific map immediately
        currentMapsState = currentMapsState.map(m => m.id === map.id ? { ...m, url: resultUrl, loading: false } : m);
        updateState({ maps: currentMapsState });
        
      } catch (err: any) {
        console.error(`Error generating ${map.id}:`, err);
        currentMapsState = currentMapsState.map(m => m.id === map.id ? { ...m, error: err.message, loading: false } : m);
        updateState({ maps: currentMapsState });
      }
    }

    // Step 3: Final state update and single history sync to prevent multiple heavy localStorage writes
    updateState({ isGenerating: false });
    setGenProgress(null);
    syncCurrentToHistory(currentMapsState);
  };

  const activeMap = state.maps.find(m => m.id === state.activeMapId)!;

  const downloadAdjustedImage = () => {
    if (!activeMap.url) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = img.width;
      canvas.height = img.height;
      const { brightness, contrast, saturation, temperature, offsetX, offsetY } = activeMap.adjustments;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${temperature}deg)`;
      
      const sX = ((offsetX % 100 + 100) % 100 / 100) * img.width;
      const sY = ((offsetY % 100 + 100) % 100 / 100) * img.height;
      
      ctx.drawImage(img, img.width - sX, img.height - sY, sX, sY, 0, 0, sX, sY);
      ctx.drawImage(img, 0, img.height - sY, img.width - sX, sY, sX, 0, img.width - sX, sY);
      ctx.drawImage(img, img.width - sX, 0, sX, img.height - sY, 0, sY, sX, img.height - sY);
      ctx.drawImage(img, 0, 0, img.width - sX, img.height - sY, sX, sY, img.width - sX, img.height - sY);
      
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${state.materialName}_${activeMap.suffix}_final.png`;
      link.click();
    };
    img.src = activeMap.url;
  };

  const downloadAll = () => {
    state.maps.forEach(map => {
      if (map.url) downloadRaw(map.url, map.suffix);
    });
  };

  const updateAdjustments = (key: keyof ImageAdjustments, value: number) => {
    updateMap(state.activeMapId, { adjustments: { ...activeMap.adjustments, [key]: value } });
  };

  const loadFromHistory = (item: HistoryItem) => {
    updateState({ maps: item.maps, materialName: item.name, activeMapId: 'albedo' });
  };

  const clearHistory = () => {
    if (confirm(state.language === 'VN' ? 'Xóa toàn bộ lịch sử?' : 'Clear all history?')) {
      updateState({ history: [] });
      localStorage.removeItem('nbox_texturelab_history');
    }
  };

  const handleApplyCrop = () => {
    if (!tempImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = 1024;
      canvas.height = 1024;
      ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, 1024, 1024);
      const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
      
      const updates: Partial<AppState> = { sourceImage: croppedImage };
      if (state.mode === AppMode.DIFFUSE_TO_PBR) {
        updates.maps = state.maps.map(m => m.id === 'albedo' ? { ...m, url: croppedImage, loading: false, error: null } : m);
        updates.activeMapId = 'albedo';
      }
      
      updateState(updates);
      setCropModalOpen(false);
    };
    img.src = tempImage;
  };

  const handleSkipCrop = () => {
    if (!tempImage) return;
    const updates: Partial<AppState> = { sourceImage: tempImage };
    if (state.mode === AppMode.DIFFUSE_TO_PBR) {
      updates.maps = state.maps.map(m => m.id === 'albedo' ? { ...m, url: tempImage, loading: false, error: null } : m);
      updates.activeMapId = 'albedo';
    }
    updateState(updates);
    setCropModalOpen(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if ((!isMovingCrop && !isResizingCrop) || !cropContainerRef.current || !tempImage) return;
      const container = cropContainerRef.current;
      const rect = container.getBoundingClientRect();
      const img = new Image(); img.src = tempImage;
      const containerRatio = rect.width / rect.height;
      const imgRatio = img.width / img.height;
      let actualWidth, actualHeight, offsetX, offsetY;
      if (imgRatio > containerRatio) { actualWidth = rect.width; actualHeight = rect.width / imgRatio; offsetX = 0; offsetY = (rect.height - actualHeight) / 2; }
      else { actualHeight = rect.height; actualWidth = rect.height * imgRatio; offsetX = (rect.width - actualWidth) / 2; offsetY = 0; }
      const scale = img.width / actualWidth;
      const deltaX = e.movementX * scale;
      const deltaY = e.movementY * scale;
      if (isMovingCrop) {
        setCrop(prev => ({ 
          ...prev, 
          x: Math.max(0, Math.min(img.width - prev.width, prev.x + deltaX)),
          y: Math.max(0, Math.min(img.height - prev.height, prev.y + deltaY))
        }));
      } else if (isResizingCrop) {
        setCrop(prev => ({ 
          ...prev, 
          width: Math.max(50, Math.min(img.width - prev.x, prev.width + deltaX)),
          height: Math.max(50, Math.min(img.height - prev.y, prev.height + deltaY))
        }));
      }
    };
    const handleGlobalMouseUp = () => { setIsMovingCrop(false); setIsResizingCrop(false); };
    if (isMovingCrop || isResizingCrop) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isMovingCrop, isResizingCrop, tempImage]);

  const downloadRaw = (url: string, suffix: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.materialName}_${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const accentColor = state.theme === 'blue' ? 'blue' : 'orange';
  const themeBgAccentClass = state.theme === 'blue' ? 'bg-blue-600' : 'bg-orange-600';
  const themeTextAccentClass = state.theme === 'blue' ? 'text-blue-500' : 'text-orange-500';
  const themeBorderAccentClass = state.theme === 'blue' ? 'border-blue-500' : 'border-orange-500';

  if (state.isLanding) {
    const primaryBg = state.theme === 'blue' ? 'bg-[#1d4ed8]' : 'bg-[#ea580c]';
    const primaryText = state.theme === 'blue' ? 'text-blue-500' : 'text-orange-500';
    const accentShadow = state.theme === 'blue' ? 'shadow-[0_0_50px_rgba(29,78,216,0.5)]' : 'shadow-[0_0_50px_rgba(234,88,12,0.5)]';
    const buttonBg = state.theme === 'blue' ? 'bg-[#2563eb]' : 'bg-[#f97316]';
    const buttonShadow = state.theme === 'blue' ? 'shadow-[0_0_60px_rgba(37,99,235,0.4)]' : 'shadow-[0_0_60px_rgba(249,115,22,0.4)]';
    const lineShadow = state.theme === 'blue' ? 'shadow-[0_0_20px_rgba(59,130,246,0.6)]' : 'shadow-[0_0_20px_rgba(251,146,60,0.6)]';
    const lineVia = state.theme === 'blue' ? 'via-blue-500/50' : 'via-orange-500/50';
    return (
      <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#070709]">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,${state.theme === 'blue' ? 'rgba(37,99,235,0.06)' : 'rgba(249,115,22,0.06)'},transparent_75%)]`}></div>
        <div className="absolute top-8 right-8 flex gap-4 z-20">
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button onClick={() => toggleLanguage('VN')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${state.language === 'VN' ? (state.theme === 'blue' ? 'bg-blue-600' : 'bg-orange-600') + ' text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>VN</button>
            <button onClick={() => toggleLanguage('EN')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${state.language === 'EN' ? (state.theme === 'blue' ? 'bg-blue-600' : 'bg-orange-600') + ' text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>EN</button>
          </div>
          <button onClick={toggleTheme} className={`p-3 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white transition-all shadow-lg hover:border-${accentColor}-500/50`}><SwatchIcon className="w-5 h-5" /></button>
        </div>
        <div className="relative z-10 flex flex-col items-center space-y-16">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-8 mb-4">
                <div className={`${primaryBg} px-8 py-4 rounded-3xl ${accentShadow} flex items-center justify-center`}><span className="text-white font-black text-4xl tracking-tighter">NBOX</span></div>
                <h1 className="text-[10rem] font-black tracking-tighter text-white leading-none">{t.heroTitle}</h1>
             </div>
             <div className={`w-full h-[2px] bg-gradient-to-r from-transparent ${lineVia} to-transparent ${lineShadow}`}></div>
             <div className="mt-10 flex flex-col items-center gap-4">
                <h2 className={`${primaryText} font-bold tracking-[0.8em] text-2xl uppercase ml-[0.8em]`}>{t.heroSubtitle}</h2>
                <p className="text-slate-500 text-sm font-bold tracking-[0.2em] opacity-60 uppercase">{t.heroTag}</p>
             </div>
          </div>
          <button onClick={() => updateState({ isLanding: false })} className={`group relative px-20 py-7 ${buttonBg} rounded-full font-black text-2xl text-white ${buttonShadow} hover:scale-110 active:scale-95 transition-all overflow-hidden`}>
            <span className="relative z-10 tracking-[0.05em]">{t.getStarted}</span>
            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          </button>
        </div>
        <div className="absolute bottom-12 text-slate-700 text-xs uppercase tracking-widest font-bold opacity-30">{t.copyright}</div>
      </div>
    );
  }

  const getCropBoxStyles = () => {
    if (!tempImage || !cropContainerRef.current) return {};
    const img = new Image(); img.src = tempImage;
    const rect = cropContainerRef.current.getBoundingClientRect();
    const containerRatio = rect.width / rect.height;
    const imgRatio = img.width / img.height;
    let actualWidth, actualHeight, offsetX, offsetY;
    if (imgRatio > containerRatio) { actualWidth = rect.width; actualHeight = rect.width / imgRatio; offsetX = 0; offsetY = (rect.height - actualHeight) / 2; }
    else { actualHeight = rect.height; actualWidth = rect.height * imgRatio; offsetX = (rect.width - actualWidth) / 2; offsetY = 0; }
    const scale = actualWidth / img.width;
    return { left: `${offsetX + crop.x * scale}px`, top: `${offsetY + crop.y * scale}px`, width: `${crop.width * scale}px`, height: `${crop.height * scale}px` };
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#070709] text-slate-200">
      {cropModalOpen && tempImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#0f0f13] border border-white/10 rounded-[3rem] p-10 max-w-4xl w-full flex flex-col items-center gap-8 shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-4">
                 <div className={`${themeBgAccentClass} p-2 rounded-xl text-white`}><ScissorsIcon className="w-6 h-6" /></div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{t.cropTitle}</h3>
              </div>
              <button onClick={handleSkipCrop} className="p-2 text-slate-500 hover:text-white transition-colors"><XMarkIcon className="w-8 h-8" /></button>
            </div>
            <div ref={cropContainerRef} className="w-full aspect-square bg-[#070709] rounded-3xl overflow-hidden relative border border-white/5 select-none">
              <img src={tempImage} className="w-full h-full object-contain pointer-events-none opacity-40 select-none" alt="Crop Source" />
              <div className="absolute border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] cursor-move z-10" style={getCropBoxStyles()} onMouseDown={() => setIsMovingCrop(true)}>
                <div className="absolute -top-10 left-0 bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] text-white font-black uppercase tracking-widest whitespace-nowrap shadow-xl">{t.dragHint}</div>
                <div className="absolute bottom-[-10px] right-[-10px] w-8 h-8 bg-white border-4 border-slate-900 rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-20 shadow-2xl flex items-center justify-center" onMouseDown={(e) => { e.stopPropagation(); setIsResizingCrop(true); }}><div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div></div>
              </div>
            </div>
            <div className="flex gap-4 w-full">
              <button onClick={handleSkipCrop} className="flex-1 py-5 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase tracking-widest hover:text-white transition-all">{t.cropCancel}</button>
              <button onClick={handleApplyCrop} className={`flex-1 py-5 rounded-2xl ${themeBgAccentClass} text-white font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl`}>{t.cropConfirm}</button>
            </div>
          </div>
        </div>
      )}

      <aside className="w-full lg:w-[420px] bg-[#0f0f13] border-r border-white/5 overflow-y-auto p-8 flex flex-col gap-10 z-20">
        <header className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => updateState({ isLanding: true })}>
            <div className={`${themeBgAccentClass} px-3 py-1.5 rounded-lg`}><span className="text-white font-black text-xs tracking-tighter">NBOX</span></div>
            <h1 className={`text-2xl font-black text-white group-hover:${themeTextAccentClass} transition-colors uppercase`}>{t.sidebarTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 p-1 rounded-full border border-white/10 scale-90">
                <button onClick={() => toggleLanguage('VN')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${state.language === 'VN' ? `${themeBgAccentClass} text-white shadow-lg` : 'text-slate-500'}`}>VN</button>
                <button onClick={() => toggleLanguage('EN')} className={`px-3 py-1 rounded-full text-[10px] font-bold ${state.language === 'EN' ? `${themeBgAccentClass} text-white shadow-lg` : 'text-slate-500'}`}>EN</button>
            </div>
            <button onClick={toggleTheme} className={`p-2 bg-white/5 rounded-full border border-white/10 text-slate-400 hover:text-white transition-all shadow-lg hover:border-${accentColor}-500/50`}><PaintBrushIcon className="w-4 h-4" /></button>
          </div>
        </header>
        <div className="space-y-8">
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
            <button onClick={() => updateState({ mode: AppMode.REFERENCE_TO_DIFFUSE })} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${state.mode === AppMode.REFERENCE_TO_DIFFUSE ? `${themeBgAccentClass} shadow-xl` : 'opacity-40 hover:opacity-100'}`}><CloudArrowUpIcon className="w-5 h-5 mb-1" /><span className="text-[10px] font-bold uppercase tracking-tighter">{t.step1}</span></button>
            <button onClick={() => updateState({ mode: AppMode.DIFFUSE_TO_PBR })} className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${state.mode === AppMode.DIFFUSE_TO_PBR ? `${themeBgAccentClass} shadow-xl` : 'opacity-40 hover:opacity-100'}`}><BeakerIcon className="w-5 h-5 mb-1" /><span className="text-[10px] font-bold uppercase tracking-tighter">{t.step2}</span></button>
          </div>
          <section>
            <label className={`text-[10px] font-black ${themeTextAccentClass} uppercase tracking-[0.2em] mb-4 block`}>{t.aiModel}</label>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={() => updateState({ model: ModelType.PRO })} className={`p-4 rounded-2xl border text-left transition-all ${state.model === ModelType.PRO ? `${themeBgAccentClass}/10 ${themeBorderAccentClass}/50 text-white` : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}><div className="text-sm font-bold tracking-tight">{t.bananaPro}</div></button>
              <button onClick={() => updateState({ model: ModelType.FLASH })} className={`p-4 rounded-2xl border text-left transition-all ${state.model === ModelType.FLASH ? `${themeBgAccentClass}/10 ${themeBorderAccentClass}/50 text-white` : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}><div className="text-sm font-bold tracking-tight">{t.bananaFree}</div></button>
            </div>
            {state.model === ModelType.PRO && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 block">{t.resolution}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['1K', '2K', '4K'] as Resolution[]).map(res => (
                    <button key={res} onClick={() => updateState({ resolution: res })} className={`py-2 rounded-xl text-xs font-bold border transition-all ${state.resolution === res ? `${themeBgAccentClass} border-white/20 text-white shadow-lg` : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300'}`}>{res}</button>
                  ))}
                </div>
              </div>
            )}
          </section>
          <section>
            <label className={`text-[10px] font-black ${themeTextAccentClass} uppercase tracking-[0.2em] mb-4 block`}>{t.materialCat}</label>
            <div className="grid grid-cols-2 gap-2">
              {MATERIAL_OPTIONS.map(mat => (
                <button key={mat} onClick={() => updateState({ selectedMaterial: mat })} className={`py-2 px-3 text-[11px] font-bold rounded-xl border transition-all ${state.selectedMaterial === mat ? `bg-white/10 ${themeBorderAccentClass}/30 text-white` : 'bg-white/5 border-transparent text-slate-500 hover:text-slate-300'}`}>{mat.toUpperCase()}</button>
              ))}
            </div>
          </section>
          <section>
            <label className={`text-[10px] font-black ${themeTextAccentClass} uppercase tracking-[0.2em] mb-4 block`}>{t.inputAsset}</label>
            <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${state.sourceImage ? `${themeBorderAccentClass} p-0` : `border-white/10 hover:${themeBorderAccentClass}/50 bg-white/5`} ${isDragging ? 'bg-blue-500/10 border-blue-500 scale-[1.02]' : ''}`}>
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
              {state.sourceImage ? (
                <>
                  <img src={state.sourceImage} className="w-full h-full object-cover" alt="Source" />
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-full border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity"><ScissorsIcon className="w-5 h-5" /></div>
                </>
              ) : (
                <div className="flex flex-col items-center p-4 text-center">
                  <PhotoIcon className={`w-12 h-12 ${isDragging ? themeTextAccentClass : 'text-slate-700'} mb-3 transition-colors`} />
                  <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{t.clickToUpload}</span>
                </div>
              )}
            </div>
          </section>
          <section>
            <label className={`text-[10px] font-black ${themeTextAccentClass} uppercase tracking-[0.2em] mb-3 block`}>{t.matName}</label>
            <input type="text" value={state.materialName} onChange={(e) => updateState({ materialName: e.target.value })} className={`w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-${accentColor}-500/50 transition-all mono`} />
          </section>
          <div className="pt-6 space-y-4">
            <button 
              onClick={state.mode === AppMode.REFERENCE_TO_DIFFUSE ? generateAlbedo : generateSelectedPBR} 
              disabled={!state.sourceImage || state.isGenerating} 
              className={`w-full py-6 rounded-[2rem] font-black uppercase text-base flex items-center justify-center gap-4 transition-all shadow-2xl ${!state.sourceImage || state.isGenerating ? 'bg-white/5 text-slate-600 cursor-not-allowed' : `${themeBgAccentClass} hover:brightness-110 text-white active:scale-95`}`}
            >
              {state.isGenerating ? (
                <div className="flex items-center gap-3">
                  <span className="animate-pulse">
                    {genProgress ? `${t.processing} (${genProgress.current}/${genProgress.total})` : t.processing}
                  </span>
                </div>
              ) : (
                <><SparklesIcon className="w-8 h-8" />{state.mode === AppMode.REFERENCE_TO_DIFFUSE ? t.generateAlbedo : t.generatePBR}</>
              )}
            </button>
            {state.maps[0].url && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="grid grid-cols-2 gap-2">
                  {state.maps.slice(1).map(map => (
                    <label key={map.id} className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${map.selected ? `bg-${accentColor}-500/10 ${themeBorderAccentClass}/40 text-white shadow-lg` : 'bg-white/5 border-transparent text-slate-600 hover:text-slate-400'}`}>
                      <input type="checkbox" checked={map.selected} onChange={(e) => updateMap(map.id, { selected: e.target.checked })} className={`w-4 h-4 rounded border-white/10 bg-transparent text-${accentColor}-600 focus:ring-${accentColor}-500`} />
                      <span className="text-[10px] font-black uppercase tracking-tighter truncate text-white">{state.language === 'VN' ? map.nameVN : map.name}</span>
                    </label>
                  ))}
                </div>
                {state.mode === AppMode.REFERENCE_TO_DIFFUSE && (
                  <button onClick={generateSelectedPBR} disabled={state.isGenerating} className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-sm hover:bg-white/10 flex items-center justify-center gap-3 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    <BeakerIcon className="w-5 h-5" />
                    {state.isGenerating && genProgress ? `${t.generateSelected} (${genProgress.current}/${genProgress.total})` : t.generateSelected}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#070709] flex flex-col relative no-scrollbar">
        <header className="p-8 lg:p-12 pb-4 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div><h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none whitespace-nowrap">{t.prodGrid}</h2><p className="text-slate-500 font-bold text-xs mt-3 uppercase tracking-widest whitespace-nowrap">{t.reviewDesc}</p></div>
          <button onClick={downloadAll} className="px-8 py-5 bg-white/5 hover:bg-white/10 text-white text-[12px] font-black rounded-2xl border border-white/10 transition-all uppercase tracking-[0.2em] active:scale-95 shadow-xl whitespace-nowrap">{t.downloadAll}</button>
        </header>
        <div className="px-8 lg:px-12 mb-4 flex justify-center">
          <div className="flex bg-[#0f0f13] p-1.5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar shadow-2xl">
            {state.maps.map(map => (
              <button key={map.id} onClick={() => updateState({ activeMapId: map.id })} disabled={!map.url && !map.loading} className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-3 whitespace-nowrap ${state.activeMapId === map.id ? `${themeBgAccentClass} text-white shadow-lg` : map.url ? 'text-white hover:bg-white/10' : 'text-white/30 cursor-not-allowed opacity-30'}`}>
                <span className="text-white font-black">{state.language === 'VN' ? map.nameVN : map.name}</span>
                {map.loading && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
                {map.url && !map.loading && <CheckCircleIcon className="w-4 h-4 text-current" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col px-8 lg:px-12 gap-10">
          <div className="flex-1 flex items-center justify-center py-6 relative">
              <div ref={viewportRef} className="w-full max-w-3xl aspect-square bg-[#0f0f13] rounded-[4rem] border border-white/5 overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                {activeMap.loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6"><div className="spinner-f"></div><p className={`text-sm ${themeTextAccentClass} font-black uppercase tracking-[0.3em] animate-pulse`}>{t.processing}</p></div>
                ) : activeMap.url ? (
                  <div className="w-full h-full transition-all duration-75 ease-out" style={{ 
                    backgroundImage: `url(${activeMap.url})`, 
                    backgroundPosition: `${(activeMap.adjustments.offsetX / 100) * viewportSize.width}px ${(activeMap.adjustments.offsetY / 100) * viewportSize.height}px`, 
                    backgroundRepeat: 'repeat', 
                    backgroundSize: '100% 100%', 
                    filter: `brightness(${activeMap.adjustments.brightness}%) contrast(${activeMap.adjustments.contrast}%) saturate(${activeMap.adjustments.saturation}%) hue-rotate(${activeMap.adjustments.temperature}deg)` 
                  }} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"><div className="w-24 h-24 rounded-[3rem] bg-white/5 border border-white/10 flex items-center justify-center mb-8"><Square3Stack3DIcon className="w-12 h-12 text-slate-800" /></div><p className="text-[12px] text-slate-600 font-black uppercase tracking-[0.2em] leading-relaxed max-w-[250px]">{t.awaiting}</p></div>
                )}
                {activeMap.error && (
                  <div className="absolute inset-0 bg-red-950/40 flex flex-col items-center justify-center p-10 text-center backdrop-blur-md">
                    <ExclamationCircleIcon className="w-20 h-20 text-red-500 mb-6" />
                    <p className="text-lg font-black text-red-400 uppercase tracking-tighter mb-2">{activeMap.error.includes("Safety") || activeMap.error.includes("category") || activeMap.error.includes("recitation") ? t.safetyError : "Engine Error"}</p>
                    <p className="text-xs text-white/70 max-w-sm">{activeMap.error.includes("Safety") || activeMap.error.includes("category") || activeMap.error.includes("recitation") ? t.safetyAction : activeMap.error}</p>
                  </div>
                )}
              </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#0f0f13] p-8 rounded-[3rem] border border-white/5 flex flex-col gap-8 shadow-2xl">
              <div className="flex items-center justify-between"><div className="flex items-center gap-4"><AdjustmentsHorizontalIcon className={`w-8 h-8 ${themeTextAccentClass}`} /><h3 className="text-sm font-black uppercase text-white tracking-widest">{t.adjustments}</h3></div><button onClick={() => updateMap(state.activeMapId, { adjustments: { ...activeMap.adjustments, brightness: 100, contrast: 100, saturation: 100, temperature: 0 } })} className="p-3 bg-white/5 text-slate-500 hover:text-white rounded-xl border border-white/5 transition-all"><ArrowPathIcon className="w-5 h-5" /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[ { label: t.brightness, key: 'brightness', min: 50, max: 150 }, { label: t.contrast, key: 'contrast', min: 50, max: 150 }, { label: t.saturation, key: 'saturation', min: 0, max: 200 }, { label: t.temperature, key: 'temperature', min: -45, max: 45 } ].map((adj) => (
                  <div key={adj.key} className="flex flex-col gap-3">
                    <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest"><span>{adj.label}</span><span className={themeTextAccentClass}>{activeMap.adjustments[adj.key as keyof ImageAdjustments]}</span></div>
                    <input type="range" min={adj.min} max={adj.max} value={activeMap.adjustments[adj.key as keyof ImageAdjustments]} onChange={(e) => updateAdjustments(adj.key as keyof ImageAdjustments, parseInt(e.target.value))} className={`w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-${accentColor}-500`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0f0f13] p-8 rounded-[3rem] border border-white/5 flex flex-col gap-8 shadow-2xl">
              <div className="flex items-center justify-between"><div className="flex items-center gap-4"><ArrowsRightLeftIcon className={`w-8 h-8 ${themeTextAccentClass}`} /><h3 className="text-sm font-black uppercase text-white tracking-widest">{t.offsetTitle}</h3></div><button onClick={() => updateMap(state.activeMapId, { adjustments: { ...activeMap.adjustments, offsetX: 0, offsetY: 0 } })} className="p-3 bg-white/5 text-slate-500 hover:text-white rounded-xl border border-white/5 transition-all"><ArrowPathIcon className="w-5 h-5" /></button></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                 <div className="flex flex-col gap-3"><div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-2"><ArrowsRightLeftIcon className="w-3 h-3" />{t.offsetX}</div><span className={themeTextAccentClass}>{activeMap.adjustments.offsetX}%</span></div><input type="range" min="-100" max="100" value={activeMap.adjustments.offsetX} onChange={(e) => updateAdjustments('offsetX', parseInt(e.target.value))} className={`w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-${accentColor}-500`} /></div>
                 <div className="flex flex-col gap-3"><div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest"><div className="flex items-center gap-2"><ArrowsUpDownIcon className="w-3 h-3" />{t.offsetY}</div><span className={themeTextAccentClass}>{activeMap.adjustments.offsetY}%</span></div><input type="range" min="-100" max="100" value={activeMap.adjustments.offsetY} onChange={(e) => updateAdjustments('offsetY', parseInt(e.target.value))} className={`w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-${accentColor}-500`} /></div>
              </div>
              <div className="flex justify-end gap-4 mt-auto"><button disabled={!activeMap.url} onClick={downloadAdjustedImage} className={`flex-1 py-4 ${themeBgAccentClass} hover:brightness-110 text-white text-[11px] font-black rounded-2xl shadow-xl transition-all uppercase tracking-[0.2em] disabled:opacity-20 disabled:cursor-not-allowed active:scale-95`}>{t.download}</button></div>
            </div>
          </div>
          <section className="mt-6 mb-12">
            <header className="flex items-center gap-4 mb-6"><ClockIcon className="w-6 h-6 text-slate-500" /><h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">{t.history}</h3><div className="flex-1 h-[1px] bg-white/5"></div>{state.history.length > 0 && (<button onClick={clearHistory} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/10 text-[10px] font-black uppercase text-slate-500 hover:text-red-500 rounded-xl transition-all border border-white/5"><TrashIcon className="w-4 h-4" />{t.historyClear}</button>)}</header>
            {state.history.length === 0 ? (
              <div className="bg-white/5 border border-white/5 rounded-[2rem] p-10 flex flex-col items-center justify-center opacity-40"><span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{t.historyEmpty}</span></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">{state.history.map((item) => (
                <button key={item.id} onClick={() => loadFromHistory(item)} className="group flex flex-col gap-3 text-left transition-all">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-white/5 group-hover:border-orange-500/50 transition-all shadow-xl bg-white/5 relative"><img src={item.maps.find(m => m.id === 'albedo')?.url || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} /><div className="absolute inset-0 bg-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ArrowPathIcon className="w-8 h-8 text-white rotate-[-45deg]" /></div></div>
                  <div className="px-1"><p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate leading-tight mb-1">{item.name}</p><p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p></div>
                </button>
              ))}</div>
            )}
          </section>
        </div>
        <footer className="px-12 py-10 flex flex-col lg:flex-row justify-between items-center gap-6 opacity-30 hover:opacity-100 transition-opacity"><p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">{t.copyright}</p><div className="flex items-center gap-8"><div className="flex items-center gap-3"><div className={`w-2 h-2 ${themeBgAccentClass} rounded-full`}></div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">PBR Pipeline v1.0</span></div><div className="flex items-center gap-3"><div className={`w-2 h-2 ${themeBgAccentClass} rounded-full`}></div><span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">AI: Gemini Neural Engine</span></div></div></footer>
      </main>
    </div>
  );
}
