.DEFAULT_GOAL := help
.PHONY: help run dev install build preview smoke typecheck clean

NPM ?= npm

help: ## このヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

run: node_modules ## 開発サーバを起動（http://localhost:5173/）
	$(NPM) run dev

dev: run ## run のエイリアス

install node_modules: ## 依存をインストール
	$(NPM) install

build: node_modules ## 型チェック＋本番ビルド
	$(NPM) run build

preview: build ## ビルド結果をプレビュー
	$(NPM) run preview

smoke: build ## ヘッドレスWebGLでシェーダ/実行時エラーを検査
	$(NPM) run smoke

typecheck: node_modules ## 型チェックのみ
	$(NPM) run typecheck

clean: ## ビルド成果物を削除
	rm -rf dist
