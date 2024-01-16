import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth();

let displayName;
let email;

const ProfileName = document.getElementById('profileName');
const ProfileEmail = document.getElementById('profileEmail');
const ProfileId = document.getElementById('profileId');
const HomeLink = document.getElementById('homelink');

// index.htmlのURLからuser_idのクエリパラメーターを取得する
const userId = getParameterByName('user_id');
console.log(userId);
// ユーザー情報を取得
auth.onAuthStateChanged((user) => {
    if (user) {
      if (user.uid === userId) {
        // ユーザーがログインしており、対象のユーザーIDにマッチした場合
        displayName = user.displayName;
        email = user.email;
        console.log('DisplayName:', displayName);
        console.log(user)
        // ログイン状態を確認
        ProfileName.value = displayName;
        ProfileEmail.value = email;
        ProfileId.value = userId;
        let HomeMyUrl = `index.html?user_id=${userId}`;
        HomeLink.setAttribute('href',HomeMyUrl);
      } else {
        console.log('指定されたユーザーIDのユーザーが見つかりません');
      }
    } else {
      console.log('ユーザーがログインしていません');
    }
});

// URLからクエリパラメーターを取得する関数
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// サインアウトボタンを取得し、クリックイベントを追加する
const SignOutButton = document.getElementById('signOutButton');
if(SignOutButton != null){
    SignOutButton.addEventListener('click', (event) => {
        event.preventDefault(); // デフォルトのsubmit動作を防止する
        signOut(auth).then(() => {
          // Sign-out successful.
          alert('ログアウトしました。ホーム画面に戻ります。');
          window.location.href = 'index.html';
        }).catch((error) => {
          // An error happened.
          alert('エラーによりログアウトできませんでした。');
        });
    });
};
