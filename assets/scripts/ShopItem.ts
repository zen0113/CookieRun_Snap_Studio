import { _decorator, Component, Node, Label, Button, Color, Sprite, SpriteFrame } from 'cc';
import { PlayerData } from './PlayerData';
import { ShopUI } from './ShopUI'; // ShopUI와 통신 필요
const { ccclass, property } = _decorator;

@ccclass('ShopItem')
export class ShopItem extends Component {

    @property(Label) priceLabel: Label = null!; // 가격 표시 텍스트
    @property(Sprite) itemImage: Sprite = null!; // 아이템 이미지 스프라이트
    @property(Button) buyButton: Button = null!; // 클릭할 버튼 컴포넌트

    @property(Sprite) titleImage: Sprite = null!;

    @property(SpriteFrame) imgTitleCostume: SpriteFrame = null!; // 의상용 이미지
    @property(SpriteFrame) imgTitlePet: SpriteFrame = null!;     // 펫용 이미지
    @property(SpriteFrame) imgTitleTreasure: SpriteFrame = null!;// 악세서리용 이미지

    @property(SpriteFrame) btnNormalImage: SpriteFrame = null!; 
    @property(SpriteFrame) btnDisableImage: SpriteFrame = null!;

    private myData: any = null;
    private shopUI: ShopUI = null; // 부모 UI (돈 갱신 요청용)

    // 초기화 함수 (데이터 + 부모 UI 받기)
    init(data: any, shopUI: ShopUI) {
        this.myData = data;
        this.shopUI = shopUI;
        this.refreshState(); // 데이터 받자마자 상태 갱신
    }

    // 상태 갱신 (돈이 변하거나 구매했을 때 호출됨)
    refreshState() {
        if (!this.myData) return;

        if (this.titleImage) {
            if (this.myData.type === 'costume') {
                this.titleImage.spriteFrame = this.imgTitleCostume;
            } else if (this.myData.type === 'pet') {
                this.titleImage.spriteFrame = this.imgTitlePet;
            } else if (this.myData.type === 'treasure') {
                this.titleImage.spriteFrame = this.imgTitleTreasure;
            }
        }

        // 가격 표시
        this.priceLabel.string = `${this.myData.price}`;

        const btnSprite = this.buyButton.node.getComponent(Sprite);

        // 1. 이미 가지고 있는 경우
        if (PlayerData.ownedItems.indexOf(this.myData.id) !== -1) { 
            this.buyButton.interactable = false; 
            this.priceLabel.string = "보유중";
            this.priceLabel.color = Color.WHITE;

            // 버튼 모양을 '비활성화(회색)' 이미지로 변경
            if (btnSprite && this.btnDisableImage) {
                btnSprite.spriteFrame = this.btnDisableImage;
            }

            // 아이템 이미지를 회색(Grayscale)으로 만들기
            if (this.itemImage) {
                this.itemImage.grayscale = true; 
            }
            return;
        }

        // 2. 안 가지고 있는 경우 -> 돈 체크
        // 글씨 색상은 항상 흰색 유지
        this.priceLabel.color = Color.WHITE;

        // 아이템 이미지 색상 원상복구 (혹시 재사용될 때를 대비)
        if (this.itemImage) {
            this.itemImage.grayscale = false; 
        }

        if (PlayerData.stageMoney >= this.myData.price) {
            // [구매 가능]
            this.buyButton.interactable = true; // 버튼 활성화
            
            // 이미지: 평소 이미지로 변경
            if (btnSprite && this.btnNormalImage) {
                btnSprite.spriteFrame = this.btnNormalImage;
            }
        } else {
            // [돈 부족]
            this.buyButton.interactable = false; // 버튼 비활성화 (클릭 불가)
            
            // 이미지: 못 사는 이미지(회색 등)로 변경
            if (btnSprite && this.btnDisableImage) {
                btnSprite.spriteFrame = this.btnDisableImage;
            }
            // 글씨 색상 변경 로직 삭제함 (Color.RED 부분 제거)
        }
    }

    // 버튼 클릭 이벤트 핸들러 (에디터에서 연결)
    onBuyClick() {
        if (!this.myData) return;
        // 중복 구매 방지
        if (PlayerData.ownedItems.indexOf(this.myData.id) !== -1) return;

        if (PlayerData.stageMoney >= this.myData.price) {
            // === [구매 성공] ===
            PlayerData.stageMoney -= this.myData.price; // 돈 차감
            PlayerData.ownedItems.push(this.myData.id); // 목록 추가
            console.log(`구매 성공! 남은 돈: ${PlayerData.stageMoney}`);

            // UI 갱신 요청 (상점 전체 새로고침)
            if (this.shopUI) {
                this.shopUI.refreshAllItems();
            }
        } else {
            console.log("돈이 부족합니다!");
        }
    }
}