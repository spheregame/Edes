//==============================================================================
// dsGainLpResult03.js
// Copyright (c) 2015 - 2017 Douraku
// Released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//==============================================================================

/*:
 * @plugindesc LP獲得リザルト画面03プラグイン ver1.0.0
 * @author 道楽
 *
 * @param Left Side Width
 * @desc 左側の表示領域の横幅
 * @default 236
 *
 * @param Lp Gauge Text
 * @desc LP蓄積ゲージウィンドウの題字
 * @default LP獲得
 *
 * @param Learning Skill Text
 * @desc スキルを習得したときに表示されるテキスト
 * @default 習得！
 */

var Imported = Imported || {};
Imported.dsGainLpResult03 = true;

(function (exports) {
	'use strict';

	exports.Param = (function() {
		var ret = {};
		var parameters = PluginManager.parameters('dsGainLpResult03');
		ret.LeftSideWidth = Number(parameters['Left Side Width']);
		ret.LpGaugeText = String(parameters['Lp Gauge Text']);
		ret.LearningSkillText = String(parameters['Learning Skill Text']);
		return ret;
	})();

	//--------------------------------------------------------------------------
	/** Window_VictoryExp */
	Window_VictoryExp.prototype.gaugeRect = function(index)
	{
		var rect = this.itemRect(index);
		var fw = Window_Base._faceWidth;
		rect.x += fw + this.standardPadding() * 2;
		rect.width -= fw + this.standardPadding() * 2;
		return rect;
	};

	var _Window_VictoryExp_drawActorGauge = Window_VictoryExp.prototype.drawActorGauge;
	Window_VictoryExp.prototype.drawActorGauge = function(actor, index)
	{
		_Window_VictoryExp_drawActorGauge.call(this, actor, index);
		var rect = this.gaugeRect(index);
		this.drawLpGained(actor, rect);
	};

	Window_VictoryExp.prototype.drawExpGauge = function(actor, rect)
	{
		var wx = rect.x + exports.Param.LeftSideWidth + 2;
		var wy = rect.y + this.lineHeight();
		var ww = rect.width - exports.Param.LeftSideWidth;
		var rate = this.actorExpRate(actor);
		if ( rate >= 1.0 )
		{
			var color1 = this.textColor(Yanfly.Param.ColorLv1);
			var color2 = this.textColor(Yanfly.Param.ColorLv2);
		}
		else
		{
			var color1 = this.textColor(Yanfly.Param.ColorExp1);
			var color2 = this.textColor(Yanfly.Param.ColorExp2);
		}
		this.drawGauge(wx, wy, ww, rate, color1, color2);
	};

	Window_VictoryExp.prototype.drawExpValues = function(actor, rect)
	{
		var wx = rect.x + exports.Param.LeftSideWidth + 2;
		var wy = rect.y + this.lineHeight();
		var ww = rect.width  - exports.Param.LeftSideWidth - 4;
		var actorLv = actor._preVictoryLv;
		var bonusExp = 1.0 * actor._expGained * this._tick / Yanfly.Param.VAGaugeTicks;
		var nowExp = actor._preVictoryExp - actor.expForLevel(actorLv) + bonusExp;
		var nextExp = actor.expForLevel(actorLv + 1) - actor.expForLevel(actorLv);
		if ( actorLv === actor.maxLevel() )
		{
			var text = Yanfly.Param.VAMaxLv;
		}
		else if ( nowExp >= nextExp )
		{
			var text = Yanfly.Param.VALevelUp;
		}
		else
		{
			var text = Yanfly.Util.toGroup(parseInt(nextExp - nowExp));
		}
		this.changeTextColor(this.normalColor());
		this.drawText(text, wx, wy, ww, 'right');
	};

	Window_VictoryExp.prototype.drawExpGained = function(actor, rect)
	{
		var wx = rect.x + 2;
		var wy = rect.y + this.lineHeight() * 1;
		var ww = exports.Param.LeftSideWidth - 4;
		if ( wy < rect.y + rect.height )
		{
			this.changeTextColor(this.systemColor());
			this.drawText(Yanfly.Param.VAGainedExp, wx, wy, ww, 'left');
			var bonusExp = 1.0 * actor._expGained * this._tick / Yanfly.Param.VAGaugeTicks;
			var expParse = Yanfly.Util.toGroup(parseInt(bonusExp));
			var expText = Yanfly.Param.VAGainedExpfmt.format(expParse);
			this.changeTextColor(this.normalColor());
			this.drawText(expText, wx, wy, ww, 'right');
		}
	};

	Window_VictoryExp.prototype.drawLpGained = function(actor, rect)
	{
		var value = actor.battleLp();
		var text = dsEquipmentSkillLearning.Param.LpAftermathFormat.format(value, dsEquipmentSkillLearning.Param.Lp);
		var textWidth = this.textWidthEx(text);
		var wx = rect.x;
		var wy = rect.y + this.lineHeight() * 2;
		var ww = exports.Param.LeftSideWidth - 4;
		this.changeTextColor(this.systemColor());
		this.drawText(dsEquipmentSkillLearning.Param.LpAftermathEarned, wx + 2, wy, ww - 4, 'left');
		this.resetTextColor();
		this.drawTextEx(text, wx + ww - textWidth, wy);
	};

	//--------------------------------------------------------------------------
	/** Window_VictoryLpGauge */
	exports.Window_VictoryLpGauge = (function() {

		function Window_VictoryLpGauge()
		{
			this.initialize.apply(this, arguments);
		}

		Window_VictoryLpGauge.prototype = Object.create(Window_VictoryExp.prototype);
		Window_VictoryLpGauge.prototype.constructor = Window_VictoryLpGauge;

		Window_VictoryLpGauge.prototype.initialize = function()
		{
			this._actor = null;
			Window_VictoryExp.prototype.initialize.call(this);
		};

		Window_VictoryLpGauge.prototype.maxItems = function()
		{
			if ( this._actor )
			{
				if ( this._actor.victoryLpGauges() )
				{
					return this._actor.victoryLpGauges().length;
				}
			}
			return 0;
		};

		Window_VictoryLpGauge.prototype.setActor = function(actor)
		{
			if ( this._actor !== actor )
			{
				if ( this._actor )
				{
					AudioManager.playSe(this._tickSound);
				}
				this._actor = actor;
				this._tick = 0;
				this.refresh();
			}
		};

		Window_VictoryLpGauge.prototype.drawActorAppearance = function()
		{
			var fw = Window_Base._faceWidth;
			var fh = Window_Base._faceHeight;
			var x = (exports.Param.LeftSideWidth - fw) / 2;
			var y = 0;
			var name = this._actor.name();
			this.drawActorFace(this._actor, x, y, fw, fh);
			this.resetTextColor();
			this.drawText(name, 0, fh, exports.Param.LeftSideWidth, 'center');
			this.changeTextColor(this.powerUpColor());
			var text = '+' + this._actor.gainedLp() + ' ';
			text += dsEquipmentSkillLearning.Param.Lp;
			this.drawText(text, 0, fh + this.lineHeight(), exports.Param.LeftSideWidth, 'center');
		};

		Window_VictoryLpGauge.prototype.drawAllGauges = function()
		{
			var width = this.contentsWidth() / 2;
			var x = exports.Param.LeftSideWidth;
			var y = 0;
			var lpGauges = this._actor.victoryLpGauges();
			if ( lpGauges )
			{
				lpGauges.forEach(function(gaugeData, index) {
					var skill = $dataSkills[gaugeData.skillId];
					if ( skill )
					{
						var lp = this.actorSkillLp(skill, gaugeData);
						var lpMax = this.actorSkillLpMax(skill);
						var y1 = y + this.lineHeight() * index;
						this.clearLpGauge(x, y1, width);
						this.drawLpGauge(skill, gaugeData, x, y1, width);
						this.drawLpValue(skill, gaugeData, x, y1, width);
						this.drawItemName(skill, x, y1, width);
						if ( lp >= lpMax )
						{
							var x2 = x + width;
							var width2 = this.contentsWidth() - x2;
							this.drawComplate(x2, y1, width2);
						}
					}
				}, this);
			}
		};

		Window_VictoryLpGauge.prototype.clearLpGauge  = function(x, y, width)
		{
			var height = this.lineHeight();
			this.contents.clearRect(x, y, width, height);
		};

		Window_VictoryLpGauge.prototype.drawLpGauge = function(skill, gaugeData, x, y, width, rate)
		{
			if ( dsEquipmentSkillLearning.Param.ShowLpGauge )
			{
				var iconBoxWidth = Window_Base._iconWidth + 4;
				var x1 = x + iconBoxWidth;
				var gaugeWidth = width - iconBoxWidth;
				var rate = this.actorSkillLpRate(skill, gaugeData);
				var color1 = this.learningGaugeColor1();
				var color2 = this.learningGaugeColor2();
				this.drawGauge(x1, y, gaugeWidth, rate, color1, color2);
			}
		};

		Window_VictoryLpGauge.prototype.drawLpValue = function(skill, gaugeData, x, y, width)
		{
			if ( dsEquipmentSkillLearning.Param.ShowLpValue )
			{
				var lp = this.actorSkillLp(skill, gaugeData);
				var lpMax = this.actorSkillLpMax(skill);
				this.contents.fontSize = dsEquipmentSkillLearning.Param.LpValueFontSize;
				var labelWidth = this.textWidth(dsEquipmentSkillLearning.Param.Lp);
				var valueWidth = this.textWidth('000');
				var slashWidth = this.textWidth('/');
				var valueHeight = (this.lineHeight() - this.contents.fontSize) / 2;
				var x1 = x + width - valueWidth;
				var x2 = x1 - slashWidth;
				var x3 = x2 - valueWidth;
				var y1 = y - valueHeight;
				var y2 = y + valueHeight;
				if ( y2 - y1 >= this.contents.fontSize )
				{
					this.changeTextColor(this.lpColor());
					this.drawText(dsEquipmentSkillLearning.Param.Lp, x3, y1, labelWidth);
				}
				if ( x3 >= x + labelWidth )
				{
					this.resetTextColor();
					this.drawText(lp, x3, y2, valueWidth, 'right');
					this.drawText('/', x2, y2, slashWidth, 'right');
					this.drawText(lpMax, x1, y2, valueWidth, 'right');
				}
				else
				{
					this.resetTextColor();
					this.drawText(lp, x1, y2, valueWidth, 'right');
				}
				this.contents.fontSize = this.standardFontSize();
			}
		};

		Window_VictoryLpGauge.prototype.drawComplate = function(x, y, width)
		{
			this.drawText(exports.Param.LearningSkillText, x, y, width, 'center');
		};

		Window_VictoryLpGauge.prototype.actorSkillLp = function(skill, gaugeData)
		{
			var tickRate = this._tick / Yanfly.Param.VAGaugeTicks;
			var lp = Math.floor(gaugeData.before + this._actor.gainedLp() * tickRate);
			var lpMax = this.actorSkillLpMax(skill);
			return (lp).clamp(0, lpMax);
		};

		Window_VictoryLpGauge.prototype.actorSkillLpMax = function(skill)
		{
			return this._actor.skillLpMax(skill);
		};

		Window_VictoryLpGauge.prototype.actorSkillLpRate = function(skill, gaugeData)
		{
			var tickRate = this._tick / Yanfly.Param.VAGaugeTicks;
			var lp = gaugeData.before + this._actor.gainedLp() * tickRate;
			var lpMax = this.actorSkillLpMax(skill);
			return (lp / lpMax).clamp(0, 1);
		};

		Window_VictoryLpGauge.prototype.refresh = function()
		{
			this.contents.clear();
			if ( this._actor )
			{
				this.drawActorAppearance();
				this.drawAllGauges();
			}
		};

		return Window_VictoryLpGauge;
	})();

	//--------------------------------------------------------------------------
	/** Scene_Battle */
	var _Scene_Battle_addCustomVictorySteps = Scene_Battle.prototype.addCustomVictorySteps;
	Scene_Battle.prototype.addCustomVictorySteps = function(array)
	{
		array = _Scene_Battle_addCustomVictorySteps.call(this, array);
		var stepIdx = array.indexOf("LP");
		if ( stepIdx >= 0 )
		{
			array.splice(stepIdx, 1);
		}
		this._lpGaugeSteps = [];
		$gameParty.battleMembers().forEach(function(actor, idx) {
			if ( this.isGainedVictoryLpGauge(actor) )
			{
				var stepName = 'LPGAUGE' + ('0'+idx);
				if ( !array.contains(stepName) )
				{
					array.push(stepName);
					this._lpGaugeSteps.push(stepName);
				}
			}
		}, this);
		return array;
	};

	var _Scene_Battle_updateVictorySteps = Scene_Battle.prototype.updateVictorySteps;
	Scene_Battle.prototype.updateVictorySteps = function()
	{
		_Scene_Battle_updateVictorySteps.call(this);
		if ( this._lpGaugeSteps.length > 0 && this.isVictoryStep(this._lpGaugeSteps[0]) )
		{
			this.updateVictoryLpGauge();
		}
	};

	Scene_Battle.prototype.updateVictoryLpGauge = function()
	{
		if ( !this._victoryLpGaugeWindow )
		{
			this.createVictoryLpGauge();
		}
		else if ( this._victoryLpGaugeWindow.isReady() )
		{
			if ( this.victoryTriggerContinue() )
			{
				this.finishVictoryLpGauge();
			}
		}
	};

	Scene_Battle.prototype.createVictoryLpGauge = function()
	{
		this._victoryTitleWindow.refresh(exports.Param.LpGaugeText);
		if ( !this._victoryLpGaugeWindow )
		{
			this._victoryLpGaugeWindow = new exports.Window_VictoryLpGauge();
			this.addWindow(this._victoryLpGaugeWindow);
		}
		var actorIdx = Number(this._victoryStep.substr(7));
		this._victoryLpGaugeWindow.setActor($gameParty.battleMembers()[actorIdx]);
		this._victoryLpGaugeWindow.open();
	};

	Scene_Battle.prototype.finishVictoryLpGauge = function()
	{
		SoundManager.playOk();
		if ( this._victoryStep )
		{
			var stepIdx = this._lpGaugeSteps.indexOf(this._victoryStep);
			if ( stepIdx >= 0 )
			{
				this._lpGaugeSteps.splice(stepIdx, 1);
			}
		}
		this.processNextVictoryStep();
		if ( this._victoryStep && this._lpGaugeSteps )
		{
			var stepIdx = this._lpGaugeSteps.indexOf(this._victoryStep);
			if ( stepIdx >= 0 )
			{
				var actorIdx = Number(this._victoryStep.substr(7));
				this._victoryLpGaugeWindow.setActor($gameParty.battleMembers()[actorIdx]);
			}
			else
			{
				this._victoryLpGaugeWindow.close();
			}
		}
		else
		{
			this._victoryLpGaugeWindow.close();
		}
	};

	Scene_Battle.prototype.isGainedVictoryLpGauge = function(actor)
	{
		var lpGauges = actor.victoryLpGauges();
		if ( lpGauges )
		{
			if ( lpGauges.length > 0 )
			{
				return true;
			}
		}
		return false;
	};

}((this.dsGainLpResult03 = this.dsGainLpResult03 || {})));
