exports.getMessage = async function(req, res) {
    try {
        if (req.body.userId == undefined) {
            res.status(400).send()
        }
        messageData = await getData(req.body.userId)
        res.status(200).send(messageData)
    } catch (error) {
        res.status(200).send()
    }
}

exports.setMessage = async function(req, res) {
    try {
        if (req.body.businessId == undefined || req.body.userId == undefined) {
            res.status(400).send()
        }
        await mysql.execute("UPDATE tbl_notification SET status = 1 WHERE id = ?", [req.body.businessId])
        messageData = await getData(req.body.userId)
        res.status(200).send(messageData)
    } catch (error) {
        res.status(200).send()
    }
}

exports.setAllMessage = async function(req, res) {
    try {
        if (req.body.userId == undefined) {
            res.status(400).send()
        }
        await mysql.execute("UPDATE tbl_notification SET status = 1 WHERE userId = ?", [req.body.userId])
        messageData = await getData(req.body.userId)
        res.status(200).send(messageData)
    } catch (error) {
        res.status(200).send()
    }
}

async function getData(userId) {
    result = await mysql.execute(
        "SELECT tbl_user.u_name, tbl_user.u_avatar, tbl_user.socialUser, tbl_business.*, tbl_notification.* " +
        "FROM tbl_notification " +
        "INNER JOIN tbl_user ON tbl_notification.userId = tbl_user.u_id " +
        "INNER JOIN tbl_business ON tbl_notification.businessId = tbl_business.business_id " +
        "WHERE tbl_notification.userId = ? AND tbl_notification.status = 0", [userId]
        )
    messages = result[0]
    messageData = new Array()
    dateFormat = require('dateformat')
    moment = require('moment')
    now = new Date()
    now = moment(now, "yyyy-m-dd HH:MM:ss")
    
    for await (message of messages) {
        last = moment(message.sended_at, "yyyy-m-dd HH:MM:ss")
        messageData.push({
            id: message.id,
            name: message.u_name,
            avatar: message.u_avatar,
            businessName: message['business name'],
            status: message.status,
            time: diffTime(last, now)
        })
    }
    return messageData;
}

function diffTime(start, end) {
    years = end.diff(start, 'years')
    months = end.diff(start, 'months')
    days = end.diff(start, 'days')
    hours = end.diff(start, 'hours')
    minutes = end.diff(start, 'minutes')
    seconds = end.diff(start, 'seconds')
    if (years > 0) {
        return years + ' years ago'
    } else if (months > 0) {
        return months + ' months ago'
    } else if (days > 0) {
        return days + ' days ago'
    } else if (hours > 0) {
        return hours + ' hours ago'
    } else if (minutes > 0) {
        return minutes + ' minutes ago'
    } else {
        return 'A few seconds ago'
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}