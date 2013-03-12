var util = {};

util.partial = function() {
	var args = Array.prototype.slice.call(arguments);
	var func = args.shift();
	return function() {
		return func.apply(null, args.concat(Array.prototype.slice.call(arguments)));
	};
};

util.distance = function(a, b) {
	return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
};

util.manhattanDistance = function(a, b) {
	return Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
};

util.swap = function(list, a, b) {
	var temp = list[a];
	list[a] = list[b];
	list[b] = temp;
};

util.Hashtable = function() {
	this._length = 0;
	this.items = new Object();
};

util.Hashtable.prototype.put = function(key, value) {
	key = key.toString();
	if(!(key in this.items))
		++this._length;
	this.items[key] = value;
};

util.Hashtable.prototype.get = function(key) {
	return this.items[key.toString()];
};

util.Hashtable.prototype.length = function() {
	return this._length;
};

util.Point = function(x, y) {
	this.x = x;
	this.y = y;
};

util.Point.prototype.set = function(x, y) {
	this.x = x;
	this.y = y;
};

util.Point.prototype.length = function() {
	return util.distance(this, {x: 0, y: 0});
};

// Not real normal, length <= 1
util.Point.prototype.normalize = function() {
	if(this.x || this.y) {
		var length = this.length();
		if(length > 1) {
			this.x /= length;
			this.y /= length;
		}
	}
};

util.Point.prototype.equals = function(that) {
	return this.x == that.x && this.y == that.y;
};

util.Point.prototype.toString = function() {
	return '(' + this.x + ', ' + this.y + ')';
};

util.PriorityQueue = function(comparator) {
	this.comparator = comparator;
	this.items = [];
};

util.PriorityQueue.prototype.enqueue = function(item) {
	var lcv = this.items.length;
	this.items[lcv] = item;
	for(; lcv > 0; lcv = lcv2) {
		var lcv2 = Math.floor(lcv / 2);
		if(this.comparator(this.items[lcv], this.items[lcv2]) < 0)
			util.swap(this.items, lcv, lcv2);
		else
			break;
	}
};

util.PriorityQueue.prototype.dequeue = function() {
	var result = this.items[0];
	this.items[0] = this.items[this.items.length - 1];
	this.items.length -= 1;
	for(var lcv = 0; 2 * lcv + 2 < this.items.length; lcv = lcv2) {
		if(this.comparator(this.items[2 * lcv + 1], this.items[2 * lcv + 2]) < 0)
			if(this.comparator(this.items[2 * lcv + 1], this.items[lcv]) < 0)
				var lcv2 = 2 * lcv + 1;
			else
				break;
		else
			if(this.comparator(this.items[2 * lcv + 2], this.items[lcv]) < 0)
				var lcv2 = 2 * lcv + 2;
			else
				break;
		util.swap(this.items, lcv, lcv2);
	}
	if(2 * lcv + 2 == this.items.length && this.comparator(this.items[2 * lcv + 1], this.items[lcv]) < 0)
		util.swap(this.items, lcv, 2 * lcv + 1);
	return result;
};

util.PriorityQueue.prototype.contains = function(x) {
	for(var lcv = 0; lcv < this.items.length; ++lcv)
//		if(this.comparator(this.items[lcv], x) == 0)
		if(x.equals(this.items[lcv]))
			return true;
	return false;
};

util.astar = function(start, goal, getNeighbors, limit) {
	if(!limit) {
		alert('no limit up in this');
		limit = Number.MAX_VALUE;
	}

	var reconstruct = function(cameFrom, current) {
		var p = [current];
		if(!cameFrom.get(current))
			return p;
		return reconstruct(cameFrom, cameFrom.get(current)).concat(p);
	};
	var cameFrom = new util.Hashtable();
	var gScores = new util.Hashtable();
	var hScores = new util.Hashtable();
	var fScores = new util.Hashtable();
//	var openSet = new util.PriorityQueue(function(a, b) { return fScores.get(a) - fScores.get(b); });
	switch(searchAlgorithm) {
		case 'gbfs' :
			var openSet = new util.PriorityQueue(function(a, b) { return hScores.get(a) - hScores.get(b); });
			break;
		case 'a*':
			var openSet = new util.PriorityQueue(function(a, b) {
				if(fScores.get(a) == undefined || fScores.get(b) == undefined)
					alert('bullshit');
				if(fScores.get(a) == fScores.get(b))
					return hScores.get(a) - hScores.get(b);
				return fScores.get(a) - fScores.get(b); });
			break;
	}
	var closedSet = new util.Hashtable();

	gScores.put(start, 0);
//	hScores.put(start, util.distance(start, goal));
	hScores.put(start, util.manhattanDistance(start, goal));
//	hScores.put(start, 0);
	fScores.put(start, hScores.get(start));
	openSet.enqueue(start);
	while(openSet.items.length > 0 && closedSet.length() < limit) {
		var x = openSet.dequeue();
		if(showPath) {
			context.fillStyle = 'rgba(0, 0, 0, 1)';
			context.beginPath();
			context.arc(x.x, x.y, .5, 0, 2 * Math.PI, true);
			context.fill();
		}
		if(x.equals(goal))
			return {nodes: reconstruct(cameFrom, x), gScores: gScores};
		closedSet.put(x, true);

		var neighbors = getNeighbors(x);
		for(var lcv = 0; lcv < neighbors.length; ++lcv) {
			var y = neighbors[lcv];
			if(closedSet.get(y))
				continue;
			var tentative = gScores.get(x) + 1;//TODO is this ok? I think so.. util.distance(x, y);

			var enqueue = false;
			var tentativeIsBetter = false;
			if(!openSet.contains(y)) {
//				openSet.enqueue(y);
				enqueue = true;
				tentativeIsBetter = true;
			}
			else if(tentative < gScores.get(y))
				tentativeIsBetter = true;

			if(tentativeIsBetter) {
				cameFrom.put(y, x);
				gScores.put(y, tentative);
//				var heuristic = util.distance(y, goal);
				var heuristic = util.manhattanDistance(y, goal);
//				var heuristic = 0;
/*
				var dx1 = y.x - goal.x;
				var dy1 = y.y - goal.y;
				var dx2 = start.x - goal.x;
				var dy2 = start.y - goal.y;
				var cross = Math.abs(dx1 * dy2 - dx2 * dy1);
				hScores.put(y, heuristic + cross * 0.1);
*/
				hScores.put(y, heuristic);
				fScores.put(y, tentative + heuristic);
				if(enqueue)
					openSet.enqueue(y);
			}
		}
	}
	return undefined;
};
