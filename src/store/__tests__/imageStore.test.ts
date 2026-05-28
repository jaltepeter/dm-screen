import { describe, it, expect, beforeEach } from 'vitest';
import { useImageStore } from '../imageStore';

beforeEach(() => {
  useImageStore.setState({ folders: [{ folderName: 'Test', images: [], displayOrder: 0 }] });
});

describe('imageStore.addImage', () => {
  it('adds an image and returns true', () => {
    const result = useImageStore
      .getState()
      .addImage('Test', 'https://example.com/image.png', 'A Test Image');
    expect(result).toBe(true);
    expect(useImageStore.getState().folders[0].images).toHaveLength(1);
    expect(useImageStore.getState().folders[0].images[0].url).toBe('https://example.com/image.png');
    expect(useImageStore.getState().folders[0].images[0].title).toBe('A Test Image');
  });

  it('rejects a duplicate URL and returns false', () => {
    useImageStore.getState().addImage('Test', 'https://example.com/image.png');
    const result = useImageStore.getState().addImage('Test', 'https://example.com/image.png');
    expect(result).toBe(false);
    expect(useImageStore.getState().folders[0].images).toHaveLength(1);
  });

  it('rejects empty URL and returns false', () => {
    const result = useImageStore.getState().addImage('Test', '');
    expect(result).toBe(false);
    expect(useImageStore.getState().folders[0].images).toHaveLength(0);
  });

  it('assigns a unique stable id to each added image', () => {
    useImageStore.getState().addImage('Test', 'https://example.com/img1.png');
    useImageStore.getState().addImage('Test', 'https://example.com/img2.png');
    const images = useImageStore.getState().folders[0].images;
    expect(images[0].id).toBeTruthy();
    expect(images[1].id).toBeTruthy();
    expect(images[0].id).not.toBe(images[1].id);
  });
});
