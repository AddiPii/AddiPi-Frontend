import { useState, } from 'react';
import { CheckCircle, Upload, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.toLowerCase().endsWith('.gcode')) {
      toast.error('Tylko pliki .gcode są akceptowane');
      return;
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      toast.error('Plik jest za duży. Maksymalny rozmiar to 50MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Wybierz plik do przesłania');
      return;
    }

    setUploading(true);
    try {
      let scheduledDate: string | undefined;
      
      if (scheduledAt) {
        const date = new Date(scheduledAt);
        scheduledDate = date.toISOString();
      }

      await api.uploadFile(file, scheduledDate);
      
      toast.success(scheduledAt 
        ? 'Plik został przesłany i zaplanowany' 
        : 'Plik został przesłany i dodany do kolejki'
      );
      
      setFile(null);
      setScheduledAt('');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Nie udało się przesłać pliku');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload & Print</h1>
        <p className="text-gray-600 mt-2">Prześlij plik G-code do druku</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : file
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <CheckCircle className="mx-auto text-green-600" size={48} />
              <div>
                <p className="text-lg font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600 mt-1">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Wybierz inny plik
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="mx-auto text-gray-400" size={48} />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Przeciągnij i upuść plik G-code
                </p>
                <p className="text-sm text-gray-600 mt-1">lub</p>
              </div>
              <label className="inline-block">
                <span className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors">
                  Wybierz plik
                </span>
                <input
                  type="file"
                  accept=".gcode"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500">Maksymalny rozmiar: 50MB</p>
            </div>
          )}
        </div>

        {/* Scheduling */}
        <div className="mt-6 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-4">
            <Calendar className="text-gray-600 mr-2" size={20} />
            <h3 className="font-semibold text-gray-900">Zaplanuj druk (opcjonalnie)</h3>
          </div>
          
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-700 mb-1 block">Data i godzina rozpoczęcia</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={getMinDateTime()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>
            
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                Jeśli nie wybierzesz daty, druk zostanie dodany do kolejki i rozpocznie się, gdy drukarka będzie wolna.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => {
              setFile(null);
              setScheduledAt('');
            }}
            disabled={!file && !scheduledAt}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Wyczyść
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Przesyłanie...
              </>
            ) : (
              <>
                <Upload size={20} className="mr-2" />
                {scheduledAt ? 'Zaplanuj druk' : 'Prześlij i drukuj'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Akceptowane formaty</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Pliki G-code (.gcode)</li>
            <li>• Maksymalny rozmiar: 50MB</li>
            <li>• Kodowanie: UTF-8</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Jak to działa?</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>1. Wybierz plik G-code</li>
            <li>2. Opcjonalnie zaplanuj czas druku</li>
            <li>3. Kliknij "Prześlij i drukuj"</li>
            <li>4. Śledź postęp w dashboardzie</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
