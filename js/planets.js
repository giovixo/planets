var simulation = function() {}

simulation.prototype = {
    G: 10000,
    PATH_MAX_POINTS: 200,
    MAX_DELTA: 0.03,
    STEPS: 50,
    init: function(systems, center, orbit) {
        this.center = center;
        this.systems = systems;
        this.initializePlanets(orbit);
    },
    initializePlanets: function(orbit) {
        this.clearPlanets();
        this.planets = [];
        var planets = this.systems[orbit];
        for (var i in planets) {
            var planet = {
                mass: planets[i].mass,
                position: new Point(planets[i].x, planets[i].y),
                velocity: new Point(planets[i].velX, planets[i].velY),
                color: planets[i].color,
                radius: planets[i].radius
            };
            this.planets.push(planet);
        }
        this.draw();
    },
    clearPlanets: function() {
        for (var i in this.planets) {
            this.planets[i].circle.remove();
            this.planets[i].path.remove();
        }
    },
    draw: function() {
        for (i in this.planets) {
            var planet = this.planets[i];
            var radius = planet.radius;
            planet.circle = new Path.Circle(this.paperCoordinates(planet.position), radius);
            planet.circle.strokeColor = planet.color;
            planet.circle.fillColor = planet.color;
            planet.path = new Path();
            planet.path.strokeColor = planet.color;
            planet.path.strokeWidth = 2
            planet.path.add(new Point(this.paperCoordinates(planet.position)));
        }
    },
    getPositions: function() {
        var pos = new Array(this.planets.length);
        for (var i in this.planets) {
            pos[i] = this.planets[i].position;
        }
        return pos;
    },
    getVelocities: function() {
        var vel = new Array(this.planets.length);
        for (var i in this.planets) {
            vel[i] = this.planets[i].velocity;
        }
        return vel;
    },
    calculateAcceleration: function(positions) {
        var acc = new Array(this.planets.length);
        for (var i in this.planets) {
            acc[i] = new Point(0, 0);
        }
        for (var i in this.planets) {
            for (var j = 0; j < i; j++) {
                var d = positions[j] - positions[i];
                var r2 = Math.pow(d.length, 2);

                var f = d.normalize() * this.G * this.planets[i].mass * this.planets[j].mass / r2;

                acc[i] += f / this.planets[i].mass;
                acc[j] -= f / this.planets[j].mass;
            }
        }
        return acc;
    },
    calculateVelocities: function(acc, dt) {
        var vel = new Array(this.planets.length);
        for (var i in this.planets) {
            vel[i] = this.planets[i].velocity + acc[i] * dt;
        }
        return vel;
    },
    updateVelocities: function(vel) {
        for (var i in this.planets) {
            this.planets[i].velocity = vel[i];
        }
    },
    calculatePositions: function(vel, dt) {
        var pos = new Array(this.planets.length);
        for (var i in this.planets) {
            pos[i] = this.planets[i].position + vel[i] * dt;
        }
        return pos;
    },
    updatePositions: function(positions) {
        for (var i in this.planets) {
            this.planets[i].position = positions[i];
        }
    },
    updateRepresentation: function() {
        for (var i in this.planets) {
            this.updatePlanetRepresentation(this.planets[i]);
        }
    },
    updatePlanetRepresentation: function(planet) {
        planet.circle.position = this.paperCoordinates(planet.position);
        planet.path.add(this.paperCoordinates(planet.position));
        if (planet.path.segments.length > this.PATH_MAX_POINTS) {
            planet.path.removeSegments(0, 1);
        }
    },
    paperCoordinates: function(point) {
        if (this.center === undefined) {
            return view.center + point;
        } else {
            return view.center - this.planets[this.center].position + point;
        }
    },
    simulate: function(delta) {
        var v1 = this.getVelocities();
        var p1 = this.getPositions();
        var a1 = this.calculateAcceleration(p1);

        var v2 = this.calculateVelocities(a1, delta / 2);
        var p2 = this.calculatePositions(v1, delta / 2);
        var a2 = this.calculateAcceleration(p2);

        var v3 = this.calculateVelocities(a2, delta / 2);
        var p3 = this.calculatePositions(v2, delta / 2);
        var a3 = this.calculateAcceleration(p3);

        var v4 = this.calculateVelocities(a3, delta);
        var p4 = this.calculatePositions(v3, delta);
        var a4 = this.calculateAcceleration(p4);

        var acc = new Array(this.planets.length);
        var vel = new Array(this.planets.length);
        for (var i in this.planets) {
            acc[i] = a1[i] / 6 + a2[i] / 3 + a3[i] / 3 + a4[i] / 6;
            vel[i] = v1[i] / 6 + v2[i] / 3 + v3[i] / 3 + v4[i] / 6;
        }
        this.updatePositions(this.calculatePositions(vel, delta));
        this.updateVelocities(this.calculateVelocities(acc, delta));
    },
    onFrame: function(event) {
        var delta = event.delta;
        if (delta > this.MAX_DELTA) delta = this.MAX_DELTA;
        for (var i = 0; i < this.STEPS; i++) {
            this.simulate(delta/this.STEPS);
        }
        this.updateRepresentation();
    }
}

var systems = {
    unstable: [
        {mass: 200, x: 0, y: 0, velX: 0, velY: 0, color: "red", radius: 9},
        {mass: 0.001, x: 60, y: 0, velX: 0, velY: -120, color: "blue", radius: 6},
        {mass: 200, x: 200, y: 0, velX: 0, velY: -120, color: "orange", radius: 9}
    ],
    stable: [
        {mass: 200, x: 0, y: 0, velX: 0, velY: 0, color: "red", radius: 9},
        {mass: 0.001, x: 52, y: 0, velX: 0, velY: -200, color: "blue", radius: 6},
        {mass: 200, x: 200, y: 0, velX: 0, velY: -140, color: "orange", radius: 9}
    ]
}

var sim = new simulation();
sim.init(systems,0, 'stable');

function on(event) {
    sim.onFrame(event);
} 

function startAnimation() {
    console.log("Start animation...");
    view.onFrame = on; 
}

  function stopAnimation() {
    console.log("Animation stopped");
    view.onFrame = undefined;
  }

/* EVENT HANDLERS */

  $(document).ready(function() {
    $("#start").click(function(){
        startAnimation();
    }); 
    $("#stop").click(function(){
      stopAnimation();
    }); 
    $('#inputSelect').on('change', function() {
        sim.init(systems,0, this.value);
    });
});

