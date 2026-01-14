import { _decorator, Component, Sprite, resources, SpriteFrame, error, Color } from 'cc';
import { DataManager, ItemData } from './DataManager'; // DataManager에서 인터페이스 가져옴
const { ccclass, property } = _decorator;

@ccclass('StageManager')
export class StageManager extends Component {
    public static Instance: StageManager = null;

    // cookieSlot은 이제 '모델(캐릭터)'이 서 있는 자리가 됩니다.
    @property(Sprite) cookieSlot: Sprite = null!; 
    @property(Sprite) petSlot: Sprite = null!;
    @property(Sprite) treasureSlot: Sprite = null!;

    // 현재 장착된 아이템 데이터 저장
    public currentCostume: ItemData = null;
    public currentPet: ItemData = null;
    public currentTreasure: ItemData = null;

    onLoad() {
        StageManager.Instance = this;
    }

    // 스테이지 시작 시 기본 모델(알몸 쿠키) 세팅 함수
    // GameFlowManager나 GameController에서 이 함수를 호출해줘야 합니다.
    initStageModel(stageId: number) {
        if (!DataManager.Instance) return;

        // 1. 스테이지 정보 가져오기
        const stageData = DataManager.Instance.getStage(stageId);
        if (!stageData) return;

        // 2. 모델 정보 가져오기
        const modelData = DataManager.Instance.getBaseModel(stageData.model_id);
        if (!modelData) return;

        console.log(`스테이지 ${stageId} 준비: 모델 ${modelData.name} 로드 중...`);

        // 3. 기존 장착 아이템 초기화
        this.currentCostume = null;
        this.currentPet = null;
        this.currentTreasure = null;
        
        // 슬롯 이미지 초기화 (펫, 보물은 비우기)
        this.petSlot.spriteFrame = null;
        this.treasureSlot.spriteFrame = null;

        // 4. 모델 이미지 로드 및 적용
        const modelPath = modelData.image_path + '/spriteFrame';
        resources.load(modelPath, SpriteFrame, (err, spriteFrame) => {
            if (!err) {
                this.cookieSlot.spriteFrame = spriteFrame;
                this.cookieSlot.color = Color.WHITE;
            } else {
                error("모델 로드 실패: " + modelPath);
            }
        });
    }

    // 아이템 장착 함수 (Costume, Pet, Treasure)
    equipItem(data: ItemData) {
        console.log(`장착 요청됨: ${data.name} (${data.type})`);

        let targetSlot: Sprite = null;

        // 타입 체크
        if (data.type === 'costume') { 
            // 코스튬은 쿠키 슬롯(모델 위)에 입힙니다.
            targetSlot = this.cookieSlot;
            this.currentCostume = data; 
        } 
        else if (data.type === 'pet') {
            targetSlot = this.petSlot;
            this.currentPet = data;
        } 
        else if (data.type === 'treasure') {
            targetSlot = this.treasureSlot;
            this.currentTreasure = data;
        }

        if (!targetSlot) return;

        // 이미지 교체
        const finalPath = data.image_path + '/spriteFrame';
        resources.load(finalPath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                error(`이미지 로드 실패: ${finalPath}`);
                return;
            }
            targetSlot.spriteFrame = spriteFrame;
            targetSlot.color = Color.WHITE;
        });
    }
}