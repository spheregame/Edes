/*:
 * @plugindesc ＨＰ残量に応じてゲージ色を変更します。
 TYA_EnemyHPGaugeの敵ＨＰゲージにも対応しています。
 * @author 茶の助
 *
 * @param hpStringColor
 * @desc 現在ＨＰ数値の色(100%, 30%以下, 20%以下, 10%以下, 0%)
 デフォルトと同じ処理にしたい場合は、-1にしてください
 * @default 3, 0, 6, 2, 7
 *
 * @param defaultHpColor
 * @desc 基本色
 * @default 20, 21
 *
 * @param hpColor1
 * @desc ＨＰ１００％時の色
 * @default 3, 11
 *
 * @param hpColor2
 * @desc ＨＰ３０％以下の色
 * @default 20, 21
 *
 * @param hpColor3
 * @desc ＨＰ２０％以下の色
 * @default 6, 14
 *
 * @param hpColor4
 * @desc ＨＰ１０％以下の色
 * @default 2, 10
 *
 * @param gaugeFrameColor
 * @desc ゲージ枠の色（全てのゲージに適応されます）
 使用しない場合は、-1にしてください
 * @default 15
 *
 * @help 数値は全てウィンドウスキン素材の右下部分から参照します。
 
 TYA_EnemyHPGaugeに対応させる場合は、
 このプラグインをそれより下に配置してください。
 */
 
(function() {

    var parameters = PluginManager.parameters('TYA_HPColorChange');
    var hpStringColor = parameters['hpStringColor'].split(",");
    var defaultHpColor = parameters['defaultHpColor'].split(",");
    var hpColor1 = parameters['hpColor1'].split(",");
    var hpColor2 = parameters['hpColor2'].split(",");
    var hpColor3 = parameters['hpColor3'].split(",");
    var hpColor4 = parameters['hpColor4'].split(",");
    var gaugeFrameColor = Number(parameters['gaugeFrameColor']);
    
    Window_Base.prototype.hpGaugeColor = function(rate) {
        var color1 = this.textColor(defaultHpColor[0]);
        var color2 = this.textColor(defaultHpColor[1]);
        if(rate == 1){
          color1 = this.textColor(hpColor1[0]);
          color2 = this.textColor(hpColor1[1]);
        } else if(rate <= 0.1) {
          color1 = this.textColor(hpColor4[0]);
          color2 = this.textColor(hpColor4[1]);
        } else if(rate <= 0.2) {
          color1 = this.textColor(hpColor3[0]);
          color2 = this.textColor(hpColor3[1]);
        } else if(rate <= 0.3) {
          color1 = this.textColor(hpColor2[0]);
          color2 = this.textColor(hpColor2[1]);
        }
        return [color1, color2];
    };
	
    Window_Base.prototype.hpStringColor = function(actor) {
        var color = this.hpColor(actor);
		if (hpStringColor == -1) return;
        var rate = actor.hpRate();
        if(rate == 1){
          color = this.textColor(hpStringColor[0]);
        } else if(rate == 0){
          color = this.textColor(hpStringColor[4]);
        } else if(rate <= 0.1) {
          color = this.textColor(hpStringColor[3]);
        } else if(rate <= 0.2) {
          color = this.textColor(hpStringColor[2]);
        } else if(rate <= 0.3) {
          color = this.textColor(hpStringColor[1]);
        }
        return color;
    };
	
	Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2, color3) {
		color3 = color3 || this.gaugeBackColor();
		var fillW = Math.floor(width * rate);
		var gaugeY = y + this.lineHeight() - 8;
		this.contents.fillRect(x-1, gaugeY-1, width+2, 6+2, this.textColor(gaugeFrameColor));
		this.contents.fillRect(x, gaugeY, width, 6, color3);
		this.contents.gradientFillRect(x, gaugeY, fillW, 6, color1, color2);
	};
    
    Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
        width = width || 186;
        var hprate = actor.hpRate();
        this.drawGauge(x, y, width, hprate, this.hpGaugeColor(hprate)[0], this.hpGaugeColor(hprate)[1],
		               this.gaugeBackColor());
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.hpA, x, y, 44, 'left', true);
        this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width, this.hpStringColor(actor), this.normalColor());
    };
    
})();