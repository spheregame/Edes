//=============================================================================
// MPP_HiAcWi_Patch1.js
//=============================================================================
// Copyright (c) 2017 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【ver.1.1】一部のウィンドウをアクティブ表示させないパッチ。
 * @author 木星ペンギン
 *
 * @help プラグインパラメータにウィンドウクラス名を入れることで、
 * そのウィンドウの強調表示をなくせます。
 * 
 * ただし、他のプラグインによって追加されたウィンドウクラスには対応していません。
 * （というか、できません）
 * 
 * 
 * コンボボックスに入っているウィンドウ
 *   Window_TitleCommand    # タイトルウィンドウ
 *   Window_Options         # オプションウィンドウ
 *   Window_Status          # ステータス画面
 *   Window_ChoiceList      # 選択肢ウィンドウ
 *   Window_GameEnd         # ゲーム終了ウィンドウ
 *   Window_NameInput       # 名前入力ウィンドウ
 *   Window_SavefileList    # セーブファイルウィンドウ(セーブ/ロード両用)
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param Non Highlight Windows
 * @type combo[]
 * @option Window_TitleCommand
 * @option Window_Options
 * @option Window_Status
 * @option Window_ChoiceList
 * @option Window_GameEnd
 * @option Window_NameInput
 * @option Window_SavefileList
 * @desc 強調表示させないウィンドウクラス名の配列
 * 
 */

(function () {

var parameters = PluginManager.parameters('MPP_HiAcWi_Patch1');

if (parameters['Non Highlight Windows']) {
    var windows = JSON.parse(parameters['Non Highlight Windows']);
    var method = '.prototype._updateHighlight = function() {}';
    for (var i = 0; i < windows.length; i++) {
        try {
            eval(windows[i] + method);
        } catch(e) {
            alert('MPP_HiAcWi_Patch1.js Error!\nクラス名 ' + windows[i] + ' が見つかりませんでした。');
        }
    }
}


})();
