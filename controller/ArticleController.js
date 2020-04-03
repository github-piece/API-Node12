exports.getArticle = async function(req, res) {
    try {
        articleData = await getArticle()
        res.status(200).send(articleData)
    } catch {
        res.status(200).send()
    }
}

exports.getArticleList = async function(req, res) {
    userAccountType = req.body.userAccountType
    userId = req.body.userId
    userParentId = req.body.userParentId
    articleData = await getArticleList(userAccountType, userId, userParentId)
    res.status(200).send(articleData)
}

exports.setArticle = async function(req, res) {
    try {
        fileName1 = req.files[0].filename
        fileName2 = req.files[1].filename
        await mysql.execute("INSERT INTO tbl_article (section1, section2, headline, account_type, article_uid, imgurl1, imgurl2) VALUES(?, ?, ?, ?, ?, ?, ?)", [req.body.section1, req.body.section2, req.body.headline, req.body.accountType, req.body.userId, fileName1, fileName2])
        articleData = await getArticle()
        res.status(200).send(articleData)
    } catch (error) {
        res.status(400).send()
    }
}

exports.updateArticle = async function(req, res) {
    try {
        await mysql.execute("UPDATE tbl_article SET section1 = ?, section2 = ?, headline = ?, article_uparentid = ? WHERE id = ?", [req.body.section1, req.body.section2, req.body.headline, req.body.userId, req.body.id])
        onFile = JSON.parse(req.body.onFile)
        if(onFile[0] == true) {
            await mysql.execute("UPDATE tbl_article SET imgurl1 = ? WHERE id = ?", [req.files[0].filename, req.body.id])
        }
        if(onFile[1] == true) {
            if(onFile[0] == true) {
                await mysql.execute("UPDATE tbl_article SET imgurl2 = ? WHERE id = ?", [req.files[1].filename, req.body.id])
            } else {
                await mysql.execute("UPDATE tbl_article SET imgurl2 = ? WHERE id = ?", [req.files[0].filename, req.body.id])
            }
        }
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
}

exports.deleteArticle = async function(req, res) {
    try {
        fs = require('fs')
        result = await mysql.execute("SELECT imgurl1, imgurl2 FROM tbl_article WHERE id = ?", [req.body.articleId])
        fs.unlinkSync('./public/article/' + result[0][0].imgurl1)
        fs.unlinkSync('./public/article/' + result[0][0].imgurl2)
        await mysql.execute("DELETE FROM tbl_article WHERE id = ?", [req.body.articleId])
        res.status(200).send()
    } catch (error) {
        res.status(400).send()
    }
}

async function getArticle() {
    dateFormat = require('dateformat')
    articleData = new Array();
    result = await mysql.execute("SELECT tbl_article.*, tbl_user.* FROM tbl_article LEFT JOIN tbl_user on tbl_article.article_uid = tbl_user.u_id");
    for await (let data of result[0]) {
        articleData.push({
            section1 : data['section1'],
            section2 : data['section2'],
            account_type : data['account_type'],
            article_uid : data['article_uid'],
            article_date : dateFormat(data['article_createdate'], "mmmm dS, yyyy"),
            imgurl1 : data['imgurl1'],
            imgurl2 : data['imgurl2'],
            headline : data['headline'],
            u_name : data['u_name'],
            u_avatar : data['u_avatar']
        })
    }
    return articleData
}

async function getArticleList(type, userId, userParentId) {
    count = 0
    articleData = new Array()
    result = await getResult(type, userId, userParentId)
    for await (const data of result) {
        articleData.push({
            id : data['id'],
            section1 : data['section1'],
            section2 : data['section2'],
            account_type : data['account_type'],
            no : count++,
            article_uid : data['article_uid'],
            article_createdate : data['article_createdate'],
            imgurl : data['imgurl'],
            imgurl1 : data['imgurl1'],
            imgurl2 : data['imgurl2'],
            headline : data['headline'],
            u_name : data['u_name'],
            u_accounttype : data['u_accounttype']
        })
    }
    return articleData
}

async function getResult(type, userId, userParentId) {
    switch(type){
        case "Super Admin":
            result = await mysql.execute("SELECT tbl_article.*, tbl_user.* FROM tbl_article LEFT JOIN tbl_user on tbl_article.article_uid = tbl_user.u_id");
            break
        case "Senior Admin":
            result = await mysql.execute("SELECT tbl_article.*, tbl_user.* FROM tbl_article LEFT JOIN tbl_user on tbl_article.article_uid = tbl_user.u_id WHERE account_type NOT LIKE '%Super%'");
            break
        case "Junior Admin":
            result = await mysql.execute("SELECT tbl_article.*, tbl_user.* FROM tbl_article LEFT JOIN tbl_user on tbl_article.article_uid = tbl_user.u_id WHERE account_type LIKE '%Moderator%' OR  article_uid = ? OR article_uparentid = ?", [userId, userParentId])
            break
        case "Moderator":
            result = await mysql.execute("SELECT tbl_article.*, tbl_user.* FROM tbl_article LEFT JOIN tbl_user on tbl_article.article_uid = tbl_user.u_id WHERE article_uid = ? OR article_uparentid = ?", [userId, userParentId]);
            break
        case "User":
            result = await mysql.execute("SELECT tbl_article.*, tbl_user.* FROM tbl_article LEFT JOIN tbl_user on tbl_article.article_uid = tbl_user.u_id WHERE article_uid = ?", [userId]);
            break
    } 
    return result[0]
}

function mysql_real_escape_string (str) {
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
        switch (char) {
            case "\0":
                return "\\0";
            case "\x08":
                return "\\b";
            case "\x09":
                return "\\t";
            case "\x1a":
                return "\\z";
            case "\n":
                return "\\n";
            case "\r":
                return "\\r";
            case "\"":
            case "'":
            case "\\":
            case "%":
                return "\\"+char; 
            default:
                return char;
        }
    });
}