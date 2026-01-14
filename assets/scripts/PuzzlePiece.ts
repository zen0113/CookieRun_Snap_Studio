import { _decorator, Component, Sprite, SpriteFrame, Vec2, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PuzzlePiece')
export class PuzzlePiece extends Component {
    public x: number = 0;
    public y: number = 0;
    public type: number = 0; // 0: 용감, 1: 명랑, 2: 딸기... (종류)

    // 선택되었을 때 보여줄 하이라이트 이미지 (선택사항)
    @property(Node) selectHighlight: Node = null; 

    // 초기화 함수
    init(x: number, y: number, type: number, spriteFrame: SpriteFrame) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.node.getComponent(Sprite).spriteFrame = spriteFrame;
        if(this.selectHighlight) this.selectHighlight.active = false;
    }

    // 좌표 업데이트 (화면상 위치 이동)
    updatePosition(gridSize: number, startPos: Vec2) {
        // 그리드 좌표(0,0)를 화면 좌표(-300, -300)로 변환
        const posX = startPos.x + this.x * gridSize;
        const posY = startPos.y + this.y * gridSize;
        this.node.setPosition(posX, posY, 0);
    }

    // 선택 효과 켜기/끄기
    setSelect(isSelected: boolean) {
        if(this.selectHighlight) this.selectHighlight.active = isSelected;
        // 하이라이트 없으면 크기 조절로 효과 대체
        if(isSelected) this.node.setScale(1.2, 1.2, 1);
        else this.node.setScale(1, 1, 1);
    }
}