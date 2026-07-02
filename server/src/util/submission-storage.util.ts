import { getSupabase } from "../config/supabase.confg";

export function getStorageBucket(): string {
    const bucket = process.env.SUPABASE_BUCKET;
    if (!bucket) {
        throw new Error("SUPABASE_BUCKET not found");
    }
    return bucket;
}

export function getStorageKeyFromStoredPath(storedPath: string): string {
    if (!storedPath.startsWith("http")) {
        return decodeURIComponent(storedPath);
    }

    const bucket = getStorageBucket();
    const publicMarker = `/object/public/${bucket}/`;
    const publicIndex = storedPath.indexOf(publicMarker);
    if (publicIndex !== -1) {
        return decodeURIComponent(storedPath.substring(publicIndex + publicMarker.length));
    }

    return decodeURIComponent(storedPath.substring(storedPath.lastIndexOf("/") + 1));
}

export function getPublicPathForStoredPath(storedPath: string): string {
    if (storedPath.startsWith("http")) {
        return storedPath;
    }

    const { data } = getSupabase().storage.from(getStorageBucket()).getPublicUrl(storedPath);
    return data.publicUrl;
}

export function formatSubmissionFilePaths(filePaths: { id: number; path: string }[]) {
    return filePaths.map(filePath => ({
        id: filePath.id,
        path: getPublicPathForStoredPath(filePath.path),
    }));
}

export async function deleteFilesFromSupabase(storedPaths: string[]): Promise<void> {
    if (storedPaths.length === 0) {
        return;
    }

    const bucket = getStorageBucket();
    const storageKeys = [...new Set(storedPaths.map(getStorageKeyFromStoredPath))];

    for (const storageKey of storageKeys) {
        const { error } = await getSupabase().storage.from(bucket).remove([storageKey]);
        if (error) {
            throw new Error(error.message);
        }
    }
}
