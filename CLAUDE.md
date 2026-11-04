# ZIYOLA Official Site — 引き継ぎメモ

大阪発ラウドロックバンド ZIYOLA（ジオラ）の公式サイト。静的ワンページ（index.html + assets/）。

## 公開中のアーティファクト
- https://claude.ai/artifact/84an1pTg4jA4wyyZzDpwQQ
- 更新するときは Artifact ツールで `url` にこのURLを渡し、`index.html` を publish（assets は `files` で `assets/xxx` にマップ）。
- 注意: アーティファクトは claude.ai 側で `<!doctype html><head>…` のスケルトンが自動付与される前提。
  ローカル配信や Vercel 等に出す場合は index.html 先頭に `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">` を足し、末尾を `</body></html>` で閉じること。

## 構成
- index.html — 全セクション: NAV / HERO / marquee / NEWS / LIVE / DISCOGRAPHY / MEMBER / VIDEO / GOODS / PROFILE / CONTACT / FOOTER
- assets/hero.jpg — アー写（ヒーロー背景、2000px）
- assets/logo.png — 白ロゴ（透過、ヒーロー用）
- assets/cover-rebellion.jpg — RE:bellion ジャケット（900px）
- assets/cover-nofate.jpg / cover-tsukiumi.jpg — NO FATE / 月海 ジャケット（225px、低解像度。高解像度版が来たら差し替え）
- assets/cover-kyoumei.jpg — 共鳴 ジャケット（447px）

## デザイン
- 単一ダークテーマ。**赤×青のクール系**（2026.10 ユーザー指示でオレンジから変更）。トークンは `:root` に集約。
  - 土台は青みの黒 --bg #06070c / --fg #e8ecf5。赤 --accent #d0142c（深いクリムゾン、2026.10 に #ff2b4a から深めに。ユーザー指示）が主役（ボタン・線・グラデ）。黒地の小さな赤文字は読みやすさのため --accent-ink #ec2a44、赤ボタンの文字は白、青 --blue #3a74ff / --steel #86a4ff が受け（リンク・日本語見出し・ホバー）。
  - 赤→青のグラデ --duo をマーキー・GOODS・ライブ枠の線・フッター上線に使う。rgba 用に --bg-rgb / --red-rgb / --blue-rgb。フォームのエラーは赤と区別するため --warn（琥珀）。
  - ヒーローのシェーダーも BG/ACC(赤)/BLU(青) に変更。ロゴの光と波紋は左が赤・右が青。
- ナビ右端に公式 X / Instagram のアイコンリンク（`.sns-nav`、インライン SVG）。スマホでもメニューは隠れるがアイコンは常に表示。
- フォント: Anton（見出し）/ Noto Sans JP（本文）/ Barlow Condensed（ラベル）— Google Fonts。
- ヒーロー: `.hero` 190vh、`.stage` sticky 100vh。ページを開くとアー写のみ → スクロールで `.dim` が暗転し `.wrap`（ロゴ・コピー・CTA）が下からフェードイン（JS onScroll）。prefers-reduced-motion 時は静的表示。
- ヒーロー演出 = 提案A「共鳴」（2026.10 採用）。`#gl` の WebGL シェーダーが写真・暗転・ロゴ・グレインをまとめて描画（DOM のロゴ img は位置合わせ用に透明）。
  - 波紋（衝撃波＋RGB分離）は **ロゴが出てから（prog>0.8）だけ、必ずロゴ中心から** 出す。範囲はロゴ幅×0.62 の横長楕円で、顔にかからないようにしている（ユーザー指示）。
  - ロゴ着地時に大きな一撃、以降約2秒ごとの鼓動（2026.10 に 1.33秒から延長、ユーザー指示）。タップ/ドラッグもロゴ中心から。
  - サウンド機能は削除済み（2026.10 ユーザー指示）。
  - WebGL 不可なら `.no-gl` → 従来の `.photo` + `.dim` 表示に戻る。reduced-motion は静止版。
  - Scroll ヒントはナビ分（+72px）上げてある（以前は画面外で見えていなかった）。
- 3案の提案ページとデモ: proposals/hero/（公開 https://claude.ai/artifact/2pJ7wrccFnYvLrhw9F3E33）
- ロゴは中央揃え、幅 min(70%,540px)（2026.10 に 440px から拡大、ユーザー指示）。

## 確定している実データ（出典: vk.gy / TuneCore / Apple Music / YouTube）
- メンバー: Vo.MAHO（2026年新加入）/ Gt.将 @ZIYOLA_SHO / Ba.Bucchi @ZIYOLA_bucchi
- ディスコ: 共鳴 2022.01.07 / 月海 2022.06.29（月海・冥海・correct）/ NO FATE 2023.08.01（7曲）/ RE:bellion 2025.01.12
- YouTube: ZIYOLA official（UCThuoJ-cnPDVBzeGMM2Jozg, @ziyola2022）、RE:bellion MV = EoWnbLm7fxk、correct ライブリリック = 2E_ur-UspVY
- Apple Music artist 1602905165 / Spotify artist 7pkDwJHq6KzD7Vg4l7g04T / TuneCore ZIYOLA-108
- 公式X @ZIYOLA_official / Instagram ziyola__official

## ユーザー指示で決まっていること
- CONTACT の連絡先は Gmail ziyola2022@gmail.com に統一（Booking / Ticket とも。2026.11）。「取材」「タイアップ」の文言は載せない（見出しも Booking のみ）
- AVELDCAIN（前身バンド）への言及は載せない
- MEMBER の紹介文は載せない（パート・名前・SNSのみ）
- ヒーローのロゴは写真を隠さないサイズで中央

## 未着手・素材待ち
- ジャケット画像の高解像度版: NO FATE / 月海（現在225px。共鳴も447pxなので可能なら900px級）
- メンバー個別写真（`.mem .photo` は現状「NEW VISUAL / Coming soon」表示のプレースホルダー、3:4。2026.11 ユーザー指示。写真が来たら img に差し替え）
- MAHO の X / Instagram
- LIVE 日程（現在「決定次第発表」のTBAカード1枚）
- ナビ/フッターの「ZIYOLA」はテキストのまま（ロゴ画像化するか要確認）
- GOODS のオンラインストアURL

## 取り置きフォーム（LIVE 欄 `#reserve`）
- 項目: 取り置き名 / 公演日（date）+ 会場名 / 枚数（1〜6）。過去日は選べない。
- 公演日はカレンダーから選ぶだけ（2026.11 ユーザー指示。PC で年/月/日を打ち込む挙動が分かりにくかったため）。欄のどこをクリックしても開くよう、ブラウザ本来のカレンダーボタン（`::-webkit-calendar-picker-indicator`）を透明のまま欄全体に広げている（JS の showPicker はクリックでは使わない。claude.ai の iframe 内などで止められ右端しか反応しなかったため）。アイコンは `.dateicon` の SVG。Enter/Space/↓ は `showPicker()`、文字入力は無効、Tab/Shift+Tab は会場名/取り置き名へ移動。ネイティブの yyyy/mm/dd 表示は隠し、上に重ねた `#r-dateshow` に「2026年11月20日（金）」/未選択は「日付を選択」を表示（PC・スマホ共通）。隠し項目 `website` はスパム避け（入っていたら送らずに成功表示）。
- 届け先は **Google フォーム**（2026.11 ユーザー指示。LINE → X DM → Apps Script → FormSubmit（終了）→ Gmail 関数 → Formspree 案を経てこれに決定。Apps Script / 自前 API / 外部フォーム中継は使わない。api/・package.json は削除済み）。
  - 仕組み: サイトのフォーム → `fetch(GFORM_ACTION,{method:'POST',mode:'no-cors'})` で Google フォームの formResponse に `entry.NNN=値` を送る → 回答は Google フォームの「回答」タブ（スプレッドシートにも書き出せる）。
  - Google フォーム「ZIYOLA取り置きフォーム」（2026.11 ユーザー作成）: `GFORM_ACTION` = https://docs.google.com/forms/d/e/1FAIpQLSe75x2IM6TZVSsGqm7Dhg8IHPF1Nmjk-vEAujaGVCJjXEMN4A/formResponse 、`GFORM_FIELDS` = 取り置き名 entry.1337964562 / 公演日 entry.1103086995 / 会場名 entry.1224712791 / 枚数 entry.798879697。entry ID は viewform ページの FB_PUBLIC_LOAD_DATA_ から読める。
  - 質問は 取り置き名・会場名・枚数が「記述式」、**公演日は「日付」質問**なので `entry.1103086995_year/_month/_day` に分けて送る（文字列だと受け付けられない）。枚数は「2枚」の文字列。質問の種類を変えたらサイト側も合わせること。ログイン必須・回答1回制限・メール収集はオフにすること（オンだと匿名で送れない）。
  - **Google は CORS ヘッダーを返さないので、送信結果はページから読めない。** 通信が終わったら成功表示、通信エラーのときだけ失敗表示。設定ミスは画面に出ないので、設定後に必ずテスト送信して「回答」タブで確認する。
  - **claude.ai 版は外部への通信が止められるので常に失敗表示（X DM の文面）。送れるのは Vercel 版のみ。**
  - Vercel に残っている環境変数 GMAIL_USER は旧方式の名残で未使用。
- 送れなかったとき（GFORM 未設定、claude.ai 版、通信エラー）は「送信に失敗しました…」＋X DM 用の文面＋Copy＋公式Xボタン。
  - `var X_DM_ID` に @ZIYOLA_official の数字のユーザーIDを入れると、宛先・文面入りの DM 画面を開くボタンになる（現在は空）。
- 公演が決まって LIVE にカードが増えたら、公演日と会場をセレクトにする余地あり。

## Vercel 公開（2026.11 公開済み）
- 本番URL: https://ziyola-site.vercel.app （Vercel プロジェクト ziyola-site / prj_ZMVdcZQUX5s0Uvk4f7VMlAnWQmiN、個人アカウント）
- GitHub: dyson1021/ziyola-site（Private）の main に push すると自動で本番デプロイされる。
- `vercel.json`: build = `node scripts/build.mjs`（index.html に doctype/head を付けて dist/ を作る）、output = dist。依存パッケージ・サーバー処理なし（静的サイトのみ）。
- Vercel Authentication は標準設定（プレビューURLは要ログイン、本番ドメインは公開）。
- claude.ai のアーティファクトも並行して更新している（中身は同じ index.html）。取り置きのメール送信が動くのは Vercel 版だけ。
