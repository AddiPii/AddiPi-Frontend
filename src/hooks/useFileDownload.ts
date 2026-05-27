import { useState } from 'react';

interface UseFileDownloadReturn {
  downloadFile: (fileUrl: string, fileName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const useFileDownload = (): UseFileDownloadReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (fileUrl: string, fileName: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(fileUrl);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Nieznany błąd';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadFile, isLoading, error };
};

export default useFileDownload;