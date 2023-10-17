//=============================================================================
// WeaponSkill.js
//=============================================================================

/*:
 * @plugindesc Change skill id of attack for each weapon.
 * @author Sasuke KANNAZUKI
 *
 * @help This plugin does not provide plugin commands.
 *
 * When <skill_id:3> is written in a weapon's note field, 
 * skill id # 3 is used for the weapon's attack.
 * If nothing is written, default id(=1) is used.
 *
 * Check Points:
 * - When multiple weapons are equipped, the skill id of the weapon
 *  held in the dominant hand (previously defined) is used.
 * - It is most favorable for "skill type" to be "none"(=0),
 *  otherwise you cannot attack when your skill is blocked.
 *
 * Usage examples of this plugin:
 * - to create all-range weapons
 * - to create dual-attack or triple-attack weapons
 * - If healing skill is set when actor attacks, you can choose a friend to heal.
 * - It is possible to make a weapon that functions similar to a guard command. 
 */

/*:ja
 * @plugindesc 武器ごとに通常攻撃のスキルIDを変更します。の防御コマンド版
 * @author すふぃあ original by神無月サスケ
 *
 * @help このプラグインにはプラグインコマンドはありません。
 *
 *  アクターの「メモ」欄に、<guard_id:3> と書いた場合、
 * 防御の際、3番のスキルが発動します。
 * ※特に記述がなければ、通常通り2番のスキルが採用されます。
 *
 */

(function() {

  //
  // set skill id for attack.
  //
  Game_Actor.prototype.guardSkillId = function() {
    var normalId = Game_BattlerBase.prototype.guardSkillId.call(this);
    if(this.hasNoWeapons()){
      return normalId;
    }
    //var weapon = this.weapons()[0];  // at plural weapon, one's first skill.
    var actor = this.actor();  // at plural weapon, one's first skill.
    var id = actor.meta.guard_id;
    return id ? Number(id) : normalId;
  };

  //
  // for command at Guard
  //
  var _Scene_Battle_commandGuard = Scene_Battle.prototype.commandGuard;
  Scene_Battle.prototype.commandGuard = function() {
    BattleManager.inputtingAction().setGuard();
    // normal attack weapon (or other single attack weapon)
    var action = BattleManager.inputtingAction();
    if(action.needsSelection() && action.isForOpponent()){
      _Scene_Battle_commandGuard.call(this);
      return;
    }
    // special skill weapon
    this.onSelectAction();
  };

})();

