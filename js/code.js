function init(blocks, points,days) {
var maximum = days;
var daysPassed = 0;

d3.select("body").append("div")
    .style({
	"color":"white",
	"margin-top":"50%"
    }).attr("id", "loading")
.html("cargando");

var blocks = blocks;

        var scene = new THREE.Scene();
	var axes = new THREE.AxisHelper(2000);
//	scene.add(axes);
        var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);

	camera.position.set(350,250,600);
//        camera.lookAt(new THREE.Vector3(350, 250, 0));

        var webGLRenderer = new THREE.WebGLRenderer({alpha:true,antialias:true});
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	webGLRenderer.setClearColor("rgb(0,0,0)",0);

        document.body//getElementById("WebGL-output")
	    .appendChild(webGLRenderer.domElement);

// <----


function topology() {
    function drawShape(arr) {
            // create a basic shape
      var shape = new THREE.Shape();

      for(var i=0; i<arr.length;i++) {

        if(i==0) { shape.moveTo(arr[i][0],arr[i][1]); }
	else { shape.lineTo(arr[i][0],arr[i][1]); }

      }
      return shape;

    }


for(var i in blocks) {

	var block = drawShape(blocks[i].vertices);
	block = new THREE.ShapeGeometry(block);

        var meshMaterial = new THREE.MeshBasicMaterial({
	    color:"white",
	    transparent:true,
	    opacity:0.1,
	    wireframe: false
	});

	var mesh = new THREE.Mesh( block, meshMaterial );
	mesh.name = blocks[i].name;

	var edges = new THREE.EdgesHelper(mesh,"white");
	edges.material.linewidth = 0.00002;
	edges.material.transparent = true;
	edges.material.opacity = 0.25

	scene.add(mesh);
	scene.add(edges);
}
}

// <--
//topology();


//SELECCIONAR SÓLO LAS VIVIENDAS!!
var viviendas = []
for(var i in points) {
var c = points[i].tipo == "VIVIENDA" || points[i].tipo == "VIVIENDA CON ACTIVIDAD ECONÓMICA";
  if(c) { viviendas.push(points[i]); };
};

var ar = viviendas;//points;

var particle_system_geometry = new THREE.Geometry();
var particle_system_material = new THREE.ParticleBasicMaterial({
    size:1,
    sizeAttenuation: false,
    vertexColors: true,
    color:"white"
});

function Agent(name,start,finish,members) {
    this.name = name;
    this.schedule = {
	start: { hour: start.hour, mins: start.mins },
	finish: { hour:finish.hour, mins:finish.mins }
    };
    this.whereabout = 1;
    this.consuming = Math.floor(Math.random()*this.members*0.8);
    this.members = members;
}

Agent.prototype = {
    routine: function(hr,mins) {
	var h0 = hr //+ Math.floor(Math.random()*3);
	var h1 = hr //+ Math.floor(Math.random()*5);
	var m1 = mins //+ Math.floor(Math.random()*5);

	if(h0==this.schedule.start.hour&&m1==this.schedule.start.mins) {
	    this.whereabout = 0;
	}
	if(h1==this.schedule.finish.hour&&mins==this.schedule.finish.mins) { 
	    this.whereabout = 1;
	}
    },

    activity: function(w,hr) {
	if(w===1) this.consuming = Math.floor(Math.random()*this.members*800);
//	if(w===1 && hr ==
	if(w===0) this.consuming = 0;
    },

    
};

function members(num,id,s,f) {
  var members = [];
var start, finish;
  for(var i=1; i<=num; i++) {
    members.push(new Agent(id,s,f))
  }
  return new Agent(id,s,f);
}


// DEFINE AGENTS CHARACTERISTICS !! ----> HERE!
for(var i in ar) {
    var particle = new THREE.Vector3(ar[i].coords[0],ar[i].coords[1],0);
    particle.cvegeo = ar[i].cvegeo;
    particle.idunico = ar[i].idunico;
    particle.personas = ar[i].personas;

    var start = {
	hour: 5 + Math.floor(Math.random()*9),
	mins: Math.floor(Math.random()*59)
    };
    var finish = {
	hour: 12 + Math.floor(Math.random()*12),
	mins: Math.floor(Math.random()*59)
    };

    particle.agents = new Agent(i,start,finish,particle.personas)
//members(1,i,start,finish,particle.personas);

    particle_system_geometry.vertices.push(particle);
    var c = Math.random();
    var color = new THREE.Color().setRGB(1,c,0);
    particle_system_geometry.colors.push(color);
}


var particleSystem = new THREE.ParticleSystem(
  particle_system_geometry,particle_system_material
);
particleSystem.sortParticles = true;

scene.add(particleSystem);
// /*Check agents --> */ console.log(particleSystem.geometry.vertices);

context.font = "bold 35px Helvetica";
context.fillStyle = "rgba(255,255,255,.25)";
context.fillText("San Pedro Cholula", canvas.width*.66, canvas.height*.33)

context.font = "20px Helvetica";
context.fillStyle = "rgba(255,255,255,0.5)"
context.fillText("Energy consumption simulation:", canvas.width*.025, canvas.height*.89)
context.font = "12px Helvetica";
context.fillText("Real time visualization using the GPU for parallel computation (Three.js),", canvas.width*.025, canvas.height*.92)
context.fillText("an approach for multi-agent bottom-up modelling of real cities in the web browser.", canvas.width*.025, canvas.height*.95)


var t0,t1,a=0,minutes=0,hr=0;
t0 = new Date().getTime();
var particles = particleSystem.geometry.vertices;
var colors = particleSystem.geometry.colors;

var id;

        function render() {

//	    camera.position.z += -5;


/*
setTimeout(function() {
  particles.vertices.forEach(function(p) {
    p.z += Math.random()*20 ;
  }); }, 3000);

colors.forEach(function(c) {
    var col = Math.random();
    c.setRGB(col,0,0);
});
*/
particleSystem.geometry.vertices.needsUpdate = true;

            // render using requestAnimationFrame
            id = requestAnimationFrame(render, canvas);
            webGLRenderer.render(scene, camera);


        context.font = "15px Helvetica";
        var x = canvas.width*.70
        var y = canvas.height*0.34;

        t1 = new Date().getTime();
        num = t1 - t0;
        if(num<100) { a += num }
 //       a += num
        if(a>=1) { a=0; minutes++ }
        if(minutes==60) { minutes=0; hr++ }
        if(hr==25) { hr=1; daysPassed++ }
        t0 = t1;

	var time = hr + ":" + minutes;
	var hora = "Time: " + time;
        var textW = context.measureText(hora).width;
        var textH = parseInt(context.font);

//        requestAnimationFrame(animate2, canvas);
        context.clearRect(x-1,y,textW+25,textH);
        context.fillStyle = "rgba(255,255,255,.2)";
        context.fillText(hora, x,y+textH);
	var duration = 1000;
	var day = "rgb(100%,63%,0%)";



/*
        if (hr==6) { 
          body.transition()
          .style("background-color", day).duration(duration);

	    colors.forEach(function(c) {
		c.setRGB(1,1,1);
	    });

	}

        if (hr==19) {
	  body.transition()
          .style("background-color", "rgb(13,26,129)").duration(duration);

	    colors.forEach(function(c) {
		var col = Math.random();
		c.setRGB(1,col,0);
	    });
	
	}
*/

	dynamics(hr,minutes);

	console.log(maximum)
	if(daysPassed>maximum) {
	    cancelAnimationFrame(id);
	    d3.selectAll("canvas").remove();
	    d3.select("body").transition().style("background-color","white");
	}

	}

/////////////DYNAMICS!///////////////////////////////////////
function dynamics(hour, minutes) {

    var houseCount = new Array(particles.length);
    var consumeCount = new Array(particles.length);
    var hr = hour;

    particles.forEach(function(a,i) {

	a.agents.routine(hr,minutes);


	var w = a.agents.whereabout;
	a.agents.activity(w);


	if(a.agents.whereabout === 1) colors[i].setRGB(1,1,1);
	if(a.agents.whereabout === 0) colors[i].setRGB(0,0,0);
	if(a.agents.consuming > 800*3 ) colors[i].setRGB(1,0.2,0);//lights


	houseCount[i] = a.agents.whereabout;
	consumeCount[i] = a.agents.consuming;
    });


 	

    var sumHouses = houseCount.reduce(function add(a,b) { return a+b; }, 0);
    var sumConsumption = consumeCount.reduce(function add(a,b) { return a+b; },0);

    var inHouse = "People in households: " + sumHouses;
    var inConsumption = "Consumption: " + sumConsumption + " Wh";

    context.font = "15px Helvetica";
    var x1 = canvas.width*.7
    var y1 = canvas.height*0.34 + 20;
    var y2 = canvas.height*0.34 + 40;

    var textW1 = context.measureText(inHouse).width;
    var textW2 = context.measureText(inConsumption).width;

    var textH = parseInt(context.font);

    context.clearRect(x1-1,y1,textW1+25,textH);
    context.clearRect(x1-1,y2,textW2+25,textH);

    context.fillStyle = "rgba(255,255,255,.2)";
    context.fillText(inHouse, x1,y1+textH);
    context.fillText(inConsumption, x1,y2+textH);


}



if(render) d3.select("#loading").remove();
        
    render();


} 
