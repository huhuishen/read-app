import { requireUser, withApi } from '$lib/util/apiHandler';
import { handleFileUpload, validateFile } from '$lib/util/server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = withApi(async (event) => {
    requireUser(event);

    const formData = await event.request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        return json({ message: 'File is required' }, { status: 400 });
    }

    validateFile(file, ['image/jpeg', 'image/png', 'image/webp'], 5 * 1024 * 1024);
    const url = await handleFileUpload(file, 'covers');

    return json({ url });
});
