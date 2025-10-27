import React, { useRef } from 'react';
import { Upload, FileImage, X } from 'lucide-react';

interface UploadCaseProps {
  onUpload: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
  isUploading: boolean;
}

export default function UploadCase({
  onUpload,
  selectedFile,
  onRemoveFile,
  isUploading,
}: UploadCaseProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      onUpload(file);
    } else {
      alert('Por favor selecciona una imagen válida (JPEG, PNG o WebP)');
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp')) {
      onUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="bg-[#D6E6F2] border border-[#E0E0E0] rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-[#034C7D] mb-4 flex items-center gap-2">
        <FileImage className="h-5 w-5 text-[#76C7F3]" />
        Subir Radiografía Dental
      </h2>

      {selectedFile ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#BDE0F7] rounded-lg">
            <div className="flex items-center gap-3">
              <FileImage className="h-5 w-5 text-[#034C7D]" />
              <span className="text-sm font-medium text-[#034C7D]">{selectedFile.name}</span>
              <span className="text-xs text-[#034C7D]">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            {!isUploading && (
              <button
                onClick={onRemoveFile}
                className="text-[#034C7D] hover:text-[#034C7D]/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex justify-center">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Radiografía seleccionada"
              className="max-h-64 rounded-lg border border-[#E0E0E0]"
            />
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-[#E0E0E0] rounded-lg p-8 text-center hover:border-[#76C7F3] transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-[#76C7F3] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#034C7D] mb-2">
            Arrastra y suelta tu radiografía aquí
          </h3>
          <p className="text-[#034C7D] mb-4">O haz clic para seleccionar un archivo</p>
          <p className="text-sm text-[#034C7D]/80">
            Formatos soportados: JPEG, PNG, WebP (máx. 10MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
