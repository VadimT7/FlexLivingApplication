import { promises as fs } from 'fs';
import path from 'path';
import seedData from '@/data/approved-reviews.json';

export interface ApprovalData {
  approvedReviewIds: string[];
  lastUpdated: string;
}

const DATA_FILE_PATH = path.join(process.cwd(), 'src/data/approved-reviews.json');
const STORAGE_FILE_PATH = process.env.VERCEL
  ? path.join('/tmp', 'approved-reviews.json')
  : DATA_FILE_PATH;

let approvalCache: ApprovalData | null = null;

export async function getApprovalData(): Promise<ApprovalData> {
  if (approvalCache) {
    return approvalCache;
  }

  let seededFromFallback = false;

  try {
    const fileContent = await fs.readFile(STORAGE_FILE_PATH, 'utf-8');
    approvalCache = JSON.parse(fileContent) as ApprovalData;
  } catch (error) {
    console.warn('Falling back to seed approval data:', error);
    approvalCache = {
      approvedReviewIds: seedData.approvedReviewIds ?? [],
      lastUpdated: seedData.lastUpdated ?? new Date().toISOString(),
    };
    seededFromFallback = true;
  }

  if (!approvalCache) {
    approvalCache = {
      approvedReviewIds: seedData.approvedReviewIds ?? [],
      lastUpdated: seedData.lastUpdated ?? new Date().toISOString(),
    };
  }

  if (seededFromFallback) {
    await saveApprovalData(approvalCache);
  }

  return approvalCache;
}

export async function saveApprovalData(data: ApprovalData): Promise<void> {
  approvalCache = data;

  try {
    await fs.writeFile(STORAGE_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.warn('Unable to persist approval data:', error);
  }
}

