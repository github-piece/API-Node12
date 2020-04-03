exports.getAnswer = function(req, res) {
    try {
        var excelAnswers = req.body.excelAnswers
        var userId = req.body.userId
        var time = req.body.time
        if (excelAnswers == undefined || userId == undefined || time == undefined) res.status(400).send({error})
        var md5 = require('md5')
        var businessId = md5(excelAnswers[0]['answer1'] + time)
        excelAnswers.forEach(async answer => {
            var header = 'u_id, profile, id_business_quiz, col_0_header'
            var value = "'"+userId+"', 'business_profile', '"+answer['no']+"', '"+answer['answer0']+"'"
            for (var i = 1; i < 8; i++) {
                if (answer['answer' + i] != undefined) {
                    header = header + ', col_' + i + '_header'
                    value = value + ", '"+answer['answer' + i]+"'"
                }
            }
            header = header + ', business_id'
            value = value + ", '" + businessId + "'"
            var sql = "INSERT INTO tbl_business_answer (" + header + ") VALUES (" + value + ")"
            await mysql.execute(sql)
        });
        res.status(200).send({businessId})
    } catch (error) {
        res.status(400).send({error})
    }
}