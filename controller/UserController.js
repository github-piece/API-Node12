exports.getUser = async function(req, res) {
    try {
        method = req.body.action
        if (method != undefined) {
            switch(method) {
                case 'login':
                    if (req.body.uEmail.trim() == '' || req.body.uPassword.trim() == '') {
                        res.status(200).send()
                    }
                    userData = await loginUser(req.body.uEmail, req.body.uPassword);
                    res.status(200).send(userData)
                    break;
                default:
            }
        } else {
            res.status(200).send()
        }
    } catch (error) {
        res.status(200).send()
    }
}

exports.registerUser = async function(req, res) {
    if (req.body.u_name.trim() == '' || req.body.u_email.trim() == '' || req.body.u_password.trim() == '' || req.body.u_phonenum.trim() == '') {
        res.status(400).send()
    }
    userName = mysql_real_escape_string(req.body.u_name.trim())
    userEmail = mysql_real_escape_string(req.body.u_email.trim())
    checkEmail = await checkDuplicateMail(userEmail);
    if(checkEmail > 0) {
        res.status(400).send()
    } else {
        userPass = mysql_real_escape_string(req.body.u_password.trim())
        userPhone = mysql_real_escape_string(req.body.u_phonenum.trim())
        date = Date.now()
        await mysql.execute(
                "INSERT INTO tbl_user (u_name, u_password, u_email, u_phonenum, u_accounttype)" +
                "VALUES (?, ?, ?, ?, 'Moderator')", [userName, userPass, userEmail, userPhone], (error, results) => {
                    if(error) res.status(400).send(error)
                }
            )
        res.status(200).send()
    }
}

exports.userFreezeFlag = async function(req, res) {
    try {
        result = await mysql.execute("SELECT * FROM tbl_user WHERE u_id = ? LIMIT 1", [req.body.userId])
        userData = result[0][0]
        res.status(200).send(userData)
    } catch {
        res.status(400).send()
    }
}

exports.freezeUser = async function(req, res) {
    try {
        selectedId = req.body.selectedId
        userstate = req.body.state
        switch(userstate){
            case "inactive":
                activeflag = 1;
            break;
            case "active":
                activeflag = 0;
            break;
        }
        await mysql.execute("UPDATE tbl_user SET u_freezedflag = ? WHERE u_id = ?", [activeflag, selectedId])
        res.status(200).send()
    } catch {
        res.status(400).send()
    }
}

exports.updateUser = async function(req, res) {
    try {
        selectedId = req.body.selectedId
        radioAccountType = req.body.radioAccountType
        await mysql.execute("UPDATE tbl_user SET u_accounttype = ? WHERE u_id = ?", [radioAccountType, selectedId])
        res.status(200).send()
    } catch {
        res.status(400).send()
    }
}

exports.getUserList = async function(req, res) {
    try {
        userData =  await getUserData(req.body.accountType, req.body.userId)
        res.status(200).send(userData)
    } catch {
        res.status(400).send()
    }
}

exports.getScoutProfile = async function(req, res) {
    try {
        scoutData = await mysql.execute("SELECT * FROM tbl_scout_profile WHERE userId = ?", [req.body.userId])
        businessData = await mysql.execute("SELECT `business_id`, `business name`, `date completed`, `address`, `country` FROM tbl_business WHERE u_id <>?", [req.body.userId])
        res.status(200).send({scoutData: scoutData[0], businessData: businessData[0]})
    } catch {
        res.status(400).send()
    }
}

exports.uploadPhoto = async function(req, res) {
    try {
        await mysql.execute("UPDATE tbl_user SET u_avatar = ? WHERE u_id = ?", [req.file.filename, req.body.userId])
        userData = await loginUser(req.body.userEmail, req.body.userPassword)
        res.status(200).send(userData)
    } catch {
        res.status(400).send()
    }
}

exports.changePwd = async function(req, res) {
    try {
        if(req.body.accountType.trim() == '') {
            res.status(400).send()
        } else {
            confirmPassword = mysql_real_escape_string(req.body.confirmPassword)
            try {
                await mysql.execute("UPDATE tbl_user SET u_password = ? WHERE u_id = ?", [confirmPassword, req.body.userId])
                userAllData = await getUserData(req.body.accountType, req.body.userId);
                userData = await loginUser(req.body.userEmail, req.body.confirmPassword)
                res.status(200).send({userData: userData, userAllData: userAllData})
            } catch {
                res.status(400).send()
            }
        }
    } catch {
        res.status(400).send()
    }
}

exports.createUser = async function(req, res) {
    try {
        userName = mysql_real_escape_string(req.body.name)
        userEmail = mysql_real_escape_string(req.body.email)
        if (await checkDuplicateMail(userEmail) != 0) {
            res.status(400).send()
        }
		userPwd = mysql_real_escape_string(req.body.password)
		radioAccounttype = 'User'
        parentId = mysql_real_escape_string(req.body.adminId)
        await mysql.execute("INSERT INTO tbl_user (u_name, u_password, u_email, u_accounttype, u_parentid, u_avatar) VALUES (?, ?, ?, 'User', ?, ?)", [userName, userPwd, userEmail, parentId, req.file.filename], (error, results) => {
                if(error) res.status(400).send(error)
            })
        res.status(200).send()
    } catch {
        res.status(400).send()
    }
}

async function getUserData(userType, userId) {
    if(userType.trim() === '') {
        res.status(400).send()
    } else {
        accountType = mysql_real_escape_string(userType.trim())
        switch(accountType) {
            case "Super Admin":
				result = await mysql.execute("SELECT * FROM tbl_user WHERE u_accounttype NOT LIKE '%Super%'")
				break;
			case "Senior Admin":
				result = await mysql.execute("SELECT * FROM tbl_user WHERE u_accounttype NOT LIKE '%Senior%' AND u_accounttype NOT LIKE '%Super%'")
				break;
			case "Junior Admin":
				result = await mysql.execute("SELECT * FROM tbl_user WHERE u_accounttype LIKE '%Moderator%' OR u_parentid = ?", [userId])
				break;
			case "Moderator":
				result = await mysql.execute("SELECT * FROM tbl_user WHERE u_parentid = ?", [userId])
				break;
			case "User":
				result = await mysql.execute("SELECT * FROM tbl_user WHERE u_id = -1")
                break;
        }
        userDataList = result[0]
        count = 0
        getUser = new Array()
        for await (let userData of userDataList) {
            if (userData['u_freezedflag'] == 0) {
                active = "Active";
            } else {
                active = "InActive";
            }
            getUser.push({
                u_id : userData['u_id'],
                u_name : userData['u_name'],
                u_email : userData['u_email'],
                u_createddate : userData['u_createddate'],
                no : count++,
                u_freezedflag : userData['u_freezedflag'],
                u_accounttype : userData['u_accounttype'],
                password : userData['u_password'],
                u_avatar : userData['u_avatar'],
                u_active : active
            })
        }
        return getUser
    }
}

async function loginUser(email, password) {
    uEmail = mysql_real_escape_string(email.trim())
    uPassword = mysql_real_escape_string(password.trim())
    result = await mysql.execute("SELECT * FROM tbl_user WHERE u_email = ? And u_password = ?", [uEmail, uPassword]);
    userData = result[0][0];
    userInfo = {
        status: 1,
        userId: userData.u_id,
        userparentid: userData.u_parentid,
        username: userData.u_name,
        useremail: userData.u_email,
        userfreezedflag: userData.u_freezedflag,
        userpassword: userData.u_password,
        usercreateddate: userData.u_createddate,
        useraccounttype: userData.u_accounttype,
        userphonenum: userData.u_phonenum,
        useravatar: userData.u_avatar
    }
    return userInfo;
}

async function checkDuplicateMail(userEmail) {
    checkedState = 0
    result = await mysql.execute("SELECT u_id FROM `tbl_user` WHERE `u_email` = ?", [userEmail]);
    return result[0].length;
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