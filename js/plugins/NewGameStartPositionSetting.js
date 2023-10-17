//=============================================================================
// NewGameStartPositionSetting.js
//=============================================================================

/*:
 * @plugindesc ゲーム公開時のプレイヤーの初期位置設定プラグイン（ver1.00）
 * @author Leeroynto（http://leeroynto.livedoor.blog/）
 *
 * @param StartMapId
 * @desc 初期位置のマップID
 * @default 1
 *
 * @param StartPlayerX
 * @desc 初期位置のプレイヤーのX座標
 * @default 1
 *
 * @param StartPlayerY
 * @desc 初期位置のプレイヤーのY座標
 * @default 1
 *
 * @help　
 *
 * ============================================================================
 * 概要
 * ============================================================================
 *   非デバッグ時は本プラグインのパラメータで指定した位置、
 *   デバッグ時は『初期位置の設定』で指定した位置からゲームを開始できます。
 *　 これにより、ゲーム公開時にうっかり初期位置を本来の開始地点に戻し忘れて、
 *　 デバッグ時の位置から開始されてしまう事故を防止します。
 *
 * ============================================================================
 * プラグインコマンド
 * ============================================================================
 *   プラグインコマンドはありません。
 *
 * ============================================================================
 * 注意点
 * ============================================================================
 *   オーバーライドしてるためなるべく上の方に置いて下さい。
 *
 * ============================================================================
 * 更新履歴
 * ============================================================================
 *
 * 2019/02/03 ver1.00
 * ・公開
 *
 */


(function() {

    var parameters = PluginManager.parameters('NewGameStartPositionSetting'); 
    var startMapId = Number(parameters['StartMapId']);
    var startPlayerX = Number(parameters['StartPlayerX']);
    var startPlayerY = Number(parameters['StartPlayerY']);

	DataManager.setupNewGame = function() {
	    this.createGameObjects();
	    this.selectSavefileForNewGame();
	    $gameParty.setupStartingMembers();
	    
	    if(!$gameTemp.isPlaytest()){
		    $gamePlayer.reserveTransfer(startMapId,
		        startPlayerX, startPlayerY);
		} else {
		    $gamePlayer.reserveTransfer($dataSystem.startMapId,
		        $dataSystem.startX, $dataSystem.startY);
		}
		    
	    Graphics.frameCount = 0;
	};


})();
