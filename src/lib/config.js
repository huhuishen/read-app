import { env } from '$env/dynamic/private';

// TODO: 下面的代码不可靠，本地http访问会返回https
// console.log(options, url.protocol, url.protocol === 'https:');
export const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: true,
    secure: false,
}

export const SALT_ROUNDS = 12;
export const secret = env.JWT_SECRET ?? "5ujWTuGOSGKDl50mYXsyS1";


export const backupDir = (!env.PATH_BACKUP || env.PATH_BACKUP === '') ? `${process.cwd()}\\backup` : env.PATH_BACKUP;