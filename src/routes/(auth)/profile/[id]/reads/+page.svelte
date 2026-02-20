<script>
    import ProfileTabs from "../ProfileTabs.svelte";
    import ProfileReads from "./ProfileReads.svelte";

    let { data } = $props();
</script>

<ProfileTabs user={data.userState} active="reads">
    <ProfileReads {data} />
</ProfileTabs>
