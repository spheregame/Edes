/*:
@author
シトラス

@plugindesc
かかっていると、受けているダメージに比例して相手に与えるダメージを
増大させるステートを作ることができます。

@param bloodStateId
@desc
ダメージを受けているだけ、相手に与えるダメージを
増やすステートのＩＤ
@default
0
@type number

@help
「受けているダメージに比例して相手に与えるダメージを増大させるステート」に
したいステートのＩＤをプラグインパラメータに入力してください。

このプラグインにプラグインコマンドはありません。

このプラグインはＭＩＴライセンスに基づいて公開しています
https://ja.osdn.net/projects/opensource/wiki/licenses%2FMIT_license
*/

//即時間数で囲む
(function(){
	var pre_Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
	Game_Action.prototype.makeDamageValue = function(target, critical) {
		var value = pre_Game_Action_makeDamageValue.call(this,target,critical);
		var bloodStateId = Number(PluginManager.parameters("bloodState").bloodStateId);
		if(this.subject().isStateAffected(bloodStateId) ){
			console.log("対象のステートにかかっています");
			value = value * (1 + (this.subject().mhp - this.subject().hp)/this.subject().mhp);
			value = Math.round(value);
		}
		return value;
	};
})();