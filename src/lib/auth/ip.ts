/** 归一化客户端 IP（IPv6 回环等）。登录生成指纹与 hooks 校验必须使用同一实现。 */
export function normalizeIp(ip: string): string {
    if (ip === "::1" || ip === "::ffff:127.0.0.1") return "127.0.0.1";
    return ip;
}

/**
 * 按优先级从请求头中提取客户端真实 IP。
 *
 * 优先级说明：
 *  1. cf-connecting-ip   — Cloudflare 注入的原始客户端 IP
 *  2. true-client-ip     — Akamai / 部分 CDN 使用的头
 *  3. x-real-ip          — Nginx 反向代理常用头
 *  4. x-forwarded-for    — 标准代理链头，取第一个（最左侧）IP
 *  5. x-client-ip        — Apache mod_remoteip 等
 *  6. x-forwarded        — 部分旧代理 / Heroku
 *  7. forwarded          — RFC 7239 标准格式，取第一个 for=
 *  8. cf-pseudo-ipv4     — Cloudflare 在 IPv6 不可用时的伪 IPv4
 *  9. fallback           — 调用方传入的保底值（如 getClientAddress()）
 */
const IP_HEADERS = [
    "cf-connecting-ip",
    "true-client-ip",
    "x-real-ip",
    "x-forwarded-for",
    "x-client-ip",
    "x-forwarded",
    "forwarded",
    "cf-pseudo-ipv4",
] as const;

export function extractClientIp(headers: Headers, fallback: string): string {
    for (const name of IP_HEADERS) {
        const raw = headers.get(name);
        if (!raw) continue;

        let ip: string;

        if (name === "x-forwarded-for") {
            // 可能包含多个 IP：client, proxy1, proxy2 —— 取最左侧
            ip = raw.split(",")[0].trim();
        } else if (name === "forwarded") {
            // RFC 7239: for=<ip>;proto=... 取第一个 for= 值
            const match = raw.match(/for=([^;\s,]+)/i);
            if (!match) continue;
            ip = match[1].replace(/^"/, "").replace(/"$/, "");
            // 去除 IPv6 括号及端口
            ip = ip.replace(/^\[(.+)\].*/, "$1");
        } else {
            ip = raw.trim();
        }
 
        if (ip) return normalizeIp(ip);
    }

    return normalizeIp(fallback);
}
