document.addEventListener('DOMContentLoaded', () => {

  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('#start-button')
  const linesDisplay = document.querySelector('#lines')
  const width = 10
  let nextRandom = 0
  let timerId
  let score = 0
  let lines = 0
  const color = [
    '#FF971C', //naranja
    '#FF3213',      //rojo
    '#FFD500', //amarillo
    '#72CB3B',    //verde
    '#0341AE'   //azul
  ]

  //Tetrominoes

  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
  ]

  const tTetromino = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
  ]

  const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
  ]

  const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
  ]


  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  let currentPosition = 4
  let currentRotation = 0

  console.log(theTetrominoes[0][0])

  //Selección aleatoria del Tetromino y su primera rotacion

  let random = Math.floor(Math.random()*theTetrominoes.length)
  let current = theTetrominoes[random][currentRotation]

  //dibuja el Tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = color[random]
    })
  }

  //desdibujar el Tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''

    })
  }

  //asignar funciones a las teclas
  function control(e) {
    if (e.keyCode === 37) {
      moveLeft()
    }else if (e.keyCode === 38) {
      rotate()
    }else if (e.keyCode === 39) {
      moveRight()
    }else if (e.keyCode === 40) {
      moveDown()
    }
  }

  document.addEventListener('keyup', control)

  //funcion para mover hacia abajo
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  //funcion freeze
  function freeze() {
    if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      //Inicia un nuevo tetromino descendiendo
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  //move el tetromino a la izquierda, a menos que este en el borde o un bloqueo
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some( index => (currentPosition + index) % width === 0)
    if (!isAtLeftEdge) currentPosition -=1
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      currentPosition -=1
    }
    draw()
  }


  //move el tetromino a la derecha, a menos que este en el borde o un bloqueo
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
    if (!isAtRightEdge) currentPosition +=1
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -=1
    }
    draw()
  }

  //Arregla rotacion de tetrominos al borde

  function isAtRight() {
    return current.some(index => (currentPosition + index + 1) % width === 0)
  }

  function isAtLeft() {
    return current.some(index => (currentPosition + index) % width === 0)
  }

  function checkRotatePosition(P){
    P = P || currentPosition           //trate la position actual, luego verifica si la pieza esta cerca del borde izquierdo
    if ((P+1) % width < 4) {          //agrega 1 porque el índice de posición puede ser 1 menos de donde está la pieza (con la forma en que están indexados).
      if (isAtRight()){              //use la posición real para verificar si está volteada hacia el lado derecho
        currentPosition += 1        //si es así, agregue uno para envolverlo
        checkRotatePosition(P)     //revisar otra vez. Pase la posición desde el principio, ya que el bloque largo podría necesitar moverse más.
      }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -=1
        checkRotatePosition(P)
      }
    }
  }

  //rotar el tetromino
  function rotate() {
    undraw()
    currentRotation ++
    if (currentRotation === current.length) {
      currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatePosition()
    draw()
  }



  //Mostrar el siguiente tetromino en el mini-grid
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0

  //Tetrominos sin rotaciones
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ]

  //mostrar la forma en el mini-grid
  function displayShape() {
    //elimina cualquier rastro de un tetromino de toda la grilla
    displaySquares.forEach(squares => {
      squares.classList.remove('tetromino')
      squares.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      displaySquares[displayIndex + index].style.backgroundColor = color[nextRandom]
    })
  }

  //agrear funcionalidad al boton
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }else {
      draw()
      timerId = setInterval(moveDown, 1000)
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
    }
  })

  //agrega puntaje
  function addScore() {
    for (let i = 0; i < 199; i += width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if (row.every(index => squares[index].classList.contains('taken'))) {
        score +=100
        lines +=1;
        scoreDisplay.innerHTML = score
        linesDisplay.innerHTML = lines
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
    }
  }

  function gameOver() {
    if (current.some(index => squares[currentPosition + index].classList.contains('taken'))){
      scoreDisplay.innerHTML = 'Game Over'
      clearInterval(timerId)
    }
  }


})
