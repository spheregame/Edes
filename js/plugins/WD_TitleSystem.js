//=============================================================================
// WD_TitleSystem.js v1.01
//=============================================================================

/*:ja
 * @plugindesc 称号システムです。称号によりステータスやスキルを追加します。(v1.01)
 * @author Izumi (http://izumiwhite.web.fc2.com/)
 *
 * @param Title Call
 * @desc 称号の呼び方。
 * (String, デフォルト:称号)
 * @default 称号
 *
 * @param Title Getmess
 * @desc 称号獲得時のメッセージ。
 * (String, デフォルト:%1の%2を獲得した！)
 * @default %1の%2を獲得した！
 *
 * @param Draw Title
 * @desc 職業か二つ名の代わりに称号を表示するかどうか。
 * (1 or 2 or 0, デフォルト:1) ※1⇒職業、2⇒二つ名
 * @default 1
 *
 * @param Non Titles
 * @desc 称号無しの場合に表示する称号名。
 * (String, デフォルト:　)
 * @default 　
 * @help
 * 
 * @param Level Change
 * @desc レベルアップによって自動で称号を変更するかどうか。
 * (1 or 0, デフォルト:1)
 * @default 1
 *
 * @param Use Command
 * @desc 称号選択メニューをメニューコマンドに追加するかどうか。
 * (1 or 0, デフォルト:1)
 * @default 1
 * 
 * @param Selectable Notitles
 * @desc 称号選択メニューでの称号無しの選択を可能にするかどうか。
 * (1 or 0, デフォルト:1)
 * @default 1
 * 
 * @param Changeable Actors
 * @desc 称号選択メニューでQ/Wキーでのアクター切り替えを許可するか。
 * (1 or 0, デフォルト:1)
 * @default 1
 * 
 * @param List Rows
 * @desc 称号選択ウィンドウの行数。
 * (1 ~ 10, デフォルト:3)
 * @default 3
 * 
 * @param List Columns
 * @desc 称号選択ウィンドウの列数。
 * (1 ~ 5, デフォルト:3)
 * @default 3
 * 
 * @help
 *
 * プラグインコマンド:
 *   TitleSystem add 1 2      # アクター1に称号2を追加
 *   TitleSystem remove 1 3   # アクター1から称号3を削除
 *   TitleSystem change 1 2   # アクター1の称号を称号2に変更
 *   TitleSystem open 0       # 0番(先頭)のアクターの称号選択メニューを表示。
 *   TitleSystem openbyid 1   # アクター1の称号選択メニューを表示。
 *
 * 称号の設定方法:
 * 　アクターのメモ　記述例:
 *   <Title1:ブロンズナイト,2,1,2,3,4,5,6,7,8,12:13>
 *   <Title2:シルバーナイト,3,1,2,3,4,5,6,7,8,12:13:14>
 *   …
 *   <Title10:ゴールドナイト,99,1,2,3,4,5,6,7,8,12:13:14:15>
 * 　※称号は各アクターにつき99番まで指定可能。
 * 　※左から順に、称号名,称号獲得レベル,HP増分,MP増分,攻撃力増分,…,運増分,スキル習得。
 * 　※スキル習得は、":"で複数個をつなげて記述。12:13:14:15なら
 * 　　スキル12,13,14,15を使用できる。スキルを習得させる必要が無い場合は、0と記述。
 * 　※称号をレベルアップで獲得させたくない場合は、称号獲得レベルを100以上に指定する。
 * 
 */

(function() {

    var parameters = PluginManager.parameters('WD_TitleSystem');
    var titleCall = parameters['Title Call'];
    var titleGetmess = parameters['Title Getmess'];
    var flagDrawTitle = Number(parameters['Draw Title'] || 1);
    var nonTitlesName = parameters['Non Titles'];
    var flagLevelChange = Number(parameters['Level Change'] || 1);
    var flagUseCommand = Number(parameters['Use Command'] || 1);
    var flagSelectableNotitles = Number(parameters['Selectable Notitles'] || 1);
    var flagChangeableActors = Number(parameters['Changeable Actors'] || 1);
    var listRows = Number(parameters['List Rows'] || 3);
    var listColumns = Number(parameters['List Columns'] || 3);

    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'TitleSystem') {
            switch (args[0]) {
            case 'open':
                $gameParty.setMenuActor($gameParty.allMembers()[Number(args[1])]);
                SceneManager.push(Scene_TitleItem);
                break;
            case 'openbyid':
                $gameParty.setMenuActor($gameActors.actor(Number(args[1])));
                SceneManager.push(Scene_TitleItem);
                break;
            case 'add':
                $gameSystem.addToTitleItem(Number(args[1]),Number(args[2]));
                break;
            case 'remove':
                $gameSystem.removeFromTitleItem(Number(args[1]),Number(args[2]));
                break;
            case 'clear':
                $gameSystem.clearTitleItem();
                break;
            case 'change':
                $gameSystem.changeTitleItem(Number(args[1]),Number(args[2]));
                break;
            }
        }
    };

    Game_System.prototype.addToTitleItem = function(actorId,titleId) {
        $gameActors.actor(actorId).changeTitleFlag(titleId, true);
    };

    Game_System.prototype.removeFromTitleItem = function(actorId,titleId) {
        $gameActors.actor(actorId).changeTitleFlag(titleId, false);
    };

    Game_System.prototype.changeTitleItem = function(actorId,titleId) {
        $gameActors.actor(actorId).setTitleId(titleId);
    };


    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        this._titleId = 0;
        this._titelItemFlags = [];
    };


    Game_Actor.prototype.setTitleId = function(titleId) {
        this._titleId = titleId;
        if(this.hp > this.mhp){
            this._hp = this.mhp;
        }
        if(this.mp > this.mmp){
            this._mp = this.mmp;
        }
    };

    Game_Actor.prototype.titleId = function() {
        return this._titleId;
    };


    Game_Actor.prototype.changeTitleFlag = function(titleId, flag) {
        if (!this._titelItemFlags) {
            this.clearTitleItemFlags();
        }
        this._titelItemFlags[titleId] = flag;
    };

    Game_Actor.prototype.clearTitleItemFlags = function() {
        this._titelItemFlags = [];
    };

    Game_Actor.prototype.titleItemFlags = function() {
        return this._titelItemFlags;
    };

    Game_Actor.prototype.titleItemName = function() {
        actor_meta_title = this.metaTitle();
        if (actor_meta_title) {
            return actor_meta_title.split(",")[0];
        }
        return nonTitlesName;
    };

    var _Game_Actor_paramPlus = Game_Actor.prototype.paramPlus;
    Game_Actor.prototype.paramPlus = function(paramId) {
        var value = _Game_Actor_paramPlus.call(this, paramId);
        actor_meta_title = this.metaTitle();
        if (actor_meta_title) {
            value += Number(actor_meta_title.split(",")[paramId+2]);
        }
        return value;
    };

    Game_Actor.prototype.metaTitle = function() {
        actor_meta_title = this.metaTitleFromId(this._titleId);      
        return actor_meta_title;
    };

    Game_Actor.prototype.metaTitleFromId = function(index) {
        actor_meta = $dataActors[this._actorId].meta;
        actor_meta_title = false;
        actor_meta_title = actor_meta["Title"+String(index)];
        return actor_meta_title;
    };

    var _Game_Actor_skills = Game_Actor.prototype.skills;
    Game_Actor.prototype.skills = function() {
        var list = [];
        list = _Game_Actor_skills.call(this);
        add_list = this.titleSkills();
        list =list.concat(add_list);

        return list;
    };

    Game_Actor.prototype.titleSkills = function() {
        var list = [];
        actor_meta_title = this.metaTitle();
        var list_add = false
        if (actor_meta_title) {
            list_add = actor_meta_title.split(",")[10];
            if (list_add&&list_add!=0){
                list_add = list_add.split(":");
                for (i=0; i<list_add.length; i++){
                    list.push($dataSkills[list_add[i]]);
                }
            }
        }
        return list;
    };

    //再定義
    Window_Base.prototype.drawActorClass = function(actor, x, y, width) {
        width = width || 168;
        this.resetTextColor();
        if (flagDrawTitle==1){
            this.drawText(actor.titleItemName(), x, y, width);
        }else{
            this.drawText(actor.currentClass().name, x, y, width);
        }
    };

    //再定義
    Window_Base.prototype.drawActorNickname = function(actor, x, y, width) {
        width = width || 270;
        this.resetTextColor();
        if (flagDrawTitle==2){
            this.drawText(actor.titleItemName(), x, y, width);
        }else{
            this.drawText(actor.nickname(), x, y, width);
        }
    };

    Window_Base.prototype.drawActorTitle = function(actor, x, y, width) {
        width = width || 168;
        this.resetTextColor();
        this.drawText(actor.titleItemName(), x, y, width);
    };

    //再定義
    Game_Actor.prototype.changeExp = function(exp, show) {
        this._exp[this._classId] = Math.max(exp, 0);
        var lastLevel = this._level;
        var lastSkills = this.skills();
        var newTitleItemFlags = []; //add
        while (!this.isMaxLevel() && this.currentExp() >= this.nextLevelExp()) {
            this.levelUp();
            newTitleItemFlags = this.getNewTitleItemFlags(newTitleItemFlags);
        }
        while (this.currentExp() < this.currentLevelExp()) {
            this.levelDown();
        }
        if (show && this._level > lastLevel) {
            this.displayLevelUp(this.findNewSkills(lastSkills));
            this.displayNewTitleFlag(newTitleItemFlags);
        }
        this.refresh();
    };


    Game_Actor.prototype.getNewTitleItemFlags = function(newTitleItemFlags) {
        for (i=1; i<=99; i++){
            actor_meta_title = this.metaTitleFromId(i);
            if (actor_meta_title){
                title_level = Number(actor_meta_title.split(",")[1]);
                if (title_level<=this._level) {
                    if(!this._titelItemFlags[i]){
                        newTitleItemFlags[i] = true;
                        this.changeTitleFlag(i, true);
                    }
                }
            }
        }
        return newTitleItemFlags;
    };

    Game_Actor.prototype.displayNewTitleFlag = function(newTitleItemFlags) {
        for (i=1; i<=99; i++){
            if (newTitleItemFlags[i]){
                actor_meta_title = this.metaTitleFromId(i);
                if (actor_meta_title) {
                    titleName = actor_meta_title.split(",")[0];
                }
                if (flagLevelChange==1){
                    this.setTitleId(i);
                }
                var text = titleGetmess;
                text = text.replace("%1", titleName);
                text = text.replace("%2", titleCall);
                $gameMessage.add(text);
            }
        }
    };





//以下、メニューウィンドウ用

    var _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        if(flagUseCommand){
            this._commandWindow.setHandler('titleitem', this.commandPersonal.bind(this));
        }
    };

    var _Scene_Menu_onPersonalOk = Scene_Menu.prototype.onPersonalOk;
    Scene_Menu.prototype.onPersonalOk = function() {
        _Scene_Menu_onPersonalOk.call(this);
        switch (this._commandWindow.currentSymbol()) {
        case 'titleitem':
            SceneManager.push(Scene_TitleItem);
            break;
        }
    };    

    var _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function() {
        _Window_MenuCommand_addMainCommands.call(this);
        var enabled = this.areMainCommandsEnabled();
        if(flagUseCommand){
            if (this.needsCommand('titleitem')) {
                this.addCommand(titleCall, 'titleitem', enabled);
             }
        }
    };


//-----------------------------------------------------------------------------
// Scene_TitleItem
//
// The scene class of the titlechange screen.

    function Scene_TitleItem() {
        this.initialize.apply(this, arguments);
    }

    Scene_TitleItem.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_TitleItem.prototype.constructor = Scene_TitleItem;

    Scene_TitleItem.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_TitleItem.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createStatusWindow();
        this.createTitleItemWindow();
        this.refreshActor();
    };

    Scene_TitleItem.prototype.createStatusWindow = function() {
        this._statusWindow = new Window_TitleItemStatus(0, 0);
        this.addWindow(this._statusWindow);
    };

    Scene_TitleItem.prototype.createTitleItemWindow = function() {
        var wx = 0;
        var wy = this._statusWindow.y + this._statusWindow.height;
        var ww = Graphics.boxWidth;
        var wh = Graphics.boxHeight - wy;
        this._titleItemWindow = new Window_TitleItem(wx, wy, ww, wh);
        this._titleItemWindow.setStatusWindow(this._statusWindow);
        this._titleItemWindow.setHandler('ok',     this.onItemOk.bind(this));
        this._titleItemWindow.setHandler('cancel',   this.popScene.bind(this));
        if(flagChangeableActors){
            this._titleItemWindow.setHandler('pagedown', this.nextActor.bind(this));
            this._titleItemWindow.setHandler('pageup',   this.previousActor.bind(this));
        }
        this.addWindow(this._titleItemWindow);
        this._titleItemWindow.activate();
        this._titleItemWindow.select(0);
    };

    Scene_TitleItem.prototype.refreshActor = function() {
        var actor = this.actor();
        this._statusWindow.setActor(actor);
        this._titleItemWindow.setActor(actor);
        this._titleItemWindow.updateHelp();
    };

    Scene_TitleItem.prototype.onItemOk = function() {
        SoundManager.playEquip();
        this.actor().setTitleId(this._titleItemWindow.item())
        this._titleItemWindow.refresh();
        this._statusWindow.refresh();
        this._titleItemWindow.activate();
    };

    Scene_TitleItem.prototype.onActorChange = function() {
        this.refreshActor();
    };

    Scene_TitleItem.prototype.nextActor = function() {
        Scene_MenuBase.prototype.nextActor.call(this);
        this._titleItemWindow.activate();
        this._titleItemWindow.select(0);   
    };

    Scene_TitleItem.prototype.previousActor = function() {
        Scene_MenuBase.prototype.previousActor.call(this);
        this._titleItemWindow.activate();
        this._titleItemWindow.select(0);
    };


//-----------------------------------------------------------------------------
// Window_TitleItemStatus
//
// The window for displaying parameter changes on the titlechange screen.

    function Window_TitleItemStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_TitleItemStatus.prototype = Object.create(Window_Base.prototype);
    Window_TitleItemStatus.prototype.constructor = Window_TitleItemStatus;

    Window_TitleItemStatus.prototype.initialize = function(x, y) {
        var width = this.windowWidth();
        var height = this.windowHeight();
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._tempActor = null;
        this.refresh();
    };

    Window_TitleItemStatus.prototype.windowWidth = function() {
        return Graphics.boxWidth;
    };

    Window_TitleItemStatus.prototype.windowHeight = function() {
        return Graphics.boxHeight - this.fittingHeight(listRows);
    };

    Window_TitleItemStatus.prototype.numVisibleRows = function() {
        return 7;
    };

    Window_TitleItemStatus.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
        }
    };

    Window_TitleItemStatus.prototype.refresh = function() {
        this.contents.clear();
        if (this._actor) {
            this.drawActorName(this._actor, this.textPadding(), 0);
            for (var i = 0; i < 8; i++) {
                this.drawItem(32+i%2*320, this.lineHeight() * (1 + Math.floor(i/2)), i);
            }
            this.drawActorClassChange(240, 0);
            this.drawActorSkillChange(0, 192);
        }
    };

    Window_TitleItemStatus.prototype.setTempActor = function(tempActor) {
        if (this._tempActor !== tempActor) {
            this._tempActor = tempActor;
            this.refresh();
        }
    };

    Window_TitleItemStatus.prototype.drawItem = function(x, y, paramId) {
        this.drawParamName(x + this.textPadding(), y, paramId);
        if (this._actor) {
            this.drawCurrentParam(x + 140, y, paramId);
        }
        this.drawRightArrow(x + 188, y);
        if (this._tempActor) {
            if (this._actor._titleId != this._tempActor._titleId){
                this.drawNewParam(x + 222, y, paramId);
            }
        }
    };

    Window_TitleItemStatus.prototype.drawActorClassChange = function(x, y) {
        this.drawActorTitle(this._actor, x, y, 168)
        this.drawRightArrow(x + 168 + 16, y);
        if (this._tempActor) {
            if (this._actor._titleId != this._tempActor._titleId){
                this.drawActorTitle(this._tempActor, x + 168 + 32 + 48, y, 168);
             }
        }
    };

    Window_TitleItemStatus.prototype.drawActorSkillChange = function(x, y) {
        if (this._tempActor) {
            this.changeTextColor(this.systemColor());
            this.drawText("追加スキル", x, y, 240);
            skills = this._tempActor.titleSkills();
            var costWidth = this.costWidth();
            var width = Graphics.boxWidth/2 - this.textPadding() - 48;
            var maxskillid = 2 * (9-listRows);
            if(skills){
            for (i=0; i<skills.length; i++){
                skill = skills[i];
                if(skills.length>maxskillid&&i==maxskillid-1){
                    this.changeTextColor(this.normalColor());
                    this.drawText("etc", x+i%2*(width+48), y+this.lineHeight()*(1 + Math.floor(i/2)), width - costWidth);
                }else if(i<maxskillid-1){
                    this.drawItemName(skill, x+i%2*(width+48), y+this.lineHeight()*(1 + Math.floor(i/2)), width - costWidth);
                    this.drawSkillCost(skill, x+i%2*(width+48), y+this.lineHeight()*(1 + Math.floor(i/2)), width);
                }
            }
            }
        }
    };

    Window_TitleItemStatus.prototype.drawSkillCost = function(skill, x, y, width) {
        if (this._actor.skillTpCost(skill) > 0) {
            this.changeTextColor(this.tpCostColor());
            this.drawText(this._actor.skillTpCost(skill), x, y, width, 'right');
        } else if (this._actor.skillMpCost(skill) > 0) {
            this.changeTextColor(this.mpCostColor());
            this.drawText(this._actor.skillMpCost(skill), x, y, width, 'right');
        }
    };

    Window_TitleItemStatus.prototype.costWidth = function() {
        return this.textWidth('000');
    };

    Window_TitleItemStatus.prototype.drawParamName = function(x, y, paramId) {
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.param(paramId), x, y, 120);
    };

    Window_TitleItemStatus.prototype.drawCurrentParam = function(x, y, paramId) {
        this.resetTextColor();
        this.drawText(this._actor.param(paramId), x, y, 48, 'right');
    };

    Window_TitleItemStatus.prototype.drawRightArrow = function(x, y) {
        this.changeTextColor(this.systemColor());
        this.drawText('\u2192', x, y, 32, 'center');
    };

    Window_TitleItemStatus.prototype.drawNewParam = function(x, y, paramId) {
        var newValue = this._tempActor.param(paramId);
        var diffvalue = newValue - this._actor.param(paramId);
        this.changeTextColor(this.paramchangeTextColor(diffvalue));
        this.drawText(newValue, x, y, 48, 'right');
    };


//-----------------------------------------------------------------------------
// Window_TitleItemList
//
// The window for selecting an title on the titlechange screen.

    function Window_TitleItemList() {
        this.initialize.apply(this, arguments);
    }

    Window_TitleItemList.prototype = Object.create(Window_ItemList.prototype);
    Window_TitleItemList.prototype.constructor = Window_TitleItemList;


    Window_TitleItemList.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
        this._category = 'none';
        this._data = [];
        this._data2 = [];
    };

    Window_TitleItemList.prototype.setCategory = function(category) {
        if (this._category !== category) {
            this._category = category;
            this.refresh();
            this.resetScroll();
        }
    };

    Window_TitleItemList.prototype.maxCols = function() {
        return listColumns;
    };

    Window_TitleItemList.prototype.spacing = function() {
        return 48;
    };

    Window_TitleItemList.prototype.maxItems = function() {
        return this._data ? this._data.length : 1;
    };

    Window_TitleItemList.prototype.item = function() {
        var index = this.index();
        return this._data && index >= 0 ? this._data2[index] : null;
    };

    Window_TitleItemList.prototype.isCurrentItemEnabled = function() {
        return this.isEnabled(this.item());
    };

    Window_TitleItemList.prototype.needsNumber = function() {
        return true;
    };

    Window_TitleItemList.prototype.isEnabled = function(item) {
        if (this._actor._titleId == item){
            return false;
        }else{
            return true;
        }
    };

    Window_TitleItemList.prototype.makeItemList = function() {
        this._data = [];
        this._data2 = [];
        actor = this._actor
        for (i=1; i<=99; i++){
            if (actor._titelItemFlags[i]){
                actor_meta_title = actor.metaTitleFromId(i);
                if (actor_meta_title) {
                    this._data.push(actor_meta_title.split(",")[0]);
                    this._data2.push(i);
                 }
            }
        }
        if(flagSelectableNotitles||this._data.length==0){
            this._data.push(nonTitlesName);
            this._data2.push(0);
         }
    };

    Window_TitleItemList.prototype.selectLast = function() {
        this.select(0);
    };

    Window_TitleItemList.prototype.drawItem = function(index) {
        var item = this._data[index];
        var item2 = this._data2[index];
        if (item) {
            var rect = this.itemRect(index);
            rect.width -= this.textPadding();
            this.changePaintOpacity(this.isEnabled(item2));
            this.drawText(item, rect.x, rect.y, rect.width);
            this.changePaintOpacity(1);
        }
    };

    Window_TitleItemList.prototype.refresh = function() {
        this.makeItemList();
        this.createContents();
        this.drawAllItems();
    };


//-----------------------------------------------------------------------------
// Window_TitleItem
//
// The window for selecting an equipment item on the equipment screen.

    function Window_TitleItem() {
        this.initialize.apply(this, arguments);
    }

    Window_TitleItem.prototype = Object.create(Window_TitleItemList.prototype);
    Window_TitleItem.prototype.constructor = Window_TitleItem;

    Window_TitleItem.prototype.initialize = function(x, y, width, height) {
        Window_TitleItemList.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this._slotId = 0;
    };

    Window_TitleItem.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
            this.resetScroll();
        }
    };

    Window_TitleItem.prototype.setSlotId = function(slotId) {
        if (this._slotId !== slotId) {
            this._slotId = slotId;
            this.refresh();
            this.resetScroll();
        }
    };

    Window_TitleItem.prototype.setStatusWindow = function(statusWindow) {
        this._statusWindow = statusWindow;
        this.callUpdateHelp();
    };

    Window_TitleItem.prototype.callUpdateHelp = function() {
        if (this.active) {
            this.updateHelp();
        }
    };

    Window_TitleItem.prototype.updateHelp = function() {
        if (this._actor && this._statusWindow) {
            var actor = JsonEx.makeDeepCopy(this._actor);
            actor.setTitleId(this.item())
            this._statusWindow.setTempActor(actor);
        }
    };

    Window_TitleItem.prototype.playOkSound = function() {
    };




})();
