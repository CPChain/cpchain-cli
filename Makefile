
.PHONY: build

all: publish

build:
	@npm run build
	@node scripts/cp-package.js

publish: build
	@cd dist && npm publish --access public
