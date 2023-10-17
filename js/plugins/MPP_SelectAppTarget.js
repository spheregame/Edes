//=============================================================================
// MPP_SelectAppTarget.js
//=============================================================================
// Copyright (c) 2017 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.1】アイテム/スキルを使用する際、適切な対象にカーソルを合わせます。
 * @author 木星ペンギン
 *
 * @help ●MPP_ActiveTimeBattle.js(アクティブタイムバトル)と併用する際、
 *   こちらのプラグインが下に来るように導入してください。
 * 
 * ●HPを回復するアイテム/スキルはHPが少ないキャラを
 *   MPを回復するアイテム/スキルはMPが少ないキャラを
 *   使用効果が設定されているアイテム/スキルは効果のあるキャラを対象とします。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Heal Target Type
 * @type number
 * @max 2
 * @desc HP/MP回復の対象
 * (0:現在値が少ない, 1:割合が少ない, 2:減ってる値が多い)
 * @default 2
 *
 * 
 */

(function() {

var MPPlugin = {};

(function() {
    
    var parameters = PluginManager.parameters('MPP_SelectAppTarget');
    
    MPPlugin.HealTargetType = Number(parameters['Heal Target Type'] || 0);
    
})();

var Alias = {};

//-----------------------------------------------------------------------------
// Game_Action

Game_Action.prototype.appActorIndex = function() {
    if (this.isForUser()) return this.subject().index();
    if (!this.needsSelection()) return 0;
    var actors = $gameParty.members().filter(function(actor) {
        return (this.isForDeadFriend() === actor.isDead() &&
                (this.isHpRecover() && actor.hp < actor.mhp) ||
                (this.isMpRecover() && actor.mp < actor.mmp) ||
                (this.hasItemAnyValidEffects(actor)));
    }, this);
    if (actors.length === 0) return 0;
    if (this.isHpRecover() || this.someEffect(Game_Action.EFFECT_RECOVER_HP)) {
        actors.sort(Game_Action.compareHp);
    } else if (this.isMpRecover() || this.someEffect(Game_Action.EFFECT_RECOVER_MP)) {
        actors.sort(Game_Action.compareMp);
    }
    return actors[0].index();
};

Game_Action.compareHp = function(a, b) {
    var result = 0;
    if (MPPlugin.HealTargetType === 0) {
        result = a.hp - b.hp;
    } else if (MPPlugin.HealTargetType === 1) {
        result = a.hpRate() - b.hpRate();
    } else if (MPPlugin.HealTargetType === 2) {
        result = (b.mhp - b.hp) - (a.mhp - a.hp);
    }
    return (result !== 0 ? result : a.index() - b.index());
};

Game_Action.compareMp = function(a, b) {
    var result = 0;
    if (MPPlugin.HealTargetType === 0) {
        result = a.mp - b.mp;
    } else if (MPPlugin.HealTargetType === 1) {
        result = a.mpRate() - b.mpRate();
    } else if (MPPlugin.HealTargetType === 2) {
        result = (b.mmp - b.mp) - (a.mmp - a.mp);
    }
    return (result !== 0 ? result : a.index() - b.index());
};

Game_Action.prototype.someEffect = function(code) {
    return this.item().effects.some(function(effect) {
        return effect.code === code;
    });
};

//-----------------------------------------------------------------------------
// Scene_Battle

//64
Alias.ScItBa_determineItem = Scene_ItemBase.prototype.determineItem;
Scene_ItemBase.prototype.determineItem = function() {
    Alias.ScItBa_determineItem.call(this);
    var action = new Game_Action(this.user());
    action.setItemObject(this.item());
    if (action.isForFriend()) {
        this._actorWindow.select(action.appActorIndex());
    }
};

//-----------------------------------------------------------------------------
// Scene_Battle

//299
Alias.ScBa_selectActorSelection = Scene_Battle.prototype.selectActorSelection;
Scene_Battle.prototype.selectActorSelection = function() {
    Alias.ScBa_selectActorSelection.call(this);
    var action = BattleManager.inputtingAction();
    this._actorWindow.select(action.appActorIndex());
};






})();
