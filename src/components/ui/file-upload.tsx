
import { useState, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileChange: (file: File | null) => void;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileChange,
  acceptedFileTypes = "image/*",
  maxSizeMB = 5,
  className,
  ...props
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      setError(null);
      onFileChange(null);
      return;
    }
    
    // Validate file type
    if (!selectedFile.type.match(acceptedFileTypes.replace(/\*/g, "."))) {
      setError(`Please select a valid file type (${acceptedFileTypes})`);
      return;
    }
    
    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }
    
    setError(null);
    setFile(selectedFile);
    onFileChange(selectedFile);
    
    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    onFileChange(null);
    
    // Reset the file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {!file && (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center",
            error ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-primary bg-gray-50",
            "transition-colors cursor-pointer"
          )}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={cn("w-10 h-10 mb-3", error ? "text-red-400" : "text-gray-400")} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <Text>Click to select a file, or drop it here</Text>
          <Text size="sm" variant="muted" className="mt-1">
            Max size: {maxSizeMB}MB
          </Text>
          {error && <Text size="sm" className="mt-2 text-red-500">{error}</Text>}
        </div>
      )}
      
      {preview && (
        <div className="relative border rounded-lg overflow-hidden">
          <img 
            src={preview} 
            alt="File preview" 
            className="w-full h-auto max-h-64 object-contain" 
          />
          <Button 
            variant="destructive" 
            size="sm" 
            className="absolute top-2 right-2"
            onClick={handleRemoveFile}
          >
            Remove
          </Button>
        </div>
      )}
      
      {file && !preview && (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
          <div className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-blue-500 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <Text className="font-medium">{file.name}</Text>
              <Text size="sm" variant="muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRemoveFile}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>
      )}
      
      <input
        id="file-upload"
        type="file"
        accept={acceptedFileTypes}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
