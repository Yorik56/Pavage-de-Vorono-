const points = [];
const nPoints = 100;
let mouseCellIndex;
let voronoi, polygons;

function setup() {
	createCanvas(windowWidth, windowHeight);

	// Générer des points aléatoires
	for (let i = 0; i < nPoints; i++) {
		let point;
		let minDist = 50; // Distance minimale entre les points
		// Continuer à générer des points jusqu'à ce qu'un point soit trouvé qui est à une distance minimale de tous les autres points
		while (true) {
			point = [random(width), random(height)];
			if (i === 0 || minDistToOtherPoints(point, points) >= minDist) {
				break;
			}
		}
		// Ajouter un attribut de couleur à chaque point
		points.push({ pos: point, color: 255 });
	}

	// Ajoutez un point pour la cellule de la souris et initialisez l'index de la cellule de la souris
	points.push({ pos: [0, 0], color: 255 });
	mouseCellIndex = nPoints;

	// Créer un diagramme de Voronoi à partir des points générés
	voronoi = d3.voronoi().extent([[0, 0], [width, height]]);
	const diagram = voronoi(points.map(p => p.pos));
	polygons = diagram.polygons();

	frameRate(120);
}

function minDistToOtherPoints(point, points) {
	let minDist = Infinity;
	for (let otherPoint of points) {
		let dist = sqrt(pow(point[0] - otherPoint.pos[0], 2) + pow(point[1] - otherPoint.pos[1], 2));
		if (dist < minDist) {
			minDist = dist;
		}
	}
	return minDist;
}

function drawRoundedPolygon(polygon, fillColor) {

	stroke(0); // Couleur de la bordure des cellules
	fill(fillColor); // Couleur de remplissage des cellules
	strokeWeight(0.5); // Épaisseur de la bordure des cellules

	const nVertices = polygon.length;

	beginShape();
	for (let i = 0; i < nVertices; i++) {
		const [x1, y1] = polygon[i];
		const [x2, y2] = polygon[(i + 1) % nVertices];
		const [x3, y3] = polygon[(i + 2) % nVertices];

		const xm1 = (x1 + x2) / 2;
		const ym1 = (y1 + y2) / 2;
		const xm2 = (x2 + x3) / 2;
		const ym2 = (y2 + y3) / 2;

		vertex(xm1, ym1);

		bezierVertex(x2, y2, x2, y2, xm2, ym2);
	}
	endShape(CLOSE);

	// Dessiner le point central rouge
	const [cx, cy] = polygon.data;
	fill(255, 0, 0);
	ellipse(cx, cy, 3, 3);
}

function draw() {
	background(255);


	// Mettre à jour la couleur des cellules en fonction de la proximité de la cellule de la souris
	const mousePos = points[mouseCellIndex].pos;
	for (let i = 0; i < nPoints; i++) {
		const point = points[i];
		const dist = sqrt(pow(mousePos[0] - point.pos[0], 2) + pow(mousePos[1] - point.pos[1], 2));
		if (dist < 50) {
			point.color = 0;
		} else {
			point.color = min(255, point.color + 5); // Augmenter la vitesse de transition vers le blanc
		}
	}

	// Dessiner les cellules de Voronoi
	for (let i = 0; i < polygons.length; i++) {
		const polygon = polygons[i];
		if (polygon) {
			const fillColor = color(255, points[i].color, points[i].color); // Modifier la couleur de remplissage pour avoir une trainée rouge
			drawRoundedPolygon(polygon, fillColor);
		}
	}
}

function mouseMoved() {
	// Déplacez le point de la cellule de la souris à la position de la souris
	points[mouseCellIndex].pos = [mouseX, mouseY];

	// Mettre à jour le diagramme de Voronoi
	const diagram = voronoi(points.map(p => p.pos));
	polygons = diagram.polygons();
}