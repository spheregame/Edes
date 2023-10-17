// T_animationEditor.js
// ----------------------------------------------------
// Copyright (c) 2015 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------
/*:
 *
 * @plugindesc アニメーションエディタプラグイン ver 0.9
 * @author Trb
 * 
 * @param width
 * @desc 内枠の横幅
 * @default 816
 * 
 * @param height
 * @desc 内枠の縦幅
 * @default 624
 * 
 * @param BackColor
 * @desc 背景の色
 * @default #264499
 * 
 * @param WindowColor
 * @desc その他、データ表示部分等の背景色
 * @default #44aabb
 * 
 * @param S1
 * @desc 補間用計算式1
 * デフォルト値は直線状に補間される式になっています。
 * @default a + (b - a) / l * f
 * 
 * @param S2
 * @desc 補間用計算式2
 * デフォルト値は弧を描いて補間される式になっています。
 * @default a + (b - a) / l * f - Math.sin(f / l * Math.PI) * 200
 * 
 * @param S3
 * @desc 補間用計算式3
 * 自由に設定して下さい。
 * @default 
 * 
 * 
 * @help 
 * 
 * <パラメータの設定>
 * 
 * width
 * height
 * エディタ画面に表示される内枠のサイズを設定できます。
 * 製作中のゲームの画面サイズに合わせて設定すると
 * アニメーションの実際の大きさが分かりやすいです。
 * 
 * BackColor
 * WindowColor
 * ・・・エディタの背景とウインドウの色を変更できます。
 * 
 * S1
 * S2
 * S3
 * ・・・補間ウインドウで補間式を入力する時に使えるショートカットです。
 * 補間式にS1,S2,S3と入力するとそれぞれ対応した式に置き換えられます。
 * 
 * 
 */

(function () {
//パラメータの読み込み
var parameters = PluginManager.parameters('T_animationEditor');
var windowWidth = Number(parameters['width']) || 816,
	windowHeight = Number(parameters['height']) || 624,
	backColor = String(parameters['BackColor']),
	windowColor = String(parameters['WindowColor']);

	SceneManager._screenWidth       = windowWidth + 408;
	SceneManager._screenHeight      = windowHeight + 312;
	SceneManager._boxWidth          = windowWidth + 408;
	SceneManager._boxHeight         = windowHeight + 312;

//各種位置設定
var centerX = SceneManager._screenWidth / 2,//アニメスプライトの表示位置中心
	centerY = SceneManager._screenHeight / 2,
	ctX = SceneManager._screenWidth / 2,//セルトリガーの位置
	ctY = 48,
	menuX = SceneManager._screenWidth - 400,
	menuY = 0,
	menuWidth = 400,
	menuHeight = 40,
	listX = 48,//画像リスト
	listY = SceneManager._screenHeight - 120,
	frameX = 5,//フレーム
	frameY = centerY / 3,
	frameWidth = 60,
	frameHeight = 258,
	hokanWidth = 600,
	hokanHeight = 200,
	hokanX = (SceneManager._screenWidth - hokanWidth) / 2,
	hokanY = (SceneManager._screenHeight - hokanHeight) / 2,
	AdataWidth = 550,
	AdataHeight = 180,
	AdataX = (SceneManager._screenWidth - AdataWidth) / 2,
	AdataY = (SceneManager._screenHeight - AdataHeight) / 2,
	dataX = SceneManager._screenWidth - 195,//データウインドウ
	dataY = frameY,
	dataWidth = 190,
	dataHeight = 386;

var DCflag = 0,
	DCwait = 15,
	emptyCell = [-1,0,0,100,0,0,255,0],
	dataName = ['アニメーションID','セル','パターン','Ｘ座標','Ｙ座標','拡大率','回転角度','左右反転','不透明度','合成方法'];


//使用キーを追加
Input.keyMapper = {
    9: 'tab',       // tab
    13: 'ok',       // enter
    16: 'shift',    // shift
    17: 'control',  // control
    18: 'control',  // alt
    27: 'escape',   // escape
    32: 'ok',       // space
    33: 'pageup',   // pageup
    34: 'pagedown', // pagedown
    37: 'left',     // left arrow
    38: 'up',       // up arrow
    39: 'right',    // right arrow
    40: 'down',     // down arrow
    45: 'escape',   // insert
    81: 'pageup',   // Q
    87: 'pagedown', // W
    88: 'escape',   // X
    90: 'ok',       // Z
    96: 'escape',   // numpad 0
    98: 'down',     // numpad 2
    100: 'left',    // numpad 4
    102: 'right',   // numpad 6
    104: 'up',      // numpad 8
    120: 'debug',   // F9
	48 : '0',
	49 : '1',
	50 : '2',
	51 : '3',
	52 : '4',
	53 : '5',
	54 : '6',
	55 : '7',
	56 : '8',
	57 : '9',
	189: '-',
	8 : 'backspace'
};
//ゲーム開始時アニメエディットに飛ぶ
Scene_Boot.prototype.start = function() {
	//ウインドウのリサイズ(yanfly様のプラグインを参考にしました)
    var resizeWidth = Graphics.boxWidth - window.innerWidth;
    var resizeHeight = Graphics.boxHeight - window.innerHeight;
    window.moveBy(-1 * resizeWidth / 2, -1 * resizeHeight / 2);
    window.resizeBy(resizeWidth, resizeHeight);
	
    Scene_Base.prototype.start.call(this);
    SoundManager.preloadImportantSounds();
    if (DataManager.isBattleTest()) {
        DataManager.setupBattleTest();
        SceneManager.goto(Scene_Battle);
    } else if (DataManager.isEventTest()) {
        DataManager.setupEventTest();
        SceneManager.goto(Scene_Map);
    } else {
        DataManager.setupNewGame();
        SceneManager.goto(Scene_AnimeEdit);
    }
};


function Scene_AnimeEdit() {
    this.initialize.apply(this, arguments);
}

Scene_AnimeEdit.prototype = Object.create(Scene_Base.prototype);
Scene_AnimeEdit.prototype.constructor = Scene_AnimeEdit;

Scene_AnimeEdit.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
	this.index = 0;//アニメーションのID
	this.requestIndex = 1;
	this.layer = 0;
	this.frame = 1;//現在の表示フレーム
	this.frameTopIndex = 0;
	this.requestFrame = 0;
	this.playCount = -1;
	this.playLoop = true;
	this.animationRate = 4;
	this.lockFlag = [];
	this.x2 = 0;
	this.y2 = 0;
	this.spriteIndex = 0;//画面下の画像リスト
	this.spriteTopIndex = 0;
	this.lastCell = 0;
	this.data = $dataAnimations[this.index];
	this.requestDrawData = true;
};

Scene_AnimeEdit.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createAllSprites();
};

//各画像の用意
Scene_AnimeEdit.prototype.createAllSprites = function() {
	//背景
	this.skin = new Sprite();
    this.skin.bitmap = new Bitmap(Graphics.width,Graphics.height);
	this.skin.bitmap.fillAll(backColor);
	var width = windowWidth;
	var height = windowHeight;
	this.skin.bitmap.drawFrame(centerX - width / 2, centerY - height / 2, width, height,'#00ffff',100,1);
	this.skin.bitmap.drawLine(centerX,centerY - height / 2,centerX,centerY + height / 2,'#00ffff',100);
	this.skin.bitmap.drawLine(centerX - width / 2,centerY,centerX + width / 2,centerY,'#00ffff',100);
    this.addChild(this.skin);
	//セルの選択用トリガー
	this.cellTrigger = [];
	for(var i = 0; i < 16; i ++){
		this.cellTrigger[i] = new CellSprite();
		this.cellTrigger[i].x = ctX + (i - 7.5) * 35;
		this.cellTrigger[i].homeY = ctY;
		this.addChild(this.cellTrigger[i]);
		this.cellTrigger[i].setup(i);
	}
	//アニメスプライト
    this.animeContainer = new Sprite();
	this.animeSprites = [];
	for(var i = 0; i < 16; i ++){
		var r = (255 - i * 5).toString(16).padZero(2);
		var g = (200 + i * 3).toString(16).padZero(2);
		var b = (255 - i * 13).toString(16).padZero(2);
		this.animeSprites[i] = new AE_Sprite();
		this.animeContainer.addChild(this.animeSprites[i]);
		this.animeSprites[i].setup(i);
	}
	this.addChild(this.animeContainer);
	//各種ウインドウ
	this.playTrigger = new AE_Window(132,0,96,36);
	this.addChild(this.playTrigger);
	this.playTrigger.setup();
	this.playTrigger.bitmap.drawText('再生',6,4,82,30,'center');
	this.saveTrigger = new AE_Window(0,0,96,36);
	this.addChild(this.saveTrigger);
	this.saveTrigger.setup();
	this.saveTrigger.bitmap.drawText('保存',6,4,82,30,'center');
	this.menuWindow = new AE_Window(menuX,menuY,menuWidth,menuHeight);
	this.addChild(this.menuWindow);
	this.menuWindow.setup();
	this.menuWindow.setBox(4,1);
	this.drawMenu();
	this.frameWindow = new AE_Window(frameX,frameY,frameWidth,frameHeight);
	this.addChild(this.frameWindow);
	this.frameWindow.setup('フレーム',true);
	this.frameWindow.cursorSprite.visible = true;
	//this.frameWindow.cursorResize(this.frameWindow.width - 8,24);
	this.frameWindow.setBox(1,10);
	this.spriteWindow = new AE_Window(listX,listY,960/2, 192/2);
	this.spriteWindow.bitmap.fillAll('#000000');
	this.addChild(this.spriteWindow);
	this.spriteWindow.setup('スプライト',true);
	this.spriteWindow.drawSprite.scale.x = 0.5;
	this.spriteWindow.drawSprite.scale.y = 0.5;
	this.spriteWindow.cursorSprite.visible = true;
	this.spriteWindow.setBox(5,1);
	this.parameterWindow = new AE_Window(dataX,dataY,dataWidth,dataHeight);
	this.addChild(this.parameterWindow);
	this.parameterWindow.setup('パラメータ');
	this.parameterWindow.setBox(1,10);
	this.blind = new Sprite();
	this.blind.bitmap = new Bitmap(Graphics.width,Graphics.height);
	this.blind.bitmap.fillAll('#000000');
	this.blind.opacity = 100;
	this.addChild(this.blind);
	this.hokanWindow = new AE_Window(hokanX,hokanY,hokanWidth,hokanHeight);
	this.addChild(this.hokanWindow);
	this.hokanWindow.setup('補間');
	this.hokanWindow.setBox(4,5);
	this.hokanWindow.visible = false;
	this.ikkatsuWindow = new AE_Window(hokanX,hokanY,hokanWidth,hokanHeight);
	this.addChild(this.ikkatsuWindow);
	this.ikkatsuWindow.setup('一括設定');
	this.ikkatsuWindow.setBox(4,5);
	this.ikkatsuWindow.visible = false;
	this.dataWindow = new AE_Window(AdataX,AdataY,AdataWidth,AdataHeight);
	this.addChild(this.dataWindow);
	this.dataWindow.setup('アニメーションデータ');
	this.dataWindow.setBox(1,4);
	this.dataWindow.visible = false;
	this.rightMenu = new AE_RightMenu();
	this.addChild(this.rightMenu);
	this.rightMenu.setup();
};

Scene_AnimeEdit.prototype.drawMenu = function() {
	var width = menuWidth / 4;
	this.menuWindow.drawTextInBox('アニメーションデータ',0,'center');
	this.menuWindow.drawTextInBox('補間',1,'center');
	this.menuWindow.drawTextInBox('一括設定',2,'center');
	this.menuWindow.drawTextInBox('ＳＥ',3,'center');
};



Scene_AnimeEdit.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    SceneManager.clearStack();
	this.loadBitmap();
	this.drawFrameIndex();
    this.startFadeIn(this.fadeSpeed(), false);
};

Scene_AnimeEdit.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
	if(this.index != this.requestIndex){
		this.loadBitmap();
	}
	this.updateBlind();
	this.updatePlay();
	this.updateMenuWindow();
	if(this.blindVisible()){
		this.updateMainData();
		this.updateHokanWindow();
		this.updateIkkatsuWindow();
	}else{
		this.updateFrame();
		this.updateDrag();
		this.updateCellFlash();
		this.updateCellTrigger();
		this.updateSpriteWindow();
		this.updateParameter();
		this.setPattern();
		this.updateRightMenu();
		this.save();
	}
	this.allClamp();
	if(this.requestDrawData){
		this.drawFrameIndex();
		this.drawData();
	}
	this.updateDCflag();
};

Scene_AnimeEdit.prototype.loadBitmap = function() {
	this.index = this.requestIndex;
	this.requestDrawData = true;
	this.data = $dataAnimations[this.index];
	var name1 = this.data.animation1Name;
	var name2 = this.data.animation2Name;
	var hue1 = this.data.animation1Hue;
	var hue2 = this.data.animation2Hue;
	this.bitmap1 = ImageManager.loadAnimation(name1, hue1);
	this.bitmap2 = ImageManager.loadAnimation(name2, hue2);
};

Scene_AnimeEdit.prototype.updateBlind = function() {
	if(this.blindVisible()){
		this.blind.visible = true;
	}else{
		this.blind.visible = false;
	}
};

Scene_AnimeEdit.prototype.blindVisible = function() {
	return (this.dataWindow.visible || this.hokanWindow.visible || this.ikkatsuWindow.visible);
};

Scene_AnimeEdit.prototype.updatePlay = function() {
	if(this.playCount >= 0){
		this.requestFrame = Math.floor(this.playCount / this.animationRate);
		this.playCount = this.playCount + 1;
		if(this.requestFrame >= this.data.frames.length){
			this.requestFrame = 0;
			this.playCount = this.playLoop ? 0 : -1;
		}
		this.requestDrawData = true;
		if(TouchInput.isTriggered()){
			this.playCount = -1;
			SoundManager.playOk();
		}
		this.updateTimingData();
	}else if(this.playTrigger.isTriggered()){
		SoundManager.playOk();
		this.playCount = this.playCount = 0;
		this.requestFrame = 0;
		this.parameterWindow.index = -1;
	}
};

Scene_AnimeEdit.prototype.updateTimingData = function() {
    this.data.timings.forEach(function(timing) {
		//現在はSEのみ再生するようにしてます
        if (timing.frame === this.frame && this.playCount % this.animationRate == 0) {
			if (!this._duplicated && timing.se) {
				AudioManager.playSe(timing.se);
			}
        }
    }, this);
};


Scene_AnimeEdit.prototype.updateMainData = function() {
	var w = this.dataWindow;
	if(w.isTriggered()){
		var index = w.touchIndex();
		switch(index){
			case 0:
				var name = 'アニメーション1';
				var value = this.data.animation1Name;
				var a = prompt(name,value);
				break;
			case 1:
				name = 'アニメーション2';
				value = this.data.animation2Name;
				a = prompt(name,value);
				break;
			case 3:
				if(w.inX() < w.width / 3 * 2){
					SoundManager.playOk();
					this.data.animation1Name = w.params[0];
					this.data.animation1Hue = w.params[1];
					this.data.animation2Name = w.params[2];
					this.data.animation2Hue = w.params[3];
					this.setFrameLength(w.params[4]);
					this.loadBitmap();
				}else{
					SoundManager.playCancel();
				}
				w.visible = false;
				return;
		}
		if(!a)return;
		switch(index){
			case 0:
				w.params[0] = a;
				break;
			case 1:
				w.params[2] = a;
				break;
		}
		this.drawMainData();
	}
	if(w.isWheeled()){
		index = Math.floor(w.inY() / (w.height / w.rows));
		switch(index){
			case 0:
				w.params[1] += TouchInput.wheelY < 0 ? 1 : -1;
				w.params[1] = w.params[1].clamp(0,255);
				break;
			case 1:
				w.params[3] += TouchInput.wheelY < 0 ? 1 : -1;
				w.params[3] = w.params[3].clamp(0,255);
				break;
			case 2:
				w.params[4] += TouchInput.wheelY < 0 ? 1 : -1;
				w.params[4] = w.params[4].clamp(1,200);
				break;
		}
		this.drawMainData();
	}
};

Scene_AnimeEdit.prototype.setFrameLength = function(f) {
	if(this.data.frames.length < f){
		for(var i = this.data.frames.length; i < f; i ++){
			this.data.frames[i] = [];
			for(var j = 0; j < 16; j++){
				this.data.frames[i][j] = [-1,0,0,100,0,0,255,0];
			}
		}
	}else{
		this.data.frames.length = f;
	}
};

Scene_AnimeEdit.prototype.updateHokanWindow = function() {
	var w = this.hokanWindow;
	if(w.isTriggered()){
		var index = w.touchIndex();
	}
	var params = w.params;
	if(index >= 4 && index <= 11){
		SoundManager.playCursor();
		params[index - 2] = !params[index - 2];
		this.drawHokan();
	}else if(index >= 12 && index <= 14){
		a = String(prompt('補間式',params[10]));
		a = a.replace(/S1/gi,parameters['S1']);//s1,s2,s3を式に置き換える
		a = a.replace(/S2/gi,parameters['S2']);
		a = a.replace(/S3/gi,parameters['S3']);
		focus();
		if(a == 'null')return;
		params[10] = a;
		this.drawHokan();
	}else if(index == 18){
		this.evalHokan();
		SoundManager.playOk();
		w.visible = false;
	}else if(index == 19){
		SoundManager.playCancel();
		w.visible = false;
	}
	if(w.isWheeled()){
		var x = w.inX();
		var y = w.inY();
		if(x > 148 && x < 185 && y < 35){
			params[0] = TouchInput.wheelY < 0 ? params[0] + 1 : params[0] - 1;
			params[0] = params[0].clamp(1,this.data.frames.length);
			params[1] = params[1].clamp(params[0],this.data.frames.length);
			this.drawHokan();
		}else if(x > 208 && x < 245 && y < 35){
			params[1] = TouchInput.wheelY < 0 ? params[1] + 1 : params[1] - 1;
			params[1] = params[1].clamp(params[0],this.data.frames.length);
			this.drawHokan();
		}
	}
};

Scene_AnimeEdit.prototype.evalHokan = function() {
	var params = this.hokanWindow.params;
	var sf = params[0] - 1;//開始フレーム
	var ef = params[1] - 1;//終了フレーム
	var l = ef - sf;//開始から終了までの総フレーム数
	for(var i = 0; i < 16; i ++){//セル番号
		var sc = this.data.frames[sf][i] || [-1,0,0,100,0,0,255,0];//開始フレームのセル
		var ec = this.data.frames[ef][i] || [-1,0,0,100,0,0,255,0];//終了フレームのセル
		if(this.lockFlag[i])continue;//ロックされてるセルは飛ばす
		for(var f = 0; f <= l; f ++){//フレーム
			var data = this.data.frames[f + sf][i] || [-1,0,0,100,0,0,255,0];
			for(var j = 0; j < 8; j ++){//データ
				if(params[j + 2]){
					var a = sc[j];
					var b = ec[j];
					try{
						data[j] = eval(params[10]);
					}catch(e){
						data[j] = 0;
					}
				}
			}
			data = this.dataClamp(data);
		}
	}
};

Scene_AnimeEdit.prototype.updateIkkatsuWindow = function() {
	var w = this.ikkatsuWindow;
		var index = w.touchIndex();
	var params = w.params;
	var params2 = w.params2;
	if(w.isTriggered()){
		if(index >= 4 && index <= 11){
			SoundManager.playCursor();
			params2[index - 2] = !params2[index - 2];
			this.drawIkkatsu();
		}else if(index == 18){
			this.evalIkkatsu();
			SoundManager.playOk();
			w.visible = false;
		}else if(index == 19){
			SoundManager.playCancel();
			w.visible = false;
		}else if(index >= 12 && index <= 13){
			SoundManager.playCursor();
			params[10] = params[10] == 0 ? 1 : 0;
			this.drawIkkatsu();
		}
	}
	if(w.isWheeled()){
		var x = w.inX();
		var y = w.inY();
		var value = TouchInput.wheelY < 0 ? 1 : -1;
		if(x > 148 && x < 185 && y < 35){
			params[0] += value;
			params[0] = params[0].clamp(1,this.data.frames.length);
			params[1] = params[1].clamp(params[0],this.data.frames.length);
			this.drawIkkatsu();
		}else if(x > 208 && x < 245 && y < 35){
			params[1] += value;
			params[1] = params[1].clamp(params[0],this.data.frames.length);
			this.drawIkkatsu();
		}else if(index >= 4 && index <= 11 && params2[index - 2]){
			params[index - 2] += value;
		}
		this.drawIkkatsu();
	}
};

Scene_AnimeEdit.prototype.evalIkkatsu = function() {
	var params = this.ikkatsuWindow.params;
	var params2 = this.ikkatsuWindow.params2;
	var sf = params[0] - 1;//開始フレーム
	var ef = params[1] - 1;//終了フレーム
	for(var i = 0; i < 16; i ++){//セル番号
		if(this.lockFlag[i])continue;//ロックされてるセルは飛ばす
		for(var f = sf; f <= ef; f ++){//フレーム
			var data = this.data.frames[f][i] || [-1,0,0,100,0,0,255,0];
			for(var j = 0; j < 8; j ++){//データ
				if(params2[j + 2]){
					if(params[10] == 0){
						data[j] = params[j + 2];
					}else if(params[10] == 1){
						data[j] += params[j + 2];
					}
				}
			}
			data = this.dataClamp(data);
		}
	}
};


Scene_AnimeEdit.prototype.updateFrame = function() {
	if(this.rightMenu.isInWindow())return;
	if(this.frameWindow.isWheeled()){
		this.parameterWindow.index = -1;
		this.requestDrawData = true;
		this.requestFrame += TouchInput.wheelY > 0 ? 1 : -1;
	}
	if(this.frameWindow.isTriggered() || this.frameWindow.isCancelled()){
		var touchIndex = this.frameWindow.touchIndex();
		this.requestDrawData = true;
		this.requestFrame = this.frameTopIndex + touchIndex;
	}
	this.requestFrame = this.requestFrame.clamp(0,this.data.frames.length - 1);
	//if(this.frame != this.requestFrame){//フレームが変化した時
		this.frame = this.requestFrame;
		//this.data = $dataAnimations[this.index];
		var data = this.data;
		for(var i = 0; i < 16/*data.frames[this.frame].length*/; i ++){
			var sprite = this.animeSprites[i];
			var cell = data.frames[this.frame][i];
			if(!cell){
				data.frames[this.frame][i] = [-1,0,0,100,0,0,255,0];
				cell = data.frames[this.frame][i];
			}
			var pattern = cell[0];
			if(pattern >= 0){
				var sx = pattern % 5 * 192;
				var sy = Math.floor(pattern % 100 / 5) * 192;
				sprite.animeSprite.bitmap = pattern < 100 ? this.bitmap1 : this.bitmap2;
				sprite.animeSprite.setFrame(sx, sy, 192, 192);
				sprite.x = cell[1] + centerX;
				sprite.y = cell[2] + centerY;
				sprite.rotation = cell[4] * Math.PI / 180;
				sprite.animeSprite.scale.x = (cell[3] / 100);
				//sprite.frameSprite.scale.x = (cell[3] / 100);
				if (cell[5]) {
					sprite.animeSprite.scale.x *= -1;
					sprite.rotation *= -1;
				}
				sprite.animeSprite.scale.y = (cell[3] / 100);
				//sprite.frameSprite.scale.y = (cell[3] / 100);
				sprite.animeSprite.opacity = cell[6];
				sprite.animeSprite.blendMode = cell[7];
				sprite.visible = true;
				sprite.NoSprite.x = - Math.abs(192 / 2 * sprite.animeSprite.scale.x);
				sprite.NoSprite.y = sprite.NoSprite.x;
			}else {
				sprite.visible = false;
			}
		}
	//}
};

Scene_AnimeEdit.prototype.updateTopIndex = function() {
	if(this.frameTopIndex < this.frame - 9){
		this.frameTopIndex = this.frame - 9;
	}
	if(this.frameTopIndex > this.frame){
		this.frameTopIndex = this.frame;
	}
};

Scene_AnimeEdit.prototype.updateMenuWindow = function() {
	if(this.menuWindow.isTriggered()){
		var index = this.menuWindow.touchIndex();
		switch(index){
			case 0:
				SoundManager.playCursor();
				this.dataWindow.visible = !this.dataWindow.visible;
				this.ikkatsuWindow.visible = false;
				this.hokanWindow.visible = false;
				this.setMainData();
				this.drawMainData();
				break;
			case 1:
				SoundManager.playCursor();
				this.hokanWindow.visible = !this.hokanWindow.visible;
				this.ikkatsuWindow.visible = false;
				this.dataWindow.visible = false;
				this.setHokanParams();
				this.drawHokan();
				break;
			case 2:
				SoundManager.playCursor();
				this.ikkatsuWindow.visible = !this.ikkatsuWindow.visible;
				this.hokanWindow.visible = false;
				this.dataWindow.visible = false;
				this.setIkkatsuParams();
				this.drawIkkatsu();
				break;
			case 3:
				//SoundManager.playCursor();
				//SEとフラッシュ設定の処理を入れる予定
				break;
		}
	}
};

Scene_AnimeEdit.prototype.updateDrag = function() {
	if(!this.dragSprite){//何も掴んでいない時、掴み判定
		if(this.spriteWindow.isHold()){
			this.dragSprite = this.spriteWindow;
			this.x2 = TouchInput.x;
			this.y2 = TouchInput.y;
		}else if(this.parameterWindow.isHold()){
			this.dragSprite = this.parameterWindow;
			this.x2 = TouchInput.x;
			this.y2 = TouchInput.y;
		}else if(this.frameWindow.isHold()){
			this.dragSprite = this.frameWindow;
			this.x2 = TouchInput.x;
			this.y2 = TouchInput.y;
		}else {
			var lange = 999999;
			var index = null;
			if(this.isOverWindow()){
				return;
			}
			for(var i = 0;i < 16; i ++){
				if(this.animeSprites[i].isTriggered() && !this.lockFlag[i]){
					if(this.animeSprites[i].lange() < lange){
						lange = this.animeSprites[i].lange();
						index = i + 1;//0が入ると不都合があるため1加算している
					};
				}
			}
			if(index){
				this.dragSprite = index;
				this.x2 = TouchInput.x;
				this.y2 = TouchInput.y;
			}
		}
	}
	if(this.dragSprite && TouchInput.isPressed()){
		this.moveWindow();
	}else{
		this.dragSprite = null;
	}
};

//他のウインドウと重なっている判定
Scene_AnimeEdit.prototype.isOverWindow = function() {
	return (this.parameterWindow.isInWindow() || this.menuWindow.isInWindow() || 
				this.spriteWindow.isInWindow() || this.hokanWindow.isInWindow() || 
					this.frameWindow.isInWindow() || this.dataWindow.isInWindow());
};

Scene_AnimeEdit.prototype.moveWindow = function() {
	if(typeof this.dragSprite == 'number'){
		var cell = this.data.frames[this.frame][this.dragSprite - 1];
		cell[1] += (TouchInput.x - this.x2);
		cell[2] += (TouchInput.y - this.y2);
		this.lastCell = this.dragSprite - 1;
		this.requestDrawData = true;
	}else{
		this.dragSprite.x += TouchInput.x - this.x2;
		this.dragSprite.y += TouchInput.y - this.y2;
		this.dragSprite.reap();
	}
	this.x2 = TouchInput.x;
	this.y2 = TouchInput.y; 
};

Scene_AnimeEdit.prototype.updateCellFlash = function() {
	if(TouchInput.isPressed())return;
	var lange = 999999;
	this.flashCell = null;
	for(var i = 0;i < 16; i ++){
		this.animeSprites[i].requestFlash = false;
		if(this.animeSprites[i].inFrame() && !this.lockFlag[i]){
			if(this.animeSprites[i].lange() < lange){
				lange = this.animeSprites[i].lange();
				this.flashCell = i + 1;//0が入ると不都合があるため1加算している
			};
		}
	}
	if(this.flashCell){
		this.animeSprites[this.flashCell - 1].requestFlash = true;
		this.requestDrawData = true;
	}
};

//パラメータ入力
Scene_AnimeEdit.prototype.updateParameter = function() {
	this.dataToParams();
	var w = this.parameterWindow;
	w.moveCursor(w.index);
	if(w.isTriggered()){
		w.index = this.parameterWindow.touchIndex();
	}
	if(w.numberInput() || w.wheelInput()){
		this.paramsToData();
		this.requestDrawData = true;
	}
};

Scene_AnimeEdit.prototype.dataToParams = function() {
	var p = this.parameterWindow.params;
	p[0] = this.index;
	p[1] = this.lastCell + 1;
	for(var i = 0; i < 8; i ++){
		if(p[i + 2] != '-'){
			p[i + 2] = this.data.frames[this.frame][this.lastCell][i];
		}
	}
};


Scene_AnimeEdit.prototype.paramsToData = function() {
	var p = this.parameterWindow.params;
	for(var i = 0; i < 8; i ++){
		if(p[i + 2] != '-'){
			this.data.frames[this.frame][this.lastCell][i] = p[i + 2];
		}
	}
	this.requestIndex = p[0];
	this.lastCell = p[1] - 1;
};

/*
Scene_AnimeEdit.prototype.updateParameter_wheel = function() {
	if(this.parameterWindow.isWheeled()){
		var param = Math.floor(this.parameterWindow.inY() / 38);
		switch(param){
			case 0:
				var value = this.index;
				break;
			case 1:
				value = this.lastCell + 1;
				break;
			default:
				var data = $dataAnimations[this.index].frames[this.frame][this.lastCell];
				if(!data) return;
				value = data[param - 2];
				break;
		}
		var a = Math.ceil(TouchInput.wheelY / 100);
		if(!a)return;
		switch(param){
			case 0:
				this.requestIndex += a;
				break;
			case 1:
				this.lastCell += a;
				break;
			default:
				data[param - 2] += a;
				break;
		}
		this.requestDrawData = true;
	}
};*/


Scene_AnimeEdit.prototype.updateCellTrigger = function() {
	for(var i = 0; i < 16; i ++){
		if(this.cellTrigger[i].isTriggered()){
			SoundManager.playCursor();
			this.lockFlag[i] = !this.lockFlag[i];
			//this.lastCell = i;
			//this.requestDrawData = true;
		}
		this.cellTrigger[i].updatePosition(this.lockFlag[i]);
	}
};

Scene_AnimeEdit.prototype.updateSpriteWindow = function() {
	var maxIndex1 = Math.floor(this.bitmap1.height/ 192);
	var maxIndex2 = Math.floor(this.bitmap2.height/ 192);
	if(this.spriteWindow.isWheeled()){
		this.parameterWindow.index = -1;
		this.spriteTopIndex += TouchInput.wheelY > 0 ? 1 : -1;
	}
	this.spriteTopIndex = this.spriteTopIndex.clamp(0,maxIndex1 + maxIndex2 - 1);
	if(this.spriteWindow.isTriggered()){
		this.spriteIndex = Math.floor(this.spriteWindow.inX() * 5 / this.spriteWindow.width);
	}
	if(this.spriteTopIndex < maxIndex1){
		this.spriteWindow.drawSprite.bitmap = this.bitmap1;
		this.spriteWindow.drawSprite.setFrame(0,this.spriteTopIndex * 192,960,192);
	}else{
		this.spriteWindow.drawSprite.bitmap = this.bitmap2;
		this.spriteWindow.drawSprite.setFrame(0,(this.spriteTopIndex - maxIndex1) * 192,960,192);
	}
	this.spriteWindow.cursorSprite.x = this.spriteIndex * 96;
	this.spriteWindow.upArrow.visible = 
			this.spriteTopIndex > 0;
	this.spriteWindow.downArrow.visible = 
			maxIndex1 + maxIndex2 - 1 > this.spriteTopIndex;
};

Scene_AnimeEdit.prototype.updateRightMenu = function() {
	if(TouchInput.isCancelled()){
		if(this.flashCell){
			this.rightMenu.open('cell',this.flashCell);
		}else if(this.frameWindow.isInWindow()){
			this.rightMenu.open('frame',this.frame);
		}else{
			this.rightMenu.visible = false;
		}
	}else if(this.rightMenu.isTriggered()){
		if(this.rightMenu.mode == 'cell')this.updateRightMenu_C();
		if(this.rightMenu.mode == 'frame')this.updateRightMenu_F();
	}else if(TouchInput.isTriggered()){
		this.rightMenu.visible = false;
	}
};

Scene_AnimeEdit.prototype.updateRightMenu_C = function() {
	var index = this.rightMenu.touchIndex();
	switch(index){
		case 1:
			this.cellReplace(this.rightMenu.index - 1,this.rightMenu.index);
			SoundManager.playOk();
			this.rightMenu.visible = false;
			break;
		case 2:
			this.cellReplace(this.rightMenu.index - 1,this.rightMenu.index - 2);
			SoundManager.playOk();
			this.rightMenu.visible = false;
			break;
		case 3:
			this.data.frames[this.frame][this.rightMenu.index - 1] = [-1,0,0,100,0,0,255,0];
			SoundManager.playOk();
			this.rightMenu.visible = false;
			break;
	}
};

Scene_AnimeEdit.prototype.updateRightMenu_F = function() {
	var index = this.rightMenu.touchIndex();
	switch(index){
		case 1:
			this.copyFrame = JsonEx.makeDeepCopy(this.data.frames[this.frame]);
			SoundManager.playOk();
			this.rightMenu.visible = false;
			break;
		case 2:
			if(this.copyFrame){
				this.data.frames[this.frame] = JsonEx.makeDeepCopy(this.copyFrame);
				SoundManager.playOk();
			}
			this.rightMenu.visible = false;
			break;
		case 3:
			this.data.frames[this.frame] = [];
			SoundManager.playOk();
			this.rightMenu.visible = false;
			break;
	}

};

//セルaとセルbの入れ替え
Scene_AnimeEdit.prototype.cellReplace = function(a,b) {
	if(a >= 0 && a < 16 && b >= 0 && b < 16){
		var cellA = this.data.frames[this.frame][a];
		var cellB = this.data.frames[this.frame][b];
		for(var i = 0; i < cellA.length; i ++){
			var n = cellA[i];
			cellA[i] = cellB[i];
			cellB[i] = n;
		}
	}
};

Scene_AnimeEdit.prototype.setPattern = function() {
	if(TouchInput.isDoubleClick() && !this.isOverWindow()){
		var maxIndex1 = Math.floor(this.bitmap1.height/ 192);
		var maxIndex2 = Math.floor(this.bitmap2.height/ 192);
		if(this.spriteTopIndex < maxIndex1){
			var pattern = this.spriteTopIndex * 5 + this.spriteIndex;
		}else{
			pattern = (this.spriteTopIndex - maxIndex1) * 5 + this.spriteIndex + 100;
		}
		for(var i = 0;i < 16; i ++){
			var cell = this.data.frames[this.frame][i];
			if(cell[0] == -1){
				cell[0] = pattern;
				cell[1] = (TouchInput.x - centerX);
				cell[2] = (TouchInput.y - centerY);
				cell[3] = 100;
				cell[4] = 0;
				cell[5] = 0;
				cell[6] = 255;
				cell[7] = 0;
				this.lastCell = i;
				this.requestDrawData = true;
				return; 
			}
		}
	}
};

Scene_AnimeEdit.prototype.allClamp = function() {
	this.requestIndex = this.requestIndex.clamp(1,$dataAnimations.length - 1);
	//var cellLength = Math.max($dataAnimations[this.index].frames[this.frame].length - 1,0);
	this.lastCell = this.lastCell.clamp(0,15);
	var data = $dataAnimations[this.index].frames[this.frame][this.lastCell];
	if(data){
		data = this.dataClamp(data);
	}
};

Scene_AnimeEdit.prototype.dataClamp = function(data) {
	data[0] = Math.round(data[0].clamp(-1,300));
	data[1] = Math.round(data[1]);
	data[2] = Math.round(data[2]);
	data[3] = Math.round(data[3]);
	data[4] = Math.round(data[4] % 360);
	data[5] = Math.round(data[5].clamp(0,1));
	data[6] = Math.round(data[6].clamp(0,255));
	data[7] = Math.round(data[7].clamp(0,3));
	return data;
};

//補間、一括ウインドウのデータ
Scene_AnimeEdit.prototype.drawHokan = function() {
	this.hokanWindow.clear();
	this.hokanWindow.drawHokan();
};

Scene_AnimeEdit.prototype.drawIkkatsu = function() {
	this.ikkatsuWindow.clear();
	this.ikkatsuWindow.drawIkkatsu();
};


//アニメーションの画像名、総フレーム数のデータ
Scene_AnimeEdit.prototype.drawMainData = function() {
	var w = this.dataWindow;
	w.clear();
	w.drawTextInBox('アニメーション1  ' + w.params[0],0,'left');
	w.drawTextInBox(w.params[1],0,'right');
	w.drawTextInBox('アニメーション2  ' + w.params[2],1,'left');
	w.drawTextInBox(w.params[3],1,'right');
	w.drawTextInBox('フレーム数',2,'left');
	w.drawTextInBox(w.params[4],2,'right');
	w.drawTextInBox('ＯＫ　　キャンセル',3,'right');
};


//セルデータ
Scene_AnimeEdit.prototype.drawData = function() {
	this.requestDrawData = false;
	var w = this.parameterWindow;
	var data = $dataAnimations[this.index].frames[this.frame][this.lastCell];
	var height = 38;
	w.clear();
	w.drawData(this.index + ' ' + $dataAnimations[this.index].name, undefined,height * 0);
	w.drawData(dataName[1], this.lastCell + 1,height * 1,true);
	for(var i = 0; i < 8; i ++){
		if(data[0] == -1){
			var d =  i == 0 ? '未設定' : '---';
		}else d = data[i];
		w.drawData(dataName[i + 2], d,height * (i + 2),true);
	}
};

Scene_AnimeEdit.prototype.drawFrameIndex = function() {
	this.updateTopIndex();
	var length = Math.min(this.data.frames.length, 10);
	this.frameWindow.clear();
	for(var i = 0; i < length; i ++){
		var index = i + 1 + this.frameTopIndex;
		this.frameWindow.drawTextInBox(index, i,'right');
	}
	this.frameWindow.moveCursor(this.frame - this.frameTopIndex);
	this.frameWindow.upArrow.visible = 
			this.frameTopIndex > 0;
	this.frameWindow.downArrow.visible = 
			this.data.frames.length - this.frameTopIndex > 10;
};

Scene_AnimeEdit.prototype.setMainData = function() {
	var params = this.dataWindow.params;
	params[0] = this.data.animation1Name;
	params[1] = this.data.animation1Hue;
	params[2] = this.data.animation2Name;
	params[3] = this.data.animation2Hue;
	params[4] = this.data.frames.length;
};


Scene_AnimeEdit.prototype.setHokanParams = function() {
	var params = this.hokanWindow.params;
	params[0] = params[0] || 1;
	params[1] = params[1] || this.data.frames.length;
	for(var i = 2; i < 10; i ++){
		params[i] = params[i] || false;
	}
	params[10] = params[10] || 'a + (b - a) / l * f';
};

Scene_AnimeEdit.prototype.setIkkatsuParams = function() {
	var params = this.ikkatsuWindow.params;
	var params2 = this.ikkatsuWindow.params2;
	params[0] = params[0] || 1;
	params[1] = params[1] || this.data.frames.length;
	for(var i = 2; i < 10; i ++){
		params[i] = params[i] || 0;
		params2[i] = params2[i] || false;
	}
	params[10] = params[10] || 0;
};


Scene_AnimeEdit.prototype.save = function() {
	if(this.saveTrigger.isTriggered()){
		saveJson($dataAnimations);
		SoundManager.playSave();
	}
};

Scene_AnimeEdit.prototype.updateDCflag = function() {
	if(TouchInput.isTriggered())DCflag += DCwait;
	if(DCflag > 0)DCflag -= 1;
};

//Bitmap---------------------------------------------------------------

var Bitmap_initialize = Bitmap.prototype.initialize;
Bitmap.prototype.initialize = function(width, height) {
	Bitmap_initialize.apply(this,arguments);
    this.fontFace = 'GameFont';
    this.fontSize = 24;
};

//線を引く
Bitmap.prototype.drawLine = function(x, y, x2, y2, color, opacity,lineWidth) {
	this.paintOpacity = opacity;
    var context = this._context;
    context.save();
    context.lineWidth = lineWidth || 1;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x,y);
    context.lineTo(x2,y2);
    context.stroke();
    context.restore();
    this._setDirty();
	this.paintOpacity = 255;
};

//四角を描く
Bitmap.prototype.drawFrame = function(x,y,width,height,color,opacity, lineWidth) {
	var x2 = x + width;
	var y2 = y + height;
	this.paintOpacity = opacity;
    var context = this._context;
    context.save();
    context.lineWidth = lineWidth || 1;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x,y);
    context.lineTo(x2,y);
    context.lineTo(x2,y2);
    context.lineTo(x,y2);
    context.lineTo(x,y);
    context.stroke();
    context.restore();
    this._setDirty();
	this.paintOpacity = 255;
};
//スプライトのクリック判定
Sprite.prototype.isTriggered = function() {
	if(TouchInput.isTriggered()){
		return this.isInWindow();
	}
};
//キャンセル判定
Sprite.prototype.isCancelled = function() {
	if(TouchInput.isCancelled()){
		return this.isInWindow();
	}
};
//ホイール判定
Sprite.prototype.isWheeled = function() {
	if(TouchInput.wheelY){
		return this.isInWindow();
	}

};
//マウスカーソルがウインドウ内に入っているかの判定
//(ウインドウのスプライトにしか使用しないため回転は考慮しない)
Sprite.prototype.isInWindow = function() {
	var tx = TouchInput.x,
	    ty = TouchInput.y,
		sx1 = this.x - (this.width * this.anchor.x) * this.scale.x,
		sy1 = this.y - (this.height * this.anchor.y) * this.scale.y,
		sx2 = sx1 + this.width * this.scale.x,
		sy2 = sy1 + this.height * this.scale.y;
	if(this.visible && tx >= sx1 && tx <= sx2 && ty >= sy1 && ty <= sy2){
		return true;
	}
};


//スプライト内でのタッチ座標X
Sprite.prototype.inX = function() {
	return TouchInput.x - this.x;
};

Sprite.prototype.inY = function() {
	return TouchInput.y - this.y;
};

//クリックした位置からこのスプライトまでの距離
Sprite.prototype.lange = function() {
	return Math.pow(this.x - TouchInput.x,2) + Math.pow(this.y - TouchInput.y,2);
	//厳密には、この値の平方根が距離になりますが、簡略化のため平方根は省いています
};

//----------------------------------------------------------------

function AE_Sprite() {
    this.initialize.apply(this, arguments);
}

AE_Sprite.prototype = Object.create(Sprite.prototype);
AE_Sprite.prototype.constructor = AE_Sprite;

AE_Sprite.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
	this.flashCount = 0;
};

AE_Sprite.prototype.setup = function(index) {
	this.index = index;
	this.animeSprite = new Sprite();
	this.animeSprite.anchor.x = 0.5;
	this.animeSprite.anchor.y = 0.5;
	this.addChild(this.animeSprite);
	this.frameSprite = new Sprite();
	this.frameSprite.bitmap = new Bitmap(192,192);
	this.frameSprite.bitmap.drawFrame(0,0,192,192,'#ffffff',255, 1);
	this.frameSprite.anchor.x = 0.5;
	this.frameSprite.anchor.y = 0.5;
	this.addChild(this.frameSprite);
	this.NoSprite = new Sprite();
	this.NoSprite.bitmap = new Bitmap(20,24);
	this.NoSprite.bitmap.fillAll('#aaaaaa');
	this.NoSprite.bitmap.drawText(index + 1,0,0,20,24,'right');
	this.NoSprite.x = - this.frameSprite.bitmap.width / 2;
	this.NoSprite.y = - this.frameSprite.bitmap.height / 2;
	this.NoSprite.opacity = 180;
	this.addChild(this.NoSprite);
};

AE_Sprite.prototype.update = function() {
    Sprite.prototype.update.call(this);
	if(this.bs != this.animeSprite.scale.y){
		this.bs = this.animeSprite.scale.y;
		this.frameSprite.bitmap.clear();
		if(this.bs < 1 && this.bs > -1){
			var w = 192 / 2 * this.bs;
			this.frameSprite.bitmap.drawFrame(96 - w,96 - w,2 * w,2 * w,'#ffffff',255, 1);
			this.frameSprite.scale.x = 1;
			this.frameSprite.scale.y = 1;
		}else{
			this.frameSprite.bitmap.drawFrame(0,0,192,192,'#ffffff',255, 1);
			this.frameSprite.scale.x = this.bs;
			this.frameSprite.scale.y = this.bs;
		}
	}
	this.frameSprite.opacity =this.requestFlash ? 230 : 130;
};


AE_Sprite.prototype.isTriggered = function() {
	if(TouchInput.isTriggered() && this.visible){
		return this.inFrame();
	}
};

AE_Sprite.prototype.isCancelled = function() {
	if(TouchInput.isCancelled() && this.visible){
		return this.inFrame();
	}
};

//カーソルがスプライト内に入っているかの判定(回転、拡大も考慮したもの)
AE_Sprite.prototype.inFrame = function() {
		var kaku = Math.atan2(TouchInput.x - this.x,TouchInput.y - this.y);
		var kyori = Math.sqrt(Math.pow(TouchInput.x - this.x,2) + Math.pow(TouchInput.y - this.y,2));
		var tx = this.x + kyori * Math.cos(this.rotation + kaku),
		    ty = this.y + kyori * Math.sin(this.rotation + kaku),
			sx1 = this.x - (this.animeSprite.width * this.animeSprite.anchor.x) * this.animeSprite.scale.x,
			sy1 = this.y - (this.animeSprite.height * this.animeSprite.anchor.y) * this.animeSprite.scale.y,
			sx2 = sx1 + this.animeSprite.width * this.animeSprite.scale.x,
			sy2 = sy1 + this.animeSprite.height * this.animeSprite.scale.y;
		if(this.visible && tx >= sx1 && tx <= sx2 && ty >= sy1 && ty <= sy2){
			return true;
		}

};
//--------------------------------------------------------------

function CellSprite() {
    this.initialize.apply(this, arguments);
}

CellSprite.prototype = Object.create(Sprite.prototype);
CellSprite.prototype.constructor = CellSprite;

CellSprite.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
};

CellSprite.prototype.setup = function(index) {
	this.anchor.x = 0.5;
	this.bitmap = new Bitmap(30,40);
	this.bitmap.paintOpacity = 100;
	this.bitmap.fillAll('#000000');
	this.bitmap.paintOpacity = 255;
	this.bitmap.fillRect(1,1,this.bitmap.width - 2,this.bitmap.height - 2,windowColor);
	var text = (index + 1).toString(10).padZero(2);
	this.bitmap.drawText(text, 0, 0, this.bitmap.width, this.bitmap.height, 'center');
};

CellSprite.prototype.updatePosition = function(lock) {
	this.y = lock ? this.homeY + 15 : this.homeY;
	this.scale = lock ? {x:0.8,y:0.8} : {x:1,y:1};
};

//--------------------------------------------------------------

function AE_Window() {
    this.initialize.apply(this, arguments);
}

AE_Window.prototype = Object.create(Sprite.prototype);
AE_Window.prototype.constructor = AE_Window;

AE_Window.prototype.initialize = function(x, y, width, height) {
    Sprite.prototype.initialize.call(this);
	this.x = x;
	this.y = y;
	this,index = -1;
	this.bitmap = new Bitmap(width,height);
	this.bitmap.paintOpacity = 123;
	this.bitmap.fillAll(windowColor);
	this.bitmap.paintOpacity = 255;
	this.bitmap.drawFrame(0,0,width,height,'#ffffff',180,5);
	this.params = [];
	this.params2 = [];
	this.cols = 1;
	this.rows = 1;
};

AE_Window.prototype.setup = function(name,scroll) {
	this.drawSprite = new Sprite();
	this.drawSprite.bitmap = new Bitmap(this.width - 2,this.height - 2);
	this.addChild(this.drawSprite);
	this.bar = new Sprite();
	this.bar.bitmap = new Bitmap(this.width,24);
	this.bar.bitmap.fillAll(windowColor);
	this.bar.bitmap.drawFrame(0,0,this.width,30,'#ffffff',180,3);
	if(name){
		this.bar.bitmap.fontSize = 18;
		this.bar.bitmap.drawText(name,6,0,this.width - 12,28,'left');
	}
	this.bar.y = - 24;
	this.addChild(this.bar);
	this.cursorSprite = new Sprite();
	this.cursorSprite.bitmap = new Bitmap(1,1);//width-8,24
	this.cursorSprite.bitmap.fillAll('#ffffff');
	this.cursorSprite.opacity = 100;
	this.cursorSprite.visible = false;
	this.addChild(this.cursorSprite);
	if(scroll){
		this.upArrow = new Sprite();
		this.upArrow.bitmap = ImageManager.loadSystem('Window');
		this.upArrow.anchor.x = 0.5;
		this.upArrow.anchor.y = 0.5;
		this.upArrow.x = this.width / 2;
		this.upArrow.y = 12;
		this.upArrow.setFrame(132,24,24,12);
		this.addChild(this.upArrow);
		this.downArrow = new Sprite();
		this.downArrow.bitmap = ImageManager.loadSystem('Window');
		this.downArrow.anchor.x = 0.5;
		this.downArrow.anchor.y = 0.5;
		this.downArrow.x = this.width / 2;
		this.downArrow.y = this.height - 12;
		this.downArrow.setFrame(132,60,24,12);
		this.addChild(this.downArrow);
	}
};

AE_Window.prototype.setBox = function(cols,rows) {
	this.cols = cols;
	this.rows = rows;
	this.cursorSprite.scale.x = this.width / cols;
	this.cursorSprite.scale.y = this.height / rows;
};


AE_Window.prototype.cursorResize = function(width,height) {
	this.cursorSprite.scale.x = width;
	this.cursorSprite.scale.y = height;
};

AE_Window.prototype.moveCursor = function(index) {
	this.cursorSprite.visible = index >= 0;
	var x = index % this.cols;
	var y = Math.floor(index / this.cols);
	var width = (this.width) / this.cols;
	var height = (this.height) / this.rows;
	this.cursorSprite.x = x * width;
	this.cursorSprite.y = y * height;
};


AE_Window.prototype.clear = function() {
	this.drawSprite.bitmap.clear();
};

//setBoxで作成した枠に合わせて文字を描画する
AE_Window.prototype.drawTextInBox = function(text,index,align) {
	var x = index % this.cols;
	var y = Math.floor(index / this.cols);
	var width = (this.width - 12) / this.cols;
	var height = (this.height) / this.rows;
	this.drawSprite.bitmap.drawText(text,x * width + 6,y * height,width - 6,height,align);
};

//2マス以上の枠にまたがって文字を描画する
AE_Window.prototype.drawTextInLongBox = function(text,index,length,align) {
	var x = index % this.cols;
	var y = Math.floor(index / this.cols);
	var width = (this.width - 12) / this.cols;
	var height = (this.height - 12) / this.rows;
	this.drawSprite.bitmap.drawText(text,x * width + 6,y * height + 6,width * length - 6,height,align);
};


AE_Window.prototype.drawText = function(text,x,y,maxWidth,height,align) {
	this.drawSprite.bitmap.drawText(text,x + 6,y + 6,maxWidth - 12,height,align);
};

AE_Window.prototype.drawData = function(param,value,height,box) {
	if(box)this.drawSprite.bitmap.fillRect(this.width - 46,height + 6,42,30,'#999999');
	this.drawSprite.bitmap.drawText(param, 6, height + 6,this.width - 12,30,'left');
	this.drawSprite.bitmap.drawText(value, this.width - 46, height + 6,40,30,'right');
};

AE_Window.prototype.drawHokan = function() {
	this.drawTextInBox('フレーム', 0,'left');
	this.drawTextInBox(this.params[0] + ' ～ ' + this.params[1], 1,'left');
	for(var i = 0; i < 8; i ++){
		var width = this.width / 4;
		var x = width * Math.floor(i % 4);
		var y = 38 * (Math.floor(i / 4) + 1);
		var value = this.params[i + 2] ? '○ ' : '－ ';
		//this.drawSprite.bitmap.fillRect( x + width - 36,y + 6,30,30,'#999999');
		//this.drawSprite.bitmap.drawText(dataName[i + 2], x + 6, y + 6,width - 12,30,'left');
		//this.drawSprite.bitmap.drawText(this.params[i + 2], x + 6, y + 6,width - 20,30,'right');
		this.drawTextInBox(dataName[i + 2], i + 4,'left');
		this.drawTextInBox(value, i + 4,'right');
	}
	this.drawTextInBox('補間式', 12,'center');
	this.drawTextInLongBox(this.params[10], 13,3,'left');
	this.drawTextInBox('ＯＫ', 18,'left');
	this.drawTextInBox('キャンセル', 19,'left');
};

AE_Window.prototype.drawIkkatsu = function() {
	this.params[2] = this.params[2].clamp(0,999);
	this.params[7] = this.params[7].clamp(0,1);
	this.params[8] = this.params[8].clamp(0,255);
	this.params[9] = this.params[9].clamp(0,3);	
	this.drawTextInBox('フレーム', 0,'left');
	this.drawTextInBox(this.params[0] + ' ～ ' + this.params[1], 1,'left');
	for(var i = 0; i < 8; i ++){
		var width = this.width / 4;
		var x = width * Math.floor(i % 4);
		var y = 38 * (Math.floor(i / 4) + 1);
		var value = this.params[i + 2];
		this.drawTextInBox(dataName[i + 2], i + 4,'left');
		this.drawSprite.bitmap.paintOpacity = this.params2[i + 2] ? 255 : 125;
		this.drawTextInBox(value, i + 4,'right');
		this.drawSprite.bitmap.paintOpacity = 255;
	}
	this.drawTextInBox('操作方式', 12,'center');
	var text = this.params[10] == 0 ? '代入' : '加算';
	this.drawTextInLongBox(text, 13,3,'left');
	this.drawTextInBox('ＯＫ', 18,'left');
	this.drawTextInBox('キャンセル', 19,'left');
};


AE_Window.prototype.isHold = function() {
	if(TouchInput.isTriggered() && this.visible){
		var x = TouchInput.x;
		var y = TouchInput.y;
		if(x >= this.x && x <= this.width + this.x && y <= this.y && y >= this.y - this.bar.height){
			return true;
		}
	}
};

AE_Window.prototype.numberInput = function() {
	if(this.index < 0)return false;
	if( this.params[this.index] && Input.isTriggered('backspace')){
		if(this.params[this.index] >= 0){
			this.params[this.index] = Math.floor(this.params[this.index] / 10);
		}else{
			this.params[this.index] = Math.ceil(this.params[this.index] / 10);
		}
		return true;
	}
	if(this.params[this.index] === 0 && Input.isTriggered('-')){
		this.params[this.index] = '-';
		return true;
	}
	var num = Input.isNumber();
	if(num >= 0){
		if(this.params[this.index] == '-'){
			this.params[this.index] = - num;
		}else{
			if(this.params[this.index] < 0){
				num = - num;
			}			
			this.params[this.index] = this.params[this.index] * 10 + num;
		}
		return true;
	}
};

AE_Window.prototype.wheelInput = function() {
	if(this.index < 0)return false;
	var a = Math.ceil(TouchInput.wheelY / 100);
	if(a){
		this.params[this.index] -= a;
		return true;
	}
};

		

AE_Window.prototype.touchIndex = function() {
	var x = this.inX();
	var y = this.inY();
	return Math.floor(x * this.cols / this.width) + Math.floor(y * this.rows / this.height) * this.cols;
};

//ドラッグしてウインドウが画面外に出てしまった時戻す処理
AE_Window.prototype.reap = function() {
	if(this.x > Graphics.width - 24)this.x = Graphics.width - 24;
	if(this.x < 24 - this.width)this.x = 24 - this.width;
	if(this.y > Graphics.height)this.y = Graphics.height;
	if(this.y < 24)this.y = 24;
};

//----------------------------------------------------------
function AE_RightMenu() {
    this.initialize.apply(this, arguments);
}

AE_RightMenu.prototype = Object.create(AE_Window.prototype);
AE_RightMenu.prototype.constructor = AE_RightMenu;

AE_RightMenu.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
	this.bitmap = new Bitmap(150,150);
	this.bitmap.fillAll('#999999');
	this.bitmap.drawLine(0, 29, 150, 29, '#ffffff', 180,2);
	this.visible = false;
};

AE_RightMenu.prototype.setup = function() {
	this.drawSprite = new Sprite();
	this.drawSprite.bitmap = new Bitmap(150,150);
	this.addChild(this.drawSprite);
};

AE_RightMenu.prototype.open = function(window,index){
	this.x = TouchInput.x;
	this.y = TouchInput.y;
	this.mode = window;
	this.index = index;
	this.drawSprite.bitmap.clear();
	switch(this.mode){
		case 'frame':
			var name = 'フレーム ' + index;
			var commands = ['コピー','貼り付け','削除'];
			this.cols = 1;
			this.rows = 4;
			break;
		case 'cell':
			var name = 'セル ' + index;
			commands = ['上へ','下へ','削除'];
			this.cols = 1;
			this.rows = 4;
			break;
	}
	this.setFrame(0,0,88,commands.length * 24 + 33);
	this.drawSprite.bitmap.drawFrame(0,0,90,commands.length * 24 + 33,'#222222',180,1);
    this.drawSprite.bitmap.fontSize = 22;
	this.drawSprite.bitmap.drawText(name,3,3,85,25,'left');
    this.drawSprite.bitmap.fontSize = 18;
	for(var i = 0; i < commands.length; i ++){
		this.drawSprite.bitmap.drawText(commands[i],10,32 + i * 24,74,18,'left');
	}
	this.visible = true;
};

//----------------------------------------------------------
Input.isNumber = function() {
	if(this._pressedTime === 0){
		var num = -1;
		switch(this._latestButton){
			case '0':
				num = 0;
				break;
			case '1':
				num = 1;
				break;
			case '2':
				num = 2;
				break;
			case '3':
				num = 3;
				break;
			case '4':
				num = 4;
				break;
			case '5':
				num = 5;
				break;
			case '6':
				num = 6;
				break;
			case '7':
				num = 7;
				break;
			case '8':
				num = 8;
				break;
			case '9':
				num = 9;
				break;
		}
		return num;
	}
};


TouchInput.isDoubleClick = function(){
	if(DCflag > DCwait){
		DCflag = 0;
		return true;
	}
};

//常にマウスの座標を取得するようにする
TouchInput._onMouseMove = function(event) {
    //if (this._mousePressed) {
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);
        this._onMove(x, y);
    //}
};

saveJson = function(data){
    var json = JsonEx.stringify(data);
    savedata = LZString.compressToBase64(json);
    var fs = require('fs');
    var path = window.location.pathname.replace(/(\/www|)\/[^\/]*$/, '/data/');
    if (path.match(/^\/([A-Z]\:)/)) {
        path = path.slice(1);
    }
    var dirPath = decodeURIComponent(path);
    var filePath = dirPath + 'Animations' + '.json';
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    fs.writeFileSync(filePath, json);
}

})();