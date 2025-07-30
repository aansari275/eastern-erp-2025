import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  onImageUpload?: (imageData: string, fileName: string) => void;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an image file.",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onImageUpload?.(imageData, file.name);
        setIsUploading(false);
        toast({
          title: "Image Uploaded",
          description: `${file.name} has been uploaded successfully.`,
        });
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Failed to read the image file.",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "An error occurred while uploading the image.",
      });
    }
  }, [onImageUpload, toast]);

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileInput(e as any);
    input.click();
  }, [handleFileInput]);

  return (
    <div className="p-4 border-t border-slate-200 dark:border-slate-700" data-testid="image-uploader">
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary/40 dark:hover:border-primary/50'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        data-testid="drop-zone"
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-primary mb-2 animate-spin" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Processing...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Drop images here</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">or click to browse</p>
          </div>
        )}
      </div>
    </div>
  );
}
