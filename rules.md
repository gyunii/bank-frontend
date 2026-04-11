# Project Rules

This file contains the rules and guidelines for the project.

## Coding Conventions & Guidelines

1. **알림(Alert) 사용 금지**: 기본 `alert` 창 대신 `ModalProvider`에서 제공하는 공통 모달 함수를 사용하세요.
2. **로딩 처리**: 처리 시간이 길어지는 무거운 함수나 작업 시에는 `Loading.jsx`를 활용하여 로딩 상태를 표시하세요.
3. **API 응답 처리**: API 호출 후 결과를 처리할 때, 복잡한 `if-else` 스파게티 코드 대신 `switch-case`문을 사용하여 깔끔하게 작성하세요.
4. **거절된 수정사항 재요청 금지**: 사용자가 지속적으로 거절(Reject)하여 받아들이지 않은 수정사항은 다시 수정하려고 시도하지 마세요.