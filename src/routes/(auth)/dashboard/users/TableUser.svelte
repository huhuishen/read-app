<script lang="ts">
    import { goto } from "$app/navigation";
    import Button from "$lib/components/Button.svelte";
    import Icon from "$lib/components/Icon.svelte";
    import Drawer from "$lib/components/overlay/Drawer.svelte";
    import Pagination from "$lib/components/Pagination.svelte";
    import type { User } from "$lib/models";
    import type { DataPage } from "$lib/mongolite";
    import { toast } from "$lib/stores/toast.svelte";
    import { toLocalDateString } from "$lib/util/client";
    import { createApi, safeCall } from "$lib/util/apiRequest";
    import { formatDuration } from "../../../util";
    import type { Role } from "../permissions";
    import Table, { type Column } from "../Table.svelte";

    const {
        data,
    }: {
        data: DataPage<User>;
    } = $props();

    const columns: Column<User>[] = [
        {
            name: "名称",
            text: (item) => item.name,
            className: "lg",
        },
        {
            name: "账号",
            text: (item) => item.email,
        },
        {
            name: "权限",
            text: (item) => item.roles?.join(","),
            className: "lg",
        },
        {
            name: "阅读时长",
            text: (item) => formatDuration(item.readSeconds),
        },
        {
            name: "创建",
            text: (item) => toLocalDateString(item.createdAt, false),
            className: "lg",
        },
        {
            name: "更新",
            text: (item) => toLocalDateString(item.updatedAt, false),
            className: "lg",
        },
    ];

    const api = createApi();

    const roleOptions: { value: Role; label: string }[] = [
        { value: "administrator", label: "管理员" },
        { value: "editor", label: "编辑" },
        { value: "author", label: "作者" },
        { value: "critic", label: "评论审核" },
        { value: "user", label: "用户" },
        { value: "guest", label: "访客" },
    ];

    let show = $state(false);
    let loading = $state(false);
    let editing = $state<User | null>(null);
    let selectedRoles = $state<Role[]>(["user"]);

    function openSettings(user: User) {
        editing = user;
        selectedRoles = Array.isArray(user.roles) && user.roles.length
            ? [...(user.roles as Role[])]
            : ["user"];
        show = true;
    }

    function isRoleChecked(role: Role) {
        return selectedRoles.includes(role);
    }

    function toggleRole(role: Role, checked: boolean) {
        if (checked) {
            if (!selectedRoles.includes(role)) {
                selectedRoles = [...selectedRoles, role];
            }
            return;
        }

        selectedRoles = selectedRoles.filter((item) => item !== role);
    }

    async function saveRoles() {
        if (!editing || loading) return;
        if (selectedRoles.length === 0) {
            toast.show("至少保留一个角色", "error");
            return;
        }

        loading = true;
        const res = await safeCall(
            api.patch(`/api/users/${editing.id}`, { roles: selectedRoles }),
            toast,
        );
        loading = false;
        if (!res) return;

        toast.show("用户权限已更新", "success");
        show = false;
        location.reload();
    }

    async function sendPasswordResetRequest(user?: User) {
        const target = user ?? editing;
        if (!target || loading) return;

        loading = true;
        const res = await safeCall<{ resetUrl?: string; message?: string }>(
            api.post(`/api/users/${target.id}/password-reset-request`),
            toast,
        );
        loading = false;
        if (!res) return;

        if (res.resetUrl && navigator?.clipboard) {
            await navigator.clipboard.writeText(res.resetUrl);
            toast.show("重置链接已复制到剪贴板", "success");
            return;
        }

        toast.show(res.message ?? "密码重置请求已发送", "success");
    }
</script>

<Table
    items={data.items}
    {columns}
    onSelect={(row) => {
        openSettings(row);
    }}
    context={[
        {
            name: "设置",
            className: "bold",
            onclick: (row) => {
                openSettings(row);
            },
        },
        {
            name: "转到",
            onclick: (row) => {
                goto(`/profile/${row.id}/articles`);
            },
        },
        {
            name: "发送密码重置请求",
            onclick: async (row) => {
                await sendPasswordResetRequest(row);
            },
        },
    ]}
></Table>

<div class="mt-3 mb-3">
    <Pagination
        total={data.totalItems}
        limit={data.limit}
        page={data.page}
        formatUrl={(n) => {
            return `/dashboard/users/?page=${n}&limit=${data.limit}`;
        }}
    ></Pagination>
</div>

<Drawer bind:show>
    <header class="drawer-header">
        <Button variant="link" onclick={() => (show = false)}>
            <Icon name="chevron-left" size={26} />返回
        </Button>
    </header>

    <div class="form">
        {#if editing}
            <h3 class="title">用户设置</h3>
            <p class="sub">{editing.name} ({editing.email})</p>

            <div class="label">权限</div>
            <div class="roles">
                {#each roleOptions as role}
                    <label class="role-item">
                        <input
                            type="checkbox"
                            checked={isRoleChecked(role.value)}
                            onchange={(e) =>
                                toggleRole(
                                    role.value,
                                    (e.currentTarget as HTMLInputElement)
                                        .checked,
                                )}
                        />
                        <span>{role.label}</span>
                    </label>
                {/each}
            </div>

            <div class="buttons">
                <Button disabled={loading} onclick={saveRoles}>保存权限</Button>
                <Button disabled={loading} onclick={() => sendPasswordResetRequest()}>
                    发送密码重置请求
                </Button>
                <Button
                    disabled={loading}
                    onclick={() => {
                        show = false;
                    }}
                >
                    关闭
                </Button>
            </div>
        {/if}
    </div>
</Drawer>

<style>
    .drawer-header {
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 10px;
        background-color: var(--main-bg-color);
        height: 60px;
        z-index: 2200;
    }

    .form {
        font-size: 16px;
        padding: 1rem;
    }

    .title {
        margin: 0 0 0.25rem 0;
    }

    .sub {
        margin: 0 0 1rem 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }

    .label {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
    }

    .roles {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.6rem 1rem;
    }

    .role-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .buttons {
        margin-top: 1rem;
        width: 100%;
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }
</style>
