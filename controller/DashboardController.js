
exports.getBusiness = function(req, res) {
    try {
        const userId = req.body.userId;
        if (userId == undefined) {
            res.status(400).send({error});
        }
        mysql.query("SELECT tbl_business.*, tbl_user.u_email, tbl_user.u_avatar, tbl_user.u_name FROM tbl_business LEFT JOIN tbl_user ON tbl_business.u_id = tbl_user.u_id", function (err, rows, fields) {
            if (err) throw err;
            const returnValue  = new Array();
            for (var i = 0; i < rows.length; i++) {
                var rowValue = {};
                rowValue.id = rows[i].id;
                rowValue.no = i + 1;
                rowValue.u_id = rows[i].u_id;
                rowValue.u_email = rows[i]['u_email'];
                rowValue.business = rows[i]['sector'];
                rowValue.tenure = rows[i]['tenure to see return'];
                rowValue.goal = rows[i]['goal name'];
                rowValue.name = rows[i]['business name'];
                rowValue.country = rows[i]['country'];
                rowValue.address = rows[i]['address'];
                rowValue.business_id = rows[i]['business_id'];
                rowValue.pic = rows[i]['image for front page'];
                rowValue.userName = rows[i]['u_name'];
                rowValue.avatar = rows[i]['u_avatar'];
                rowValue.amount = rows[i]['how much they\'re raising'];
                rowValue.lat = rows[i]['lat'];
                rowValue.lng = rows[i]['lng'];
                returnValue.push(rowValue);
            }
            res.status(200).send(returnValue);
        });
    } catch (error) {
        res.status(400).send({error})
    }
}