/** Web-only: triggers a browser download for a data/blob URI. Returns false off the web. */
export function downloadUri(uri: string, fileName: string): boolean {
  const g = globalThis as unknown as {
    document?: { createElement(tag: string): { href: string; download: string; click(): void } };
  };
  if (!g.document) return false;
  const a = g.document.createElement('a');
  a.href = uri;
  a.download = fileName;
  a.click();
  return true;
}
