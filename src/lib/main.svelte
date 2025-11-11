<script>
  // this is a custom textarea like solution for lack of support on webkit and gecko
  import Textarea from './modules/textarea.svelte';
  import { appState, boards, getID, settings, nodes, updateDif, difs } from '../global.svelte';
  import { scale } from 'svelte/transition';

  import { Cloud, File, GripHorizontal, Image, Laptop, LayoutGrid, ListTodo, PencilLine, ScrollText, Settings2, Trash, CircleSmall } from '@lucide/svelte';
  import { onMount } from 'svelte';
    import { loadLocal, saveLocal, saveServer } from '../backend.svelte';

  let selected = $state(-1);


  // node logic


  const addNode = (type) => {

    let n = {
      type: type,
      title: "",
      x: window.scrollX + window.outerWidth / 2 - 100,
      y: window.scrollY + window.outerHeight / 2 - 100,
      content: "",
      editing: true,
      id: getID(),
    }

    nodes.push(n);

    updateDif(n, "create");

    selected = nodes.length - 1;
  }

  const toggleEdit = (n) => {
    n.editing = !n.editing;
    updateDif(n, "update");
  }

  const deleteNode = (index) => {
    let n = nodes.splice(index, 1);
    selected = -1;

    updateDif(n[0], "delete");
  }



  // movement logic

  let offsetX = $state(0);
  let offsetY = $state(0);

  let dragLogicDesktop = (e) => {
    nodes[selected].x = e.pageX + offsetX;
    nodes[selected].y = e.pageY + offsetY;
  }

  let dragLogicMobile = (e) => {
    nodes[selected].x = e.changedTouches[0].pageX + offsetX;
    nodes[selected].y = e.changedTouches[0].pageY + offsetY;
  }

  const moveLogic = (e) => {
    if(moveDrag){
      window.scrollBy(e.movementX * -1, e.movementY * -1);
    }
  }

  const globalMouseDown = (e) => {
    if (e.button == 2){
      e.preventDefault();
      moveDrag = true;
      document.addEventListener('mousemove', moveLogic);
    }
  }


  const globalMouseUp = (e) => {
    if(e.button == 2){
      moveDrag = false;
      document.removeEventListener('mousemove', moveLogic);
    }
  }

  let moveDrag = $state(false);

  onMount(() => {
    // do this to surpress a weird error with function signatures for onMount
    if(true){
      document.removeEventListener('mousedown', globalMouseDown);
      document.removeEventListener('mouseup', globalMouseUp)
      document.removeEventListener('contextmenu', (event) => { 
        event.preventDefault(); 
      });


      document.addEventListener('mousedown', globalMouseDown);
      document.addEventListener('mouseup', globalMouseUp)
      document.addEventListener('contextmenu', (event) => { 
        event.preventDefault(); 
      });
    }
  })

  const focusNode = (index) => {
    selected = index;
  }

  const startDragDesktop = (e, n) => {
    document.addEventListener('mousemove', dragLogicDesktop);
    offsetX = n.x - e.pageX;
    offsetY = n.y -  e.pageY;
  }

  const endDragDesktop = (e, n) => {
    document.removeEventListener('mousemove', dragLogicDesktop);
    if(n.x < 0) {
      n.x = 0;
    }
    if(n.y < 0) {
      n.y = 0;
    }

    updateDif(n, "update");
  }

  const startDragMobile = (e, n) => {
    offsetX = n.x - e.touches[0].pageX;
    offsetY = n.y -  e.touches[0].pageY;
    document.addEventListener('touchmove', dragLogicMobile)
  }

  const endDragMobile = (e, n) => {
    console.log("Ending mobile drag!")
    document.removeEventListener('mousemove', dragLogicMobile);
    if(n.x < 0) {
      n.x = 0;
    }
    if(n.y < 0) {
      n.y = 0;
    }

    updateDif(n, "update");
  }




</script>

<div class="globalArea">

  <div class="mainArea">

    {#each nodes as n, i (n.id)}

      <!-- use these directives for now until I implement proper aria labels-->

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="node" style='
        left: {n.x}px; 
        top: {n.y}px; 
        {selected == i ? "background-color: var(--lighter-bg-color); z-index: 2;": ""} 
        max-width: {n.type == "image" ? settings.imageWidth : (n.type == "note" ? settings.noteWidth : "1000000")}px;'
        transition:scale={{ duration: 250 }}
        onmousedown={() => focusNode(i)}
        ontouchstart={(e) => focusNode(i)}
      >


        {#if n.editing}
          <Textarea placeholder="Title" bind:value={n.title} fontSize={32} padding={0} style="font-weight: bold; color: var(--header-color);"/>
        {:else}
          <p class='title' style='font-size: 32px;'>{n.title}</p>
        {/if}


        {#if n.type == 'note'}

          {#if n.editing}
              <Textarea placeholder="Content" bind:value={n.content} fontSize={20} padding={0}/>
          {:else}
              <p>{n.content}</p>
          {/if}

        {/if}

        <span class="controlBar">
          <button class="controlButton" onclick={() => toggleEdit(n)} style="{n.editing ? "color: var(--light-main-color); !important" : ""}">
            <PencilLine size={20} />
          </button>

          <button class="controlButton" onclick={() => deleteNode(i)}>
            <Trash size={20} />
          </button>

          <button class='controlButton' 
            onmousedown={(e) => startDragDesktop(e, n)}
            onmouseup={(e) => endDragDesktop(e, n)}
            ontouchstart={(e) => startDragMobile(e, n)}
            ontouchend={(e) => endDragMobile(e, n)}
          >
            <GripHorizontal size={20} />
          </button>


        </span>

      </div>
    {/each}
  </div>




  <div class="nodeSelector">
    <button onclick={() => addNode("note")}>
      <ScrollText size={24} />
    </button>

    <button onclick={() => addNode("todo")}>
      <ListTodo size={24} />
    </button>

    <button onclick={() => addNode("file")}>
      <Image size={24} />
    </button>

    <button onclick={() => addNode("file")}>
      <File size={24} />
    </button>

    <div class="spacer"></div>

    <button onclick={loadLocal}>
      <LayoutGrid size={24}/>
    </button>

    <button>
      <Settings2 size={24}/>
    </button>

  </div>

  <div class="headerBar">
    <p>{boards[appState.selectedBoard].name}</p>
    {#if boards[appState.selectedBoard].isLocalSaved }
      <Laptop size={20} />
    {:else}
      <Cloud size={20} />
    {/if}
    {#if difs.length > 0}
      <button onclick={boards[appState.selectedBoard].isLocalSaved ? saveLocal : saveServer}>
        <CircleSmall size={20} />
      </button>
    {/if}
  </div>

</div>

<style>

  .nodeSelector button, .headerBar button {
    border: none;
    box-sizing: border-box;
    padding: 0px;
    background: none;
    justify-content: center;
    align-items: center;
    display: flex;
    cursor: pointer;
    color: var(--header-color);
    transition: color .25s ease;
  }

  .nodeSelector button:hover, .headerBar button:hover {
    color: var(--main-color);
  }


  .spacer {
    border-left: 1px solid var(--header-color);
    opacity: 0.5;
    height: 100%;
    display: flex;
    box-sizing: border-box;
  }

  .nodeSelector .spacer {
    height: 20px;
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

    backdrop-filter: blur(5px);

  }

  .headerBar p {
    font-size: 16px;
    margin: 0px;
  }

  .nodeSelector {
    width: fit-content;
    box-sizing: border-box;
    background-color: var(--input-color);
    height: fit-content;
    position: fixed;
    z-index: 10;

    backdrop-filter: blur(5px);

    bottom: 50px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: row;
    border-radius: var(--border-radius);
    left: 50%;
    transform: translate(-50%);
    gap: 20px;
    padding-left: 20px;
    padding-right: 20px;

    color: var(--header-color);
  }

  .globalArea {
    box-sizing: border-box;
    position: relative;
    width: 100%;
    height: 100%;
  }

  .title {
    font-size: 32px;
    font-weight: bold;
    color: var(--header-color);
    margin: 0px;
  }

  .mainArea {
    min-width: 10000px;
    min-height: 10000px;
    position: relative;
    box-sizing: border-box;

    background:
      linear-gradient(90deg, var(--bg-color) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
      linear-gradient(var(--bg-color) calc(var(--dot-space) - var(--dot-size)), transparent 1%) center / var(--dot-space) var(--dot-space),
      var(--text-color)
    ;
  }

  .node {
    min-width: 100px;
    position: absolute;
    background-color: var(--light-bg-color);

    display: flex;
    scale: 1;
    box-sizing: border-box;
    width: fit-content;
    height: fit-content;
    flex-direction: column;
    padding: 20px;
    border-radius: var(--border-radius);
    position: absolute;
    transition: 
      background-color 250ms,
      border-radius 250ms,
      scale 500ms
    ;
    backdrop-filter: blur(var(--blur-radius));
    min-width: 100px;
  }

  .node p {
    margin: 0px;
    font-size: 20px;
    white-space: pre-wrap;
  }

  .controlBar {
    width: 100%;
    height: fit-content;
    display: flex;
    gap: 10px;
    box-sizing: border-box;
    padding-top: 10px;
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

  button {
    outline: none !important;
  }

</style>