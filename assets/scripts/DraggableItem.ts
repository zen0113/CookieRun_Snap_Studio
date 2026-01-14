import { _decorator, Component, Node, EventTouch } from 'cc';
import { DragManager } from './DragManager';

const { ccclass, property } = _decorator;

@ccclass('DraggableItem')
export class DraggableItem extends Component {

    // 상점용 변수들(priceLabel, buyButton 등)은 여기서는 필요 없어서 지웠습니다.
    // 오직 드래그 기능에만 집중합니다.

    private myData: any = null;

    init(data: any) {
        this.myData = data;
    }

    onLoad() {
        // 터치 이벤트 등록 (드래그용)
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        // DragManager에게 드래그 시작 요청
        if (DragManager.Instance) {
            // (중요) ShopItem이 아니라 DraggableItem 컴포넌트가 붙은 노드에서 데이터를 가져감
            DragManager.Instance.startDrag(this.myData, event.getUILocation());
        }
    }

    onTouchMove(event: EventTouch) {
        if (DragManager.Instance) {
            DragManager.Instance.onDragMove(event.getUILocation());
        }
    }

    onTouchEnd(event: EventTouch) {
        if (DragManager.Instance) {
            DragManager.Instance.onDragEnd();
        }
    }
}