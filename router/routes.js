const express = require('express');
const router = express.Router();
const DashboardController = require('../controller/DashboardController');
const CatalogueController = require('../controller/CatalogueController');
const QuizController = require('../controller/QuizController');
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

const articleStorage = multer.diskStorage({
    destination: './public/article/',
    filename: function (req, file, cb) {
        const path = require('path')
        ext = path.extname(file.originalname)
        cb(null, file.originalname + '-' + Date.now() + ext)
    }
})

const businessStorage = multer.diskStorage({
    destination: './public/business/',
    filename: function (req, file, cb) {
        const path = require('path')
        ext = path.extname(file.originalname)
        cb(null, file.originalname + '-' + Date.now() + ext)
    }
})

const article = multer({storage: articleStorage})
const avatar = multer({storage: avatarStorage})
const business = multer({storage: businessStorage})
const data = multer()

router.post('/getBusiness', DashboardController.getBusiness);

router.post('/getCategory', CatalogueController.getCategory);
router.post('/getTabData', CatalogueController.getTabData);

router.post('/setExcelAnswer', QuizController.setExcelAnswer);
router.post('/getBusinessQuiz', QuizController.getBusinessQuiz);
router.post('/getScoutQuiz', QuizController.getScoutQuiz);
router.post('/setBusinessAnswer', business.array('file'), QuizController.setBusinessAnswer);

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
router.post('/setArticle', article.array('file'), ArticleController.setArticle);
router.post('/updateArticle', article.array('file'), ArticleController.updateArticle);

router.post('/getBuyHistory', BuySellController.getBuyHistory);
router.post('/setBuyHistory', data.array(), BuySellController.setBuyHistory);
router.post('/getSellHistory', BuySellController.getSellHistory);

router.post('/getMessage', MessageController.getMessage);
router.post('/setMessage', MessageController.setMessage);
router.post('/setAllMessage', MessageController.setAllMessage);

router.post('/generateSignature', data.array(), PayfastController.generateSignature);

module.exports = router;