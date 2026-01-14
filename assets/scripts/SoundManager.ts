import { _decorator, Component, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundManager')
export class SoundManager extends Component {

    public static Instance: SoundManager = null;

    @property(AudioSource)
    private audioSource: AudioSource = null!; // 실제 소리를 내는 스피커 컴포넌트

    // ▼ 에디터에서 mp3 파일을 드래그해서 넣을 슬롯들
    @property(AudioClip)
    public bgmClip: AudioClip = null!; 

    @property(AudioClip)
    public shutterClip: AudioClip = null!;

    @property(AudioClip)
    public scoreClip: AudioClip = null!;

    onLoad() {
        SoundManager.Instance = this;
    }

    start() {
        // 게임 시작하자마자 배경음악 재생
        this.playBGM();
    }

    // 배경음악 재생 함수
    playBGM() {
        if (this.bgmClip) {
            this.audioSource.stop(); // 기존 소리 끄고
            this.audioSource.clip = this.bgmClip; // BGM 클립 장착
            this.audioSource.loop = true; // 무한 반복 설정
            this.audioSource.volume = 0.5; // 볼륨 조절 (0.0 ~ 1.0)
            this.audioSource.play(); // 재생!
        }
    }

    // 셔터 소리 재생 함수 (효과음)
    playShutter() {
        if (this.shutterClip) {
            // playOneShot: 배경음악을 끊지 않고 그 위에 겹쳐서 재생함
            this.audioSource.playOneShot(this.shutterClip, 1.0); 
        }
    }

    // 점수 소리 재생 함수
    playScore() {
        if (this.scoreClip) {
            this.audioSource.playOneShot(this.scoreClip, 1.0);
        }
    }
}