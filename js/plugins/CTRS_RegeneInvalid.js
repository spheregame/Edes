/*:
@author
シトラス

@plugindesc
自動回復を無効化し、スリップダメージのみにする
状態にできます。

@help
ステート、アクター、エネミー、職業、装備のメモ欄に
<HpRegeneInvalid>、<MpRegeneInvalid>、<TpRegeneInvalid>と書き込むと
これらの値が自動回復するのを無効化し、減少の部分のみ
反映されるようになります。

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
	var _Game_BattlerBase_traitsSum = Game_BattlerBase.prototype.traitsSum;
	Game_BattlerBase.prototype.traitsSum = function(code, id) {
		if(id <= 6){
			return _Game_BattlerBase_traitsSum.call(this,code, id);
		}else{
			var regeneInvalid = false;
			var regeneValue = 0;
			if(id === 7 && this.isHpRegeneInvalid() ){
				regeneInvalid = true;
			}else if(id === 8 && this.isMpRegeneInvalid() ){
				regeneInvalid = true;
			}else if(id === 9 && this.isTpRegeneInvalid() ){
				regeneInvalid = true;
			}
			return this.traitsWithId(code, id).reduce(function(r, trait) {
				regeneValue = trait.value;
				//リジェネが無効にされていて、回復率が0以上ならば加算しない
				if(regeneInvalid && 0 < trait.value){
					regeneValue = 0;
				}
				return r + regeneValue;
			}, 0);
		}
	};
	
	//HPリジェネが無効化されるか
	Game_BattlerBase.prototype.isHpRegeneInvalid = function(){
		for(state of this.states() ){
			if(state.meta.HpRegeneInvalid){
				return true;
			}
		}
		return false;
	};
	Game_Actor.prototype.isHpRegeneInvalid = function(){
		if(Game_BattlerBase.prototype.isHpRegeneInvalid.call(this) ){
			return true;
		}
		//アクターのメモ欄から
		if(this.actor().meta.HpRegeneInvalid){
			return true;
		}
		//アクターの職業から
		if(this.currentClass().meta.HpRegeneInvalid){
			return true;
		}
		//アクターの装備から
		var equips = this.equips().sort();
		var i = 0;
		while(equips[i] !== null){
			if(equips[i].meta.HpRegeneInvalid){
				return true;
			}
			i++;
		}
		return false;
	};
	Game_Enemy.prototype.isHpRegeneInvalid = function(){
		if(Game_BattlerBase.prototype.isHpRegeneInvalid.call(this) ){
			return true;
		}
		return this.enemy().meta.HpRegeneInvalid !== undefined;
	};
	
	//MPリジェネが無効化されるか
	Game_BattlerBase.prototype.isMpRegeneInvalid = function(){
		for(state of this.states() ){
			if(state.meta.MpRegeneInvalid){
				return true;
			}
		}
		return false;
	}
	Game_Actor.prototype.isMpRegeneInvalid = function(){
		if(Game_BattlerBase.prototype.isMpRegeneInvalid.call(this) ){
			return true;
		}
		//アクターのメモ欄から
		if(this.actor().meta.MpRegeneInvalid){
			return true;
		}
		//アクターの職業から
		if(this.currentClass().meta.MpRegeneInvalid){
			return true;
		}
		//アクターの装備から
		var equips = this.equips().sort();
		var i = 0;
		while(equips[i] !== null){
			if(equips[i].meta.MpRegeneInvalid){
				return true;
			}
			i++;
		}
		return false;
	};
	Game_Enemy.prototype.isMpRegeneInvalid = function(){
		if(Game_BattlerBase.prototype.isMpRegeneInvalid.call(this) ){
			return true;
		}
		return this.enemy().meta.MpRegeneInvalid !== undefined;
	};
	
	//TPリジェネが無効化されるか
	Game_BattlerBase.prototype.isTpRegeneInvalid = function(){
		for(state of this.states() ){
			if(state.meta.TpRegeneInvalid){
				return true;
			}
		}
		return false;
	}
	Game_Actor.prototype.isTpRegeneInvalid = function(){
		if(Game_BattlerBase.prototype.isTpRegeneInvalid.call(this) ){
			return true;
		}
		//アクターのメモ欄から
		if(this.actor().meta.TpRegeneInvalid){
			return true;
		}
		//アクターの職業から
		if(this.currentClass().meta.TpRegeneInvalid){
			return true;
		}
		//アクターの装備から
		var equips = this.equips().sort();
		var i = 0;
		while(equips[i] !== null){
			if(equips[i].meta.TpRegeneInvalid){
				return true;
			}
			i++;
		}
		return false;
	};
	Game_Enemy.prototype.isTpRegeneInvalid = function(){
		if(Game_BattlerBase.prototype.isTpRegeneInvalid.call(this) ){
			return true;
		}
		return this.enemy().meta.TpRegeneInvalid !== undefined;
	};
})();