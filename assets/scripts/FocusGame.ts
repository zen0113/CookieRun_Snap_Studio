import { _decorator, Component, Node, UITransform, Vec3, Label } from 'cc';
import { GameController } from './GameController'; // GameController와 소통해야 함
const { ccclass, property } = _decorator;

@ccclass('FocusGame')
export class FocusGame extends Component {

    @property(Node) cursor: Node = null!;      // 빨간 바늘
    @property(Node) successZone: Node = null!; // 초록 구간
    @property(Node) barBg: Node = null!;       // 회색 바 (길이 측정용)

    private isRunning: boolean = false;
    private moveSpeed: number = 400; // 바늘 이동 속도
    private direction: number = 1;   // 1: 오른쪽, -1: 왼쪽
    private limitX: number = 0;      // 바의 끝부분 좌표

    // GameController를 기억해뒀다가 결과를 알려줄 변수
    private gameController: GameController = null;

    onLoad() {
        // 바의 절반 길이 계산 (예: 500 / 2 = 250)
        const barWidth = this.barBg.getComponent(UITransform).width;
        this.limitX = barWidth / 2;
    }

    // 게임 시작 함수 (GameController가 호출함)
    public gameStart(controller: GameController) {
        this.gameController = controller;
        this.node.active = true;
        this.isRunning = true;
        
        // 바늘 초기화 (왼쪽 끝)
        this.cursor.setPosition(new Vec3(-this.limitX, 0, 0));
        this.direction = 1;
    }

    update(deltaTime: number) {
        if (!this.isRunning) return;

        // 1. 바늘 이동
        const currentPos = this.cursor.position;
        let newX = currentPos.x + (this.moveSpeed * this.direction * deltaTime);

        // 2. 끝에 닿으면 방향 전환 (Ping-Pong)
        if (newX > this.limitX) {
            newX = this.limitX;
            this.direction = -1;
        } else if (newX < -this.limitX) {
            newX = -this.limitX;
            this.direction = 1;
        }

        this.cursor.setPosition(new Vec3(newX, currentPos.y, currentPos.z));
    }

    // STOP 버튼 눌렀을 때
    public onStopPressed() {
        if (!this.isRunning) return;
        this.isRunning = false;

        // 3. 판정 로직
        const cursorX = this.cursor.position.x;
        const zoneWidth = this.successZone.getComponent(UITransform).width;
        const halfZone = zoneWidth / 2;

        // 바늘이 초록 구간(-halfZone ~ +halfZone) 안에 있는가?
        let isSuccess = false;
        if (cursorX >= -halfZone && cursorX <= halfZone) {
            isSuccess = true;
            console.log("Perfect! 초점 맞추기 성공");
        } else {
            console.log("Bad... 초점 나감");
        }

        // 0.5초 뒤에 팝업 닫으면서 결과 전달
        this.scheduleOnce(() => {
            this.node.active = false;
            // GameController에게 결과 보고 (성공하면 true, 실패하면 false)
            if (this.gameController) {
                this.gameController.finishShooting(isSuccess);
            }
        }, 0.5);
    }
}