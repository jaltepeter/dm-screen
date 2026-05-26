const STORE_KEYS = ['dm-screen/characters', 'dm-screen/images', 'dm-screen/notes'] as const;

export function exportData(): void {
  const data: Record<string, unknown> = { version: 1 };
  for (const key of STORE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) data[key] = JSON.parse(raw);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dm-screen-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (typeof data !== 'object' || data === null || !data.version) {
          throw new Error('Not a valid dm-screen export file');
        }
        for (const key of STORE_KEYS) {
          if (data[key] !== undefined) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        }
        window.location.reload();
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
