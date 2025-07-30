import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { 
  Upload, 
  Zap, 
  X,
  FileImage,
  Settings,
  ArrowRight,
  Loader2
} from "lucide-react";
import * as fabric from "fabric";
import { vectorizeImage, addVectorizedObjectToCanvas } from "@/utils/vectorization";
import { useToast } from "@/hooks/use-toast";

interface FinalRugUploaderProps {
  onVectorizeComplete?: (vectorizedObject: fabric.Object, colors: ColorWithLayer[]) => void;
  canvas?: fabric.Canvas | null;
}

type RugShape = 'rectangle' | 'square' | 'round' | 'runner';
type Unit = 'cm' | 'ft';
type LayerType = 'normal' | 'high' | 'low';

interface ColorWithLayer {
  hex: string;
  layer: LayerType;
}

export function FinalRugUploader({ onVectorizeComplete, canvas }: FinalRugUploaderProps) {
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Shape & Size settings
  const [rugShape, setRugShape] = useState<RugShape>('rectangle');
  const [rugWidth, setRugWidth] = useState<number>(200);
  const [rugHeight, setRugHeight] = useState<number>(150);
  const [unit, setUnit] = useState<Unit>('cm');
  
  // Color settings
  const [colorMode, setColorMode] = useState<string>('auto');
  const [customColorCount, setCustomColorCount] = useState<number>(6);
  
  // Upload state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Toast for user feedback
  const { toast } = useToast();

  // Auto-lock aspect ratio for square and round
  useEffect(() => {
    if (rugShape === 'square' || rugShape === 'round') {
      setRugHeight(rugWidth);
    }
  }, [rugShape, rugWidth]);

  // Update canvas when dimensions or shape change
  useEffect(() => {
    if (canvas && isOpen) {
      updateCanvasSize();
    }
  }, [rugWidth, rugHeight, rugShape, unit, canvas, isOpen]);

  // Close modal when clicking outside (but not during processing)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && !isProcessing) {
        setIsOpen(false);
      }
    };

    if (isOpen && !isProcessing) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (!isProcessing) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [isOpen, isProcessing]);

  // Unit conversion utilities
  const cmToFt = (cm: number) => Math.round((cm / 30.48) * 100) / 100;
  const ftToCm = (ft: number) => Math.round(ft * 30.48);

  // Handle unit change with conversion
  const handleUnitChange = useCallback((newUnit: Unit) => {
    if (newUnit === unit) return;
    
    if (newUnit === 'ft') {
      setRugWidth(cmToFt(rugWidth));
      setRugHeight(cmToFt(rugHeight));
    } else {
      setRugWidth(ftToCm(rugWidth));
      setRugHeight(ftToCm(rugHeight));
    }
    setUnit(newUnit);
  }, [unit, rugWidth, rugHeight, cmToFt, ftToCm]);

  // Handle shape change
  const handleShapeChange = useCallback((shape: RugShape) => {
    setRugShape(shape);
    if (shape === 'square' || shape === 'round') {
      setRugHeight(rugWidth);
    }
  }, [rugWidth]);

  // Update canvas size based on rug dimensions
  const updateCanvasSize = useCallback(() => {
    if (!canvas || !canvas.lowerCanvasEl) return;
    
    // Convert to pixels (approximate conversion for display)
    const pixelsPerUnit = unit === 'cm' ? 3.78 : 115; // pixels per cm/ft
    const canvasWidth = Math.max(800, rugWidth * pixelsPerUnit);
    const canvasHeight = Math.max(600, rugHeight * pixelsPerUnit);
    
    canvas.setDimensions({
      width: canvasWidth,
      height: canvasHeight
    });
    
    canvas.renderAll();
  }, [canvas, rugWidth, rugHeight, unit]);

  // Validate file type and size
  const validateFile = useCallback((file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'];
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, WebP, or BMP image.",
        variant: "destructive",
      });
      return false;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB.",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  }, [toast]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) return;
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setSelectedImage(imageData);
      setImagePreview(imageData);
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Validation function
  const validateInputs = useCallback(() => {
    const errors: string[] = [];
    
    if (!selectedImage) errors.push("Please upload an image");
    if (!rugWidth || rugWidth <= 0) errors.push("Please set a valid width");
    if (!rugHeight || rugHeight <= 0) errors.push("Please set a valid height");
    if (!rugShape) errors.push("Please select a shape");
    if (!colorMode) errors.push("Please select color extraction mode");
    
    return errors;
  }, [selectedImage, rugWidth, rugHeight, rugShape, colorMode]);

  // Main processing function with enhanced error handling
  const handleProcessImage = useCallback(async (imageData: string) => {
    if (!canvas) throw new Error("Canvas not available");
    
    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageData;
      });

      // Calculate dimensions based on shape
      let finalWidth = rugWidth;
      let finalHeight = rugHeight;
      
      if (rugShape === 'square' || rugShape === 'round') {
        finalHeight = rugWidth;
      }

      // Create processing canvas
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      const scale = 2; // High resolution
      tempCanvas.width = finalWidth * scale;
      tempCanvas.height = finalHeight * scale;

      // Apply shape masking
      ctx.save();
      switch (rugShape) {
        case 'round':
          const radius = Math.min(tempCanvas.width, tempCanvas.height) / 2;
          ctx.beginPath();
          ctx.arc(tempCanvas.width / 2, tempCanvas.height / 2, radius, 0, 2 * Math.PI);
          ctx.clip();
          break;
        case 'runner':
          const cornerRadius = Math.min(tempCanvas.width, tempCanvas.height) * 0.15;
          ctx.beginPath();
          ctx.roundRect(0, 0, tempCanvas.width, tempCanvas.height, cornerRadius);
          ctx.clip();
          break;
        default:
          // Rectangle and square - no special clipping
          break;
      }

      // Draw image with proper scaling
      const imageAspect = img.width / img.height;
      const canvasAspect = tempCanvas.width / tempCanvas.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imageAspect > canvasAspect) {
        drawHeight = tempCanvas.height;
        drawWidth = drawHeight * imageAspect;
        drawX = (tempCanvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        drawWidth = tempCanvas.width;
        drawHeight = drawWidth / imageAspect;
        drawX = 0;
        drawY = (tempCanvas.height - drawHeight) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      const processedImageData = tempCanvas.toDataURL();

      // Determine color count
      let colorCount = 6;
      if (colorMode !== 'auto') {
        colorCount = customColorCount;
      }

      // Use the same vectorization utility as the working auto-vectorize flow
      console.log('Starting vectorization process...');
      const { vectorizedObject, extractedColors } = await vectorizeImage(processedImageData, {
        colorCount,
        maxSize: 800,
        timeout: 10000
      });
      console.log('Vectorization completed successfully', { vectorizedObject, extractedColors });

      // Update canvas size
      updateCanvasSize();

      // Add to canvas with proper scaling and positioning (clears canvas first)
      if (canvas && canvas.lowerCanvasEl) {
        console.log('Canvas is valid, adding vectorized object:', { canvas, vectorizedObject });
        addVectorizedObjectToCanvas(canvas, vectorizedObject, true);
        console.log('Object added to canvas, current objects count:', canvas.getObjects().length);
        canvas.renderAll();
        console.log('Canvas rendered');
      } else {
        console.error('Canvas is not valid:', { canvas, hasLowerCanvas: canvas?.lowerCanvasEl });
      }

      // Convert to ColorWithLayer format for callback
      const colorsWithLayers: ColorWithLayer[] = extractedColors.map(hex => ({
        hex,
        layer: 'normal' as LayerType
      }));
      
      // Callback with results
      onVectorizeComplete?.(vectorizedObject, colorsWithLayers);
      
    } catch (error) {
      console.error('Vectorization error:', error);
      // Fallback: add image directly
      if (imageData && canvas && canvas.lowerCanvasEl) {
        fabric.FabricImage.fromURL(imageData).then((fabricImage) => {
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
  }, [canvas, rugShape, rugWidth, rugHeight, colorMode, customColorCount, updateCanvasSize, onVectorizeComplete, unit]);

  // Handle "Let's Go" button with comprehensive validation and loading
  const handleLetsGo = useCallback(async () => {
    if (!canvas || !selectedImage) return;
    
    // Validate all inputs
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      console.error("Validation errors:", validationErrors);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      await handleProcessImage(selectedImage);
      // Only close modal after successful processing
      setTimeout(() => {
        setIsOpen(false);
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error("Processing error:", error);
      setIsProcessing(false);
      // Don't close modal on error
    }
  }, [selectedImage, canvas, validateInputs]);

  // Reset modal state when opening
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      setSelectedImage(null);
      setFileName('');
      setImagePreview(null);
      setIsProcessing(false);
    }
  }, []);

  // Check if ready to proceed
  const isReadyToProceed = selectedImage && rugWidth > 0 && rugHeight > 0 && rugShape && colorMode;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
          size="lg"
        >
          <Upload className="h-4 w-4 mr-2" />
          <Zap className="h-4 w-4 mr-1" />
          Upload Rug Design (Auto Vectorize + Refine)
        </Button>
      </DialogTrigger>

      <DialogContent 
        ref={modalRef}
        className="max-w-lg animate-in fade-in-0 zoom-in-95 duration-300"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Rug Upload Settings
          </DialogTitle>
          <DialogDescription>
            Configure your rug design settings before uploading and vectorizing your image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Processing Status Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Processing your rug...
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Hang tight! We're making magic happen…
                  </p>
                  <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                    <span>• Vectorizing image</span>
                    <span>• Extracting colors</span>
                    <span>• Resizing canvas</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Shape & Size */}
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">1. Choose Shape & Size</Label>
                
                {/* Unit Toggle */}
                <div className="flex items-center space-x-2">
                  <Label className="text-xs text-slate-600 dark:text-slate-400">Unit:</Label>
                  <Select value={unit} onValueChange={(value: Unit) => handleUnitChange(value)}>
                    <SelectTrigger className="w-16 h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cm">cm</SelectItem>
                      <SelectItem value="ft">ft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Shape Selection with Animation */}
              <div className="relative bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-4">
                <div className="grid grid-cols-4 gap-1 relative">
                  {/* Animated Background Pill */}
                  <div 
                    className="absolute inset-y-1 bg-white dark:bg-slate-700 rounded-md shadow-sm transition-transform duration-200 ease-out"
                    style={{
                      transform: `translateX(${
                        ['rectangle', 'square', 'round', 'runner'].indexOf(rugShape) * 100
                      }%)`,
                      width: 'calc(25% - 2px)'
                    }}
                  />
                  
                  {[
                    { value: 'rectangle', label: 'Rectangle' },
                    { value: 'square', label: 'Square' },
                    { value: 'round', label: 'Round' },
                    { value: 'runner', label: 'Runner' },
                  ].map((shape) => (
                    <button
                      key={shape.value}
                      onClick={() => handleShapeChange(shape.value as RugShape)}
                      className={`relative z-10 px-2 py-2 text-xs font-medium rounded-md transition-colors duration-200 ${
                        rugShape === shape.value 
                          ? 'text-slate-900 dark:text-slate-100' 
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Inputs with Smooth Transitions */}
              <div className="space-y-3">
                <Label className="text-xs text-slate-600 dark:text-slate-400">
                  Rug Size ({unit}):
                </Label>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">
                      {rugShape === 'round' ? 'Diameter' : 'Width'}
                    </Label>
                    <Input
                      type="number"
                      value={rugWidth}
                      onChange={(e) => setRugWidth(Number(e.target.value))}
                      className="text-sm transition-all duration-200"
                      min={unit === 'cm' ? "50" : "1.5"}
                      max={unit === 'cm' ? "500" : "16"}
                      step={unit === 'cm' ? "1" : "0.1"}
                    />
                  </div>
                  
                  <div className={`transition-all duration-300 ${
                    rugShape === 'square' || rugShape === 'round' 
                      ? 'opacity-30 pointer-events-none' 
                      : 'opacity-100'
                  }`}>
                    <Label className="text-xs">Height</Label>
                    <Input
                      type="number"
                      value={rugHeight}
                      onChange={(e) => setRugHeight(Number(e.target.value))}
                      className="text-sm transition-all duration-200"
                      min={unit === 'cm' ? "50" : "1.5"}
                      max={unit === 'cm' ? "500" : "16"}
                      step={unit === 'cm' ? "1" : "0.1"}
                      disabled={rugShape === 'square' || rugShape === 'round'}
                    />
                  </div>
                </div>
                
                {(rugShape === 'square' || rugShape === 'round') && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 animate-in fade-in duration-300">
                    {rugShape === 'square' ? 'Square' : 'Round'} rugs have equal width and height
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Color Extraction */}
          <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
            <Label className="text-sm font-medium block">2. Color Extraction Options</Label>
            <Select value={colorMode} onValueChange={setColorMode}>
              <SelectTrigger className="transition-all duration-200 hover:border-blue-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Smart Detection)</SelectItem>
                {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} colors
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {colorMode !== 'auto' && (
              <div className="hidden">
                {(() => {
                  const count = Number(colorMode);
                  if (count && customColorCount !== count) {
                    setCustomColorCount(count);
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          {/* Section 3: Upload Image */}
          <div className="space-y-3 animate-in slide-in-from-top-6 duration-700">
            <Label className="text-sm font-medium block">3. Upload Image</Label>
            
            <div
              ref={dropzoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                isDragOver 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                  : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.bmp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {selectedImage ? (
                <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-500">
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden border-2 border-green-200 dark:border-green-700">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <FileImage className="h-6 w-6 mx-auto text-green-600" />
                    <p className="text-sm font-medium text-green-600">{fileName}</p>
                    <p className="text-xs text-slate-600">Image uploaded successfully</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-8 w-8 mx-auto text-slate-400" />
                  <div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Select Image File
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Drag & drop or click to upload<br />
                    Supports .jpg, .png, .webp, .bmp
                  </p>
                </div>
              )}
            </div>
            
            {colorMode !== 'auto' && (
              <div className="hidden">
                {/* Store custom color count for non-auto mode */}
                {(() => {
                  const count = Number(colorMode);
                  if (count && customColorCount !== count) {
                    setCustomColorCount(count);
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          {/* Let's Go Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              onClick={handleLetsGo}
              disabled={!isReadyToProceed || isProcessing}
              className={`w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all duration-300 ${
                isReadyToProceed ? 'hover:scale-105' : 'opacity-50'
              }`}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Let's Go!
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            
            {!isReadyToProceed && (
              <p className="text-xs text-slate-500 text-center mt-2">
                Please upload an image and set dimensions to continue
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}