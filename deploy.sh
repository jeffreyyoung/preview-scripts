sh build.sh
git add -A
git commit -m "Deploy"
sh print-urls.sh > urls.txt
git add -A
git commit -m "Update urls"
git push