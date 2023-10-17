/*:
 * @plugindesc 「オプション」と「ゲーム終了」を統合し、
 さらに機能の追加などを行います。
 * @author 茶の助
 *
 * @param SystemCommandName
 * @desc メニューに追加するコマンド名
 （空欄にすると、用語の「ゲーム終了」が表示されます）
 * @default システム
 *
 * @param toTitleVerifyCommandWidth
 * @desc 「タイトルへ」確認コマンド：ウィンドウ幅
 * @default 188
 *
 * @param toTitleVerifyCommand1
 * @desc 「タイトルへ」確認コマンド：実行
 * @default 本当に戻る
 *
 * @param toTitleVerifyCommand2
 * @desc 「タイトルへ」の確認コマンド：キャンセル
 * @default キャンセル
 */

(function () {

    var parameters = PluginManager.parameters('TYA_SceneSystem');
    var SystemCommandName = parameters['SystemCommandName'];
    var toTitleVerifyCommandWidth = Number(parameters['toTitleVerifyCommandWidth']);
    var toTitleVerifyCommand1 = parameters['toTitleVerifyCommand1'];
    var toTitleVerifyCommand2 = parameters['toTitleVerifyCommand2'];
	
	Window_MenuCommand.prototype.addOptionsCommand = function() {
	};
	
	Window_MenuCommand.prototype.addGameEndCommand = function() {
		var enabled = this.isGameEndEnabled();
		var commandName = SystemCommandName;
		if (commandName == "") {
			commandName = TextManager.gameEnd
		}
		this.addCommand(commandName, 'gameEnd', enabled);
	};
	
	Window_GameEnd.prototype.initialize = function() {
        Window_Command.prototype.initialize.call(this, 0, 0);
        this.updatePlacement();
		this.selectLast();
    };
	
	Window_GameEnd.prototype.makeCommandList = function() {
		this.addCommand(TextManager.options, 'options');
		this.addCommand(TextManager.continue_, 'continue');
		this.addCommand(TextManager.toTitle, 'toToTitle');
		this.addCommand(TextManager.cancel,  'cancel');
	};
	
	Window_GameEnd._lastCommandSymbol = null;
	
	Window_GameEnd.prototype.processOk = function() {
		Window_GameEnd._lastCommandSymbol = this.currentSymbol();
		Window_Command.prototype.processOk.call(this);
	};
	
	Window_GameEnd.prototype.selectLast = function() {
		this.selectSymbol(Window_GameEnd._lastCommandSymbol);
	};
	
//-----------------------------------------------------------------------------

	function Window_GameEnd2() {
		this.initialize.apply(this, arguments);
	}

	Window_GameEnd2.prototype = Object.create(Window_Command.prototype);
	Window_GameEnd2.prototype.constructor = Window_GameEnd2;

	Window_GameEnd2.prototype.initialize = function() {
		Window_Command.prototype.initialize.call(this, 0, 0);
		this.openness = 0;
	};
	
	Window_GameEnd2.prototype.windowWidth = function() {
		return toTitleVerifyCommandWidth;
	};

	Window_GameEnd2.prototype.makeCommandList = function() {
		this.addCommand(toTitleVerifyCommand1, 'toTitle');
		this.addCommand(toTitleVerifyCommand2,  'cancel');
	};
	
//-----------------------------------------------------------------------------

	var _Scene_GameEnd_prototype_create　= Scene_GameEnd.prototype.create;
	Scene_GameEnd.prototype.create = function() {
		_Scene_GameEnd_prototype_create.call(this);
		this.createCommandWindow2();
	};
	Scene_GameEnd.prototype.createCommandWindow = function() {
		this._commandWindow = new Window_GameEnd();
		this._commandWindow.setHandler('options',    this.commandOptions.bind(this));
		this._commandWindow.setHandler('continue',   this.commandContinue.bind(this));
		this._commandWindow.setHandler('toToTitle',  this.commandToToTitle.bind(this));
		this._commandWindow.setHandler('cancel',     this.popScene.bind(this));
		this.addWindow(this._commandWindow);
	};
	
	Scene_GameEnd.prototype.createCommandWindow2 = function() {
		this._commandWindow2 = new Window_GameEnd2();
		this._commandWindow2.setHandler('toTitle',  this.commandToTitle.bind(this));
		this._commandWindow2.setHandler('cancel',   this.toTitleCancel.bind(this));
		this.addWindow(this._commandWindow2);
		this._commandWindow2.x = this._commandWindow.x + this._commandWindow.width;
		this._commandWindow2.y = this._commandWindow.y + 24 * 3;
	};
	
	Scene_GameEnd.prototype.createBackground = function() {
		Scene_MenuBase.prototype.createBackground.call(this);
		//this.setBackgroundOpacity(128);
	};
	
	var _Scene_GameEnd_prototype_stop = Scene_GameEnd.prototype.stop;
	Scene_GameEnd.prototype.stop = function() {
		_Scene_GameEnd_prototype_stop.call(this);
		this._commandWindow2.close();
	};
	
	Scene_GameEnd.prototype.commandToToTitle = function() {
		this._commandWindow.deactivate();
        this._commandWindow2.select(1);
		this._commandWindow2.open();
		this._commandWindow2.activate();
	};
	
	Scene_GameEnd.prototype.toTitleCancel = function() {
		this._commandWindow.activate();
		this._commandWindow2.close();
		this._commandWindow2.deactivate();
	};
	
	Scene_GameEnd.prototype.commandOptions = function() {
		this._commandWindow.close();
		SceneManager.push(Scene_Options);
	};
	
	Scene_GameEnd.prototype.commandContinue = function() {
		this._commandWindow.close();
		SceneManager.push(Scene_Load);
	};
	
	Scene_GameEnd.prototype.popScene = function() {
		Window_GameEnd._lastCommandSymbol = null;
		Scene_MenuBase.prototype.popScene.call(this);
	};
	

})();