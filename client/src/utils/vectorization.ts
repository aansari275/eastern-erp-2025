import * as fabric from "fabric";
// @ts-ignore - ImageTracer types not available
import ImageTracer from "imagetracerjs";

export interface VectorizationOptions {
  colorCount?: number;
  maxSize?: number;
  timeout?: number;
}

export interface VectorizationResult {
  vectorizedObject: fabric.Object;
  extractedColors: string[];
  svgString: string;
}

/**
 * Extracts dominant colors from an image
 */
export const extractDominantColors = (img: HTMLImageElement, colorCount: number = 8): Promise<string[]> => {
  return new Promise((resolve) => {
    try {
      // Create a small canvas for color extraction
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
        .slice(0, colorCount)
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

/**
 * Processes SVG for better interactivity and color region grouping
 */
export const processSvgForInteractivity = (svgString: string, colors: string[]): string => {
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

/**
 * Creates a simple vectorized SVG as fallback when ImageTracer fails
 */
const createVectorizedSVG = (canvas: HTMLCanvasElement, colors: string[]): string => {
  const width = canvas.width;
  const height = canvas.height;
  
  // Create a simple posterized SVG
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
  
  // Create color regions based on adaptive grid
  const gridSize = Math.max(4, Math.min(width, height) / 20);
  
  const ctx = canvas.getContext('2d')!;
  
  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };
  
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

/**
 * Vectorizes an image and returns a fabric object ready to be added to canvas
 */
export const vectorizeImage = async (
  imageData: string, 
  options: VectorizationOptions = {}
): Promise<VectorizationResult> => {
  const {
    colorCount = 8,
    maxSize = 800,
    timeout = 10000
  } = options;

  // Create image element for processing
  const img = new Image();
  img.crossOrigin = "anonymous";
  
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = imageData;
  });

  // Extract dominant colors first
  const extractedColors = await extractDominantColors(img, colorCount);

  // Create canvas for image processing with reasonable size limits
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Limit image size for performance while maintaining aspect ratio
  let { width, height } = img;
  
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // Configure ImageTracer options for textile-like output
  const tracerOptions = {
    numberofcolors: colorCount,
    mincolorratio: 0.02,
    colorsampling: 1,
    scale: 1,
    simplifytolerance: 0,
    roundcoords: 1,
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    blurradius: 0,
    blurdelta: 20,
    linefilter: false,
    specklefilter: true,
    colorquantcycles: 3,
    layering: 0,
    strokewidth: 1,
    linefilter_strength: 0.01,
    desc: false,
    viewbox: false
  };

  // Skip ImageTracer for now and use direct image conversion
  console.log('Skipping ImageTracer, using direct image conversion...');
  let svgString: string;
  
  // For now, create a simple SVG with the image embedded
  const imageDataUrl = canvas.toDataURL();
  svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">
    <image href="${imageDataUrl}" x="0" y="0" width="${canvas.width}" height="${canvas.height}"/>
  </svg>`;

  // For embedded images, skip the SVG processing and use the raw SVG
  const processedSvg = svgString;

  // Convert SVG to fabric object
  console.log('Converting SVG to fabric object...');
  const result = await fabric.loadSVGFromString(processedSvg);
  console.log('SVG loaded, result:', result);
  
  const objects = result.objects.filter(obj => obj !== null);
  console.log('Filtered objects:', objects, 'count:', objects.length);
  
  if (!objects || objects.length === 0) {
    console.error('No valid objects created from SVG');
    throw new Error('Failed to create vectorized object');
  }

  let vectorizedObject: fabric.Object;
  if (objects.length === 1) {
    vectorizedObject = objects[0];
    console.log('Single object created:', vectorizedObject);
  } else {
    vectorizedObject = new fabric.Group(objects as fabric.Object[], {
      interactive: true,
      subTargetCheck: true,
    });
    console.log('Group object created:', vectorizedObject, 'with', objects.length, 'children');
  }

  return {
    vectorizedObject,
    extractedColors,
    svgString: processedSvg
  };
};

/**
 * Adds vectorized object to canvas with proper scaling and positioning
 */
export const addVectorizedObjectToCanvas = (
  canvas: fabric.Canvas,
  vectorizedObject: fabric.Object,
  clearCanvas: boolean = false
) => {
  console.log('addVectorizedObjectToCanvas called:', { canvas, vectorizedObject, clearCanvas });
  
  if (clearCanvas) {
    console.log('Clearing canvas');
    canvas.clear();
  }

  // Calculate scale to fit SVG within canvas bounds while maintaining aspect ratio
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const objWidth = vectorizedObject.width || 1;
  const objHeight = vectorizedObject.height || 1;
  
  console.log('Canvas dimensions:', { canvasWidth, canvasHeight });
  console.log('Object dimensions:', { objWidth, objHeight });
  
  const scaleX = (canvasWidth * 0.9) / objWidth;
  const scaleY = (canvasHeight * 0.9) / objHeight;
  const scale = Math.min(scaleX, scaleY, 1);
  
  console.log('Calculated scale:', { scaleX, scaleY, finalScale: scale });

  vectorizedObject.set({
    left: canvasWidth / 2,
    top: canvasHeight / 2,
    originX: 'center',
    originY: 'center',
    scaleX: scale,
    scaleY: scale,
    selectable: true,
    evented: true,
    hasControls: true,
    hasBorders: true,
  });

  console.log('Adding object to canvas:', vectorizedObject);
  canvas.add(vectorizedObject);
  console.log('Objects on canvas after add:', canvas.getObjects().length);
  canvas.renderAll();
  console.log('Canvas render complete');
  
  return vectorizedObject;
};

/**
 * Extracts colors from a fabric object or group
 */
export const extractColorsFromFabricObject = (obj: fabric.Object): string[] => {
  const colorSet = new Set<string>();
  
  const extractColorsFromObject = (object: fabric.Object) => {
    if (object.fill && typeof object.fill === 'string') {
      colorSet.add(object.fill);
    }
    if (object.stroke && typeof object.stroke === 'string') {
      colorSet.add(object.stroke);
    }
  };

  if (obj.type === 'group') {
    (obj as fabric.Group).getObjects().forEach(extractColorsFromObject);
  } else {
    extractColorsFromObject(obj);
  }
  
  return Array.from(colorSet);
};