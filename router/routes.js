const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/DashboardController');
const CatalogueController = require('../controller/CatalogueController');
const ExcelController = require('../controller/ExcelController');
const UserController = require('../controller/UserController');
const ArticleController = require('../controller/ArticleController');
const BuySellController = require('../controller/BuySellController');
const MessageController = require('../controller/MessageController');
const PayfastController = require('../controller/PayfastController');
const multer = require('multer')

const avatarStorage = multer.diskStorage({
    destination: './public/avatar/',
    filename: function (req, file, cb) {
        const path = require('path')
        ext = path.extname(file.originalname)
        cb(null, file.originalname + '-' + Date.now() + ext)
    }
})

const araticleStorage = multer.diskStorage({
    destination: './public/article/',
    filename: function (req, file, cb) {
        const path = require('path')
        ext = path.extname(file.originalname)
        cb(null, file.originalname + '-' + Date.now() + ext)
    }
})
const araticle = multer({storage: araticleStorage})
const avatar = multer({storage: avatarStorage})
const data = multer()

router.post('/business', DashboardController.business);
router.post('/getGeometry', DashboardController.getGeometry);

router.post('/getCategory', CatalogueController.getCategory);
router.post('/getTabData', CatalogueController.getTabData);

router.post('/getAnswer', ExcelController.getAnswer);

router.post('/getUser', UserController.getUser);
router.post('/registerUser', UserController.registerUser);
router.post('/userFreezeFlag', UserController.userFreezeFlag);
router.post('/getUserList', UserController.getUserList);
router.post('/uploadPhoto', avatar.single('file'), UserController.uploadPhoto);
router.post('/changePwd', UserController.changePwd);
router.post('/createUser', avatar.single('file'), UserController.createUser);
router.post('/freezeUser', UserController.freezeUser);
router.post('/updateUser', UserController.updateUser);

router.post('/getArticle', ArticleController.getArticle);
router.post('/deleteArticle', ArticleController.deleteArticle);
router.post('/getArticleList', data.array(), ArticleController.getArticleList);
router.post('/setArticle', araticle.array('file'), ArticleController.setArticle);
router.post('/updateArticle', araticle.array('file'), ArticleController.updateArticle);

router.post('/getBuyHistory', BuySellController.getBuyHistory);
router.post('/setBuyHistory', data.array(), BuySellController.setBuyHistory);
router.post('/getSellHistory', BuySellController.getSellHistory);

router.post('/getMessage', MessageController.getMessage);
router.post('/setMessage', MessageController.setMessage);
router.post('/setAllMessage', MessageController.setAllMessage);

router.post('/generateSignature', data.array(), PayfastController.generateSignature);

module.exports = router;