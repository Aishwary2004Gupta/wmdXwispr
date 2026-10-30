export type CategoryId =
  | "images"
  | "documents"
  | "spreadsheets"
  | "presentations"
  | "videos"
  | "audio"
  | "archives"
  | "code"
  | "installers"
  | "other";

export interface FileCategory {
  id: CategoryId;
  name: string;
  description: string;
  extensions: string[];
}

export interface WritableFile {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
  abort?(): Promise<void>;
}

export interface FileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<WritableFile>;
  move?(destination: DirectoryHandle, newName?: string): Promise<void>;
}

export interface DirectoryHandle {
  kind: "directory";
  name: string;
  values(): AsyncIterable<FileHandle | DirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirectoryHandle>;
  removeEntry(name: string): Promise<void>;
}

export interface FileMoveRecord {
  sourceName: string;
  destinationName: string;
  sourceDirectory: DirectoryHandle;
  destinationDirectory: DirectoryHandle;
}

export const FILE_CATEGORIES: FileCategory[] = [
  { id: "images", name: "Images", description: "Photos, screenshots, artwork", extensions: ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif", "svg", "avif", "bmp", "tif", "tiff", "ico", "raw"] },
  { id: "documents", name: "Documents", description: "PDFs, text and reading", extensions: ["pdf", "doc", "docx", "odt", "rtf", "txt", "md", "epub", "mobi", "pages", "tex", "wps"] },
  { id: "spreadsheets", name: "Spreadsheets", description: "Tables and data sheets", extensions: ["csv", "xls", "xlsx", "ods", "tsv", "numbers"] },
  { id: "presentations", name: "Presentations", description: "Slides and slide decks", extensions: ["ppt", "pptx", "odp", "key"] },
  { id: "videos", name: "Videos", description: "Clips and recordings", extensions: ["mp4", "mov", "mkv", "avi", "webm", "m4v", "mpeg", "mpg", "wmv", "3gp", "ogv"] },
  { id: "audio", name: "Audio", description: "Music, voice and sound", extensions: ["mp3", "wav", "m4a", "flac", "ogg", "aac", "opus", "wma", "aiff", "mid", "midi"] },
  { id: "archives", name: "Archives", description: "Compressed and packed files", extensions: ["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "tgz", "zst"] },
  { id: "code", name: "Code & data", description: "Source files and configs", extensions: ["js", "jsx", "ts", "tsx", "mjs", "cjs", "html", "css", "scss", "json", "xml", "yaml", "yml", "py", "ipynb", "java", "c", "cpp", "h", "hpp", "go", "rs", "php", "rb", "sql", "sh", "bat", "ps1", "toml", "ini", "log", "gitignore"] },
  { id: "installers", name: "Installers", description: "Apps and install packages", extensions: ["exe", "msi", "msix", "appx", "apk", "deb", "rpm", "pkg", "appimage", "dmg"] },
  { id: "other", name: "Other files", description: "Anything that needs a closer look", extensions: [] },
];

const EXTENSION_CATEGORY = new Map<string, CategoryId>();
for (const category of FILE_CATEGORIES) {
  for (const extension of category.extensions) EXTENSION_CATEGORY.set(extension, category.id);
}

export function classifyFileName(name: string): CategoryId {
  const lastDot = name.lastIndexOf(".");
  if (lastDot <= 0 || lastDot === name.length - 1) return "other";
  return EXTENSION_CATEGORY.get(name.slice(lastDot + 1).toLowerCase()) || "other";
}

export function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
}

export function getAvailableName(originalName: string, existingNames: Set<string>) {
  const dot = originalName.lastIndexOf(".");
  const extensionStart = dot > 0 ? dot : originalName.length;
  const base = originalName.slice(0, extensionStart);
  const extension = originalName.slice(extensionStart);
  let candidate = originalName;
  let index = 1;
  while (existingNames.has(candidate.toLocaleLowerCase())) {
    candidate = `${base} (${index})${extension}`;
    index += 1;
  }
  return candidate;
}

export async function moveFileSafely(
  sourceDirectory: DirectoryHandle,
  source: FileHandle,
  destinationDirectory: DirectoryHandle,
  destinationName: string,
): Promise<FileMoveRecord> {
  if (source.move) {
    try {
      await source.move(destinationDirectory, destinationName);
      return { sourceName: source.name, destinationName, sourceDirectory, destinationDirectory };
    } catch (error) {
      if (!(error instanceof Error) || !["NotSupportedError", "TypeError"].includes(error.name)) throw error;
    }
  }

  const original = await source.getFile();
  const destination = await destinationDirectory.getFileHandle(destinationName, { create: true });
  let writer: WritableFile | undefined;
  let closed = false;
  try {
    writer = await destination.createWritable();
    await writer.write(original);
    await writer.close();
    closed = true;
    const copied = await destination.getFile();
    if (copied.size !== original.size) throw new Error("The copied file did not pass its size check; the original was kept.");
    await sourceDirectory.removeEntry(source.name);
  } catch (error) {
    if (!closed) {
      try { await writer?.abort?.(); } catch { /* The original file remains in place. */ }
    }
    try { await destinationDirectory.removeEntry(destinationName); } catch { /* Keep any data that could not be safely cleaned up. */ }
    throw error;
  }
  return { sourceName: source.name, destinationName, sourceDirectory, destinationDirectory };
}
