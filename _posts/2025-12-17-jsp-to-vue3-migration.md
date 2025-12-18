---
layout: post
title: "Vue3 Composition API와 TypeScript 실전 적용기"
date: 2025-12-17 16:00:00 +0900
categories: Frontend Vue3
tags: [Vue3, Composition API, TypeScript, Vuex, Migration]
---

## 프로젝트 개요

JSP 기반 레거시 시스템을 Vue3로 전환하는 프로젝트였습니다. 로그인, 회원가입, 계정 관리 등 인증 관련 모듈을 담당했습니다.

**기술 스택:**
- Vue 3 (Composition API)
- TypeScript
- Vuex (상태 관리)
- Axios (HTTP 클라이언트)

## Vue3 Composition API

### ref vs reactive

Vue3에서 반응형 데이터를 선언하는 두 가지 방법:

```typescript
import { ref, reactive } from 'vue'

// ref: 원시 타입과 객체 모두 사용 가능
const email = ref('')
const count = ref(0)
console.log(email.value) // .value로 접근

// reactive: 객체만 가능
const user = reactive({
  email: '',
  name: ''
})
console.log(user.email) // 직접 접근
```

**언제 무엇을 사용할까?**
- 원시 타입(string, number, boolean): `ref`
- 객체: `reactive` 또는 `ref`
- 일관성을 위해 `ref`로 통일하는 것을 권장합니다

### Composition API의 장점

**1. 로직 재사용이 쉽습니다**

Options API(Vue2)는 data, methods, computed를 분리해야 했습니다. Composition API는 관련 로직을 한 곳에 모을 수 있습니다.

```typescript
// 재사용 가능한 Composable
export function useAuth() {
  const user = ref(null)
  const isLoggedIn = computed(() => user.value !== null)
  
  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    user.value = response.data.user
  }
  
  const logout = () => {
    user.value = null
  }
  
  return { user, isLoggedIn, login, logout }
}

// 컴포넌트에서 사용
const { user, isLoggedIn, login } = useAuth()
```

**2. TypeScript 지원이 우수합니다**

```typescript
interface LoginForm {
  email: string
  password: string
}

const form = ref<LoginForm>({
  email: '',
  password: ''
})
```

## 상태 관리: Vuex

여러 컴포넌트에서 사용자 정보를 공유해야 했습니다. Vuex를 사용했습니다.

### Store 구조

```typescript
// store/auth.ts
import { Module } from 'vuex'

interface AuthState {
  user: User | null
  token: string | null
}

const authModule: Module<AuthState, any> = {
  namespaced: true,
  
  state: {
    user: null,
    token: null
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_TOKEN(state, token) {
      state.token = token
    },
    CLEAR_AUTH(state) {
      state.user = null
      state.token = null
    }
  },
  
  actions: {
    async login({ commit }, credentials) {
      const response = await authApi.login(credentials)
      commit('SET_USER', response.data.user)
      commit('SET_TOKEN', response.data.token)
    },
    
    logout({ commit }) {
      commit('CLEAR_AUTH')
    }
  },
  
  getters: {
    isAuthenticated: (state) => state.token !== null,
    currentUser: (state) => state.user
  }
}

export default authModule
```

### 컴포넌트에서 사용

```typescript
import { useStore } from 'vuex'
import { computed } from 'vue'

const store = useStore()

// Getter 사용
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const currentUser = computed(() => store.getters['auth/currentUser'])

// Action 호출
const handleLogin = async () => {
  await store.dispatch('auth/login', {
    email: email.value,
    password: password.value
  })
}
```

**참고:** Pinia가 더 최신이고 TypeScript 지원이 좋지만, 프로젝트에서 Vuex를 사용하고 있어 유지했습니다.

## TypeScript 적용

### 1. Props 타입 정의

```typescript
<script setup lang="ts">
interface Props {
  title: string
  userId?: number  // optional
}

const props = defineProps<Props>()
</script>
```

### 2. Emit 타입 정의

```typescript
<script setup lang="ts">
interface Emits {
  (e: 'update', value: string): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

const handleUpdate = () => {
  emit('update', 'new value')
}
</script>
```

### 3. API 응답 타입 정의

```typescript
interface LoginResponse {
  user: {
    id: number
    email: string
    name: string
  }
  token: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>('/api/login', credentials)
    return response.data
  }
}
```

## 비동기 처리

### async/await 패턴

```typescript
const isLoading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    await store.dispatch('auth/login', {
      email: email.value,
      password: password.value
    })
    router.push('/dashboard')
  } catch (err) {
    error.value = '로그인에 실패했습니다'
  } finally {
    isLoading.value = false
  }
}
```

### 에러 핸들링

```typescript
// api/interceptor.ts
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 인증 만료
      store.dispatch('auth/logout')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)
```

## 하위 버전 호환성 처리

특정 기기 버전에서는 일부 기능이 동작하지 않았습니다. 버전별 분기 처리를 구현했습니다.

```typescript
// utils/device.ts
export function getDeviceVersion(): number {
  // 기기 정보에서 버전 추출
  return parseFloat(window.deviceInfo?.version || '3.0')
}

// 컴포넌트에서 사용
<script setup lang="ts">
import { getDeviceVersion } from '@/utils/device'

const deviceVersion = getDeviceVersion()

const supportedFeature = computed(() => {
  return deviceVersion >= 3.0
})
</script>

<template>
  <div v-if="supportedFeature">
    <!-- 최신 기능 -->
  </div>
  <div v-else>
    <!-- 대체 기능 -->
  </div>
</template>
```

## CSS 애니메이션 이슈 해결

### 문제 상황

특정 기기에서 marquee 애니메이션이 끊기는 현상이 발생했습니다.

### 원인

CSS `transition`은 일부 구형 웹킷 엔진에서 GPU 가속이 제대로 동작하지 않았습니다.

### 해결

`@keyframes`를 사용하여 명시적으로 애니메이션을 정의했습니다.

```css
/* 개선 전: transition 사용 */
.marquee {
  transition: transform 2s linear;
}

/* 개선 후: @keyframes 사용 */
.marquee {
  animation: marquee 10s linear infinite;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
```

**결과:** 모든 기기에서 부드러운 애니메이션 동작

## 성과

- **20개월간** 인증 관련 모듈을 Vue3로 전환
- **JSP 대비 유지보수성 개선**: 컴포넌트 단위로 영향 범위가 명확함
- **TypeScript 도입**으로 런타임 에러 감소
- **재사용 가능한 Composable** 라이브러리 구축

## 학습 포인트

### 1. 프레임워크는 도구입니다

문법을 외우는 것보다 **컴포넌트 구조 설계**가 중요합니다.

### 2. TypeScript는 생산성 도구입니다

처음엔 타입 작성이 번거로웠지만, 런타임 에러가 줄어들어 전체적으로 개발 속도가 빨라졌습니다.

### 3. 상태 관리는 필수입니다

여러 컴포넌트에서 데이터를 공유할 때, 적절한 상태 관리 라이브러리(Vuex, Pinia)를 사용해야 합니다.

## 참고 자료

- [Vue3 공식 문서](https://vuejs.org/)
- [Vuex 공식 문서](https://vuex.vuejs.org/)
- [TypeScript with Vue](https://vuejs.org/guide/typescript/overview.html)
