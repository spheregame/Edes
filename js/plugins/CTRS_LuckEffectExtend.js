/*:
@author
シトラス

@plugindesc
命中、回避、クリティカル率、逃走率、アイテムドロップ率、状態変化にかかる確率を
再計算するプラグインです。

@param criticalEval
@desc
クリティカルヒットの割合を算出する計算式です
@default
a.cri * (1 - b.cev)
@type string

@param physicalHitEval
@desc
物理攻撃の命中率を算出する計算式です
@default
item.successRate * 0.01 * a.hit
@type string

@param magicalHitEval
@desc
魔法攻撃の命中率を算出する計算式です
@default
item.successRate * 0.01
@type string

@param certainHitEval
@desc
必中攻撃の命中率を算出する計算式です
@default
item.successRate * 0.01
@type string

@param physicalEvasionEval
@desc
物理回避率を算出する計算式です
@default
b.eva
@type string

@param magicalEvasionEval
@desc
魔法回避率を算出する計算式です
@default
b.mev
@type string

@param certainEvasionEval
@desc
必中攻撃に対する回避率を算出する計算式です
@default
0
@type string

@param escapeEval
@desc
逃走率を算出する計算式です
@default
0.5 * $gameParty.agility() / $gameTroop.agility()
@type string

@param addEscapeEval
@desc
逃走失敗したときに増える逃走率を算出する計算式です
@default
0.1
@type string

@param itemDropEval
@desc
敵からアイテムを取得する確率を算出する計算式です
@default
dir/deno
@type string

@param luckEffectRateEval
@desc
運による影響を算出する計算式です
@default
Math.max(1.0 + (a.luk - b.luk) * 0.001, 0.0)
@type string

@param addDebuffEval
@desc
相手を弱体化させる確率を算出する計算式です
@default
b.dr * ler
@type string

@param attackStateEval
@desc
通常攻撃で相手にステートを与える確率を算出する計算式です
@default
chance * a.asr * b.sr * ler
@type string

@param skillStateEval
@desc
スキルで相手にステートを与える確率を算出する計算式です
@default
chance * b.sr * ler
@type string

@help

スキルでステートを与える場合、必中の場合はステートを与える確率が
そのまま成功確率となります。
（コアスクリプトにおける元々の仕様）

使用できる変数値
chance
ステートを与える基礎確率

a.asr
attackStatesRateの略。攻撃側が通常攻撃によりステートを与える確率

b.sr
stateRateの略。防御側がステートを受ける確率

ler
lukEffectRateの略。運による影響を表す

b.dr
debuffRateの略。防御側が弱体化の影響を受ける確率

dir
dropItemRateの略。パーティ能力「アイテム入手率2倍」が有効であれば2に、
そうでなければ1になります。

deno
denominatorの略。データベースで設定したアイテム入手率です。

$gameParty.luck()
パーティ全体の運の平均値

$gameTroop.luck()
敵グループの運の平均値

2017/11/7 ver 1.1.0
ヘルプの文章を変更
ステートの付与が必ず
失敗していたバグを修正

2017/10/27 ver 1.0.0
公開

このプラグインにプラグインコマンドはありません
このプラグインはＭＩＴライセンスに基づいて公開しています
https://ja.osdn.net/projects/opensource/wiki/licenses%2FMIT_license
*/

//即時間数で囲む
(function(){
	
	var pluginName = 'CTRS_LuckEffectExtend';
	Game_Action.prototype.extraEval = function(target,evalString){
		//自分の能力値
		var a = this.subject();
		//相手の能力値
		var b = target;
		//変数を取得
		var v = $gameVariables._data;
		//スイッチを取得
		var s = $gameSwitches._data;
		//運の影響を取得
		var ler = this.lukEffectRate(target);
		//スキルやアイテムそのものの情報
		var item = this.item();
		//計算結果
		var result = eval(evalString);
		//結果が数字でなければエラーを投げる
		if(isFinite(result) === false){
			throw new Error("結果が数字ではありません");
		}
		return result;
	};
	//クリティカル率の計算
	Game_Action.prototype.itemCri = function(target) {
		//クリティカルを出さないスキルか、バトラーのクリティカル率が0なら0を返す
		if(this.item().damage.critical === false || this.subject().cri === 0){
			return 0;
		}
		return this.extraEval(target,PluginManager.parameters(pluginName).criticalEval);
	};
	//命中率の計算
	Game_Action.prototype.itemHit = function(target) {
		if(this.isPhysical() ){
			return this.extraEval(target,PluginManager.parameters(pluginName).physicalHitEval);
		}
		if(this.isMagical() ){
			return this.extraEval(target,PluginManager.parameters(pluginName).magicalHitEval);
		}
		if(this.isCertainHit() ){
			return this.extraEval(target,PluginManager.parameters(pluginName).certainHitEval);
		}
		
	};
	//回避率の計算
	Game_Action.prototype.itemEva = function(target) {
		if (this.isPhysical() ) {
			return this.extraEval(target,PluginManager.parameters(pluginName).physicalEvasionEval);
		} else if (this.isMagical() ) {
			return this.extraEval(target,PluginManager.parameters(pluginName).magicalEvasionEval);
		} else {
			return this.extraEval(target,PluginManager.parameters(pluginName).certainEvasionEval);;
		}
	};
	//パーティの運の計算
	Game_Unit.prototype.luck = function(){
		var members = this.members();
		if (members.length === 0) {
			return 1;
		}
		var sum = members.reduce(function(r, member) {
			return r + member.luk;
		}, 0);
		return sum / members.length;
	};
	//逃走率の計算
	BattleManager.makeEscapeRatio = function() {
		var result = eval(PluginManager.parameters(pluginName).escapeEval);
		this._escapeRatio = result;
	};
	//逃走失敗したときに増える逃走確率
	BattleManager.addEscapeRatio = function(){
		var result = eval(PluginManager.parameters(pluginName).addEscapeEval);
		return result;
	};
	//逃走処理
	BattleManager.processEscape = function() {
		$gameParty.performEscape();
		SoundManager.playEscape();
		var success = this._preemptive ? true : (Math.random() < this._escapeRatio);
		if (success) {
			this.displayEscapeSuccessMessage();
			this._escaped = true;
			this.processAbort();
		} else {
			this.displayEscapeFailureMessage();
			this._escapeRatio += this.addEscapeRatio();
			$gameParty.clearActions();
			this.startTurn();
		}
		return success;
	};
	//アイテムドロップ率の計算
	Game_Enemy.prototype.makeDropItems = function() {
		return this.enemy().dropItems.reduce(function(r, di) {
			if (di.kind > 0) {
				//データベースで設定したアイテム取得率を取得
				var deno = di.denominator;
				//パーティのアイテムドロップ率を取得
				var dir = this.dropItemRate();
				//変数を取得
				var v = $gameVariables._data;
				if(Math.random() < eval(PluginManager.parameters(pluginName).itemDropEval) ){
					return r.concat(this.itemObject(di.kind, di.dataId));
				}else{
					return r;
				}
			} else {
				return r;
			}
		}.bind(this), []);
	};
	//ステート、デバフにかかる確率
	//通常攻撃によりステートを与える確率
	Game_Action.prototype.itemEffectAddAttackState = function(target, effect) {
		this.subject().attackStates().forEach(function(stateId) {
			//自分の能力値
			var a = this.subject();
			//自分が攻撃でステートを与える確率
			a.asr = this.subject().attackStatesRate(stateId);
			//相手の能力値
			var b = target;
			//相手がステートを受ける確率
			b.sr = target.stateRate(stateId);
			//運の影響を取得
			var ler = this.lukEffectRate(target);
			//変数を取得
			var v = $gameVariables._data;
			//スキルやアイテムそのものの情報
			var item = this.item();
			//相手にステートを与える基礎確率
			var chance = effect.value1;
			var result = eval(PluginManager.parameters(pluginName).attackStateEval);
			//結果が数字でなければエラーを投げる
			if(isFinite(result) === false){
				throw new Error("結果が数字ではありません");
			}
			if (Math.random() < result) {
				target.addState(stateId);
				this.makeSuccess(target);
			}
		}.bind(this), target);
	};
	
	//スキルによりステートを与える確率
	Game_Action.prototype.itemEffectAddNormalState = function(target, effect) {
		//必中であれば、スキルでステートを与える確率がそのままになる。
		//相手にステートを与える基礎確率
		var chance = effect.value1;
		var result = chance;
		if (!this.isCertainHit()) {
			//自分の能力値
			var a = this.subject();
			//相手の能力値
			var b = target;
			//相手がステートを受ける確率
			b.sr = target.stateRate(effect.dataId);
			//運の影響を取得
			var ler = this.lukEffectRate(target);
			//変数を取得
			var v = $gameVariables._data;
			//スキルやアイテムそのものの情報
			var item = this.item();
			result = eval(PluginManager.parameters(pluginName).skillStateEval);
			//結果が数字でなければエラーを投げる
			if(isFinite(result) === false){
				throw new Error("結果が数字ではありません");
			}
		}
		if (Math.random() < result) {
			target.addState(effect.dataId);
			this.makeSuccess(target);
		}
	};
	//スキルによりデバフを与える確率
	Game_Action.prototype.itemEffectAddDebuff = function(target, effect) {
		//自分の能力値
		var a = this.subject();
		//相手の能力値
		var b = target;
		//相手がデバフをを受ける確率
		b.dr = target.debuffRate(effect.dataId);
		//運の影響を取得
		var ler = this.lukEffectRate(target);
		//変数を取得
		var v = $gameVariables._data;
		//スキルやアイテムそのものの情報
		var item = this.item();
		//計算結果
		var chance = eval(PluginManager.parameters(pluginName).addDebuffEval);
		//結果が数字でなければエラーを投げる
		if(isFinite(chance) === false){
			throw new Error("結果が数字ではありません");
		}
		if (Math.random() < chance) {
			target.addDebuff(effect.dataId, effect.value1);
			this.makeSuccess(target);
		}
	};
	//運がもたらす効果
	Game_Action.prototype.lukEffectRate = function(target) {
		//変数を取得
		var v = $gameVariables._data;
		
		//スイッチを取得
		var s = $gameSwitches._data;
		
		//自分の能力値
		var a = this.subject();
		
		//相手の能力値
		var b = target;
		
		//スキルやアイテムそのものの情報
		var item = this.item();
		
		var result = eval(PluginManager.parameters(pluginName).luckEffectRateEval);
		//結果が数字でなければエラーを投げる
		if(isFinite(result) === false){
			throw new Error("結果が数字ではありません");
		}
		return result;
	};
})();