type BatchCallback<T> = (params: any) => Promise<T>;

interface BatchItem<T> {
  params: any;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class RequestBatcher<T> {
  private batch: BatchItem<T>[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly maxBatchSize: number;
  private readonly batchDelay: number;
  private readonly callback: BatchCallback<T[]>;

  constructor(
    callback: BatchCallback<T[]>,
    maxBatchSize: number = 10,
    batchDelay: number = 50
  ) {
    this.callback = callback;
    this.maxBatchSize = maxBatchSize;
    this.batchDelay = batchDelay;
  }

  add(params: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batch.push({ params, resolve, reject });

      if (this.batch.length >= this.maxBatchSize) {
        this.processBatch();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(
          () => this.processBatch(),
          this.batchDelay
        );
      }
    });
  }

  private async processBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    const currentBatch = this.batch;
    this.batch = [];

    try {
      const params = currentBatch.map(item => item.params);
      const results = await this.callback(params);

      currentBatch.forEach((item, index) => {
        item.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(item => {
        item.reject(error);
      });
    }
  }
} 