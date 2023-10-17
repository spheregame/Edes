//=============================================================================
// Trb_Mekakushi.js 
//=============================================================================
//Copyright (c) 2016 Trb
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//
// twitter https://twitter.com/Trb_surasura
/*:
 * @plugindesc 目隠しステートを使えるようになるプラグイン
 * @author Trb
 * @version 1.00 2016/ 2/17 初版
 *          　　 2016/10/21 再公開するにあたり、プラグイン名をmekakushi.jsからTrb_Mekakushi.jsに変更しました（中身は同じです）
 * 
 * @help HPやアイテムリスト等の表示が???になってしまうステートを設定できるようになります。 
 * ステートのメモ欄に
 * <mekakushi: 隠したい項目名 >
 * と記載することで、そのステートに掛かっているキャラは指定した項目の表示が???に変わります。
 * 
 * 指定できる項目名 hp mp tp list
 * <例>
 * <mekakushi:hp,mp> と書くと、HPとMPが???に。
 * <mekakushi:hp,list> と書くと、HPと アイテム、スキルのリストが???に。      
 * 項目と項目の間は　,　で区切ってください。
 * 
 * 
 * フィールドでも持続するステートにこの効果を設定した場合、
 * HP,MP,TPはフィールドでも???のままですが、アイテムリスト、スキルリストは
 * フィールドでは正常に表示されます。 
 * 
 * 
 */
(function () {

//アクターに掛かっているステートのメモ欄からmekakushiの記述を探す関数    
    checkMekakushi = function(actor,param){//param･･･hp,mp,tp,listのどれか
        var mekakushi = [];
        actor.states().forEach(function(stateId){
            if(stateId.meta.mekakushi){//ステートのmetaにmekakushiの記述があったら
                var a = stateId.meta.mekakushi.split(',');//コンマで分割してaに入れる
                a.forEach(function(b){
                    mekakushi.push(b);//aを配列mekakushiに追加する
                });
            }
        });
        if(mekakushi.some(function(c){
            if(c == param)return true;//mekakushiの中に指定した項目があったらtrueを返す
            })){
            return true;
        }else return false;
    };    


    Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
        width = width || 186;
        var color1 = this.hpGaugeColor1();
        var color2 = this.hpGaugeColor2();
        var ahp = '???';//hpとmhpの表示を???にする
        var amhp = '???';
        if(checkMekakushi(actor,'hp') == false){//mekakushi:hpが無ければゲージの描画と正しいHP値を取得
            this.drawGauge(x, y, width, actor.hpRate(), color1, color2);      
            ahp = actor.hp;
            amhp = actor.mhp;
        }
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.hpA, x, y, 44);
        this.drawCurrentAndMax(ahp, amhp, x, y, width,
                            this.hpColor(actor), this.normalColor());
    };
    
//以下、基本的に上と同じ処理    
    Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
        width = width || 186;
        var color1 = this.mpGaugeColor1();
        var color2 = this.mpGaugeColor2();
        var amp = '???';
        var ammp = '???';
        if(checkMekakushi(actor,'mp') == false){
            this.drawGauge(x, y, width, actor.mpRate(), color1, color2);     
            amp = actor.mp;
            ammp = actor.mmp;
        }
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.mpA, x, y, 44);
        this.drawCurrentAndMax(amp, ammp, x, y, width,
                            this.mpColor(actor), this.normalColor());
    };
    
    Window_Base.prototype.drawActorTp = function(actor, x, y, width) {
        width = width || 96;
        var color1 = this.tpGaugeColor1();
        var color2 = this.tpGaugeColor2();
        var atp = '???';
        if(checkMekakushi(actor,'tp') == false){
            this.drawGauge(x, y, width, actor.tpRate(), color1, color2);     
            atp = actor.tp;
        }
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.tpA, x, y, 44);
        this.changeTextColor(this.tpColor(actor));
        this.drawText(atp, x + width - 64, y, 64, 'right');
    };
    
    Window_Base.prototype.drawItemName = function(item, x, y, width) {
        width = width || 312;
        if (item) {
            var icon = item.iconIndex;
            var iname = item.name;
            if(BattleManager.actor() && $gameParty.inBattle()){
                if(checkMekakushi(BattleManager.actor(),'list') == true){
                    icon = 0;
                    iname = '???';
                }            
            }
            var iconBoxWidth = Window_Base._iconWidth + 4;
            this.resetTextColor();
            this.drawIcon(icon, x + 2, y + 2);
            this.drawText(iname, x + iconBoxWidth, y, width - iconBoxWidth);
        }
    };
    
    Window_Help.prototype.refresh = function() {
        this.contents.clear();
        var text = this._text;
        if(BattleManager.actor() && $gameParty.inBattle()){
            if(checkMekakushi(BattleManager.actor(),'list') == true){
                text = '???';
            }            
        }
        this.drawTextEx(text, this.textPadding(), 0);
    };
    
})();