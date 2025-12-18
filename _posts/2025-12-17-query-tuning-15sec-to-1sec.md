---
layout: post
title: "Oracle 쿼리 성능 최적화: 실행 계획 분석과 인덱스 전략"
date: 2025-12-17 14:00:00 +0900
categories: Work-Experience
tags: [Query Tuning, EXPLAIN PLAN, Index, Performance, Oracle]
---

## 문제 상황

MariaDB에서 Oracle로 DB를 전환하는 과정에서 견적 조회 쿼리의 응답 시간이 15초로 증가했습니다.

**쿼리 구조:**
- 견적 마스터, 견적 상세, 자재 마스터 등 다중 테이블 조인
- 서브쿼리 포함
- 테이블별 데이터: 100만 건 ~ 1만 건

## 원인 분석

### 1. 실행 계획(EXPLAIN PLAN) 확인

Oracle의 실행 계획을 확인하는 방법:

```sql
EXPLAIN PLAN FOR
SELECT 
    em.estimate_id,
    em.estimate_date,
    ed.material_code,
    mm.material_name
FROM estimate_master em
JOIN estimate_detail ed ON em.estimate_id = ed.estimate_id
JOIN material_master mm ON ed.material_code = mm.material_code
WHERE em.estimate_date >= '2024-01-01';

-- 실행 계획 조회
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

**발견한 문제:**
- Full Table Scan 발생
- 인덱스 미사용

### 2. 인덱스 누락 확인

MariaDB에서 Oracle로 전환 시 인덱스가 일부 누락되었습니다.

```sql
-- 인덱스 생성
CREATE INDEX idx_estimate_date ON estimate_master(estimate_date);
CREATE INDEX idx_material_code ON material_detail(material_code);
```

**그러나 성능 개선 없음.**

### 3. 통계 정보 부재

Oracle 옵티마이저는 테이블 통계 정보를 기반으로 실행 계획을 수립합니다. 통계 정보가 없으면 인덱스가 있어도 사용하지 않을 수 있습니다.

```sql
-- 통계 정보 수집
ANALYZE TABLE estimate_master COMPUTE STATISTICS;
ANALYZE TABLE estimate_detail COMPUTE STATISTICS;
ANALYZE TABLE material_master COMPUTE STATISTICS;
```

또는 자동 수집:

```sql
BEGIN
  DBMS_STATS.GATHER_TABLE_STATS('SCHEMA_NAME', 'ESTIMATE_MASTER');
END;
```

## 해결 방법

### 1. 쿼리 힌트 사용

옵티마이저가 인덱스를 타지 않는 경우, 힌트로 강제할 수 있습니다.

```sql
SELECT /*+ INDEX(estimate_master idx_estimate_date) */
    em.estimate_id,
    em.estimate_date
FROM estimate_master em
WHERE em.estimate_date >= '2024-01-01';
```

**주의사항:**
- 힌트는 임시 방편입니다
- 통계 정보 수집이 근본적인 해결책입니다

### 2. WITH 절을 활용한 쿼리 구조 개선

복잡한 서브쿼리를 WITH 절(CTE)로 분리하면 가독성과 성능이 개선됩니다.

**Before:**
```sql
SELECT 
    em.estimate_id,
    (SELECT SUM(amount) FROM estimate_detail WHERE estimate_id = em.estimate_id) as total
FROM estimate_master em
WHERE em.estimate_date >= '2024-01-01';
```

**After:**
```sql
WITH filtered_data AS (
  SELECT 
      estimate_id,
      estimate_date
  FROM estimate_master
  WHERE estimate_date >= '2024-01-01'
),
detail_sum AS (
  SELECT 
      estimate_id,
      SUM(amount) as total
  FROM estimate_detail
  GROUP BY estimate_id
)
SELECT 
    fd.estimate_id,
    fd.estimate_date,
    ds.total
FROM filtered_data fd
LEFT JOIN detail_sum ds ON fd.estimate_id = ds.estimate_id;
```

**개선 결과: 15초 → 1초 (93% 개선)**

## 성능 튜닝 체크리스트

### 1. 실행 계획 확인
```sql
EXPLAIN PLAN FOR [YOUR_QUERY];
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY);
```

주요 확인 항목:
- Full Table Scan 여부
- Index Range Scan 여부
- 조인 순서 및 방식

### 2. 인덱스 전략

**언제 인덱스를 추가할까?**
- WHERE 절에 자주 사용되는 컬럼
- JOIN 조건에 사용되는 컬럼
- ORDER BY, GROUP BY에 사용되는 컬럼

**인덱스가 효과 없는 경우:**
- 카디널리티(고유값 비율)가 낮은 컬럼
- 함수나 연산이 적용된 컬럼
- NULL 비교 (IS NULL, IS NOT NULL)

### 3. 통계 정보 관리

```sql
-- 전체 스키마 통계 수집
BEGIN
  DBMS_STATS.GATHER_SCHEMA_STATS('SCHEMA_NAME');
END;

-- 특정 테이블 통계 수집
BEGIN
  DBMS_STATS.GATHER_TABLE_STATS('SCHEMA_NAME', 'TABLE_NAME');
END;
```

### 4. 쿼리 구조 최적화

- 불필요한 서브쿼리 제거
- JOIN 순서 최적화 (작은 테이블 먼저)
- WHERE 절 조건 명확화

## 주요 학습 포인트

**1. DB마다 옵티마이저 특성이 다릅니다**

MariaDB와 Oracle은 쿼리 실행 방식이 다릅니다. 같은 쿼리라도 성능이 달라질 수 있습니다.

**2. 통계 정보는 필수입니다**

인덱스를 만들어도 통계 정보가 없으면 사용하지 않습니다.

**3. 실행 계획을 반드시 확인해야 합니다**

추측이 아닌 데이터로 판단해야 합니다.

**4. 쿼리 구조 개선이 우선입니다**

힌트로 해결하기보다, 쿼리를 단순하고 명확하게 작성하는 것이 좋습니다.

## 참고 자료

- [Oracle EXPLAIN PLAN 공식 문서](https://docs.oracle.com/en/database/oracle/oracle-database/)
- [DBMS_STATS 사용법](https://docs.oracle.com/en/database/oracle/oracle-database/)
