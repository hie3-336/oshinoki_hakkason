// モジュールスクリプト内で必要なモジュールをインポートする
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword, sendPasswordResetEmail  } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// フォームの値を取得する関数

const getEmailAndPassword = () => {
    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;
    return { email, password };
};

// Sign Up処理
const handleSignUp = async () => {
    const { email, password } = getEmailAndPassword();
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("user", user);
            window.alert('登録完了しました');
            // hrefプロパティを使う
            window.location.href = 'login.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("errorCode", errorCode);
            console.log("errorMessage", errorMessage);
        });
    };

// Sign In処理
const handleSignIn = async () => {
    const { email, password } = getEmailAndPassword();
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("user", user);
            console.log("user.emailVerified", user.emailVerified);
            // hrefプロパティを使う
            window.location.href = 'index.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("errorCode", errorCode);
            console.log("errorMessage", errorMessage);
        });
};

// サインアップボタンを取得し、クリックイベントを追加する
const signUpButton = document.getElementById('signUpButton');
if(signUpButton != null){
    signUpButton.addEventListener('click', (event) => {
        event.preventDefault(); // デフォルトのsubmit動作を防止する
        handleSignUp(); // サインアップ処理を実行する
    });
};

// サインインボタンを取得し、クリックイベントを追加する
const signInButton = document.getElementById('signInButton');
if(signInButton != null){
    signInButton.addEventListener('click', (event) => {
        event.preventDefault(); // デフォルトのsubmit動作を防止する
        handleSignIn(); // サインイン処理を実行する
    });
};

// パスワードリセットフォームのサブミットイベントを処理する
const resetPasswordForm = document.getElementById('resetPasswordForm');
if(resetPasswordForm != null){
    resetPasswordForm.addEventListener('submit', (event) => {
        event.preventDefault(); // デフォルトのsubmit動作を防止

        // フォームから入力されたメールアドレスを取得
        const email = resetPasswordForm.email.value;

        // Firebaseの関数を使ってパスワードリセットメールを送信
        sendPasswordResetEmail(auth, email)
        .then(() => {
            // メールの送信に成功した場合の処理
            console.log('Password reset email sent successfully!');
            // リセット用のリンクなど、ユーザーに通知するための処理を追加
            // 例: リセット用のリンクを表示するなど
            window.alert('再設定メールを送信しました。パスワードを再設定後、ログインしてください');
            window.location.href = 'login.html';
        })
        .catch((error) => {
            // エラーが発生した場合の処理
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error sending password reset email:', errorCode, errorMessage);
            // エラーをユーザーに通知する処理を追加
        });
    });
};