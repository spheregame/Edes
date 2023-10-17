//=============================================================================
// Mano_ActionForAll.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017-2018 Sigureya
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2018/07/26 初版 
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/Sigureya/
//=============================================================================


/*:
 * @plugindesc スキルの追加効果について、発動条件を設定します。
 * 
 * @author しぐれん(https://twitter.com/Sigureya/)
 * 
 * @help
 * 
 * スキルまたはアイテムにデータを設定してください。
 * <EffectCond1:条件式>
 * 先頭の要素を1番とします。
 * 条件式は、ダメージ式で使えるものと同様です。
 * 
 * 更新履歴
 * 2018/07/26 公開
 * 
*/

(function (){
'use strict';
/**
 * @param {RPG.UsableItem} item 
 */
function onItem(item){
    const tag ="EffectCond";
    // if(item.meta[tag]){
    //     item.hasEffectCond_MA =true;
    //     return;
    // }
    const length = item.effects.length;
    for(var i=0;i < length; i++){
        const effect = item.effects[i];
        const tagByEffect = tag +(i+1);
        const condExpr =item.meta[tagByEffect]
        if(condExpr){
            effect.condition =condExpr;
//            item.hasEffectCond_MA =true;
        }
    }
}

/**
 * @param {RPG.UsableItem[]} list 
 */
function eachItem(list){
    for (let index = 1; index < list.length; index++) {
        const element = list[index];
        onItem(element);
    }
}

const Scene_Boot_start=Scene_Boot.prototype.start;
Scene_Boot.prototype.start =function(){
    eachItem($dataItems);
    eachItem($dataSkills);
    Scene_Boot_start.call(this);
};


})();

(function(){
'use strict';
/**
 * @param {Game_Battler} target 
 * @param {RPG.Effect} effect 
 */
Game_Action.prototype.evalEffectCondtion =function(target,effect){

    if(!effect.condition){return true;}

    const a = this.subject();
    const b = target;
    var v = $gameVariables._data;

    const result = !!eval(effect.condition);
    return result;
};
const Game_Action_applyItemEffect=Game_Action.prototype.applyItemEffect;
Game_Action.prototype.applyItemEffect =function(target,effect){
    if(!this.evalEffectCondtion(target,effect)){
        return;
    }
    Game_Action_applyItemEffect.call(this,target,effect);
};

})();