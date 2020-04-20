module.exports = async function() {
    global.mysql = require('./connection');
    result = await mysql.execute('SELECT * FROM tbl_country_basic_information');
    global.tbl_country_basic_information = result[0];

    result = await mysql.execute('SELECT * FROM tbl_unsdg_database');
    global.tbl_unsdg_database = result[0];
    result = await mysql.execute('SELECT * FROM tbl_stakeholder_scoring');
    global.tbl_stakeholder_scoring = result[0];
    result = await mysql.execute('SELECT * FROM tbl_business_commission');
    global.tbl_business_commission = result[0];
    result = await mysql.execute('SELECT * FROM tbl_instrument_types');
    global.tbl_instrument_types = result[0];

    result = await mysql.execute("SELECT * FROM tbl_business_quiz")
    global.tbl_business_quiz = result[0];
    result = await mysql.execute("SELECT * FROM tbl_bee_quiz")
    global.tbl_bee_quiz = result[0];
    result = await mysql.execute("SELECT * FROM tbl_scout_quiz")
    global.tbl_scout_quiz = result[0];

    result = await mysql.execute('SELECT * FROM tbl_available_currency');
    global.tbl_available_currency = result[0];
    result = await mysql.execute('SELECT * FROM tbl_stakeholder_map');
    global.tbl_stakeholder_map = result[0];
    result = await mysql.execute('SELECT * FROM tbl_balance_sheet');
    global.tbl_balance_sheet = result[0];
    result = await mysql.execute('SELECT * FROM tbl_income_sheet');
    global.tbl_income_sheet = result[0];
    result = await mysql.execute('SELECT * FROM tbl_cash_flow_sheet');
    global.tbl_cash_flow_sheet = result[0];
    result = await mysql.execute('SELECT * FROM tbl_sector_selection');
    global.tbl_sector_selection = result[0];
    result = await mysql.execute('SELECT * FROM tbl_unsdg_goal_interactions');
    global.tbl_unsdg_goal_interactions = result[0];
    result = await mysql.execute('SELECT * FROM tbl_score_business');
    global.tbl_score_business = result[0];
    result = await mysql.execute('SELECT * FROM tbl_local_dist_muni');
    global.tbl_local_dist_muni = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_drugusage');
    global.tbl_country_drugusage = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_economy');
    global.tbl_country_economy = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_energy');
    global.tbl_country_energy = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_transport');
    global.tbl_country_transport = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_socioeconomic');
    global.tbl_country_socioeconomic = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_geography');
    global.tbl_country_geography = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_refugees');
    global.tbl_country_refugees = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_maritime');
    global.tbl_country_maritime = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_government');
    global.tbl_country_government = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_health');
    global.tbl_country_health = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_climates');
    global.tbl_country_climates = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_communication');
    global.tbl_country_communication = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_international_disputes');
    global.tbl_country_international_disputes = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_military');
    global.tbl_country_military = result[0];
    result = await mysql.execute('SELECT * FROM tbl_country_provinces');
    global.tbl_country_provinces = result[0];

    result = await mysql.execute('SELECT * FROM tbl_user');
    global.tbl_user = result[0];
    result = await mysql.execute('SELECT * FROM tbl_business');
    global.tbl_business = result[0];
    result = await mysql.execute('SELECT * FROM tbl_catalogue_summary');
    global.tbl_catalogue_summary = result[0];
    
    global.provinceData = await mysql.execute("SELECT country, `names` FROM tbl_country_provinces  GROUP By `names` ORDER BY country ASC")

    global.stakeholders = await getStakeholders(tbl_business)
    console.log(stakeholders)
    global.extraData = await getData(tbl_business)
    console.log('OK!')
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
    stakeholders.push(await getStakeholderItem('Country', businessListData))
    stakeholders.push(await getStakeholderItem('Button 3', businessListData))
    stakeholders.push(await getStakeholderItem('Button 4', businessListData))
    stakeholders.push(await getStakeholderItem('Considerations', businessListData))
    stakeholders.push(await getStakeholderMap(25, businessListData))
    return stakeholders;
}

async function getStakeholderItem(key, businessListData) {
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
                if (table != lastTable && table != 'tbl_business_answer') {
                    result = eval(table)
                    for await (content_item of result) {
                        if(content_item['country'] == countryName && content_item[col] != undefined) {
                            var result_col = {}
                            result_col[col] = content_item[col];
                        }
                    }
                }
                lastTable = table;
            }
            stakeholders.push(result_col)
        }  
    } catch { }
    return stakeholders
}

async function getStakeholderMap(id_business_quiz, businessListData) {
    var stakeholders_maps = new Array()
        for await (business_item of businessListData) {
            stakeholders_map = new Array()
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
