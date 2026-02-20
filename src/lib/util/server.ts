import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Users } from '$lib/models';
import type { Cookies } from '@sveltejs/kit';

export async function handleFileUpload(file: File, subfolder = '') {
    const uploadDir = path.join(process.env.UPLOAD_DIR || 'static/uploads', subfolder);

    // 确保上传目录存在
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 生成唯一文件名
    const timestamp = Date.now();
    const originalName = file.name;
    const extension = path.extname(originalName);
    const baseName = path.basename(originalName, extension);
    const uniqueName = `${baseName}_${timestamp}${extension}`;

    const filePath = path.join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    return `/uploads/${subfolder ? subfolder + '/' : ''}${uniqueName}`;
}

export function validateFile(file: File, allowedTypes: string[], maxSize: number) {
    if (file.size > maxSize) {
        throw new Error(`文件大小不能超过 ${maxSize / 1024 / 1024}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`不支持的文件类型: ${file.type}`);
    }

    return true;
}

