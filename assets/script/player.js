// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

var game = require('game');
cc.Class({
    extends: cc.Component,

    properties: {
        basicJumpH: 250,
        basicJumpD: 0.6,
        basicMoveD: 0.8,
        gameComp: {
            default: null,
            type: game,
        },
        accleLabel: {
            default: null,
            type: cc.Label,
        },
    },

    onLoad () {
        this.isFall = true;
        // 左右移动变量初始化
        this.accLeft;
        this.accRight;
        this.maxAccel = 12;
        // 初始化键盘输入监听
        this.setInputControl();
        // 初始化设备重力感应
        // cc.inputManager.setAccelerometerEnabled(true);
        // cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.onDeviceMotionEvent, this);
        this.playerJump(this.basicJumpH*1.5, this.basicJumpD*1, false);
        // 初始化
        this.lastIndex = 0;
        this.lastB_pos = 0;
        this.maxIndex = 0;
        this.accelX = 0;

        this.socreDisplay = 0;
        this.gameComp.scoreLabel.string = this.socreDisplay;

        this.afterProp = false;
        this.propComb = 0;
    },

    playerJump: function(jumpH, jumpD, isMove, moveDist, moveDur) {
        // 禁用重力
        this.isFall = false;
        this.accelY = 5;
        if(isMove){
            // 滚动地图
            var moveAct = cc.moveBy(moveDur, 0, -moveDist).easing(cc.easeCubicActionOut());
            var moveActCallback = cc.callFunc(function(){
            }, this);
            this.gameComp.board_root.runAction( cc.sequence(moveAct, moveActCallback) );
        }
        // 执行跳跃
        var jumpAct = cc.moveBy(jumpD, cc.p(0, jumpH)).easing(cc.easeCubicActionOut());
        var jumpActCallback = cc.callFunc(function(){
            this.isFall = true;
        }, this);
        this.node.runAction( cc.sequence(jumpAct, jumpActCallback) );
    },

    onCollisionEnter: function(other, self) {
        // 获取块的名字
        var name = other.node.name.split('#')[0];
        var type = other.node._tag;
        var realIndex = parseInt(other.node.no);
        var realPos = other.node.y;
        // 跳到道具逻辑
        if(name == 'prop') {
            if(type == 'spring') {
                var porpH = this.basicJumpH*3;
                this.afterProp = true;
                this.gameComp.creatBoard(11, 80);
                this.playerJump(porpH+this.basicJumpH, this.basicJumpD*1.5, true, porpH, this.basicMoveD*1.5);
                this.propComb += porpH;
                other.node.getChildByName('spring0').active = false;
                other.node.getChildByName('spring1').active = true;
                this.socreDisplay += porpH;
                this.gameComp.scoreLabel.string = parseInt(this.socreDisplay);
            }
        }
        // 跳到跳板逻辑
        else if(name == 'board') {
            // 特殊跳板
            if(type == 'miss') {
                other.node.getComponent(cc.Animation).playAdditive('missAM');
                this.scheduleOnce(function() {
                    other.node.active = false;
                }, 1);
            }
            else if(type == 'break') {
                other.node.getComponent(cc.Animation).playAdditive('borkeAM');
                this.scheduleOnce(function() {
                    other.node.active = false;
                }, 1);
                return false;
            }
            // 普通跳跃（滚地图）逻辑
            if(realIndex > this.lastIndex && realIndex > this.maxIndex) {
                // 创建新块
                let creatMach = realIndex-this.lastIndex;
                console.log(creatMach);
                if(creatMach==4) {
                    creatMach = 3;
                }else if(creatMach>4) {
                    creatMach = 0;
                }
                this.gameComp.creatBoard(creatMach, 80);
                // 计算差值
                this.dist = realPos - this.lastB_pos;
                if(this.afterProp) {
                    this.playerJump(this.basicJumpH, this.basicJumpD, true, this.dist - this.propComb, this.basicMoveD);
                    this.afterProp = false;
                    this.dist -= this.propComb;
                    this.propComb = 0;
                }else {
                    this.playerJump(this.basicJumpH, this.basicJumpD, true, this.dist, this.basicMoveD);
                }
                this.maxIndex = realIndex;
                // 计分
                this.socreDisplay += this.dist;
                this.gameComp.scoreLabel.string = parseInt(this.socreDisplay);
            }
            // 普通跳跃（不滚地图）逻辑
            else {
                this.playerJump(this.basicJumpH, this.basicJumpD, false);
            }
            this.lastIndex = realIndex;
            this.lastB_pos = realPos;
        }
    },

    // 重力感应事件
    onDeviceMotionEvent (event) {
        if(event.acc.x < -0.2){
            this.accLeft = true;
            this.accRight = false;
            if(event.acc.x < -0.2 && event.acc.x >= -0.4){
                this.maxAccel = 12;
                this.accelX = this.maxAccel - 4;
            }else if(event.acc.x < -0.4){
                this.maxAccel = 20;
                this.accelX = this.maxAccel - 4;
            }
        }else if(event.acc.x > 0.2){
            this.accLeft = false;
            this.accRight = true;
            if(event.acc.x > 0.2 && event.acc.x <= 0.4){
                this.maxAccel = 12;
                this.accelX = this.maxAccel - 4;
            }else if(event.acc.x > 0.4){
                this.maxAccel = 20;
                this.accelX = this.maxAccel - 4;
            }
        }else{
            this.accelX = 0;
            this.accLeft = false;
            this.accRight = false;
        }
        this.accleLabel.string = event.acc.x;
    },
    // 添加键盘事件监听
    setInputControl: function () {
        var self = this;
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function(keyCode, event) {
                switch(keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            onKeyReleased: function(keyCode, event) {
                switch(keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            },
        }, self.node);
    },

    update (dt) {
        if(this.isFall) {
            this.accelY+= 0.5;
            if(this.accelY>11){this.accelY = 11;}
            this.node.y -= this.accelY;
            this.gameComp.manager.enabled = true;
        }else {
            this.gameComp.manager.enabled = false;
        }
        // 左右移动
        if(this.accLeft) {
            this.accelX += 1;
            if(this.accelX>this.maxAccel){this.accelX = this.maxAccel;}
            this.node.x -= this.accelX;
            this.node.getChildByName('playerL').active = true;
            this.node.getChildByName('playerR').active = false;
        }else if(this.accRight) {
            this.accelX += 1;
            if(this.accelX>this.maxAccel){this.accelX = this.maxAccel;}
            this.node.x += this.accelX;
            this.node.getChildByName('playerL').active = false;
            this.node.getChildByName('playerR').active = true;
        }
        // 主角超出边界
        if(this.node.x > 640+40){
            this.node.x = 0;
        }else if(this.node.x < 0){
            this.node.x = 640;
        }
    },
});
