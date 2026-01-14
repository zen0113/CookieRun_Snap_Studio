import { _decorator, Component, Node, Prefab, instantiate, Sprite, resources, SpriteFrame, Label } from 'cc';
import { DataManager } from './DataManager';
import { PlayerData } from './PlayerData';
import { DraggableItem } from './DraggableItem';
const { ccclass, property } = _decorator;

@ccclass('InventoryUI')
export class InventoryUI extends Component {

    @property(Prefab) itemPrefab: Prefab = null!; // Prefab_DraggableItem 연결
    @property(Node) contentArea: Node = null!;    // ScrollView의 Content

    private currentTabType: string = 'costume';   // 기본 탭

    // 화면이 켜질 때마다 인벤토리 새로고침
    onEnable() {
        this.showTab(this.currentTabType);
    }

    // 탭 버튼 클릭 시 호출 (에디터 연결: CustomEventData에 costume, pet, treasure 입력)
    public onClickTab(event: any, customEventData: string) {
        this.showTab(customEventData);
    }

    showTab(type: string) {
        this.currentTabType = type;
        
        // 1. 기존 목록 비우기
        this.contentArea.removeAllChildren();

        // 2. 전체 아이템 중 "내가 가진 것(Owned)" && "현재 탭 타입" 필터링
        const allItems = DataManager.Instance.items;
        
        const myItems = allItems.filter(item => {
            // 조건 1: 내 주머니(ownedItems)에 ID가 있는가?
            const isOwned = PlayerData.ownedItems.indexOf(item.id) !== -1;
            // 조건 2: 타입이 맞는가?
            const isTypeMatch = item.type === type;
            
            return isOwned && isTypeMatch;
        });

        console.log(`[인벤토리] ${type} 탭: ${myItems.length}개 보유중`);

        // 3. 아이템 생성
        myItems.forEach((data) => {
            const newItem = instantiate(this.itemPrefab);
            newItem.parent = this.contentArea;

            // DraggableItem 컴포넌트에 데이터 주입
            const dragScript = newItem.getComponent(DraggableItem);
            if (dragScript) {
                dragScript.init(data); // 데이터 넘겨주기
            }

            // 이미지 로드
            const imagePath = data.image_path + '/spriteFrame';
            resources.load(imagePath, SpriteFrame, (err, spriteFrame) => {
                if (!err) {
                    const sprite = newItem.getComponent(Sprite);
                    if (sprite) sprite.spriteFrame = spriteFrame;
                }
            });
        });
    }
}