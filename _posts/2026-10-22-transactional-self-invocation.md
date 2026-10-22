---
layout: post
title: "REQUIRES_NEW를 붙였는데 왜 따로 커밋되지 않았을까"
description: "같은 클래스 안에서 호출한 @Transactional 메서드에 전파 옵션이 적용되지 않았던 경험과, 그 이유를 찾아본 기록이다."
date: 2026-10-22 20:00:00 +0900
period: "SI 프로젝트 시절"
order: 202100
categories: Learning
tags: [Spring, 트러블슈팅]
---

> **문제** 로그 저장 메서드에 REQUIRES_NEW를 붙였는데, 본 작업이 롤백되자 로그도 같이 사라졌다.
>
> **원인** 같은 클래스 안에서 호출해서 프록시를 거치지 않았고, 전파 옵션이 아예 읽히지 않았다.
>
> **결과** 로그 저장을 별도 빈으로 분리해 주입받아 호출하니 새 트랜잭션이 열렸다.
{: .tldr}

## 겪은 일

SI 프로젝트에서 처리 이력을 로그 테이블에 남기는 기능이 있었다. 본 작업이 실패해서 롤백되더라도 로그는 남아야 했기 때문에, 로그를 저장하는 메서드에 `@Transactional(propagation = Propagation.REQUIRES_NEW)`를 붙였다.

그런데 본 작업이 롤백되자 로그도 같이 사라졌다. 로그 저장 메서드가 본 작업과 **같은 클래스 안에** 있었고, 같은 클래스의 다른 메서드에서 호출하고 있었다.

```java
@Service
public class OrderService {

    @Transactional
    public void process() {
        // ... 본 작업
        saveLog("처리 시작");   // 같은 클래스 안에서 호출
        // ... 예외 발생 → 롤백
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveLog(String msg) {
        // 로그 저장
    }
}
```

## 원인

Spring의 `@Transactional`은 프록시로 동작한다. 외부에서 이 빈의 메서드를 부르면 호출이 프록시를 거치고, 프록시가 트랜잭션을 열고 닫는다.

같은 클래스 안에서 `saveLog()`를 부르면 `this.saveLog()`로 바로 호출된다. 프록시를 거치지 않으니 `REQUIRES_NEW` 설정이 아예 읽히지 않고, 로그 저장은 바깥 트랜잭션에 그대로 포함됐다. 그래서 바깥이 롤백되면 같이 롤백됐다.

## 고친 방법

로그 저장을 별도 클래스(빈)로 분리하고, 그 빈을 주입받아 호출했다. 이러면 호출이 프록시를 거치므로 새 트랜잭션이 열린다.

```java
@Service
public class LogService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveLog(String msg) { ... }
}

@Service
public class OrderService {
    private final LogService logService;   // 생성자 주입

    @Transactional
    public void process() {
        logService.saveLog("처리 시작");     // 프록시를 거침
        // ...
    }
}
```

분리할 때 두 서비스가 서로를 주입받으면 순환 참조가 생기니, 로그 서비스는 다른 서비스를 의존하지 않게 두었다.

*위 코드는 설명을 위해 단순화한 예시다.*

## 같이 알게 된 것

- 같은 이유로, 같은 클래스 안에서 부르는 `@Async`, `@Cacheable`도 적용되지 않는다.
- 프록시 방식에서는 `public`이 아닌 메서드의 `@Transactional`도 기대대로 동작하지 않을 수 있다.
- 자기 자신을 주입받거나 `AopContext.currentProxy()`를 쓰는 방법도 있었지만, 구조가 헷갈려져서 나는 클래스를 나누는 쪽을 택했다.

## 돌아보면

| 그때는 | 지금이라면 |
|---|---|
| 어노테이션만 붙이면 전파 옵션이 적용될 거라고 생각했다 | 호출이 프록시를 거치는지부터 확인해 볼 것 같다 |
| 자기 주입이나 `AopContext.currentProxy()` 대신 클래스를 나눴다 | 여전히 클래스를 나누는 쪽을 고를 것 같다 |
{: .compare}

어노테이션이 붙어 있다는 것과 실제로 적용된다는 것은 다른 이야기였다.
