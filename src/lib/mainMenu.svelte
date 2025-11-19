<script>
    import { loadBoards, deleteBoard, makeLocalBoard, makeServerBoard, deleteAllLocal } from "../backend.svelte";
    import { onMount } from "svelte";
    import { appState } from "../global.svelte";
    import { Cloud, Laptop, LucideArrowLeft, PlusCircle, Settings2, Trash} from "@lucide/svelte";
    import { replace } from 'svelte-spa-router';
    import { fade, fly, scale, slide } from "svelte/transition";
    import { flip } from "svelte/animate";

    onMount(async () => {

        await loadBoards();
    });

    let searchTerm = $state("");

    let searchBoards = $derived(searchTerm == "" ? appState.boards : appState.boards.filter(m => m.boardName.toLowerCase().includes(searchTerm.toLowerCase())));


    const toBoard = async (b) => {
        appState.selectedBoard = b;
        replace('/notes');
    }

    let creating = $state(false);

    const makeBoard = async (isServer) => {
        if(!isServer){
            await makeLocalBoard(searchTerm);
        } else {
            await makeServerBoard(searchTerm);
        }
        await toBoard(appState.boards[appState.boards.length - 1]);
    }

    let deleteHandler = $state(null);

    const handleClick = (e, b, i) => {
        if(e.button == 0){
            toBoard(b);
        } else if (e.button == 2){
            deleteHandler = b;
        }
    }

</script>

<div class="globalArea">

    <h1 class="header">Noted</h1>

    <div class="content">

            
        <div class="searchBar">
            <input type="text" bind:value={searchTerm} placeholder="Search or create new board...">
        </div>  

        <div class="boards">

            {#each searchBoards as b, i (b.id)}

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="board" 
                    onmousedown={(e) => handleClick(e, b, i)}
                    transition:fly={{ duration: 250, x: -40}}
                    animate:flip={{ duration: 250 }}
                >
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

            {#if searchTerm != ""}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="button" 
                    onclick={() => {creating = true}}
                    transition:fly={{ duration: 250, x: -40}}  
                >
                    <PlusCircle size={18} />
                    <p>Create "{searchTerm}"</p>
                </div>
            {/if}

            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div class="button" 
                onclick={() => replace("/settings")}
                transition:fly={{ duration: 250, x: -40}}  
            >
                <Settings2 size={18} />
                <p>Settings</p>
            </div>
        </div>
    </div>

    {#if deleteHandler != null}
        <div class="blocker"
            transition:fade={{ duration: 250 }}
        >

        <div class="unsavedAlert"
            transition:fly={{ x: 50, duration: 250 }}
        >
            <p>Delete Board?</p>
            <div class="buttons">
            <button onclick={() => {deleteHandler = null}}>
                <LucideArrowLeft size={20} />
                Back
            </button>
            <button onclick={() => {deleteBoard(deleteHandler); deleteHandler = null}} style='background-color: var(--fail-color) !important;'>
                <Trash size={20} />
                Delete
            </button>
            </div>
        </div>

        </div>

    {/if}

    {#if creating}
        <div class="blocker"
            transition:fade={{ duration: 250 }}
        >

        <div class="unsavedAlert"
            transition:fly={{ x: 50, duration: 250 }}
        >
            <p>Local Or Server</p>
            <div class="buttons">
            <button onclick={() => makeBoard(false)}>
                <Laptop size={20} />
                Local
            </button>
            <button onclick={() => makeBoard(true)}>
                <Cloud size={20} />
                Server
            </button>
            </div>
        </div>

        </div>

    {/if}


</div>

<style>

    .button {
        background-color: var(--lighter-bg-color);
        transition: background-color .25s ease;
        border: none;
        border-radius: var(--border-radius);
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

    .boards {
        display: flex;
        flex-direction: row;
        gap: 10px;
        flex-wrap: wrap;
    }

    .searchBar {
        background-color: var(--lighter-bg-color);
        border: none;
        border-radius: var(--border-radius);
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
        font-size: 16px;
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
        width: fit-content;
        display: flex;
        flex-direction: column;
        padding: 10px;
        border-radius: var(--border-radius);
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
    }

    @media (max-width: 700px){
        .searchBar input {
            font-size: 14px;
        }
    }

    @media (max-width: 500px){
        .searchBar input {
            font-size: 12px;
        }
    }

    .blocker {
        width: 100vw;
        height: 100vh;
        background-color: #00000040;
        backdrop-filter: blur(5px);
        position: fixed;
        left: 0px;
        top: 0px;
        z-index: 100;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .unsavedAlert {
        width: fit-content;
        height: fit-content;
        padding: 20px;
        background-color: var(--light-bg-color);
        box-sizing: border-box;
        border-radius: var(--border-radius);
        flex-direction: column;
        gap: 10px;
        display: flex;
        color: var(--header-color);
    }

    .buttons {
        display: flex;
        box-sizing: border-box;
        gap: 10px;
        flex-direction: row;
    }

    .buttons button {
        width: 100%;
        background-color: var(--lighter-bg-color);
        border: none;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        display: flex;
        gap: 7px;
        border-radius: var(--border-radius);
        padding: 10px;
        cursor: pointer;
        transition: background-color .25s ease;
        color: var(--text-color);
        font-size: 14px;
    }

    .buttons button:hover {
        background-color: var(--lightest-bg-color);
    }


    .unsavedAlert p {
        margin: 0px;
        font-size: 18px;
    }


</style>
