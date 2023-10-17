//=============================================================================
// MPP_SpecialFormBattle.js
//=============================================================================
// Copyright (c) 2018-2020 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.5】バックアタックやサイドアタックといった戦闘を作ることができます。
 * @author 木星ペンギン
 * 
 * @help 敵グループの名前:
 *   <Preemptive>              # 強制先制攻撃
 *   <Surprise>                # 強制不意打ち
 *   <Invert>                  # 左右反転
 *   <Same>                    # 敵後ろ向き
 *   <Back>                    # 味方後ろ向き
 *   <Side>                    # 味方のサイドアタック
 *   <Pincer>                  # 敵の挟み撃ち
 * 
 * アイテム/スキルのメモ欄:
 *   <narrow>                  # 対象の範囲をエリア化する
 * 
 * ================================================================
 * ▼ 敵グループの名前 詳細
 * --------------------------------
 *  〇 <Invert>
 *   味方が左側、敵が右側に配置されます。
 *   敵の位置は画面中央を軸とした線対称の位置に配置されます。
 * 
 * --------------------------------
 *  〇 <Side>
 *   味方が敵を挟む形で配置されます。
 *   配置は右側にパーティの１番目と3番目のアクター、
 *   左側に２番目と４番目のアクターとなります。
 *   
 *   敵は奇数番目の敵キャラが右向き、偶数番目の敵キャラが左向きとなります。
 *   位置の補正はありません。
 *   
 * --------------------------------
 *  〇 <Pincer>
 *   味方が画面中央に配置されます。
 *   パーティの奇数番目のアクターが左向き、偶数番目のアクターが右向きとなります。
 *   
 *   敵は画面中央より左の敵キャラが右向き、右側の敵キャラが左向きとなります。
 *   位置の補正はありません。
 *   
 *   左右どちらかの敵をせん滅しない限り逃走は行えません。
 *   アイテム/スキルによる逃走は、プラグインパラメータ[]にて設定できます。
 * 
 * 
 * ================================================================
 * ▼ アイテム/スキルのメモ欄 詳細
 * --------------------------------
 *  〇 <narrow>
 *   サイドアタックや挟み撃ちによって敵または味方が分断された場合、
 *   範囲が全体のアイテム/スキルの対象を片側のグループのみに絞ります。
 *   
 *   基本設定の範囲は全体に設定してください。
 *   
 *   戦闘中に対象を選択する際は、対象が複数のグループに分かれている場合は
 *   メインの対象を選ぶことになります。
 * 
 * 
 * ================================================================
 * ▼ プラグインパラメータ 詳細
 * --------------------------------
 *  〇 <Same> on Preemptive (先制攻撃時に[敵後ろ向き]を有効にするかどうか) /
 *     <Back> on Surprise (不意打ち時に[味方後ろ向き]を有効にするかどうか)
 *   
 *   通常の先制攻撃/不意打ちが対象となります。
 * 
 * 
 * ================================================================
 * ▼ その他
 * --------------------------------
 *  〇 MPP_CommonBattle.js(コモンバトル) プラグインと併用する場合、
 *    こちらのプラグインが下になるようにしてください。
 * 
 *  〇 MPP_CommonBattle_OP2.js(戦闘開始＆終了処理) プラグインとの併用は
 *    できません。
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 *
 * @param Back Attack State
 * @type state
 * @desc 背後から攻撃する際、対象に付与されるステート
 * @default 0
 *
 * @param <Same> on Preemptive
 * @type boolean
 * @desc 先制攻撃時に[敵後ろ向き]を有効にするかどうか
 * @default true
 *
 * @param <Back> on Surprise
 * @type boolean
 * @desc 不意打ち時に[味方後ろ向き]を有効にするかどうか
 * @default true
 *
 * @param Escape Item at <Pincer>
 * @type boolean
 * @desc 敵の挟み撃ち中に逃走アイテムを使えるようにするかどうか
 * @default true
 *
 * @param === Command ===
 * @default 【コマンド関連】
 * 
 * @param Used Item Metadata
 * @type struct<UsedItemMeta>
 * @desc アイテム/スキルのメモ欄のデータ名
 * @default {"narrow":"narrow"}
 * @parent === Command ===
 *
 * @param Troop Metadata
 * @type struct<TroopMeta>
 * @desc 敵グループの名前のデータ名
 * @default {"Preemptive":"Preemptive","Surprise":"Surprise","Invert":"Invert","Same":"Same","Back":"Back","Side":"Side","Pincer":"Pincer"}
 * @parent === Command ===
 *
 *
 * 
 *
 */

/*~struct~UsedItemMeta:
 * @param narrow
 * @desc 対象の範囲をエリア化する
 * @default narrow
 *
 */

/*~struct~TroopMeta:
 * @param Preemptive
 * @desc 強制先制攻撃
 * @default Preemptive
 *
 * @param Surprise
 * @desc 強制不意打ち
 * @default Surprise
 *
 * @param Invert
 * @desc 左右反転
 * @default Invert
 *
 * @param Same
 * @desc 敵後ろ向き
 * @default Same
 *
 * @param Back
 * @desc 味方後ろ向き
 * @default Back
 *
 * @param Side
 * @desc 味方のサイドアタック
 * @default Side
 *
 * @param Pincer
 * @desc 敵の挟み撃ち
 * @default Pincer
 *
 */

(function() {

var MPPlugin = {};

(function() {
    
    MPPlugin.contains = {};
    MPPlugin.contains.ActInt = $plugins.some(function(plugin) {
        return (plugin.name === 'MPP_ActionInterpreter' && plugin.status);
    });
    
    var parameters = PluginManager.parameters('MPP_SpecialFormBattle');
    
    MPPlugin.BackAttackState = Number(parameters['Back Attack State'] || 0);
    MPPlugin.SameOnPreemptive = !!eval(parameters['<Same> on Preemptive']);
    MPPlugin.BackOnSurprise = !!eval(parameters['<Back> on Surprise']);
    MPPlugin.EscapeItemAtPincer = !!eval(parameters['Escape Item at <Pincer>']);
    
    //=== Command ===
    MPPlugin.UsedItemMetadata = JSON.parse(parameters['Used Item Metadata'] || "{}");
    MPPlugin.TroopMetadata = JSON.parse(parameters['Troop Metadata'] || "{}");
   
})();

var Alias = {};

//-----------------------------------------------------------------------------
// BattleManager

BattleManager.makeEscapeRatio = function() {
    this._escapeRatio = 1;
};

BattleManager.makeBattleForm = function() {
    var troopName = $gameTroop.troop().name;
    var metaName = MPPlugin.TroopMetadata.Invert || 'Invert';
    this.invert = troopName.contains(metaName);
    metaName = MPPlugin.TroopMetadata.Same || 'Same';
    this.same = this._preemptive && MPPlugin.SameOnPreemptive;
    this.same = this.same || troopName.contains(metaName);
    metaName = MPPlugin.TroopMetadata.Back || 'Back';
    this.back = this._surprise && MPPlugin.BackOnSurprise;
    this.back = this.back || troopName.contains(metaName);
    metaName = MPPlugin.TroopMetadata.Side || 'Side';
    this.side = troopName.contains(metaName);
    metaName = MPPlugin.TroopMetadata.Pincer || 'Pincer';
    this.pincer = troopName.contains(metaName);
    
    metaName = MPPlugin.TroopMetadata.Preemptive || 'Preemptive';
    this._preemptive = this._preemptive || troopName.contains(metaName);
    metaName = MPPlugin.TroopMetadata.Surprise || 'Surprise';
    this._surprise = this._surprise || troopName.contains(metaName);
};

//189
Alias.BaMa_canEscape = BattleManager.canEscape;
BattleManager.canEscape = function() {
    return Alias.BaMa_canEscape.apply(this, arguments) && $gameParty.canEscape_mppSFB();
};

//377
Alias.BaMa_startAction = BattleManager.startAction;
BattleManager.startAction = function() {
    Alias.BaMa_startAction.apply(this, arguments);
    this._subject.performTurnTarget(this._targets[0]);
};

//399
Alias.BaMa_endAction = BattleManager.endAction;
BattleManager.endAction = function() {
    Alias.BaMa_endAction.apply(this, arguments);
    this.allBattleMembers().forEach(function(battler) {
        battler.eraseState(MPPlugin.BackAttackState);
        battler._actionDirection = 0;
    });
};

//404
Alias.BaMa_invokeAction = BattleManager.invokeAction;
BattleManager.invokeAction = function(subject, target) {
    if (subject.isActor() !== target.isActor()) {
        var subjectX = subject.screenX();
        var targetX = target.screenX();
        if ((target.mppDirection() < 0 && targetX < subjectX) ||
                (target.mppDirection() > 0 && targetX > subjectX)) {
            target.addNewState(MPPlugin.BackAttackState);
            target._actionDirection = -target.mppDirection();
        }
    }
    Alias.BaMa_invokeAction.apply(this, arguments);
};

//-----------------------------------------------------------------------------
// Game_Action

Game_Action.prototype.isNarrow = function() {
    var name = MPPlugin.UsedItemMetadata.narrow || 'narrow';
    if (this.item().meta[name]) {
        var unit;
        if (this.isForOpponent()) {
            unit = this.opponentsUnit();
        } else {
            unit = this.friendsUnit();
        }
        return unit.groups_mppSfb().length > 1;
    }
    return false;
};

//151
Alias.GaAction_needsSelection = Game_Action.prototype.needsSelection;
Game_Action.prototype.needsSelection = function() {
    return (Alias.GaAction_needsSelection.apply(this, arguments) ||
            this.isNarrow());
};

//301
Alias.GaAction_targetsForOpponents = Game_Action.prototype.targetsForOpponents;
Game_Action.prototype.targetsForOpponents = function() {
    if (this.isNarrow()) {
        var target;
        var unit = this.opponentsUnit();
        if (this._targetIndex < 0) {
            target = unit.randomTarget();
        } else {
            target = unit.smoothTarget(this._targetIndex);
        }
        return unit.includeGroup_mppSfb(target);
    }
    return Alias.GaAction_targetsForOpponents.apply(this, arguments);
};

//320
Alias.GaAction_targetsForFriends = Game_Action.prototype.targetsForFriends;
Game_Action.prototype.targetsForFriends = function() {
    if (this.isNarrow()) {
        var target;
        var unit = this.friendsUnit();
        if (this._targetIndex < 0) {
            target = unit.randomTarget();
        } else {
            target = unit.smoothTarget(this._targetIndex);
        }
        return unit.includeGroup_mppSfb(target);
    }
    return Alias.GaAction_targetsForFriends.apply(this, arguments);
};

//343
Alias.GaAction_evaluate = Game_Action.prototype.evaluate;
Game_Action.prototype.evaluate = function() {
    if (this.isNarrow()) {
        var value = 0;
        this.itemTargetGroupsCandidates().forEach(function(group) {
            if (group.length > 0) {
                var groupValue = 0;
                for (var i = 0; i < group.length; i++) {
                    groupValue += this.evaluateWithTarget(group[i]);
                }
                if (groupValue > value) {
                    value = groupValue;
                    this._targetIndex = group[0].index();
                }
            }
        }, this);
        value *= this.numRepeats();
        if (value > 0) {
            value += Math.random();
        }
        return value;
    } else {
        return Alias.GaAction_evaluate.apply(this, arguments);
    }
};

Game_Action.prototype.itemTargetGroupsCandidates = function() {
    var groups;
    if (!this.isValid()) {
        groups = [];
    } else if (this.isForOpponent()) {
        groups = this.opponentsUnit().groups_mppSfb();
    } else if (this.isForDeadFriend()) {
        groups = this.friendsUnit().groups_mppSfb();
        for (var i = 0; i < groups.length; i++) {
            groups[i] = groups[i].filter(function(battler) {
                return battler.isDead();
            });
        }
    } else {
        groups = this.friendsUnit().groups_mppSfb();
        for (var i = 0; i < groups.length; i++) {
            groups[i] = groups[i].filter(function(battler) {
                return battler.isAlive();
            });
        }
    }
    return groups;
};

//-----------------------------------------------------------------------------
// Game_Battler

//419
Alias.GaBa_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function() {
    Alias.GaBa_onBattleStart.apply(this, arguments);
    this.setupSpForm();
    this._actionDirection = 0;
};

Game_Battler.prototype.isMirror = function() {
    return false;
};

Game_Battler.prototype.setupSpForm = function() {
    this.setDirection(this.startDirection());
};

Game_Battler.prototype.startDirection = function() {
    return 1;
};

Game_Battler.prototype.setDirection = function(direction) {
    this._mppDirection = direction;
};

Game_Battler.prototype.mppDirection = function() {
    return this._mppDirection;
};

Game_Battler.prototype.performTurnTarget = function(target) {
    if (target && this.isActor() !== target.isActor()) {
        if (this.screenX() < target.screenX()) {
            this.setDirection(1);
        } else if (this.screenX() > target.screenX()) {
            this.setDirection(-1);
        }
    }
};

//511
Alias.GaBa_performDamage = Game_Battler.prototype.performDamage;
Game_Battler.prototype.performDamage = function() {
    Alias.GaBa_performDamage.apply(this, arguments);
    if (this._actionDirection)
        this.setDirection(this._actionDirection);
};

//-----------------------------------------------------------------------------
// Game_Actor

Game_Actor.prototype.isMirror = function() {
    return this._mppDirection === 1;
};

Game_Actor.prototype.startDirection = function() {
    var d = BattleManager.invert ? 1 : -1;
    if (BattleManager.side || BattleManager.pincer) {
        if (this.index() % 2 === 1) d *= -1;
    }
    if (BattleManager.back) d *= -1;
    return d;
};

Game_Actor.prototype.screenX = function() {
    return this._screenX || 0;
};

//888
Alias.GaAc_meetsUsableItemConditions = Game_Actor.prototype.meetsUsableItemConditions;
Game_Actor.prototype.meetsUsableItemConditions = function(item) {
    if (!MPPlugin.EscapeItemAtPincer && $gameParty.inBattle() &&
            BattleManager.pincer && this.escapeDirection() === 0 &&
            this.testEscape(item)) {
        return false;
    }
    return Alias.GaAc_meetsUsableItemConditions.apply(this, arguments);
};

Game_Actor.prototype.escapeDirection = function() {
    var enemies = $gameTroop.aliveMembers();
    var left = false;
    var right = false;
    var x = this.screenX();
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].screenX() < x) {
            left = true;
        } else {
            right = true;
        }
    }
    return (left === right ? 0 : left ? 1 : -1);
};

//-----------------------------------------------------------------------------
// Game_Enemy

Game_Enemy.prototype.isMirror = function() {
    return this._mppDirection === -1;
};

Game_Enemy.prototype.startDirection = function() {
    var d = BattleManager.invert ? -1 : 1;
    if (BattleManager.side) {
        if (this.index() % 2 === 1) d *= -1;
    } else if (BattleManager.pincer) {
        if (Graphics.width / 2 < this._screenX) d *= -1;
    }
    if (BattleManager.same) d *= -1;
    return d;
};

//-----------------------------------------------------------------------------
// Game_Unit

Game_Unit.prototype.groups_mppSfb = function() {
    var allBattler = BattleManager.allBattleMembers().sort(function(a, b) {
        return a.screenX() - b.screenX();
    });
    var result = [];
    var index = -1;
    var lastInclude = false;
    for (var i = 0; i < allBattler.length; i++) {
        var battler = allBattler[i];
        if (this.include_mppSfb(battler)) {
            if (!lastInclude) {
                result.push([]);
                index++;
            }
            result[index].push(battler);
            lastInclude = true;
        } else {
            lastInclude = false;
        }
    }
    return result;
};

Game_Unit.prototype.include_mppSfb = function(battler) {
    return true;
};

Game_Unit.prototype.includeGroup_mppSfb = function(battler) {
    var groups = this.groups_mppSfb();
    for (var i = 0; i < groups.length; i++) {
        if (groups[i].contains(battler))
            return groups[i];
    }
    return [];
};

Game_Unit.prototype.setNarrow = function(narrow) {
    this._sfbNarrow = narrow;
};

//125
Alias.GaUn_select = Game_Unit.prototype.select;
Game_Unit.prototype.select = function(activeMember) {
    if (this._sfbNarrow) {
        var group = this.includeGroup_mppSfb(activeMember);
        this.members().forEach(function(member) {
            if (group.contains(member)) {
                member.select();
            } else {
                member.deselect();
            }
        });
    } else {
        Alias.GaUn_select.apply(this, arguments);
    }
};

//-----------------------------------------------------------------------------
// Game_Party

Game_Party.prototype.canEscape_mppSFB = function() {
    return this.members().some(function(actor) {
        return actor.escapeDirection() !== 0;
    });
};

Game_Party.prototype.include_mppSfb = function(battler) {
    return battler.isActor();
};

//-----------------------------------------------------------------------------
// Game_Troop

Game_Troop.prototype.include_mppSfb = function(battler) {
    return battler.isEnemy();
};


//-----------------------------------------------------------------------------
// Sprite_Battler

//63
Alias.SpBat_updateMain = Sprite_Battler.prototype.updateMain;
Sprite_Battler.prototype.updateMain = function() {
    Alias.SpBat_updateMain.apply(this, arguments);
    if (this._battler.isSpriteVisible()) {
        this.updateDirection();
    }
};

Sprite_Battler.prototype.updateDirection = function() {
    if (!MPPlugin.contains.ActInt) {
        if ((this.isMirror() && this.scale.x > 0) ||
                (!this.isMirror() && this.scale.x < 0)) {
            this.scale.x *= -1;
        }
    }
};

Sprite_Battler.prototype.isMirror = function() {
    return this._battler.isMirror();
};

//-----------------------------------------------------------------------------
// Sprite_Actor

//78
Alias.SpAc_setBattler = Sprite_Actor.prototype.setBattler;
Sprite_Actor.prototype.setBattler = function(battler) {
    if (!this._battler && battler) {
        if (BattleManager.pincer) {
            this.startMove(0, 0, 0);
        } else {
            var d = battler.startDirection();
            if (BattleManager.back) d *= -1;
            if (d === 1) this.startMove(-300, 0, 0);
        }
    }
    Alias.SpAc_setBattler.apply(this, arguments);
};

//95
Alias.SpAc_setActorHome = Sprite_Actor.prototype.setActorHome;
Sprite_Actor.prototype.setActorHome = function(index) {
    Alias.SpAc_setActorHome.apply(this, arguments);
    if (BattleManager.invert) {
        this.setHome(Graphics.width - this._homeX, this._homeY);
    }
    if (BattleManager.side) {
        var homeX = this._homeX;
        homeX += Math.floor((4 - index) / 2) * 32;
        if (index % 2 === 1) {
            homeX = Graphics.width - homeX;
        }
        this.setHome(homeX, this._homeY);
    }
    if (BattleManager.pincer) {
        this.setHome(Graphics.width / 2, this._homeY);
    }
};

if (Sprite_Actor.prototype.hasOwnProperty('setHome')) {
    Alias.SpAc_setHome = Sprite_Actor.prototype.setHome;
}
Sprite_Actor.prototype.setHome = function(x, y) {
    if (Alias.SpAc_setHome) {
        Alias.SpAc_setHome.apply(this, arguments);
    } else {
        Sprite_Battler.prototype.setHome.apply(this, arguments);
    }
    this._actor._screenX = x;
};

//248
Alias.SpAc_stepForward = Sprite_Actor.prototype.stepForward;
Sprite_Actor.prototype.stepForward = function() {
    if (this.isMirror()) {
        this.startMove(48, 0, 12);
    } else {
        Alias.SpAc_stepForward.apply(this, arguments);
    }
};

//256
Alias.SpAc_retreat = Sprite_Actor.prototype.retreat;
Sprite_Actor.prototype.retreat = function() {
    var d = this._actor.escapeDirection();
    if (d !== 0) this._actor.setDirection(-d);
    if (BattleManager.pincer) {
        if (this.isMirror()) {
            this.startMove(-500, 0, 50);
        } else {
            this.startMove(500, 0, 50);
        }
    } else {
        if (this.isMirror()) {
            this.startMove(-300, 0, 30);
        } else {
            Alias.SpAc_retreat.apply(this, arguments);
        }
    }
};

//-----------------------------------------------------------------------------
// Sprite_StateIcon

//37
Alias.SpStIc_update = Sprite_StateIcon.prototype.update;
Sprite_StateIcon.prototype.update = function() {
    Alias.SpStIc_update.apply(this, arguments);
    if (this._battler) {
        this.scale.x = this._battler.isMirror() ? -1 : 1;
    }
};

//-----------------------------------------------------------------------------
// Window_BattleLog

//228
Alias.WiBaLo_showAnimation = Window_BattleLog.prototype.showAnimation;
Window_BattleLog.prototype.showAnimation = function(subject, targets, animationId) {
    if (animationId < 0) {
        Alias.WiBaLo_showAnimation.apply(this, arguments);
    } else {
        this.showNormalAnimation(targets, animationId, subject.isMirror());
    }
};

//244
Window_BattleLog.prototype.showActorAttackAnimation = function(subject, targets) {
    var mirror = subject.isMirror();
    this.showNormalAnimation(targets, subject.attackAnimationId1(), mirror);
    this.showNormalAnimation(targets, subject.attackAnimationId2(), !mirror);
};

//-----------------------------------------------------------------------------
// Window_BattleActor

//21
Alias.WiBaAc_show = Window_BattleActor.prototype.show;
Window_BattleActor.prototype.show = function() {
    var action = BattleManager.inputtingAction();
    $gameParty.setNarrow(action.isNarrow());
    Alias.WiBaAc_show.apply(this, arguments);
};

//26
Alias.WiBaAc_hide = Window_BattleActor.prototype.hide;
Window_BattleActor.prototype.hide = function() {
    Alias.WiBaAc_hide.apply(this, arguments);
    $gameParty.setNarrow(false);
};

//atb
Window_BattleActor.prototype.selectForItem = function() {
    var actor = BattleManager.actor();
    var action = actor.inputtingAction();
    this.setCursorFixed(false);
    this.setCursorAll(false);
    if (action.isForUser()) {
        this.setCursorFixed(true);
        this.select(actor.index());
    } else if (action.isForAll() && !action.isNarrow()) {
        this.setCursorAll(true);
        this.select(0);
    } else {
        this.select(actor.index());
    }
};

//-----------------------------------------------------------------------------
// Window_BattleEnemy

//21
Alias.WiBaEn_show = Window_BattleEnemy.prototype.show;
Window_BattleEnemy.prototype.show = function() {
    var action = BattleManager.inputtingAction();
    $gameTroop.setNarrow(action.isNarrow());
    Alias.WiBaEn_show.apply(this, arguments);
};

//26
Alias.WiBaEn_hide = Window_BattleEnemy.prototype.hide;
Window_BattleEnemy.prototype.hide = function() {
    Alias.WiBaEn_hide.apply(this, arguments);
    $gameTroop.setNarrow(false);
};

//atb
Window_BattleEnemy.prototype.selectForItem = function() {
    var actor = BattleManager.actor();
    var action = actor.inputtingAction();
    this.setCursorAll(false);
    if (action.isForAll() && !action.isNarrow())
        this.setCursorAll(true);
    this.select(0);
};

//-----------------------------------------------------------------------------
// Scene_Battle

//17
Alias.ScBat_create = Scene_Battle.prototype.create;
Scene_Battle.prototype.create = function() {
    BattleManager.makeBattleForm();
    Alias.ScBat_create.apply(this, arguments);
};









})();
