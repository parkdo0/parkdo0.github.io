---
layout: post
title: "Spring Boot + JPA + Docker 학습 환경 구축"
date: 2025-12-17 23:00:00 +0900
categories: [JPA, Docker]
tags: [Spring Boot, JPA, Docker, MySQL]
---

## 학습 목표

6년간 MyBatis만 사용해왔습니다. JPA를 학습하여 ORM(Object-Relational Mapping) 방식의 데이터 접근 계층을 이해하려고 합니다.

## Docker로 MySQL 환경 구축

### docker-compose.yml 작성

로컬 MySQL과 포트 충돌을 피하기 위해 13306 포트를 사용했습니다.

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

**주요 설정 설명:**

#### ddl-auto 옵션
- `create`: 기존 테이블 삭제 후 재생성
- `create-drop`: create와 동일하나 종료 시 테이블 삭제
- `update`: 변경된 스키마만 반영 (운영 환경 비권장)
- `validate`: 엔티티와 테이블이 정상 매핑되었는지만 확인
- `none`: 아무것도 하지 않음

**개발 환경:** `create` 또는 `update`  
**운영 환경:** `validate` 또는 `none`

#### format_sql vs show_sql
- `format_sql`: SQL을 보기 좋게 포맷팅
- `show_sql`: SQL을 콘솔에 출력

### p6spy 설정 (옵션)

SQL 파라미터까지 함께 로깅하려면 p6spy를 사용합니다.

`src/main/resources/spy.properties`:

```properties
dateformat=yyyy-MM-dd HH:mm:ss
appender=com.p6spy.engine.spy.appender.Slf4JLogger
logMessageFormat=com.p6spy.engine.spy.appender.CustomLineFormat
customLogMessageFormat=%(currentTime) | %(executionTime)ms | %(category) | %(sqlSingleLine)
```

## application.yml vs application.properties

### 동시 존재 시 동작

두 파일이 같이 있으면:
1. application.properties 먼저 로드
2. application.yml 나중에 로드 (덮어쓰기)

**결론:** 하나만 사용하는 것을 권장합니다. (보통 yml 선호)

### yml의 장점

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

YAML이 더 읽기 쉽고 계층 구조를 명확히 표현합니다.

## 프로젝트 구조

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

## 다음 학습 계획

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

## 참고 자료

- [Spring Data JPA 공식 문서](https://spring.io/projects/spring-data-jpa)
- [Hibernate ORM 공식 문서](https://hibernate.org/orm/)
- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
