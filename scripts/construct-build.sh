# this is really just for netlify to run
yarn
jq '.USE_LOCAL = false' src/constants/config.json > tmp.$$.json && mv tmp.$$.json src/constants/config.json
yarn build
mv dist/* ./