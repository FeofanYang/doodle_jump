// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        board_prefab: {
            default: [],
            type: cc.Prefab,
        },
        board_root: {
            default: null,
            type: cc.Node,
        },
        prop_prefab: {
            default: [],
            type: cc.Prefab,
        },
        scoreLabel: {
            default: null,
            type: cc.Label,
        },
    },

    onLoad () {
        // 碰撞系统
        this.manager = cc.director.getCollisionManager();
        this.manager.enabled = true;
        // this.manager.enabledDebugDraw = true;
        // 初始化块编号
        this.boardNo = 0;
        this.startH = 0;
        // 关闭调试
        cc.director.setDisplayStats(false);
    },

    start() {
        this.cur_board = cc.instantiate(this.board_prefab[Math.floor(Math.random() * 4)]);
        this.board_root.addChild(this.cur_board, -1, 0);
        this.cur_board.setPosition( this.board_root.convertToWorldSpaceAR( cc.p(Math.random()*(640-this.cur_board.width), this.startH)) );
        this.next_board = this.cur_board;
        this.cur_board.name = 'board<' + this.boardNo + '<' + this.startH;
        this.creatBoard(20, 60);
    },

    creatBoard: function(boardNum, boardDist) {
        var comboBreak = false;
        console.log('boardLength:'+this.board_root.childrenCount);
        for (let i = 0; i < boardNum; i++) {
            // 实例化一个prefab
            this.cur_board = this.next_board;
            // 分配概率
            let boardRandom = Math.floor(Math.random() * 100) + 1;
            let boardType;
            if(boardRandom <= 40){
                boardType = 0;
                comboBreak = true;
            }
            else if(boardRandom>40 && boardRandom<=60){
                boardType = 1;
                comboBreak = true;
            }
            else if(boardRandom>60 && boardRandom<=80){
                boardType = 2;
                comboBreak = true;
            }
            else if(boardRandom>80 && boardRandom<=100 && comboBreak){
                boardType = 3;
                comboBreak = false;
            }else{
                boardType = 0;
                comboBreak = true;
            }
            this.next_board = cc.instantiate(this.board_prefab[boardType]);
            // 添加至root
            this.board_root.addChild(this.next_board, -1, 0);
            // 指定名字与位置
            this.next_pos_y = this.cur_board.getPosition().y + boardDist;
            this.next_pos_x = Math.random()*(640-this.next_board.width);
            this.next_board.setPosition( this.next_pos_x, this.next_pos_y );
            // 指定类型
            var type;
            if(boardType == 0) {
                type = 'normal';
            }
            else if(boardType == 1){
                type = 'miss';
            }
            else if(boardType == 2){
                type = 'move';
                let moveB_r = cc.moveTo(Math.random()+4, cc.p(640-this.next_board.width, this.next_pos_y ));
                let moveB_l = cc.moveTo(Math.random()+4, cc.p(0, this.next_pos_y ));
                let moveB_seq = cc.sequence(moveB_r, moveB_l);
                this.next_board.runAction( cc.repeatForever(moveB_seq) );
            }
            else if(boardType == 3){
                type = 'break';
            }
            this.next_board.name = 'board';
            this.next_board.tag = type;
            this.next_board.no = this.boardNo;
            this.boardNo++;
            // 添加道具
            if(Math.random()<0 && boardType!=3){
                let randomProp = Math.floor(Math.random() * 1);
                let prop = cc.instantiate(this.prop_prefab[randomProp]);
                let propTag;
                this.next_board.addChild(prop, -1, 0);
                switch(randomProp) {
                    case 0:
                        propTag = 'spring';
                        break;
                    case 1:
                        propTag = 'rocket';
                        break;
                }
                prop.name = 'prop';
                prop.tag = propTag;
                prop.setPosition( Math.random()*(this.next_board.width - prop.width), 0 + prop.height );
            }
        }
    },
});