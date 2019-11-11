// 這裡我們要嘗試把 image 轉為 PDF 等OCR 作法。

const express = require('express')
const fs = require('fs')
const multer = require('multer')
// const tesseractjs  = require('tesseract.js') // 關於 tesseract.js 為 OCR 
const { TesseractWorker } = require('tesseract.js')

// 這裡我們要下載第二版的 tesseract.js
// 詳見官網 : https://tesseract.projectnaptha.com/
// https://github.com/naptha/tesseract.js#tesseractjs

const app = express()
const worker = new TesseractWorker()
//  we need save and get files

// multer is a middleWare to handle multipart/form-data
// is primary for upload files and download files

// 關於 multer 是一個處理檔案上傳或下載的中繼處理
// 關於 dest 是destination的簡寫
// + --------------------------------------------------------
// 這個是要存檔的工作，目的是希望檔案存放在哪個資料夾用。
// the folder to witch file has been saved in


// + --------------------------------------------------------
// disk storage engine give full control on storing files to disk
// 首先我們要利用 multer 進行存檔。

// + --------------------------------------------------------

// PS multer.diskStorage() S 要大寫才可以。
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        // 這個由物件本身就可以看出來了。
        cb(null, file.originalname)
    }
})

// 這個動作就是上傳檔案的動作。!
// 這個動作僅會執行一個上傳。
const upload = multer({
    storage: storage
}).single('avatar')

// 接下來要配合 ejs 作一些上船的動作。

// 開始載入 ejs 的引擎開始

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/upload', (req, res) => {
    console.log('hey!!OKOK');
    // 這裡要進行上傳。!
    upload(req, res, (err) => {
        if (!err) {
            // 這時候可以用到 fs 了
            fs.readFile(`./uploads/${req.file.originalname}`,(fserr,data) =>{
                if (fserr) {
                    console.log(`有錯誤${fserr}`);
                    return
                }
                // 目前先設定 eng 有其他有趣的版本。
                worker.recognize(data,'eng',{
                    tessjs_create_pdf:'1'
                }).progress((progress) =>{
                    console.log(progress);
                }).then(result =>{
                    // OCR 後的字串
                    // res.send(result.text) 先不用這個
                    res.redirect('/download')
                    // 接下來要在這裡進行 download 的動作。

                }).finally(_ =>{
                    worker.terminate()
                    // res.redirect('/')
                    // OK 到這邊就算完成了!
                    // 沒有說非常準! 但幹的還不錯!
                    // 接下來嘗試下載的動作。
                })
            })
        }
    })
})

app.get('/download',(req,res) =>{
    const filepath = `${__dirname}/tesseract.js-ocr-result.pdf`
    res.download(filepath)
    // 固定路徑會交到那
    // 這樣就可以完成下載的動作了!
})

// OK ! 基本的檔案上傳完成了 
// 載來要做 OCR 
// at first，read file and transfer to pdf

// 因為 multer 會偵測到 single('avater') 的部分。
// 所以接下來可以嘗試 listen 了

// 這個完成後要把他轉乘 pdf 並且進行下載
// 通常 pdf 網頁都可以接受，所以考慮把 OCR 的部分變為 html 並且下載

const port = process.env.PORT || 3000

app.listen(port, () => {
    const url = 'http://localhost:3000/'
    console.log(`listen on : ${url}`);
})


// + 20190926 更新 ----------------------------------------
// * 接下來要做一個 static 的位置。
// + --------------------------------------------------------


// + --------------------------------------------------------
// example
// const app = express()

// app.get('/',(req,res) =>{
//     res.send('OKOK')
// })

// const port = process.env.PORT || 3000
// app.listen(port)

// console.log(`listen on : http://localhost:3000`);

// + --------------------------------------------------------

// 關於 fs 的功用。是用來讀檔和存檔用的。!~
// 要了解一下 fs 的功用。

// 關於 path 的部分!
// + --------------------------------------------------------
// const path = require('path')

// resolve 的意思為把 路徑轉為絕對路徑。
// path.resolve()
// + --------------------------------------------------------

// tesseract.js


worker.recognize(data,'eng',{
    tessjs_create_pdf:'1'
}).progress((progress) =>{
    console.log(progress);
    // 下載進度。
}).then(result =>{
    res.redirect('/download')
}).finally(_ =>{
    worker.terminate()
})