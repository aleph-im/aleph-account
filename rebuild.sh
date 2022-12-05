rm -fr node_modules
rm -f yarn.lock
rm -f package-lock.json
rm -f yarn-error.log
docker run --rm -ti -v $(pwd):/mnt -w /mnt -p 8080:8080 node:16 npm install --save "https://github.com/hoh/aleph-sdk-ts.git#hoh-update-dependencies"
docker run --rm -ti -v $(pwd):/mnt -w /mnt -p 8080:8080 node:16 bash
