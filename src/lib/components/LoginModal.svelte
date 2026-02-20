<script lang="ts">
    import Button from "./Button.svelte";
    import Modal from "./overlay/Modal.svelte";
    import { toast } from "$lib/stores/toast.svelte";
    let {
        show = $bindable(),
        account = $bindable(),
        password = $bindable(),
        onSubmit,
        nickname = $bindable(),
        register = $bindable(),
    } = $props();

    let password2 = $state("");
</script>

<Modal bind:show>
    <div class="flex header mb1">
        <div class="title">{register ? "注册" : "登录"}</div>
        <button
            class="flex close-btn"
            aria-label="关闭"
            onclick={() => {
                show = false;
            }}>X</button
        >
    </div>
    <div class="login">
        <div class="flex form mb1">
            <label for="email">邮箱</label>
            <input
                type="email"
                id="email"
                name="account"
                bind:value={account}
                required
            />
        </div>
        <div class="flex form mb1">
            <label for="password">密码</label>
            <input
                type="password"
                id="password"
                name="password"
                bind:value={password}
                required
            />
        </div>

        {#if register}
            <div class="flex form mb1">
                <label for="password2">确认密码</label>
                <input
                    type="password"
                    id="password2"
                    name="password2"
                    bind:value={password2}
                    required
                />
            </div>
            <div class="flex form mb1">
                <label for="nickname">昵称</label>
                <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    bind:value={nickname}
                    required
                />
            </div>
            <div class="flex footer mb1">
                <div class="hint">
                    已有账号？ <a
                        href="#1"
                        onclick={(e) => {
                            e.preventDefault();
                            register = false;
                        }}>登录</a
                    >
                </div>
                <div class="hint">
                    忘记密码？ <a href="#1" onclick={(e) => e.preventDefault()}
                        >找回</a
                    >
                </div>
            </div>
        {:else}
            <div class="flex footer mb1">
                <div class="hint">
                    还没有账号？ <a
                        href="#1"
                        onclick={(e) => {
                            e.preventDefault();
                            register = true;
                        }}>注册</a
                    >
                </div>
                <div class="hint">
                    忘记密码？ <a href="#1" onclick={(e) => e.preventDefault()}
                        >找回</a
                    >
                </div>
            </div>
        {/if}
        <div class="flex footer">
            <Button
                style="secondary"
                onclick={() => {
                    show = false;
                    password = "";
                }}>关闭</Button
            >

            <Button
                onclick={() => {
                    if (register && password !== password2) {
                        toast.show("两次密码输入不一致", "error");
                        return;
                    }

                    onSubmit();
                }}>确定</Button
            >
        </div>
    </div>
</Modal>

<style>
    .header {
        justify-content: space-between;
        gap: 12px;
    }

    .title {
        font-size: 1.125rem;
    }

    .close-btn {
        border: none;
        border-radius: 50%;
        background-color: #eee;
        padding: 6px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
    }

    .login {
        margin: 1rem;
        width: 240px;
    }

    .form {
        gap: 10px;
    }

    input {
        width: 100%;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid #e6e7eb;
        font-size: 14px;
        outline: none;
    }
    input:focus {
        box-shadow: 0 0 0 4px rgba(38, 96, 254, 0.08);
        border-color: #2563eb;
    }

    .footer {
        font-size: 13px;
        color: #666;
        justify-content: space-between;
        align-items: center;
    }

    .hint {
        font-size: 12px;
        color: #888;
    }
</style>
