// モジュールスクリプト内で必要なモジュールをインポートする
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getAuth, signInWithEmailAndPassword,createUserWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Sign Up処理
const handleSignUp = async () => {
    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;
    const userName = document.getElementsByName('userName')[0].value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // ユーザーが作成されたらdisplayNameを設定する
            updateProfile(auth.currentUser, {
                displayName: userName,
            });
        })
        .then(() => {
            console.log('User profile updated with displayName:', userName);
            window.alert('登録完了しました');
            window.location.href = 'login.html';
        })
        .catch((error) => {
            // エラー処理
            console.error('Error creating user:', error);
            window.alert(ErrorPopup(errorCode));
        });
};

// Sign In処理
const handleSignIn = async () => {
    const email = document.getElementsByName('email')[0].value;
    const password = document.getElementsByName('password')[0].value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log("user", user);
            console.log("user.emailVerified", user.emailVerified);
            const userName = user.displayName;
            window.alert(`ようこそ${userName}さん！`)
            const userId = user.uid;
            // hrefプロパティを使う
            window.location.href = `index.html?user_id=${userId}`;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log("errorCode", errorCode);
            console.log("errorMessage", errorMessage);
            window.alert(ErrorPopup(errorCode));
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
            window.alert(ErrorPopup(errorCode));
        });
    });
};

const ErrorPopup = (e) => {
    switch(e){
        case'auth/email-already-in-use':
            return 'すでにそのメールアドレスは使用されています。';
        case'auth/invalid-email':
            return '無効なメールアドレスです。';
        case'auth/operation-not-allowed':
            return '電子メール/パスワードアカウントが有効ではありません。管理者にお問い合わせください。';
        case'auth/weak-password':
            return '6文字以上のパスワードを入力してください。';
        case'auth/user-disabled':
            return '無効なユーザーです';
        case'auth/user-not-found':
            return 'アカウントが見つかりません';
        case'auth/wrong-password':
            return '指定されたメールアドレスに紐づくパスワードが無効または未設定です';        
        case'auth/invalid-continue-uri':
            return 'リクエストされたURLが無効です。管理者にお問い合わせください。';      
        case'auth/invalid-login-credentials':
            return 'メールアドレスまたはパスワードを再度ご確認ください'  
    }
}