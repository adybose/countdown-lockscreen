import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { shareJson } from './share';

/** Writes the export JSON and hands it to the share sheet (native) or downloads it (web). */
export async function writeAndShareExport(json: string, fileName: string): Promise<boolean> {
  if (Platform.OS === 'web') return downloadOnWeb(json, fileName);
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  await file.write(json);
  return shareJson(file.uri);
}

function downloadOnWeb(text: string, fileName: string): boolean {
  const g = globalThis as unknown as {
    document?: { createElement(tag: string): { href: string; download: string; click(): void } };
    URL?: { createObjectURL(b: unknown): string; revokeObjectURL(u: string): void };
    Blob?: new (parts: string[], opts: { type: string }) => unknown;
  };
  if (!g.document || !g.URL || !g.Blob) return false;
  const url = g.URL.createObjectURL(new g.Blob([text], { type: 'application/json' }));
  const a = g.document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => g.URL?.revokeObjectURL(url), 1000);
  return true;
}

/** Lets the user pick a JSON file and returns its text, or null when cancelled. */
export async function pickImportFile(): Promise<string | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: ['application/json', 'text/plain', '*/*'], copyToCacheDirectory: true });
  if (res.canceled || res.assets.length === 0) return null;
  const asset = res.assets[0];
  if (Platform.OS === 'web' && asset.file) return asset.file.text();
  return new File(asset.uri).text();
}
