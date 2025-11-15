<script>
    import { loadBoards, loadLocal, loadSever, makeLocalBoard } from "../backend.svelte";
    import { onMount } from "svelte";
    import { appState } from "../global.svelte";
    import { Cloud, Laptop, PlusCircle} from "@lucide/svelte";
    import { replace } from 'svelte-spa-router';



    onMount(async () => {
        await loadBoards();
    });

    let searchTerm = $state("");

    let searchBoards = $derived(searchTerm == "" ? appState.boards : appState.boards.filter(m => m.boardName.toLowerCase().includes(searchTerm.toLowerCase())));


    const toBoard = async (b) => {
        appState.selectedBoard = b;
        replace('/notes');
    }

    const makeBoard = async () => {
        await makeLocalBoard(searchTerm);
        await toBoard(appState.boards[appState.boards.length - 1]);
    }

</script>

<div class="globalArea">

    <h1 class="header">Noted</h1>

    <div class="content">

            
        <div class="searchBar">
            <input type="text" bind:value={searchTerm} placeholder="Search or create new board...">
        </div>  


        <!-- svelte-ignore a11y_no_static_element_interactions -->
        {#if searchTerm.length != 0}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="button" onclick={makeBoard}>
                <PlusCircle size={18} />
                <p>Create "{searchTerm}"</p>
            </div>
        {/if}


        {#each searchBoards as b}

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

    .button {
        background-color: var(--lighter-bg-color);
        transition: background-color .25s ease;
        border: none;
        border-radius: 5px;
        box-sizing: border-box;
        color: var(--header-color);
        font-size: 16px;
        padding: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 7px;
        cursor: pointer;
    }

    .searchBar {
        background-color: var(--lighter-bg-color);
        border: none;
        border-radius: 5px;
        box-sizing: border-box;
        color: var(--header-color);
        font-size: 16px;
        padding: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 7px;
        cursor: pointer;
    }

    .searchBar input {
        background: none;
        border: none;
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        font-size: 18px;
        outline: none !important;
        width: 100%;
    }

    .button p {
        margin: 0px;
    }

    .button:hover {
        background-color: var(--lightest-bg-color);
    }

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
        color: var(--text-color);
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

    @media (max-width: 700px){
        .searchBar input {
            font-size: 16px;
        }
    }

    @media (max-width: 500px){
        .searchBar input {
            font-size: 14px;
        }
    }

</style>
