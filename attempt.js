function City(width,height,topology,points) {
    this.points = points;
    this.width = width;
    this.height = height;
    this.data = topology;
    this.key = Object.keys(this.data.objects);
    this.projection = d3.geo.mercator().scale(1).translate([0,0]);
    this.path = d3.geo.path().projection(this.projection);
    this.b = this.path.bounds(
	topojson.feature(this.data, this.data.objects[this.key])
    );
    this.s = .95 / Math.max(
	(this.b[1][0] - this.b[0][0]) / this.width, 
	(this.b[1][1] - this.b[0][1]) / this.height
    );
    this.t = [
	(this.width - this.s * (this.b[1][0] + this.b[0][0])) / 2,
	(height - this.s * (this.b[1][1] + this.b[0][1])) / 2
    ];
    this.projection = this.projection.scale(this.s).translate(this.t);
};

City.prototype = {

	getBlocks: function() {

	    var data = this.data;
	    var projection = this.projection;
	    var path = this.path;
	    var width = this.width;
	    var height = this.height;
	    var key = this.key;
	    var container = [];
	    var blocks = topojson.feature(data, data.objects[key]).features;
	    var times = blocks.length;


	    for(var k=0; k<times; k++) {

	        var block = blocks[k];
	        var name = block.properties.CVEGEO;
	        block = path(block);

	        block = block.split("L");
	        block[0] = block[0].split("M")[1];
	        block[block.length-1] = block[block.length-1].split("Z")[0];


	        for(var i in block) {
		    block[i] = block[i].split(",");

		    for(var j in block[i]) {
		        block[i][j] = Number(block[i][j]);
		    }  
    // <!!> Shift the relative position of the vertical coordinates <!!>
		    block[i][1] = (1-(block[i][1]/height))*height;
		}

	        block = { vertices:block, name:name };
	        container.push(block);
	    } 

	    return container;

	},

	getPoints: function() {
	    var height = this.height;
	    var points = this.points.features;
	    var container = [];
	    var point;
	    for(var i in points) {
		var cvegeo = points[i].properties.CVEGEO;
		var idunico = points[i].properties.IDUNICO;
		var tipo = points[i].properties.TIPODOM; // TIPODOM..
		var personas = points[i].properties.personas;
		point = this.projection(points[i].geometry.coordinates);
		point[1] = (1-(point[1]/height))*height;
		container.push({
		    coords:point,
		    cvegeo:cvegeo,
		    idunico:idunico,
		    tipo:tipo,
		    personas:+personas
		});
	    }

	return container;
	}

};
