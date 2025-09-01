import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, ExternalLink } from 'lucide-react';
import { useImageUpload, ImageUploadOptions } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadOptions: ImageUploadOptions;
  preview?: boolean;
  previewClassName?: string;
  placeholder?: string;
  description?: string;
  allowUrlInput?: boolean;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  id,
  label,
  value,
  onChange,
  uploadOptions,
  preview = true,
  previewClassName,
  placeholder,
  description,
  allowUrlInput = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const { uploadImage, uploading } = useImageUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const uploadedUrl = await uploadImage(file, uploadOptions);
    if (uploadedUrl) {
      onChange(uploadedUrl);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    onChange(urlInput);
    setIsUrlMode(false);
  };

  const handleClearImage = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      
      {!isUrlMode ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload
                </>
              )}
            </Button>
            
            {allowUrlInput && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsUrlMode(true);
                  setUrlInput(value);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            
            {value && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={placeholder || "https://exemplo.com/imagem.jpg"}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
            >
              OK
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUrlMode(false);
                setUrlInput(value);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      )}
      
      {preview && value && (
        <div className="mt-2">
          <img 
            src={value} 
            alt="Prévia" 
            className={cn(
              "border rounded object-cover",
              previewClassName || "w-16 h-16"
            )}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};