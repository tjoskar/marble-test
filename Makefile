publish:
	rm -rf dist
	npm run build
	cp .npmignore package.json package-lock.json dist
	rm -r dist/__tests__
	cd dist && npm pack
