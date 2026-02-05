import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Upload, Calendar, AlertCircle, FileCode, Info } from 'lucide-react';
import { api } from '../services/api.js';
import toast from 'react-hot-toast';

export default function UploadPage() {
  const { t } = useTranslation();
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
      toast.error(t('upload.errorGcodeOnly'));
      return;
    }

    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error(t('upload.errorFileSize'));
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
      toast.error(t('upload.errorSelectFile'));
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
        ? t('upload.successScheduled')
        : t('upload.successQueued')
      );
      
      setFile(null);
      setScheduledAt('');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || t('upload.errorUpload'));
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('upload.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('upload.subtitle')}</p>
      </div>

      {/* Upload Area */}
      <div className="bg-card rounded-xl border border-border p-8">
        <div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? 'border-primary bg-primary/5'
              : file
              ? 'border-primary/50 bg-primary/5'
              : 'border-border hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl border border-primary/20">
                <CheckCircle className="text-primary" size={32} />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {t('upload.selectAnother')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-2xl border border-border">
                <Upload className="text-muted-foreground" size={32} />
              </div>
              <div>
                <p className="text-lg font-medium text-foreground">
                  {t('upload.dragDrop')}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{t('upload.or')}</p>
              </div>
              <label className="inline-block">
                <span className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium cursor-pointer hover:bg-primary/90 transition-colors">
                  {t('upload.selectFile')}
                </span>
                <input
                  type="file"
                  accept=".gcode"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-muted-foreground">{t('upload.maxSize')}</p>
            </div>
          )}
        </div>

        {/* Scheduling */}
        <div className="mt-6 p-6 bg-secondary/50 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-secondary rounded-lg border border-border">
              <Calendar className="text-muted-foreground" size={18} />
            </div>
            <h3 className="font-semibold text-foreground">{t('upload.schedulePrint')}</h3>
          </div>
          
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-foreground mb-2 block">{t('upload.startDateTime')}</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={getMinDateTime()}
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
              />
            </label>
            
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <p>{t('upload.scheduleNote')}</p>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => {
              setFile(null);
              setScheduledAt('');
            }}
            disabled={!file && !scheduledAt}
            className="px-6 py-2.5 text-foreground bg-secondary rounded-lg font-medium hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-border"
          >
            {t('upload.clear')}
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('upload.uploading')}
              </>
            ) : (
              <>
                <Upload size={18} />
                {scheduledAt ? t('upload.schedulePrintBtn') : t('upload.uploadAndPrint')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <FileCode className="text-primary" size={18} />
            </div>
            <h3 className="font-semibold text-foreground">{t('upload.acceptedFormats')}</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t('upload.formats.gcode')}
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t('upload.formats.maxSize')}
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              {t('upload.formats.encoding')}
            </li>
          </ul>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Info className="text-primary" size={18} />
            </div>
            <h3 className="font-semibold text-foreground">{t('upload.howItWorks')}</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-secondary text-foreground text-xs flex items-center justify-center font-medium">1</span>
              {t('upload.steps.step1')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-secondary text-foreground text-xs flex items-center justify-center font-medium">2</span>
              {t('upload.steps.step2')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-secondary text-foreground text-xs flex items-center justify-center font-medium">3</span>
              {t('upload.steps.step3')}
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-secondary text-foreground text-xs flex items-center justify-center font-medium">4</span>
              {t('upload.steps.step4')}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
