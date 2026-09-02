function normalizeOrigin(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getConfiguredSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  return configured ? new URL(normalizeOrigin(configured)) : undefined;
}

export function getPublicOrigin(request: Request) {
  const configured = getConfiguredSiteUrl();
  if (configured) return configured.origin;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  if (host) {
    const forwardedProtocol = request.headers.get("x-forwarded-proto");
    const requestProtocol = new URL(request.url).protocol.replace(":", "");
    const protocol = forwardedProtocol || requestProtocol;
    return `${protocol}://${host}`;
  }

  return new URL(request.url).origin;
}
