<script lang="ts">
    import { goto } from "$app/navigation";

    // runes state
    let downloading = $state(false);

    function handleStart() {
        goto("/register");
    }

    function handleDemo() {
        goto("/");
    }

    function handleDownload() {
        downloading = true;
        setTimeout(() => {
            downloading = false;
            alert("即将上线");
        }, 800);
    }

    const features = [
        {
            icon: "📖",
            title: "沉浸阅读",
            desc: "专为长时间阅读设计，自动记录阅读进度、时间与专注度",
        },
        {
            icon: "💬",
            title: "深度讨论",
            desc: "对段落进行评论，与读者实时交流思想。丰富创作经验",
        },
        {
            icon: "👥",
            title: "读者社交",
            desc: "发现志同道合的读者，共同学习成长。",
        },
        {
            icon: "📊",
            title: "阅读统计",
            desc: "详细记录阅读时长、完成率与成长轨迹",
        },
        {
            icon: "🧠",
            title: "开源免费",
            desc: "",
        },
        {
            icon: "⚡",
            title: "极致体验",
            desc: "快速、简洁、无干扰的现代阅读体验",
        },
    ];
</script>

<div class="landing">
    <!-- HERO -->
    <section class="hero">
        <div class="hero-content">
            <div class="subtitle">全新阅读社交体验</div>

            <h1>阅读，不只是阅读</h1>

            <p class="subtitle">沉浸阅读 · 深度思考 · 与思想相遇</p>

            <div class="actions">
                <button class="primary" onclick={handleStart}>
                    立即开始
                </button>

                <button class="secondary" onclick={handleDemo}>
                    浏览内容
                </button>
            </div>

            <div class="meta">免费使用 · 无广告 · 专注体验</div>
        </div>

        <div class="hero-visual">
            <div class="mock">
                <div class="mock-header">Reading</div>

                <div class="mock-text">
                    <div class="line w80"></div>
                    <div class="line w90"></div>
                    <div class="line w60 highlight"></div>
                    <div class="line w95"></div>
                    <div class="line w70"></div>
                </div>
            </div>
        </div>
    </section>

    <!-- FEATURES -->
    <section class="features">
        <h2>为阅读评论而设计</h2>

        <div class="grid">
            {#each features as f}
                <div class="feature">
                    <div class="icon">
                        {f.icon}
                    </div>

                    <div class="title">
                        {f.title}
                    </div>

                    <div class="desc">
                        {f.desc}
                    </div>
                </div>
            {/each}
        </div>
    </section>

    <!-- CTA -->
    <section class="cta">
        <h2>开始你的阅读旅程</h2>

        <p>加入读者社区，与幻想同行</p>

        <div class="actions">
            <button class="primary large" onclick={handleStart}>
                创建账号
            </button>
        </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
        <div class="logo">专为零重力科幻设计的阅读应用</div>

        <div class="links">
            <a href="/about">关于</a>
            <a href="/privacy">隐私</a>
            <a href="/terms">条款</a>
        </div>

        <div class="copyright">© 2026 零重力阅读</div>
    </footer>
</div>

<style>
    .landing {
        display: flex;
        flex-direction: column;
    }

    /* HERO */

    .hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        padding: 120px 40px;
        max-width: 1200px;
        margin: auto;
        gap: 60px;
        align-items: center;
    }

    .hero-content h1 {
        font-size: 48px;
        margin: 16px 0;
        font-weight: 700;
    }

    .subtitle {
        font-size: 20px;
        opacity: 0.7;
    }

    .badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 999px;
        background: #f1f5f9;
        font-size: 14px;
    }

    .actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
    }

    .meta {
        margin-top: 12px;
        font-size: 14px;
        opacity: 0.6;
    }

    /* BUTTON */

    button {
        border: none;
        padding: 10px 18px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 15px;
    }

    button.primary {
        background: black;
        color: white;
    }

    button.secondary {
        background: #f1f5f9;
    }

    button.large {
        padding: 14px 26px;
        font-size: 16px;
    }

    /* MOCK */

    .hero-visual {
        display: flex;
        justify-content: center;
    }

    .mock {
        width: 320px;
        border-radius: 12px;
        background: white;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        padding: 16px;
    }

    .mock-header {
        font-weight: 600;
        margin-bottom: 12px;
    }

    .line {
        height: 10px;
        background: #e2e8f0;
        border-radius: 4px;
        margin-bottom: 8px;
    }

    .highlight {
        background: #fde68a;
    }

    .w60 {
        width: 60%;
    }
    .w70 {
        width: 70%;
    }
    .w80 {
        width: 80%;
    }
    .w90 {
        width: 90%;
    }
    .w95 {
        width: 95%;
    }

    /* FEATURES */

    .features {
        padding: 100px 40px;
        width: 100%;
        margin: auto;
    }

    .features h2 {
        text-align: center;
        margin-bottom: 40px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 24px;
    }

    .feature {
        padding: 20px;
        border-radius: 12px;
        background: #f8fafc;
    }

    .icon {
        font-size: 28px;
    }

    .title {
        font-weight: 600;
        margin-top: 8px;
    }

    .desc {
        font-size: 14px;
        opacity: 0.7;
    }

    /* CTA */

    .cta {
        text-align: center;
        padding: 120px 20px;
        background: #f8fafc;
    }

    .cta h2 {
        font-size: 32px;
    }

    .cta p {
        opacity: 0.7;
        margin-top: 8px;
    }

    /* FOOTER */

    .footer {
        padding: 40px;
        text-align: center;
        opacity: 0.6;
    }

    .links {
        margin: 12px 0;
        display: flex;
        justify-content: center;
        gap: 16px;
    }

    .links a {
        text-decoration: none;
        color: inherit;
    }

    @media (max-width: 800px) {
        .hero {
            grid-template-columns: 1fr;
            text-align: center;
        }
    }
</style>
