.DEFAULT_GOAL := help
.PHONY: help run dev stop status install build preview smoke typecheck ci clean

NPM ?= npm
PORT ?= 5173

help: ## このヘルプを表示
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

run: node_modules ## 開発サーバを起動（0.0.0.0 で外部公開・http://localhost:$(PORT)/）
	$(NPM) run dev -- --host 0.0.0.0 --port $(PORT)

dev: run ## run のエイリアス

stop: ## 開発サーバを停止（PORT=NNNN で対象ポート指定）
	@lsof -ti tcp:$(PORT) | xargs -r kill 2>/dev/null; echo "stopped (port $(PORT))"

status: ## 開発サーバの稼働確認
	@lsof -ti tcp:$(PORT) >/dev/null 2>&1 && echo "running on $(PORT)" || echo "not running"

install node_modules: ## 依存をインストール
	$(NPM) install

build: node_modules ## 型チェック＋本番ビルド
	$(NPM) run build

preview: build ## ビルド結果をプレビュー
	$(NPM) run preview

smoke: build ## ヘッドレスWebGLでシェーダ/実行時エラー＋楽譜DLを検査
	$(NPM) run smoke

typecheck: node_modules ## 型チェックのみ
	$(NPM) run typecheck

ci: build smoke ## ビルド＋煙テスト（検証一式）

clean: ## ビルド成果物を削除
	rm -rf dist
