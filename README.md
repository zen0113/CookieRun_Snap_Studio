# 👗 Snap Studio: Casual Lookbook Simulation

> **Cocos Creator로 개발한 퍼즐 & 룩북 꾸미기 시뮬레이션**
> **특징:** 의뢰(Request) 분석 알고리즘과 유기적인 게임 루프 설계

## 🛠 시스템 설계 (System Design)

### 🏷️ 태그 기반 채점 알고리즘 (Tag-Based Scoring)
단순한 아이템 장착 여부가 아닌, **"고객의 의뢰 분위기"**를 파악하는 로직을 구현했습니다.
* **Intersection Logic:**
    * 스테이지 요구 태그(예: `['Cool', 'Party']`)와 장착 아이템 속성 태그의 **교집합(Intersection)**을 검사.
    * `Array.includes`를 활용해 일치 개수에 따라 가산점(+50) 부여 및 미니게임(초점) 결과에 따른 보정치 적용.

### 🧩 퍼즐 로직 (Match-3 Core)
* **State Machine:** `Idle` ↔ `Swapping` ↔ `Matching` 상태 관리를 통해 애니메이션 중복 터치 버그 방지.
* **Recursive Algorithm:** 재귀 함수와 `Set` 자료구조를 활용해 중복 없는 연쇄 폭발(Combo) 로직 구현.

### 🖱️ UX 인터랙션
* **Magnetic Snap:** 드래그 종료 시 `Vec3.distance`로 슬롯과의 거리를 계산, 가까운 슬롯에 아이템이 자석처럼 붙는 효과 구현.
* **Space Conversion:** `convertToNodeSpaceAR`을 사용하여 스크린 좌표계를 월드 좌표계로 정확하게 변환.

## ⚙️ Tech Stack
* **Engine:** Cocos Creator
* **Language:** TypeScript
* **Architecture:** Data-Driven Design (JSON 기반 스테이지 관리)
