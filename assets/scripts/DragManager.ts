import { _decorator, Component, Node, Vec3, UITransform, EventTouch, Sprite, resources, SpriteFrame, Vec2 } from 'cc';
import { StageManager } from './StageManager';
const { ccclass, property } = _decorator;

@ccclass('DragManager')
export class DragManager extends Component {
    public static Instance: DragManager = null;

    @property(Node) dragIconNode: Node = null!; // 따라다닐 가짜 아이템 노드
    private canvasTransform: UITransform = null;    // 좌표 변환을 위한 캔버스

    private currentData: any = null; // 현재 드래그 중인 아이템 데이터

    onLoad() {
        DragManager.Instance = this;
        this.dragIconNode.active = false;
        // 내 부모(DragLayer)의 부모(Canvas)에서 Transform 컴포넌트 찾기
        this.canvasTransform = this.node.parent.getComponent(UITransform) || this.node.parent.parent.getComponent(UITransform);
    }

    // 1. 드래그 시작 (ShopItem이 호출함)
    public startDrag(data: any, screenPos: Vec2) {
        this.currentData = data;
        this.dragIconNode.active = true;

        // 이미지 로드
        const imagePath = data.image_path + '/spriteFrame';
        resources.load(imagePath, SpriteFrame, (err, spriteFrame) => {
            if (!err) {
                this.dragIconNode.getComponent(Sprite).spriteFrame = spriteFrame;
            }
        });

        this.updateDragPosition(screenPos);
    }

    // 2. 드래그 중
    public onDragMove(screenPos: Vec2) {
        this.updateDragPosition(screenPos);
    }

    // 3. 드래그 끝
    public onDragEnd() {
        this.dragIconNode.active = false;

        if (!this.currentData) return;

        // 자석 판정 로직 실행
        this.checkSnapToSlot();
        this.currentData = null;
    }

    // 좌표 변환 및 이동 함수
    private updateDragPosition(screenPos: Vec2) {
        if (!this.canvasTransform) return;
        // 화면 좌표 -> 노드 좌표 변환
        const localPos = this.canvasTransform.convertToNodeSpaceAR(new Vec3(screenPos.x, screenPos.y, 0));
        this.dragIconNode.setPosition(localPos);
    }

    // 자석 기능 (핵심 로직)
    private checkSnapToSlot() {
        if (!StageManager.Instance) return;

        let targetSlotNode: Node = null;

        // 아이템 타입에 따라 목표 슬롯 결정
        // (JSON 데이터의 type이 'costume'으로 바뀌었으므로 여기도 수정)
        if (this.currentData.type === 'costume') targetSlotNode = StageManager.Instance.cookieSlot.node;
        else if (this.currentData.type === 'pet') targetSlotNode = StageManager.Instance.petSlot.node;
        else if (this.currentData.type === 'treasure') targetSlotNode = StageManager.Instance.treasureSlot.node;

        if (!targetSlotNode) return;

        // 거리 계산 (World Position 기준)
        const ghostWorldPos = this.dragIconNode.getWorldPosition();
        const slotWorldPos = targetSlotNode.getWorldPosition();
        const distance = Vec3.distance(ghostWorldPos, slotWorldPos);

        // 거리가 150 미만이면 장착 (판정 범위는 조절 가능)
        if (distance < 150) {
            console.log("착! 자석 장착 성공");
            StageManager.Instance.equipItem(this.currentData);
        } else {
            console.log("거리가 너무 멀어요. 장착 실패");
        }
    }
}