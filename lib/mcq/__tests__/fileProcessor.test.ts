import { FileProcessor } from '../fileProcessor';
import { api } from '../../api/client';

jest.mock('../../api/client');

describe('FileProcessor', () => {
  const mockFile = new File(['test content'], 'test.pdf', {
    type: 'application/pdf'
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate files correctly', () => {
    const validFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    expect(FileProcessor.validateFile(validFile)).toBeNull();

    const invalidType = new File([''], 'test.jpg', { type: 'image/jpeg' });
    expect(FileProcessor.validateFile(invalidType)).toContain('Invalid file type');

    const largeFile = new File([''], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(largeFile, 'size', { value: 20 * 1024 * 1024 });
    expect(FileProcessor.validateFile(largeFile)).toContain('File too large');
  });

  it('should process files and report progress', async () => {
    const onProgress = jest.fn();
    
    (api.post as jest.Mock).mockResolvedValue({
      data: { processingId: 'test-id' }
    });

    (api.get as jest.Mock).mockResolvedValue({
      data: {
        status: 'completed',
        progress: 100,
        text: 'Processed content'
      }
    });

    const result = await FileProcessor.processFile(mockFile, onProgress);

    expect(result).toBe('Processed content');
    expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({
      status: 'completed',
      progress: 100
    }));
  });
}); 