import React, { useRef } from 'react';
import { Upload, FileImage, X } from 'lucide-react';

interface UploadCaseProps {
  onUpload: (file: File) => void;
  selectedFile: File | null;
  onRemoveFile: () => void;
  isUploading: boolean;
}

export default function UploadCase({ onUpload, selectedFile, onRemoveFile, isUploading }: UploadCaseProps) {
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileImage className="h-5 w-5 text-blue-600" />
        Subir Radiografía Dental
      </h2>

      {selectedFile ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <FileImage className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{selectedFile.name}</span>
              <span className="text-xs text-blue-700">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
            {!isUploading && (
              <button
                onClick={onRemoveFile}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex justify-center">
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Radiografía seleccionada"
              className="max-h-64 rounded-lg border border-gray-200"
            />
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Arrastra y suelta tu radiografía aquí
          </h3>
          <p className="text-gray-600 mb-4">
            O haz clic para seleccionar un archivo
          </p>
          <p className="text-sm text-gray-500">
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