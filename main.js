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

	function Ball(x,y){
		this.last = { x: x || 0, y: y || 0 };
		this.radius = 40;
		this.bounce = .8;
		this.friction = .99;
		this.velocity = { x:0, y:0 };
		this.gravity = { x:0, y:0.2 };
		this.x = this.last.x;
		this.y = this.last.y;
		this.active = true;
	}

	Ball.prototype.preUpdate = function(){
		if(!this.active) return;
		this.velocity.x += this.gravity.x;
		this.velocity.y += this.gravity.y;
		this.last.x += this.velocity.x;
		this.last.y += this.velocity.y;

		if( this.last.y > ctx.canvas.height-this.radius ){
			this.velocity.y*=-this.bounce;
			this.velocity.x*=this.friction;
			this.last.y = ctx.canvas.height-this.radius;
		}else if(this.last.y < this.radius){
			this.velocity.y*=-this.bounce;
			this.last.y = this.radius;
		}
		
		if( this.last.x > ctx.canvas.width-this.radius ){
			this.velocity.x*=-this.bounce;
			this.last.x = ctx.canvas.width-this.radius;
		}else if(this.last.x < this.radius){
			this.velocity.x*=-this.bounce;
			this.last.x = this.radius;
		}
	};

	Ball.prototype.render = function(){
		this.x = this.last.x;
		this.y = this.last.y;
		ctx.fillStyle = "#5a5a5a";
		ctx.strokeStyle="#fff";
		ctx.beginPath();
		ctx.arc(this.x,this.y,this.radius,0,2*Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	};

	Ball.prototype.pointOver = function(x,y){

		return ((x-this.x)*(x-this.x)+(y-this.y)*(y-this.y)) <= (this.radius)*(this.radius);
	};
	Ball.prototype.distanceToPoint = function(x,y){
		return Math.sqrt((x-this.x)*(x-this.x)+(y-this.y)*(y-this.y));
	};

	Ball.prototype.angleTo = function(x,y){
		return Math.atan2(x-this.x,y-this.y)+(90*Math.PI/180);
	};



	var mouse = {
		x:0,
		y:0,
		isDown:false
	};

	var balls = [];
	var ball = null;
	var making = false;

	function updateBalls(){
		for(var i=0;i<balls.length;i++){
			var b = balls[i];

			if(!making && b!=null && mouse.isDown && b.pointOver(mouse.x,mouse.y) && ball == null){
				ball = b;
				lock = true;
				b.active = false;
			}

			b.preUpdate();
		}
	}

	function renderBalls(){
		for(var i=0;i<balls.length;i++){
			var b = balls[i];
			b.render();
		}
	}

	function pointOverSomeBall(x,y){
		for(var i=0;i<balls.length;i++){
			return balls[i].pointOver(x,y);
		}
	}

	function loop(){
		updateScreen(loop);
		
		if(isTouch()){
			window.scrollTo(0,1);
		}

		updateBalls();

		if(mouse.isDown && ball==null && !pointOverSomeBall(mouse.x,mouse.y) && !making ){

			making = true;
			balls[balls.length] = new Ball(mouse.x,mouse.y);
			ball = balls[balls.length-1];
			ball.active = false;
			lock = true;
		}
		
		
		if(!mouse.isDown && lock && ball!=null ){
			lock = false;
			var angle = -ball.angleTo(mouse.x,mouse.y);
			ball.velocity.x = Math.cos(angle)*((ball.distanceToPoint(mouse.x,mouse.y)*0.1));
			ball.velocity.y = Math.sin(angle)*((ball.distanceToPoint(mouse.x,mouse.y)*0.1));
			ball.active = true;
			ball = null;
			making = false;
		}

		cls();

		renderBalls();

		if(lock && ball != null){
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

		balls[balls.length] = new Ball(ctx.canvas.width/2,ctx.canvas.height/2);

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
				var touch = event.targetTouches[0];
				mouse.x = touch.pageX-ctx.canvas.offsetLeft;
				mouse.y = touch.pageY-ctx.canvas.offsetTop;
				mouse.isDown = true;
			});
		}

		loop();
	}

	window.onload = init;

})();