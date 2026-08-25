import { SALT_ROUNDS } from "$lib/config";
import { nanoid } from "$lib/util/client";
import bcrypt from "bcryptjs";
import { Categories } from "./categories";
import { Comments, type Comment } from "./comments";
import { Articles, getContestInfoByDate, type Article } from "./articles";
import { Tags } from "./tags";
import { Users, type User } from "./users";
import { initDb } from "./db";

/**
 * 测试数据播种
 * - 生成测试用户 / 文章 / 评论，统一打 isSeed:true 标记
 * - 重跑时先删除上次 seed 数据再重新生成（幂等）
 */

const TAG_POOL = [
    "科幻", "短篇", "长篇", "硬科幻", "赛博朋克",
    "太空歌剧", "末日", "时间旅行", "人工智能", "外星文明",
    "反乌托邦", "生物科技", "平行宇宙", "克苏鲁", "蒸汽朋克",
];

const BOOK_TITLES = [
    "三体", "球状闪电", "时间移民", "流浪地球", "乡村教师",
    "微观尽头", "朝闻道", "赡养人类", "镜子的故事", "地火",
    "全频带阻塞干扰", "超新星纪元", "魔鬼积木", "太原之恋", "圆",
    "微纪元", "命运", "吞食者", "诗云", "地球大炮",
];

const CONTENT_PARAGRAPHS = [
    "读罢全书，最打动我的并非宏大的设定，而是作者在冰冷物理定律背后藏匿的温情。星舰划过深空，舷窗里映出的却是故乡的稻田与母亲的呼唤。",
    "科幻的魅力在于把人类逼到极限，再观察剩下的是什么。当文明面对不可名状的灾难，个体的选择既渺小又耀眼，恰如夜空中最微弱的星。",
    "作者用近乎冷峻的笔触描绘未来，却在字里行间埋下对旧世界的眷恋。技术进步是否一定带来幸福？书中的答案耐人寻味。",
    "结构上，前半段铺陈世界观略显冗长，但后半段的反转足以弥补一切。当真相揭晓的那一刻，前面所有的伏笔都找到了归宿。",
    "人物塑造是本作的另一亮点。主角并非完人，他的犹豫、退缩与最终的决断，让这个未来故事有了真实可感的温度。",
    "设定虽天马行空，逻辑却自洽严密。每一次技术跃迁都伴随着代价，这种“守恒”的叙事让世界观显得厚重可信。",
    "比起炫目的奇观，我更偏爱书中那些静默的瞬间：通讯延迟中的等待、冬眠舱前的告别、以及文明落幕时的一句低语。",
    "如果非要说遗憾，便是结尾略显仓促。或许作者有意留白，把想象的余地交还给读者，让故事在合上书页之后继续生长。",
];

const COMMENT_TEMPLATES = [
    "写得真好，尤其喜欢结尾那段关于星空的描写。",
    "补一个小细节：第三段的设定和前作有冲突，作者后续会不会解释？",
    "这篇的节奏控制得不错，读起来一气呵成。",
    "个人觉得开头略长，但坚持读到中段就被惊艳到了。",
    "评分给五星，实至名归。期待作者更多作品。",
    "观点很新颖，不过论证过程还可以更扎实一些。",
    "看完久久不能平静，这就是科幻的力量吧。",
    "和我想的有点不一样，但意外地喜欢这种处理。",
    "语言风格太合我口味了，冷静又有诗意。",
    "讨论区有人提到伏笔，我重读了一遍确实精妙。",
];

const USER_ROLES: User["roles"][] = [
    ["author", "user"] as User["roles"], ["author", "user"] as User["roles"],
    ["critic", "user"] as User["roles"], ["critic", "user"] as User["roles"], ["critic", "user"] as User["roles"],
];

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickSome<T>(arr: T[], min: number, max: number): T[] {
    const n = randInt(min, Math.min(max, arr.length));
    const copy = [...arr];
    const out: T[] = [];
    for (let i = 0; i < n && copy.length; i++) {
        out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
}

export async function seedTestData(opts?: { months?: number; perMonth?: number }) {
    await initDb();

    const months = opts?.months ?? 10;
    const perMonth = opts?.perMonth ?? 30;

    // 1. 清理上次 seed 数据（isSeed 标记）
    await Promise.all([
        Articles.deleteMany({ isSeed: true } as any),
        Comments.deleteMany({ isSeed: true } as any),
        Users.deleteMany({ isSeed: true } as any),
        Categories.deleteMany({ isSeed: true } as any),
    ]);

    // 2. 生成 20 个测试用户
    const passwordHash = await bcrypt.hash("password", SALT_ROUNDS);
    const users: (Partial<User> & { isSeed: true })[] = [];
    for (let i = 1; i <= 20; i++) {
        const roles = (i <= USER_ROLES.length
            ? USER_ROLES[i - 1]
            : ["user"]) as User["roles"];
        users.push({
            id: crypto.randomUUID(),
            email: `seed${i}@test.local`,
            name: `测试用户${i}`,
            password: passwordHash,
            title: [],
            award: [],
            roles,
            profile: { theme: "light", avatarColor: "" },
            readSeconds: 0,
            underlineCount: 0,
            underlineReplyCount: 0,
            commentCount: 0,
            activated: true,
            activateToken: "",
            activateExpireAt: new Date(0),
            bio: "这是一个测试账号",
            tags: "",
            isSeed: true,
        });
    }
    await Users.insertMany(users as any);

    // 3. 内存中构造文章（按月份分布）
    const now = new Date();
    const articles: (Partial<Article> & { isSeed: true })[] = [];
    const articleCreatedAt = new Map<string, Date>();
    const periods: string[] = [];
    let titleCounter = 0;

    for (let m = 0; m < months; m++) {
        const date = new Date(now.getFullYear(), now.getMonth() - m, 15);
        const info = getContestInfoByDate(date);
        periods.push(info.period);

        for (let i = 0; i < perMonth; i++) {
            titleCounter++;
            const author = pick(users);
            const book = pick(BOOK_TITLES);
            const paragraphs = pickSome(CONTENT_PARAGRAPHS, 3, 5);
            const content = paragraphs.join("\n\n");
            const summary = paragraphs[0].slice(0, 60);
            const id = nanoid();

            articles.push({
                id,
                version: 0,
                isLatest: true,
                status: "published",
                authorId: author.id,
                author: author.name,
                title: `《${book}》读后感 · ${info.period} #${i + 1}`,
                content,
                summary,
                coverImage: "",
                tags: pickSome(TAG_POOL, 1, 3),
                category: {
                    year: info.year,
                    month: info.month,
                    period: info.period,
                    voteEnd: info.voteEnd,
                },
                stats: {
                    view: randInt(0, 500),
                    mark: randInt(0, 50),
                    comment: 0,
                    vote: randInt(0, 30),
                    rate: 0,
                    rateSum: 0,
                    rateCount: 0,
                    readSeconds: randInt(0, 10000),
                },
                isSeed: true,
            });

            // 月份内随机一天作为 createdAt（insertMany 会覆盖，稍后 bulkWrite 修正）
            articleCreatedAt.set(id, new Date(
                info.year,
                info.month - 1,
                randInt(1, 28),
                randInt(0, 23),
                randInt(0, 59),
            ));
        }
    }

    // 4. 生成评论，并累计文章 stats
    const comments: (Partial<Comment> & { isSeed: true })[] = [];
    const userCommentCount = new Map<string, number>();
    for (const u of users) userCommentCount.set(u.id!, 0);

    for (const article of articles) {
        // 约 60% 文章有评论
        if (Math.random() > 0.6) continue;
        const n = randInt(1, 4);
        for (let i = 0; i < n; i++) {
            const commenter = pick(users);
            const hasRating = Math.random() < 0.7;
            const rating = hasRating ? randInt(3, 5) : 0;
            comments.push({
                articleId: article.id,
                articleTitle: article.title,
                parentId: null,
                userId: commenter.id,
                user: commenter.name,
                content: pick(COMMENT_TEMPLATES),
                rating,
                likes: randInt(0, 20),
                liked: false,
                replies: [],
                replyTo: "",
                quote: "",
                isSeed: true,
            });

            article.stats!.comment += 1;
            if (rating > 0) {
                article.stats!.rateSum += rating;
                article.stats!.rateCount += 1;
            }
            userCommentCount.set(commenter.id!, userCommentCount.get(commenter.id!)! + 1);
        }
        article.stats!.rate = article.stats!.rateCount > 0
            ? (article.stats!.rateSum / article.stats!.rateCount) * 2
            : 0;
    }

    // 5. 写库
    await Articles.insertMany(articles as any);
    if (comments.length > 0) {
        await Comments.insertMany(comments as any);
    }

    // 6. 批量修正文章 createdAt / updatedAt（散布到各自月份）
    const timeOps = articles.map((a) => ({
        updateOne: {
            filter: { id: a.id },
            update: {
                $set: {
                    createdAt: articleCreatedAt.get(a.id!),
                    updatedAt: articleCreatedAt.get(a.id!),
                },
            },
        },
    }));
    await Articles.bulkWrite(timeOps as any);

    // 7. 更新用户 commentCount
    const userOps = users
        .map((u) => ({
            updateOne: {
                filter: { id: u.id },
                update: { $set: { commentCount: userCommentCount.get(u.id!) ?? 0 } },
            },
        }));
    await Users.bulkWrite(userOps as any);

    // 8. 重建分类预览 + 打 isSeed 标记
    for (const period of periods) {
        await Categories.buildPreview(period, perMonth, true);
        await Categories.updateOne(
            { name: period } as any,
            { $set: { isSeed: true } } as any,
        );
    }

    // 9. 重建标签计数
    for (const tag of TAG_POOL) {
        await Tags.buildCount(tag);
    }

    return {
        users: users.length,
        articles: articles.length,
        comments: comments.length,
        periods,
    };
}
