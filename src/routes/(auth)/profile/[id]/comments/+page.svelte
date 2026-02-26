<script>
    import ProfileTabs from "../ProfileTabs.svelte";
    import ProfileComments from "./ProfileComment.svelte";

    let { data } = $props();
</script>

<ProfileTabs user={data.userState} active="comments">
    <ProfileComments data={data.comments} user={data.userState} />
</ProfileTabs>
