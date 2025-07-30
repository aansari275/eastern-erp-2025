import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Upload, Palette, Loader2, Eye, EyeOff, ImageIcon, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore - imagetracerjs types
import * as ImageTracer from "imagetracerjs";

interface ImageVectorizerProps {
  onVectorGenerated?: (svgData: string, colors: string[]) => void;
  canvas?: any; // Fabric.js canvas instance
  currentUploadedImage?: any; // Current uploaded image for streamlined workflow
}

export function ImageVectorizer({ onVectorGenerated, canvas, currentUploadedImage }: ImageVectorizerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [vectorizedSvg, setVectorizedSvg] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [colorCount, setColorCount] = useState([8]);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload a valid image file (JPG, PNG, etc.)",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setOriginalImage(imageData);
      setVectorizedSvg(null);
      setExtractedColors([]);
      setShowComparison(false);
    };
    reader.readAsDataURL(file);
  };

  const extractDominantColors = (img: HTMLImageElement): Promise<string[]> => {
    return new Promise((resolve) => {
      try {
        // Ensure image is loaded and create a small canvas for color extraction
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = 100;
        canvas.height = 100;
        ctx.drawImage(img, 0, 0, 100, 100);
        
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;
        const colorCounts: { [key: string]: number } = {};
        
        // Sample pixels and count colors
        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha > 128) { // Only count non-transparent pixels
            // Quantize colors to reduce similar colors
            const qR = Math.floor(r / 32) * 32;
            const qG = Math.floor(g / 32) * 32;
            const qB = Math.floor(b / 32) * 32;
            const colorKey = `${qR},${qG},${qB}`;
            colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
          }
        }
        
        // Get most common colors
        const sortedColors = Object.entries(colorCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, colorCount[0])
          .map(([color]) => {
            const [r, g, b] = color.split(',').map(Number);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          });
        
        resolve(sortedColors.length > 0 ? sortedColors : ['#000000', '#ffffff']);
      } catch (error) {
        console.error('Color extraction failed:', error);
        // Fallback colors
        resolve(['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00']);
      }
    });
  };

  const vectorizeImage = async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    
    try {
      // Create image element for processing
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = originalImage;
      });

      // Extract dominant colors
      const colors = await extractDominantColors(img);
      setExtractedColors(colors);

      // Create canvas for image processing with reasonable size limits
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      // Limit image size for performance while maintaining aspect ratio
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Configure ImageTracer options with tighter thresholds for crisp vectorization
      const options = {
        numberofcolors: colorCount[0],
        colorsampling: true,
        scale: 1,
        threshold: 128, // Adjust based on image contrast
        simplifytolerance: 0.1, // Simplified paths for cleaner output
        roundcoords: 1,
        ltres: 1.0, // Tighter line threshold for crisp outlines
        qtres: 1,
        pathomit: 0.1, // Helps eliminate speckles and tiny fragments
        blurradius: 0,
        blurdelta: 20,
        linefilter: true, // Enable line filtering for smoother paths
        specklefilter: true, // Remove small artifacts
        colorquantcycles: 3,
        layering: 0,
        strokewidth: 1,
        linefilter_strength: 0.1, // Stronger line filtering
        mincolorratio: 0.05, // Filter out very small color regions
        desc: false,
        viewbox: false
      };

      // Use ImageTracer with performance optimizations
      let svgString: string;
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Add timeout to prevent long processing times
        const tracerPromise = new Promise<string>((resolve, reject) => {
          try {
            const result = ImageTracer.imagedataToSVG(imageData, options);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Vectorization timeout')), 10000);
        });
        
        svgString = await Promise.race([tracerPromise, timeoutPromise]);
      } catch (tracerError) {
        console.warn('ImageTracer failed, using custom algorithm:', tracerError);
        svgString = createVectorizedSVG(canvas, colors);
      }

      // Clean up the SVG and add interactive regions
      const processedSvg = processSvgForInteractivity(svgString, colors);
      setVectorizedSvg(processedSvg);
      setShowComparison(true);

      toast({
        title: "Vectorization Complete",
        description: `Successfully converted image to SVG with ${colors.length} colors`,
      });

      onVectorGenerated?.(processedSvg, colors);

    } catch (error) {
      console.error('Vectorization failed:', error);
      toast({
        variant: "destructive",
        title: "Vectorization Failed", 
        description: "Could not process the image. Please try with a different image.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processSvgForInteractivity = (svgString: string, colors: string[]): string => {
    try {
      // Parse SVG to properly group and clean paths
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      
      if (!svgElement) return svgString;
      
      // Ensure proper SVG attributes
      if (!svgElement.hasAttribute('xmlns')) {
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }
      
      // Group paths by color for better interaction
      const colorGroups: { [color: string]: Element[] } = {};
      const paths = svgElement.querySelectorAll('path');
      
      paths.forEach(path => {
        const fill = path.getAttribute('fill') || '#000000';
        if (!colorGroups[fill]) {
          colorGroups[fill] = [];
        }
        colorGroups[fill].push(path);
      });
      
      // Remove tiny disconnected fragments (paths with very small area)
      Object.values(colorGroups).forEach(group => {
        group.forEach(path => {
          const d = path.getAttribute('d') || '';
          // Remove paths with very short path data (likely small artifacts)
          if (d.length < 20) {
            path.remove();
          }
        });
      });
      
      // Add interaction attributes to remaining paths
      colors.forEach((color, index) => {
        const groupPaths = colorGroups[color] || [];
        groupPaths.forEach(path => {
          if (path.parentNode) { // Ensure path wasn't removed
            path.setAttribute('data-color-index', index.toString());
            path.setAttribute('class', 'vectorized-region');
            path.setAttribute('style', 'cursor: pointer; transition: opacity 0.2s ease;');
            
            // Add hover effects
            path.addEventListener('mouseenter', () => {
              path.setAttribute('opacity', '0.8');
            });
            path.addEventListener('mouseleave', () => {
              path.setAttribute('opacity', '1');
            });
          }
        });
      });
      
      // Return cleaned SVG
      return new XMLSerializer().serializeToString(svgElement);
      
    } catch (error) {
      console.warn('SVG post-processing failed, using original:', error);
      return svgString;
    }
  };

  const createVectorizedSVG = (canvas: HTMLCanvasElement, colors: string[]): string => {
    const width = canvas.width;
    const height = canvas.height;
    
    // Create a simple posterized SVG
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
    
    // Create color regions based on adaptive grid
    const gridSize = Math.max(4, Math.min(width, height) / 20);
    
    const ctx = canvas.getContext('2d')!;
    
    for (let y = 0; y < height; y += gridSize) {
      for (let x = 0; x < width; x += gridSize) {
        const actualWidth = Math.min(gridSize, width - x);
        const actualHeight = Math.min(gridSize, height - y);
        
        if (actualWidth <= 0 || actualHeight <= 0) continue;
        
        // Sample multiple pixels from the region for better color representation
        const samples: number[][] = [];
        const sampleCount = Math.min(9, Math.floor(actualWidth * actualHeight / 4));
        
        for (let i = 0; i < sampleCount; i++) {
          const sampleX = x + Math.floor(Math.random() * actualWidth);
          const sampleY = y + Math.floor(Math.random() * actualHeight);
          
          try {
            const imageData = ctx.getImageData(sampleX, sampleY, 1, 1);
            const data = Array.from(imageData.data);
            const [r, g, b, a] = data;
            if (a > 128) { // Only count non-transparent pixels
              samples.push([r, g, b]);
            }
          } catch (e) {
            // Skip invalid coordinates
          }
        }
        
        if (samples.length === 0) continue;
        
        // Average the samples
        const avgR = Math.round(samples.reduce((sum, sample) => sum + sample[0], 0) / samples.length);
        const avgG = Math.round(samples.reduce((sum, sample) => sum + sample[1], 0) / samples.length);
        const avgB = Math.round(samples.reduce((sum, sample) => sum + sample[2], 0) / samples.length);
        
        // Find closest color from palette
        let closestColor = colors[0] || '#000000';
        let minDistance = Infinity;
        
        colors.forEach(color => {
          const [cr, cg, cb] = hexToRgb(color);
          const distance = Math.sqrt((avgR-cr)**2 + (avgG-cg)**2 + (avgB-cb)**2);
          if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
          }
        });
        
        svgContent += `<rect x="${x}" y="${y}" width="${actualWidth}" height="${actualHeight}" fill="${closestColor}" class="vectorized-region" style="cursor: pointer;" data-color="${closestColor}" />`;
      }
    }
    
    svgContent += '</svg>';
    return svgContent;
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileUpload(e as any);
    input.click();
  };

  const handleVectorizeUploadedImage = async () => {
    if (!currentUploadedImage) return;
    
    const imageData = (currentUploadedImage as any).userData?.originalImageData;
    if (!imageData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not find original image data for vectorization",
      });
      return;
    }
    
    setOriginalImage(imageData);
    vectorizeImage();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Upload className="h-5 w-5 mr-2 text-blue-500" />
          Upload & Vectorize
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div className="space-y-3">
          {!currentUploadedImage ? (
            <Button
              onClick={handleUploadClick}
              variant="outline"
              className="w-full"
              disabled={isProcessing}
              data-testid="button-upload-vectorize"
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Image to Vectorize
            </Button>
          ) : (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Image ready for vectorization
                  </span>
                </div>
                <Button
                  onClick={handleVectorizeUploadedImage}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isProcessing}
                  data-testid="button-vectorize-uploaded"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3 w-3 mr-1" />
                      Vectorize
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {originalImage && (
            <div className="space-y-3">
              {/* Color Count Slider */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Color Count: {colorCount[0]}
                </label>
                <Slider
                  value={colorCount}
                  onValueChange={setColorCount}
                  min={6}
                  max={12}
                  step={1}
                  className="w-full"
                  data-testid="slider-color-count"
                />
              </div>

              {/* Vectorize Button */}
              <Button
                onClick={vectorizeImage}
                disabled={isProcessing}
                className="w-full bg-blue-500 hover:bg-blue-600"
                data-testid="button-process-vectorize"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Vectorize Image
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Color Palette */}
        {extractedColors.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Extracted Colors:</label>
            <div className="flex flex-wrap gap-2">
              {extractedColors.map((color, index) => (
                <div
                  key={index}
                  className="w-8 h-8 rounded border-2 border-slate-200 dark:border-slate-600"
                  style={{ backgroundColor: color }}
                  title={color}
                  data-testid={`color-swatch-${index}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Comparison View */}
        {originalImage && vectorizedSvg && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Preview:</label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
                data-testid="button-toggle-comparison"
              >
                {showComparison ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide Original
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Compare
                  </>
                )}
              </Button>
            </div>

            <div className={`grid gap-4 ${showComparison ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {showComparison && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">Original</p>
                  <img
                    src={originalImage}
                    alt="Original"
                    className="w-full h-32 object-cover rounded border"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {showComparison ? 'Vectorized' : 'Result'}
                </p>
                <div
                  className="w-full h-32 bg-white rounded border flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: vectorizedSvg }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}