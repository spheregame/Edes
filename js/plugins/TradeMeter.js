//=============================================================================
// TradeMeter.js
//=============================================================================

/*:ja
 * @plugindesc 売り買いされたアイテムに応じて変数を増減させます。
 * @author 奏ねこま（おとぶきねこま）
 *
 * @param デフォルト変数
 * @desc 変数指定を省略した場合に増減させる変数のIDを指定してください。
 * @default 0
 *
 * @help
 * アイテムの購入、売却が行われた際に、あらかじめ設定した値を変数から増減します。
 * 変数を増減させたいアイテムのメモ欄に、以下のように記述してください。
 *
 * 　<TradeMeter:値> または <TradeMeter:値,変数>
 *
 * 変数を省略した場合は、デフォルト変数が増減されます。
 * デフォルト変数はプラグイン設定画面より設定してください。
 *
 * [記述例] アイテム購入時に、デフォルト変数を+2させたい場合
 *
 * 　<TradeMeter:2>
 *
 * [記述例] アイテム購入時に、変数#0002を+3させたい場合
 *
 *   <TradeMeter:3,2>
 *
 * *このプラグインには、プラグインコマンドはありません。      
 *
 * [ 利用規約 ] .................................................................
 *  本プラグインの利用者は、RPGツクールMV/RPGMakerMVの正規ユーザーに限られます。
 *  商用、非商用、ゲームの内容（年齢制限など）を問わず利用可能です。
 *  ゲームへの利用の際、報告や出典元の記載等は必須ではありません。
 *  二次配布や転載、ソースコードURLやダウンロードURLへの直接リンクは禁止します。
 *  （プラグインを利用したゲームに同梱する形での結果的な配布はOKです）
 *  不具合対応以外のサポートやリクエストは受け付けておりません。
 *  本プラグインにより生じたいかなる問題においても、一切の責任を負いかねます。
 * [ 改訂履歴 ] .................................................................
 *   Version 1.00  2016/10/12  初版
 * -+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  Web Site: http://makonet.sakura.ne.jp/rpg_tkool/
 *  Twitter : https://twitter.com/koma_neko
 */

(function () {
    'use strict';

    const _PRODUCT = 'TradeMeter';
    const _PARAMETER = PluginManager.parameters(_PRODUCT);
    
    const _DEFAULT_VARIABLE = +_PARAMETER['デフォルト変数'] || 0;

    function gainMeter(item, number) {
        if (item.meta.TradeMeter) {
            var data = item.meta.TradeMeter.trim().split(/ *, */).map(function(data){ return +data });
            var vid = data[1] || _DEFAULT_VARIABLE;
            if (vid) {
                $gameVariables.setValue(vid, $gameVariables.value(vid) + data[0] * number);
            }
        }
    }
    
    var _Scene_Shop_doBuy = Scene_Shop.prototype.doBuy;
    Scene_Shop.prototype.doBuy = function(number) {
        _Scene_Shop_doBuy.call(this, number);
        gainMeter(this._item, number);
    };

    var _Scene_Shop_doSell = Scene_Shop.prototype.doSell;
    Scene_Shop.prototype.doSell = function(number) {
        _Scene_Shop_doSell.call(this, number);
        gainMeter(this._item, -number);
    };
}());
