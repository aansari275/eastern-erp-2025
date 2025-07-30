import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, X, Loader2, ImageIcon, Palette } from "lucide-react";
import * as fabric from "fabric";
import { useToast } from "@/hooks/use-toast";

interface TextureOverlayProps {
  canvas?: fabric.Canvas | null;
  onHistoryAction?: (action: string) => void;
}

type TextureType = 'wool' | 'viscose' | 'jute' | 'custom';

interface TextureData {
  name: string;
  description: string;
  imageUrl: string;
  type: TextureType;
  blendMode: GlobalCompositeOperation;
  opacity: number;
}

export function TextureOverlay({ canvas, onHistoryAction }: TextureOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTexture, setActiveTexture] = useState<TextureData | null>(null);
  const [textureCache, setTextureCache] = useState<Map<string, HTMLImageElement>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [customTextures, setCustomTextures] = useState<TextureData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Default texture options
  const defaultTextures: TextureData[] = [
    {
      name: "Wool",
      description: "Matte, soft texture",
      imageUrl: "/api/textures/wool.jpg", // We'll create SVG patterns instead
      type: 'wool',
      blendMode: 'multiply',
      opacity: 0.3
    },
    {
      name: "Viscose", 
      description: "Shiny, smooth texture",
      imageUrl: "/api/textures/viscose.jpg",
      type: 'viscose',
      blendMode: 'overlay',
      opacity: 0.25
    },
    {
      name: "Jute",
      description: "Grainy, rough texture", 
      imageUrl: "/api/textures/jute.jpg",
      type: 'jute',
      blendMode: 'multiply',
      opacity: 0.4
    }
  ];

  // Generate SVG pattern for texture types
  const generateTexturePattern = useCallback((type: TextureType): string => {
    switch (type) {
      case 'wool':
        // Soft, random dots pattern
        return `
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wool" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="1" fill="rgba(0,0,0,0.1)"/>
                <circle cx="15" cy="8" r="0.8" fill="rgba(0,0,0,0.08)"/>
                <circle cx="8" cy="15" r="1.2" fill="rgba(0,0,0,0.06)"/>
                <circle cx="12" cy="3" r="0.6" fill="rgba(0,0,0,0.09)"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wool)"/>
          </svg>
        `;
      case 'viscose':
        // Subtle vertical lines for shine
        return `
          <svg width="8" height="20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="viscose" x="0" y="0" width="8" height="20" patternUnits="userSpaceOnUse">
                <line x1="2" y1="0" x2="2" y2="20" stroke="rgba(255,255,255,0.15)" stroke-width="0.5"/>
                <line x1="6" y1="0" x2="6" y2="20" stroke="rgba(255,255,255,0.08)" stroke-width="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#viscose)"/>
          </svg>
        `;
      case 'jute':
        // Cross-hatch pattern for rough texture
        return `
          <svg width="12" height="12" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="jute" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <line x1="0" y1="3" x2="12" y2="3" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>
                <line x1="0" y1="9" x2="12" y2="9" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
                <line x1="3" y1="0" x2="3" y2="12" stroke="rgba(0,0,0,0.06)" stroke-width="0.5"/>
                <line x1="9" y1="0" x2="9" y2="12" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#jute)"/>
          </svg>
        `;
      default:
        return '';
    }
  }, []);

  // Apply texture to canvas with shape masking
  const applyTexture = useCallback(async (textureData: TextureData) => {
    if (!canvas) return;

    setIsLoading(true);
    onHistoryAction?.(`Apply Texture: ${textureData.name}`);

    try {
      // Remove existing texture overlay
      canvas.getObjects().forEach(obj => {
        if ((obj as any).name === 'texture-overlay') {
          canvas.remove(obj);
        }
      });

      let texturePattern: fabric.Pattern | null = null;

      if (textureData.type === 'custom' && textureData.imageUrl) {
        // Use custom uploaded texture
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = textureData.imageUrl;
        });

        texturePattern = new fabric.Pattern({
          source: img,
          repeat: 'repeat'
        });
      } else {
        // Use generated SVG pattern
        const svgString = generateTexturePattern(textureData.type);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = svgUrl;
        });

        texturePattern = new fabric.Pattern({
          source: img,
          repeat: 'repeat'
        });

        URL.revokeObjectURL(svgUrl);
      }

      if (!texturePattern) return;

      // Create texture overlay that covers the entire canvas
      const textureOverlay = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvas.width,
        height: canvas.height,
        fill: texturePattern,
        opacity: textureData.opacity,
        selectable: false,
        evented: false,
        name: 'texture-overlay'
      });

      // Apply blend mode for texture effect and set name for identification
      (textureOverlay as any).globalCompositeOperation = textureData.blendMode;
      (textureOverlay as any).name = 'texture-overlay';
      
      canvas.add(textureOverlay);
      canvas.sendObjectToBack(textureOverlay); // Keep texture behind design elements
      canvas.renderAll();

      setActiveTexture(textureData);
      
      toast({
        title: "Texture Applied",
        description: `${textureData.name} texture has been applied to your rug design.`,
      });

    } catch (error) {
      console.error('Failed to apply texture:', error);
      toast({
        title: "Texture Error",
        description: "Failed to apply texture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [canvas, onHistoryAction, generateTexturePattern, toast]);

  // Remove texture overlay
  const removeTexture = useCallback(() => {
    if (!canvas) return;

    onHistoryAction?.('Remove Texture');
    
    canvas.getObjects().forEach(obj => {
      if ((obj as any).name === 'texture-overlay') {
        canvas.remove(obj);
      }
    });
    
    canvas.renderAll();
    setActiveTexture(null);
    
    toast({
      title: "Texture Removed",
      description: "Texture overlay has been removed from your design.",
    });
  }, [canvas, onHistoryAction, toast]);

  // Handle custom texture upload
  const handleCustomTextureUpload = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
    const maxSize = 5 * 1024 * 1024; // 5MB limit for textures

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, WebP, or BMP image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a texture smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      const customTexture: TextureData = {
        name: file.name.split('.')[0],
        description: "Custom uploaded texture",
        imageUrl: imageData,
        type: 'custom',
        blendMode: 'multiply',
        opacity: 0.3
      };
      
      setCustomTextures(prev => [...prev, customTexture]);
      
      toast({
        title: "Texture Uploaded",
        description: `${customTexture.name} texture has been added.`,
      });
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleCustomTextureUpload(files[0]);
    }
  }, [handleCustomTextureUpload]);

  const allTextures = [...defaultTextures, ...customTextures];

  return (
    <div className="space-y-3">
      {/* Apply Texture Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full text-xs"
        data-testid="button-apply-texture"
      >
        <Palette className="w-3 h-3 mr-1" />
        Apply Texture
      </Button>

      {/* Active Texture Display */}
      {activeTexture && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300">
                Active: {activeTexture.name}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {activeTexture.description}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={removeTexture}
              className="h-6 w-6 p-0 text-blue-700 hover:text-blue-900 dark:text-blue-300"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Texture Selection Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Palette className="h-5 w-5 mr-2" />
              Apply Texture
            </DialogTitle>
            <DialogDescription>
              Choose a texture to overlay on your rug design. Textures blend subtly with your colors.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Default Textures */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Default Textures</Label>
              <div className="grid grid-cols-1 gap-2">
                {defaultTextures.map((texture) => (
                  <button
                    key={texture.type}
                    onClick={() => applyTexture(texture)}
                    disabled={isLoading}
                    className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded border mr-3 flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{texture.name}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{texture.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Textures */}
            {customTextures.length > 0 && (
              <div>
                <Label className="text-sm font-medium mb-2 block">Custom Textures</Label>
                <div className="grid grid-cols-1 gap-2">
                  {customTextures.map((texture, index) => (
                    <button
                      key={index}
                      onClick={() => applyTexture(texture)}
                      disabled={isLoading}
                      className="flex items-center p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <div className="w-10 h-10 rounded border mr-3 overflow-hidden">
                        <img 
                          src={texture.imageUrl} 
                          alt={texture.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{texture.name}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{texture.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Custom Texture */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Upload Custom Texture</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.bmp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Texture Image
              </Button>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                JPG, PNG, WebP, or BMP up to 5MB
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Applying texture...</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}