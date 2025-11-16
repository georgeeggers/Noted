<script>
    import { replace } from "svelte-spa-router";
    import { onMount } from "svelte";

    onMount(() => {
        alert("Settings coming soon");
        replace('/')
    })
</script>