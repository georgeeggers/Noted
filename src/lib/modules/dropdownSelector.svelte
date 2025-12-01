<script>
import { ChevronDown } from '@lucide/svelte';
    import { fly } from 'svelte/transition';

let expanded = $state(false);
let { selected = $bindable(), options, stickLeft, displayFunc } = $props();

const click = (a) => {
  expanded = true;
  selected = a;
}


</script>



<!-- svelte-ignore a11y_no_static_element_interactions -->

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="dropDown"
    onclick={() => {expanded = !expanded}}
  >
    <ChevronDown size=16 />
    <p>{displayFunc(selected)}</p>

    {#if expanded} 
      
      <div class="content" style="{stickLeft ? "left" : "right"}: 0px;"
        transition:fly={{ x: 50, duration: 250}}
      >
        {#each options as a}
            <div class="choice"
              onclick={() => click(a)}
            >
                <p>{displayFunc(a)}</p>
            </div>
        {/each}
      </div>

    {/if}

  </div>




<style>

  p {
    font-size: calc(16px + var(--font-size-modifier));
    margin: 0px;
  }

  .choice {
    cursor: pointer;
    box-sizing: border-box;
    padding-left: 10px;
    padding-right: 10px;
  }

  .choice p {
    transition: color .25s ease;
    color: var(--text-color);
  }

  .choice:hover p {
    color: var(--main-color);
  }

  .dropDown {
    width: fit-content;
    padding: 10px;
    background-color: var(--lighter-bg-color);
    border-radius: var(--border-radius);
    cursor: pointer;
    align-items: center;
    gap: 10px;
    flex-direction: row;
    display: flex;
    cursor: pointer;
    position: relative;
    border: 1px solid var(--lightest-bg-color);
    box-sizing: border-box;
  }


  .content {
    position: absolute;
    top: calc(100% - 10px);
    background-color: #00000040;
    backdrop-filter: blur(10px);
    box-sizing: border-box;
    padding: 10px;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding-left: 0px;
    padding-right: 0px;
    z-index: 100;
  }

  .content p {
    text-wrap: nowrap;
  }

</style>