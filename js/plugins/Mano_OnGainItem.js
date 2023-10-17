//============================================================================
// Mano_OnGainItem.js
// ---------------------------------------------------------------------------
// Copyright (c) Sigureya
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ---------------------------------------------------------------------------
// [Twitter]: https://twitter.com/Sigureya/
//============================================================================

/*:
 * @plugindesc アイテムを入手した場合に、変数を操作します。
 * @author しぐれん(https://github.com/Sigureya/RPGmakerMV)
 * 
 * @param item
 * @desc アイテム入手時に代入される変数です。
 * @type variable
 * @default 0
 * 
 * @param weapon
 * @type variable
 * @default 0
 * 
 * @param armor
 * @type variable
 * @default 0
 * 
 * @param amount
 * @type variable
 * @default 0 
 * @help
 * アイテムを入手した場合に、対応した変数へIDと個数を書き込みます。
 * それだけです。
 * 
 * アイテムを減らした場合でも呼びだされます。
 * その場合、個数に負の値が入ります。
 * 
*/


(function() {
    'use strict';
const setting =(function(){
    const param = PluginManager.parameters("Mano_OnGainItem");
    const result ={
        item:Number(param.item || 0),
        weapon:Number(param.weapon || 0),
        armor:Number(param.armor || 0),
        amount:Number(param.amount || 0)
    };
    return result;
})();
const Game_Party_gainItem =Game_Party.prototype.gainItem;
Game_Party.prototype.gainItem =function(item, amount, includeEquip){
    Game_Party_gainItem.call(this,item, amount, includeEquip);
    const container =this.itemContainer(item);
    if(this._items ===container){
        $gameVariables.setValue(setting.item,item.id);
    }else{
        $gameVariables.setValue(setting.item,0);
    }

    if(this._weapons ===container){
        $gameVariables.setValue(setting.weapon,item.id);
    }else{
        $gameVariables.setValue(setting.weapon,0);
    }

    if(this._armors ===container){
        $gameVariables.setValue(setting.armor,item.id);
    }else{
        $gameVariables.setValue(setting.armor,0);
    }
    $gameVariables.setValue(setting.amount,amount);
};

})();