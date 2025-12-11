import { _decorator, Component, JsonAsset, resources, error } from 'cc';
const { ccclass, property } = _decorator;

// 엑셀 컬럼과 똑같은 이름으로 데이터 형식을 정의합니다.
interface ItemData {
    id: number;
    type: string;
    name: string;
    image_path: string;
    tags: string[]; // 엑셀에선 문자열이지만, 코드에선 배열로 변환해서 쓸 겁니다.
}

@ccclass('DataManager')
export class DataManager extends Component {
    
    // 어디서든 부를 수 있게 싱글톤(Singleton)으로 만듭니다.
    public static Instance: DataManager = null;

    public items: ItemData[] = [];
    public missions: any[] = [];
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
        // 'data/game_data'는 확장자(.json)를 빼고 경로만 적습니다.
        resources.load('data/game_data', JsonAsset, (err, asset) => {
            if (err) {
                error(err.message || err);
                return;
            }

            // JSON 데이터를 가져옵니다.
            const jsonData = asset.json;

            // 1. 아이템 데이터 파싱
            this.items = jsonData.items.map((item: any) => {
                return {
                    ...item,
                    // 엑셀에서 "cute,pink"라고 쓴 걸 ["cute", "pink"] 배열로 쪼갭니다.
                    tags: item.tags.split(',') 
                };
            });

            // 2. 미션 데이터 파싱
            this.missions = jsonData.missions.map((mission: any) => {
                return {
                    ...mission,
                    req_tags: mission.req_tags.split(',')
                };
            });

            this.isLoaded = true;
            console.log("데이터 로드 완료!", this.items);
        });
    }

    // 아이템 ID로 정보를 찾는 함수 (나중에 씁니다)
    getItemById(id: number) {
        return this.items.find(item => item.id === id);
    }
}