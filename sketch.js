let biggestTree;

function setup() {
	const squareLength = min(windowWidth, windowHeight);
	const halfSquareLength = squareLength / 2;

	createCanvas(squareLength, squareLength);
	biggestTree = new QuadTree(
		new AABB(
			new XY(halfSquareLength, halfSquareLength),
			halfSquareLength
		)
	);

	fill(0);
	rectMode(CENTER);
}


// recursive drawing of quad tree, only leaf nodes are drawn
function drawQuadTree(tree) {
	if(tree.nw != null){
		drawQuadTree(tree.nw);
		drawQuadTree(tree.ne);
		drawQuadTree(tree.sw);
		drawQuadTree(tree.se);
	} else {
		// whites of eyes
		fill(255,255,230);
		rect(tree.boundary.center.x, tree.boundary.center.y, tree.boundary.halfDimension * 2, tree.boundary.halfDimension * 2);

		// black pupil
		let pupilLoc = new XY(mouseX - tree.boundary.center.x, mouseY - tree.boundary.center.y);
		if(Math.sqrt((pupilLoc.x * pupilLoc.x) + (pupilLoc.y * pupilLoc.y)) > tree.boundary.halfDimension / 2) {
			// normalize pupilLoc and set magnitude to 1/2 halfdimension
			const theta = Math.atan2(pupilLoc.x, pupilLoc.y);
			pupilLoc.x = sin(theta) * (tree.boundary.halfDimension / 2);
			pupilLoc.y = cos(theta) * (tree.boundary.halfDimension / 2);
		}

		fill(0);
		ellipse(tree.boundary.center.x + pupilLoc.x, tree.boundary.center.y + pupilLoc.y, tree.boundary.halfDimension);

		const R = noise(Date.now() / 1000, tree.boundary.center.x / width, tree.boundary.center.y / height);
		const A = map(R, 0, 1, 0, pupilLoc.y + (tree.boundary.halfDimension));
		const GAP = 20;

		//fill(200);
		

		// eyelids
		//upper

		fill(80, 40, 255);
		stroke(255, 40, 80);
		strokeWeight(0.5);

		const LIDY = tree.boundary.center.y - tree.boundary.halfDimension;

		quad(
			tree.boundary.center.x - tree.boundary.halfDimension, LIDY,
			tree.boundary.center.x + tree.boundary.halfDimension, LIDY,
			tree.boundary.center.x + tree.boundary.halfDimension, LIDY + A - pupilLoc.x / 2,
			tree.boundary.center.x - tree.boundary.halfDimension, LIDY + A + pupilLoc.x / 2
		);
		
		//lower
		const B = map(A, tree.boundary.halfDimension / 2, tree.boundary.halfDimension / 2 * 3, tree.boundary.halfDimension / 3, tree.boundary.halfDimension / 7);
		quad(
			tree.boundary.center.x - tree.boundary.halfDimension, tree.boundary.center.y + tree.boundary.halfDimension,
			tree.boundary.center.x + tree.boundary.halfDimension, tree.boundary.center.y + tree.boundary.halfDimension,
			tree.boundary.center.x + tree.boundary.halfDimension, LIDY + (tree.boundary.halfDimension * 2) - B,
			tree.boundary.center.x - tree.boundary.halfDimension, LIDY + (tree.boundary.halfDimension * 2) - B
		);
	}
}

function draw() {
	background(0);
	
	drawQuadTree(biggestTree);
}

function mouseClicked() {
	biggestTree.insert(new XY(mouseX, mouseY));
	return false;
}

// Simple coordinate object to represent points and vectors
function XY(x, y)
{
  this.x = x;
  this.y = y;
}

// Axis-aligned bounding box with half dimension and center
function AABB(center, halfDimension)
{
  this.center = center;
  this.halfDimension = halfDimension;
}

AABB.prototype.containsPoint = function(point) {
	return (
		abs(this.center.x - point.x) < this.halfDimension
		&& abs(this.center.y - point.y) < this.halfDimension
	);
}

function QuadTree(boundary)
{
  // Arbitrary constant to indicate how many elements can be stored in this quad tree node
  this.QT_NODE_CAPACITY = 1;

  // Axis-aligned bounding box stored as a center with half-dimensions
  // to represent the boundaries of this quad tree
  this.boundary = boundary;

  // Points in this quad tree node
  this.points = [];

  // Children
  this.nw;
  this.nw;
  this.sw;
  this.se;
}

QuadTree.prototype.insert = function(p) {
	// Ignore objects that do not belong in this quad tree
	if (!this.boundary.containsPoint(p))
		return false; // object cannot be added

	// If there is space in this quad tree and if doesn't have subdivisions, add the object here
	if (this.points.length < this.QT_NODE_CAPACITY && this.nw == null)
	{
		this.points.push(p);
		this.subdivide();
		return true;
	}

	// // Otherwise, subdivide and then add the point to whichever node will accept it
	// if (this.nw == null)
	// 	this.subdivide();

	if (this.nw.insert(p)) return true;
	if (this.ne.insert(p)) return true;
	if (this.sw.insert(p)) return true;
	if (this.se.insert(p)) return true;
	// Otherwise, the point cannot be inserted for some unknown reason (this should never happen)
	return false;
}

QuadTree.prototype.subdivide = function() {
	const quarterDimension = this.boundary.halfDimension / 2;
	this.nw = new QuadTree(new AABB(new XY(this.boundary.center.x + quarterDimension, this.boundary.center.y - quarterDimension), quarterDimension));
	this.ne = new QuadTree(new AABB(new XY(this.boundary.center.x - quarterDimension, this.boundary.center.y - quarterDimension), quarterDimension));
	this.sw = new QuadTree(new AABB(new XY(this.boundary.center.x + quarterDimension, this.boundary.center.y + quarterDimension), quarterDimension));
	this.se = new QuadTree(new AABB(new XY(this.boundary.center.x - quarterDimension, this.boundary.center.y + quarterDimension), quarterDimension));
}

// QuadTree.prototype.queryRange = function(range) {

// }