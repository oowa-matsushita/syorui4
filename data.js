// =====================================================================
//  書類の一覧 ― 書類を増やす・名前を変えるときはこのファイルを編集します
//
//  name : 画面に表示する名前
//  file : 印刷するファイル名（PDF または jpg / png 画像）
//         ファイルはすべて index.html と同じ場所に置きます
//         ファイル名は半角英数字にしてください（例：ininjo.pdf）
//         null にすると「未登録」と表示され、選べなくなります
// =====================================================================

const TITLE = "書類印刷システム";

// 頭紙（返送書類チェックリスト）の設定
const COVER = {
  title: "ご返送書類チェックリスト",
  message: "お手数ですが、下記の書類をご確認のうえご返送ください。",
  shop: "",            // 例："松下モータース　TEL 0537-00-0000"（空欄なら表示しません）
  blankRows: 2,        // 手書き用の空欄の行数
  garageItem: "車庫証明（提出後引取りにいったもの）",
  // 頭紙の見出し（書類は2つに分けて載ります）
  groupMain: "返送していただきたい書類",            // coverGroup の指定がない書類と、上の車庫証明はこちら
  groupObtain: "役所などで取得していただきたい書類",   // 「役所などで取得」の欄はこちら
  // 「車庫証明はお客様出し」＝はい のとき、返送リストに載せない書類（画面の名前で指定）
  garageHide: ["車庫申請書（1枚のみ）", "配置図", "自認書", "保管場所使用承諾証明書"],
};

// =====================================================================
//  印刷する順番
//  上から書いた順に印刷されます（頭紙のチェックリストも同じ順になります）
//  行を入れ替えると順番が変わります。ここに無いものは最後に印刷されます。
// =====================================================================
const PRINT_ORDER = [
  "添付書類",                    // 添付書類（ご案内文）
  "振込口座記入用紙",
  "委任状",                      // 個人・法人のプルダウン
  "委任状（個人）（見本）",
  "委任状（法人）（見本）",
  "譲渡証明書",
  "譲渡証明書（個人）（見本）",
  "譲渡証明書（法人）（見本）",
  "所有権解除依頼書",
  "所有権解除依頼書（見本）",
  "還付書類",                    // 都道府県のプルダウン
  "還付書類（静岡県）（見本）",
  "還付書類（愛知県）（見本）",
  "還付書類（三重県）（見本）",
  "還付書類（岐阜県）（見本）",
  "還付書類（石川県）（見本）",
  "還付書類（福井県）（見本）",
  "還付書類（大阪府）（見本）",
  "還付書類（兵庫県）（見本）",
  "還付書類（京都府）（見本）",
  "還付書類（滋賀県）（見本）",
  "還付書類（奈良県）（見本）",
  "還付書類（和歌山県）（見本）",
  "車庫証明の提出の仕方",
  "車庫申請書（1枚のみ）",
  "配置図",                      // 敷地内・離れてる場合のプルダウン
  "配置図（敷地内）（見本）",
  "配置図（離れてる場合）（見本）",
  "自認書",
  "車庫証明（4枚一式）",
  "自認書（見本）",
  "保管場所使用承諾証明書",
  "保管場所使用承諾証明書（見本）",
  "ETCセットアップ",             // 担当者のプルダウン
];

const SECTIONS = [
  {
    title: "お客様に返送を依頼",
    obtain: true,       // 印刷はせず、返送リストにだけ載せる
    items: [
      // listName … 返送リストに印字する名前（省略すると name がそのまま出ます）
      { name: "自動車注文書", listName: "自動車注文書（ご記入ご捺印の上、2枚目以降を返送）" },
      { name: "ローン振込口座記入用紙" },
      { name: "免許証コピー（白黒 両面）" },
    ],
  },
  {
    title: "役所などで取得",
    coverGroup: "役所などで取得していただきたい書類",   // 頭紙ではこの見出しの下に載ります
    obtain: true,       // お客様が取得する書類（印刷はせず、返送リストにだけ載せる）
    items: [
      { name: "印鑑証明書" },
      { name: "住民票", listName: "住民票（本人のみ　マイナンバー・本籍不要）" },
      { name: "戸籍の附票" },
      { name: "戸籍の除票" },
      { name: "戸籍謄本" },
    ],
    note: [                      // 欄の下に出る説明文
      "引越1回　印鑑証明書・住民票",
      "引越2回以上　印鑑証明書・住民票・戸籍の附票",
      "名字変更　戸籍謄本",
    ],
  },
  {
    title: "名義変更の書類",
    items: [
      // mihon … 書類と一緒に印刷できる書き方見本（カードに「見本」ボタンが付きます）
      // mihonName … 印刷順（PRINT_ORDER）で使う見本の名前
      // choices … カードの中のプルダウン。頭紙には「委任状（個人）」のように載ります
      { name: "委任状", choices: [
        { name: "個人", file: "ininjo.pdf", mihon: "mihon-ininjo.jpg",        mihonName: "委任状（個人）（見本）" },
        { name: "法人", file: "ininjo.pdf", mihon: "mihon-ininjo-houjin.jpg", mihonName: "委任状（法人）（見本）" },
      ] },
      { name: "譲渡証明書", choices: [
        { name: "個人", file: "joto.pdf", mihon: "mihon-joto.jpg",        mihonName: "譲渡証明書（個人）（見本）" },
        { name: "法人", file: "joto.pdf", mihon: "mihon-joto-houjin.jpg", mihonName: "譲渡証明書（法人）（見本）" },
      ] },
      { name: "所有権解除依頼書",       file: "shoyuken-kaijo.pdf", mihon: "mihon-shoyuken-kaijo.png", mihonName: "所有権解除依頼書（見本）" },
    ],
  },
  {
    title: "車庫証明の書類",
    items: [
      { name: "車庫申請書（1枚のみ）",   file: "shako-shinsei.pdf" },
      { name: "自認書",                 file: "jinin.pdf",          mihon: "mihon-jinin.jpg",          mihonName: "自認書（見本）" },
      { name: "配置図", choices: [
        { name: "敷地内",       file: "haichizu.pdf", mihon: "mihon-haichizu.jpg",        mihonName: "配置図（敷地内）（見本）" },
        { name: "離れてる場合", file: "haichizu.pdf", mihon: "mihon-haichizu-hanare.jpg", mihonName: "配置図（離れてる場合）（見本）" },
      ] },
      { name: "保管場所使用承諾証明書", file: "shodaku.pdf",        mihon: "mihon-shodaku.jpg",        mihonName: "保管場所使用承諾証明書（見本）" },
    ],
  },
  {
    title: "書き方見本",
    sub: true,          // すぐ上の「車庫証明の書類」の中の小見出しとして表示する
    checklist: false,   // 頭紙のチェックリストには載せない
    items: [
      { name: "車庫証明（4枚一式）",   file: "mihon-shako.jpg" },
      { name: "車庫証明の提出の仕方",  file: "shako-teishutsu.pdf" },
    ],
  },
  {
    title: "還付書類",
    select: true,                     // プルダウンで選ぶ欄にする
    // note … 県を選んだときにカードの下に出る説明（各県の様式の注意書きより）
    selectLabel: "還付書類",           // カードに表示する名前
    listName: "還付書類（{name}）",    // チェックリストでの表示名
    items: [
      { group: "東海・北陸・近畿", name: "愛知県",   file: "kanpu-aichi.pdf", mihon: "mihon-kanpu-aichi.jpg", mihonName: "還付書類（愛知県）（見本）", note: "印鑑証明書：コピー可（等倍）／発行から12か月以内" },
      { group: "東海・北陸・近畿", name: "静岡県",   file: "kanpu-shizuoka.pdf", default: true, mihon: "mihon-kanpu-shizuoka.jpg", mihonName: "還付書類（静岡県）（見本）", note: "印鑑証明書：コピーを添付（譲渡日の6か月以上前に発行されたものは不可）" },   // 最初に選ばれる県
      { group: "東海・北陸・近畿", name: "三重県",   file: "kanpu-mie.pdf", mihon: "mihon-kanpu-mie.jpg", mihonName: "還付書類（三重県）（見本）", note: "印鑑証明書：コピー可／発行後1年以内（領収証書の原本を付ける場合は認印でも可）" },
      { group: "東海・北陸・近畿", name: "岐阜県",   file: "kanpu-gifu.pdf", mihon: "mihon-kanpu-gifu.jpg", mihonName: "還付書類（岐阜県）（見本）", note: "印鑑証明書：等倍コピー可（スキャン後のコピーは不可）／発行から1年以内" },
      { group: "東海・北陸・近畿", name: "富山県",   file: "toyama.pdf", note: "様式に印鑑証明書の記載なし／押印はシャチハタ不可" },
      { group: "東海・北陸・近畿", name: "石川県",   file: "ishikawa.pdf", mihon: "mihon-kanpu-ishikawa.jpg", mihonName: "還付書類（石川県）（見本）", note: "印鑑証明書：コピー可／発行から12か月以内" },
      { group: "東海・北陸・近畿", name: "福井県",   file: "fukui.pdf", mihon: "mihon-kanpu-fukui.jpg", mihonName: "還付書類（福井県）（見本）", note: "印鑑証明書を添付（コピー可否の記載なし）" },
      { group: "東海・北陸・近畿", name: "大阪府",   file: "osaka.pdf", mihon: "mihon-kanpu-osaka.jpg", mihonName: "還付書類（大阪府）（見本）", note: "印鑑証明書：原本またはコピー（等倍）／発行から3か月以内" },
      { group: "東海・北陸・近畿", name: "兵庫県",   file: "hyougo.pdf", mihon: "mihon-kanpu-hyougo.jpg", mihonName: "還付書類（兵庫県）（見本）", note: "印鑑証明書：コピー可／発行から6か月以内" },
      { group: "東海・北陸・近畿", name: "京都府",   file: "kyoto.pdf", mihon: "mihon-kanpu-kyoto.jpg", mihonName: "還付書類（京都府）（見本）", note: "印鑑証明書：コピーを添付" },
      { group: "東海・北陸・近畿", name: "滋賀県",   file: "shiga.pdf", mihon: "mihon-kanpu-shiga.jpg", mihonName: "還付書類（滋賀県）（見本）", note: "印鑑証明書：コピー可（等倍）／発行から12か月以内" },
      { group: "東海・北陸・近畿", name: "奈良県",   file: "nara.pdf", mihon: "mihon-kanpu-nara.jpg", mihonName: "還付書類（奈良県）（見本）", note: "印鑑証明書：コピー可／発行から6か月以内" },
      { group: "東海・北陸・近畿", name: "和歌山県", file: "wakayama.pdf", mihon: "mihon-kanpu-wakayama.jpg", mihonName: "還付書類（和歌山県）（見本）", note: "印鑑証明書：コピー可／発行から6か月以内" },
      { group: "関東・信越",       name: "東京都",   file: "tokyo.pdf", note: "委任者は実印。受任者（当店）から出す場合は印鑑証明書を添付（コピー可・等倍）" },
      { group: "関東・信越",       name: "神奈川県", file: "kanagawa.pdf", note: "印鑑証明書：原本（コピー不可）／様式の注記：発行から2か月以内の原本が別途1通必要" },
      { group: "関東・信越",       name: "埼玉県",   file: "saitama.pdf", note: "印鑑証明書：原本／発行後6か月以内（様式の注記：発行から2か月以内の原本が別途1通必要）" },
      { group: "関東・信越",       name: "千葉県",   file: "chiba.pdf", note: "印鑑証明書：原本（様式の注記：発行から2か月以内の原本が別途1通必要）" },
      { group: "関東・信越",       name: "茨城県",   file: "ibaraki.pdf", note: "印鑑証明書：原本／発行日から3か月以内" },
      { group: "関東・信越",       name: "栃木県",   file: "tochigi.pdf", note: "法人は実印＋印鑑証明書（原本またはコピー）。個人の記載なし" },
      { group: "関東・信越",       name: "群馬県",   file: "gunma.pdf", note: "印鑑証明書の原本（コピー不可）＋実印、または領収証書の原本（コピー不可）＋認印" },
      { group: "関東・信越",       name: "山梨県",   file: "yamanashi.pdf", note: "印鑑証明書：原本（コピー不可）／発行日から3か月以内" },
      { group: "関東・信越",       name: "新潟県",   file: "niigata.pdf", note: "印鑑証明書：原本／発行から3か月以内" },
      { group: "関東・信越",       name: "長野県",   file: "nagano.pdf", note: "印鑑証明書：原本／発行後6か月以内（領収書の提示があれば省略可）" },
      { group: "中国・四国",       name: "島根県",   file: "shimane.pdf", note: "様式に印鑑証明書の記載なし" },
      { group: "中国・四国",       name: "鳥取県",   file: "tottori.pdf", note: "様式に印鑑証明書の記載なし" },
      { group: "中国・四国",       name: "岡山県",   file: "okayama.pdf", note: "印鑑証明書：コピー可／発行日から1年以内（必須）" },
      { group: "中国・四国",       name: "広島県",   file: "hiroshima.pdf", note: "様式に印鑑証明書の記載なし" },
      { group: "中国・四国",       name: "山口県",   file: "yamaguchi.pdf", note: "様式に印鑑証明書の記載なし" },
      { group: "中国・四国",       name: "徳島県",   file: "tokushima.pdf", note: "印鑑証明書：コピー可／発行後3か月以内（認印は不可）" },
      { group: "中国・四国",       name: "香川県",   file: "kagawa.pdf", note: "様式に印鑑証明書の記載なし" },
      { group: "中国・四国",       name: "愛媛県",   file: "ehime.pdf", note: "印鑑証明書：原本（コピー不可）／譲渡した日から6か月以内に発行のもの" },
      { group: "中国・四国",       name: "高知県",   file: "kouchi.pdf", note: "印鑑証明書：原本" },
      { group: "九州・沖縄",       name: "福岡県",   file: "fukuoka.pdf", note: "様式に印鑑証明書の記載なし" },
      { group: "九州・沖縄",       name: "佐賀県",   file: "saga.pdf", note: "印鑑証明書：コピー可" },
      { group: "九州・沖縄",       name: "長崎県",   file: "nagasaki.pdf", note: "印鑑証明書：コピー可（または領収証書）" },
      { group: "九州・沖縄",       name: "熊本県",   file: "kumamoto.pdf", note: "印鑑証明書：コピー可" },
      { group: "九州・沖縄",       name: "大分県",   file: "oita.pdf", note: "様式に印鑑証明書の記載なし" },
      { group: "九州・沖縄",       name: "宮崎県",   file: "miyazaki.pdf", note: "印鑑証明書：コピー可（二重納付の場合は不要・領収証書のコピーを添付）" },
      { group: "九州・沖縄",       name: "鹿児島県", file: "kagoshima.pdf", note: "個人は認印でも可（様式に印鑑証明書の記載なし）" },
      { group: "九州・沖縄",       name: "沖縄県",   file: "okinawa.pdf", note: "印鑑証明書：コピー可" },
    ],
  },
  {
    title: "ETCセットアップ",
    select: true,
    selectLabel: "担当者",
    listName: "ETCセットアップ申請方法のご案内（{name}）",
    checklist: false,              // 返送リストには載せない（載せたい場合はこの行を消す）
    // この書類を選ぶと、頭紙の下にこの文が印字されます
    coverNote: "同封のETCセットアップ申請方法のご案内のQRコードから、申し込みを1週間以内に行ってください",
    items: [
      { name: "浅倉 康介", file: "etc-asakura.pdf" },
      { name: "石神 悠", file: "etc-ishigami.pdf" },
      { name: "石山 拓哉", file: "etc-ishiyama.pdf" },
      { name: "伊藤 健嗣", file: "etc-k-ito.pdf" },
      { name: "内山 浩爾", file: "etc-uchiyama.pdf" },
      { name: "大瀧 雅伸", file: "etc-ohtaki.pdf" },
      { name: "大庭 亮太", file: "etc-ooba.pdf" },
      { name: "大松 虎雅", file: "etc-omatsu.pdf" },
      { name: "大類 哲哉", file: "etc-oorui.pdf" },
      { name: "大和 祐太", file: "etc-oowa.pdf" },
      { name: "柿崎 匡哉", file: "etc-kakizaki.pdf" },
      { name: "小針 剛尚", file: "etc-kobari.pdf" },
      { name: "近藤 寛将", file: "etc-kondo.pdf" },
      { name: "佐藤 寿樹", file: "etc-sato.pdf" },
      { name: "四野見 貴章", file: "etc-shinomi.pdf" },
      { name: "鈴木 孝宏", file: "etc-t-suzuki.pdf" },
      { name: "千原 武友", file: "etc-chihara.pdf" },
      { name: "馬塚 教徳", file: "etc-m-maduka.pdf" },
      { name: "馬塚 基成", file: "etc-maduka.pdf" },
      { name: "原 智昭", file: "etc-hara.pdf" },
      { name: "原木 浩行", file: "etc-haraki.pdf" },
      { name: "平賀 友章", file: "etc-hiraga.pdf" },
    ],
  },
  {
    title: "振込口座",
    items: [
      { name: "振込口座記入用紙", file: "furikomi-kouza.pdf" },
    ],
  },
];
