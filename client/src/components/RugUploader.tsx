import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Upload, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Lock,
  Unlock,
  Palette,
  RotateCcw,
  Shuffle,
  X,
  Settings,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import * as fabric from "fabric";
import { vectorizeImage, addVectorizedObjectToCanvas } from "@/utils/vectorization";
import { useToast } from "@/hooks/use-toast";

interface RugUploaderProps {
  onVectorizeComplete?: (vectorizedObject: fabric.Object, colors: ColorWithLayer[]) => void;
  canvas?: fabric.Canvas | null;
}

type RugShape = 'rectangle' | 'round' | 'square' | 'runner';
type LayerType = 'normal' | 'high' | 'low';

interface ColorWithLayer {
  hex: string;
  layer: LayerType;
}

export function RugUploader({ onVectorizeComplete, canvas }: RugUploaderProps) {
  // Main state
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Shape & Size settings
  const [rugShape, setRugShape] = useState<RugShape>('rectangle');
  const [rugWidth, setRugWidth] = useState<number>(200);
  const [rugHeight, setRugHeight] = useState<number>(150);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(200/150);
  
  // Color settings
  const [colorCount, setColorCount] = useState<number>(6);
  const [extractedColors, setExtractedColors] = useState<ColorWithLayer[]>([]);
  const [originalColors, setOriginalColors] = useState<ColorWithLayer[]>([]);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Toast for user feedback
  const { toast } = useToast();

  // Update aspect ratio when dimensions change
  useEffect(() => {
    if (rugWidth > 0 && rugHeight > 0) {
      setAspectRatio(rugWidth / rugHeight);
    }
  }, [rugWidth, rugHeight]);

  // Handle width change with aspect ratio lock
  const handleWidthChange = useCallback((value: number) => {
    setRugWidth(value);
    if (lockAspectRatio && value > 0) {
      setRugHeight(Math.round(value / aspectRatio));
    }
  }, [lockAspectRatio, aspectRatio]);

  // Handle height change with aspect ratio lock
  const handleHeightChange = useCallback((value: number) => {
    setRugHeight(value);
    if (lockAspectRatio && value > 0) {
      setRugWidth(Math.round(value * aspectRatio));
    }
  }, [lockAspectRatio, aspectRatio]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setSelectedImage(imageData);
        handleRefineAndVectorize(imageData);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Main processing function
  const handleRefineAndVectorize = useCallback(async (imageData: string) => {
    if (!canvas) return;
    
    setIsProcessing(true);
    
    try {
      // Create image element for processing
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      // Create temporary canvas for shape masking and processing
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Set canvas size based on rug dimensions
      const resolutionScale = 2; // Higher resolution for better vectorization
      tempCanvas.width = rugWidth * resolutionScale;
      tempCanvas.height = rugHeight * resolutionScale;

      // Apply shape mask
      ctx.save();
      switch (rugShape) {
        case 'round':
          const radius = Math.min(tempCanvas.width, tempCanvas.height) / 2;
          ctx.beginPath();
          ctx.arc(tempCanvas.width / 2, tempCanvas.height / 2, radius, 0, 2 * Math.PI);
          ctx.clip();
          break;
        case 'runner':
          const cornerRadius = Math.min(tempCanvas.width, tempCanvas.height) * 0.1;
          ctx.beginPath();
          ctx.roundRect(0, 0, tempCanvas.width, tempCanvas.height, cornerRadius);
          ctx.clip();
          break;
        case 'square':
        case 'rectangle':
        default:
          // No clipping needed for rectangle/square
          break;
      }

      // Draw image scaled to fit canvas
      const imageAspect = img.width / img.height;
      const canvasAspect = tempCanvas.width / tempCanvas.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imageAspect > canvasAspect) {
        // Image is wider, fit to height
        drawHeight = tempCanvas.height;
        drawWidth = drawHeight * imageAspect;
        drawX = (tempCanvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        // Image is taller, fit to width
        drawWidth = tempCanvas.width;
        drawHeight = drawWidth / imageAspect;
        drawX = 0;
        drawY = (tempCanvas.height - drawHeight) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      // Convert to data URL for vectorization
      const processedImageData = tempCanvas.toDataURL();

      // Use the same vectorization utility as the working auto-vectorize flow
      const { vectorizedObject, extractedColors } = await vectorizeImage(processedImageData, {
        colorCount,
        maxSize: 800,
        timeout: 10000
      });

      // Add to canvas with proper scaling and positioning (does not clear canvas)
      addVectorizedObjectToCanvas(canvas, vectorizedObject, false);

      // Convert to ColorWithLayer format
      const colorsWithLayers: ColorWithLayer[] = extractedColors.map(hex => ({
        hex,
        layer: 'normal' as LayerType
      }));

      // Update state
      setExtractedColors(colorsWithLayers);
      setOriginalColors([...colorsWithLayers]);

      toast({
        title: "Vectorization Complete",
        description: `Successfully converted to editable vector with ${extractedColors.length} colors`,
      });

      // Callback with results
      onVectorizeComplete?.(vectorizedObject, colorsWithLayers);
      
    } catch (error) {
      console.error('Vectorization error:', error);
      toast({
        variant: "destructive",
        title: "Vectorization Failed",
        description: "Could not process the image. Please try again.",
      });
      
      // Fallback: add image directly to canvas
      if (selectedImage && canvas) {
        fabric.FabricImage.fromURL(selectedImage).then((fabricImage) => {
          const fallbackScale = Math.min(
            (canvas.width! * 0.6) / fabricImage.width!,
            (canvas.height! * 0.6) / fabricImage.height!
          );
          
          fabricImage.set({
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            originX: 'center',
            originY: 'center',
            scaleX: fallbackScale,
            scaleY: fallbackScale,
          });
          
          canvas.add(fabricImage);
          canvas.renderAll();
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [canvas, rugShape, rugWidth, rugHeight, colorCount, selectedImage, onVectorizeComplete, toast]);

  // Color manipulation functions
  const handleColorChange = useCallback((oldColor: string, newColor: string) => {
    if (!canvas) return;
    
    canvas.getObjects().forEach((obj: any) => {
      if (obj.fill === oldColor) {
        obj.set('fill', newColor);
      }
      if (obj.type === 'group' && obj.getObjects) {
        obj.getObjects().forEach((subObj: any) => {
          if (subObj.fill === oldColor) {
            subObj.set('fill', newColor);
          }
        });
      }
    });
    
    canvas.renderAll();
    setExtractedColors(prev => prev.map(c => c.hex === oldColor ? { ...c, hex: newColor } : c));
  }, [canvas]);

  const handleRemoveColor = useCallback((colorToRemove: string) => {
    if (extractedColors.length <= 2) return; // Minimum 2 colors
    
    const remainingColors = extractedColors.filter(c => c.hex !== colorToRemove);
    const nearestColor = remainingColors[0]?.hex; // Simple fallback
    
    if (nearestColor) {
      handleColorChange(colorToRemove, nearestColor);
      setExtractedColors(remainingColors);
    }
  }, [extractedColors, handleColorChange]);

  const handleShuffleColors = useCallback(() => {
    if (extractedColors.length < 2) return;
    
    const shuffled = [...extractedColors].sort(() => Math.random() - 0.5);
    const colorMapping = extractedColors.reduce((acc, colorObj, index) => {
      acc[colorObj.hex] = shuffled[index].hex;
      return acc;
    }, {} as Record<string, string>);
    
    Object.entries(colorMapping).forEach(([oldColor, newColor]) => {
      handleColorChange(oldColor, newColor);
    });
  }, [extractedColors, handleColorChange]);

  const handleResetColors = useCallback(() => {
    originalColors.forEach((originalColorObj, index) => {
      if (extractedColors[index]) {
        handleColorChange(extractedColors[index].hex, originalColorObj.hex);
      }
    });
    setExtractedColors([...originalColors]);
  }, [originalColors, extractedColors, handleColorChange]);

  // Layer assignment function
  const handleLayerChange = useCallback((colorHex: string, newLayer: LayerType) => {
    if (!canvas) return;

    // Update the color state
    setExtractedColors(prev => 
      prev.map(colorObj => 
        colorObj.hex === colorHex 
          ? { ...colorObj, layer: newLayer }
          : colorObj
      )
    );

    // Apply visual effects to canvas objects with this color
    const allObjects = canvas.getObjects();
    allObjects.forEach((obj: any) => {
      const applyLayerEffect = (fabricObj: any) => {
        if (fabricObj.fill === colorHex) {
          // Remove existing shadow effects
          fabricObj.set({
            shadow: null,
            opacity: 1
          });

          // Apply layer-specific effects
          try {
            switch (newLayer) {
              case 'high':
                fabricObj.set({
                  shadow: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    blur: 8,
                    offsetX: 0,
                    offsetY: 0
                  }
                });
                break;
              case 'low':
                fabricObj.set({
                  shadow: {
                    color: 'rgba(0, 0, 0, 0.4)',
                    blur: 4,
                    offsetX: 2,
                    offsetY: 2
                  },
                  opacity: 0.85
                });
                break;
              case 'normal':
              default:
                // No additional effects
                break;
            }
          } catch (error) {
            console.warn('Failed to apply layer effect:', error);
          }
        }
      };

      if (obj.type === 'group' && obj.getObjects) {
        obj.getObjects().forEach(applyLayerEffect);
      } else {
        applyLayerEffect(obj);
      }
    });

    canvas.renderAll();
  }, [canvas]);

  // Get preview style based on shape
  const getPreviewStyle = useCallback(() => {
    const baseStyle = {
      width: `${Math.min(rugWidth / 3, 120)}px`,
      height: `${Math.min(rugHeight / 3, 90)}px`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
    };

    switch (rugShape) {
      case 'round':
        return { ...baseStyle, borderRadius: '50%' };
      case 'runner':
        return { ...baseStyle, borderRadius: '8px' };
      case 'square':
      case 'rectangle':
      default:
        return { ...baseStyle, borderRadius: '4px' };
    }
  }, [rugShape, rugWidth, rugHeight, selectedImage]);

  return (
    <div className="w-full space-y-4">
      {/* Shape Preview */}
      <div className="flex justify-center mb-4">
        <div 
          ref={previewRef}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
          style={getPreviewStyle()}
        />
      </div>

      {/* Main Upload Button */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            size="lg"
            disabled={isProcessing}
          >
            <Upload className="h-4 w-4 mr-2" />
            <Zap className="h-4 w-4 mr-1" />
            Upload Rug Design (Auto Vectorize + Refiner)
            {isExpanded ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
          {/* Shape Selector */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Rug Shape:</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'rectangle', label: 'Rectangle' },
                { value: 'square', label: 'Square' },
                { value: 'round', label: 'Round' },
                { value: 'runner', label: 'Runner' },
              ].map((shape) => (
                <Button
                  key={shape.value}
                  variant={rugShape === shape.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRugShape(shape.value as RugShape)}
                  className="text-xs"
                >
                  {shape.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Size Settings */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Rug Size (cm):</Label>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Width</Label>
                  <Input
                    type="number"
                    value={rugWidth}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    className="text-sm"
                    min="50"
                    max="500"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Height</Label>
                  <Input
                    type="number"
                    value={rugHeight}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    className="text-sm"
                    min="50"
                    max="500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lock-aspect"
                  checked={lockAspectRatio}
                  onCheckedChange={(checked) => setLockAspectRatio(!!checked)}
                />
                <Label htmlFor="lock-aspect" className="text-xs flex items-center">
                  {lockAspectRatio ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                  Lock Aspect Ratio
                </Label>
              </div>
            </div>
          </div>

          {/* Color Extraction */}
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center">
              <Palette className="h-4 w-4 mr-1" />
              Color Extraction:
            </Label>
            <Select value={colorCount.toString()} onValueChange={(value) => setColorCount(Number(value))}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} colors
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.bmp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              disabled={isProcessing}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Select Image File'}
            </Button>
          </div>

          {/* Color Controls */}
          {extractedColors.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Label className="text-sm font-medium block">
                Extracted Colors ({extractedColors.length}):
              </Label>
              
              {/* Vertical column layout for colors */}
              <div className="space-y-2">
                {extractedColors.map((colorObj, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 dark:border-slate-600">
                    {/* Color swatch */}
                    <div className="relative group">
                      <div
                        className="w-8 h-8 rounded border-2 border-slate-300 dark:border-slate-600 cursor-pointer"
                        style={{ backgroundColor: colorObj.hex }}
                        title={colorObj.hex}
                      />
                      {extractedColors.length > 2 && (
                        <button
                          onClick={() => handleRemoveColor(colorObj.hex)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    
                    {/* Color hex code */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-mono flex-1">
                      {colorObj.hex}
                    </div>
                    
                    {/* Layer dropdown */}
                    <div className="flex items-center gap-2">
                      <Select 
                        value={colorObj.layer} 
                        onValueChange={(value) => handleLayerChange(colorObj.hex, value as LayerType)}
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high" className="text-xs">
                            ↑ High
                          </SelectItem>
                          <SelectItem value="normal" className="text-xs">
                            — Normal
                          </SelectItem>
                          <SelectItem value="low" className="text-xs">
                            ↓ Low
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Layer indicator icon */}
                      <div className="text-slate-500 dark:text-slate-400">
                        {colorObj.layer === 'high' && <ArrowUp className="h-3 w-3" />}
                        {colorObj.layer === 'normal' && <Minus className="h-3 w-3" />}
                        {colorObj.layer === 'low' && <ArrowDown className="h-3 w-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleShuffleColors}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Shuffle className="h-3 w-3 mr-1" />
                  Shuffle
                </Button>
                <Button
                  onClick={handleResetColors}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}