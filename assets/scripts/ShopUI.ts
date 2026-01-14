import { _decorator, Component, Node, Prefab, instantiate, Sprite, resources, SpriteFrame, Label } from 'cc';
import { DataManager } from './DataManager';
import { PlayerData } from './PlayerData'; // 돈 정보를 가져오기 위해
import { ShopItem } from './ShopItem';     // ShopItem 스크립트 불러오기
const { ccclass, property } = _decorator;

@ccclass('ShopUI')
export class ShopUI extends Component {

    @property(Prefab) itemPrefab: Prefab = null!; 

    @property(Node) costumeContent: Node = null!; // 의상들이 들어갈 부모 노드
    @property(Node) petContent: Node = null!;     // 펫들이 들어갈 부모 노드
    @property(Node) treasureContent: Node = null!; // 악세서리가 들어갈 부모 노드
    
    // 보유 코인을 보여줄 라벨 (에디터에서 연결 필요)
    @property(Label) coinLabel: Label = null!;
    
    // 생성된 아이템들을 관리하는 리스트 (한꺼번에 새로고침 하려고)
    private generatedItems: ShopItem[] = [];

    start() {
        // 매니저 호출 대기
    }

    public openShop() {
        this.checkDataLoaded();
    }

    checkDataLoaded() {
        if (!DataManager.Instance || !DataManager.Instance.isLoaded) {
            this.scheduleOnce(() => this.checkDataLoaded(), 0.1);
            return;
        }
        // 데이터 로드 완료되면 아이템 배치 시작
        this.spawnAllItems();
    }

    spawnAllItems() {
        // 1. 기존 목록 싹 비우기
        this.costumeContent.removeAllChildren();
        this.petContent.removeAllChildren();
        this.treasureContent.removeAllChildren();
        this.generatedItems = []; 

        // 2. 코인 갱신
        this.updateCoinLabel();

        // 3. 전체 아이템 가져오기
        const allItems = DataManager.Instance.items;

        allItems.forEach((data) => {
            // 타입에 따라 들어갈 부모 노드 결정
            let parentNode: Node = null;

            if (data.type === 'costume') parentNode = this.costumeContent;
            else if (data.type === 'pet') parentNode = this.petContent;
            else if (data.type === 'treasure') parentNode = this.treasureContent;

            // 해당 타입 구역이 연결되어 있다면 생성
            if (parentNode) {
                this.createItem(data, parentNode);
            }
        });
    }

    // 아이템 생성 로직 분리
    createItem(data: any, parent: Node) {
        const newItem = instantiate(this.itemPrefab);
        newItem.parent = parent;

        const shopItemComp = newItem.getComponent(ShopItem);
        
        if (shopItemComp) {
            // 1. 데이터 초기화
            shopItemComp.init(data, this); 
            this.generatedItems.push(shopItemComp); 

            // 2. 이미지 로드 및 적용
            const imagePath = data.image_path + '/spriteFrame';
            resources.load(imagePath, SpriteFrame, (err, spriteFrame) => {
                if (!err) {
                    // ShopItem 컴포넌트에 연결된 itemImage 속성을 사용합니다.
                    if (shopItemComp.itemImage) {
                        shopItemComp.itemImage.spriteFrame = spriteFrame;
                    }
                }
            });
        }
    }
    
    // 아이템 하나를 샀을 때, 전체 UI를 새로고침하는 함수
    // (ShopItem 스크립트에서 구매 성공 시 이 함수를 호출합니다)
    public refreshAllItems() {
        // 1. 코인 숫자 갱신
        this.updateCoinLabel();

        // 2. 모든 아이템 버튼 상태 갱신 (돈 줄었으니 비싼 건 비활성화 되게)
        this.generatedItems.forEach(item => item.refreshState());
    }

    //코인 라벨 업데이트 함수
    updateCoinLabel() {
        if (this.coinLabel) {
            this.coinLabel.string = `${PlayerData.stageMoney}`;
        }
    }
}