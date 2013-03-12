var NUM = 20;
var WIDTH = 10;
var SPACING = 1;
var EPSILON = 1;
var soldiers = [];

function setFormation(val) {
	val = parseInt(val);
	switch(val) {
		case 1:
			formation = function(pos) {
				return new util.Point(pos.x, pos.y + WIDTH + SPACING);
			};
			break;
		case 2:
			formation = function(pos, rank) {
				switch(to) {
					case 'left':
						return (rank & 1) ? new util.Point(pos.x + WIDTH + SPACING, pos.y) : new util.Point(pos.x - (WIDTH + SPACING), pos.y + WIDTH + SPACING);
						break;
					default:
						return (rank & 1) ? new util.Point(pos.x - (WIDTH + SPACING), pos.y) : new util.Point(pos.x + WIDTH + SPACING, pos.y + WIDTH + SPACING);
				}
//				return (rank == Math.floor(NUM / 2)) ? new util.Point(pos.x + WIDTH + SPACING, pos.y - (rank - 1) * (WIDTH + SPACING)) : new util.Point(pos.x, pos.y + WIDTH + SPACING);
			};
			break;
		case 3:
			formation = function(pos, rank) {
				switch(to) {
					case 'left':
						return new util.Point(pos.x - WIDTH - SPACING, pos.y);
						break;
					case 'right':
						return new util.Point(pos.x + WIDTH + SPACING, pos.y);
						break;
					default:
						return (rank & 1) ? new util.Point(pos.x - (rank + 1) * (WIDTH + SPACING), pos.y) : new util.Point(pos.x + (rank + 1) * (WIDTH + SPACING), pos.y);
//						return (rank & 1) ? new util.Point(pos.x - (WIDTH + SPACING), pos.y) : new util.Point(pos.x + WIDTH + SPACING, pos.y + WIDTH + SPACING);
				}
			};
			break;
		case 4:
			formation = function(pos, rank) {
				return;
			};
			break;
		default:
			formation = function(pos) {
				return new util.Point(canvas.width * Math.random(), canvas.height * Math.random());
			};
	}
}

function collide(first, second) {
	return !first.equals(second) && Math.ceil(util.distance(first, second)) < WIDTH + SPACING; // WIDTH + SPACING?
}

function getNeighbors(start, goal, x) {
	var distance = util.distance(x, goal);
	if(distance < EPSILON)
		return [goal];
	else {
		var potentialNeighbors = [
			new util.Point(x.x,     x.y - 1),
			new util.Point(x.x + 1, x.y),
			new util.Point(x.x,     x.y + 1),
			new util.Point(x.x - 1, x.y)];
	}
	var neighbors = [];
	for(var lcv = 0; lcv < potentialNeighbors.length; ++lcv) {
		var flagged = false;
		for(var lcv2 = 0; lcv2 < soldiers.length; ++lcv2)
			if(soldiers[lcv2].equals(goal))
				continue;
			else if(collide(potentialNeighbors[lcv], soldiers[lcv2])) {
				flagged = true;
				break;
			}
		if(!flagged)
			neighbors.push(potentialNeighbors[lcv]);
	}
	return neighbors;
}

function update() {
	var nextPos = new util.Point(canvas.width / 2, 2 * WIDTH);
	var position = 0;
	for(var lcv = 0; lcv < NUM; ++lcv) {
		var minValue = util.distance(soldiers[lcv], nextPos);//Number.MAX_VALUE;
		var minIndex = lcv;
		for(var lcv2 = lcv + 1; lcv2 < NUM; ++lcv2) {
			var nextValue = util.distance(soldiers[lcv2], nextPos);
//			var result = util.astar(nextPos, soldiers[lcv2], util.partial(util.partial(getNeighbors, nextPos), soldiers[lcv2]));
//			if(!result)
//				continue;
//			var nextValue = result.gScores.get(result.nodes[result.nodes.length - 1]);
			if(nextValue < minValue) {
				minValue = nextValue;
				minIndex = lcv2;
			}
		}
		if(minIndex != lcv)
			util.swap(soldiers, lcv, minIndex);
		if(minValue == 0) {
			nextPos = formation(soldiers[lcv], position++);
			continue;
		}
		var skip = false;
		for(var lcv2 = 0; lcv2 < NUM; ++lcv2) { // TODO lcv2 < lcv?
			if(collide(soldiers[lcv], soldiers[lcv2]))
				alert('wtf, already colliding');
			if(lcv != lcv2 && util.distance(soldiers[lcv2], nextPos) <= (WIDTH + SPACING) - EPSILON) {
//			if(lcv != lcv2 && collide(soldiers[lcv2], nextPos)) { //TODO I don't like this
/*
context.fillStyle = 'rgba(255, 255, 255, 1)';
context.beginPath();
context.arc(soldiers[lcv].x, soldiers[lcv].y, WIDTH / 2, 0, 2 * Math.PI, true);
context.fill();
context.fillStyle = 'rgba(127, 127, 127, 1)';
context.beginPath();
context.arc(nextPos.x, nextPos.y, WIDTH / 2, 0, 2 * Math.PI, true);
context.fill();
context.fillStyle = 'rgba(255, 0, 0, 1)';
context.beginPath();
context.arc(soldiers[lcv2].x, soldiers[lcv2].y, WIDTH / 2, 0, 2 * Math.PI, true);
context.fill();
*/
//				nextPos = formation(soldiers[lcv], position++);
//				continue;
//				skip = true;
//				break;
//				return;
				if(lcv < lcv2) {
//alert('peasant in the way');
					nextPos = formation(soldiers[lcv], position++);
					continue;
//					skip = true;
//					break;
				}
				else {
//alert('noble in the way');
					nextPos = formation(soldiers[lcv], position); //TODO maybe random position?
					continue;
//					return;
				}
			}
		}

		if(!skip) {
/*
context.fillStyle = 'rgba(255, 255, 255, 1)';
context.beginPath();
context.arc(soldiers[lcv].x, soldiers[lcv].y, WIDTH / 2, 0, 2 * Math.PI, true);
context.fill();
context.fillStyle = 'rgba(127, 127, 127, 1)';
context.beginPath();
context.arc(nextPos.x, nextPos.y, WIDTH / 2, 0, 2 * Math.PI, true);
context.fill();
alert('commencing astar');
*/
//			var result = util.astar(soldiers[lcv], nextPos, util.partial(util.partial(getNeighbors, soldiers[lcv]), nextPos));
			var result = util.astar(nextPos, soldiers[lcv], util.partial(util.partial(getNeighbors, nextPos), soldiers[lcv]), Math.random() * searchSpace * canvas.width * canvas.height);
			if(result && result.nodes.length >= 2) { //TODO need comparison for undefined?
//				soldiers[lcv] = result.nodes[1];
				soldiers[lcv] = result.nodes[result.nodes.length - 2];
				nextPos = formation(soldiers[lcv], position++);
			}
		}
	}
}

function draw() {
	var offset = {x: canvas.width / 2 - soldiers[0].x, y: 2 * WIDTH - soldiers[0].y};
	canvas.style['background-position'] = offset.x + 'px ' + offset.y + 'px';
	context.clearRect(0, 0, canvas.width, canvas.height);
	for(var lcv = 0; lcv < NUM; ++lcv) {
//		context.fillStyle = (!lcv) ? 'rgba(255, 215, 0, 1)' : 'rgba(0, 0, 0, ' + ((NUM - lcv) / (NUM - 1)) + ')';
		context.fillStyle = (!lcv) ? 'rgba(255, 215, 0, 1)' : 'rgba(0, 0, 0, 1)';
		context.beginPath();
		context.arc(soldiers[lcv].x + offset.x, soldiers[lcv].y + offset.y, WIDTH / 2, 0, 2 * Math.PI, true);
//		context.arc(soldiers[lcv].x, soldiers[lcv].y, WIDTH / 2, 0, 2 * Math.PI, true);
		context.fill();
	}
}

window.onload = function() {
	searchSpace = 0.5;
	document.form.slider.onchange = function() { searchSpace = parseInt(this.value) / 100; return false; };

	searchAlgorithm = 'gbfs';
	document.form.algorithm.onchange = function() { searchAlgorithm = this.value; return false; };

	showPath = false;
	for(var lcv = 0; lcv < document.form.path.length; ++lcv)
		document.form.path[lcv].onchange = function() { showPath = new Boolean(this.value); return false; };

	to = 'center';
	for(var lcv = 0; lcv < document.form.to.length; ++lcv)
		document.form.to[lcv].onchange = function() { to = this.value; return false; };

	for(var lcv = 0; lcv < document.form.formation.length; ++lcv)
		document.form.formation[lcv].onclick = function() { setFormation(this.value); return false; };

	canvas = document.getElementById('example');
	context = canvas.getContext('2d');

	for(var lcv = 0; lcv < NUM; ++lcv)
		soldiers[lcv] = new util.Point(canvas.width * Math.random(), canvas.height * Math.random());

	var flagged = true;
	while(flagged) {
		flagged = false;
		for(var lcv = 0; lcv < NUM; ++lcv)
			for(var lcv2 = lcv + 1; lcv2 < NUM; ++lcv2)
				if(collide(soldiers[lcv], soldiers[lcv2])) {
					flagged = true;
					soldiers[lcv2].set(Math.floor(canvas.width * Math.random()), Math.floor(canvas.height * Math.random()));
				}
	}

	setFormation(0);
	setInterval(function() { draw(); update(); }, 1);
};
