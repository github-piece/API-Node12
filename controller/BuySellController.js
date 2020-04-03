exports.getBuyHistory = async function(req, res) {
    try {
        result = await mysql.execute("SELECT tbl_history.*, tbl_user.u_name, tbl_user.u_email FROM tbl_history LEFT JOIN tbl_user ON tbl_history.u_id = tbl_user.u_id WHERE tbl_history.u_id = ?", [req.body.userId])
        buyData = new Array()
        for (i = 0; i < result[0].length; i++) {
            data = {}
            data['u_id'] = result[0][i]['u_id']
            data['u_email'] = result[0][i]['u_email']
            data['business_id'] = result[0][i]['business_id']
            data['amount'] = result[0][i]['amount']
            data['fundtype'] = result[0][i]['fundtype']
            data['rate'] = result[0][i]['rate']
            data['frequency'] = result[0][i]['frequency']
            data['type'] = result[0][i]['type']
            data['userName'] = result[0][i]['u_name']
            data['date_created'] = result[0][i]['date_created']
            buyData.push(data)
        }
        res.status(200).send(buyData)
    } catch {
        res.status(400).send()
    }
}

exports.getSellHistory = async function(req, res) {
    try {
        result = await mysql.execute("SELECT tbl_business.*, tbl_history.*, tbl_user.u_name FROM tbl_history LEFT JOIN tbl_business ON tbl_history.business_id = tbl_business.business_id LEFT JOIN tbl_user ON tbl_history.u_id = tbl_user.u_id WHERE tbl_business.u_id = ?", [req.body.userId])
        sellData = new Array()
        for (i = 0; i < result[0].length; i++) {
            data = {}
            data['date_created'] = result[0][i]['date_created']
            data['business_id'] = result[0][i]['business_id']
            data['userName'] = result[0][i]['u_name']
            data['amount'] = result[0][i]['amount']
            data['fundtype'] = result[0][i]['fundtype']
            data['rate'] = result[0][i]['rate']
            data['frequency'] = result[0][i]['frequency']
            data['businessName'] = result[0][i]['business name']
            sellData.push(data)
        }
        res.status(200).send(sellData)
    } catch {
        res.status(400).send()
    }
}