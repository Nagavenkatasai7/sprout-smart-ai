import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X, Leaf } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  selectedImage?: string;
  onClearImage?: () => void;
}

export const ImageUpload = ({ onImageSelect, selectedImage, onClearImage }: ImageUploadProps) => {
  const { toast } = useToast();
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 10MB",
          variant: "destructive",
        });
        return;
      }
      
      const previewUrl = URL.createObjectURL(file);
      onImageSelect(file, previewUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "Ready for plant identification",
      });
    }
  }, [onImageSelect, toast]);

  const { getRootProps, getInputProps, isDragReject } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024
  });

  const handleCameraClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const previewUrl = URL.createObjectURL(file);
        onImageSelect(file, previewUrl);
      }
    };
    input.click();
  };

  if (selectedImage) {
    return (
      <Card className="relative overflow-hidden bg-gradient-card shadow-soft border-primary/20 animate-scale-in">
        <div className="aspect-square relative">
          <img 
            src={selectedImage} 
            alt="Selected plant" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {onClearImage && (
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full"
              onClick={onClearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="p-4 bg-gradient-card">
          <div className="flex items-center gap-2 text-primary">
            <Leaf className="h-4 w-4" />
            <span className="text-sm font-medium">Ready for identification</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      {...getRootProps()}
      className={`
        relative overflow-hidden cursor-pointer transition-all duration-300 
        bg-gradient-card border-2 border-dashed
        ${isDragActive ? 'border-primary shadow-upload scale-[1.02]' : 'border-border hover:border-primary/50'}
        ${isDragReject ? 'border-destructive' : ''}
        hover:shadow-soft
      `}
    >
      <input {...getInputProps()} />
      
      <div className="p-12 text-center space-y-6">
        <div className={`
          w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center
          transition-transform duration-300
          ${isDragActive ? 'scale-110' : 'hover:scale-105'}
        `}>
          <Upload className="h-8 w-8 text-primary-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Upload Plant Photo
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Drag and drop your plant image here, or click to browse files
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto border-primary/20 hover:bg-primary/5"
            onClick={(e) => {
              e.stopPropagation();
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              fileInput?.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose File
          </Button>
          
          <Button 
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleCameraClick();
            }}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Supports JPG, PNG, WebP up to 10MB
        </p>
      </div>
    </Card>
  );
};