import axios from 'axios';
import { writeFile, mkdir } from 'node:fs/promises';
import * as cheerio from 'cheerio';
// import * as fs from 'fs/promises';
import * as fs from 'fs';

const baseURL = 'https://ru.hexlet.io/courses';
const testPath = '/home/mikemoreen/fullstack-javascript-project-lvl3';

const generateFilename = (url, format) => {
  /*
      url: https://ru.hexlet.io/courses ---> ru-hexlet-io-courses.html
      url: https://ru.hexlet.io/courses ---> ru-hexlet-io-courses_files
      ссылка ---> имя файла или директории

  */
  const urlObj = new URL(url);
  const correctPathname = urlObj.pathname === '/' ? '' : urlObj.pathname;
  const filename = `${urlObj.hostname}${correctPathname}`
    .split('')
    .map((el) => {
      if (el === '/' || el === '.') return '-';
      return el;
    })
    .join('');

  if (format === 'html') return `${filename}.html`;
  if (format === 'directory') return `${filename}_files`;

  // return filename
};

// const extractDomain = (url) => {
//     return url.replace('https://', '')
//         .split('')
//         .filter((el) => {
//             if (el === '/' || el === '.') return '-';
//             return el;
//             })
//         .join('')
// }

const generateTagUrlName = (url) => {
  /* Input: href="https://cdn2.hexlet.io/assets/menu.css"  ---> Output: href="https://cdn2.hexlet.io/assets/menu.css"
                      href="/assets/application.css"                 ---> Output: href="ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css"
                      href="/courses                                 ---> Output: href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html"
                      href="/courses                                 ---> Output: href="ru-hexlet-io-courses_files/ru-hexlet-io-courses.html"
                      src="https://ru.hexlet.io/packs/js/runtime.js" ---> Output: src="ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js"

              img:    src="/assets/professions/nodejs.png"           src="ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png"

  */

  const urlObj = new URL(url);

  const correctHostname = urlObj.hostname
    .split('')
    .map((el) => {
      if (el === '.') return '-';
      return el;
    })
    .join('');

  const correctPathname = urlObj.pathname
    .split('')
    .map((el) => {
      if (el === '/') return '-';
      return el;
    })
    .join('');

  const filename = `${correctHostname}${correctPathname}`;

  return filename;
};

const fetchData = (url) => axios.get(url)
  .then((response) => response.data);

// input ---> page-loader -o /home/mikemoreen/fullstack-javascript-project-lvl3 https://ru.hexlet.io/courses  все работает
// input ---> page-loader -o ./test-dir https://ru.hexlet.io/courses  все работает если путь существует
// input ---> page-loader -o ../test1-dir https://ru.hexlet.io/courses все работает если путь существует
// input ---> page-loader https://ru.hexlet.io/courses ?
// input ---> page-loader -o https://ru.hexlet.io/courses ?

const generateFullPath = (path, filename) => `${path}/${filename}`;

const app = (path, url) => {
  const fileName = generateFilename(url, 'html');
  console.log('filename', fileName);
  const filePath = generateFullPath(path, fileName);
  console.log('fullPath', filePath);
  const directoryName = generateFilename(url, 'directory');
  console.log('directoryName', directoryName);
  const directoryPath = generateFullPath(path, directoryName);
  console.log('directoryPath', directoryPath);
  let html;

  fetchData(url)
    .then((data) => {
      html = data;
      mkdir(directoryPath, { recursive: true });
    })
    .then(() => {
      const $ = cheerio.load(html);
      const imgTags = $('img');
      // const linkTags = $('link');
      // const scriptTags = $('script');

      imgTags.each((idx, tag) => {
        const imgUrl = $(tag).attr('src');
        const urlObj = new URL(url);
        const { origin } = urlObj;
        let resultUrl = imgUrl;
        // console.log('domain' ,domain)
        // console.log('imgUrl' ,imgUrl)

        // console.log('origin' ,origin)

        if (imgUrl.startsWith('/')) {
          //  /board-games.png ---> url - origin + /board-games.png
          resultUrl = origin + imgUrl;
          console.log('resultUrl', resultUrl);
          axios({
            method: 'get',
            url: resultUrl,
            responseType: 'stream',
          })
            .then((response) => {
              const filename = generateTagUrlName(resultUrl);
              console.log('filename', filename);
              const resultPath = generateFullPath(directoryPath, filename);
              console.log('resultPath', resultPath);

              response.data.pipe(fs.createWriteStream(resultPath));

              $(tag).attr('src', resultPath);
            });
        }

        if (imgUrl.includes(origin)) {
          //  "https://ru.hexlet.io/packs/js/runtime.js"
          resultUrl = imgUrl;
        }

        // console.log(imgUrl);
        // Дописать: если imgUr непонятно куда делать запрос с изображениями
        // axios({
        //   method: 'get',
        //   url: imgUrl,
        //   responseType: 'stream',
        // })
        // .then((response) => {

        //   // const src = generateTagUrlPath(url, imgUrl)
        //   // const resultUrl = generateFullPath(path, src)
        //   // // const fullSrc = generateFullPath(path, src)

        //   // response.data.pipe(fs.createWriteStream(resultUrl))

        //   // $(tag).attr('src',src)

        // });
      });

      const resultPage = $('html').html();
      return resultPage;
    })
    .then((data) => {
      writeFile(filePath, html);
      console.log(data);
    });

  // let html;
  // fetchData(url)
  //   .then((data) => {
  //     writeFile(fullPath, data);
  //     return data;
  //   })
  //   .then((html) => {
  //     const directoryPath = generateDirectoryname(url);
  //     mkdir(directoryPath, { recursive: true })
  //       .then(() => {
  //         const $ = cheerio.load(html);
  //         const imgTags = $('img');
  //         imgTags.each((idx, tag) => {
  //           const imgUrl = $(tag).attr('src');
  //           axios({
  //             method: 'get',
  //             url: imgUrl,
  //             responseType: 'stream',
  //           })
  //             .then((response) => response.data.pipe(fs.createWriteStream(`${directoryPath}/ada_lovelace${idx}.svg`)));
  //         });
  //       });
  //   });

  // .then((data)=> writeFile(fullPath, data))
};

export default app;
