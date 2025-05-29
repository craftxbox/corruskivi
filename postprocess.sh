#!/bin/bash

mv dist/index.html dist/corruskivi/index.html
cp dist/corruskivi/index.html dist/corruskivi/preview.html

sed -i -e "s|<!--REPLACEME__META_DESCRIPTION-->|<meta property=\"og:description\" content=\"ATTENTION::'unauthorized memory stream editor';'report to mindsci immediately';\" /><meta property=\"twitter:description\" content=\"ATTENTION::'unauthorized memory stream editor';'report to mindsci immediately';\" /><meta name=\"theme-color\" content=\"#fcfc00\" /><meta property=\"og:image\" content=\"https://transfur.science/ierph1r\" /><meta property=\"twitter:image\" content=\"https://transfur.science/ierph1r\" />|gi" dist/corruskivi/index.html
sed -i -e "s|<!--REPLACEME__META_DESCRIPTION-->|<meta property=\"og:description\" content=\"NOTICE::'memory stream located';'potential data manipulation';\" /><meta property=\"twitter:description\" content=\"NOTICE::'memory stream located';'potential data manipulation';\" /><meta name=\"theme-color\" content=\"#00fcfc\" /><meta property=\"og:image\" content=\"https://crxb.cc/h5rghobp.png\" /><meta property=\"twitter:image\" content=\"https://crxb.cc/h5rghobp.png\" />|gi" dist/corruskivi/preview.html