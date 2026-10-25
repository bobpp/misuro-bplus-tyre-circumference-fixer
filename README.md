# MISURO B+ Tyre Circumference Fixer

MISURO B+ の車輪回転数をタイヤ周長に合わせて換算し、Bluetooth Low Energy（BLE）で中継する Node.js / TypeScript 製のツールです。

受信側で MISURO B+ の小さな周長を設定できない場合に、受信側が設定できる周長に合わせて回転数を変換します。パワーの測定データもそのまま中継します。

```text
MISURO B+ → このツール → サイクルコンピューター / トレーニングアプリ
            回転数を換算          換算先の周長を設定
```

## 機能

- Cycling Speed and Cadence（CSC、UUID: `1816`）の車輪回転数を換算して通知します。
- 車輪イベント時刻を維持し、換算した回転数と受信側の周長設定で速度を計算できるようにします。
- Cycling Power（CP、UUID: `1818`）の測定データを変更せずに通知します。
- CSC のクランク回転データは除去するため、CSC 経由のケイデンスは中継しません。

## 必要なもの

- MISURO B+ と、BLE センサーに接続できる受信機器またはアプリ
- Node.js と npm（リポジトリの `.node-version` は `14.16.0`）
- BLE のセントラル（センサーへの接続）とペリフェラル（受信側への公開）を同時に扱える実行環境

BLE 通信には `@abandonware/noble` と `@abandonware/bleno` を使用します。OS・Bluetooth アダプターに応じたネイティブビルド環境やアクセス権限が必要です。導入方法は、各ライブラリの README を参照してください。

- [noble のセットアップ](https://github.com/abandonware/noble#prerequisites)
- [bleno のセットアップ](https://github.com/abandonware/bleno#prerequisites)

`.node-version` は既存のバージョン指定であり、すべての Node.js・OS の組み合わせでの動作を保証するものではありません。

## セットアップ

リポジトリを取得し、そのディレクトリで依存パッケージをインストールします。

```sh
npm ci
```

### タイヤ周長の設定

`src/Constants.ts` の値を使用する機器に合わせて変更します。周長の単位は **メートル** です。

| 定数 | 初期値 | 用途 |
| --- | --- | --- |
| `DEVICE_NAME` | `"bobpp"` | 受信側に広告する BLE デバイス名 |
| `MISURO_BPLUS_TYRE_LENGTH` | `0.08`（80 mm） | MISURO B+ の回転数に対応する元の周長 |
| `CONVERT_TYRE_LENGTH` | `0.3`（300 mm） | 受信側で設定する換算先の周長 |

受信側のタイヤ周長にも `CONVERT_TYRE_LENGTH` と同じ値を設定してください。受信側の入力単位が mm の場合、初期値では `300` を指定します。元の周長は、使用するトレーナーやセンサーの設定に合わせてください。

換算は、受信した累積回転数の差分に対して次の式で行います。

```text
換算後の回転数の増分 = 元の回転数の増分 × 元の周長 ÷ 換算先の周長
```

初期値では、元の 15 回転が換算後の 4 回転に相当し、どちらも距離は 1.2 m になります。内部では小数の回転数を累積しますが、BLE への送信時は整数になるため、通知ごとの速度には丸めによる変動が生じることがあります。

### ビルドと起動

```sh
npm run build
node dist/index.js
```

1. MISURO B+ が測定データを送信する状態にします。
2. ツールを起動すると、CSC サービスを持つ周辺機器を検索して接続します。
3. 受信側で `bobpp`（`DEVICE_NAME` を変更した場合はその名前）を探し、速度センサー・パワーセンサーとして接続します。
4. 受信側のタイヤ周長を換算先の値に設定します。

設定を変更した場合は、再ビルドして起動し直してください。終了するには `Ctrl+C` を押します。

詳細ログを出力する場合は、次のように起動します。

```sh
DEBUG='index,bobpp/*' node dist/index.js
```

## 制約・注意点

- 接続先をデバイス名やアドレスで絞り込む処理はありません。周囲に別の CSC 対応センサーがあると、その機器に接続する可能性があります。
- 接続先に CSC と CP の測定・機能キャラクタリスティックがあることを前提にしています。CSC のみを提供する機器は、メインの中継処理の対象外です。
- 回転数が変わらない通知を受け続け、最後に回転を検出してから 15 秒を超えると、通知購読と広告を停止してセンサーを切断し、再検索します。広告が再開しない場合はプロセスを起動し直してください。
- 回転数の換算処理では、入力の累積回転数のリセットや桁あふれを補正していません。

## 開発

| コマンド | 内容 |
| --- | --- |
| `npm run build` | TypeScript を `dist/` にビルド |
| `npm run watch` | 変更を監視してビルド |
| `npm run clean` | ビルド生成物を削除 |
| `npm run unit` | Jest のユニットテストを実行 |
| `npm run lint` | ESLint と Prettier のチェックを実行 |
| `npm test` | lint とユニットテストを実行 |
| `npm run fix` | Prettier と ESLint の自動修正を実行 |

主なファイルは次のとおりです。

```text
src/
├── index.ts                     # MISURO B+ への接続と BLE 中継
├── Constants.ts                 # デバイス名・UUID・周長の設定
├── model/
│   ├── CSCMeasurement.ts         # CSC データの解析・生成・速度計算
│   └── WheelRevConverter.ts      # 周長に応じた回転数の換算
└── peripheral/                  # 公開する CSC / CP サービス
```
