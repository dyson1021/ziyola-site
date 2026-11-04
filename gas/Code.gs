/**
 * ZIYOLA 取り置き受付 — Google スプレッドシートに1行ずつ記録する Web アプリ
 *
 * 使い方（パソコンのブラウザで。複数の Google アカウントにログインしているならシークレットウィンドウで）
 *  1. https://script.google.com/ →「新しいプロジェクト」→ 最初のコードを消して、このファイルの中身を全部貼り付けて保存
 *     （スプレッドシートの「拡張機能 → Apps Script」に貼っても同じように動く）
 *  2. 上の関数の選択欄で setup を選んで「実行」→ アクセスを許可
 *     → 記録用スプレッドシート「ZIYOLA 取り置き」が自動で作られ、実行ログにその URL が出る
 *  3. 右上「デプロイ → 新しいデプロイ」→ 歯車 →「ウェブアプリ」
 *     次のユーザーとして実行: 自分 / アクセスできるユーザー: 全員 →「デプロイ」
 *  4. 表示された「ウェブアプリの URL」（…/exec）をサイトの SHEET_URL に入れる
 *  コードを直したときは「デプロイを管理 → 編集 → バージョン: 新バージョン」で更新（URL は変わらない）
 */

var SHEET_NAME = '取り置き';
var HEADERS = ['受付日時', '公演日', '会場', '取り置き名', '枚数'];
var MAX_TICKETS = 6;
var MAX_PER_MINUTE = 20; // まとめて大量に送られたときの歯止め

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // 隠し項目に入力がある = 自動投稿。記録せずに成功扱いで返す
    if (body.website) return reply_({ ok: true });

    var r = validate_(body);
    if (r.error) return reply_({ ok: false, error: r.error });

    var cache = CacheService.getScriptCache();
    var n = Number(cache.get('rate') || 0);
    if (n >= MAX_PER_MINUTE) return reply_({ ok: false, error: 'busy' });
    cache.put('rate', String(n + 1), 60);

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = sheet_();
      var p = r.date.split('-');
      sheet.appendRow([new Date(), new Date(+p[0], p[1] - 1, +p[2]), safe_(r.venue), safe_(r.name), r.count]);
      var row = sheet.getLastRow();
      sheet.getRange(row, 1).setNumberFormat('yyyy/mm/dd hh:mm');
      sheet.getRange(row, 2).setNumberFormat('yyyy/mm/dd (ddd)');
    } finally {
      lock.releaseLock();
    }
    return reply_({ ok: true });
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: 'server' });
  }
}

// ブラウザで URL を開いたときの動作確認用（記録先シートの URL も返す）
function doGet() {
  return reply_({ ok: true, service: 'ZIYOLA reserve', sheet: sheet_().getParent().getUrl() });
}

// エディタから一度実行して、権限の許可と記録用シートの作成を済ませる
function setup() {
  var url = sheet_().getParent().getUrl();
  console.log('記録先のスプレッドシート: ' + url);
  return url;
}

function validate_(b) {
  var name = clean_(b.name, 40);
  var date = clean_(b.date, 10);
  var venue = clean_(b.venue, 60);
  var count = Number(b.count);
  if (!name) return { error: '取り置き名を入力してください。' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: '公演日を選んでください。' };
  if (!venue) return { error: '会場名を入力してください。' };
  if (!(count % 1 === 0) || count < 1 || count > MAX_TICKETS) return { error: '枚数は1〜' + MAX_TICKETS + '枚で選んでください。' };
  return { name: name, date: date, venue: venue, count: count };
}

function clean_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

// = + - @ で始まる入力が数式として動かないようにする
function safe_(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// スプレッドシートに付いたスクリプトならそのシート、単体のスクリプトなら初回に作ったシートを使う
function book_() {
  var ss = null;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) {}
  if (ss) return ss;
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  ss = SpreadsheetApp.create('ZIYOLA 取り置き');
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}

function sheet_() {
  var ss = book_();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sh;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
