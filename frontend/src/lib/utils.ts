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
  New: 'bg-emerald-500/20 text-emerald-300',
  Active: 'bg-blue-500/20 text-blue-300',
  Disabled: 'bg-red-500/20 text-red-300',
};

export const CLIENT_TYPE_COLORS: Record<string, string> = {
  Blaster: 'bg-orange-500/20 text-orange-300',
  Reseller: 'bg-violet-500/20 text-violet-300',
  Owner: 'bg-emerald-500/20 text-emerald-300',
};
