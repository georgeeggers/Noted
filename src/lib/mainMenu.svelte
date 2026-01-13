<script>
    import { loadBoards, deleteBoard, makeLocalBoard, makeServerBoard, deleteAllLocal, duplicateLocal, changeNameLocal, changeNameServer } from "../backend.svelte";
    import { onMount } from "svelte";
    import { addNotification, appState, customSlide, notifications, settings } from "../global.svelte";
    import { Check, CircleX, Cloud, CopyPlus, Laptop, LucideArrowLeft, NfcIcon, PlusCircle, RefreshCcw, Settings2, TextCursor, Trash} from "@lucide/svelte";
    import { replace } from 'svelte-spa-router';
    import { fade, fly, slide } from "svelte/transition";
    import { flip } from "svelte/animate";

    let loading = $state(true);

    onMount(async () => {
        await loadBoards();
        loading = false;
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

    let contextHandler = $state(null);

    const handleClick = (e, b, i) => {
        if(e.button == 0){
            toBoard(b);
        } else if (e.button == 2){
            contextHandler = b;
        }
    }

    const create = () => {
        if(settings.doServer){
            creating = true;
        } else {
            makeBoard(false);
        }
    }

    let duplicating = $state(false);

    const duplicateBoard = async(b) => {

        if(duplicating){
            return;
        }
        duplicating = true;
        const result = await duplicateLocal(b.id, `${b.boardName}_2`);
        if(result){
            addNotification(`${b.boardName} Duplicated`, "var(--input-color)", CopyPlus, 4000, 'yay');
        } else {
            addNotification("Failed to duplicate", "var(--fail-color)", CircleX, 4000, 'error');
        }
        contextHandler = null;
        renaming = false;
        newName = "";

        duplicating = false;
    }

    let renaming = $state(false);
    let newName = $state("");

    const renameBoard = async(b, name) => {
        if(b.boardType){
            await changeNameLocal(b, name);
        } else {
            await changeNameServer(b, name);
        }

        contextHandler = null;
        newName = "";
        renaming = false;
    }

</script>

<div class="uiPopups">

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="headerDiv settings {settings.animations ? 'anim' : ""}" 
        onclick={() => replace("/settings")}
    >
        <Settings2 size={18} />
        <p>Settings</p>
    </div>

    {#if loading}
        <div class="headerDiv {settings.animations ? 'anim' : ""}" 
            transition:customSlide={{ duration: settings.animations ? 500 : 0 }}  
        >
            <div class="iconWrapper {settings.animations ? "spin" : ""}">
                <RefreshCcw size={18} />
            </div>
            <p>Loading Boards</p>
        </div>
    {/if}

    {#each notifications as n}
        <div class="headerDiv {settings.animations ? 'anim' : ""}" style="background-color: {n.c}; {n.c != "var(--input-color)" ? "border: none !important;" : ""}"
            transition:customSlide={{ duration: settings.animations ? 500 : 0 }}  
        >
            <div class="iconWrapper {settings.animations ? n.classes : ""}">
                <n.i size={18} />
            </div>
            <p>{n.t}</p>
        </div>
    {/each}

</div>

<div class="globalArea">

    <h1 class="header">Noted</h1>

    <div class="content">

            
        <div class="searchBar">
            <input type="text" bind:value={searchTerm} placeholder="Search or create new board..." onkeydown={(e) => e.key == "Enter" && create()}>
        </div>  

        <div class="boards">

            {#each searchBoards as b, i (b.id)}

                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div class="board {settings.animations ? 'anim' : ""}" 
                    onmousedown={(e) => handleClick(e, b, i)}
                    transition:fly={{ duration: settings.animations ? 250 : 0, x: -40}}
                    animate:flip={{ duration: settings.animations ? 250 : 0 }}
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
                <div class="button {settings.animations ? 'anim' : ""}" 
                    onclick={create}
                    transition:fly={{ duration: settings.animations ? 250 : 0, x: -40}}  
                >
                    <PlusCircle size={18} />
                    <p>Create "{searchTerm}"</p>
                </div>
            {/if}
        </div>
    </div>

    <button class='invis' id="closeContext" onclick={() => {contextHandler = null; renaming = false; newName = "";}}>Close Popup</button>

    {#if contextHandler != null}
        <label class="blocker"
            transition:fade={{ duration: settings.animations ? 250 : 0 }}
            for='closeContext'
        >
        </label>

        <div class="unsavedAlert"
            transition:fly={{ x: 50, duration: settings.animations ? 250 : 0 }}
        >
            <p>{contextHandler.boardName}</p>
            <div class="buttons buttons2">


                {#if renaming}
                    <input type="text" bind:value={newName} placeholder="New Name..." onkeydown={(e) => e.key == "Enter" && renameBoard(contextHandler, newName)}>
                {:else}
                    <button onclick={() => {renaming = true;}}>
                        <TextCursor size={20} />
                        Rename
                    </button>
                {/if}
                {#if contextHandler.boardType}
                    <button onclick={() => duplicateBoard(contextHandler)}>
                        {#if !duplicating}

                                <CopyPlus size={20} />
                                Duplicate
                        {:else}
                            <div class="iconWrapper spin">
                                <RefreshCcw size=20 />
                            </div>
                        {/if}
                    </button>
                {/if}
                <!--
                    {#if settings.doServer}
                        <button onclick={() => {contextHandler = null}}>
                            {#if contextHandler.boardType}
                                <Cloud size={20} />
                                Copy To Cloud
                            {:else}
                                <Laptop size={20} />
                                Copy To Local
                            {/if}
                        </button>
                    {/if}
                -->
                <button onclick={() => {deleteBoard(contextHandler); contextHandler = null; renaming = false; newName = "";}} style='background-color: var(--fail-color) !important; border: none !important;'>
                    <Trash size={20} />
                    Delete
                </button>
            </div>
        </div>

    {/if}

    <button class='invis' id='closeCreate' onclick={() => {creating = false}}>Close Popup</button>

    {#if creating}
        <label class="blocker"
            transition:fade={{ duration:  settings.animations ? 250 : 0 }}
            for='closeCreate'
        >
        </label>

        <div class="unsavedAlert"
            transition:fly={{ x: 50, duration: settings.animations ? 250 : 0 }}
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


    {/if}


</div>

<style>

    .buttons2 {
        flex-direction: column;
    }

    .button {
        background-color: var(--lighter-bg-color);
        border: none;
        border-radius: var(--border-radius);
        box-sizing: border-box;
        color: var(--header-color);
        font-size: calc(16px + var(--font-size-modifier));
        padding: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        border: 1px solid var(--lightest-bg-color);
    }

    .buttons input {
        width: 100%;
        background-color: var(--lighter-bg-color);
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
        display: flex;
        border-radius: var(--border-radius);
        padding: 10px;
        cursor: pointer;
        transition: background-color .25s ease;
        color: var(--text-color);
        font-size: calc(14px + var(--font-size-modifier));
        border: 1px solid var(--lightest-bg-color);
        outline: none !important;
    }

    .button.anim {
        transition: background-color .25s ease;
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
        font-size: calc(16px + var(--font-size-modifier));
        padding: 10px;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        border: 1px solid var(--lightest-bg-color);
    }

    .searchBar input {
        background: none;
        border: none;
        display: flex;
        flex-direction: row;
        box-sizing: border-box;
        font-size: calc(16px + var(--font-size-modifier));
        color: var(--header-color);
        outline: none !important;
        width: 100%;
    }

    .searchBar::placeholder {
        color: var(--header-color);
        opacity: 0.5;
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
        gap: 10px;
        color: var(--text-color);
        border: 1px solid var(--lighter-bg-color);
    }

    .board.anim {
        transition: background-color .25s ease;
    }

    .headerRow p {
        font-size: calc(18px + var(--font-size-modifier));
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
        font-size: calc(16px + var(--font-size-modifier));
    }

    .board:hover {
        background-color: var(--lighter-bg-color);
    }

    .header {
        margin: 0px;
        font-size: calc(40px + var(--font-size-modifier));
        color: var(--header-color);
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
        font-size: calc(14px + var(--font-size-modifier));
        }
    }

    @media (max-width: 500px){
        .searchBar input {
            font-size: calc(12px + var(--font-size-modifier));
        }
    }

</style>
