//==============================================================================
// ExecuteCommonEventBeforeAttack.js
//==============================================================================

/*:
* @plugindesc You can execute a common event before attack.
* @author myxcher
*
* @help
*===============================================================================
*
* There are no plugin commands.
*
*===============================================================================
*
* If you insert the following expression into a skill's notebox,
* you can execute a common event before attack.
*
* <eventId:1>   # Execute common event 1 before attack.
*
*===============================================================================
*/
 
/*:ja
* @plugindesc スキル使用前にコモンイベントを実行可能にします。
* @author myxcher
*
* @help
*===============================================================================
*
* このプラグインにプラグインコマンドはありません。
*
*===============================================================================
*
* データベースのスキルの項のメモ欄に以下の様に記述することで、
* スキルの使用前にコモンイベントを実行させることができます。
*
* <eventId:1>   # スキルの使用前にイベント番号１番のコモンイベントを実行
*
*===============================================================================
*/
 
(function() {
    
//===============================================================================
// BattleManager
//===============================================================================
    
var _BattleManager_initMembers = BattleManager.initMembers;  
BattleManager.initMembers = function() {
    _BattleManager_initMembers.call(this);
    this._isCommonEventExecute = false;
};
    
var _BattleManager_processTurn = BattleManager.processTurn;
BattleManager.processTurn = function() {
    var action = this._subject.currentAction();
    if(action && !this._isCommonEventExecute){
        var eventId = Number(action.item().meta.eventId);
        if(eventId){
            $gameTemp.reserveCommonEvent(eventId);
            this._isCommonEventExecute = true;
            return;
        }
    }
    this._isCommonEventExecute = false;
    _BattleManager_processTurn.call(this);  
};
    
})();