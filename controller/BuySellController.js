exports.getBusinessList = async function(req, res) {
    try {
        const userId = req.body.userId;
        if (userId == undefined) {
            res.status(400).send();
        }
        result = await mysql.execute("SELECT tbl_business.*, tbl_user.u_email, tbl_user.u_avatar, tbl_user.u_name FROM tbl_business LEFT JOIN tbl_user ON tbl_business.u_id = tbl_user.u_id")
        businessData  = new Array()
        for await (data of result[0]) {
            var rowValue = {};
            rowValue.id = data.id;
            rowValue.u_id = data.u_id;
            rowValue.u_email = data['u_email'];
            rowValue.business = data['sector'];
            rowValue.tenure = data['tenure to see return'];
            rowValue.goal = data['goal name'];
            rowValue.name = data['business name'];
            rowValue.country = data['country'];
            rowValue.address = data['address'];
            rowValue.business_id = data['business_id'];
            rowValue.pic = data['image for front page'];
            rowValue.userName = data['u_name'];
            rowValue.avatar = data['u_avatar'];
            rowValue.amount = data['how much they\'re raising'];
            rowValue.lat = data['lat'];
            rowValue.lng = data['lng'];
            businessData.push(rowValue);
        }
        result = await mysql.execute("SELECT tbl_history.*, tbl_user.u_name, tbl_user.u_email FROM tbl_history LEFT JOIN tbl_user ON tbl_history.u_id = tbl_user.u_id WHERE tbl_history.u_id = ?", [req.body.userId])
        historyBuyList = new Array()
        for await (data of result[0]) {
            rowValue = {}
            rowValue['u_id'] = data['u_id']
            rowValue['u_email'] = data['u_email']
            rowValue['business_id'] = data['business_id']
            rowValue['amount'] = data['amount']
            rowValue['fundtype'] = data['fundtype']
            rowValue['rate'] = data['rate']
            rowValue['frequency'] = data['frequency']
            rowValue['type'] = data['type']
            rowValue['userName'] = data['u_name']
            rowValue['date_created'] = data['date_created']
            historyBuyList.push(rowValue)
        }
        sql = await mysql.execute("SELECT tbl_business.*, tbl_history.*, tbl_user.u_name FROM tbl_history LEFT JOIN tbl_business ON tbl_history.business_id = tbl_business.business_id LEFT JOIN tbl_user ON tbl_history.u_id = tbl_user.u_id WHERE tbl_business.u_id = ?", [req.body.userId])
        historySellList = new Array()
        for await (data of sql[0]) {
            rowValue = {}
            rowValue['date_created'] = data['date_created']
            rowValue['business_id'] = data['business_id']
            rowValue['userName'] = data['u_name']
            rowValue['amount'] = data['amount']
            rowValue['fundtype'] = data['fundtype']
            rowValue['rate'] = data['rate']
            rowValue['frequency'] = data['frequency']
            rowValue['businessName'] = data['business name']
            historySellList.push(rowValue)
        }
        res.status(200).send({businessData: businessData, historySellList: historySellList, historyBuyList: historyBuyList});
    } catch (error) {
        res.status(400).send()
    }
}

exports.setBuyHistory = async function(req, res) {
    try {
        await mysql.execute("INSERT `tbl_history` (u_id, business_id, amount, fundtype, rate, frequency) VALUES (?, ?, ?, ?, ?, ?)", [req.body.userId, req.body.businessId, req.body.amount, req.body.fund, req.body.rate, req.body.frequency])
        res.status(200).send()
    } catch {
        res.status(400).send()
    }
}

exports.getBuyHistory = async function(req, res) {
    try {
        result = await mysql.execute("SELECT tbl_history.*, tbl_user.u_name, tbl_user.u_email FROM tbl_history LEFT JOIN tbl_user ON tbl_history.u_id = tbl_user.u_id WHERE tbl_history.u_id = ?", [req.body.userId])
        historyBuyList = new Array()
        for await (data of result[0]) {
            rowValue = {}
            rowValue['u_id'] = data['u_id']
            rowValue['u_email'] = data['u_email']
            rowValue['business_id'] = data['business_id']
            rowValue['amount'] = data['amount']
            rowValue['fundtype'] = data['fundtype']
            rowValue['rate'] = data['rate']
            rowValue['frequency'] = data['frequency']
            rowValue['type'] = data['type']
            rowValue['userName'] = data['u_name']
            rowValue['date_created'] = data['date_created']
            historyBuyList.push(rowValue)
        }
        res.status(200).send(historyBuyList)
    } catch {
        res.status(400).send()
    }
}