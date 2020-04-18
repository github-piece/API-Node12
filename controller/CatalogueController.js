exports.getCategory = async function(req, res) {
    try {
        userId = req.body.userId;
        if (userId == undefined) { res.status(400).send() }
        businessList = {
            mainBusiness: tbl_business,
            countryList: tbl_country_basic_information,
            businessUser: tbl_user,
            goalList: tbl_unsdg_database,
            business_length: tbl_business.length,
            unSdg: extraData.unSdg,
            interactions: extraData.interactions,
            stakeholders: stakeholders,
            commission: tbl_business_commission,
            instruments: tbl_instrument_types
        };
        res.status(200).send(businessList)
    } catch {
        res.status(400).send()
    }
}

exports.getTabData = async function(req, res) {
    if (req.body.userId == undefined) { res.status(400).send() }
    business = JSON.parse(req.body.business)
    extraData = await getData(business)
    if (req.body.tab == 'Sustainability') {
        businessList = {unSdg: extraData.unSdg, interactions: extraData.interactions, stakeholders: await getStakeholders(business)}
    } else {
        businessList = {unSdg: extraData.unSdg}
    }
    res.status(200).send(businessList)
}

exports.getCompareData = async function(req, res) {
    try {
        compareData = await mysql.execute("SELECT * FROM tbl_scout WHERE business_id = ? ORDER BY created_at DESC LIMIT 1", [req.body.businessId])
        res.status(200).send(compareData[0][0])
    } catch {
        res.status(400).send()
    }
}

async function getData(businessListData) {
    unSdg = new Array()
    for await (let business of businessListData) {
        count = 0
        goalNames = business['goal name'].split(',')
        goal_number = [];goal_description = [];path = [];
        for await (let data of tbl_unsdg_database) {
            for await (let goal of goalNames) {
                if (data.goal_name == goal) {
                    goal_number[count] = data.goal_number
                    goal_description[count] = data.short_description
                    path[count++] = data.path
                }
            }
        }
        unSdg.push({goal_number: goal_number, goal_description: goal_description, path: path})
    }
    var interactions = [];
    for (var i = 0; i < businessListData.length; i++) {
        var interaction = {};
        for (let j = 0; j < unSdg[i].goal_number.length; j++) {
            data = await getResult(unSdg[i].goal_number[j]);
            interaction[unSdg[i].goal_number[j]] = data;
        }
        interactions[i] = interaction;
    }
    return {unSdg: unSdg, interactions: interactions};
}

async function getResult(goal_number) {
    var result = await mysql.execute('SELECT `goal_main`, `goal_alternative_1`, `interaction_1`, `key_points`, `key_uncertainties`, `comprehensive_breakdown`, `illustrative_example_1`, `key_dimensions_1`, `key_dimensions_2`, `key_dimensions_3`, `key_dimensions_4` FROM `tbl_unsdg_goal_interactions` WHERE `goal_main` = ? OR `goal_alternative_1` = ?', [goal_number, goal_number]);
    return result[0];
}

async function getStakeholders(businessListData) {
    var stakeholders = new Array();
    stakeholders.push({country: await getStakeholderItem('Country', businessListData)})
    stakeholders.push({button3: await getStakeholderItem('Button 3', businessListData)})
    stakeholders.push({button4: await getStakeholderItem('Button 4', businessListData)})
    stakeholders.push({consideration: await getStakeholderItem('Considerations', businessListData)})
    stakeholders.push({maps: await getStakeholderMap(25, businessListData)})
    return stakeholders;
}

async function getStakeholderItem(key, businessListData) {
    var stakeholder = new Array();
    var stakeholders = new Array();
    var result = await mysql.execute("SELECT `description` FROM tbl_catalogue_summary WHERE tab = 'Sustainability Measures' AND sub_tab = 'Stakeholders' AND button_in_sub_tab = ?", [key])
    var key_info = result[0];
    result = await mysql.execute("SELECT `tbl_pull_request_1_source` FROM tbl_catalogue_summary WHERE tab = 'Sustainability Measures' AND sub_tab = 'Stakeholders' AND button_in_sub_tab = ?", [key])
    var tables = result[0];
    lastTable = '';
    try {
        for await (mainBusiness_item of businessListData) {
            index = 0
            for await (key_info_item of key_info) {
                var countryName = mainBusiness_item['country']
                var col = key_info_item['description']
                var table = tables[index++]['tbl_pull_request_1_source']
                if (table != lastTable) {
                    result = eval(table)
                    for await (content_item of content) {
                        if(content_item['country'] == countryName && content_item[col] != undefined) {
                            var result_col = {}
                            result_col[col] = content_item[col];
                            stakeholder.push(result_col);
                        }
                    }
                }
                lastTable = table;
            }
            stakeholders.push(stakeholder)
        }
    } catch { }
    return stakeholders
}

async function getStakeholderMap(id_business_quiz, businessListData) {
    var stakeholders_map = new Array()
    var stakeholders_maps = new Array()
        for await (business_item of businessListData) {
            var answer = await getAnswersByBusinessId(business_item['u_id'], business_item['business_id']);
            var answersById = await getAnswerById(answer, id_business_quiz)
            if (answersById[0] != undefined) {
                if (answersById[0]['col_0_header'] != null) {
                    var stakeholders = answersById[0]['col_0_header'].split(',')
                } else {
                    var stakeholders = null
                }
                if (answersById[0]['col_1_header'] != null) {
                    var rings = answersById[0]['col_1_header'].split(',')
                } else {
                    var rings = null
                }
                if (tbl_stakeholder_scoring != null) {
                    for (stakeholderRing of tbl_stakeholder_scoring) {
                        var stakeholder_map = new Array()
                        if (rings != null) {
                            for (var i = 0; i < rings.length; i++) {
                                if(stakeholderRing['ring'] == rings[i]) {
                                    stakeholder_map.push(stakeholders[i])
                                }
                            }
                        }
                        stakeholders_map[stakeholderRing['ring']] = stakeholder_map
                        stakeholders_maps[stakeholderRing['ring']] = stakeholder_map
                    }
                }
            }
        }
    return stakeholders_maps
}

async function getAnswersByBusinessId(userId, businessId) {
    var result = await mysql.execute('SELECT * FROM tbl_business_answer WHERE u_id= ? AND business_id = ?', [userId, businessId]);
    return result[0];
}

async function getAnswerById(answer, id_business_quiz) {
    var answersById = new Array();
    for (value of answer) {
        if(value['id_business_quiz'] == id_business_quiz) {
            answersById.push(value)
        }
    }
    return answersById;
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}
