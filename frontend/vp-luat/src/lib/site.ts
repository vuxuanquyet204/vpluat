export function getSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) {
    return 'https://vuplat.vn';
  }

  return configuredUrl.endsWith('/') ? configuredUrl.slice(0, -1) : configuredUrl;
}

export function buildAbsoluteUrl(pathname: string): string {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
