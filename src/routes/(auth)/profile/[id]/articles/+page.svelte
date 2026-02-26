<script>
    import ProfileTabs from "../ProfileTabs.svelte";
    import ProfileArticles from "./ProfileArticles.svelte";

    let { data } = $props();
</script>

<ProfileTabs user={data.userState} active="articles">
    <ProfileArticles {data} />
</ProfileTabs>
