<script lang="ts">
    import { goto } from "$app/navigation";

    function handleStart() {
        goto("/register");
    }

    function handleExplore() {
        goto("/");
    }

    const features = [
        {
            title: "沉浸式阅读",
            desc: "为长文本阅读优化排版和节奏，减少干扰，帮助保持专注。",
        },
        {
            title: "段落级讨论",
            desc: "围绕具体段落评论与回复，讨论更聚焦，不再停留在泛泛留言。",
            img: "",
        },
        {
            title: "阅读进度复盘",
            desc: "记录阅读时长、完成率和行为轨迹，形成可追踪的阅读习惯。",
        },
        {
            title: "轻量社区互动",
            desc: "与同兴趣读者建立稳定连接，形成持续输入和输出循环。",
        },
        {
            title: "学习研究",
            desc: "围绕关键段落做标注和讨论，更快形成结构化理解。",
        },
        {
            title: "创作准备",
            desc: "从阅读记录和讨论反馈提炼素材，提升内容输出质量。",
        },
    ];
</script>

<svelte:head>
    <title>关于我们 | 零重力阅读</title>
</svelte:head>

<div class="about-page">
    <section class="hero container">
        <div class="hero-left flex column g-3 center">
            <h1>专注阅读、评论的内容社区</h1>
            <p class="lead">
                你可以专注阅读、按段讨论、追踪成长， 并与同频读者进行持续交流。
            </p>

            <div class="flex row g-3 center">
                <button class="primary" onclick={handleStart}>创建账号</button>
                <button class="secondary" onclick={handleExplore}
                    >先看内容</button
                >
            </div>
        </div>
    </section>

    <section class="features container">
        <div class="section-head">
            <h2>核心特性</h2>
        </div>

        <div class="feature-grid">
            {#each features as item}
                <article class="feature-card">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                    {#if item.img}
                        <img src={item.img} alt="图片" />
                    {/if}
                </article>
            {/each}
        </div>
    </section>

    <section class="cta flex column g-3">
        <h2>开始你的创作阅读之旅</h2>
        <p>创建账号后即可记录阅读、参与讨论并沉淀个人阅读资产。</p>

        <div class="flex row g-3 center">
            <button class="primary large" onclick={handleStart}>创建账号</button
            >
        </div>
    </section>

    <footer class="footer container">
        <p>科幻阅评</p>
        <div class="links">
            <a href="/">首页</a>
            <a href="/register">注册</a>
            <a href="/login">登录</a>
        </div>
    </footer>
</div>

<style>
    .about-page {
        position: relative;
        overflow: hidden;
        padding-bottom: 80px;
    }

    .container {
        width: min(1120px, 100% - 32px);
        margin: 0 auto;
        position: relative;
        z-index: 1;
    }

    .hero {
        display: flex;
        gap: 28px;
        padding-top: 80px;
        align-items: center;
        justify-content: center;
    }

    .hero-left h1 {
        font-size: clamp(34px, 5vw, 56px);
        line-height: 1.1;
        margin: 14px 0 16px;
        color: var(--text-primary);
    }

    .lead {
        font-size: 18px;
        color: var(--text-secondary);
        max-width: 60ch;
    }

    button {
        border-radius: 999px;
        padding: 10px 18px;
        border: 1px solid var(--border-default);
    }

    button.primary {
        background: var(--button-primary);
        border-color: var(--button-primary);
        color: var(--button-primary-text);
    }

    button.primary:hover {
        background: var(--button-primary-hover);
        border-color: var(--button-primary-hover);
    }

    button.secondary {
        background: var(--surface-reader);
    }

    button.large {
        padding: 12px 26px;
        font-size: 16px;
    }

    .features {
        padding-top: 68px;
    }

    .section-head h2 {
        font-size: 32px;
        margin: 0;
    }

    .feature-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-top: 22px;
    }

    .feature-card {
        padding: 20px;
        border: 1px solid var(--border-soft);
        border-radius: 16px;
        background: var(--surface-reader);
        box-shadow: 0 8px 20px var(--shadow-sm);
    }

    .feature-card h3 {
        margin: 0 0 8px;
        font-size: 18px;
    }

    .feature-card p {
        margin: 0;
        color: var(--text-secondary);
    }

    .cta {
        margin-top: 72px;
        text-align: center;
        border-radius: 24px;
        border: 1px solid var(--border-soft);
        background: linear-gradient(
            135deg,
            color-mix(
                in srgb,
                var(--accent-soft) 45%,
                var(--surface-reader) 55%
            ),
            var(--surface-reader)
        );
        padding: 56px 20px;
    }

    .cta h2 {
        margin: 0;
        font-size: clamp(28px, 4vw, 40px);
    }

    .cta p {
        color: var(--text-secondary);
        margin-top: 10px;
    }

    .footer {
        margin-top: 36px;
        text-align: center;
        color: var(--text-muted);
    }

    .links {
        margin-top: 10px;
        display: flex;
        justify-content: center;
        gap: 14px;
        flex-wrap: wrap;
    }

    .links a {
        color: var(--text-secondary);
    }

    @media (max-width: 980px) {
        .feature-grid {
            grid-template-columns: 1fr 1fr;
        }
    }

    @media (max-width: 760px) {
        .hero {
            grid-template-columns: 1fr;
            padding-top: 52px;
        }

        .feature-grid {
            grid-template-columns: 1fr;
        }

        .section-head h2 {
            font-size: 26px;
        }
    }
</style>
