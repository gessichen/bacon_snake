var size = new Pos(20, 20);

function Pos (x, y) {
  this.x = x;
  this.y = y;
  this.equals = function(p) {
    return this.x === p.x && this.y === p.y;
  }
  this.add = function(p) {
    return new Pos(this.x + p.x,this.y + p.y)
  } 
}

randomPos = function() { 
  return new Pos(
    Math.floor(Math.random() * size.x),
    Math.floor(Math.random() * size.y))
}

function rotateRight(pos) {
  return pos.x == 0 ? new Pos(1,0) : pos
}

function rotateLeft(pos) {
  return pos.x == 0 ? new Pos(-1,0) : pos
}

function rotateUp(pos)
{
  return pos.y == 0 ? new Pos(0,-1) : pos
}

function rotateDown(pos)
{
  return pos.y == 0 ? new Pos(0,1) : pos
}
