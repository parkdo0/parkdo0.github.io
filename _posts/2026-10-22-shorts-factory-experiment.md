---
layout: post
title: "주제 하나로 쇼츠 영상을 자동으로 만들어 보다가 멈춘 기록"
description: "Gemini로 대본을, Hugging Face로 이미지를, MoviePy로 영상을 만드는 파이프라인을 시도해 보고, 클라우드 API 방식으로는 어렵다고 보고 멈췄다."
date: 2026-10-22 17:30:00 +0900
period: "2025.12"
order: 202512
categories: Toy-Projects
tags: [Python, 외부 연동]
---

> **목표** 주제 하나만 넣으면 대본, 이미지, 영상까지 파이썬 코드로 만들어지는지 보고 싶었다.
>
> **한 일** Gemini 대본, Hugging Face SDXL 이미지, MoviePy 영상을 잇는 파이프라인을 만들어 2025년 12월 18일에 커밋 3개로 올렸다.
>
> **결과** 클라우드 API 방식으로는 원하는 품질과 움직임을 얻기 어렵다고 보고 v1.0에서 멈췄다.
{: .tldr}

## 시작과 파이프라인

shorts-factory는 "유튜브 쇼츠 제작 과정을 어디까지 자동화할 수 있을까?"라는 질문에서 시작한 테스트 프로젝트였다. 주제만 넣으면 대본, 이미지, 영상까지 파이썬 코드로 처리하는 것이 목표였다. 2025년 12월 18일에 커밋 3개로 올렸다.

흐름은 이랬다.

1. Streamlit 화면에서 주제를 입력한다.
2. Gemini(`gemini-flash-latest`)에 장면 5~7개를 JSON으로 요청한다. 장면마다 25단어 이하 내레이션과 SDXL용 영어 이미지 프롬프트를 받는다.
3. Hugging Face Inference API로 SDXL base 모델 이미지를 만든다. 서버가 바쁘거나(503) 시간이 초과되면 5초 쉬고 최대 3번 다시 시도하고, 유료 모델 오류(402)는 바로 멈춘다.
4. MoviePy로 이미지를 이어 붙이고 자막을 합성한다.

```python
"Return JSON with key 'scenes', each item containing:\n"
" - voiceover: short narration (<= 25 words)\n"
" - image_prompt: English prompt optimized for SDXL with camera/lighting details\n"
```

Gemini가 빈 응답을 주면 기본 대본 3장면으로 대신하게 했다. 응답에 섞인 마크다운 코드 표시는 정규식으로 지운 뒤 JSON으로 읽었다.

## 부딪힌 문제 두 가지

README에 남겨 둔 해결 기록이다.

- MoviePy의 TextClip은 자막에 ImageMagick이 필요한데, Windows에서 경로 오류(WinError 2)가 자주 났다. 그래서 Pillow로 이미지 위에 글자를 직접 그리는 함수로 바꿔, 외부 프로그램 없이 자막을 넣었다.
- Pillow 10에서 `ANTIALIAS` 속성이 없어졌는데, 구버전 MoviePy가 이를 참조해 오류가 났다. 코드 맨 위에 패치를 넣어 넘어갔다.

```python
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS
```

## 한계라고 본 것

README에 적은 결론은 클라우드 API 방식으로는 원하는 결과를 내기 어렵다는 것이었다.

- **이미지 품질.** 무료 API 모델로는 원하는 질감을 일관되게 얻기 어려웠고, 프롬프트를 다듬어도 서버 상황에 따라 품질이 달라졌다.
- **움직임.** 정지 이미지에 줌인·줌아웃 효과만 넣어서는 부족했다. API 영상 생성은 대기 시간이 길고 비용이 들어 계속 쓰기 어렵다고 봤다.

그래서 v1.0을 끝으로 로컬 GPU(RTX 3080 Ti)에서 ComfyUI와 SVD(Stable Video Diffusion)로 옮기기로 했다.

## 저장소에 남은 상태

지금 저장소의 `video_gen.py`에는 README가 설명하는 MoviePy 슬라이드쇼 함수 대신, ComfyUI에 워크플로를 보내 SVD 영상을 받는 코드가 들어 있다. 그런데 `utils/__init__.py`는 여전히 `create_slideshow`를 가져오고 이 함수는 파일에 없어서, 커밋된 상태 그대로는 실행되지 않는다.

> 왜 이렇게 남았는지는 확실하지 않다. 전환 도중의 코드가 그대로 올라간 것으로 보인다.
{: .note}

## 돌아보면

| 그때는 | 지금이라면 |
|---|---|
| 커밋 3개에 작업이 몰려 과정을 따라갈 수 없었고, `__pycache__`와 IDE 설정 파일도 함께 올라갔다 | 단계마다 커밋을 나누고, 그런 파일은 올리지 않을 것 같다 |
| README와 코드가 어긋난 채로 멈췄다 | 전환 작업은 브랜치를 나누거나 README에 적어 두었으면 나았을 것 같다 |
| Gemini 안전 필터를 모두 해제(BLOCK_NONE)해 두었다 | 공개 서비스라면 필터를 다시 켜고, 빈 응답은 따로 처리해 볼 것 같다 |
| 품질과 비용 판단을 숫자로 남기지 않았다 | 장면당 대기 시간, 실패율, 호출 비용처럼 단계별 결과와 시간을 기록해 판단 근거로 남겨 볼 것 같다 |
{: .compare}
