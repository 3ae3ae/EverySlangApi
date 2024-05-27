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
docker image pull 3ae3ae/everyslang-api-server:latest
docker container run -d -e DATABASE_USER=${{ DATABASE_USER }} -e DATABASE_HOST=${{ DATABASE_HOST }} -e DATABASE_NAME=${{ DATABASE_NAME }} -e DATABASE_PASSWORD=${{ DATABASE_PASSWORD }} -p 80:3000 3ae3ae/everyslang-api-server:latest
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

```

4. 로컬 개발 서버를 실행합니다.

```
npm run start:dev
```

## 🎈 Usage <a name="usage"></a>

| REST API    | Method | Description                        | Request                                                  | Response                                                                                                      | Param                       |
| ----------- | ------ | ---------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| /create     | Post   | 데이터베이스에 단어 추가           | { word: string, meaning: string}                         |
| /vote       | Put    | 데이터베이스에 좋아요, 싫어요 전송 | {word_id: number, ip: string, vote: 'like' \| 'dislike'} |
| /removevote | Put    | 좋아요, 싫어요 취소                | {word_id: number, ip: string, vote: 'like' \| 'dislike'} |
| /search     | Get    | 단어 검색                          |                                                          | [{word:string, meaning: string, like_amount:number, dislike_amount:number, isLike:number, word_id:number}...] | keyword:string, page:number |

## ⛏️ Built Using <a name = "built_using"></a>

- [NodeJs](https://nodejs.org/)
- [NestJs](https://nestjs.com/)
- [Docker](https://www.docker.com/)

## ✍️ Authors <a name = "authors"></a>

- [@3ae3ae](https://github.com/3ae3ae)
