  
// polyfill bind
Function.prototype.bind=Function.prototype.bind||function(b){if(typeof this!=="function"){throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");}var a=Array.prototype.slice,f=a.call(arguments,1),e=this,c=function(){},d=function(){return e.apply(this instanceof c?this:b||window,f.concat(a.call(arguments)));};c.prototype=this.prototype;d.prototype=new c();return d;};

_ = Bacon._

function getInputs() {
  var keys = $(document).asEventStream('keyup').map('.keyCode')
  var lefts   = keys.filter(function(x) { return x === 37 })
  var ups     = keys.filter(function(x) { return x === 38 })
  var rights  = keys.filter(function(x) { return x === 39 })
  var downs   = keys.filter(function(x) { return x === 40 })
  var restart = keys.filter(function(x) { return x === 82 })
  var tick   = Bacon.interval(100)

  //three streams combined returned

  return { left: lefts, right: rights, up: ups, down: downs, tick: tick, restart: restart}
}

function getPosition(input, tick) {
  var actions = 
     input.left.map(function() { return rotateLeft }).merge(
    input.right.map(function() { return rotateRight })).merge(
    input.up.map(function() { return rotateUp })).merge(
    input.down.map(function() { return rotateDown }))

  var startDirection = new Pos(0,1),
      startPosition = new Pos(5,5)
  var direction = actions.scan(startDirection, function(x, f) { return f(x) })
  
  return direction
    .sampledBy(input.tick)
    .scan(startPosition, function(x,y) { return x.add(y) });
}

function apple(position) {
  var applePos = randomPos()
  return position
      .filter(function(p) { return p.equals(applePos) })
      .take(1)
      .flatMapLatest(apple.bind(null, position))
      .toProperty(applePos)
} 

function game(position) {
  var snakehead = null;

  var pos = position()
  var appl = apple(pos)
  
  var length = appl.map(1).scan(10, function(x,y) { return x + y })
  var score  = appl.map(1).scan(0,  function(x,y) { return x + y })
  var snake  = pos.slidingWindowBy(length)
  
 // console.log(last.x)

  var dead   = snake.filter(function(snake) { 
      var head = snake[0]

      hitBoard = false
      if (head)
        hitBoard = hitBoard || head.x < 0 || head.x >= size.x || head.y < 0 || head.y >= size.y

      return contains(_.tail(snake), _.head(snake)) || hitBoard})// || _.head(snake).x < 0 || _.head(snake).x >= 20 || _.head(snake).y < 0 || _.head(snake).y >= 20 })
  
  var game = Bacon.combineTemplate({
    snake: snake,
    apple: appl,
    score: score
  })
  
  return game.takeUntil(dead)
}

var repeated = function(game, restart) { 
   var gm = function() { 
     var tmp = game()
     tmp.onEnd(logRestart);
     return tmp;
   }
   restart.onValue(logClear)
   return Bacon.separateBy(restart, gm)
}

drawGame(size);

var inputs = getInputs()
var position = getPosition.bind(null, inputs)
var newGame = game.bind(null, position)


// function repearted in called repeatedly
repeated(newGame, inputs.restart).onValue(function(e) {
//  console.log("game on")
  drawSnake(e.snake) 
  drawApple([e.apple])
  setScore(e.score)
})
