<h1 align="center">everyslangapi</h1>

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

## 🧐 About <a name = "about"></a>

EverySlangApi는 [EverySlang](https://github.com/3ae3ae/EverySlang) 프로젝트를 위한 백엔드 서버입니다.

## 🏁 Getting Started <a name = "getting_started"></a>

### Prerequisites

정상적으로 작동하려면 sql 데이터베이스가 필요합니다.

- Docker

또는

- Git
- Node.js

### Installing

#### Docker

```
sudo docker image pull ${{ DOCKER_HUB_USERNAME }}/everyslang-api-server:latest
sudo docker container run -d -e REDIRECT_URL=https://everyslang.com -e DATABASE_USER=${{ DATABASE_USER }} -e DATABASE_HOST=${{ DATABASE_HOST }} -e DATABASE_NAME=${{ DATABASE_NAME }} -e DATABASE_PASSWORD=${{ DATABASE_PASSWORD }} -e SECRET_KEY=${{ TURNSTILE_SECRET }} -e THIS_URL=https://api.everyslang.com -e COOKIE_DOMAIN=everyslang.com -e KAKAO_APP_KEY=${{KAKAO_APP_KEY}} -e KAKAO_CLIENT_SECRET=${{ KAKAO_CLIENT_SECRET }} -e HASH_SALT=${{HASH_SALT}} -e JWT_SECRET=${{JWT_SECRET}} -p 80:3000 ${{ DOCKER_HUB_USERNAME }}/everyslang-api-server:latest
```

#### Local

1. 다음 명령어로 프로젝트를 클론합니다.

```
git clone https://github.com/3ae3ae/EverySlangApi
```

2. 의존성 패키지를 설치합니다.

```
cd EverySlangApi
npm i
```

3. 환경변수를 설정합니다.

```
set DATABASE_USER=<Your database user name>
DATABASE_HOST=<Your database host name>
DATABASE_NAME=<Your database name>
DATABASE_PASSWORD=<Your databse passwsord>
SECRET_KEY=<Your Turnstile secret key>
REDIRECT_URL=<Your Client URL>
KAKAO_APP_KEY=<Your Kakao login app key>
THIS_URL=<Your server url>
KAKAO_CLIENT_SECRET=<Your Kakao client secret key>
HASH_SALT=<Your hash salt for SHA256>
JWT_SECRET=<Your JWT SECRET>
COOKIE_DOMAIN=<Your top-level domain>

```

4. 로컬 개발 서버를 실행합니다.

```
npm run start:dev
```

## 🎈 Usage <a name="usage"></a>

| REST API           | Method | Description                        | Request                                                    | Response                                                                                                             | Param                                                                 |
| ------------------ | ------ | ---------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| /                  | GET    | 서버 상태 확인                     |                                                            | "OK"                                                                                                                 |                                                                       |
| /disableaccount    | GET    | 계정 비활성화                      |                                                            |                                                                                                                      |                                                                       |
| /profile/:nickname | GET    | 프로필 조회                        |                                                            | { profile }                                                                                                          | nickname: string                                                      |
| /nickname          | GET    | 로그인한 사용자의 닉네임 반환      |                                                            | nickname \| "No Name"                                                                                                |                                                                       |
| /validatenickname  | GET    | 닉네임 유효성 검사                 |                                                            | boolean                                                                                                              | name: string                                                          |
| /registerMember    | POST   | 회원 등록                          | { name: string }                                           | { result }                                                                                                           |                                                                       |
| /login             | GET    | 카카오 로그인 토큰 발급            |                                                            | 리다이렉트                                                                                                           | code: string, error: string, error_description: string, state: string |
| /logout            | GET    | 로그아웃                           |                                                            | 리다이렉트                                                                                                           | code: string, error: string, error_description: string, state: string |
| /create            | POST   | 데이터베이스에 단어 추가           | { word: string, meaning: string }                          | 리다이렉트                                                                                                           |                                                                       |
| /vote              | PUT    | 데이터베이스에 좋아요, 싫어요 전송 | { word_id: number, ip: string, vote: 'like' \| 'dislike' } | { result }                                                                                                           |                                                                       |
| /removevote        | PUT    | 좋아요, 싫어요 취소                | { word_id: number, ip: string, vote: 'like' \| 'dislike' } | { result }                                                                                                           |                                                                       |
| /search            | GET    | 단어 검색                          |                                                            | [{ word: string, meaning: string, like_amount: number, dislike_amount: number, isLike: number, word_id: number }...] | keyword: string, page: number                                         |
| /removeword/:id    | GET    | 단어 삭제                          |                                                            | "OK" \| "FAIL"                                                                                                       | id: number                                                            |

## ⛏️ Built Using <a name = "built_using"></a>

- [NodeJs](https://nodejs.org/)
- [NestJs](https://nestjs.com/)
- [Docker](https://www.docker.com/)

## ✍️ Authors <a name = "authors"></a>

- [@3ae3ae](https://github.com/3ae3ae)
