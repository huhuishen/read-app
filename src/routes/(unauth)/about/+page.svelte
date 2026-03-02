<script lang="ts">
    import { goto } from "$app/navigation";

    function handleStart() {
        goto("/register");
    }

    function handleExplore() {
        goto("/");
    }

    const trustBadges = [
        { value: "无广告", label: "专注阅读体验" },
        { value: "段落互动", label: "围绕具体内容交流" },
        { value: "进度追踪", label: "持续沉淀阅读成果" },
    ];

    const features = [
        {
            title: "沉浸式阅读",
            desc: "为长文本阅读优化排版和节奏，减少干扰，帮助保持专注。",
        },
        {
            title: "段落级讨论",
            desc: "围绕具体段落评论与回复，讨论更聚焦，不再停留在泛泛留言。",
        },
        {
            title: "阅读进度复盘",
            desc: "记录阅读时长、完成率和行为轨迹，形成可追踪的阅读习惯。",
        },
        {
            title: "高效内容发现",
            desc: "按分类快速浏览内容，降低信息噪音，提升筛选效率。",
        },
        {
            title: "轻量社区互动",
            desc: "与同兴趣读者建立稳定连接，形成持续输入和输出循环。",
        },
        {
            title: "持续迭代",
            desc: "围绕真实阅读场景不断优化，保持产品可用与可进化。",
        },
    ];

    const useCases = [
        {
            title: "日常输入",
            desc: "把碎片时间转化为持续阅读输入，逐步建立知识宽度。",
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
    <div class="bg"></div>

    <section class="hero container">
        <div class="hero-left">
            <p class="eyebrow">Read Better, Think Deeper</p>
            <h1>为深度阅读而生的内容社区</h1>
            <p class="lead">
                零重力阅读致力于把“看过”升级为“获得”。你可以专注阅读、按段讨论、追踪成长，
                并与同频读者进行持续交流。
            </p>

            <div class="actions">
                <button class="primary" onclick={handleStart}>立即开始</button>
                <button class="secondary" onclick={handleExplore}>先看内容</button>
            </div>
        </div>

        <div class="hero-panel">
            <p class="panel-title">产品承诺</p>
            <div class="badge-list">
                {#each trustBadges as item}
                    <div class="badge-item">
                        <p class="badge-value">{item.value}</p>
                        <p class="badge-label">{item.label}</p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <section class="features container">
        <div class="section-head">
            <h2>核心特性</h2>
            <p>围绕“读得深、想得清、交流有效”构建产品能力。</p>
        </div>

        <div class="feature-grid">
            {#each features as item}
                <article class="feature-card">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="scenes container">
        <div class="section-head">
            <h2>适用场景</h2>
        </div>

        <div class="scene-grid">
            {#each useCases as item}
                <article class="scene-card">
                    <h3>{item.title}</h3>
                    <p>{item.desc}</p>
                </article>
            {/each}
        </div>
    </section>

    <section class="cta container">
        <h2>开始你的下一次高质量阅读</h2>
        <p>创建账号后即可记录阅读、参与讨论并沉淀个人阅读资产。</p>

        <div class="actions center">
            <button class="primary large" onclick={handleStart}>创建账号</button>
            <button class="secondary large" onclick={handleExplore}>浏览首页</button>
        </div>
    </section>

    <footer class="footer container">
        <p>零重力阅读 · 让阅读从“看过”变成“获得”</p>
        <div class="links">
            <a href="/">首页</a>
            <a href="/register">注册</a>
            <a href="/login">登录</a>
        </div>
    </footer>
</div>

<style>
    :global(body) {
        background: linear-gradient(
            180deg,
            color-mix(in srgb, var(--surface-page) 85%, white 15%) 0%,
            var(--surface-page) 100%
        );
    }

    .about-page {
        position: relative;
        overflow: hidden;
        padding-bottom: 80px;
    }

    .bg {
        position: absolute;
        inset: -120px 0 auto 0;
        height: 420px;
        background:
            radial-gradient(circle at 10% 20%, var(--accent-tint-soft), transparent 40%),
            radial-gradient(circle at 90% 25%, var(--accent-soft), transparent 35%);
        pointer-events: none;
        z-index: 0;
    }

    .container {
        width: min(1120px, 100% - 32px);
        margin: 0 auto;
        position: relative;
        z-index: 1;
    }

    .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
        gap: 28px;
        padding-top: 80px;
        align-items: stretch;
    }

    .hero-left h1 {
        font-size: clamp(34px, 5vw, 56px);
        line-height: 1.1;
        margin: 14px 0 16px;
        color: var(--text-primary);
    }

    .eyebrow {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--accent-highlight);
        font-weight: 700;
    }

    .lead {
        font-size: 18px;
        color: var(--text-secondary);
        max-width: 60ch;
    }

    .hero-panel {
        border: 1px solid var(--border-soft);
        border-radius: 20px;
        padding: 22px;
        background: color-mix(in srgb, var(--surface-reader) 85%, transparent 15%);
        backdrop-filter: blur(6px);
        box-shadow: 0 10px 28px var(--shadow-sm);
    }

    .panel-title {
        color: var(--text-secondary);
        font-size: 14px;
        margin-bottom: 14px;
    }

    .badge-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .badge-item {
        padding: 12px;
        border: 1px solid var(--border-soft);
        border-radius: 12px;
        background: var(--surface-soft);
    }

    .badge-value {
        font-size: 20px;
        font-weight: 700;
    }

    .badge-label {
        font-size: 14px;
        color: var(--text-muted);
    }

    .actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 22px;
    }

    .actions.center {
        justify-content: center;
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

    .features,
    .scenes {
        padding-top: 68px;
    }

    .section-head h2 {
        font-size: 32px;
        margin: 0;
    }

    .section-head p {
        margin-top: 8px;
        color: var(--text-secondary);
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

    .feature-card h3,
    .scene-card h3 {
        margin: 0 0 8px;
        font-size: 18px;
    }

    .feature-card p,
    .scene-card p {
        margin: 0;
        color: var(--text-secondary);
    }

    .scene-grid {
        margin-top: 18px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }

    .scene-card {
        border-radius: 14px;
        padding: 18px;
        border: 1px solid var(--border-soft);
        background: color-mix(in srgb, var(--surface-reader) 80%, var(--surface-soft) 20%);
    }

    .cta {
        margin-top: 72px;
        text-align: center;
        border-radius: 24px;
        border: 1px solid var(--border-soft);
        background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--accent-soft) 45%, var(--surface-reader) 55%),
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
        .feature-grid,
        .scene-grid {
            grid-template-columns: 1fr 1fr;
        }
    }

    @media (max-width: 760px) {
        .hero {
            grid-template-columns: 1fr;
            padding-top: 52px;
        }

        .hero-panel {
            order: -1;
        }

        .feature-grid,
        .scene-grid {
            grid-template-columns: 1fr;
        }

        .section-head h2 {
            font-size: 26px;
        }
    }
</style>
