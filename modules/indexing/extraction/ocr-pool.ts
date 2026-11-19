import { createScheduler, createWorker, type Scheduler } from "tesseract.js";
import { indexingConfig, OCR_IDLE_SHUTDOWN_MS, OCR_POOL_SIZE } from "../config";

/**
 * A small team of Tesseract workers that is started once and reused for every page.
 * Starting a worker loads the language model, which is slow, so we never do it per page.
 * The team shuts itself down after a quiet period to give the memory back.
 */
interface PoolState {
  scheduler: Scheduler | null;
  starting: Promise<Scheduler> | null;
  activeJobs: number;
  idleTimer: ReturnType<typeof setTimeout> | null;
}

// Kept on globalThis so Next.js hot reload in dev does not leak a new set of workers each time.
const globalForPool = globalThis as unknown as { __ocrPool?: PoolState };
const pool = (globalForPool.__ocrPool ??= { scheduler: null, starting: null, activeJobs: 0, idleTimer: null });

async function startPool(): Promise<Scheduler> {
  const scheduler = createScheduler();
  try {
    const workers = await Promise.all(
      Array.from({ length: OCR_POOL_SIZE }, () => createWorker(indexingConfig.OCR_LANG)),
    );
    workers.forEach((worker) => scheduler.addWorker(worker));
    console.info(JSON.stringify({ event: "ocr-pool-started", workers: workers.length }));
    return scheduler;
  } catch (error) {
    await scheduler.terminate().catch(() => undefined);
    throw error;
  }
}

function getScheduler(): Promise<Scheduler> {
  if (pool.scheduler) return Promise.resolve(pool.scheduler);
  if (!pool.starting) {
    pool.starting = startPool()
      .then((scheduler) => {
        pool.scheduler = scheduler;
        return scheduler;
      })
      .finally(() => {
        pool.starting = null;
      });
  }
  return pool.starting;
}

function scheduleIdleShutdown(): void {
  if (pool.idleTimer) clearTimeout(pool.idleTimer);
  pool.idleTimer = setTimeout(() => {
    pool.idleTimer = null;
    if (pool.activeJobs > 0 || !pool.scheduler) return;
    const scheduler = pool.scheduler;
    pool.scheduler = null;
    void scheduler.terminate().catch(() => undefined);
    console.info(JSON.stringify({ event: "ocr-pool-stopped" }));
  }, OCR_IDLE_SHUTDOWN_MS);
  pool.idleTimer.unref?.();
}

export async function recognizeImage(image: Buffer): Promise<{ text: string; confidence: number }> {
  pool.activeJobs += 1;
  if (pool.idleTimer) clearTimeout(pool.idleTimer);
  try {
    const scheduler = await getScheduler();
    const result = await scheduler.addJob("recognize", image);
    return { text: result.data.text.trim(), confidence: result.data.confidence };
  } finally {
    pool.activeJobs -= 1;
    if (pool.activeJobs === 0) scheduleIdleShutdown();
  }
}
