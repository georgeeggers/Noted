<script>
    import { CircleX, PlusCircle } from '@lucide/svelte';
    import Textarea from './textarea.svelte';
    let { data = $bindable(), editing = $bindable(), depth, index } = $props();
    import Self from './todo.svelte';
    import { updateDif, updateDifByIndex } from '../../global.svelte';

    const addData = () => {
        data.push({
            type: 'single',
            value: false,
            content: ""
        })
        updateDifByIndex(index, "update");
    }

    const toggleData = (d) => {
        d.value = !d.value;
        updateDifByIndex(index, "update");
    }

    const deleteItem = (i) => {
        data.splice(i, 1);
        updateDifByIndex(index, "update");
    }

    const makeMulti = (d) => {
        d.type = 'multi';
        d.value = [{
            type: 'single',
            value: false,
            content: ""
        }];
        updateDifByIndex(index, "update");
    }


</script>

<div class="main" style="{depth ? "padding-left: 16px; margin-left: 9px; border-left: 2px solid var(--header-color);" : ""}">


    {#each data as d, index}

        <div class="inline">

            {#if d.type == "single"}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <div class="todoBorder" onclick={() => toggleData(d)} style="{d.value ? "background-color: var(--main-color)" : ""}"></div>
            {/if}

            {#if editing}

                <Textarea bind:value={d.content} placeholder={`Item ${index + 1}`} style="max-width: fit-content; min-width: 10px;" padding={0}/>

                {#if d.type == "single"}
                    <button class="controlButton" onclick={() => makeMulti(d)}>
                        <PlusCircle size={20} />
                    </button>
                {/if}

                <button class="controlButton fail" onclick={() => deleteItem(index)}>
                    <CircleX size={20} />
                </button>

            {:else}
                <p>{d.content}</p>
            {/if}

        </div>

            {#if d.type == "multi"}
                <Self bind:data={d.value} bind:editing={editing} depth={true} index={index}/>
            {/if}
    {/each}

    {#if editing}

        <div class="inline">
            <button class="controlButton" onclick={addData}>
                <PlusCircle size={20} />
            </button>
            <p>New</p>
        </div>

    {/if}

</div>



<style>
    .main {
        display: flex;
        flex-direction: column;
        gap: 5px;
        box-sizing: border-box;
        width: 100%;
    }


    .inline {
        display: flex;
        flex-direction: row;
        gap: 10px;
        width: fit-content;
        height: fit-content;
        align-items: center;
        justify-content: left;
    }

    .todoBorder {
        min-width: 20px;
        min-height: 20px;
        border: 2px solid var(--text-color);
        display: flex;
        box-sizing: border-box;
        border-radius: 100%;
        align-items: center;
        cursor: pointer;
        justify-content: center;
        transition:
            background-color 500ms
        ;
    }

    p {
        margin: 0px;
        font-size: 20px;
        white-space: pre-wrap;
    }

    .controlButton {
        background: none;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        color: var(--text-color);
        cursor: pointer;
        transition:
        color 250ms
        ;
        padding: 0px;
        box-sizing: border-box;
    }

    .controlButton:hover {
        color: var(--dim-main-color);
    }

    .fail:hover {
        color: var(--fail-color);
    }



</style>
