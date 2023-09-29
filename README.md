1:package.jsonファイルが作成されます。
npm init -y

2: Electronをローカルにインストール
npm install -D electron

3:パッケージング
npm install -D electron-packager

4:Windows用 exe を作る
npx electron-packager src アプリ名 --platform=win32 --arch=x64 --overwrite

