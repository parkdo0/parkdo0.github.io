---
layout: post
title: "JPA Docker 학습 Day 1"
date: 2025-12-17 23:00:00 +0900
categories: [JPA, Docker]
---

## 배경

6년간 MyBatis만 사용하다가 JPA를 처음 학습하게 되었다.  
서비스 기업 전환을 위해서는 JPA가 필수라고 판단했다.

## 오늘 학습한 것

### 1. Docker로 MySQL 환경 구축

**docker-compose.yml 작성:**
- MySQL 8.0 컨테이너 설정
- 포트 13306으로 매핑 (로컬 MySQL과 충돌 방지)
- 볼륨 마운트로 데이터 영구 보관

### 2. Spring Boot + JPA 프로젝트 초기 설정

**주요 설정:**
- Spring Boot 3.4.0
- Java 17
- p6spy로 실행 쿼리 로깅

### 3. application.yml vs application.properties 이해

두 파일이 함께 있으면 병합(merge)되지만, yml이 나중에 로드되어 덮어쓴다.  
혼란 방지를 위해 yml만 사용하기로 결정.

## 다음 단계

- User Entity 작성
- JpaRepository 구현
- CRUD 테스트

## 참고

- [GitHub 프로젝트](https://github.com/parkdo0/jpa-docker-starter)