import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerData')
export class PlayerData {
    public static coin: number = 0;       // (삭제 예정이거나 전체 누적 돈)
    public static stageMoney: number = 0; // 이번 스테이지에서만 쓸 돈
    public static ownedItems: number[] = [];
    public static clearedStage: number = 0;

    public static reset() {
        this.coin = 0;
        this.stageMoney = 0;
        this.ownedItems = [];
    }
}


