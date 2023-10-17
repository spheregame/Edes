//=============================================================================
// K_OriginalGauge.js
//=============================================================================

/*:
 * @plugindesc HP、MP、TPゲージをオリジナル画像で描画します。
 * @author ルルの教会 (https://nine-yusha.com/)
 *
 * @param FileName
 * @desc ゲージの描画に使用する画像ファイル名です。
 * @default Gauge
 *
 * @help このプラグインには、プラグインコマンドはありません。

 使用する画像ファイルは、img/system に置いてください。

 利用規約:
   ・著作権表記は必要ございません。
   ・利用するにあたり報告の必要は特にございません。
   ・商用・非商用問いません。
   ・R18作品にも使用制限はありません。
   ・ゲームに合わせて自由に改変していただいて問題ございません。
   ・プラグイン素材としての再配布（改変後含む）は禁止させていただきます。

 ライセンスについての詳細は下記をご確認ください。
 https://nine-yusha.com/plugin/

 作者: ルルの教会
 作成日: 2020/10/13
*/

(function() {

	var parameters = PluginManager.parameters('K_OriginalMsgBack');
	var FileName = String(parameters['FileName'] || 'Gauge');

	Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
	    var fillW = Math.floor(width * rate);
	    var gaugeY = y + this.lineHeight() - 8;
	    // ゲージ枠の描画 (左)
	    var bitmap = ImageManager.loadSystem('Gauge');
	    var pw = 2;
	    var ph = 10;
	    var sx = 0;
	    var sy = 0;
	    this.contents.blt(bitmap, sx, sy, pw, ph, x - 2, gaugeY - 2);
	    // ゲージ枠の描画 (中央)
	    pw = width;
	    sx = 2;
	    this.contents.blt(bitmap, sx, sy, pw, ph, x, gaugeY - 2);
	    // ゲージ枠の描画 (右)
	    pw = 2;
	    sx = 238;
	    this.contents.blt(bitmap, sx, sy, pw, ph, x + width, gaugeY - 2);
	    // ゲージの描画
	    pw = fillW;
	    ph = 6;
	    sx = 2;
	    // HP、MP、TPでゲージ色を変更
	    switch (color1) {
	    	case this.hpGaugeColor1():
	    		// HPが1/4未満のとき、ゲージ色を変更
	    		if (rate < 0.25) {
	    			sy = 42;
	    		} else {
	    			sy = 12;
	    		}
	    		break;
	    	case this.mpGaugeColor1():
	    		sy = 22;
	    		break;
	    	case this.tpGaugeColor1():
	    		sy = 32;
	    		break;
	    }
	    this.contents.blt(bitmap, sx, sy, pw, ph, x, gaugeY);
	};

})();
