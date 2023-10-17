//=============================================================================
// NYA_ItemListInfinity.js
// ----------------------------------------------------------------------------
// Copyright (c) 2017 Nyatama
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.2.0 2017/10/21 メモに<infinity>がある場合に∞を表示する機能を追加
// 1.1.0 2017/09/28 消耗しないアイテムは個数を表示しない機能を追加
// 1.0.0 2017/09/18 試作版
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/nyatama777/
//=============================================================================

/*:
 * @plugindesc v1.1.0 アイテムリストに消耗しないアイテムが有る場合∞を表示する
 * @author にゃたま
 *
 * @param isItemNumberHidden
 * @text isItemNumberHidden
 * @desc 消耗しないアイテムの個数を隠す
 * ON:個数を表示しません OFF:個数に∞を表示します
 * @type boolean
 * @default false
 *
 * @param isItemMetaUsed
 * @text isItemMetaUsed
 * @desc 消耗に関係なくメモに<infinity>がある場合に∞を表示します
 * ON:有効 OFF:無効
 * @type boolean
 * @default false
 */

(function () {
    'use strict';
    var parameters = PluginManager.parameters('NYA_ItemListInfinity');
    var isItemNumberHidden = eval(parameters['isItemNumberHidden']);
    var isItemMetaUsed = eval(parameters['isItemMetaUsed']);
    
    Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
        if (this.needsNumber()) {
            if((!isItemMetaUsed && item.consumable) || (isItemMetaUsed && !item.meta.infinity)) {
                this.drawText(':', x, y, width - this.textWidth('00'), 'right');
                this.drawText($gameParty.numItems(item), x, y, width, 'right');
            }else{
                if(!isItemNumberHidden){
                    this.drawText(':', x, y, width - this.textWidth('00'), 'right');
                    this.drawText("∞", x, y, width, 'right');
                }
            }
        }
    };
})();


