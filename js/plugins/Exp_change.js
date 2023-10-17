
/*:
* @plugindesc レベルが高い敵の経験値を倍増
* @author SQUARE PHOENIX

* @param レベルが高い敵の経験値倍率
* @desc 敵のレベルがパーティーの最高レベルより高い場合、敵の経験値が[敵の経験値] x [この値]になります。
* @default 2

* @help
* 敵のレベルがパーティーの最高レベルより高い場合、
* 敵の経験値が倍増されます。
* 敵のメモに<lv:77>のように書くと、敵のレベルを設定できます。　
* 書かない場合は0とみなされます。
*
* RPGツクールMVで使用する場合は、ご自由にお使いいただけます。
* 自己責任でお使いください。
* [SQUARE PHOENIX] : http://enix.web.fc2.com/
 */


(function() {
    'use strict';
  	var param = PluginManager.parameters('Exp_change');
    var bai_exp = Number(param['レベルが高い敵の経験値倍率'])||0;
    //=============================================================================
    // 敵の経験値を取得。　敵のレベルが高いと経験値が倍増されます。
    //=============================================================================
    Game_Enemy.prototype.exp = function() {
      var menber_max_lv = [];

      for(var i=0; i <= $gameParty.members().length-1;i++){
      menber_max_lv.push($gameParty.members()[i]._level);
      }

      if (typeof this.enemy().meta['lv'] === "undefined") {
        var enemy_lv = 0;
      }else{
        var enemy_lv = this.enemy().meta['lv'];
      }

      if(Math.max.apply(null, menber_max_lv) < enemy_lv){
        return (this.enemy().exp)*bai_exp;//倍増される場合
      }else{
        return this.enemy().exp;//倍増されない場合
      }
    };
})();
