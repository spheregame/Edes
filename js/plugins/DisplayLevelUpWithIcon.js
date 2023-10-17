//============================================================================
// DisplayLevelUpWithIcon.js
//============================================================================
/*:
 * @plugindesc Display learned skill name at level up with icon
 * @author Sasuke KANNAZUKI
 *
 * @help
 * This plugin does not provide plugin commands.
 *
 * [Important Note]
 * This plugin overwrites the routine of level up display method.
 * So, this plugin cannot use with another level up displaying plugin.
 * ex. DisplayOnlyAddedSkillType.js the KADOKAWA plugin.
 *
 * [License]
 * this plugin is released under MIT license.
 * http://opensource.org/licenses/mit-license.php
 */

/*:ja
 * @plugindesc レベルアップ時に覚えるスキル名の前にアイコンを追加します
 * @author 神無月サスケ
 *
 * @help
 * このプラグインには、プラグインコマンドはありません。
 *
 * ■注意
 * このプラグインは、レベルアップ時の表示メソッドを上書きするため、
 * この箇所を書き換える他のプラグインと共存できません。
 * 例えば「エミールの小さな冒険」に同梱されたKADOKAWAプラグイン
 * 「DisplayOnlyAddedSkillType.js」とは共存できません。
 *
 * ■ライセンス表記
 * このプラグインは MIT ライセンスで配布されます。
 * ご自由にお使いください。
 * http://opensource.org/licenses/mit-license.php
 */

(function() {
  // NOTE:overwritten!
  Game_Actor.prototype.displayLevelUp = function(newSkills) {
    var text = TextManager.levelUp.format(this._name, TextManager.level,
      this._level);
    $gameMessage.newPage();
    $gameMessage.add(text);
    newSkills.forEach(function(skill) {
      $gameMessage.add(TextManager.obtainSkill.format(
        '\\I[' + skill.iconIndex + ']' + skill.name
      ));
    });
  };

})();
