<script>
    import ProfileTabs from "../ProfileTabs.svelte";
    import ProfileActivity from "./ProfileActivity.svelte";

    let { data } = $props();
</script>

<ProfileTabs user={data.userState} active="activity">
    <ProfileActivity days={data.days} />
</ProfileTabs>
