/*:ja
 * @plugindesc 戦闘速度高速化
 * @author hiz
 *
 * @param speed
 * @desc 速度の倍率
 * @default 6
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *       ※初期に適当に作ったプラグインのため、うまく動作しない可能性があります。他の方の高機能なプラグイン使って下さい。
 */

(function() {
	var parameters = PluginManager.parameters('SimpleMsgSideView');
  	var speed = Number(parameters['speed']);
	Window_BattleLog.prototype.updateWaitCount = function() {
	    if (this._waitCount > 0) {
	        this._waitCount -= this.isFastForward() ? 1 * speed: 3 * speed;
	        if (this._waitCount < 0) {
	            this._waitCount = 0;
	        }
	        return true;
	    }
	    return false;
	};
	Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
	    var animation = $dataAnimations[animationId];
	    if (animation) {
	        var delay = this.animationBaseDelay() / speed;
	        var nextDelay = this.animationNextDelay() / speed;
	        targets.forEach(function(target) {
	            target.startAnimation(animationId, mirror, delay);
	            delay += nextDelay;
	        });
	    }
	};

})();