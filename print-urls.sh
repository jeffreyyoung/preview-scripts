commit_hash=$(git rev-parse HEAD)

for file in dist/*; do
  fileName=$(basename $file)
  echo "$fileName - https://cdn.jsdelivr.net/gh/jeffreyyoung/preview-scripts@${commit_hash}/$file"
done
