import { _decorator, Component, Label, Node, UIOpacity, tween, Vec3, sys } from 'cc';
import { DataManager } from './DataManager';
import { StageManager } from './StageManager';
import { SoundManager } from './SoundManager';
import { FocusGame } from './FocusGame';
import { PlayerData } from './PlayerData';

const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {

    @property(Label) missionLabel: Label = null!;        // 미션 텍스트
    @property(UIOpacity) flashEffect: UIOpacity = null!; // 플래시 효과
    
    // ▼ 결과창 UI 연결
    @property(Node) resultPopup: Node = null!;           // 결과창 팝업 노드
    @property(Label) resultScoreLabel: Label = null!;    // 점수 텍스트
    @property(Node) star1: Node = null!;                 // 별 1 (Active 껐다 켰다 할 것임)
    @property(Node) star2: Node = null!;                 // 별 2
    @property(Node) star3: Node = null!;                 // 별 3

    @property(FocusGame) focusGame: FocusGame = null!;   // 미니게임 연결

    // 현재 진행 중인 스테이지 ID (기본 1)
    private currentStageId: number = 1;

    start() {
        // 데이터 로드 대기 후 스테이지 초기화
        this.scheduleOnce(() => {
            this.initStage(this.currentStageId);
        }, 0.2);
    }

    // 1. 스테이지 초기화 (미션 텍스트 & 모델 세팅)
    initStage(stageId: number) {
        // 데이터 매니저에서 스테이지 정보 가져오기
        const stageData = DataManager.Instance.getStage(stageId);
        if (!stageData) {
            console.error(`스테이지 ${stageId} 정보를 찾을 수 없습니다.`);
            return;
        }

        this.currentStageId = stageId;

        // 화면에 의뢰 내용 띄우기
        this.missionLabel.string = `의뢰: "${stageData.mission_text}"`;
        
        // StageManager에게 "기본 모델(알몸 쿠키)" 세워달라고 요청
        if (StageManager.Instance) {
            StageManager.Instance.initStageModel(stageId);
        }

        // 결과창 및 별 초기화 (숨김)
        this.resultPopup.active = false;
        this.flashEffect.opacity = 0;
    }

    // [촬영] 버튼이 연결될 함수
    onShutterPressed() {
        // 초점 맞추기 미니게임 시작
        if (this.focusGame) {
            this.focusGame.gameStart(this);
        }
    }

    // 미니게임이 끝나면 호출되는 함수 (결과: 성공/실패)
    finishShooting(isSuccess: boolean) {
        // 0. 셔터 소리 재생
        SoundManager.Instance.playShutter();

        // 1. 플래시 연출
        tween(this.flashEffect)
            .to(0.1, { opacity: 255 })
            .to(0.2, { opacity: 0 })
            .call(() => {
                // 2. 채점 시작
                this.calculateScore(isSuccess);
            })
            .start();
    }

    // 점수 계산 로직 (+100 / -100)
    calculateScore(isFocusPerfect: boolean) {
        console.log("=== 채점 시작 ===");

        // 1. 이번 스테이지의 요구 태그 가져오기
        const stageData = DataManager.Instance.getStage(this.currentStageId);
        const reqTags: string[] = stageData.req_tags; // 예: ["cool", "party", "accessory"]

        let totalScore = 0;
        let detailMsg = "";

        // 2. 현재 장착된 아이템들 가져오기
        const equippedItems = [
            StageManager.Instance.currentCostume, // (주의: Cookie -> Costume으로 변수명 변경됨)
            StageManager.Instance.currentPet,
            StageManager.Instance.currentTreasure
        ];

        // 3. 아이템별 점수 계산
        equippedItems.forEach(item => {
            if (item) {
                // 아이템의 태그들 (예: ["cute", "cool", "casual"])
                const itemTags: string[] = item.tags;

                itemTags.forEach(tag => {
                    // 요구 태그에 포함되어 있는가?
                    if (reqTags.includes(tag)) {
                        totalScore += 100; // 일치 (+100)
                    } else {
                        totalScore -= 10; // 불일치 (-10 감점)
                    }
                });
            }
        });

        // 4. 초점 보너스/패널티
        if (!isFocusPerfect) {
            totalScore -= 50; // 초점 빗나감 (감점)
            detailMsg = "(초점 흔들림!)";
        } else {
            detailMsg = "(초점 완벽!)";
        }

        // 0점 밑으로는 안 내려가게 방지
        if (totalScore < 0) totalScore = 0;

        // 5. 별점 계산 (900점 만점 기준)
        let stars = 0;
        if (totalScore >= 900) stars = 3;      // 3성 (퍼펙트)
        else if (totalScore >= 600) stars = 2; // 2성 (해금 기준)
        else if (totalScore >= 300) stars = 1; // 1성

        // 6. 결과창 표시
        this.showResultPopup(totalScore, stars, detailMsg);
    }

    showResultPopup(score: number, stars: number, msg: string) {
        this.resultPopup.active = true;
        
        // 별 이미지 켜기/끄기
        this.star1.active = stars >= 1;
        this.star2.active = stars >= 2;
        this.star3.active = stars >= 3;

        let resultText = `${score}점\n${msg}`;

        // 7. 스테이지 해금 로직 (별 2개 이상)
        if (stars >= 2) {
            resultText += "\n★ 스테이지 클리어! ★";

            // 다음 스테이지 해금 저장 (현재 기록보다 높을 때만)
            if (this.currentStageId >= PlayerData.clearedStage) {
                PlayerData.clearedStage = this.currentStageId;
                // 로컬 저장 (앱 껐다 켜도 유지)
                sys.localStorage.setItem('clearedStage', PlayerData.clearedStage.toString());
            }
        } else {
            resultText += "\n(별 2개 이상 필요해요)";
        }

        this.resultScoreLabel.string = resultText;

        // 팝업 등장 애니메이션
        this.resultPopup.setScale(0, 0, 1);
        tween(this.resultPopup)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    // 팝업 닫기 버튼용
    onClosePopup() {
        this.resultPopup.active = false;
        // 필요하다면 여기서 씬을 다시 로드하거나, 상점으로 돌아가는 로직 추가
    }
}