<script>
import { ChevronDown } from '@lucide/svelte';
    import { fly } from 'svelte/transition';

let expanded = $state(false);
let { selected = $bindable(), options, stickLeft, displayFunc = (a) => {return a}, callbackFunc = (a) => {} } = $props();


const click = (a) => {
  expanded = true;
  selected = a;
  callbackFunc(a);
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
      
      <div class="dropdownContent" style="{stickLeft ? "left" : "right"}: 0px;"
        transition:fly={{ x: 50, duration: 250}}
      >
        {#each options as a}
            <div class="choice"
              onclick={() => click(a)}
            >
              <div class="option">
                <p>{displayFunc(a)}</p>
              </div>
            </div>
        {/each}
      </div>

    {/if}

  </div>




<style>

  p {
    font-size: calc(16px + var(--font-size-modifier));
    margin: 0px;
    color: var(--text-color);
  }

  .option {
    transition: background-color .25s ease;
    padding: 3px;
    box-sizing: border-box;
    border-radius: var(--border-radius);
    padding-left: 5px;
    padding-right: 5px;
    color: var(--text-color);
  }

  .option:hover {
    background-color: var(--lightest-bg-color);
  }

  .choice {
    cursor: pointer;
    box-sizing: border-box;
  }

  .choice p {
    transition: color .25s ease;
    color: var(--text-color);
  }



  .dropDown {
    width: fit-content;
    height: fit-content;
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
    transition: background-color .25s ease;
    color: var(--text-color);
  }

  .dropDown:hover {
    background-color: var(--lightest-bg-color);
  }


  .dropdownContent {
    position: absolute;
    top: calc(100% - 10px);
    background-color: var(--bg-color);
    backdrop-filter: saturate(90%) blur(5px);
    box-sizing: border-box;
    border-radius: var(--border-radius);
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
    z-index: 100;
    width: fit-content;
    border: 1px solid var(--lightest-bg-color);

  }

  .dropdownContent p {
    text-wrap: nowrap;
  }



</style>