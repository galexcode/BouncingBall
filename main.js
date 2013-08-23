(function(){
	var updateScreen = (function(){
		return  window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame 	||
		window.mozRequestAnimationFrame 	||
		window.oRequestAnimationFrame	||
		window.msRequestAnimationFrame ||		
		function( callback ){
			window.setTimeout(callback, 17);
		};
	})();

	function isTouch(){
		return 'ontouchstart' in window;
	}

	//**//

	function cls(c){
		c = c || "#000";
		var lc = ctx.fillStyle;
		ctx.fillStyle = c;
		ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
		ctx.fillStyle = lc;
	}

	var ctx = document.getElementById("gc").getContext("2d");
	
	var lock = false;
	var ball = {
		x:0,
		y:0,
		radius:40,
		bounce:.8,
		friction:.99,
		velocity:{
			x:0,
			y:0
		},
		gravity:{
			x:0,
			y:0.2
		},
		last:{
			x:0,
			y:0
		},
		preUpdate:function(){
			ball.velocity.x += ball.gravity.x;
			ball.velocity.y += ball.gravity.y;
			ball.last.x += ball.velocity.x;
			ball.last.y += ball.velocity.y;
			if( ball.last.y > ctx.canvas.height-ball.radius ){
				ball.velocity.y*=-ball.bounce;
				ball.velocity.x*=ball.friction;
				ball.last.y = ctx.canvas.height-ball.radius;
			}else if(ball.last.y < ball.radius){
				ball.velocity.y*=-ball.bounce;
				ball.last.y = ball.radius;
			}
			
			if( ball.last.x > ctx.canvas.width-ball.radius ){
				ball.velocity.x*=-ball.bounce;
				ball.last.x = ctx.canvas.width-ball.radius;
			}else if(ball.last.x < ball.radius){
				ball.velocity.x*=-ball.bounce;
				ball.last.x = ball.radius;
			}
		},
		update:function(){
			ball.x = ball.last.x;
			ball.y = ball.last.y;
		},
		render:function(){
			ctx.fillStyle = "#5a5a5a";
			ctx.strokeStyle="#fff";
			ctx.beginPath();
			ctx.arc(ball.x,ball.y,ball.radius,0,2*Math.PI);
			ctx.fill();
			ctx.stroke();
			ctx.closePath();
		},
		pointOver:function(x,y){
			return ((x-ball.x)*(x-ball.x)+(y-ball.y)*(y-this.y)) <= (ball.radius)*(ball.radius);
		},
		distanceToPoint:function(x,y){
			return Math.sqrt((x-ball.x)*(x-ball.x)+(y-ball.y)*(y-ball.y));
		},
		angleTo:function(x,y){
			return Math.atan2(x-ball.x,y-ball.y)+(90*Math.PI/180)
		}
	};

	var mouse = {
		x:0,
		y:0,
		isDown:false
	};

	function loop(){
		updateScreen(loop);
		
		if(isTouch()){
			window.scrollTo(0,1);
		}

		if(mouse.isDown && ball.pointOver(mouse.x,mouse.y)){
			lock = true;

		}else if(!mouse.isDown && lock){
			lock = false;
			var angle = -ball.angleTo(mouse.x,mouse.y);
			ball.velocity.x = Math.cos(angle)*((ball.distanceToPoint(mouse.x,mouse.y)*0.1));
			ball.velocity.y = Math.sin(angle)*((ball.distanceToPoint(mouse.x,mouse.y)*0.1));
		}

		cls();

		if(!lock) ball.preUpdate();

		ball.update();

		ball.render();

		if(lock){
			var angle = -ball.angleTo(mouse.x,mouse.y);
			var cx = ball.x+Math.cos(angle)*ball.distanceToPoint(mouse.x,mouse.y);
			var cy = ball.y+Math.sin(angle)*ball.distanceToPoint(mouse.x,mouse.y);
			ctx.strokeStyle = "#ffff00";
			ctx.beginPath();
			ctx.moveTo(ball.x,ball.y);
			ctx.lineTo(cx,cy);
			ctx.closePath();
			ctx.stroke();

			ctx.strokeStyle = "#00ffff";
			ctx.beginPath();
			ctx.moveTo(ball.x,ball.y);
			ctx.lineTo(mouse.x,mouse.y);
			ctx.closePath();
			ctx.stroke();

			ctx.fillStyle = "#ff0000";
			ctx.beginPath();
			ctx.arc(mouse.x,mouse.y,10,0,2*Math.PI);
			ctx.fill();
			ctx.closePath();

		}
	}

	function init(){
		ctx.canvas.width = window.innerWidth;
		ctx.canvas.height = window.innerHeight;

		window.onresize = function(){
			ctx.canvas.width = window.innerWidth;
			ctx.canvas.height = window.innerHeight;
		};

		ball.last.x = ctx.canvas.width/2;
		ball.last.y = ctx.canvas.height/2;

		if(!isTouch()){

			ctx.canvas.addEventListener('mouseup', function(event) {
				mouse.isDown = false;
			});

			ctx.canvas.addEventListener('mousemove', function(event) {
				mouse.x = event.clientX-ctx.canvas.offsetLeft;
				mouse.y = event.clientY-ctx.canvas.offsetTop;
			});

			ctx.canvas.addEventListener('mousedown', function(event) {
				mouse.isDown = true;
			});

		}else{

			ctx.canvas.addEventListener('touchend', function(event) {
				event.preventDefault();
				mouse.isDown = false;
			});

			ctx.canvas.addEventListener('touchmove', function(event) {
				event.preventDefault();
				var touch = event.targetTouches[0];
				mouse.x = touch.pageX-ctx.canvas.offsetLeft;
				mouse.y = touch.pageY-ctx.canvas.offsetTop;
				
			});

			ctx.canvas.addEventListener('touchstart', function(event) {
				event.preventDefault();
				mouse.isDown = true;
			});
		}

		loop();
	}

	window.onload = init;

})();