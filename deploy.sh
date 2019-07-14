#! /bin/bash

npm run build
git add -A
git commit -m "[build] Autocommit gh-page dist content"
git subtree push --prefix dist origin gh-pages