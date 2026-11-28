export function isHubOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const configured = process.env.APP_ORIGIN;
  if (configured) return origin === new URL(configured).origin;

  // The public Host header may differ from Next's internally reconstructed URL.
  const host = request.headers.get("host");
  if (!host) return origin === new URL(request.url).origin;
  try {
    const address = new URL(origin);
    return origin === address.origin && address.host === host &&
      (address.protocol === "https:" || process.env.NODE_ENV === "development");
  } catch {
    return false;
  }
}
