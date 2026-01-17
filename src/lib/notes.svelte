<script>
  // this is a custom textarea like solution for lack of support on webkit and gekko
  import Textarea from './modules/textarea.svelte';
  import { appState, getID, settings, nodes, lines, updateDif, difs, createDebounce, notifications, customSlide, addNotification } from '../global.svelte';
  import { fade, fly, scale } from 'svelte/transition';

  import { Cloud, File, GripHorizontal, Image, Laptop, LayoutGrid, ListTodo, PencilLine, ScrollText, Settings2, Trash, CircleSmall, Upload, Download, Copy, CheckCircle, CircleX, Search, TruckElectric, FileCheck, ChevronRight, ArrowBigRight, MoveUpRight, Minus, MoveHorizontal, MoveRight, ChevronsRight, ChevronLeft, LucideArrowDown10 } from '@lucide/svelte';
  import { onDestroy, onMount } from 'svelte';
  import { loadLocal, loadServer, saveLocal, saveServer } from '../backend.svelte';
  import Todo from './modules/todo.svelte';
  import { replace } from 'svelte-spa-router';

  let selected = $state(-1);

  const levels = [2, 1.5, 1.25, 1, .75, .5, .25];

  let zoomIndex = $state(3);
  const zoomLevel = $derived(levels[zoomIndex]);

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
      boardID: appState.selectedBoard.id
    }

    n.id = getID();

    nodes.push(n);

    updateDif(n, "create", true);

    selected = nodes.length - 1;
  }

  const toggleEdit = (n) => {
    if(lineMode){
      return;
    }
    n.editing = !n.editing;
    updateDif(n, "update", true);
  }

  const deleteNode = (index) => {

    if(lineMode){
      return;
    }

    const node = nodes[index];


    for(let i = 0; i < lines.length; i++){
      const line = lines[i];

      if(line.n2 == node || line.n1 == node){
        deleteLine(line);
        i--;
      }
    }


    let n = nodes.splice(index, 1);
    selected = -1;

    updateDif(n[0], "delete", true);
  }

  // movement logic

  let offsetX = $state(0);
  let offsetY = $state(0);

  let dragLogicDesktop = (e) => {
    nodes[selected].x += e.movementX * zoomLevel;
    nodes[selected].y += e.movementY * zoomLevel;
  }



  const moveLogic = (e) => {
    if(moveDrag){
      window.scrollBy(e.movementX * -1, e.movementY * -1);
    }
  }

  const globalMouseDown = (e) => {
    if (e.button == 2){
      e.preventDefault();
      if(dragging == null){
        moveDrag = true;
        document.addEventListener('mousemove', moveLogic);
      }
    }
  }


  const globalMouseUp = (e) => {
    if(e.button == 2){
      moveDrag = false;
      document.removeEventListener('mousemove', moveLogic);
    } else if (e.button == 0 && dragging != null){
      endDragDesktop(e, dragging);
    }
  }

  let showZoom = $state(false);

  const zoomDebouncer = createDebounce(() => {showZoom = false}, 3000);

  const keydownLogic = async (e) => {
    if(e.key === 's' && (e.ctrlKey || e.metaKey)){
      appState.selectedBoard.boardType == "local" ? saveLocal(appState.selectedBoard.id) : saveServer(appState.selectedBoard.id)
    } else if (e.key === 'r' && (e.ctrlKey || e.metaKey)){
      // replace refresh with sorting
      e.preventDefault();
      await sort();
    } else if (e.key === "-" && (e.ctrlKey || e.metaKey)){
      showZoom = true;
      zoomDebouncer();
      if(zoomIndex != 0){
        zoomIndex--;
      }
    } else if ((e.key === "=" || e.key === "+") && (e.ctrlKey || e.metaKey)){
      showZoom = true;
      zoomDebouncer();
      if(zoomIndex != levels.length - 1){
        zoomIndex++;
      }
    } else if ((e.key === "Escape")) {
      goBack();
    }
  }

  let moveDrag = $state(false);

  onMount(async () => {
    // do this to surpress a weird error with function signatures for onMount
    if(true){

      if(appState.selectedBoard.boardType == "local"){
        await loadLocal(appState.selectedBoard.id);
      } else {
        await loadServer(appState.selectedBoard.id);
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
    if(lineMode){
      if(lineBuilder == null){
        lineBuilder = nodes[index];
      } else {

        const temp = {id: getID(), n1: lineBuilder, n2: nodes[index], type: lineType, boardID: appState.selectedBoard.id};
        if(testLine(temp)){
          lines.push(temp);
          updateDif(temp, "create", false);
        }

        lineBuilder = null;
      }
    }
    selected = index;
  }

  let dragging = $state(null);

  const startDragDesktop = (e, n) => {
    dragging = n;
    document.addEventListener('mousemove', dragLogicDesktop);
    offsetX = n.x - e.pageX;
    offsetY = n.y -  e.pageY;
  }

  const endDragDesktop = (e, n) => {
    dragging = null;
    document.removeEventListener('mousemove', dragLogicDesktop);
    if(n.x < 0) {
      n.x = settings.gap;
    }
    if(n.y < 0) {
      n.y = settings.gap;
    }
    if(!lineMode){
      updateDif(n, "update", true);
    }
  }


  async function handleFileChange(e, n){ 
    if(e.type == "change"){
      n.file = e.target.files[0];
    } else if (e.type == "drop"){
      e.preventDefault();
      n.file = e.dataTransfer.files[0];
    }
    updateDif(n, "create", true);
  };

  const get_thumbnail = (file) => {

    if(typeof(file) == "string"){
      return file;
    } else {
      const url = URL.createObjectURL(file);
      return url;
    }
  }

  const download = (n) => {
    let url = get_thumbnail(n.file);
    if(appState.selectedBoard.boardType == undefined){
      url += "?download=1"
    }
    const manager = document.getElementById('linkManager');
    // @ts-ignore
    manager.download = n.file.name;
    // @ts-ignore
    manager.href = url;
    manager.click();
    addNotification("File Downloaded", "var(--input-color)", FileCheck, 4000, 'yay');
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

    if(lineMode){
      return;
    }

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
      addNotification(text="Copied To Clipboard ", "var(--input-color);", Copy, 4000, "yay")
    } catch (error) {
      addNotification("Failed To Copy Text", "var(--fail-color)", CircleX, 4000, 'error');
    }
  }

  const copyCode = async (data) => {
    try {
      await navigator.clipboard.writeText(data);
      addNotification("Copied To Clipboard", "var(--input-color);", Copy, 4000, "yay")
    } catch (error) {
      addNotification("Failed To Copy Text", "var(--fail-color)", CircleX, 4000, 'error');
    }
  }

  let alertUnsaved = $state(false);

  const goBack = () => {
    if(difs.length != 0){
      alertUnsaved = true;      
    } else {
      difs.length = 0;
      nodes.length = 0;
      lines.length = 0;
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
    lines.length = 0;
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
        sortingCritera: i.offsetWidth * i.offsetHeight,
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

    let time = Math.round(750 / sortList.length);
    sortList.sort((a, b) => {
      if(a.sortingCritera < b.sortingCritera){
        return 1;
      } else if (a.sortingCritera > b.sortingCritera){
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
          high: i.width + nextX + gap - 1,
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
      updateDif(nodes[i.index], "update", true);
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
            high: i.width + i.x + gap -1,
            output: y1 + i.height + gap
          })

        } else {
          nodes[i.index].y = y2;
          temp.push({
            low: i.x,
            high: i.width + i.x + gap -1,
            output: y2+ i.height + gap
          })

        }
        updateDif(nodes[i.index], "update", true);
        await(sleep(time));
      }
      borders.length = 0;
      for(let i of temp){
        borders.push(i);
      }
      temp = [];
    }
  }

  const parseText = (input) => {
    const data = input.split("\`\`\`");
    let output = []
    let codeSwitcher = false;

    for(let i of data){
      if(codeSwitcher){
        output.push({type: "code", value: i.trim()});
      } else {
        output.push({type: "text", value: i});
      }
      codeSwitcher = !codeSwitcher;
    }
    
    return output
  }

  let lineMode = $state(false);
  let lineType = $state(0);
  let lineBuilder = $state(null);

  const testLine = (line) => {
    if(line.n1 == line.n2) {
      addNotification("Lines Must Connect To Unique Nodes", "var(--fail-color)", CircleX, 4000, 'error');
      return false;
    }

    for(let i of lines){
      if((line.n1 == i.n1 && line.n2 == i.n2) || (line.n1 == i.n2 && line.n2 == i.n1)){
        i.type = lineType;
        updateDif(i, "update", false);
        return false
      }
    }
    return true;
  }

  const findSideCoords = (n1, n2) => {
    let ang1 = Math.atan2(n2.y - n1.y,  n2.x - n1.x)
    // use above for intermediary calc
    let ang = ang1 + (ang1 < 0 ? 2 * Math.PI : 0)
    // thats the angle from 0 to 2pi from n1 to n2 (desmos makes their Math.atan2 func from -pi to pi so correct that)
    
    let n1tan = Math.atan2(n1.handle.offsetHeight, n1.handle.offsetWidth) // note the height and width need to be positive
    let n2tan = Math.atan2(n2.handle.offsetHeight, n2.handle.offsetWidth) // ditto

    let n1side, n2side; // init our vars ofc

    if (-n1tan <= ang && ang < n1tan){
      n1side = 0 // represents east
    }  else if (n1tan <= ang  && ang < Math.PI - n1tan) {
      n1side = 3 // represents north
    } else if (Math.PI - n1tan <= ang  && ang < Math.PI + n1tan) {
      n1side = 2 // represents west
    }else if (Math.PI + n1tan <= ang && ang < 2 * Math.PI - n1tan) {
      n1side = 1 // represents south
    } else { n1side = 0 } // cheap fix to prevent that one bug i showed you

    if (-n2tan <= ang && ang < n2tan){
      n2side = 2 // represents west
    } else if (n2tan <= ang && ang < Math.PI - n2tan) {
      n2side = 1 // represents south
    } else if (Math.PI - n2tan <= ang && ang < Math.PI + n2tan){
      n2side = 0 // represents east
    } else if (Math.PI + n2tan <= ang && ang < 2 * Math.PI - n2tan) {
      n2side = 3 // represents north
    } else {
      n2side = 2 // cheap fix to prevent that one bug i showed you
    }
     
    // actually calculate the coordinates

    let x1, x2, y1, y2;

    if(n1side == 0){
      // east
      x1 = n1.x + n1.handle.offsetWidth;
      y1 = n1.y + n1.handle.offsetHeight / 2;
    } else if (n1side == 1){
      // north
      x1 = n1.x + n1.handle.offsetWidth / 2;
      y1 = n1.y;
    } else if (n1side == 2){
      // west
      x1 = n1.x;
      y1 = n1.y + n1.handle.offsetHeight / 2;
    } else {
      // south
      x1 = n1.x + n1.handle.offsetWidth / 2;
      y1 = n1.y + n1.handle.offsetHeight;
    }
    
    // same for the second node

    if(n2side == 0){
      // east
      x2 = n2.x + n2.handle.offsetWidth;
      y2 = n2.y + n2.handle.offsetHeight / 2;
    } else if (n2side == 1){
      // north
      x2 = n2.x + n2.handle.offsetWidth / 2;
      y2 = n2.y;
    } else if (n2side == 2){
      // west
      x2 = n2.x;
      y2 = n2.y + n2.handle.offsetHeight / 2;
    } else {
      // south
      x2 = n2.x + n2.handle.offsetWidth / 2;
      y2 = n2.y + n2.handle.offsetHeight;
    }

    return {x1: x1, x2: x2, y1: y1, y2: y2};
  }

  const findCenterCoords = (n1, n2) => {
    const x1 = n1.x + (n1.handle.offsetWidth / 2);
    const x2 = n2.x + (n2.handle.offsetWidth / 2);
    const y1 = n1.y + (n1.handle.offsetHeight / 2);
    const y2 = n2.y + (n2.handle.offsetHeight / 2);

    return {x1: x1, x2: x2, y1: y1, y2: y2};
  }

  const getLineWidth = (c) => {
    // distance formula
    let side1 = Math.ceil(c.x2 - c.x1);
    let side2 = Math.ceil(c.y2 - c.y1);
    return Math.abs(Math.ceil(Math.sqrt((side1 * side1) + (side2 * side2))));
  }

  const getAngle = (c) => {
    // get the angle
    let result = ((Math.atan2(c.y2 - c.y1, c.x2 - c.x1)) * (180 / Math.PI));
    return result
  }

  const toggleLineMode = () => {
    lineMode = !lineMode;
    lineBuilder = null;
  }

  const deleteLine = (l) => {
    updateDif(l, "delete", false);
    lines.splice(lines.indexOf(l), 1);
  }

</script>


<div class="uiPopups">

  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="headerDiv {settings.animations ? "anim" : ""}" onclick={goBack}>
    <p>{appState.selectedBoard.boardName}</p>
    {#if appState.selectedBoard.boardType == "local" }
      <Laptop size={20} />
    {:else}
      <Cloud size={20} />
    {/if}
    {#if difs.length > 0}
      <button class='{settings.animations ? "anim" : ""}' onclick={appState.selectedBoard.boardType == "local" ? saveLocal : saveServer}>
        <CircleSmall size={20} />
      </button>
    {/if}
  </div>

  {#if showZoom}
    <div class="headerDiv {settings.animations ? "anim" : ""}"
      transition:customSlide={{ duration: settings.animations ? 500 : 0 }}  
    >
      <p>{Math.round((1 / zoomLevel) * 100) / 100}x</p>
      <Search size=20 />
    </div>
  {/if}

  {#each notifications as n}
    <div class="headerDiv {settings.animations ? 'anim' : ""}" style="background-color: {n.c};"
        transition:customSlide={{ duration: settings.animations ? 500 : 0 }}  
    >
      <div class="iconWrapper {settings.animations ? n.classes : ""}">
          <n.i size={18} />
      </div>
      <p>{n.t}</p>
    </div>
  {/each}
</div>

<a id='linkManager' class='invis'>Link Manager</a>


<div class="globalArea" style="
  zoom: {1 / zoomLevel};
">

  <div class="mainArea">

    {#each lines as l, _ (l.n1.id + l.n2.id)}
      {@const c = settings.edgeFinding ? findSideCoords(l.n1, l.n2) : findCenterCoords(l.n1, l.n2)}
      {@const width = getLineWidth(c)}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div 
        class="line {lineMode ? "cuttable" : ""} {settings.animations ? "anim" : ""}" 
        style="
          width: {width}px;
          {l.type == 3 ? "background-color: #00000000;": ""}
          transform: translateX({c.x1}px) translateY({c.y1}px) rotate({getAngle(c)}deg);
          "
        transition:scale={{ duration: settings.animations ? 250 : 0 }}
        onclick={() => lineMode ? deleteLine(l) : () => {}}
      >
        {#if l.type == 1}

          {#each {length: Math.ceil(width) / 100} as _}
            <div class="iconWrapper">
            </div>
              <div class="iconWrapper">
                <ChevronRight size=40 />
              </div>
            <div class="iconWrapper">  
            </div>
          {/each}

        {:else if l.type == 2}

          {#each {length: Math.ceil(width / 2) / 100} as _}
            <div class="iconWrapper">
            </div>
              <div class="iconWrapper">
                <ChevronLeft size=40 />
              </div>
            <div class="iconWrapper">  
            </div>
          {/each}

          {#each {length: Math.ceil(width / 2) / 100} as _}
            <div class="iconWrapper">
            </div>
              <div class="iconWrapper">
                <ChevronRight size=40 />
              </div>
            <div class="iconWrapper">  
            </div>
          {/each}

        {:else if l.type == 3}

          {#each {length: Math.ceil(width) / 50} as _}
            <div class="iconWrapper">
            </div>
              <div class="iconWrapper">
                <ChevronRight size=40 />
              </div>
            <div class="iconWrapper">  
            </div>
          {/each}

        {/if}
      </div>

    {/each}

    {#each nodes as n, i (n.id)}

      <!-- use these directives for now until I implement proper aria labels-->

      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="node {settings.animations ? "anim" : ""} {lineBuilder == n ? "lineSelected" : ""}" style='
        transform: translate({n.x}px, {n.y}px);
        {selected == i ? "background-color: var(--lighter-bg-color); z-index: 2; border: 1px solid var(--lightest-bg-color);": ""} 
        max-width: {n.type == "image" ? settings.imageWidth : settings.noteWidth}px;'
        transition:scale={{ duration: settings.animations ? 250 : 0 }}
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
                {#each parseText(n.content) as chunk}
                  {#if chunk.type == "text"}
                  <p>
                    {chunk.value}
                  </p>

                  {:else}
                    <div class="code {settings.animations ? "anim" : ""} {!settings.overrideCodeFont ? "monospace" : ""}" style="{selected == i ? "background-color: var(--light-bg-color);" : "var(--bg-color);"}">
                      {chunk.value}

                      <button class="controlButton {settings.animations ? "anim" : ""}" onclick={() => copyCode(chunk.value)}>
                        <Copy size={20} />
                      </button> 
                    </div>
                  {/if}
                {/each}
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
              <img src="{get_thumbnail(n.file)}" class="thumbnailImage {settings.animations ? "anim" : ""} {n.editing ? "hover" : ""}" alt="thumbnail" draggable="false"/>
            </label>
          {:else}
            <label class="imagePlaceholder {settings.animations ? "anim" : ""} {n.editing ? "hover" : ""}" style="flex-direction: row;"for="uploadTrigger{n.id}"
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
            <label class="imagePlaceholder {settings.animations ? "anim" : ""} {n.editing ? "hover" : ""}" style="flex-direction: row; {n.editing ? "cursor: pointer;" : ""}"for="uploadTrigger{n.id}"
                ondrop={(e) => handleFileChange(e, n)}
                ondragover={(e) => e.preventDefault()}
            >
              <File size={64} />
            </label>
          {:else}
            <label class="imagePlaceholder {settings.animations ? "anim" : ""} {n.editing ? "hover" : ""}" style="flex-direction: row;"for="uploadTrigger{n.id}"
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
          <button class="controlButton {settings.animations ? "anim" : ""}" onclick={() => toggleEdit(n)} style="{lineMode ? "color: var(--text-color) !important;": n.editing ? "color: var(--light-main-color); !important" : ""}" >
            <PencilLine size={20} />
          </button>

          <button class="controlButton {settings.animations ? "anim" : ""}" onclick={() => deleteNode(i)} style="{lineMode ? "color: var(--text-color) !important;" : ""}">
            <Trash size={20} />
          </button>

          {#if n.type == "file" || n.type == "image"}
            <button class="controlButton {settings.animations ? "anim" : ""}" onclick={() => download(n)} style="{lineMode ? "color: var(--text-color) !important;" : ""}">
              <Download size={20} />
            </button>
          {:else}
            <button class="controlButton {settings.animations ? "anim" : ""}" onclick={() => copy(n)} style="{lineMode ? "color: var(--text-color) !important;" : ""}">
              <Copy size={20} />
            </button>
          {/if}

          <button class='controlButton {settings.animations ? "anim" : ""}' draggable="false" 
            style="{lineMode ? "color: var(--text-color) !important;" : ""}"
            onmousedown={(e) => startDragDesktop(e, n)}
          >
            <GripHorizontal size={20} ondragstart={(e) => e.preventDefault()} />
          </button>


        </span>

      </div>
    {/each}
  </div>


</div>

<div class="nodeSelector">

  {#if !lineMode}

    <div class="nodeSelectorButtons"
      transition:fly={{y: -50, duration: settings.animations ? 250 : 0}}
    >
        <button class='{settings.animations ? "anim" : ""}' onclick={() => addNode("note")}>
          <ScrollText size={24} />
        </button>

        <button class='{settings.animations ? "anim" : ""}' onclick={() => addNode("todo")}>
          <ListTodo size={24} />
        </button>

        <button class='{settings.animations ? "anim" : ""}' onclick={() => addNode("image")}>
          <Image size={24} />
        </button>

        <button class='{settings.animations ? "anim" : ""}' onclick={() => addNode("file")}>
          <File size={24} />
        </button>

        <div class="spacer"></div>

        <button class='{settings.animations ? "anim" : ""}' onclick={toggleLineMode}>
          <MoveUpRight size={24}/>
        </button>

    </div>

    {:else}

    <div class="nodeSelectorButtons"
      transition:fly={{y: 50, duration: settings.animations ? 250 : 0}}
    >
        <button class='{settings.animations ? "anim" : ""}' style="{lineType == 0 ? "color: var(--light-main-color);": ""}" onclick={() => {lineType = 0}}>
          <Minus size={24} />
        </button>

        <button class='{settings.animations ? "anim" : ""}' style="{lineType == 1 ? "color: var(--light-main-color);": ""}" onclick={() => {lineType = 1}}>
          <MoveRight size={24} />
        </button>

        <button class='{settings.animations ? "anim" : ""}' style="{lineType == 2 ? "color: var(--light-main-color);": ""}" onclick={() => {lineType = 2}}>
          <MoveHorizontal size={24} />
        </button>

        <button class='{settings.animations ? "anim" : ""}' style="{lineType == 3 ? "color: var(--light-main-color);": ""}" onclick={() => {lineType = 3}}>
          <ChevronsRight size={24} />
        </button>

        <div class="spacer"></div>

        <button class='{settings.animations ? "anim" : ""}' onclick={toggleLineMode}>
          <LayoutGrid size={24}/>
        </button>

    </div>

  {/if}

</div>

<button class='invis' id='closePopup' onclick={() => {alertUnsaved = false;}}>Close Popup</button>

{#if alertUnsaved}
  <label class="blocker"
    transition:fade={{ duration: settings.animations ? 250 : 0 }}
    for="closePopup"
  >
  </label>

  <div class="unsavedAlert"
    transition:fly={{ x: 50, duration: settings.animations ? 250 : 0 }}
  >
    <p>You have unsaved changes!</p>
    <div class="buttons">
      <button onclick={saveAndCont} style='width: fit-content;' class='{settings.animations ? "anim" : ""}'>
        <CheckCircle size={20} />
        Save
      </button>
      <button onclick={quitNoSave} style='background-color: var(--fail-color) !important; border: none !important;' class='{settings.animations ? "anim" : ""}'>
        <CircleX size={20} />
        Discard
      </button>
    </div>
  </div>


{/if}

<style>

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
    color: var(--text-color);
    font-size: calc(14px + var(--font-size-modifier));
    border: 1px solid var(--lightest-bg-color);
  }

  .buttons button.anim {
    transition: background-color .25s ease;
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

  .hover.anim {
    transition: 
      .25s ease
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

  .zoomLevel {
    width: fit-content;
    box-sizing: border-box;
    background-color: var(--input-color);
    height: 45px;
    position: fixed;
    z-index: 10;
    top: 85px;
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
    cursor: pointer;
    border: 1px solid var(--lightest-bg-color);
  }

  .zoomLevel.anim {
    transition: background-color .25s ease;
  }



  .nodeSelector button, .headerDiv button {
    border: none;
    box-sizing: border-box;
    padding: 0px;
    background: none;
    justify-content: center;
    align-items: center;
    display: flex;
    cursor: pointer;
    color: var(--header-color);
  }

  .nodeSelector button.anim {
    transition: color .25s ease;
  }

  .nodeSelector button:hover {
    color: var(--main-color);
  }

  @keyframes shake {
    0% { transform: rotate(0deg); }
    33% { transform: rotate(-5deg); }
    66% { transform: rotate(5deg); }
    100% { transform: rotate(0deg); }
  }

  .nodeSelector button.anim:hover {
    animation: shake .5s;
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
    box-sizing: border-box;
    background-color: var(--input-color);
    position: fixed;
    z-index: 10;
    border: 1px solid var(--lightest-bg-color);
    backdrop-filter: blur(5px);

    bottom: 50px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    padding-left: 20px;
    padding-right: 20px;
    border-radius: var(--border-radius);
    left: 50%;
    transform: translate(-50%);

    color: var(--header-color);
    width: 263px; /* such a hack but it works */
    height: 46px;
  }

  .nodeSelectorButtons {
    gap: 20px;
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    width: fit-content;
    position: fixed;
    align-items: center;
    justify-content: center;
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

    backdrop-filter: blur(var(--blur-radius));
    min-width: 100px;
    border: 1px solid var(--lighter-bg-color);
  }

  .node.anim {
    transition: 
      background-color .25s,
      border-radius .250s,
      scale .5s,
    ;
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
    padding: 0px;
    box-sizing: border-box;
  }

  .controlButton.anim {
    transition:
      color 250ms
    ;
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
    color: var(--header-color);
    text-align: center;
  }

  .code {
    font-style: normal;
    color: var(--header-color);
    background-color: var(--bg-color);
    box-sizing: border-box;
    padding: 5px 10px;
    display: flex;
    font-size: calc(16px + var(--font-size-modifier));
    border-radius: 5px;
    border: 1px solid var(--lightest-bg-color);
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    white-space: pre-wrap;
  }

  .code.anim {
    transition: background-color .25s ease;
  }

  .monospace {
    font-family: "Noto Monospace" !important;
  }

  
  .line {
    position: absolute;
    height: 3px;
    border-radius: 50px;
    z-index: 0;
    display: flex;
    align-items: center;
    background-color: var(--header-color);
    transform-origin: left center;
    justify-content: space-between;
  }

  .line.anim, .line.anim * {
    transition: background-color .25s, height .25s, color .25s;
  }

  .line .iconWrapper {
    max-height: 40px;
  }

  .lineSelected {
    outline: 2px solid var(--header-color) !important;
  }

  .cuttable {
    height: 6px;
    cursor: pointer;
  }

  .cuttable:hover {
    background-color: var(--light-main-color);
    color: var(--light-main-color);
  }

  .cuttable:hover .iconWrapper {
    color: var(--light-main-color);
  }


</style>