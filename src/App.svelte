<script lang="ts">
  import { onMount } from "svelte";
  import blackPawn from "./pieces/pawn-b.svg";
  import blackKing from "./pieces/king-b.svg";
  import blackQueen from "./pieces/queen-b.svg";
  import blackRook from "./pieces/rook-b.svg";
  import blackKnight from "./pieces/knight-b.svg";
  import blackBishop from "./pieces/bishop-b.svg";

  import whitePawn from "./pieces/pawn-w.svg";
  import whiteKing from "./pieces/king-w.svg";
  import whiteQueen from "./pieces/queen-w.svg";
  import whiteRook from "./pieces/rook-w.svg";
  import whiteKnight from "./pieces/knight-w.svg";
  import whiteBishop from "./pieces/bishop-w.svg";
  import { coordToNum, mapToNumber ,mapToString,numToCoord, stringToMap } from "./lib/helper";
  import moveDot from "./pieces/blackDot.png";

  let board: bigint[] = [
    0b1111111111111111000000000000000000000000000000000000000000000000n, // All Black Pieces
    0b0000000000000000000000000000000000000000000000001111111111111111n, // All White Pieces
    0b0000100000000000000000000000000000000000000000000000000000000000n, // Black King
    0b0001000000000000000000000000000000000000000000000000000000000000n, // Black Queen
    0b1000000100000000000000000000000000000000000000000000000000000000n, // Black Rook
    0b0100001000000000000000000000000000000000000000000000000000000000n, // Black Knight
    0b0010010000000000000000000000000000000000000000000000000000000000n, // Black Bishop
    0b0000000011111111000000000000000000000000000000000000000000000000n, // Black Pawn
    0b0000000000000000000000000000000000000000000000000000000000001000n, // White King
    0b0000000000000000000000000000000000000000000000000000000000010000n, // White Queen
    0b0000000000000000000000000000000000000000000000000000000010000001n, // White Rook
    0b0000000000000000000000000000000000000000000000000000000001000010n, // White Knight
    0b0000000000000000000000000000000000000000000000000000000000100100n, // White Bishop
    0b0000000000000000000000000000000000000000000000001111111100000000n, // White Pawn
    0b000000000000000011110n // The Special One 
  ];

  let moves: bigint = 0b0n;
  let canvas: HTMLCanvasElement;
  let dragCanvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let dragCtx: CanvasRenderingContext2D;
  let width: number = window.innerWidth;
  let height: number = window.innerHeight;
  let cursorX: number = 0, cursorY: number = 0;
  let isDragging = false;
  let a: number = 0;
  let cstart = "a1";
  let cend = "a1";
  let location = "a1";
  let helper = "";
  let Clicked = false;
  let assigner: number[][] = [];
  let dragged: string;
  let dragImg:CanvasImageSource
  width = window.innerWidth;
  height = window.innerHeight;
  let side = Math.min(width, height) * 0.8;
  let hideNow:number;
  function handleMouseMove(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    cursorX = event.clientX - rect.left;
    cursorY = event.clientY - rect.top;
    identifySquare();
    if (isDragging) {
      requestAnimationFrame(() => {
        dragCtx.clearRect(0, 0, dragCanvas.width, dragCanvas.height);
          dragCtx.drawImage(dragImg, cursorX - side / 16, cursorY - side / 16, side / 8, side / 8);
      });
    }
    else
    {
      dragCtx.clearRect(0,0,width,height)
    }
  }

  onMount(() => {
    if (!canvas || !dragCanvas) {
      throw new Error("Canvas is null");
    }
    canvas.width = side;
    canvas.height = side;
    dragCanvas.width = side;
    dragCanvas.height = side;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    dragCtx = dragCanvas.getContext("2d") as CanvasRenderingContext2D;
    if (!ctx || !dragCtx) {
      throw new Error("Unable to get canvas context");
    }
    makeBoxes();
    directions();
    display();
  });

  function directions() {
    const dim = side / 8;
    // To help display
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        assigner.push([dim * j, dim * i]);
      }
    }
  }

  function identifySquare() {
    const dim = side / 8;
    let a = Math.trunc(1 + cursorY / dim);
    let b = Math.trunc(1 + cursorX / dim);
    if (a > 0 && a < 9 && b > 0 && b < 9)
      location = String.fromCharCode(105 - a) + "" + b;
  }

  function makeBoxes() {
    // The side of one box is side / 8
    const dim = side / 8;
    let filler = '#E9EDCC';
    let [xcoord, ycoord] = [0, 0];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (j != 0) {
          filler = (filler === "#779954") ? '#E9EDCC' : '#779954';
        }
        ctx.fillStyle = filler;
        ctx.fillRect(xcoord, ycoord, dim, dim);
        xcoord += dim;
      }
      xcoord = 0;
      ycoord += dim;
    }
  }

  function dragStart() {
    isDragging = true;
    showMoves()
  dragImg = new Image();
   selectedImage(location)
   dragImg.src = dragged;
    makeBoxes();
    displayNormal();
    cstart = location;
  }

  function dragEnd() {
    //We want to check if it has been dragged to a valid move
    if(cstart!=location&&moves&stringToMap(location))
    {
      let start = stringToMap(cstart)
      let end = stringToMap(location)
      for(let i = 2;i<=13;i++)
      {
        if(start&board[i])
        {
          board[i] = start^board[i]//Remove from prev state
          board[i] = end | board[i]//Add new state
          moves = 0n
          makeBoxes()
          displayNormal()
          break;
        }
      }
    }
    dragCtx.clearRect(0, 0, dragCanvas.width, dragCanvas.height);
    isDragging = false;
    dragged = ""
    hideNow = 65
    

    displayNormal()
    cend = location;
    handleClick(); // Handle the click action after drag ends
  }

  function handleClick() {
    if(!Clicked)
      {
        Clicked = true
        showMoves()
      }
      else
      {
        Clicked = false
        moves = 0n
        makeBoxes()
        displayNormal()
      }
    if (cstart === cend) {
     
    } else {
      helper = ("Dragged from " + cstart + " to " + cend);
    }
  }
  function showMoves()
  {
    moves = 0b0000000000000000111111110000000000000000000000000000000000000000n
  }
  function display() {
    // We have to display each one by one
    // We have this global function that can be used to display each piece
    // Let's place the black king
    setTimeout(() => {
      displayType(mapToNumber(board[2])[0], blackKing);
      displayType(mapToNumber(board[8])[0], whiteKing);
    }, 1100);

    // To display the pawns
    setTimeout(() => {
      mapToNumber(board[7]).map((x) => { displayType(x, blackPawn); });
      mapToNumber(board[13]).map((x) => { displayType(x, whitePawn); });
    }, 100);

    // To display the queens
    setTimeout(() => {
      displayType(mapToNumber(board[3])[0], blackQueen);
      displayType(mapToNumber(board[9])[0], whiteQueen);
    }, 900);

    // To display the rooks
    setTimeout(() => {
      mapToNumber(board[4]).map((x) => { displayType(x, blackRook); });
      mapToNumber(board[10]).map((x) => { displayType(x, whiteRook); });
    }, 300);

    // To display the knights
    setTimeout(() => {
      mapToNumber(board[5]).map((x) => { displayType(x, blackKnight); });
      mapToNumber(board[11]).map((x) => { displayType(x, whiteKnight); });
    }, 500);

    // To display the bishops
    setTimeout(() => {
      mapToNumber(board[6]).map((x) => { displayType(x, blackBishop); });
      mapToNumber(board[12]).map((x) => { displayType(x, whiteBishop); });
    }, 700);
  }

  function displayNormal() {
    // We have to display each one by one
    // We have this global function that can be used to display each piece
    // Let's place the black king
    displayType(mapToNumber(board[2])[0], blackKing);
    displayType(mapToNumber(board[8])[0], whiteKing);

    // To display the pawns
    mapToNumber(board[7]).map((x) => { displayType(x, blackPawn); });
    mapToNumber(board[13]).map((x) => { displayType(x, whitePawn); });

    // To display the queens
    displayType(mapToNumber(board[3])[0], blackQueen);
    displayType(mapToNumber(board[9])[0], whiteQueen);

    // To display the rooks
    mapToNumber(board[4]).map((x) => { displayType(x, blackRook); });
    mapToNumber(board[10]).map((x) => { displayType(x, whiteRook); });

    // To display the knights
    mapToNumber(board[5]).map((x) => { displayType(x, blackKnight); });
    mapToNumber(board[11]).map((x) => { displayType(x, whiteKnight); });

    // To display the bishops
    mapToNumber(board[6]).map((x) => { displayType(x, blackBishop); });
    mapToNumber(board[12]).map((x) => { displayType(x, whiteBishop); });

    mapToNumber(moves).map((x) => { displayType(x, moveDot); });
  }

  function displayType(coord: number, imgsrc: any) {
    
    if(coord!=64-hideNow)
    {
      if(imgsrc == moveDot)
      {
        let [x, y] = assigner[coord];
        ctx.beginPath()
        ctx.arc(x+side/16,y+side/16,side/30,0,2*Math.PI)
        ctx.fillStyle = ("#000000")
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x+side/16,y+side/16,side/40,0,2*Math.PI)
        ctx.fillStyle = ("#ffffff")
        ctx.fill()
      }
      else{
    const image = new Image();
    image.src = imgsrc;
    image.onload = () => {
      let [x, y] = assigner[coord];
      ctx.drawImage(image, x, y, side / 8, side / 8);
    }};
  }
  }
  function selectedImage(coord:string)
  {
    let clickLocation = stringToMap(coord)
    
    for(let i = 2;i<=13;i++)
    {
      if(clickLocation&board[i])
      {
        hideNow = coordToNum(coord)
        switch(i)
        {
          case 2:
            dragged = blackKing
          break;
          case 3:
            dragged = blackQueen
            break;
          case 4:
            dragged = blackRook;
          break;
          case 5:
            dragged = blackKnight;
          break;
          case 6:
            dragged = blackBishop;
          break;
          case 7:
            dragged = blackPawn;
          break;
          case 8:
            dragged = whiteKing
          break;
          case 9:
            dragged = whiteQueen
            break;
          case 10:
            dragged = whiteRook;
          break;
          case 11:
            dragged = whiteKnight;
          break;
          case 12:
            dragged = whiteBishop;
          break;
          case 13:
            dragged = whitePawn;
          break;
        }
      }
    }
  }
</script>

<div class="flex flex-col items-center justify-center h-lvh">
  <canvas bind:this={canvas} class="main-canvas" on:mousemove={handleMouseMove} on:mousedown={dragStart} on:mouseup={dragEnd} on:mouseleave={dragEnd}></canvas>
  <canvas bind:this={dragCanvas} class="drag-canvas"></canvas>
  <div>{location}</div>
  <div>{helper}</div>
</div>
<img src={blackPawn} alt="Pawn"/>

<style>
  .main-canvas {
    border: 10px solid black;
    z-index: 1;
    position: absolute;
  }
  .drag-canvas {
    z-index: 2;
    position: absolute;
    pointer-events: none;
  }
</style>
