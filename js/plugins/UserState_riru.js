//=============================================================================
// UserState_riru.js
//=============================================================================
/*:
 * @plugindesc 他対象でもスキルの使用者にもステートがかかるスキルと0ターンで解除するステートを作成できます。
 * @author riru
 *
 * @help 
 *＜使い方＞
 *＜使用者ステートスキル＞
 *スキルのメモ欄に下記のように記入する
 *<userstate:付加ステートID>
 *使用例：<userstate:30>
 *
 *＜0ターン解除ステート＞
 *ステートのメモ欄に<zeroturnstate>と記入する
 *
 * ＜規約＞
 * 有償無償問わず使用できます。改変もご自由にどうぞ。使用報告もいりません。２次配布は作成者を偽らなければOKです（ただし素材単品を有償でやりとりするのはNG）。
 *著作権は放棄していません。使用する場合は以下の作者とURLをreadmeなどどこかに記載してください
 *
 * ＜作者情報＞
 *作者：riru 
 *HP：ガラス細工の夢幻
 *URL：http://garasuzaikunomugen.web.fc2.com/index.html
 */

(function() {
var _riru_itemEffectAddState = Game_Action.prototype.itemEffectAddState;
Game_Action.prototype.itemEffectAddState = function(target, effect) {
    var chance = effect.value1;
    if (!this.isCertainHit()) {
        chance *= this.subject().stateRate(effect.dataId);
        chance *= this.lukEffectRate(this.subject());
    }
    if (Math.random() < chance && $dataSkills[this.item().id].meta.userstate != null) {
        this.subject().addState(Number($dataSkills[this.item().id].meta.userstate));
        this.makeSuccess(this.subject());
    }
        _riru_itemEffectAddState.call(this,target, effect);
};
//0ターンステート
var _riru_resetStateCounts = Game_BattlerBase.prototype.resetStateCounts;
Game_BattlerBase.prototype.resetStateCounts = function(stateId) {
    _riru_resetStateCounts.call(this,stateId);
    if ($dataStates[stateId].meta.zeroturnstate) {
    this._stateTurns[stateId] = 0;
    }
};

})();

