<!-- ===================== -->
<!--  GitHub Project README -->
<!-- ===================== -->

<div align="center">

![header](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,8,12,33&height=180&section=header&text=Snap%20Studio&fontSize=64&animation=twinkling)

</div>

<br>

## 📌 Overview

**캐주얼 룩북 시뮬레이션 게임 프로토타입**입니다.

[의뢰 → 퍼즐(재화 획득) → 상점(구매) → 꾸미기/촬영]으로 이어지는
유기적인 게임 루프를 구현한 시뮬레이션 게임입니다.

<br><br>

### Project Information

<div align="center">

| 항목    | 내용                           |
| :---- | :--------------------------- |
| 개발 기간 | 2025.12.24 ~ 2026.01.10 (3주) |
| 플랫폼   | Cocos Creator                |
| 개발 언어 | TypeScript                   |
| 개발 형태 | 1인 개발                        |
| 역할    | 프로그래밍 / UI 디자인               |

</div>

<br><br><br>

## 🎮 Demo

<div align="center">

|                                                 플레이 화면                                                 | 설명                                     |
| :----------------------------------------------------------------------------------------------------: | :------------------------------------- |
| <img src="https://github.com/zen0113/CookieRun_Snap_Studio/blob/master/snapstudio_3.png?raw=true" width="220"/> | 매치-3 퍼즐 게임플레이 및 콤보 시스템 |
| <img src="https://github.com/zen0113/CookieRun_Snap_Studio/blob/master/snapstudio_2.png?raw=true" width="220"/> | 상점 구매 시스템 |
| <img src="https://github.com/zen0113/CookieRun_Snap_Studio/blob/master/snapstudio_1.png?raw=true" width="220"/> | 드래그 앤 드롭 기반 캐릭터 꾸미기 시스템 |

</div>

<br><br><br>

## 💻 Core Systems

<br>

### Match-3 Puzzle Logic

매치-3 퍼즐의 핵심 로직을
상태 기반으로 안정적으로 구현했습니다.

<br>

**State Machine 기반 제어**

* `GameState(Idle, Swapping, Matching)` Enum을 도입하여 애니메이션 중 중복 터치로 인한 버그를 원천 차단
* 로직의 흐름을 명확하게 제어

<br>

**Gravity & Refill Logic**

* 빈 공간 발생 시 상단 블록을 당겨 채우는 Shift Down 중력 알고리즘 구현
* 자연스러운 블록 이동과 재배치

<br>

**Recursive Match Check**

* 재귀 함수와 Set을 활용하여 중복 없는 연쇄 폭발(Combo) 시스템 설계
* 연속 매칭 시 보너스 점수 부여

<br><br>

### Tag-Based Scoring Algorithm

**핵심 문제**

단순한 아이템 장착을 넘어,
스테이지 의뢰 내용과 아이템 속성(Tag)의 일치 여부를 판별하는
정교한 채점 시스템이 필요했습니다.

<br>

**Tag Matching Logic 설계**

* **스테이지 의뢰**: `["cool", "party"]` 같은 요구 분위기 태그 정의
* **아이템 속성**: `["cute", "cool"]` 같은 고유 느낌 태그 부여
* **매칭 판정**: 교집합 검사로 일치하는 태그 개수만큼 가산점 부여

<br>

**Weighted Scoring**

* 일치 시 가산점(+50), 불일치 시 감점(-50) 부여
* 미니게임 결과(초점)에 따른 보정치를 적용하여 최종 등급(1~3성) 산출

<br>

**효과**

플레이어가 "필요한 아이템만 구매"하도록 유도하여
게임 재화의 가치를 유지하고 전략적 선택을 장려했습니다.

<br><br>

### Interactive UX & UI System

직관적이고 즐거운 사용자 경험을 위해
정교한 드래그 앤 드롭 시스템을 구현했습니다.

<br>

**Coordinate Space Conversion**

* `convertToNodeSpaceAR`로 스크린 좌표를 로컬로 변환하여 정교한 드래그 구현
* 터치 입력의 정확한 위치 추적

<br>

**Magnetic Snap System**

* 드래그 종료 시 아이템 타입(Costume/Pet)에 맞는 슬롯과의 거리를 `Vec3.distance`로 계산
* 자동 장착되는 자석 효과 구현으로 편의성 향상

<br>

**UI Design**

* 밝고 귀여운 캐주얼 톤의 UI 디자인 제작
* 타겟 유저층에 맞는 비주얼 스타일 구축

<br><br><br>

## 🏗 System Architecture

<br>

### Data Management

확장 가능하고 유지보수가 쉬운 구조를 설계했습니다.

<br>

**분리된 데이터 구조**

* 스테이지 정보(JSON)와 데이터 구조(Interface)를 분리 설계
* 코드 수정 없이 외부 데이터 변경만으로 게임 밸런싱 가능

<br>

**반응형 UI 구조**

* 데이터와 UI의 결합도를 낮춤
* 상태 변경 시 UI가 자동 갱신되는 구조 구현

<br><br><br>

## 🎯 Game Loop

플레이어가 자연스럽게 몰입할 수 있는
순환 구조를 설계했습니다.

<br>

1. **의뢰 확인**: 스테이지별 요구 태그 확인
2. **퍼즐 플레이**: 매치-3 퍼즐로 재화 획득
3. **상점 구매**: 필요한 아이템 구매
4. **꾸미기/촬영**: 의뢰에 맞게 캐릭터 스타일링 후 촬영
5. **채점**: 태그 매칭 기반 점수 산출 및 보상

<br><br><br>

## 🛠 Technical Stack

<div align="center">

![Cocos Creator](https://img.shields.io/badge/Cocos_Creator-55C2E1?style=for-the-badge&logo=cocos&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

</div>

<br>

**주요 기술 요소**

* State Machine Pattern
* Recursive Algorithm
* Coordinate Space Conversion
* Tag-Based Matching System
* JSON Data Management
* Interface-Driven Design

<br><br><br>

## 📊 Development Notes

3주라는 짧은 기간 안에
프로토타입 완성에 집중했습니다.

<br>

* 게임 루프의 핵심 흐름 구현을 최우선 목표로 설정
* 데이터 기반 설계로 빠른 밸런싱 테스트 가능
* TypeScript의 타입 시스템을 활용하여 안정적인 코드 작성

<br><br><br>

## 📚 Lessons Learned

이번 프로젝트를 통해
다음과 같은 점을 학습했습니다.

<br>

* State Machine을 활용한 복잡한 게임 로직의 안정적 제어
* 재귀 알고리즘을 활용한 효율적인 매칭 시스템 구현
* 태그 기반 시스템 설계를 통한 게임플레이 깊이 향상
* 데이터와 로직 분리의 중요성 체감
* Cocos Creator의 좌표계 시스템 이해 및 활용
* 짧은 기간 내 프로토타입 완성을 위한 우선순위 설정

<br><br><br>

<div align="center">

![footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,8,12,33&height=120&section=footer)

</div>
