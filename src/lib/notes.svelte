<script>
  // this is a custom textarea like solution for lack of support on webkit and gecko
  import Textarea from './modules/textarea.svelte';
  import { appState, getID, settings, nodes, updateDif, difs } from '../global.svelte';
  import { fade, fly, scale } from 'svelte/transition';

  import { Cloud, File, GripHorizontal, Image, Laptop, LayoutGrid, ListTodo, PencilLine, ScrollText, Settings2, Trash, CircleSmall, Upload, Download, Copy, CheckCircle, CircleX } from '@lucide/svelte';
  import { onDestroy, onMount } from 'svelte';
    import { loadLocal, saveLocal, saveServer } from '../backend.svelte';
    import Todo from './modules/todo.svelte';
    import { replace } from 'svelte-spa-router';

  let selected = $state(-1);


  if(appState.selectedBoard == null){
    replace('/');
  }


  // node logic




  const addNode = (type) => {

    let n = {
      type: type,
      title: "",
      x: window.scrollX + window.innerWidth / 2 - 50, // get the center of the screen for adding new nodes
      y: window.scrollY + window.innerHeight / 2 - 50,
      content: type == "todo" ? [{
            type: 'single',
            value: false,
            content: ""
        }] : "",
      editing: true,
      file: null,
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

  const keydownLogic = async (e) => {
    if(e.key === 's' && e.ctrlKey){
      appState.selectedBoard.boardType == "local" ? saveLocal(appState.selectedBoard.id) : saveServer(appState.selectedBoard.id)
    } else if (e.key === 'r' && e.ctrlKey){
      // replace refresh with sorting
      e.preventDefault();
      await sort();
    }
  }

  let moveDrag = $state(false);

  onMount(async () => {
    // do this to surpress a weird error with function signatures for onMount
    if(true){

      if(appState.selectedBoard.boardType == "local"){
        await loadLocal(appState.selectedBoard.id);
      }

      document.addEventListener('keydown', keydownLogic)
      document.addEventListener('mousedown', globalMouseDown);
      document.addEventListener('mouseup', globalMouseUp)

    }
  })

  onDestroy(() => {
      document.removeEventListener('mousedown', globalMouseDown);
      document.removeEventListener('mouseup', globalMouseUp);
      document.removeEventListener('keydown', keydownLogic);
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
      n.x = settings.gap;
    }
    if(n.y < 0) {
      n.y = settings.gap;
    }

    updateDif(n, "update");
  }


  async function handleFileChange(e, n){ 
    if(e.type == "change"){
      n.file = e.target.files[0];
    } else if (e.type == "drop"){
      e.preventDefault();
      n.file = e.dataTransfer.files[0];
    }
    updateDif(n);
  };

  const get_thumbnail = (file) => {
    try {
      const url = URL.createObjectURL(file);
      return url;
    } catch {

    }
  }

  const download = (n) => {
    const url = get_thumbnail(n.file);
    const manager = document.getElementById('linkManager');
    // @ts-ignore
    manager.download = n.file.name;
    // @ts-ignore
    manager.href = url;
    manager.click();
  }

  const handleTodoCopy = (data, depth, text) => {
    for(let i of data){
      for(let _i = 0; _i < depth; _i++){
        text += " | "
      }
      if(i.type == "single"){
        text += `[${i.value ? "X" : " "}] ${i.content}\n`;
      } else {
        text += `${i.content}\n`
        text = handleTodoCopy(i.value, depth + 1, text);
      }
    }
    return text;
  }

  const copy = async (n) => {
    try {
      let text = "";
      if(n.type == "note"){
        if(n.title != ""){
          text = n.title + '\n' + n.content;
        } else {
          text = n.content;
        }
      } else {
        text = n.title + '\n\n';
        text = handleTodoCopy(n.content, 0, text);
      }

      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy text: ', error);
    }
  }

  let alertUnsaved = $state(false);

  const goBack = () => {
    if(difs.length != 0){
      alertUnsaved = true;      
    } else {
      difs.length = 0;
      nodes.length = 0;
      replace('/');
    }
  }

  const saveAndCont = () => {
    appState.selectedBoard.boardType == "local" ? saveLocal(appState.selectedBoard.id) : saveServer(appState.selectedBoard.id)    
    replace('/');
  }

  const quitNoSave = () => {
    difs.length = 0;
    nodes.length = 0;
    replace('/');
  }

  const gethighestY = (x, borders) => {
    let highestY = 0;
    for(let border of borders){
      if(x >= border.low && x <= border.high){
        if(border.output > highestY){
          highestY = border.output;
        }
      }
    }
    return highestY;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }


  let sortList = $state([])

  const sort = async () => {

    let maxY = 0;
    let totalWidth = 0;
    let totalHeight = 0;

    sortList = [];

    let index = 0;

    for(let node of nodes){
      const i = node.handle;
      sortList.push({
        // @ts-ignore
        area: i.offsetWidth * i.offsetHeight,
        // @ts-ignore
        width: i.offsetWidth,
        // @ts-ignore
        height: i.offsetHeight,
        // @ts-ignore
        flatness: i.offsetWidth / i.offsetHeight,
        x: 0,
        y: 0,
        index: index
      });
      // @ts-ignore
      totalWidth += i.offsetWidth;
      // @ts-ignore
      totalHeight += i.offsetHeight;
      index++;
    }

    let time = Math.round(1500 / sortList.length / 2);
    sortList.sort((a, b) => {
      if(a.flatness < b.flatness){
        return 1;
      } else if (a.flatness > b.flatness){
        return -1;
      }
      if(a.height < b.height){
        return -1;
      } else if (a.height > b.height){
        return 1;
      }
      return 0;
    });

    let idealWidth = (totalWidth / (Math.ceil(Math.sqrt(sortList.length)))) * 1.5;
    let eclipsedWidth = 0;
    const gap = settings.gap;
    let nextX = gap;
    let nextY = gap;
    let count = 0;
    let layers = 0;
    
    let borders = [];
    let itemLayers = [];
    let currentLayer = [];

    // lines them up horizontally

    for(let i of sortList){
      eclipsedWidth += gap + i.width;

      i.x = nextX;
      i.y = nextY;

      nodes[i.index].x = nextX;
      nodes[i.index].y = nextY;
      if(layers == 0){
        borders.push({
          low: nextX,
          high: i.width + nextX + gap,
          output: nextY + i.height + gap
        });
      }

      nextX += gap + i.width;
      if(i.height > maxY){
        maxY = i.height;
      }
      count++;
      // await sleep(time);

      currentLayer.push(i);
      if(eclipsedWidth >= idealWidth){
        eclipsedWidth = 0;
        nextY += maxY + gap;
        nextX = gap;
        maxY = 0;
        layers++;
        itemLayers.push(currentLayer);
        currentLayer = [];
      }
      updateDif(nodes[i.index], "update");
      await sleep(time);
    }
    itemLayers.push(currentLayer);
  


    let temp = [];

    // actually pushes the data down

    for(let ind = 0; ind < layers; ind++){
      for(let i of itemLayers[ind + 1]){
        let y1 = gethighestY(i.x, borders);
        let y2 = gethighestY(i.x + i.width, borders);
        if(y1 > y2){

          nodes[i.index].y = y1;
          temp.push({
            low: i.x,
            high: i.width + i.x + gap,
            output: y1 + i.height + gap
          })

        } else {

          nodes[i.index].y = y2;
          temp.push({
            low: i.x,
            high: i.width + i.x + gap,
            output: y2 + i.height + gap
          })

        }
        updateDif(nodes[i.index], "update");
        await(sleep(time));
      }
      for(let i of temp){
        borders.push(i);
      }
      temp = [];
    }


  }

</script>

<a id='linkManager' class='invis'>Link Manager</a>

<div class="globalArea">

  <div class="mainArea">

    {#each nodes as n, i (n.id)}

      <!-- use these directives for now until I implement proper aria labels-->

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="node" style='
        left: {n.x}px; 
        top: {n.y}px; 
        {selected == i ? "background-color: var(--lighter-bg-color); z-index: 2; border: 1px solid var(--lightest-bg-color);": ""} 
        max-width: {n.type == "image" ? settings.imageWidth : (n.type == "note" ? settings.noteWidth : "1000000")}px;'
        transition:scale={{ duration: 250 }}
        onmousedown={() => focusNode(i)}
        ontouchstart={(e) => focusNode(i)}
        bind:this={n.handle}
      >


        {#if n.editing}
          <Textarea placeholder="Title" bind:value={n.title} fontSize={32} padding={0} style="font-weight: bold; color: var(--header-color);"/>
        {:else}
          <p class='title' style='font-size: calc(32px + var(--font-size-modifier));'>{n.title}</p>
        {/if}

        {#if n.type == 'note'}

          {#if n.editing}
              <Textarea placeholder="Content" bind:value={n.content} fontSize={20} padding={0}/>
          {:else}
              <p>{n.content}</p>
          {/if}

        {:else if n.type == 'image'}

          {#if n.editing}
            <input
              type="file"
              onchange={(event) => handleFileChange(event, n)}
              id="uploadTrigger{n.id}"
              style="visibility: hidden; position: fixed;"
            >
          {/if}

          {#if n.file != null}
            <label for="uploadTrigger{n.id}"
              class="imagePlaceholder"
              ondrop={(e) => handleFileChange(e, n)}
              ondragover={(e) => e.preventDefault()}
              style="{n.editing ? "cursor: pointer;" : ""}"
            >
              <img src="{get_thumbnail(n.file)}" class="thumbnailImage {n.editing ? "hover" : ""}" alt="thumbnail" draggable="false"/>
            </label>
          {:else}
            <label class="imagePlaceholder {n.editing ? "hover" : ""}" style="flex-direction: row;"for="uploadTrigger{n.id}"
                ondrop={(e) => handleFileChange(e, n)}
                ondragover={(e) => e.preventDefault()}
            >
              <Upload size={64} />
            </label>
          {/if}

        {:else if n.type == 'file'}
          {#if n.editing}
            <input
              type="file"
              onchange={(event) => handleFileChange(event, n)}
              id="uploadTrigger{n.id}"
              style="visibility: hidden; position: fixed; cursor: pointer;"
            >
          {/if}

          {#if n.file != null}
            <label class="imagePlaceholder {n.editing ? "hover" : ""}" style="flex-direction: row; {n.editing ? "cursor: pointer;" : ""}"for="uploadTrigger{n.id}"
                ondrop={(e) => handleFileChange(e, n)}
                ondragover={(e) => e.preventDefault()}
            >
              <File size={64} />
            </label>
          {:else}
            <label class="imagePlaceholder {n.editing ? "hover" : ""}" style="flex-direction: row;"for="uploadTrigger{n.id}"
                ondrop={(e) => handleFileChange(e, n)}
                ondragover={(e) => e.preventDefault()}
            >
              <Upload size={64} />
            </label>
          {/if}

        {:else if n.type == 'todo'}

            <Todo bind:data={n.content} bind:editing={n.editing} depth={false} index={i} />

        {/if}










        <span class="controlBar">
          <button class="controlButton" onclick={() => toggleEdit(n)} style="{n.editing ? "color: var(--light-main-color); !important" : ""}">
            <PencilLine size={20} />
          </button>

          <button class="controlButton" onclick={() => deleteNode(i)}>
            <Trash size={20} />
          </button>

          {#if n.type == "file" || n.type == "image"}
            <button class="controlButton" onclick={() => download(n)}>
              <Download size={20} />
            </button>
          {:else}
            <button class="controlButton" onclick={() => copy(n)}>
              <Copy size={20} />
            </button>
          {/if}

          <button class='controlButton' draggable="false" 
            onmousedown={(e) => startDragDesktop(e, n)}
            onmouseup={(e) => endDragDesktop(e, n)}
          >
            <GripHorizontal size={20} ondragstart={(e) => e.preventDefault()} />
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

    <button onclick={() => addNode("image")}>
      <Image size={24} />
    </button>

    <button onclick={() => addNode("file")}>
      <File size={24} />
    </button>

    <div class="spacer"></div>

    <button onclick={sort}>
      <LayoutGrid size={24}/>
    </button>

  </div>

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="headerBar" onclick={goBack}>
    <p>{appState.selectedBoard.boardName}</p>
    {#if appState.selectedBoard.boardType == "local" }
      <Laptop size={20} />
    {:else}
      <Cloud size={20} />
    {/if}
    {#if difs.length > 0}
      <button onclick={appState.selectedBoard.boardType == "local" ? saveLocal : saveServer}>
        <CircleSmall size={20} />
      </button>
    {/if}
  </div>

  <button class='invis' id='closePopup' onclick={() => {alertUnsaved = false;}}>Close Popup</button>

  {#if alertUnsaved}
    <label class="blocker"
      transition:fade={{ duration: 250 }}
      for="closePopup"
    >

      <div class="unsavedAlert"
        transition:fly={{ x: 50, duration: 250 }}
      >
        <p>You have unsaved changes!</p>
        <div class="buttons">
          <button onclick={saveAndCont} style='width: fit-content;'>
            <CheckCircle size={20} />
            Save
          </button>
          <button onclick={quitNoSave} style='background-color: var(--fail-color) !important; border: none !important;'>
            <CircleX size={20} />
            Discard
          </button>
        </div>
      </div>

    </label>

  {/if}

</div>

<style>

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

  .buttons {
    display: flex;
    box-sizing: border-box;
    gap: 10px;
    flex-direction: row;
  }

  .buttons button {
    width: 100%;
    background-color: var(--lighter-bg-color);
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
    font-size: calc(14px + var(--font-size-modifier));
    border: 1px solid var(--lightest-bg-color);
  }

  .buttons button:hover {
    background-color: var(--lightest-bg-color);
  }

  .thumbnailImage.hover:hover {
    scale: 1.01;
  }

  .thumbnailImage.hover {
    box-sizing: border-box;
  }

  .hover {
    transition: 
      250ms ease
    ;
  }

  .hover:hover {
    color: var(--main-color);
  }


  .thumbnailImage {
    border-radius: var(--border-radius);
    width: 100%;
    margin-top: 10px;
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
    border: 1px solid var(--lightest-bg-color);
  }

  .headerBar:hover {
    background-color: var(--lightest-bg-color);
  }

  .headerBar p {
    font-size: calc(16px + var(--font-size-modifier));
    color: var(--header-color);
    margin: 0px;
  }

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
  .nodeSelector {
    border: 1px solid var(--lightest-bg-color);
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
    font-size: calc(32px + var(--font-size-modifier));
    font-weight: bold;
    color: var(--header-color);
    margin: 0px;
  }

  .mainArea {
    min-width: 10000px;
    min-height: 10000px;
    position: relative;
    box-sizing: border-box;
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
    border: 1px solid var(--lighter-bg-color);
  }

  .node p {
    margin: 0px;
    font-size: calc(20px + var(--font-size-modifier));
    white-space: pre-wrap;
    color: var(--text-color);
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

  
  .imagePlaceholder{
    justify-content: center;
    align-items: center;
    width: 100%;
    text-align: center;
  }

</style>