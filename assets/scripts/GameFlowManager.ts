import { _decorator, Component, Node, Label, Sprite, director } from 'cc';
import { DataManager } from './DataManager';
import { PlayerData } from './PlayerData';
import { PuzzleManager } from './PuzzleManager';
import { ShopUI } from './ShopUI';
import { StageManager } from './StageManager';
import { GameController } from './GameController';

const { ccclass, property } = _decorator;

@ccclass('GameFlowManager')
export class GameFlowManager extends Component {

    // ▼ 패널들 연결
    @property(Node) panelRequest: Node = null!;
    @property(Node) panelJob: Node = null!;
    @property(Node) panelShop: Node = null!;
    @property(Node) panelStudio: Node = null!;

    // ▼ UI 요소들 연결
    @property(Label) missionLabel: Label = null!;     // 의뢰 텍스트
    @property(Sprite) shopTimerBar: Sprite = null!;   // 상점 남은 시간

    // ▼ 매니저들 연결 (각 패널을 초기화하기 위해)
    @property(PuzzleManager) puzzleManager: PuzzleManager = null!;
    @property(ShopUI) shopUI: ShopUI = null!;
    @property(StageManager) stageManager: StageManager = null!;
    @property(GameController) gameController: GameController = null!;

    // 설정값
    private currentStageId: number = 1;
    private shopTimeLimit: number = 10; // 상점 제한시간 45초
    private currentShopTime: number = 0;
    private isShopping: boolean = false;

    // start() {
    //     // 게임 시작 시 데이터 초기화 및 1단계 시작
    //     PlayerData.stageMoney = 0; 
    //     PlayerData.ownedItems = []; 
        
    //     // 1. 의뢰 화면 보여주기
    //     this.showRequestPhase();
    // }

    start() {
        // 데이터 로딩 대기 후 시작 (0.1초 뒤 실행)
        this.scheduleOnce(() => {
            this.initGame();
        }, 0.1);
    }

    initGame() {
        // 게임 시작 시 플레이어 상태 초기화
        PlayerData.stageMoney = 0; 
        PlayerData.ownedItems = []; 
        
        // 데이터 매니저 로드 확인
        if (!DataManager.Instance || !DataManager.Instance.isLoaded) {
            console.warn("데이터가 아직 로드되지 않아 재시도합니다...");
            this.scheduleOnce(() => this.initGame(), 0.1);
            return;
        }

        // 1. 의뢰 화면 보여주기
        this.showRequestPhase();
    }

    update(dt: number) {
        // 상점 타이머 로직
        if (this.isShopping) {
            this.currentShopTime -= dt;
            
            // 게이지 줄이기 (0.0 ~ 1.0)
            if (this.shopTimerBar) {
                this.shopTimerBar.fillRange = this.currentShopTime / this.shopTimeLimit;
            }

            if (this.currentShopTime <= 0) {
                this.currentShopTime = 0;
                this.isShopping = false;
                this.onShopTimeOver();
            }
        }
    }

    // === [1단계: 의뢰] ===
    showRequestPhase() {
        this.allPanelsOff();
        this.panelRequest.active = true;

        // 1. JSON에서 스테이지 데이터 가져오기
        const stageData = DataManager.Instance.getStage(this.currentStageId);
        
        if (stageData) {
            // 의뢰 텍스트 설정
            this.missionLabel.string = stageData.mission_text;
            
            // 의뢰 받을 때, 스테이지 주인공(모델)을 미리 세워둠
            this.stageManager.initStageModel(this.currentStageId);
        } else {
            console.error(`스테이지 ${this.currentStageId} 데이터가 없습니다.`);
        }
    }

    // [Game Start] 버튼 누르면 호출
    public onClickStartGame() {
        this.showJobPhase();
    }

    // === [2단계: 알바 (퍼즐)] ===
    showJobPhase() {
        this.allPanelsOff();
        this.panelJob.active = true;

        // 퍼즐 게임 시작 (PuzzleManager에게 GameFlowManager를 넘겨줌)
        this.puzzleManager.gameStart(this); 
    }

    // PuzzleManager가 게임 끝났을 때 호출할 함수
    public onPuzzleFinished() {
        this.showShopPhase();
    }

    // === [3단계: 상점] ===
    showShopPhase() {
        this.allPanelsOff();
        this.panelShop.active = true;

        // 상점 초기화 & 타이머 시작
        this.shopUI.openShop(); 

        // 타이머 초기화
        this.currentShopTime = this.shopTimeLimit;
        this.isShopping = true;
        
        // 게이지 가득 채우기
        if (this.shopTimerBar) {
            this.shopTimerBar.fillRange = 1; 
        }
    }

    // 시간이 다 되거나 [쇼핑 끝내기] 버튼 누르면 호출
    public onShopTimeOver() {
        this.isShopping = false;
        console.log("쇼핑 종료! 촬영장으로 이동합니다.");
        this.showStudioPhase();
    }

    // === [4단계: 스튜디오] ===
    showStudioPhase() {
        this.allPanelsOff();
        this.panelStudio.active = true;

        // GameController에게 촬영 준비(미션 세팅, 결과창 리셋) 요청
        if (this.gameController) {
            this.gameController.initStage(this.currentStageId);
        }

        // 구매한 아이템 목록을 스튜디오 리스트에 띄우기 (나중에 구현)
        // this.stageManager.loadInventory(); 
    }

    // 유틸리티: 모든 패널 끄기
    private allPanelsOff() {
        this.panelRequest.active = false;
        this.panelJob.active = false;
        this.panelShop.active = false;
        this.panelStudio.active = false;
    }
}