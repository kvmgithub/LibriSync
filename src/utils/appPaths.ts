import { File, Paths } from 'expo-file-system';

const DATABASE_FILE_NAME = 'audible.db';

function uriToNativePath(uri: string): string {
  return decodeURIComponent(uri.replace(/^file:\/\//, '')).replace(/\/$/, '');
}

export function getDatabasePath(): string {
  return `${uriToNativePath(Paths.document.uri)}/${DATABASE_FILE_NAME}`;
}

export function getDatabaseFiles(): File[] {
  return [
    new File(Paths.document, DATABASE_FILE_NAME),
    new File(Paths.document, `${DATABASE_FILE_NAME}-wal`),
    new File(Paths.document, `${DATABASE_FILE_NAME}-shm`),
  ];
}
