//============================================================================
// CashFlow_dm.js
//============================================================================

/*:ja
 * @plugindesc ver1.00 収支の合計額を取得するためのプラグインです。
 * @author まっつＵＰ
 *
 * @param curgold
 * @desc 所持金が何らかの理由で動いた後に
 * 現在の所持金を代入する変数のIDです。
 * @default 10
 *
 * @param income
 * @desc 所持金の増加があったときに
 * 増加額を加算する変数のIDです。
 * @default 11
 *
 * @param expense
 * @desc 所持金の現象があったときに
 * 減少額の絶対値を加算する変数のIDです。
 * @default 12
 *
 * @help
 *
 * RPGで笑顔を・・・
 *
 * このヘルプとパラメータの説明をよくお読みになってからお使いください。
 *
 * incomeとexpenseの効果は「加算」ですので、所持金と関係しない数値は
 * 変数に入っていない状態で運用することが好ましいです。
 *
 * ちなみにincomeやexpenseにcurgoldと同じIDを入れると
 * 現在の所持金の代入によりそれらの処理を上書きできます。
 * どちらかまたは両方の処理が要らない場合にお試しください。
 *
 * 利用規約(2019/9/7変更)：
 * この作品は マテリアル・コモンズ・ブルー・ライセンスの下に提供されています。
 * https://materialcommons.tk/mtcm-b-summary/
 * クレジット表示：まっつＵＰ
 *
 */

(function() {

    var parameters = PluginManager.parameters('CashFlow_dm');
    var CFcurgold = Number(parameters['curgold'] || 10);
    var CFincome = Number(parameters['income'] || 11);
    var CFexpense = Number(parameters['expense'] || 12);
    var CFamount = 0; //変数IDの取得
    var CFabs = 0; //加算値
    var CFtotalamount = 0; //実際に変数に代入する値

    var _Game_Party_gainGold = Game_Party.prototype.gainGold;
    Game_Party.prototype.gainGold = function(amount) {
    _Game_Party_gainGold.call(this,amount);
    //元の処理this._gold = (this._gold + amount).clamp(0, this.maxGold());
    if(amount >= 0){
         CFamount = CFincome;
    }else{
         CFamount = CFexpense;
    }
     CFabs = Math.abs(amount); //絶対値
     CFtotalamount = $gameVariables.value(CFamount) + CFabs; //変数に加算する値を計算
     $gameVariables.setValue(CFamount,CFtotalamount); //実際の加算
     $gameVariables.setValue(CFcurgold,this._gold); //現在の所持金の代入
    };

})();
