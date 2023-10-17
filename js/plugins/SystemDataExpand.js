//===========================================================================
// SystemDataExpand.js
//---------------------------------------------------------------------------
// Copyright (c) 2018 Tubo
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//===========================================================================

/*:
 * @plugindesc システム情報の拡張
 * @author Tubo
 *
 * @param total gain gold
 * @desc 総獲得金額
 * @type Struct<Params>
 * @default {"enable":"true","variable":"0"}
 *
 * @param total lose gold
 * @desc 総喪失金額
 * @type Struct<Params>
 * @default {"enable":"false","variable":"0"}
 *
 * @param shop sell price
 * @desc 店ごとの売却金額合計
 * @type boolean
 * @default false
 *
 * @param shop buy price
 * @desc 店ごとの購入金額合計
 * @type boolean
 * @default false
 *
 * @help
 * ■ 利用方法
 *   必要なパラメータのenableを有効にしてください。
 *   無効の場合はデータを生成しないので、セーブデータサイズが気になる場合は、
 *   不要なものを無効にしてください。
 *   ショップ情報はスクリプトでのみ取得できます。
 *
 * ■ スクリプト
 *   総獲得金額の取得    $gameSystem.totalGainGold()
 *   総喪失金額の取得    $gameSystem.totalLoseGold()
 *
 *   売却金額合計の取得  $gameSystem.shopSellPrice(mapId,eventId)
 *   購入金額合計の取得  $gameSystem.shopBuyPrice(mapId,eventId)
 *      mapId,eventIdを省略すると、現在のイベントの情報を取得します。
 *
 * ■ 利用規約
 *   好きに使ってください。
 */

/*~struct~Params:
 * @param enable
 * @desc 有効/無効
 * @type boolean
 * @default true
 *
 * @param variable
 * @type number
 * @desc 代入する変数番号
 * 0の場合は取得しません
 * @default 0
 *
 */

var Imported = Imported || {};
Imported.SystemData = true;

(function() {
    'use strict'

    let parseStruct = function(paramString) {
        let data = JSON.parse(paramString);
        let obj = {};
        Object.keys(data).forEach(function(key){ obj[key] = JSON.parse(data[key]); });
        return obj;
    };

    let SystemData = {};
    SystemData.parameters = PluginManager.parameters('SystemDataExpand');
    SystemData.totalGainGold = parseStruct(SystemData.parameters['total gain gold']);
    SystemData.totalLoseGold = parseStruct(SystemData.parameters['total lose gold']);


    //----------------------------------------------------------------------
    // Game_Party
    //----------------------------------------------------------------------
    const _SystemData_Game_Party_gainGold = Game_Party.prototype.gainGold;
    Game_Party.prototype.gainGold = function(amount) {
        $gameSystem.calcTotalGold(amount);
        _SystemData_Game_Party_gainGold.call(this,amount);
    };


    //----------------------------------------------------------------------
    // Game_System
    //----------------------------------------------------------------------
    Game_System.prototype.calcTotalGold = function(amount) {
        if (amount > 0) {
            if (SystemData.totalGainGold.enable) {
                this._totalGainGold = this._totalGainGold || 0;
                this._totalGainGold += amount;
                if (SystemData.totalGainGold.variable)
                    $gameVariables.setValue(SystemData.totalGainGold.variable,this._totalGainGold);
            }
        } else if (amount < 0) {
            if (SystemData.totalLoseGold.enable) {
                this._totalLoseGold = this._totalLoseGold || 0;
                this._totalLoseGold -= amount;
                if (SystemData.totalLoseGold.variable)
                    $gameVariables.setValue(SystemData.totalLoseGold.variable,this._totalLoseGold);
            }
        }
    };

    Game_System.prototype.totalGainGold = function() {
        return this._totalGainGold;
    };

    Game_System.prototype.totalLoseGold = function() {
        return this._totalLoseGold;
    };

    Game_System.prototype.shopSellPrice = function(mapId,eventId) {
        if (!this._shopSellPrice) return 0;
        let key = [ mapId   || $gameMap.mapId(),
                    eventId || $gameMap.interpreter().eventId() ];
        let gold = this._shopSellPrice[key];
        if (!gold) return 0;
        return gold;
    };

    Game_System.prototype.shopBuyPrice = function(mapId,eventId) {
        if (!this._shopBuyPrice) return 0;
        let key = [ mapId   || $gameMap.mapId(),
                    eventId || $gameMap.interpreter().eventId() ];
        let gold = this._shopBuyPrice[key];
        if (!gold) return 0;
        return gold;
    };

    Game_System.prototype.addShopSellPrice = function(price) {
        this._shopSellPrice = this._shopSellPrice || {};
        this._shopSellPrice[SystemData.shopKey] = this._shopSellPrice[SystemData.shopKey] || 0;
        this._shopSellPrice[SystemData.shopKey] += price;
    };

    Game_System.prototype.addShopBuyPrice = function(price) {
        this._shopBuyPrice = this._shopBuyPrice || {};
        this._shopBuyPrice[SystemData.shopKey] = this._shopBuyPrice[SystemData.shopKey] || 0;
        this._shopBuyPrice[SystemData.shopKey] += price;
    };


    //----------------------------------------------------------------------
    // Game_Map
    //----------------------------------------------------------------------
    Game_Map.prototype.interpreter = function() {
        return this._interpreter;
    };


    //----------------------------------------------------------------------
    // Game_Interpreter
    //----------------------------------------------------------------------
    const _SystemData_Game_Interpreter_command302 = Game_Interpreter.prototype.command302;
    Game_Interpreter.prototype.command302 = function() {
        SystemData.shopKey = [$gameMap.mapId(),this.eventId()];
        return _SystemData_Game_Interpreter_command302.call(this);
    };

    //----------------------------------------------------------------------
    // Scene_Shop
    //----------------------------------------------------------------------
    const _SystemData_Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
    Scene_Shop.prototype.doBuy = function(number) {
        _SystemData_Scene_Shop_doBuy.call(this,number);
        if (SystemData.parameters['shop buy price']) {
            let price = number * this.buyingPrice();
            $gameSystem.addShopBuyPrice(price);
        }
    };

    const _SystemData_Scene_Shop_doSell = Scene_Shop.prototype.doSell;
    Scene_Shop.prototype.doSell = function(number) {
        _SystemData_Scene_Shop_doSell.call(this,number);
        if (SystemData.parameters['shop sell price']) {
            let price = number * this.sellingPrice();
            $gameSystem.addShopSellPrice(price);
        }
    };

})();
