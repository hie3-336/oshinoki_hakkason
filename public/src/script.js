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
let imageWidth = 90;
let now = new Date();
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
        lc.start()
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
           console.log(doc.id, " => ", doc.data());
           let dd = doc.data();
           
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
            console.log("お");

            treeMarker.on('click', () => {
                console.log("え");
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
                let adana;
                if(dd.あだ名!=""){
                    adana=dd.あだ名;
                }else{
                    adana="名前はまだないみたい";
                }
                document.getElementById("treeTitle").innerHTML = '<p><b><big>' + adana +'（'+ dd.樹種名 +'）</big></b>' + MigoroMark + '</p><p>命名：@'+ dd.命名者 +'</p>';

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
                if(ImgNum>=8){
                    lastImg = ImgNum - 8;
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
                    // const popup = document.getElementById('commentpopup');
                    // popup.style.display = 'block';
                    var open = document.getElementsByClassName("popup-wrapper"); /*クラス名"popup-wrapper"のオブジェクトの配列を取得*/
                    open[0].classList.remove("is-hidden"); /* 最初のオブジェクトが持つCSSクラス("popup-wrapper is-hidden")から"is-hidden"取り除く*/

                    console.log('dd画像テスト',dd.画像[num])
                    const gsReferencePopup = storage.refFromURL('gs://oshinoki-7a262.appspot.com/img/' + dd.画像[num]);

                    // ダウンロードURLを非同期で取得し、Promiseを返す
                    gsReferencePopup.getDownloadURL()
                    .then((url) => {
                        // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
                        imageUrl = url.replace(/^gs:\/\//, 'https://');
                        document.getElementById("treeimage").innerHTML ='<img class="treeimage" src="' + imageUrl + '"></img> ' ;
                        document.getElementById("treecomment").innerHTML = dd.ユーザーコメント[num];
                    })
                    .catch((error) => {
                        // エラー処理
                        console.error('ダウンロードURLの取得に失敗しました：', error);
                    });                    
                }
                
                window.closeimagePopup = () => {
                    var open = document.getElementsByClassName("popup-wrapper");
                    open[0].classList.add("is-hidden"); /* CSSクラス"is-hidden"を付け足す*/
                    // const popup = document.getElementById('commentpopup');
                    // popup.style.display = 'none';
                }


                const postCancelBtn = document.getElementById('postCancelBtn');
                const imageBtn = document.getElementById('imageBtn');
                const imageInput = document.getElementById('imageInput');
                const fileName = document.getElementById('fileName');
                const fileNameContainer = document.getElementById('fileNameContainer');
                const submitBtn = document.getElementById('submitBtn');
                const commentSection = document.querySelector('.commentSection');
                let commentform = "close";
            
                postCancelBtn.onclick = () => {
                    if (isLoggedIn) {
                        if (commentform === "close") {
                            commentform = "open";
                            console.log("あ");
                            postCancelBtn.textContent = 'キャンセル';
                            imageBtn.classList.remove('hidden');
                            submitBtn.classList.remove('hidden');
                            commentSection.classList.remove('hidden');
                            fileNameContainer.classList.remove('hidden'); // 常に空白スペースを表示
                        } else if (commentform === "open") {
                            console.log("い");
                            resetForm();
                        }
                    } else {
                        alert('画像の投稿を行うためには、右上のアイコンからログインしてください。');
                        return;
                    }
                };
            
                imageBtn.onclick = () => {
                    imageInput.click();
                };

                imageInput.addEventListener('change', () => {
                    if (imageInput.files.length > 0) {
                        fileName.textContent = imageInput.files[0].name;
                        fileNameContainer.classList.remove('hidden');
                    } else {
                        fileName.textContent = ''; // ファイルが選択されていない場合はファイル名をクリア
                    }
                  });
            
                submitBtn.onclick = () => {
                    if (comment.value.trim() === '' || !imageInput.files.length) {
                        alert('コメントと画像を入力してください。');
                        return;
                    }
                    const fileInput = document.getElementById('imageInput');
                    const commentInput = document.getElementById('comment');
                    
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
                                onImageUploadComplete(AddImgName,commenttext,doc.id);
                                    // 画像を即座に表示する
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
                    resetForm();
                    setIsSheetShown(false);
                    
                };
            
                function resetForm() {
                    postCancelBtn.textContent = '投稿する';
                    imageBtn.classList.add('hidden');
                    submitBtn.classList.add('hidden');
                    commentSection.classList.add('hidden');
                    fileName.textContent = '';
                    fileNameContainer.classList.add('hidden'); // ファイル名と空白スペースを非表示
                    imageInput.value = '';
                    commentform = "close"
                }

                


                // すべてのPromiseが解決された後に画像をHTMLに追加する
                Promise.all(promises)
                    .then((images) => {
                        addimgHTML = images.join(''); // すべての画像を連結

                        document.getElementById("addimg").innerHTML = addimgHTML;
                        // <input type="file" accept="image/*" id="AddImg" onchange="previewFile(\'' + doc.id + '\');" hidden/> ← <label for…の前に書いてあった記述内容
                });

                
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
                console.log("か");
                resetForm();
            });
            fg.addLayer(treeMarker);
            
        }); 
        console.log(fg);
    });
};
mymap.addLayer(fg);

// 画像がアップロードされた後に呼び出されるコールバック関数
async function onImageUploadComplete(uploadedImageUrl,comment,docId) {
    // 画像URLをFirestoreの該当のドキュメントに追加する
    console.log('ユーザー名テスト',displayName);
    let imgRef = doc(db,"features",docId);
    await updateDoc(imgRef,{
        画像: arrayUnion(uploadedImageUrl),
        ユーザーコメント: arrayUnion(comment),
        ユーザー: arrayUnion(displayName)
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
};

window.MikiBtnClick = (docId) => {
    console.log("う");
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

