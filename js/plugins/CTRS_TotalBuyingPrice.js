/*:
@author
シトラス

@plugindesc
アイテムを購入した時の合計金額を
求める式を変更できます。

@param buyingFormula
@desc
アイテムを購入する際、値段を決定する式です。
price:アイテムの値段　number:アイテムの購入個数
@type String
@default
price*number

@help
プラグインの詳細な説明。

アイテムを購入したときの合計金額を求める
式を変更できます。

普通は、アイテムの購入数×金額ですが
アイテムの購入数に比例して合計金額が割引されるなどの
演出を行うことができます。

規約
クレジット表記は自由です。
作者名を記載するのであれば、ReadMe、ゲーム内、ゲーム紹介文のうち
いずれかで行ってください

営利目的で使用できますが、プラグインそのものの
販売は禁止します。

プラグインの改変は可能です。

ゲームに含めての再配布は可能です。

どのような作品にも、使用していただけます。
*/

//即時間数で囲む
(function(){
	var buyingFormula = PluginManager.parameters('CTRS_TotalBuyingPrice').buyingFormula;
	Window_ShopNumber.prototype.drawTotalPrice = function() {
		var price  = this._price;
		var number = this._number
		var total = Math.round(eval(buyingFormula) );
		var width = this.contentsWidth() - this.textPadding();
		this.drawCurrencyValue(total, this._currencyUnit, 0, this.priceY(), width);
    };
	Scene_Shop.prototype.doBuy = function(number) {
		var price = this.buyingPrice();
        $gameParty.loseGold(Math.round(eval(buyingFormula) ) );
        $gameParty.gainItem(this._item, number);
    };
})();