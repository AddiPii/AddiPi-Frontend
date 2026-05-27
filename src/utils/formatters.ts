import { formatDistanceToNow } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import i18n from '../i18n/config';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatDate(date: string | Date): string {
  const intlLocale = i18n?.language === 'en' ? 'en-US' : 'pl-PL';
  return new Date(date).toLocaleString(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Warsaw',
  });
}

// Normalize date string - fix various date format issues
function normalizeDateString(dateString: string): string {
  if (!dateString) return dateString;
  
  let normalized = dateString.trim();
  
  // Fix comma separator in milliseconds: "2025-12-05T04:48:22,984Z" -> "2025-12-05T04:48:22.984Z"
  normalized = normalized.replace(/,(\d{3})(Z?)$/, '.$1$2');
  
  // Keep timestamps without an explicit timezone as local wall time.
  if (/T\d{2}:\d{2}:\d{2}\.\d{3}$/.test(normalized)) {
    return normalized;
  }

  // Handle format without milliseconds: "2025-12-05T04:49" -> "2025-12-05T04:49:00.000"
  if (/T\d{2}:\d{2}$/.test(normalized)) {
    normalized += ':00.000';
  }
  
  // Handle format with seconds but no milliseconds: "2025-12-05T04:49:00" -> "2025-12-05T04:49:00.000"
  if (/T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
    normalized += '.000';
  }
  
  return normalized;
}

// Safe date formatting - handles invalid dates gracefully
export function formatDateSafe(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const normalized = normalizeDateString(dateString);
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return 'Invalid date';
    const dfnsLocale = i18n?.language === 'en' ? enUS : pl;
    return formatDistanceToNow(date, { addSuffix: true, locale: dfnsLocale });
  } catch {
    return dateString;
  }
}

export function formatDateTimeSafe(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const normalized = normalizeDateString(dateString);
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return 'Invalid date';
    const intlLocale = i18n?.language === 'en' ? 'en-US' : 'pl-PL';
    return date.toLocaleString(intlLocale, { timeZone: 'Europe/Warsaw' });
  } catch {
    return dateString;
  }
}
