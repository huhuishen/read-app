import { handleFileUpload, validateFile } from '$lib/util/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (event) => {
    if (!event.locals.user) return json({ message: "Unauthorized" }, { status: 401 });

    const formData = await event.request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        return json({ message: 'File is required' }, { status: 400 });
    }

    validateFile(file, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024);
    const url = await handleFileUpload(file, 'covers');

    return json({ url });
};
