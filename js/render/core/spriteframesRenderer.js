var SpriteframesRenderer = function(app){
	this.app = app;
	this.dom = {};
	this.sprites = [];
	this.normalImages = [];
	this.outlineImages = [];
	this.times = [];
	this.fps = CONFIG.defaultFps;
	this.actualFrame = 0;
	this.maxFrames = 0;

	this._make2DCanvas();
	this._makeOutline();
	this._link();
};

SpriteframesRenderer.prototype = {

	_make2DCanvas : function(){
		this.dom.canvas = document.createElement('canvas');
		this.dom.canvas.width = CONFIG.finalSize.width;
		this.dom.canvas.height = CONFIG.finalSize.height;
		// -- canvas
		this.canvas = this.dom.canvas.getContext('2d');
		this.canvas.imageSmoothingEnabled = false;
	},

	_makeOutline : function(){
		this.outline = new Outline();
	},

	_getModules : function(){
		this.view3D = this.app.view3D;
		this.controls = this.app.viewControls;
	},

	_getFramesTime : function(){
		if (!!this.view3D.mixer) {
			var timeSteps = Math.round(this.view3D.model.animations[this.view3D.animIndex].duration / (1/this.fps));
			this.maxFrames = timeSteps;
			for(var i=0;i<timeSteps;i++){
				var time = (1/this.fps) * i;
				this.times.push(time);
			}
		} else {
			this.maxFrames = 1;
		}
	},

	_generateAnimation : function(){
		this.actualFrame = 0;
		this.sprites = [];
		this.normalImages = [];
		this.outlineImages = [];
		this.times = [];

		GAME.signals.makeEvent('loadinger.show', window, null);

		this._getModules();
		this.view3D.stopAnimation();
		this._getFramesTime();
		this._setRendererSize();
	},

	_setRendererSize : function(s){
		// -- set new camera aspect ratio
		this.view3D.camera.aspect = CONFIG.renderSize.width / CONFIG.renderSize.height;
		this.view3D.camera.updateProjectionMatrix();
		// -- change renderer size (viewport)
		var renderer = this.view3D.renderer;
		renderer.setSize(CONFIG.renderSize.width, CONFIG.renderSize.height);
		this.view3D._tick(0);

		this._getCanvasFrame();
	},

	// _getCanvasFrame : function(){
	// 	if (this.actualFrame >= this.maxFrames) {
	// 		this._generateDone();
	// 		return;
	// 	}

	// 	// -- loader
	// 	GAME.signals.makeEvent('loadinger.progress', window, { progress : (this.actualFrame / this.maxFrames) });

	// 	// -- set animation frame
	// 	if (!!this.view3D.mixer) {
	// 		this.view3D.animChange({ data : { time : (this.actualFrame) * (1/this.fps) }});
	// 	}

	// 	var canvas 	= this.view3D.renderer.domElement;
	// 	var img1 		= new Image();
	// 	img1.src 		= canvas.toDataURL();

	// 	setTimeout(function(){
	// 		var canvas 	= this.view3D.renderer.domElement;
	// 		var img 		= new Image();
	// 		img.src 		= canvas.toDataURL();
	// 		img.onload 	= this._resizeImage.bind(this, img);
	// 		this.sprites.push(img);
	// 	}.bind(this), 20);
	// 	this.actualFrame += 1;

	// 	// img.onload 	= this._resizeImages.bind(this);
	// 	// this.sprites.push(img);
	// },

	// _resizeImage : function(imgOrg){
	// 	console.log('_resizeImage')
	// 	var oImg = this.outline.draw(imgOrg);
	// 	var imgs = [imgOrg, oImg];

	// 	console.log(imgs)
	// 	for(var i=0;i<imgs.length;i++){
	// 		var s = imgs[i];
	// 		// -- canvas draw
	// 		this.canvas.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
	// 		this.canvas.save();
	// 		this.canvas.drawImage(s, 0, 0, s.width, s.height, 0, 0, CONFIG.finalSize.width, CONFIG.finalSize.height);
	// 		this.canvas.restore();
	// 		// -- image create
	// 		var img = new Image();
	// 		img.src = this.dom.canvas.toDataURL();
	// 		if (i == 1) {
	// 			this.outlineImages.push(img);
	// 		} else {
	// 			this.normalImages.push(img);
	// 		}
	// 	}
	// 	// -- 
	// 	this._getCanvasFrame();
	// },



	_getCanvasFrame : function(){
		if (this.actualFrame >= this.maxFrames) {
			this._generateDone();
			return;
		}

		GAME.signals.makeEvent('loadinger.progress', window, { progress : (this.actualFrame / this.maxFrames) });

		// -- set animation frame
		if (!!this.view3D.mixer) {
			this.view3D.animChange({ data : { time : (this.actualFrame) * (1/this.fps) }});
		}

		var canvas 	= this.view3D.renderer.domElement;
		var img1 		= new Image();
		img1.src 		= canvas.toDataURL();

		setTimeout(function(){
			var canvas 	= this.view3D.renderer.domElement;
			var img 		= new Image();
			img.src 		= canvas.toDataURL();
			img.onload 	= this._resizeImage.bind(this, img);
			this.sprites.push(img);
		}.bind(this), 20);
		this.actualFrame += 1;
	},

	_resizeImage : function(img){
		var s1 = this.outline.draw(img);
		var s = img;

		// -- canvas draw
		this.canvas.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		this.canvas.save();
		this.canvas.drawImage(s, 0, 0, s.width, s.height, 0, 0, CONFIG.finalSize.width, CONFIG.finalSize.height);
		this.canvas.restore();
		// -- image create
		var nImg = new Image();
		nImg.src = this.dom.canvas.toDataURL();
		this.normalImages.push(nImg);

		// var img = this.outline.draw(img)
		// this.outlineImages.push(img);

		// -- canvas draw
		this.canvas.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		this.canvas.save();
		this.canvas.drawImage(s1, 0, 0, s1.width, s1.height, 0, 0, CONFIG.finalSize.width, CONFIG.finalSize.height);
		this.canvas.restore();
		// -- outline images
		var oImg = new Image();
		oImg.src = this.dom.canvas.toDataURL();
		this.outlineImages.push(oImg);

		// -- 
		this._getCanvasFrame();
	},

	_generateDone : function(){
		var renderer = this.view3D.renderer;
		renderer.setSize(this.view3D.elmSize.width, this.view3D.elmSize.height);
		this.view3D._tick(0);

		GAME.signals.makeEvent('generate.anim.done', window, { outline : this.outlineImages, normal : this.normalImages });
		GAME.signals.makeEvent('loadinger.hide', window, null);
	},

	fpsChange : function(e){
		this.fps = e.data.fps || CONFIG.defaultFps;
		CONFIG.fps = this.fps;
	},

	sizeChange : function(e){
		this.dom.canvas.width = CONFIG.finalSize.width;
		this.dom.canvas.height = CONFIG.finalSize.height;
	},

	_link : function(){
		GAME.signals.addListener(this, 'generate.anim', this._generateAnimation.bind(this));
		GAME.signals.addListener(this, 'fps.change', this.fpsChange.bind(this));
		GAME.signals.addListener(this, 'size.change', this.sizeChange.bind(this));
	}
};