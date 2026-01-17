import { supabase } from '@/lib/supabase';

export type UploadProvider = 'supabase' | 'local';

function normalizePublicObjectUrl(url: string): string {
    if (url.includes('/storage/v1/object/public/')) return url;
    if (url.includes('/storage/v1/object/') && !url.includes('/storage/v1/object/public/')) {
        return url.replace('/storage/v1/object/', '/storage/v1/object/public/');
    }
    return url;
}

function getUploadProvider(): UploadProvider {
    const raw = String(import.meta.env.VITE_UPLOAD_PROVIDER || 'supabase').toLowerCase();
    return raw === 'local' ? 'local' : 'supabase';
}

export async function uploadPublicFile(params: {
    bucket: string;
    path: string;
    file: Blob;
    contentType?: string;
    upsert?: boolean;
}): Promise<string> {
    const provider = getUploadProvider();

    if (provider === 'supabase') {
        const { error: uploadError } = await supabase.storage
            .from(params.bucket)
            .upload(params.path, params.file, {
                upsert: params.upsert ?? true,
                contentType: params.contentType,
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from(params.bucket).getPublicUrl(params.path);
        return normalizePublicObjectUrl(data.publicUrl || '');
    }

    const baseUrl = String(import.meta.env.VITE_UPLOAD_LOCAL_URL || window.location.origin).replace(/\/+$/, '');
    const url = `${baseUrl}/api/uploads`;

    const form = new FormData();
    form.set('bucket', params.bucket);
    form.set('path', params.path);
    form.set('file', params.file as any);

    const res = await fetch(url, { method: 'POST', body: form });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Upload falhou (${res.status})`);
    }

    const json = (await res.json().catch(() => null)) as any;
    const publicUrl = String(json?.publicUrl || json?.url || '');
    if (!publicUrl) throw new Error('Upload falhou (sem URL de retorno)');
    return publicUrl;
}

