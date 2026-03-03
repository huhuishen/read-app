import { Settings } from '$lib/models';
import { apiError, requireUser, withApi } from '$lib/util/apiHandler';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

function ensureAdministrator(user: { roles?: string[] }) {
    if (!user.roles?.includes('administrator')) {
        apiError(403, 'Forbidden');
    }
}

export const GET: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    ensureAdministrator(user);

    const settings = await Settings.getSystemSettings();
    return json({
        autoPublishWithoutReview: !!settings?.autoPublishWithoutReview,
    });
});

export const POST: RequestHandler = withApi(async (event) => {
    const user = requireUser(event);
    ensureAdministrator(user);

    const body = await event.request.json() as { autoPublishWithoutReview?: unknown };

    if (typeof body.autoPublishWithoutReview !== 'boolean') {
        apiError(400, 'autoPublishWithoutReview must be a boolean');
    }

    const settings = await Settings.setAutoPublishWithoutReview(
        body.autoPublishWithoutReview,
    );

    return json({
        autoPublishWithoutReview: !!settings?.autoPublishWithoutReview,
    });
});

