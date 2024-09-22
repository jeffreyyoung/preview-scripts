sh ./build.sh
git add -A
git commit -m "Deploy"
sh build.sh
sh print-urls.sh > urls.txt
git add -A
git commit -m "Deploy"
git push