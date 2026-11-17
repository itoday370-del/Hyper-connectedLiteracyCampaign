// Firebase 설정값 (Firebase 콘솔 > 프로젝트 설정 > 내 앱에서 복사)
// 웹에 원래 공개되는 값이라 비밀번호가 아니에요. 접근 제한은 firestore.rules가 맡아요.
// apiKey가 비어 있으면 '시험 모드'로 열려서 댓글이 그 기기에만 저장돼요.
window.CAMPAIGN_CONFIG = {
  firebase: {
    apiKey: "AIzaSyCw2almVCjcV9NoaoR3eXp9sk-BmfvJSeQ",
    authDomain: "campaign3sec.firebaseapp.com",
    projectId: "campaign3sec",
    storageBucket: "campaign3sec.firebasestorage.app",
    messagingSenderId: "568653828160",
    appId: "1:568653828160:web:887bf814afb32c3d8b0fa5"
  }
};
