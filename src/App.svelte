<script lang="ts">
  import { onMount } from "svelte";
  import blackPawnSrc from "./pieces/pawn-b.svg";
  import blackKingSrc from "./pieces/king-b.svg";
  import blackQueenSrc from "./pieces/queen-b.svg";
  import blackRookSrc from "./pieces/rook-b.svg";
  import blackKnightSrc from "./pieces/knight-b.svg";
  import blackBishopSrc from "./pieces/bishop-b.svg";

  import whitePawnSrc from "./pieces/pawn-w.svg";
  import whiteKingSrc from "./pieces/king-w.svg";
  import whiteQueenSrc from "./pieces/queen-w.svg";
  import whiteRookSrc from "./pieces/rook-w.svg";
  import whiteKnightSrc from "./pieces/knight-w.svg";
  import whiteBishopSrc from "./pieces/bishop-w.svg";
  import { coordToNum, mapToNumber, mapToString, numToCoord, stringToMap, numberToMap } from "./lib/helper";
  import moveDotSrc from "./pieces/blackDot.png";

  // Preload images
  const blackPawn = new Image();
  blackPawn.src = blackPawnSrc;
  const blackKing = new Image();
  blackKing.src = blackKingSrc;
  const blackQueen = new Image();
  blackQueen.src = blackQueenSrc;
  const blackRook = new Image();
  blackRook.src = blackRookSrc;
  const blackKnight = new Image();
  blackKnight.src = blackKnightSrc;
  const blackBishop = new Image();
  blackBishop.src = blackBishopSrc;

  const whitePawn = new Image();
  whitePawn.src = whitePawnSrc;
  const whiteKing = new Image();
  whiteKing.src = whiteKingSrc;
  const whiteQueen = new Image();
  whiteQueen.src = whiteQueenSrc;
  const whiteRook = new Image();
  whiteRook.src = whiteRookSrc;
  const whiteKnight = new Image();
  whiteKnight.src = whiteKnightSrc;
  const whiteBishop = new Image();
  whiteBishop.src = whiteBishopSrc;

  const moveDot = new Image();
  moveDot.src = moveDotSrc;

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
    0b000000000000000011111n // The Special One 
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
  let cstart = 0;
  let cend = 0;
  let location = 0;
  let helper = 0;
  let Clicked = false;
  let assigner: number[][] = [];
  let clickStart: number;
  let dragImg: HTMLImageElement;
  width = window.innerWidth;
  height = window.innerHeight;
  let side = Math.min(width, height) * 0.8;
  let hideNow: number;

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
    } else {
      dragCtx.clearRect(0, 0, width, height);
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
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        assigner.push([Math.trunc(dim * j), Math.trunc(dim * i)]);
      }
    }
    console.log(assigner);
  }

  function identifySquare() {
    const dim = side / 8;
    let a = Math.trunc(1 + cursorY / dim);
    let b = Math.trunc(1 + cursorX / dim);
    if (a > 0 && a < 9 && b > 0 && b < 9)
      location = 8 * (a - 1) + b - 1;
  }

  function makeBoxes() {
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
    showMoves();
    dragImg = new Image();
    selectedImage(location);
    makeBoxes();
    displayNormal();
    cstart = location;
  }

  function dragEnd() {
    if (cstart != location && moves & numberToMap(location)) {
      let start = numberToMap(cstart);
      let end = numberToMap(location);
      for (let i = 2; i <= 13; i++) {
        if (start & board[i]) {
          board[i] = start ^ board[i];
          board[i] = end | board[i];
          moves = 0n;
          makeBoxes();
          displayNormal();
          break;
        }
      }
    }
    dragCtx.clearRect(0, 0, dragCanvas.width, dragCanvas.height);
    isDragging = false;
    hideNow = 65;
    displayNormal();
    cend = location;
    handleClick();
  }

  function handleClick() {
    if (cstart === cend) {
      if (!Clicked) {
        Clicked = true;
        clickStart = location;
        cstart = location;
        showMoves();
      } else {
        Clicked = false;
        if (clickStart != location) {
          if (moves & numberToMap(location)) {
            let start = numberToMap(clickStart);
            let end = numberToMap(location);
            for (let i = 2; i <= 13; i++) {
              if (start & board[i]) {
                board[i] = start ^ board[i];
                board[i] = end | board[i];
                break;
              }
            }
          }
        }
        moves = 0n;
      }
    }
    makeBoxes();
    displayNormal();
  }

  function showMoves() {
    moves = 0b0000000000000000111111110000000000000000000000000000000000000000n;
  }

  function display() {
    setTimeout(() => {
      displayType(mapToNumber(board[2])[0], blackKing);
      displayType(mapToNumber(board[8])[0], whiteKing);
    }, 1100);

    setTimeout(() => {
      mapToNumber(board[7]).map((x) => { displayType(x, blackPawn); });
      mapToNumber(board[13]).map((x) => { displayType(x, whitePawn); });
    }, 100);

    setTimeout(() => {
      displayType(mapToNumber(board[3])[0], blackQueen);
      displayType(mapToNumber(board[9])[0], whiteQueen);
    }, 900);

    setTimeout(() => {
      mapToNumber(board[4]).map((x) => { displayType(x, blackRook); });
      mapToNumber(board[10]).map((x) => { displayType(x, whiteRook); });
    }, 300);

    setTimeout(() => {
      mapToNumber(board[5]).map((x) => { displayType(x, blackKnight); });
      mapToNumber(board[11]).map((x) => { displayType(x, whiteKnight); });
    }, 500);

    setTimeout(() => {
      mapToNumber(board[6]).map((x) => { displayType(x, blackBishop); });
      mapToNumber(board[12]).map((x) => { displayType(x, whiteBishop); });
    }, 700);
  }

  function displayNormal() {
    displayType(mapToNumber(board[2])[0], blackKing);
    displayType(mapToNumber(board[8])[0], whiteKing);

    mapToNumber(board[7]).map((x) => { displayType(x, blackPawn); });
    mapToNumber(board[13]).map((x) => { displayType(x, whitePawn); });

    displayType(mapToNumber(board[3])[0], blackQueen);
    displayType(mapToNumber(board[9])[0], whiteQueen);

    mapToNumber(board[4]).map((x) => { displayType(x, blackRook); });
    mapToNumber(board[10]).map((x) => { displayType(x, whiteRook); });

    mapToNumber(board[5]).map((x) => { displayType(x, blackKnight); });
    mapToNumber(board[11]).map((x) => { displayType(x, whiteKnight); });

    mapToNumber(board[6]).map((x) => { displayType(x, blackBishop); });
    mapToNumber(board[12]).map((x) => { displayType(x, whiteBishop); });

    mapToNumber(moves).map((x) => { displayType(x, moveDot); });
  }

  function displayType(coord: number, img: HTMLImageElement) {
    if (coord != hideNow) {
      helper = coord;
      if (img === moveDot) {
        let [x, y] = assigner[coord];
        ctx.beginPath();
        ctx.arc(x + side / 16, y + side / 16, side / 30, 0, 2 * Math.PI);
        ctx.fillStyle = ("#000000");
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + side / 16, y + side / 16, side / 40, 0, 2 * Math.PI);
        ctx.fillStyle = ("#ffffff");
        ctx.fill();
      } else {
        let [x, y] = assigner[coord];
        ctx.drawImage(img, x, y, side / 8, side / 8);
      }
    }
  }

  function selectedImage(coord: number) {
    let clickLocation = numberToMap(coord);
    for (let i = 2; i <= 13; i++) {
      if (clickLocation & board[i]) {
        hideNow = coord;
        switch (i) {
          case 2:
            dragImg = blackKing;
            break;
          case 3:
            dragImg = blackQueen;
            break;
          case 4:
            dragImg = blackRook;
            break;
          case 5:
            dragImg = blackKnight;
            break;
          case 6:
            dragImg = blackBishop;
            break;
          case 7:
            dragImg = blackPawn;
            break;
          case 8:
            dragImg = whiteKing;
            break;
          case 9:
            dragImg = whiteQueen;
            break;
          case 10:
            dragImg = whiteRook;
            break;
          case 11:
            dragImg = whiteKnight;
            break;
          case 12:
            dragImg = whiteBishop;
            break;
          case 13:
            dragImg = whitePawn;
            break;
        }
      }
    }
  }
</script>

<div class="flex flex-col items-center justify-center h-lvh">
  <canvas bind:this={canvas} class="main-canvas" on:mousemove={handleMouseMove} on:mousedown={dragStart} on:mouseup={dragEnd} on:mouseleave={dragEnd}></canvas>
  <canvas bind:this={dragCanvas} class="drag-canvas"></canvas>
</div>
<div>{assigner}</div>
<div>{hideNow}</div>
<img src={blackPawnSrc} alt="Pawn"/>

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
