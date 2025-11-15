<script>
    import { loadBoards, loadLocal, loadSever } from "../backend.svelte";
    import { onMount } from "svelte";
    import { appState } from "../global.svelte";
    import { Cloud, Laptop} from "@lucide/svelte";
    import { replace } from 'svelte-spa-router';



    onMount(async () => {

        await loadBoards();
    });

    const toBoard = async (b) => {
        appState.selectedBoard = b;
        replace('/notes');
    }

</script>

<div class="globalArea">

    <h1 class="header">Noted</h1>

    <div class="content">

        {#each appState.boards as b}

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="board" onclick={() => toBoard(b)}>
                <div class="headerRow">
                    <p>{b.boardName}</p>
                    {#if b.boardType == "local"}
                        <Laptop size={18} />
                    {:else}
                        <Cloud size={18} />
                    {/if}
                </div>
            </div>
        {/each}

    </div>
</div>

<style>

    .board {
        cursor: pointer;
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 10px;
        border-radius: 5px;
        background-color: var(--light-bg-color);
        box-sizing: border-box;
        transition: background-color .25s ease;
        gap: 10px;

    }

    .headerRow p {
        font-size: 18px;
    }

    .headerRow {
        width: 100%;
        box-sizing: border-box;
        gap: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding-left: 10px;
        padding-right: 10px;
    }

    .board p {
        color: var(--header-color);
        margin: 0px;
        font-size: 16px;
    }

    .board:hover {
        background-color: var(--lighter-bg-color);
    }

    .content {
        height: fit-content;
        min-height: 100px;
        width: 100%;
        max-width: 600px;
        box-sizing: border-box;
        padding: 20px;
        gap: 10px;
        display: flex;
        flex-direction: column;
    }

    .header {
        margin: 0px;
        font-size: 40px;
    }

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
        overflow: hidden;

        background:
            linear-gradient(90deg, var(--bg-color) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
            linear-gradient(var(--bg-color) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
            var(--text-color)
        ;

    }

</style>
