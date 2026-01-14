import { _decorator, Component, Node, Prefab, SpriteFrame, instantiate, Vec2, UITransform, tween, Vec3, Sprite, Label, director } from 'cc';
import { PuzzlePiece } from './PuzzlePiece';
import { PlayerData } from './PlayerData'; 
import { GameFlowManager } from './GameFlowManager';
const { ccclass, property } = _decorator;

@ccclass('PuzzleManager')
export class PuzzleManager extends Component {

    @property(Prefab) piecePrefab: Prefab = null!; // 블록 프리팹
    @property([SpriteFrame]) pieceImages: SpriteFrame[] = []; // 블록 이미지들 (5개 정도 추천)
    @property(Node) gameBoard: Node = null!; // 블록이 담길 부모 노드

    // UI 연결
    @property(Sprite) timeBar: Sprite = null!;
    @property(Label) moneyLabel: Label = null!; // 현재 번 돈 표시
    @property(Node) resultPopup: Node = null!;  // 게임 끝났을 때 뜰 팝업

    // 설정값
    private rows: number = 7;
    private cols: number = 7;
    private pieceSize: number = 100; // 블록 크기 + 간격
    private startPos: Vec2 = new Vec2(-300, -300); // 0,0 블록이 시작될 위치

    // 게임 상태
    private grid: PuzzlePiece[][] = []; // 2차원 배열
    private selectedPiece: PuzzlePiece = null; // 현재 선택한 블록
    private isProcessing: boolean = false; // 애니메이션 중 터치 방지

    private maxGameTime: number = 20; // 최대 제한시간
    private gameTime: number = 20; // 제한시간 60초
    private currentMoney: number = 0; // 이번 판에서 번 돈
    private isGameOver: boolean = false;

    private flowManager: GameFlowManager = null;

    start() {
        // this.initBoard();
        // this.resultPopup.active = false; // 결과창 숨기기
        // this.updateUI();
    }

    public gameStart(manager: GameFlowManager) {
        this.flowManager = manager; // 매니저 기억하기
        
        // 상태 초기화
        this.maxGameTime = 10;
        this.gameTime = this.maxGameTime;

        this.currentMoney = 0;
        this.isGameOver = false;
        this.resultPopup.active = false;

        // 게이지 바 가득 채우기 (1.0 = 100%)
        if (this.timeBar) {
            this.timeBar.fillRange = 1;
        }
        
        this.initBoard();
        this.updateUI();
    }

    update(deltaTime: number) {
        if (this.isGameOver) return;

        // 1. 타이머 감소
        this.gameTime -= deltaTime;
        
        if (this.gameTime <= 0) {
            this.gameTime = 0;
            this.onGameOver();
        }

        if (this.timeBar) {
            // 현재시간 / 전체시간 = 0.0 ~ 1.0 사이 값
            this.timeBar.fillRange = this.gameTime / this.maxGameTime;
        }
    }

    // 1. 보드 생성 (초기화)
    initBoard() {
        this.grid = [];
        this.gameBoard.removeAllChildren();

        for (let x = 0; x < this.cols; x++) {
            this.grid[x] = [];
            for (let y = 0; y < this.rows; y++) {
                this.spawnPiece(x, y);
            }
        }
        
        // 처음에 이미 매칭된 게 있으면 다시 섞거나 그냥 둠 (여기선 생략)
    }

    // 블록 생성 함수
    spawnPiece(x: number, y: number) {
        const type = Math.floor(Math.random() * this.pieceImages.length);
        const node = instantiate(this.piecePrefab);
        node.parent = this.gameBoard;
        
        const piece = node.getComponent(PuzzlePiece);
        piece.init(x, y, type, this.pieceImages[type]);
        piece.updatePosition(this.pieceSize, this.startPos);
        
        this.grid[x][y] = piece;

        // 터치 이벤트 연결
        node.on(Node.EventType.TOUCH_END, () => this.onPieceClicked(piece), this);
    }

    // 2. 터치 로직
    onPieceClicked(piece: PuzzlePiece) {
        if (this.isGameOver || this.isProcessing) return; // 게임 끝나면 터치 금지

        // 첫 번째 선택
        if (!this.selectedPiece) {
            this.selectedPiece = piece;
            piece.setSelect(true);
            return;
        }

        // 같은 거 또 누르면 취소
        if (this.selectedPiece === piece) {
            piece.setSelect(false);
            this.selectedPiece = null;
            return;
        }

        // 두 번째 선택 -> 거리 확인 (옆칸인가?)
        const dist = Math.abs(this.selectedPiece.x - piece.x) + Math.abs(this.selectedPiece.y - piece.y);
        
        if (dist === 1) {
            // 바로 옆칸이면 교체 시도
            this.swapPieces(this.selectedPiece, piece);
            this.selectedPiece.setSelect(false);
            this.selectedPiece = null;
        } else {
            // 멀리 있는 거면 선택 변경
            this.selectedPiece.setSelect(false);
            this.selectedPiece = piece;
            piece.setSelect(true);
        }
    }

    // 3. 교체 (Swap)
    swapPieces(p1: PuzzlePiece, p2: PuzzlePiece) {
        this.isProcessing = true;

        // 배열 상에서 데이터 교체
        const tempType = p1.type;
        const tempSprite = p1.node.getComponent(Sprite).spriteFrame;

        // 애니메이션 없이 즉시 이미지와 타입만 바꿈 (구현 난이도 낮추기 위해)
        // (제대로 하려면 MoveTo 액션 후 위치 바꿔야 함)
        p1.type = p2.type;
        p1.node.getComponent(Sprite).spriteFrame = p2.node.getComponent(Sprite).spriteFrame;

        p2.type = tempType;
        p2.node.getComponent(Sprite).spriteFrame = tempSprite;

        // 매칭 검사
        this.scheduleOnce(() => {
            if (this.checkMatch()) {
                // 매칭 성공!
                this.isProcessing = false; 
            } else {
                // 매칭 실패! 원상복구 (다시 뒤집기)
                const tempTypeRe = p1.type;
                const tempSpriteRe = p1.node.getComponent(Sprite).spriteFrame;
                
                p1.type = p2.type;
                p1.node.getComponent(Sprite).spriteFrame = p2.node.getComponent(Sprite).spriteFrame;
                
                p2.type = tempTypeRe;
                p2.node.getComponent(Sprite).spriteFrame = tempSpriteRe;
                
                this.isProcessing = false;
            }
        }, 0.3);
    }

    // 4. 매칭 알고리즘 (핵심)
    checkMatch(): boolean {
        let matched = false;
        const removeList: PuzzlePiece[] = [];

        // 가로 검사
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols - 2; x++) {
                const p1 = this.grid[x][y];
                const p2 = this.grid[x+1][y];
                const p3 = this.grid[x+2][y];
                if (p1.type === p2.type && p2.type === p3.type) {
                    removeList.push(p1, p2, p3);
                    matched = true;
                }
            }
        }

        // 세로 검사
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows - 2; y++) {
                const p1 = this.grid[x][y];
                const p2 = this.grid[x][y+1];
                const p3 = this.grid[x][y+2];
                if (p1.type === p2.type && p2.type === p3.type) {
                    removeList.push(p1, p2, p3);
                    matched = true;
                }
            }
        }

        if (matched) {
            // 중복 제거 후 삭제
            const uniqueList = [...new Set(removeList)];
            this.destroyPieces(uniqueList);
        }

        return matched;
    }

    // 5. 블록 파괴 및 재생성
    destroyPieces(list: PuzzlePiece[]) {
        // 점수 추가
        const gainMoney = list.length * 10;
        this.currentMoney += gainMoney;
        this.updateUI();

        console.log(`매칭 성공! +${gainMoney}코인`);

        // 파괴 연출 (깜빡임) 후 새 블록으로 교체
        list.forEach(piece => {
            tween(piece.node)
                .to(0.1, { scale: new Vec3(0, 0, 1) }) // 작아짐
                .call(() => {
                    // 새 타입으로 변경
                    const newType = Math.floor(Math.random() * this.pieceImages.length);
                    piece.type = newType;
                    piece.node.getComponent(Sprite).spriteFrame = this.pieceImages[newType];
                    piece.node.setScale(1, 1, 1); // 다시 커짐
                })
                .start();
        });

        // 애니팡처럼 위에 블록이 떨어지는 로직은 복잡하므로,
        // 여기서는 "제자리에서 새 블록이 뿅 생기는 방식"으로 타협합니다. (2주 완성용)
    }

    updateUI() {
        // UI에 현재 돈 표시
        this.moneyLabel.string = `${this.currentMoney}`;
    }

    // 게임 종료 처리
    onGameOver() {
        this.isGameOver = true;
        console.log("게임 종료!");

        // 1. 이번 판에서 번 돈을 전역 데이터에 저장 (상점에서 쓰기 위해)
        // PlayerData.coin (전체 재산)이 아니라, PlayerData.stageMoney (임시 예산)에 저장한다고 가정
        // 여기서는 편의상 PlayerData에 'stageMoney'라는 변수가 있다고 칩니다.
        // 만약 PlayerData.ts에 없다면 -> public static stageMoney: number = 0; 추가 필요.
        
        // PlayerData.coin = this.currentMoney; // (A안: 전재산 교체)
        PlayerData.stageMoney = this.currentMoney; // (B안: 스테이지 예산 저장)

        // 2. 결과 팝업 띄우기
        this.resultPopup.active = true;
        
        // 2초 뒤에 자동으로 상점으로 이동
        this.scheduleOnce(() => {
            if (this.flowManager) {
                this.flowManager.onPuzzleFinished(); 
            }
        }, 2.0);
    }

    // 팝업의 [상점으로 가기] 버튼에 연결할 함수
    public onClickGoToShop() {
        // 상점 씬(또는 메인 씬)으로 이동
        // 예: director.loadScene("MainScene"); 
        // 혹은 현재 씬에서 Job UI를 끄고 Shop UI를 켜는 방식이면 그렇게 처리
        console.log("상점으로 이동합니다.");
        
        // 예시: 팝업 닫고 상점 UI 켜기 (GameController가 있다면 거기 함수 호출)
        // director.loadScene("MainScene"); 
    }
}