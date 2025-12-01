<script>
    import { replace } from "svelte-spa-router";
    import { onMount } from "svelte";
    import { ArrowLeft, Menu } from "@lucide/svelte";

    onMount(() => {
    })
</script>



<div class="globalArea">

    <h1 class='header'>Settings</h1>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="headerBar" onclick={() => replace("/")}>
        <p>Back</p>
        <ArrowLeft size={20} />
    </div>

    

</div>



<style>

.globalArea {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 100%;
    align-items: center;
    display: flex;
    padding: 50px;
    gap: 10px;
    flex-direction: column;
}

.header {
    margin: 0px;
    font-size: calc(40px + var(--font-size-modifier));
}


.headerBar {
    width: fit-content;
    box-sizing: border-box;
    background-color: var(--input-color);
    height: fit-content;
    position: fixed;
    z-index: 10;
    top: 20px;
    right: 20px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: row;
    border-radius: var(--border-radius);
    gap: 10px;
    color: var(--header-color);
    transition: background-color .25s ease;
    backdrop-filter: blur(5px);
    cursor: pointer;
}

.headerBar:hover {
    background-color: var(--lightest-bg-color);
}

.headerBar p {
    font-size: calc(16px + var(--font-size-modifier));
    margin: 0px;
}
</style>