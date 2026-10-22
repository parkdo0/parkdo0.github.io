---
layout: post
title: "Spring Boot + JPA + Docker 학습 환경을 만든 첫날"
description: "MyBatis만 써 오다 JPA를 공부하려고 Docker로 MySQL을 띄우고 Spring Boot 프로젝트를 설정했다. 첫날 환경 구축까지 한 기록이다."
date: 2025-12-17 23:00:00 +0900
period: "2025.12"
order: 202512
categories: Learning
tags: [Spring, 인프라]
---

> **목표** 6년간 MyBatis만 써 오다가, JPA로 ORM 방식의 데이터 접근 계층을 이해해 보려고 했다.
>
> **한 일** Docker로 MySQL을 13306 포트에 띄우고, Spring Boot 프로젝트에 JPA와 p6spy 설정을 잡았다.
>
> **결과** 첫날 환경 구축까지 하고, README에 적어 둔 다음 학습 항목(Entity, 연관관계, N+1, QueryDSL)은 진행하지 못한 채 멈췄다.
{: .tldr}

## 학습 목표

6년간 MyBatis만 써 왔다. JPA를 공부해서 ORM(Object-Relational Mapping) 방식의 데이터 접근 계층을 이해해 보려고 했다.

## Docker로 MySQL 띄우기

### docker-compose.yml 작성

로컬 MySQL과 포트가 겹치지 않게 13306 포트를 썼다.

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: jpa-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root1234
      MYSQL_DATABASE: jpa_study
      MYSQL_USER: jpauser
      MYSQL_PASSWORD: jpapass
    ports:
      - "13306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci

volumes:
  mysql-data:
```

**주요 설정:**
- `ports`: 호스트 13306 포트를 컨테이너 3306 포트로 매핑
- `volumes`: 데이터 영구 저장 (컨테이너 재시작 시에도 유지)
- `command`: UTF-8 문자셋 설정

### 컨테이너 실행

```bash
docker-compose up -d
```

### MySQL 접속 확인

```bash
docker exec -it jpa-mysql mysql -u root -p
```

또는

```bash
mysql -h 127.0.0.1 -P 13306 -u jpauser -p
```

## Spring Boot 프로젝트 설정

### build.gradle

```gradle
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-web'
    runtimeOnly 'com.mysql:mysql-connector-j'
    
    // 쿼리 로깅을 위한 p6spy
    implementation 'com.github.gavlyukovskiy:p6spy-spring-boot-starter:1.9.0'
    
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'
    
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

### application.yml

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:13306/jpa_study
    username: jpauser
    password: jpapass
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: create  # 개발 환경에서만 사용
    properties:
      hibernate:
        format_sql: true
        show_sql: true
    database-platform: org.hibernate.dialect.MySQL8Dialect

logging:
  level:
    org.hibernate.SQL: debug
    org.hibernate.type.descriptor.sql.BasicBinder: trace
```

**ddl-auto 옵션으로 정리한 것:**
- `create`: 기존 테이블 삭제 후 재생성
- `create-drop`: create와 같지만 종료 시 테이블 삭제
- `update`: 변경된 스키마만 반영 (운영 환경 비권장)
- `validate`: 엔티티와 테이블이 정상 매핑되었는지만 확인
- `none`: 아무것도 하지 않음

개발 환경에는 `create` 또는 `update`, 운영 환경에는 `validate` 또는 `none`을 쓴다고 정리했다.

**format_sql과 show_sql:**
- `format_sql`: SQL을 보기 좋게 포맷팅
- `show_sql`: SQL을 콘솔에 출력

### p6spy 설정 (옵션)

SQL 파라미터까지 함께 로깅하려면 p6spy를 쓴다.

`src/main/resources/spy.properties`:

```properties
dateformat=yyyy-MM-dd HH:mm:ss
appender=com.p6spy.engine.spy.appender.Slf4JLogger
logMessageFormat=com.p6spy.engine.spy.appender.CustomLineFormat
customLogMessageFormat=%(currentTime) | %(executionTime)ms | %(category) | %(sqlSingleLine)
```

### application.yml과 application.properties

두 파일이 같이 있으면 이렇게 동작한다고 정리했다.

1. application.properties 먼저 로드
2. application.yml 나중에 로드 (덮어쓰기)

그래서 하나만 쓰는 편이 낫다고 봤다. 보통은 yml을 많이 쓴다.

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:13306/jpa_study
    username: jpauser
    password: jpapass
```

```properties
# application.properties
spring.datasource.url=jdbc:mysql://localhost:13306/jpa_study
spring.datasource.username=jpauser
spring.datasource.password=jpapass
```

나란히 놓고 보면 YAML이 더 읽기 쉽고 계층 구조가 분명하게 보였다.

### 프로젝트 구조

```
src/
├─ main/
│  ├─ java/
│  │  └─ com.example.jpa/
│  │     ├─ JpaApplication.java
│  │     ├─ entity/
│  │     │  └─ User.java
│  │     ├─ repository/
│  │     │  └─ UserRepository.java
│  │     └─ service/
│  │        └─ UserService.java
│  └─ resources/
│     ├─ application.yml
│     └─ spy.properties
└─ test/
   └─ java/
      └─ com.example.jpa/
         └─ repository/
            └─ UserRepositoryTest.java
```

## 그때 세운 다음 학습 계획

이 글을 쓸 때는 다음 순서로 이어 가려고 했다.

1. **Entity 작성**
   - `@Entity`, `@Id`, `@GeneratedValue` 이해
   - 기본 매핑 어노테이션

2. **Repository 구현**
   - JpaRepository 인터페이스 상속
   - 기본 CRUD 메서드 사용

3. **연관관계 매핑**
   - `@OneToMany`, `@ManyToOne`
   - 양방향 연관관계

4. **쿼리 메서드**
   - 메서드 이름으로 쿼리 생성
   - `@Query` 어노테이션

참고했던 자료:

- [Spring Data JPA 공식 문서](https://spring.io/projects/spring-data-jpa)
- [Hibernate ORM 공식 문서](https://hibernate.org/orm/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)

## 돌아보면

| 그때는 | 지금이라면 |
|---|---|
| 첫날 환경 구축까지 하고 멈췄다 | 환경을 잡은 날 Entity 하나라도 만들어 돌려 볼 것 같다 |
| 다음 학습 항목(Entity, 연관관계, N+1, QueryDSL)을 README에 적어 두기만 했다 | 그중 하나를 바로 다음 일정으로 잡아 둘 것 같다 |
{: .compare}

결국 이 학습은 첫날 기록으로 남았다. 설정을 정리한 메모는 그대로 두었다.
