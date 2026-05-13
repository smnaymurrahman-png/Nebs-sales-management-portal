export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(url: string): string {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : '';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  user: 'User',
};

export const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 border border-purple-200',
  admin: 'bg-blue-100 text-blue-700 border border-blue-200',
  user: 'bg-gray-100 text-gray-600 border border-gray-200',
};

export const FB_STATUS_COLORS: Record<string, string> = {
  New: 'bg-gray-100 text-gray-600',
  Active: 'bg-blue-50 text-blue-700',
  Disabled: 'bg-red-50 text-red-600',
};

export const CLIENT_TYPE_COLORS: Record<string, string> = {
  Blaster: 'bg-orange-50 text-orange-700',
  Reseller: 'bg-violet-50 text-violet-700',
  Owner: 'bg-emerald-50 text-emerald-700',
};
