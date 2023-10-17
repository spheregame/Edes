//EasyScapegoat

/*:ja
* 
* @plugindesc　身代わりが起きやすくするプラグイン
* @author 霧島万　（ツイッター　yurugatinoeru）
* 
* @param　ScapegoatStart
* @desc　身代わり発動の条件となるHPの割合
* @default　25
* @help
* terunonの卑弥呼テクニックを参考に作りました。
* 
*/

(function() {

var parameters = PluginManager.parameters('EasyScapegoat');
var ScapegoatStart = Number(parameters['ScapegoatStart'] || 25);

var CopyOfisDying = Game_BattlerBase.prototype.isDying;

Game_BattlerBase.prototype.isDying = function() {
	var ret = CopyOfisDying.call(this);
	return this.isAlive() && this._hp < this.mhp*ScapegoatStart/100; 
};

})();
