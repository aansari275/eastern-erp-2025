import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  Zap, 
  Settings, 
  Crop, 
  Palette,
  RotateCcw,
  Shuffle,
  X,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import * as fabric from "fabric";
import { vectorizeImage, addVectorizedObjectToCanvas, extractColorsFromFabricObject } from "@/utils/vectorization";
import { useToast } from "@/hooks/use-toast";

interface RugUploadRefinerProps {
  onVectorizeComplete?: (vectorizedObject: fabric.Object, colors: ColorWithLayer[]) => void;
  onClose?: () => void;
  canvas?: fabric.Canvas | null;
}

type RugShape = 'rectangle' | 'round' | 'square' | 'runner';
type LayerType = 'normal' | 'high' | 'low';

interface ColorWithLayer {
  hex: string;
  layer: LayerType;
}

interface CropSettings {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function RugUploadRefiner({ onVectorizeComplete, onClose, canvas }: RugUploadRefinerProps) {
  // Step tracking
  const [currentStep, setCurrentStep] = useState<'upload' | 'shape' | 'size' | 'crop' | 'colors' | 'complete'>('upload');
  
  // Upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  
  // Shape & Size settings
  const [rugShape, setRugShape] = useState<RugShape>('rectangle');
  const [rugWidth, setRugWidth] = useState<number>(200);
  const [rugHeight, setRugHeight] = useState<number>(150);
  
  // Crop settings
  const [cropSettings, setCropSettings] = useState<CropSettings>({ x: 0, y: 0, width: 100, height: 100 });
  const [autoRemoveBackground, setAutoRemoveBackground] = useState<boolean>(true);
  const [backgroundTolerance, setBackgroundTolerance] = useState<number>(30);
  
  // Color settings
  const [colorCount, setColorCount] = useState<number>(6);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Toast for user feedback
  const { toast } = useToast();

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setSelectedImage(imageData);
        setCurrentStep('shape');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Process to next step
  const handleShapeConfirm = useCallback(() => {
    setCurrentStep('size');
  }, []);

  const handleSizeConfirm = useCallback(() => {
    setCurrentStep('crop');
  }, []);

  const handleCropConfirm = useCallback(() => {
    setCurrentStep('colors');
  }, []);

  // Main vectorization process - now using the same logic as auto-vectorize
  const handleExtractAndVectorize = useCallback(async () => {
    if (!selectedImage || !canvas) return;
    
    setIsProcessing(true);
    setCurrentStep('complete');
    
    try {
      toast({
        title: "Processing Image",
        description: "Starting auto-vectorization with shape settings...",
      });

      // Create a temporary image for processing
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = selectedImage;
      });

      // Create a temporary canvas for cropping and background removal
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Apply shape mask based on rug shape
      const maskRadius = Math.min(rugWidth, rugHeight) / 2;
      tempCanvas.width = rugWidth;
      tempCanvas.height = rugHeight;

      // Create clipping path based on shape
      ctx.save();
      switch (rugShape) {
        case 'round':
          ctx.beginPath();
          ctx.arc(rugWidth / 2, rugHeight / 2, maskRadius, 0, 2 * Math.PI);
          ctx.clip();
          break;
        case 'runner':
          const runnerRadius = Math.min(rugWidth, rugHeight) * 0.1;
          ctx.beginPath();
          ctx.roundRect(0, 0, rugWidth, rugHeight, runnerRadius);
          ctx.clip();
          break;
        case 'square':
        case 'rectangle':
        default:
          // No special clipping needed for rectangle/square
          break;
      }

      // Draw the image with crop settings
      const sourceX = (img.width * cropSettings.x) / 100;
      const sourceY = (img.height * cropSettings.y) / 100;
      const sourceWidth = (img.width * cropSettings.width) / 100;
      const sourceHeight = (img.height * cropSettings.height) / 100;
      
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, rugWidth, rugHeight
      );
      ctx.restore();

      // Background removal if enabled
      if (autoRemoveBackground) {
        const imageData = ctx.getImageData(0, 0, rugWidth, rugHeight);
        const data = imageData.data;
        const tolerance = backgroundTolerance / 100 * 255;
        
        // Sample corner pixels to determine background color
        const cornerSamples = [
          { r: data[0], g: data[1], b: data[2] }, // top-left
          { r: data[(rugWidth - 1) * 4], g: data[(rugWidth - 1) * 4 + 1], b: data[(rugWidth - 1) * 4 + 2] }, // top-right
          { r: data[(rugHeight - 1) * rugWidth * 4], g: data[(rugHeight - 1) * rugWidth * 4 + 1], b: data[(rugHeight - 1) * rugWidth * 4 + 2] }, // bottom-left
        ];
        
        const avgBg = {
          r: cornerSamples.reduce((sum, s) => sum + s.r, 0) / cornerSamples.length,
          g: cornerSamples.reduce((sum, s) => sum + s.g, 0) / cornerSamples.length,
          b: cornerSamples.reduce((sum, s) => sum + s.b, 0) / cornerSamples.length,
        };

        // Remove background pixels
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const distance = Math.sqrt(
            Math.pow(r - avgBg.r, 2) + 
            Math.pow(g - avgBg.g, 2) + 
            Math.pow(b - avgBg.b, 2)
          );
          
          if (distance < tolerance) {
            data[i + 3] = 0; // Make transparent
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
      }

      // Convert processed canvas to data URL for vectorization
      const processedImageData = tempCanvas.toDataURL();

      // Use the same vectorization utility as the working auto-vectorize flow
      const { vectorizedObject, extractedColors } = await vectorizeImage(processedImageData, {
        colorCount,
        maxSize: 800,
        timeout: 10000
      });

      // Add to canvas with proper scaling and positioning (clears canvas first)
      addVectorizedObjectToCanvas(canvas, vectorizedObject, true);

      toast({
        title: "Vectorization Complete",
        description: `Successfully converted to editable vector with ${extractedColors.length} colors`,
      });

      // Convert to ColorWithLayer format for callback
      const colorsWithLayers: ColorWithLayer[] = extractedColors.map(hex => ({
        hex,
        layer: 'normal' as LayerType
      }));
      
      // Callback with results
      onVectorizeComplete?.(vectorizedObject, colorsWithLayers);
      
    } catch (error) {
      console.error('Vectorization error:', error);
      toast({
        variant: "destructive",
        title: "Vectorization Failed",
        description: "Could not process the image. Please try again.",
      });
      
      // Fallback: add image directly if vectorization fails
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
          
          canvas.clear();
          canvas.add(fabricImage);
          canvas.renderAll();
        });
      }
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, canvas, rugShape, rugWidth, rugHeight, cropSettings, autoRemoveBackground, backgroundTolerance, colorCount, onVectorizeComplete, toast]);

  // Reset to start
  const handleReset = useCallback(() => {
    setCurrentStep('upload');
    setSelectedImage(null);
    setImageFileName('');
    setCropSettings({ x: 0, y: 0, width: 100, height: 100 });
  }, []);

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Rug Upload & Refiner
        </h3>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <div className="space-y-4">
          <div className="text-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              <Zap className="h-4 w-4 mr-1" />
              Upload Rug Design (Auto Vectorize)
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.bmp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* Step 2: Shape Selection */}
      {currentStep === 'shape' && selectedImage && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Select Rug Shape:</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'rectangle', label: 'Rectangle' },
                { value: 'round', label: 'Round' },
                { value: 'square', label: 'Square' },
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
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Back
            </Button>
            <Button size="sm" onClick={handleShapeConfirm}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Size Settings */}
      {currentStep === 'size' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Enter Rug Size:</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400">Width (cm)</Label>
                <Input
                  type="number"
                  value={rugWidth}
                  onChange={(e) => setRugWidth(Number(e.target.value))}
                  className="text-sm"
                  min="50"
                  max="500"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400">Height (cm)</Label>
                <Input
                  type="number"
                  value={rugHeight}
                  onChange={(e) => setRugHeight(Number(e.target.value))}
                  className="text-sm"
                  min="50"
                  max="500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep('shape')}>
              Back
            </Button>
            <Button size="sm" onClick={handleSizeConfirm}>
              Continue to Cropping
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Crop & Background Settings */}
      {currentStep === 'crop' && selectedImage && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center">
              <Crop className="h-4 w-4 mr-1" />
              Crop & Mask Background
            </Label>
            
            {/* Image preview with crop overlay */}
            <div className="relative bg-slate-100 dark:bg-slate-700 rounded-lg p-2 mb-3">
              <img 
                src={selectedImage} 
                alt="Crop preview"
                className="w-full h-32 object-contain rounded"
                style={{
                  clipPath: rugShape === 'round' 
                    ? 'circle(50% at 50% 50%)' 
                    : rugShape === 'runner'
                    ? 'inset(0 round 10px)'
                    : 'none'
                }}
              />
            </div>

            {/* Crop controls */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto-bg-remove"
                  checked={autoRemoveBackground}
                  onCheckedChange={(checked) => setAutoRemoveBackground(!!checked)}
                />
                <Label htmlFor="auto-bg-remove" className="text-xs">
                  Auto Remove Background
                </Label>
              </div>
              
              {autoRemoveBackground && (
                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                    Background Tolerance: {backgroundTolerance}%
                  </Label>
                  <Slider
                    value={[backgroundTolerance]}
                    onValueChange={(value) => setBackgroundTolerance(value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep('size')}>
              Back
            </Button>
            <Button size="sm" onClick={handleCropConfirm}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Color Settings */}
      {currentStep === 'colors' && (
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block flex items-center">
              <Palette className="h-4 w-4 mr-1" />
              Color Extraction Settings
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-slate-600 dark:text-slate-400 mb-1 block">
                  How many colors to extract?
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
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentStep('crop')}>
              Back
            </Button>
            <Button 
              size="sm" 
              onClick={handleExtractAndVectorize}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Zap className="h-3 w-3 mr-1" />
              {isProcessing ? 'Processing...' : 'Extract & Vectorize'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 6: Complete */}
      {currentStep === 'complete' && (
        <div className="space-y-4 text-center">
          {isProcessing ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Vectorizing your rug design...
              </p>
            </div>
          ) : (
            <div>
              <div className="text-green-600 dark:text-green-400 mb-2">
                <Zap className="h-8 w-8 mx-auto" />
              </div>
              <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                Vectorization Complete!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Your rug design has been processed and added to the canvas.
                Use the color palette on the right to edit colors.
              </p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Upload Another Design
                </Button>
                {onClose && (
                  <Button
                    size="sm"
                    onClick={onClose}
                    className="w-full"
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}