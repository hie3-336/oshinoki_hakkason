import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, updateDoc, onSnapshot, query, collection, arrayUnion } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth();
// Firestore,Storageの初期化
const storage = firebase.storage();
const db = getFirestore(app);

// 変数の宣言
const now = new Date();
let imageWidth = 90;
let displayName;
let loadCount = 0;

//ログイン情報――――――――――――――――――――――――――――――――
//ログインアイコン編集
const loginButton = document.getElementById('loginButton');
const profileButton = document.getElementById('profileButton');
const profileLink = document.getElementById('profileLink');
// 仮のログイン状態を表す変数
let isLoggedIn = false;

// index.htmlのURLからuser_idのクエリパラメーターを取得する
const userId = getParameterByName('user_id');

// ユーザー情報を取得
auth.onAuthStateChanged((user) => {
    if (user) {
      if (user.uid === userId) {
        // ユーザーがログインしており、対象のユーザーIDにマッチした場合
        displayName = user.displayName;
        // displayNameを使って必要な処理を行う
        isLoggedIn = true;
        // ログイン状態を確認
        checkLoginStatus();
        modalView(displayName);
      } else {

      }
    } else {

      displayName = 'ゲスト'
      modalView(displayName);
    }
});

// ログイン状態を確認する関数
function checkLoginStatus() {
    if (isLoggedIn) {
      loginButton.style.display = 'none'; // ログインボタンを非表示にする
      profileButton.style.display = 'flex'; // プロフィールボタンを表示する
      profileLink.href = `./profile.html?user_id=${userId}`;
    } else {
      loginButton.style.display = 'flex'; // ログインボタンを表示する
      profileButton.style.display = 'none'; // プロフィールボタンを非表示にする
    }
  }
  // ログイン状態を確認
  checkLoginStatus();
  

//Leafletの設定――――――――――――――――――――――――――――――――
//ベースマップ
let gsi = new L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>",
    maxZoom:18
});
let gsi_awai = new L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>",
    maxZoom:18
});
let gsi_eisei = new L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>",
    maxZoom:18
});
let osm = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:20
});

let mapboxaccessToken = 'pk.eyJ1IjoidXl1a3V5YSIsImEiOiJjbG5pZ3Q2NjIxcDFxMmttajZmb2E4OXR2In0.A624u6Z5MY-x50Oo06C0Wg';

let mapbox = new L.tileLayer('https://api.mapbox.com/styles/v1/uyukuya/clt53vfx500dh01o85k5cf0dy/tiles/{z}/{x}/{y}?access_token=' + mapboxaccessToken, {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    maxZoom:22,
}); 

//ベースマップ
let baseLayers = {
    "地理院地図 標準": gsi,
    "地理院地図 淡色": gsi_awai,
    "地理院地図 衛星画像": gsi_eisei,
    "OpenStreetMap 標準": osm,
    "mapbox":mapbox
};  

//マップのオプションたち
let mymap = L.map('map',{
    //井荻駅付近を初期位置に設定
    center:[35.72413256, 139.616382],
    zoom:16,
    maxZoom:22,
    minZoom:11,
    zoomControl:true,
    layers:[mapbox],
    preferCanvas:true,
});

//レイヤコントール追加
L.control.layers(baseLayers).addTo(mymap);
mymap.zoomControl.setPosition('bottomleft');

// 現在地表示プラグイン
let lc = L.control.locate({
    flyTo:false,
    strings: {
        title: "現在地を表示する",
    },
    showPopup:false,
    onLocationError(){
        alert('現在地が見つかりません');
    },
    markerStyle:{
        iconURL:'../spinner-solid.svg'
    },
    position: 'bottomright'
}).addTo(mymap);

//モーダルプラグイン
const modalView = (DN) => {

    let options = {
        title:'<big><b>ふぁぼツリー(デモ版)</b></big>',
        content:'<h3>ようこそ'+ DN +'さん</h3><h3><u>はじめに</u></h3><p>推しの樹木と出会えるふぁぼツリーというサービスです！（※東京都オープンデータハッカソン用デモサイト）</p><h3><u>使い方</u></h3><p>①このダイアログを読み終えたら右下の<b>OKボタンを押してください</b>。<br>②位置情報許可のポップアップが表示されるので、許可すると現在地まで移動します。<br><h3><u>各ボタンの説明</u></h3><p><img src="./assets/layers.png">　背景地図を選ぶ<br><img src="./assets/location-arrow.png">　現在地の表示・非表示</p><p style="text-align:right;"><h3><u>注意事項</u></h3><p>●現在デモ版のため、杉並区井荻駅前の樹木をサンプルとして登録しております。また樹高や樹齢、幹周のデータは実際の計測とは異なります。</p>',
        modal: true,
        position:'center',
        closeButton:false
    };
    let win =  L.control.window(mymap, options)
    .prompt({callback:function(){
        //OKボタンを押したら初期から現在地を探す
        // lc.start()
        }
    }).show()
};

//検索ボックス追加
var option = {
    position: 'topright', // topright, topleft, bottomright, bottomleft
    text: '検索',
    placeholder: '地名・住所を入力してください',
  }
  var osmGeocoder = new L.Control.OSMGeocoder(option);
  mymap.addControl(osmGeocoder);

readFirestoreTrees();

//ポリゴンクリック時
function polygonClicked(e){
    mymap.flyTo(e.latlng, 15,{
        animate: true,
        duration: 1.5
    });
}

function onEachFeature(feature, layer){
    // 地物の名前を取り出す
    let name = feature.properties.N03_004;
    // ポップアップに名前を表示する
    layer.bindTooltip(name,
        {
            permanent: true, direction:"center",
            className: 'tooltipClass'
        }
    ).openTooltip();
    layer.on({
        click: polygonClicked
    })
};
            
//東京都GeoJson
let geoJsonDatas = L.geoJSON(geoJsonData, {
    style: function (feature) {
        return {color: '#84C98B'};
    },
    onEachFeature: onEachFeature,
});

let treeMarkers = false;

mymap.on('zoomend', function zoomFeatures(e) {
    let ZmLev = mymap.getZoom();
    if (ZmLev > 14) {
        if(treeMarkers){
            mymap.addLayer(fg);
            mymap.removeLayer(geoJsonDatas);
            treeMarkers=false;
        }

    }else if(ZmLev <= 14){
        if(!treeMarkers){
            mymap.removeLayer(fg);
            mymap.addLayer(geoJsonDatas);
            treeMarkers=true
        }
    }
});

let fg = new L.featureGroup();

//firebase使って樹木情報を表示
async function readFirestoreTrees(){
    const q = await query(collection(db,"features"));
    const unsubscribe = onSnapshot(q,(querySnapshot)=>{
        fg.clearLayers();
        querySnapshot.forEach((doc) => {
           // doc.data() is never undefined for query doc snapshots

           let dd = doc.data();
           

           //let iconUrl;

            /*  let treeIcon = L.icon({
                iconUrl: iconUrl,
                iconSize: [50,55],
                iconAnchor: [25, 25]
            }); */
            let markerColor;
            if(dd.見頃.includes(3)||dd.見頃.includes(4)||dd.見頃.includes(5)) {
                markerColor = '#ff69b4';
            }else if(dd.見頃.includes(6)||dd.見頃.includes(7)||dd.見頃.includes(8)){
                markerColor = '#ffa500';
            }else if(dd.見頃.includes(9)||dd.見頃.includes(10)||dd.見頃.includes(11)){
                markerColor = '#cd853f';
            }else{
                markerColor = '#6495ed';
            }
            
            let treeMarker = L.circleMarker(new L.LatLng(dd.位置.latitude, dd.位置.longitude),{
                radius:dd.幹周*0.5,
                color:markerColor,
                opacity: 0.43
            });


            treeMarker.on('click', () => {
                showTreeDetails(dd, doc.id)

            });
            fg.addLayer(treeMarker);
            
        }); 

    });
};
mymap.addLayer(fg);

// モーダル表示時のズーム処理
function flyToTree(treeData) {
    const currentZoom = mymap.getZoom();
    const targetZoom = 18;
    const offsetY = 35;

    if (currentZoom < targetZoom) {
        const markerLatLng = new L.LatLng(treeData.位置.latitude, treeData.位置.longitude);
        const screenPoint = mymap.latLngToContainerPoint(markerLatLng);
        const offsetPoint = L.point(screenPoint.x, screenPoint.y + offsetY); // 少し下にずらす
        const adjustedLatLng = mymap.containerPointToLatLng(offsetPoint);

        mymap.flyTo(adjustedLatLng, targetZoom, {
            animate: true,
            duration: 1.5,
            paddingTopLeft: [50, 0]
        });
    }
}

// タイトル部分描画処理
function renderTreeOverviewHTML(treeData, docId) {
    // あだ名チェック
    const adana = treeData.あだ名 && treeData.あだ名.trim() !== ""
        ? treeData.あだ名
        : "名前はまだないみたい";

    // 見頃マーク
    const isMigoro = treeData.見頃.includes(now.getMonth() + 1);
    const MigoroMark = isMigoro
        ? '<img src="./assets/icon/migoro.png" alt="見頃" width="40" height="20">'
        : "";

    // タイトルHTMLを作成して差し込み
    const titleHTML = `
        <p>
            <b><big>${adana}（${treeData.樹種名}）</big></b>
            ${MigoroMark}
        </p>
        <p>命名：@${treeData.命名者}</p>
    `;

    document.getElementById("treeTitle").innerHTML = titleHTML;
}

// 樹木情報描画処理
function renderTreeDetailsHTML(treeData, docId) {
    const TreeEra = treeData.樹齢 < 10
        ? "あかちゃん"
        : treeData.樹齢 < 20
            ? "こども"
            : treeData.樹齢 < 40
                ? "おとな"
                : "おじいちゃん";

    const detailHTML = `
        <p>幹周：<span id="mikisyu">${treeData.幹周}ｃｍ</span>
            <input type="button" class="btn" value="　はかる　" onclick="MikiBtnClick('${docId}');"/>
        </p>
        <p>樹高：${treeData.樹高}ｍ</p>
        <p>樹齢：${treeData.樹齢}才（${TreeEra}）</p>
        <p>性格：${treeData.性格}</p>
        <p>見頃：${treeData.見頃}月</p>
        <hr class="marT">
        <p><b>ひとこと：</b></p>
        <div class="balloon_l">
            <div class="faceicon">
                <img src="./assets/icon/tree_chara.png" alt="">
            </div>
            <p class="says">${treeData.コメント}</p>
        </div>
    `;

    document.getElementById("treeExplain").innerHTML = detailHTML;
}


function showTreeDetails(treeData, docId) {
    setSheetHeight(Math.min(50, 720 / window.innerHeight * 100));
    setIsSheetShown(true);

    // ★ズーム処理
    flyToTree(treeData);

    // タイトル部分描画処理
    renderTreeOverviewHTML(treeData, docId);

    // 樹木情報描画処理
    renderTreeDetailsHTML(treeData, docId);

    // 画像表示処理
    const ImgNum = renderTreeImages(treeData);
    
    // コメント投稿処理
    setupCommentForm(treeData, docId, ImgNum, isLoggedIn, displayName);

}

// 樹木画像を表示させる処理
function renderTreeImages(treeData) {
    const topImageRef = storage.refFromURL(`gs://oshinoki-7a262.appspot.com/img/${treeData.画像[0]}`);
    const imgSwiperEl = document.getElementById("imgSwiper");
    const addImgEl = document.getElementById("addimg");

    const ImgNum = treeData.画像.length;
  
    // トップ画像表示
    topImageRef.getDownloadURL()
        .then((url) => {
            const topImageUrl = url.replace(/^gs:\/\//, 'https://');
            const swiperHTML = `<img src="${topImageUrl}" class="inline-block_topimg"><br>`;
            imgSwiperEl.innerHTML = swiperHTML;
        })
        .catch((error) => {
            console.error('トップ画像の取得失敗：', error);
            imgSwiperEl.innerHTML = `<img src="" class="inline-block_topimg"><br>`;
        });
    
    // Firebase画像URLを取得するユーティリティ関数
    function getImageUrlFromStorage(imageId) {
        const gsUrl = `gs://oshinoki-7a262.appspot.com/img/${imageId}`;
        const ref = storage.refFromURL(gsUrl);
        return ref.getDownloadURL().then((url) => url.replace(/^gs:\/\//, 'https://'));
    }
    
    // ポップアップのコメントと画像を描画
    function renderPopupImageAndComment(imageUrl, comment = '') {
        document.getElementById("treeimage").innerHTML = `<img class="treeimage" src="${imageUrl}">`;
        document.getElementById("treecomment").innerHTML = comment;
    }
    
    // ポップアップを開く（num に応じて treeData から画像・コメント取得）
    function openImagePopup(treeData, num) {
        const wrapper = document.querySelector(".popup-wrapper");
        wrapper.classList.remove("is-hidden");
    
        let imageId, comment = '';
    
        if (num === -1) {
            imageId = 'tutorial.png';
        } else {
            imageId = treeData.画像[num];
            comment = treeData.ユーザーコメント?.[num] || '';
        }
    
        getImageUrlFromStorage(imageId)
        .then((imageUrl) => renderPopupImageAndComment(imageUrl, comment))
        .catch((err) => {
            console.error('画像取得失敗:', err);
            renderPopupImageAndComment('', '画像の取得に失敗しました');
        });
    }
    
    // ポップアップを閉じる
    function closeImagePopup() {
        document.querySelector(".popup-wrapper").classList.add("is-hidden");
    }
    
    // グローバルに公開（HTMLから使うため）
    window.openimagePopup = (num) => openImagePopup(treeData, num);
    window.closeimagePopup = closeImagePopup;
  
    // サムネイル画像たち（最大8件）を取得
    const promises = [];
    const startIdx = Math.max(0, ImgNum - 8); // 直近8件

    for (let j = ImgNum - 1; j >= startIdx; j--) {
        const ref = storage.refFromURL(`gs://oshinoki-7a262.appspot.com/img/${treeData.画像[j]}`);
        const promise = ref.getDownloadURL()
            .then((url) => {
                const thumbUrl = url.replace(/^gs:\/\//, 'https://');
                return `<img src="${thumbUrl}" class="inline-block_img" onclick="openimagePopup(${j})">`;
            })
            .catch((error) => {
                console.error('サムネイル画像取得失敗：', error);
                return ''; // 表示しない
            });
  
        promises.push(promise);
    }
    
  
    Promise.all(promises).then((htmlArray) => {
        addImgEl.innerHTML = htmlArray.join('');
    });

    return ImgNum;
}

// コメント投稿トグルを表示する処理
function toggleCommentFormUI(commentFormState, isLoggedIn) {
    if (!isLoggedIn) {
        alert('画像を投稿するにはログインが必要です。右上のアイコンからログインしてね！');
        return commentFormState;
    }

    const shouldOpen = commentFormState === "close";
    document.getElementById('postCancelBtn').textContent = shouldOpen ? 'キャンセル' : '投稿する';
    document.getElementById('imageBtn').classList.toggle('hidden', !shouldOpen);
    document.getElementById('submitBtn').classList.toggle('hidden', !shouldOpen);
    document.querySelector('.commentSection').classList.toggle('hidden', !shouldOpen);
    document.getElementById('fileNameContainer').classList.toggle('hidden', !shouldOpen);
    document.querySelector('.checkbox').classList.toggle('hidden', !shouldOpen);

    if (!shouldOpen) resetForm();
    return shouldOpen ? "open" : "close";
}

// 画像投稿処理
function setupImageInputHandler() {
    const imageBtn = document.getElementById('imageBtn');
    const imageInput = document.getElementById('imageInput');
    const fileName = document.getElementById('fileName');
    const fileNameContainer = document.getElementById('fileNameContainer');

    // ファイル選択ボタンが押されたら input をトリガー
    imageBtn.onclick = () => {
        imageInput.click();
    };

    // ファイル選択されたときの処理
    imageInput.addEventListener('change', () => {
        if (imageInput.files.length > 0) {
            fileName.textContent = imageInput.files[0].name;
            fileNameContainer.classList.remove('hidden');
        } else {
            fileName.textContent = '';
            fileNameContainer.classList.add('hidden');
        }
    });
}

function setupCommentForm(treeData, docId, imgNum, isLoggedIn, displayName) {
    const postCancelBtn = document.getElementById('postCancelBtn');
    const submitBtn = document.getElementById('submitBtn');
    const commentSection = document.querySelector('.commentSection');
    const checkbox = document.querySelector('.checkbox');
    const commentInput = document.getElementById('comment');
    let commentFormState = "close";
  
    postCancelBtn.onclick = () => {
        // コメント投稿トグルを表示する処理
        commentFormState = toggleCommentFormUI(commentFormState, isLoggedIn);
    };
  
    // 画像投稿処理
    setupImageInputHandler();
  
    // 送信処理
    submitBtn.onclick = () => {
        if (commentInput.value.trim() === '' || !imageInput.files.length) {
            alert('コメントと画像を入力してください');
            return;
        }
  
        const AddImgName = `${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
        const storageRef = firebase.storage().ref().child("img/" + AddImgName);
        const commentText = commentInput.value;
  
        storageRef.put(imageInput.files[0]).then(() => {
            return storageRef.getDownloadURL();
        }).then((url) => {
            const imageUrl = url.replace(/^gs:\/\//, 'https://');
  
            // Firestoreに反映
            return updateDoc(doc(db, "features", docId), {
                画像: arrayUnion(AddImgName),
                ユーザーコメント: arrayUnion(commentText),
                ユーザー: arrayUnion(displayName)
            }).then(() => {
                // 投稿完了UI
                Swal.fire({
                    icon: "success",
                    title: "写真を投稿しました！",
                    text: "ありがとう！これからも思い出つくろうね"
                });

                treeData.画像.push(AddImgName);
                treeData.ユーザーコメント.push(commentText);
                treeData.ユーザー.push(displayName);
    
                const newImgIndex = treeData.画像.length - 1;
                const imgHTML = `<img src="${imageUrl}" class="inline-block_img" onclick="openimagePopup(${newImgIndex})">`;
                document.getElementById('addimg').insertAdjacentHTML('afterbegin', imgHTML);
    
                resetForm();
                setIsSheetShown(false);
            });
        }).catch((error) => {
            console.error("投稿エラー：", error);
            Swal.fire({
                icon: "error",
                title: "投稿に失敗しました",
                text: "通信状況を確認してね"
            });
        });
    };
  
    function resetForm() {
        postCancelBtn.textContent = '投稿する';
        imageBtn.classList.add('hidden');
        submitBtn.classList.add('hidden');
        commentSection.classList.add('hidden');
        fileName.textContent = '';
        fileNameContainer.classList.add('hidden');
        checkbox.classList.add('hidden');
        imageInput.value = '';
        commentFormState = "close";
        commentInput.value = '';
    }
}



window.MikiBtnClick = (docId) => {

    Swal.fire({
        title: "幹周を入力してください",
        text: "※数値のみ",
        input: "number",
        confirmButtonText: '送信',
        allowOutsideClick: false
    })
    .then(function(result){
        if (result.value) {
            let mikiRef = doc(db,"features",docId);
            updateDoc(mikiRef,{
                幹周: result.value
            });
            Swal.fire({
            type: 'success',
            title: '幹周更新しました',
            html: 'ありがとう！これからも成長見守ってね'
            });
            
            // 更新後のデータを再度取得してHTML要素に反映
                document.getElementById("mikisyu").textContent = result.value + 'ｃｍ';
        }

    })    
    .catch((error) => {
        console.error("Error updating document: ", error);
    });

};

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

