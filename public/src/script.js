// Firestore,Storageの初期化
const db = firebase.firestore();
const storage = firebase.storage();

// 変数の宣言
let did = []
let treeMarkers = []; let imageWidth = 90;
let now = new Date();

//Leafletの設定――――――――――――――――――――――――――――――――
//ベースマップ
let gsi = new L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>"
});
let gsi_awai = new L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>"
});
let gsi_eisei = new L.tileLayer('http://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg', {
    attribution: "<a href='http://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html' target='_blank'>国土地理院</a>"
});
let osm = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&amp;copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:22
});

mapboxaccessToken = 'pk.eyJ1IjoidXl1a3V5YSIsImEiOiJjbG5pZ3Q2NjIxcDFxMmttajZmb2E4OXR2In0.A624u6Z5MY-x50Oo06C0Wg';

let mapbox = new L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=' + mapboxaccessToken, {
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
    center:[35.493100018956305, 139.52622316955814],
    zoom:15,
    maxZoom:22,
    minZoom:10,
    zoomControl:true,
    layers:[osm],
});

/* //attributionのまとめプラグインーーーーーーーーーーーーーーーーーーーーーーー
L.control.condensedAttribution({
    emblem: '<div class="emblem-wrap"><i class="far fa-copyright"></i></div>',
    prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>',
    position: 'bottomleft'
  }).addTo(mymap); */

//レイヤコントール追加
L.control.layers(baseLayers).addTo(mymap);
mymap.zoomControl.setPosition('bottomleft');

  // 現在地表示プラグインーーーーーーーーーーーーーーーーーーーーーーーーーーーー
let lc = L.control.locate({
    flyTo:true,
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

//モーダルプラグインーーーーーーーーーーーーーーーーーーーーーーーーーーーー

let options = {
    title:'<big><b>推しの木MAP</b></big>',
    content:'<h3><u>はじめに</u></h3><p>推しの樹木と出会える「推しの木」というサービスです！（※東京都オープンデータハッカソン用デモサイト）</p><h3><u>使い方</u></h3><p>①このダイアログを読み終えたら右下の<b>OKボタンを押してください</b>。<br>②位置情報許可のポップアップが表示されるので、許可すると現在地まで飛んでいきます。<br><h3><u>各ボタンの説明</u></h3><p><img src="./assets/layers.png">　背景地図を選ぶ<br><img src="./assets/location-arrow.png">　現在地の表示・非表示</p><p style="text-align:right;">',
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

//検索ボックス追加
let searchLayer = new L.LayerGroup();
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

//firebase使って樹木情報を表示
function readFirestoreTrees(){
    db.collection("features").get().then((querySnapshot) => {
       querySnapshot.forEach((doc) => {
           // doc.data() is never undefined for query doc snapshots
           console.log(doc.id, " => ", doc.data());
           let dd = doc.data();
 
           did.push(doc.id);
           
           let iconUrl;
           let MigoroMark;

           if(dd.見頃.indexOf(now.getMonth()+1) !== -1) {
            console.log('見頃です');
            iconUrl = "./assets/icon_migoro.png";
            MigoroMark = '<img src="./assets/icon/migoro.png" alt="見頃" width="40" height="20">';
           }else{
            console.log('見頃ではありません');
            iconUrl = "./assets/icon.png";
            MigoroMark = "";
           };

           for (let i = 0; i < did.length; i++) {
            let treeIcon = L.icon({
                iconUrl: iconUrl,
                iconSize: [50,55],
                iconAnchor: [25, 25]
            });
      
            let treeMarker = L.marker([dd.位置.latitude, dd.位置.longitude], { icon: treeIcon, title: dd.公園名 });
            treeMarkers.push(treeMarker);
      
            treeMarker.on('click', () => {
                setSheetHeight(Math.min(50, 720 / window.innerHeight * 100));
                setIsSheetShown(true);
      
                document.getElementById("animalTitle").innerHTML = '<p><b><big>' + dd.あだ名 +'（'+ dd.樹種名 +'）</big></b>' + MigoroMark + '</p><p>命名：@'+ dd.命名者 +'</p>';

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
                if(ImgNum<3){
                    ImgNum=ImgNum;
                }else {
                    ImgNum = Math.min(ImgNum, 3); // ImgNumが3より多い場合は3に制限
                };

                for (let j = ImgNum - 1; j >= 0; j--) {
                    let gsReferenceMulti = storage.refFromURL('gs://oshinoki-7a262.appspot.com/img/' + dd.画像[j]);

                    // ダウンロードURLを非同期で取得し、Promiseを返す
                    let promise = gsReferenceMulti.getDownloadURL()
                        .then((url) => {
                            // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
                            imageUrl = url.replace(/^gs:\/\//, 'https://');
                            return '<img src="' + imageUrl + '" class="inline-block_img"></img>';
                        })
                        .catch((error) => {
                            // エラー処理
                            console.error('ダウンロードURLの取得に失敗しました：', error);
                            return ''; // エラーの場合は空の文字列を返す
                        });

                    promises.push(promise);
                }

                // すべてのPromiseが解決された後に画像をHTMLに追加する
                Promise.all(promises)
                    .then((images) => {
                        addimgHTML = images.join(''); // すべての画像を連結
                        document.getElementById("addimg").innerHTML = '<input type="file" accept="image/*" id="AddImg" onchange="previewFile(\'' + doc.id + '\');" hidden/><label for="AddImg" class="AddImgBtn" >+</label>' + addimgHTML;
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
      
            });
            searchLayer.addLayer(treeMarker);

        }}); 
     });
 };

function MikiBtnClick(docId){

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

/*	// 入力ダイアログを表示 ＋ 入力内容を user に代入
	let mikisyu = Number(window.prompt("幹周を入力してください", ""));


 	// 入力内容が tama の場合は example_tama.html にジャンプ
    if(!isNaN(mikisyu)){
        db.collection("features").doc(docId).update({幹周: mikisyu})
        .then(() => {
                // "success" "warning" "error" "info" の４種類のアイコンがある
                Swal.fire({
                  type:"success",
                  title: "幹周更新しました",
                  text:"ありがとう！これからも成長見守ってね"
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
	    })
    .catch((error) => {
        console.error("Error updating document: ", error);
    });
    }; */
};

// 画像がアップロードされた後に呼び出されるコールバック関数
function onImageUploadComplete(uploadedImageUrl,docId) {
    // 画像URLをFirestoreの該当のドキュメントに追加する
    db.collection("features").doc(docId).update({
        画像: firebase.firestore.FieldValue.arrayUnion(uploadedImageUrl)
    })
    .then(() => {
        // "success" "warning" "error" "info" の４種類のアイコンがある
        Swal.fire({
            type:"success",
            title: "画像追加しました",
            text:"ありがとう！これからも思い出つくろうね"
            });
    })
    .catch((error) => {
        console.error("画像URLの追加エラー: ", error);
    });
}

// Create a root reference
function previewFile(docId){
    let AddImgName = String(now.getFullYear()) + String(now.getMonth() + 1) + String(now.getDate()) + String(now.getHours()) + String(now.getMinutes()) + String(now.getSeconds());
    let storageRef = firebase.storage().ref().child("img/" + AddImgName);

    const Inputfile = document.getElementById('AddImg').files;
    storageRef.put(Inputfile[0]).then((snapshot) => {
        console.log('firebase storageにアップロード完了');

        // 画像がアップロードされたら、ダウンロードURLを取得してコールバック関数に渡す
        storageRef.getDownloadURL()
            .then((url) => {
                // 取得したダウンロードURLをhttpsに変換して imageUrl に代入
                imageUrl = url.replace(/^gs:\/\//, 'https://');
                onImageUploadComplete(AddImgName,docId);
                    // 画像を即座に表示する
                    let imgHTML = '<img src="' + imageUrl + '" class="inline-block_img"></img>';
                    let labelElement = document.querySelector('label[for="AddImg"]');
                    labelElement.insertAdjacentHTML('afterend', imgHTML);
            })
            .catch((error) => {
                // エラー処理
                console.error('ダウンロードURLの取得に失敗しました：', error);
            });
    });
}