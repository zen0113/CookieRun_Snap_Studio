import { _decorator, Component, JsonAsset, resources, error } from 'cc';
const { ccclass, property } = _decorator;

// 아이템 데이터 인터페이스
export interface ItemData {
    id: number;
    type: string; // 'costume', 'pet', 'treasure'
    name: string;
    image_path: string;
    tags: string[]; 
    price: number; 
}

// 스테이지 데이터 인터페이스
export interface StageData {
    id: number;
    title: string;
    model_id: number; // 이번 스테이지 주인공(쿠키) ID
    mission_text: string;
    req_tags: string[];
    target_score: number;
    available_items: number[];
}

@ccclass('DataManager')
export class DataManager extends Component {
    
    // 어디서든 부를 수 있게 싱글톤(Singleton)으로 만듭니다.
    public static Instance: DataManager = null;

    public items: ItemData[] = [];
    public stages: StageData[] = [];     
    public baseModels: any[] = [];
    public isLoaded: boolean = false;

    onLoad() {
        if (DataManager.Instance === null) {
            DataManager.Instance = this;
            // 씬이 바뀌어도 파괴되지 않게 설정 (선택사항)
            // director.addPersistRootNode(this.node);
            this.loadJsonData();
        } else {
            this.destroy();
        }
    }

    loadJsonData() {
        resources.load('data/game_data', JsonAsset, (err, asset) => {
            if (err) {
                error(err.message || err);
                return;
            }

            const jsonData = asset.json;

            // 1. 기본 모델 데이터 파싱 (그냥 가져옴)
            this.baseModels = jsonData.base_models;

            // 2. 아이템 데이터 파싱
            this.items = jsonData.items.map((item: any) => {
                return {
                    ...item,
                    // 아이템 태그는 엑셀/JSON에서 문자열("cute,pink")로 되어있다면 배열로 변환
                    tags: (typeof item.tags === 'string') ? item.tags.split(',') : item.tags
                };
            });

            // 3. 스테이지 데이터 파싱
            this.stages = jsonData.stages.map((stage: any) => {
                return {
                    ...stage,
                    // 스테이지 req_tags는 JSON에서 이미 배열(["cute", "pink"])이라면 그대로 사용
                    req_tags: stage.req_tags 
                };
            });

            this.isLoaded = true;
            console.log("데이터 로드 완료!");
            console.log(`- 아이템: ${this.items.length}개`);
            console.log(`- 스테이지: ${this.stages.length}개`);
            console.log(`- 기본모델: ${this.baseModels.length}개`);
        });
    }

    // 아이템 ID로 정보 찾기
    getItemById(id: number) {
        return this.items.find(item => item.id === id);
    }

    // 스테이지 ID로 정보 찾기
    getStage(id: number) {
        return this.stages.find(stage => stage.id === id);
    }

    // 기본 모델 ID로 정보 찾기
    getBaseModel(id: number) {
        return this.baseModels.find(model => model.id === id);
    }
}