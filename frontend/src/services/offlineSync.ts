import { get, set } from 'idb-keyval';
import api from '../lib/axios';

export const OFFLINE_QUEUE_KEY = 'pos_offline_queue';

export async function addTransactionToQueue(transaction: any) {
  const queue = await get(OFFLINE_QUEUE_KEY) || [];
  queue.push(transaction);
  await set(OFFLINE_QUEUE_KEY, queue);
}

export async function getOfflineQueue() {
  return await get(OFFLINE_QUEUE_KEY) || [];
}

export async function clearOfflineQueue() {
  await set(OFFLINE_QUEUE_KEY, []);
}

export async function syncOfflineTransactions() {
  const queue = await getOfflineQueue();
  if (queue.length === 0) return { success: true, count: 0 };

  try {
    const response = await api.post('/pos/sync', { transactions: queue });
    await clearOfflineQueue();
    return { success: true, count: response.data.data.synced };
  } catch (error) {
    console.error("Failed to sync offline transactions:", error);
    return { success: false, count: 0 };
  }
}
