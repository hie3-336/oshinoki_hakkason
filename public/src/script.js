import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth();
// Firestore,Storageの初期化
const db = firebase.firestore();
const storage = firebase.storage();

//ログインアイコン編集
const loginButton = document.getElementById('loginButton');
const profileButton = document.getElementById('profileButton');
const profileLink = document.getElementById('profileLink');
// 仮のログイン状態を表す変数
let isLoggedIn = false;

// 変数の宣言
let did = [] 
let fg = new L.featureGroup();
let imageWidth = 90;
let now = new Date();
let displayName;

// index.htmlのURLからuser_idのクエリパラメーターを取得する
const userId = getParameterByName('user_id');

// ユーザー情報を取得
auth.onAuthStateChanged((user) => {
    if (user) {
      if (user.uid === userId) {
        // ユーザーがログインしており、対象のユーザーIDにマッチした場合
        displayName = user.displayName;
        console.log('DisplayName:', displayName);
        // displayNameを使って必要な処理を行う
        isLoggedIn = true;
        // ログイン状態を確認
        checkLoginStatus();
        modalView(displayName);
      } else {
        console.log('指定されたユーザーIDのユーザーが見つかりません');
      }
    } else {
      console.log('ユーザーがログインしていません');
      displayName = '[未ログイン]'
      modalView(displayName);
    }
});

//モーダルプラグインーーーーーーーーーーーーーーーーーーーーーーーーーーーー
const modalView = (DN) => {
    let options = {
        title:'<big><b>推しの木MAP</b></big>',
        content:'<h3>ようこそ'+ DN +'さん</h3><h3><u>はじめに</u></h3><p>推しの樹木と出会える「推しの木」というサービスです！（※東京都オープンデータハッカソン用デモサイト）</p><h3><u>使い方</u></h3><p>①このダイアログを読み終えたら右下の<b>OKボタンを押してください</b>。<br>②位置情報許可のポップアップが表示されるので、許可すると現在地まで飛んでいきます。<br><h3><u>各ボタンの説明</u></h3><p><img src="./assets/layers.png">　背景地図を選ぶ<br><img src="./assets/location-arrow.png">　現在地の表示・非表示</p><p style="text-align:right;">',
        modal: true,
        position:'center',
        closeButton:false
    };
    let win =  L.control.window(mymap, options)
    .prompt({callback:function(){
        //OKボタンを押したら初期から現在地を探す
        lc.start()
        }
    }).show()
}

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

let mapbox = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=' + mapboxaccessToken, {
    attribution: '© <a href="https://www.mapbox.com/contribute/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom:22
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
    //杉並区の荻窪公園付近を初期位置に設定
    center:[35.697605, 139.619773],
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

// 現在地表示プラグインーーーーーーーーーーーーーーーーーーーーーーーーーーーー
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

//検索ボックス追加
let searchLayer = new L.LayerGroup();
let treeMarkers = true;
mymap.addLayer(searchLayer);

let controlSearch = new L.Control.Search({
    position:'topleft',
    layer: searchLayer,
    initial: false,
    zoom: 20,
    marker: false,
    collapsed:false
});
mymap.addControl( controlSearch );

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
}
            
//東京都GeoJson
let geoJsonDatas = L.geoJSON(geoJsonData, {
    style: function (feature) {
        return {color: '#84C98B'};
    },
    onEachFeature: onEachFeature,
})

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
})

//firebase使って樹木情報を表示
function readFirestoreTrees(){
    
    db.collection("features").get().then((querySnapshot) => {
       querySnapshot.forEach((doc) => {
           // doc.data() is never undefined for query doc snapshots
           //console.log(doc.id, " => ", doc.data());
           let dd = doc.data();
 
           did.push(doc.id);
           
           //let iconUrl;
           let MigoroMark;

           if(dd.見頃.indexOf(now.getMonth()+1) !== -1) {
            //console.log('見頃です');
            //iconUrl = "./assets/icon_migoro.png";
            MigoroMark = '<img src="./assets/icon/migoro.png" alt="見頃" width="40" height="20">';
           }else{
            //console.log('見頃ではありません');
            //iconUrl = "./assets/icon.png";
            MigoroMark = "";
           };

           //let iconUrl;

           for (let i = 0; i < did.length; i++) {
/*             let treeIcon = L.icon({
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
                radius:dd.幹周*0.2,
                color:markerColor,
                opacity: 0.33
            });

            treeMarker.on('click', () => {
                setSheetHeight(Math.min(50, 720 / window.innerHeight * 100));
                setIsSheetShown(true);

                let PickZmLev = mymap.getZoom();
                //中心ずらし
                if(PickZmLev<18){
                    PickZmLev = 18;
                    let markerLatLng = new L.LatLng(dd.位置.latitude, dd.位置.longitude);
                    let point = mymap.latLngToContainerPoint(markerLatLng);
                    let offsetPoint = L.point([point.x, point.y + 35]);
                    let newMarkerLatLng = mymap.containerPointToLatLng(offsetPoint);
                    //ズームレベル18より大きいときはそのまま（mapbox想定）               
                    mymap.flyTo(newMarkerLatLng, PickZmLev,{
                        animate: true,
                        duration: 1.5,
                        paddingTopLeft: [50, 0]
                    });
                };
                document.getElementById("treeTitle").innerHTML = '<p><b><big>' + dd.あだ名 +'（'+ dd.樹種名 +'）</big></b>' + MigoroMark + '</p><p>命名：@'+ dd.命名者 +'</p>';

                const gsReferenceTop = storage.refFromURL('gs://oshinoki-7a262.appspot.com/img/'+dd.画像[0]);
                let imageUrl = ''; // imageUrl 変数を外部スコープで宣言
                
                gsReferenceTop.getDownloadURL()
                  .then((url) => {
                    // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
                    imageUrl = url.replace(/^gs:\/\//, 'https://');
                    // 画像を表示するための処理もこのコールバック内で行う
                    let swiperHTML = '<img src="' + imageUrl + '" class="inline-block_topimg"></img><br>';
                    document.getElementById("imgSwiper").innerHTML = swiperHTML;
                  })
                  .catch((error) => {
                    // エラー処理
                    console.error('ダウンロードURLの取得に失敗しました：', error);
                  });      

                //複数画像の表示
                let addimgHTML = "";
                let promises = [];
                let ImgNum = dd.画像.length;
                let lastImg = 0;
                if(ImgNum>=3){
                    lastImg = ImgNum - 3;
                };

                for (let j = ImgNum - 1; j >= lastImg; j--) {
                    let gsReferenceMulti = storage.refFromURL('gs://oshinoki-7a262.appspot.com/img/' + dd.画像[j]);

                    // ダウンロードURLを非同期で取得し、Promiseを返す
                    let promise = gsReferenceMulti.getDownloadURL()
                        .then((url) => {
                            // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
                            imageUrl = url.replace(/^gs:\/\//, 'https://');
                            return '<img src="' + imageUrl + '" class="inline-block_img" onclick="openimagePopup(' + j + ')"></img>';
                        })
                        .catch((error) => {
                            // エラー処理
                            console.error('ダウンロードURLの取得に失敗しました：', error);
                            return ''; // エラーの場合は空の文字列を返す
                        });
                    
                    promises.push(promise);
                }
                
                //画像・コメント表示ポップアップ関連
                window.openimagePopup = (num)  => {
                    const popup = document.getElementById('commentpopup');
                    popup.style.display = 'block';
                    console.log('dd画像テスト',dd.画像[num])
                    const gsReferencePopup = storage.refFromURL('gs://oshinoki-7a262.appspot.com/img/' + dd.画像[num]);

                    // ダウンロードURLを非同期で取得し、Promiseを返す
                    gsReferencePopup.getDownloadURL()
                    .then((url) => {
                        // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
                        imageUrl = url.replace(/^gs:\/\//, 'https://');
                        document.getElementById("treeimage").innerHTML ='<img src="' + imageUrl + '"></img> ' ;
                        document.getElementById("treecomment").innerHTML = dd.ユーザーコメント[num];
                    })
                    .catch((error) => {
                        // エラー処理
                        console.error('ダウンロードURLの取得に失敗しました：', error);
                    });                    
                }
                  
                window.closeimagePopup = () => {
                    const popup = document.getElementById('commentpopup');
                    popup.style.display = 'none';
                }


                // すべてのPromiseが解決された後に画像をHTMLに追加する
                Promise.all(promises)
                    .then((images) => {
                        addimgHTML = images.join(''); // すべての画像を連結

                        document.getElementById("addimg").innerHTML = '<input type="button" onclick="opencommentPopup()" id="AddImg"><label for="AddImg" class="AddImgBtn" >+</label>' + addimgHTML;
                        // <input type="file" accept="image/*" id="AddImg" onchange="previewFile(\'' + doc.id + '\');" hidden/> ← <label for…の前に書いてあった記述内容
                });


                //コメント投稿ポップアップ関連
                window.opencommentPopup = ()  => {
                    const popup = document.getElementById('popup');
                    popup.style.display = 'block';
                }
                  
                window.closecommentPopup = () => {
                    const popup = document.getElementById('popup');
                    popup.style.display = 'none';
                }

                

                //画像投稿のポップアップのHTMLを作成
                document.getElementById("submitbutton").innerHTML = '<button type="button" onclick="submitForm(\'' + doc.id + '\')">投稿</button>'
                
                window.submitForm = (docId) => {
                    const fileInput = document.getElementById('fileInput');
                    const commentInput = document.getElementById('commentInput');
                    
                    // Check if both file and comment are provided
                    if (fileInput.files.length === 0 || commentInput.value.trim() === '') {
                        alert('写真の選択とコメントの入力をしてください。');
                        return;
                    }
                    let AddImgName = String(now.getFullYear()) + String(now.getMonth() + 1) + String(now.getDate()) + String(now.getHours()) + String(now.getMinutes()) + String(now.getSeconds());
                    let storageRef = firebase.storage().ref().child("img/" + AddImgName);
                
                    //コメント情報読み込み
                    let commenttext = commentInput.value;
                    
                    storageRef.put(fileInput.files[0]).then((snapshot) => {
                        console.log('firebase storageにアップロード完了');
                
                        // 画像がアップロードされたら、ダウンロードURLを取得してコールバック関数に渡す
                        storageRef.getDownloadURL()
                            .then((url) => {
                                // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
                                imageUrl = url.replace(/^gs:\/\//, 'https://');
                                onImageUploadComplete(AddImgName,commenttext,docId);
                                    // 画像を即座に表示する
                                    
                                    readFirestoreTrees();
                                    console.log('TestImg:',ImgNum)
                                    let imgHTML = '<img src="' + imageUrl + '" class="inline-block_img" onclick="openimagePopup(' + ImgNum + ')"></img>';
                                    let labelElement = document.querySelector('label[for="AddImg"]');
                                    labelElement.insertAdjacentHTML('afterend', imgHTML);
                            })
                            .catch((error) => {
                                // エラー処理
                                console.error('ダウンロードURLの取得に失敗しました：', error);
                            });
                    });

                    // 画像がアップロードされた後に呼び出されるコールバック関数
                    function onImageUploadComplete(uploadedImageUrl,comment,docId) {
                        // 画像URLをFirestoreの該当のドキュメントに追加する
                        console.log('ユーザー名テスト',displayName);
                        db.collection("features").doc(docId).update({
                            画像: firebase.firestore.FieldValue.arrayUnion(uploadedImageUrl),
                            ユーザーコメント: firebase.firestore.FieldValue.arrayUnion(comment),
                            ユーザー: firebase.firestore.FieldValue.arrayUnion(displayName)
                        })
                        .then(() => {
                            // "success" "warning" "error" "info" の４種類のアイコンがある
                            Swal.fire({
                                type:"success",
                                title: "写真を投稿しました",
                                text:"ありがとう！これからも思い出つくろうね"
                                });
                        })
                        .catch((error) => {
                            console.error("画像URLの追加エラー: ", error);
                        });
                    }
                    closecommentPopup();
                }

                let TreeEra ="";
                if(dd.樹齢<10){
                    TreeEra="あかちゃん"
                }else if(dd.樹齢<20){
                    TreeEra="こども"
                }else if(dd.樹齢<40){
                    TreeEra="おとな"
                }else{
                    TreeEra="おじいちゃん"
                }

                let bestsee = dd.見頃.join("月,");
      
                document.getElementById("treeExplain").innerHTML = '<p>幹周：<span id="mikisyu">'+dd.幹周+'ｃｍ</span><input type="button" class="btn" value="　はかる　" onclick="MikiBtnClick(\'' + doc.id + '\');"/></p><p>樹高：'+dd.樹高+'ｍ</p><p>樹齢：'+ dd.樹齢 + '才（' +TreeEra +'）</p><p>性格：'+ dd.性格 + '</p><p>見頃：'+ bestsee + '月</p><hr class="marT"><p><b>ひとこと：</b></p><div class="balloon_l"><div class="faceicon"><img src="./assets/icon/tree_chara.png" alt="" ></div><p class="says">'+dd.コメント+'</p></div>'
      
            });
            searchLayer.addLayer(treeMarker);
            treeMarker.addTo(fg);
        }}); 
     });
     fg.addTo(mymap);
 };

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
            db.collection("features").doc(docId).update({幹周: result.value})
            Swal.fire({
            type: 'success',
            title: '幹周更新しました',
            html: 'ありがとう！これからも成長見守ってね'
            });
            // 更新後のデータを再度取得してHTML要素に反映
            db.collection("features").doc(docId).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById("mikisyu").textContent = data.幹周 + 'ｃｍ';
            } else {
                console.error("Document does not exist");
            }
            })
            .catch((error) => {
                // The document probably doesn't exist.
                console.error("Error updating document: ", error);
            });
        }

    })    
    .catch((error) => {
        console.error("Error updating document: ", error);
    });;

};



// Create a root reference
// window.previewFile = (docId) => {
//     let AddImgName = String(now.getFullYear()) + String(now.getMonth() + 1) + String(now.getDate()) + String(now.getHours()) + String(now.getMinutes()) + String(now.getSeconds());
//     let storageRef = firebase.storage().ref().child("img/" + AddImgName);

//      const Inputfile = document.getElementById('AddImg').files;
//     storageRef.put(Inputfile[0]).then((snapshot) => {
//         console.log('firebase storageにアップロード完了');

//         // 画像がアップロードされたら、ダウンロードURLを取得してコールバック関数に渡す
//         storageRef.getDownloadURL()
//             .then((url) => {
//                 // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
//                 imageUrl = url.replace(/^gs:\/\//, 'https://');
//                 onImageUploadComplete(AddImgName,docId);
//                     // 画像を即座に表示する
//                     let imgHTML = '<img src="' + imageUrl + '" class="inline-block_img"></img>';
//                     let labelElement = document.querySelector('label[for="AddImg"]');
//                     labelElement.insertAdjacentHTML('afterend', imgHTML);
//             })
//             .catch((error) => {
//                 // エラー処理
//                 console.error('ダウンロードURLの取得に失敗しました：', error);
//             });
//     });
// }

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

