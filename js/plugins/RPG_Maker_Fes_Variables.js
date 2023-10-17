//=============================================================================
// RPG_Maker_Fes_Variables.js
//=============================================================================

/*:
 * @plugindesc 武器、防具、敵キャラの能力値に変数を利用可能にします。
 * @author 村人C
 *
 * @help
 *
 * 使い方
 * プラグインコマンド：
 * Actor_Variables アクターID 変数ID
 *
 * 例： Actor_Variables 1 10
 * アクターID １番のステータスを変数１０番から＋８番目までに代入します。
 * 代入されるステータスは装備の能力値も含まれます。 
 *
 * メモ欄：
 * 武器、防具、敵キャラの「メモ」欄に、記述します。
 * x には、使用したい変数番号を入れて下さい。
 * 変数番号１番を使用したい場合は <〇〇_variables:1> の様にして下さい。
 *
 * 最大ＨＰ：
 * <hp_variables:x>
 * 最大ＭＰ：
 * <mp_variables:x>
 * 攻撃力：
 * <atk_variables:x>
 * 防御力：
 * <def_variables:x>
 * 魔法力：
 * <mat_variables:x>
 * 魔法防御力：
 * <mdf_variables:x>
 * 敏捷性：
 * <agi_variables:x>
 * 運：
 * <luk_variables:x>
 *
 * 敵キャラ限定(変数は使用しません)
 * 反転：
 * <mirror>
 *
 *
 * readmeやスタッフロールの明記、使用報告は任意
 * 
 */


(function() {
	// プラグインコマンド
	var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        switch(command) {
            case 'Actor_Variables':
                var a = Number(args[0]);
                var v = Number(args[1]);
				for (var i = 0; i < 8; i++) {
					$gameVariables.setValue(v+i, $gameActors.actor(a).param(i));
				}
                break;
        }
    };
	// 通常能力値の加算値取得
	Game_Actor.prototype.paramPlus = function(paramId) {
		var value = Game_Battler.prototype.paramPlus.call(this, paramId);
		var equips = this.equips();
		for (var i = 0; i < equips.length; i++) {
			var item = equips[i];
			if (item) {
				switch(paramId) {
					case 0:
						// 最大ＨＰ：
						if (item.meta.hp_variables) {
							value += $gameVariables.value(item.meta.hp_variables);
						} else { value += item.params[paramId]; }
						break;
					case 1:
						// 最大ＭＰ：
						if (item.meta.mp_variables) {
							value += $gameVariables.value(item.meta.mp_variables);
						} else { value += item.params[paramId]; }
						break;
					case 2:
						// 攻撃力：
						if (item.meta.atk_variables) {
							value += $gameVariables.value(item.meta.atk_variables);
						} else { value += item.params[paramId]; }
						break;
					case 3:
						// 防御力：
						if (item.meta.def_variables) {
							value += $gameVariables.value(item.meta.def_variables);
						} else { value += item.params[paramId]; }
						break;
					case 4:
						// 魔法力：
						if (item.meta.mat_variables) {
							value += $gameVariables.value(item.meta.mat_variables);
						} else { value += item.params[paramId]; }
						break;
					case 5:
						// 魔法防御力：
						if (item.meta.mdf_variables) {
							value += $gameVariables.value(item.meta.mdf_variables);
						} else { value += item.params[paramId]; }
						break;
					case 6:
						// 敏捷性：
						if (item.meta.agi_variables) {
							value += $gameVariables.value(item.meta.agi_variables);
						} else { value += item.params[paramId]; }
						break;
					case 7:
						// 運：
						if (item.meta.luk_variables) {
							value += $gameVariables.value(item.meta.luk_variables);
						} else { value += item.params[paramId]; }
						break;
						
				}
			}
		}
		return value;
	};
	// 通常能力値の基本値取得
	Game_Enemy.prototype.paramBase = function(paramId) {
		switch(paramId) {
			case 0:
				// 最大ＨＰ：
				if (this.enemy().meta.hp_variables) {
					return $gameVariables.value(this.enemy().meta.hp_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
			case 1:
				// 最大ＭＰ：
				if (this.enemy().meta.mp_variables) {
					return $gameVariables.value(this.enemy().meta.mp_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
			case 2:
				// 攻撃力：
				if (this.enemy().meta.atk_variables) {
					return $gameVariables.value(this.enemy().meta.atk_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
			case 3:
				// 防御力：
				if (this.enemy().meta.def_variables) {
					return $gameVariables.value(this.enemy().meta.def_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
			case 4:
				// 魔法力：
				if (this.enemy().meta.mat_variables) {
					return $gameVariables.value(this.enemy().meta.mat_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
			case 5:
				// 魔法防御力：
				if (this.enemy().meta.mdf_variables) {
					return $gameVariables.value(this.enemy().meta.mdf_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
			case 6:
				// 敏捷性：
				if (this.enemy().meta.agi_variables) {
					return $gameVariables.value(this.enemy().meta.agi_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
			case 7:
				// 運：
				if (this.enemy().meta.luk_variables) {
					return $gameVariables.value(this.enemy().meta.luk_variables);
				} else {  return this.enemy().params[paramId]; }
				break;
		}
	};
	// 反転：
	Sprite_Enemy.prototype.updateBitmap = function() {
		Sprite_Battler.prototype.updateBitmap.call(this);
		var name = this._enemy.battlerName();
		var hue = this._enemy.battlerHue();
		if (this._battlerName !== name || this._battlerHue !== hue) {
			this._battlerName = name;
			this._battlerHue = hue;
			this.loadBitmap(name, hue);
			if ($dataEnemies[this._enemy._enemyId].meta.mirror) {
				this.x *= -1;
				this.scale.x *= -1;
			}
			this.initVisibility();
		}
	};
})();