# 공유하기 전에 3초

소설 「후원 명세서」(오선영)로 만든 초연결사회 캠페인 페이지예요.
게시글 일부를 읽고 반응한 뒤 전체 맥락(소설 속 장면, 2017년 실제 사건)을 확인하고, 처음 반응을 다시 돌아보는 흐름이에요.

- 주소: https://itoday370-del.github.io/Hyper-connectedLiteracyCampaign/
- 관리 화면: 주소 뒤에 `?admin`을 붙여서 열어요.

## 파일

| 파일 | 내용 |
|---|---|
| index.html | 화면과 글 |
| style.css | 디자인 |
| app.js | 댓글, 추천, 답글, 결과 집계 |
| config.js | Firebase 설정값 (비어 있으면 시험 모드) |
| firestore.rules | Firebase 보안 규칙 |

## Firebase 연결하기

1. https://console.firebase.google.com 에서 구글 계정으로 로그인하고 '프로젝트 추가'를 눌러요. Google 애널리틱스는 꺼도 돼요.
2. 왼쪽 메뉴 '빌드 > Authentication'에서 '시작하기'를 누르고, 로그인 방법에서 '익명'을 사용 설정해요.
3. 'Authentication > 설정 > 승인된 도메인'에 `itoday370-del.github.io`를 추가해요.
4. '빌드 > Firestore Database'에서 '데이터베이스 만들기'를 눌러요. 위치는 `asia-northeast3 (서울)`, 모드는 '프로덕션 모드'로 해요.
5. Firestore의 '규칙' 탭에 `firestore.rules` 내용을 통째로 붙여 넣고 '게시'를 눌러요.
6. '프로젝트 설정(톱니바퀴) > 일반 > 내 앱'에서 웹 앱(`</>`)을 추가하면 `firebaseConfig` 값이 나와요. 그 값을 `config.js`에 넣어요.

## 관리자 등록

1. 주소 뒤에 `?admin`을 붙여서 열면 '내 관리자 ID'가 보여요.
2. Firestore에서 `admins` 컬렉션을 만들고, 그 ID를 문서 ID로 해서 문서를 하나 추가해요(필드는 아무거나 하나).
3. 새로고침하면 댓글 삭제와 '댓글 막기' 버튼을 쓸 수 있어요.

## 주의

- 아동 이름, 사진, 학교 같은 개인정보는 넣지 않아요.
- 대회 전에는 링크를 조원끼리만 써요(SNS 공개 금지).
