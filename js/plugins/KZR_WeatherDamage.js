//=============================================================================
// KZR_WeatherDamage.js
// Version : 1.01
// -----------------------------------------------------------------------------
// [Homepage]: かざり - ホームページ名なんて飾りです。偉い人にはそれがわからんのですよ。 -
//             http://nyannyannyan.bake-neko.net/
// -----------------------------------------------------------------------------
// [Version]
// 1.01 2017/01/20 ヘルプ文章更新
// 1.00 2017/01/20 公開
//=============================================================================

/*:
 * @plugindesc 天候によって、ダメージ変動や命中率変化をさせます。
 * @author ぶちょー
 *
 * @help
 * スキルのメモ欄に以下のように記述してください。
 *
 * 【ダメージ変動】
 * <WD_DamageUp:type,rate>
 * type : 天候（雨：rain, 嵐：storm, 雪：snow）
 *        追加天候（吹雪：blizzard, 下降する光：downlight, 上昇する光：uplight）
 * rate : ダメージ変動率(%)
 * （例） <WD_DamageUp:snow,150>  雪のとき、ダメージが150%
 * （例） <WD_DamageUp:rain,50>   雨のとき、ダメージが50%
 *
 * 【命中率変化】
 * <WD_HitChange:type,plus>
 * type : 天候（雨：rain, 嵐：storm, 雪：snow）
 *        追加天候（吹雪：blizzard, 下降する光：downlight, 上昇する光：uplight）
 * plus : 命中率増加量（負の数で減少）
 *      : certain （必中）
 * （例） <WD_HitChange:rain,10>  雨のとき、命中率が10%増加
 * （例） <WD_HitChange:storm,certain>  嵐のとき、必中
 *
 * 【追加天候について】
 * プラグイン KZR_WeatherControl.js を導入してください。
 */

//-----------------------------------------------------------------------------
// Game_Action
//
var _kzr_WD_Game_Action_itemHit = Game_Action.prototype.itemHit;
Game_Action.prototype.itemHit = function(target) {
    if (this.WD_HitTypeCertain()) return 1.0;
    var hit = _kzr_WD_Game_Action_itemHit.call(this, target);
    var notedata = this.item().note.split(/[\r\n]+/);
    var note = /(?:WD_HitChange:(\S+),(-)?(\d+))/i;
    for (var i = 0; i < notedata.length; i++) {
      if (notedata[i].match(note)) {
          if (RegExp.$1 === $gameScreen.weatherType()) {
              var plus = parseInt(RegExp.$3) * 0.01;
              hit += RegExp.$2 ? plus * (-1) : plus;
          }
      }
    }
    return hit;
};

var _kzr_WD_Game_Action_itemEva = Game_Action.prototype.itemEva;
Game_Action.prototype.itemEva = function(target) {
    if (this.WD_HitTypeCertain()) return 0;
    return _kzr_WD_Game_Action_itemEva.call(this, target);
};

Game_Action.prototype.WD_HitTypeCertain = function() {
    var notedata = this.item().note.split(/[\r\n]+/);
    var note = /(?:WD_HitChange:(\S+),certain)/i;
    for (var i = 0; i < notedata.length; i++) {
      if (notedata[i].match(note)) {
          if (RegExp.$1 === $gameScreen.weatherType()) return true;
      }
    }
    return false;
};

var _kzr_WD_Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
Game_Action.prototype.makeDamageValue = function(target, critical) {
    var value = _kzr_WD_Game_Action_makeDamageValue.call(this, target, critical);
    var notedata = this.item().note.split(/[\r\n]+/);
    var note = /(?:WD_DamageUp:(\S+),(\d+))/i;
    for (var i = 0; i < notedata.length; i++) {
      if (notedata[i].match(note)) {
          if (RegExp.$1 === $gameScreen.weatherType()) {
              value *= parseInt(RegExp.$2) * 0.01;
          }
      }
    }
    return parseInt(value);
};
