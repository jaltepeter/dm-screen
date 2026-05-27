import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportData, importData } from '../exportImport';
import { STORE_KEY as CHARACTERS_KEY } from '../../store/characterStore';
import { STORE_KEY as IMAGES_KEY } from '../../store/imageStore';
import { STORE_KEY as NOTES_KEY } from '../../store/notesStore';
import { STORE_KEY as ENCOUNTERS_KEY } from '../../store/encounterStore';

const STORE_KEYS = [CHARACTERS_KEY, IMAGES_KEY, NOTES_KEY, ENCOUNTERS_KEY] as const;

const SEED = {
  [CHARACTERS_KEY]: { state: { characters: [] }, version: 1 },
  [IMAGES_KEY]: { state: { folders: [] }, version: 1 },
  [NOTES_KEY]: { state: { notes: 'session notes' }, version: 0 },
  [ENCOUNTERS_KEY]: { state: { statBlocks: [], templates: [] }, version: 2 }
};

beforeEach(() => {
  for (const key of STORE_KEYS) {
    localStorage.setItem(key, JSON.stringify(SEED[key]));
  }
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const key of STORE_KEYS) localStorage.removeItem(key);
});

async function captureExport(): Promise<string> {
  let capturedBlob: Blob | null = null;
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    capturedBlob = blob as Blob;
    return 'blob:mock';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  exportData();
  return capturedBlob!.text();
}

describe('exportData', () => {
  it('produces a JSON object with version and all store keys', async () => {
    const text = await captureExport();
    const parsed = JSON.parse(text);
    expect(parsed.version).toBe(1);
    for (const key of STORE_KEYS) {
      expect(parsed[key]).toBeDefined();
    }
  });
});

describe('importData', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { reload: vi.fn() });
  });

  it('writes store data back to localStorage', async () => {
    const payload = {
      version: 1,
      [NOTES_KEY]: { state: { notes: 'imported notes' }, version: 0 }
    };
    const file = new File([JSON.stringify(payload)], 'export.json', { type: 'application/json' });
    await importData(file);
    expect(JSON.parse(localStorage.getItem(NOTES_KEY)!)).toEqual(payload[NOTES_KEY]);
  });

  it('rejects malformed JSON', async () => {
    const file = new File(['not valid json'], 'bad.json', { type: 'application/json' });
    await expect(importData(file)).rejects.toThrow();
  });

  it('rejects a file with no version field', async () => {
    const file = new File([JSON.stringify({ foo: 'bar' })], 'bad.json', {
      type: 'application/json'
    });
    await expect(importData(file)).rejects.toThrow('Not a valid dm-screen export file');
  });

  it('round-trips all store data through export then import', async () => {
    const text = await captureExport();
    for (const key of STORE_KEYS) localStorage.removeItem(key);
    const file = new File([text], 'export.json', { type: 'application/json' });
    await importData(file);
    expect(JSON.parse(localStorage.getItem(NOTES_KEY)!)).toEqual(SEED[NOTES_KEY]);
    expect(JSON.parse(localStorage.getItem(CHARACTERS_KEY)!)).toEqual(SEED[CHARACTERS_KEY]);
  });
});
