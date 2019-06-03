const base64ToArrayBuffer = (base64) => {
    base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

const ExposureModeLabels = {
    "Not defined":"未定義",
    "Manual":"マニュアル",
    "Normal program":"Normal program",
    "Aperture priority":"AE",
    "Shutter priority":"SE",
    "Creative program":"クリエイティブモード",
    "Action program":"Action Program",
    "Portrait mode":"ポートレート",
    "Landscape mode":"風景"
};

const MeteringModeLabels = {
    "Unknown":"不明",
    "Average":"平均",
    "CenterWeightedAverage":"中央重点",
    "Spot":"スポット",
    "MultiSpot":"マルチスポット",
    "Pattern":"パターン",
    "Partial":"部分",
    "Other":"その他"
};

const exifKeyLabel = [
    {name: "FNumber",label: "F値",format: (v) => v},
    {name: "Model",label: "カメラ",format: (v) => v},
    {name: "UserComment",label: "コメント",format: (v) => decodeURI(v)},
    {name: "Artist",label: "作者",format: (v) => decodeURI(v)},
    {name: "ExposureProgram",label: "露光モード",format: (v) => ExposureModeLabels[v]},
    {name: "MeteringMode",label: "測光モード",format: (v) => MeteringModeLabels[v]},
    {name: "ISOSpeedRatings",label: "ISO",format: (v) => v},
];

let file = document.getElementById('file');
let canvas = document.getElementById('canvas');
let canvasWidth = 400;
let canvasHeight = 300;
let uploadImgSrc;

// Canvasの準備
canvas.width = canvasWidth;
canvas.height = canvasHeight;
let ctx = canvas.getContext('2d');

function loadLocalImage(e) {
    // ファイル情報を取得
    let fileData = e.target.files[0];

    // 画像ファイル以外は処理を止める
    if(!fileData.type.match('image.*')) {
        alert('画像を選択してください');
        return;
    }

    // FileReaderオブジェクトを使ってファイル読み込み
    let reader = new FileReader();
    // ファイル読み込みに成功したときの処理
    reader.onload = function() {
        // Canvas上に表示する
        uploadImgSrc = reader.result;
        let exif = EXIF.readFromBinaryFile(base64ToArrayBuffer(uploadImgSrc));
        console.log(exif);
        $("#exiflist").append(
            exifKeyLabel.reduce(
                (tag, item) => tag + "<tr><th>" + item.label +"</th><th>" + item.format(exif[item.name]) + "</th></tr>"
                , ""
            )
        );
        canvasDraw();
    }
    // ファイル読み込みを実行
    reader.readAsDataURL(fileData);
}

// ファイルが指定された時にloadLocalImage()を実行
file.addEventListener('change', loadLocalImage, false);

// Canvas上に画像を表示する
function canvasDraw(imgSrc) {
    // canvas内の要素をクリアする
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Canvas上に画像を表示
    let img = new Image();
    img.src = uploadImgSrc;
    img.onload = function() {

        ctx.drawImage(img, 0, 0, canvasWidth, this.height * (canvasWidth / this.width));

        // Canvas上にテキストを表示
        addText();

        // canvasを画像に変換
        let data = canvas.toDataURL();

        // ダウンロードリンクを生成して出力
        let dlLink = document.createElement('a');
        dlLink.href = data;
        dlLink.download = 'sample.png';
        dlLink.innerText = 'ダウンロード';
        document.getElementById('result').appendChild(dlLink);
    }
}

// Canvas上にテキストを表示する
function addText() {
    ctx.fillStyle = '#fdd000';
    ctx.fillRect(10, 10, 140, 30);

    ctx.font = "bold 20px 'MS Pゴシック'";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#002B69';
    ctx.fillText('株式会社TAM', 80, 25);
}