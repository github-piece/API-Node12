exports.generateSignature = async function(req, res) {
  PAYFAST_SERVER = 'TEST'
  try {
      pfError = false;
      pfErrMsg = '';
      filename = 'notify.txt'; // DEBUG
      output = ''; // DEBUG
      pfParamString = '';
      pfHost = ( PAYFAST_SERVER == 'LIVE' ) ? 'www.payfast.co.za' : 'sandbox.payfast.co.za';
      pfData = new Array();
      output = "ITN Response Received\n\n";
      if (!pfError) {
          output += "Posted Variables:\n"
          for (const [key, value] of Object.entries(req.body)) {
              pfData[key] = stripslashes(value)
              output += key + ' = ' + value + '\n'
          }
          urlencode = require('urlencode');
          for (const [key, value] of Object.entries(pfData)) {
              if (key != 'signature') {
                  pfParamString += key + '=' + urlencode(value) + '&'
              }
          }
          pfParamString = pfParamString.substring(0, pfParamString.length - 1)
          pfTempParamString = pfParamString
          passPhrase = 'Reimagine14948258SA'
          if (!empty(passPhrase)) {
              pfTempParamString += '&passphrase=' + urlencode(passPhrase)
          }
          pfTempParamString = pfTempParamString.replace(/%20/g, '+')
          md5 = require('md5')
          signature = md5(pfTempParamString)
          res.status(200).send({signature: signature})
      } else {
          res.status(400).send()
      }
  } catch (error) {
      res.status(400).send()
  }
}

exports.payData = async function(req, res) {
  receiveData = req.body
  rates = ['0%~2%', '2%~5%', '5%~10%', '10%~15%', '15%~20%', '20%~30%', '0%~2%'];
  frequencies = ['Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Bi-Annually'];
  payTransData = {
    mPaymentId: receiveData.m_payment_id,
    pfPaymentId: receiveData.pf_payment_id,
    paymentStatus: receiveData.payment_status,
    businessName: receiveData.item_name,
    amountGross: receiveData.amount_gross,
    amountFee: receiveData.amount_fee,
    amountNet: receiveData.amount_net,
    userId: receiveData.custom_str5,
    businessId: receiveData.custom_str4,
    fundType: receiveData.custom_str1,
    rate: rates[receiveData.custom_str2],
    frequency: frequencies[receiveData.custom_str3],
    nameFirst: receiveData.name_first,
    nameLast: receiveData.name_last,
    emailAddress: receiveData.email_address,
    merchantId: receiveData.merchant_id,
  }
  await mysql.execute("INSERT INTO tbl_buyer_transaction (signature) VALUES (?)", [receiveData.signature])
  for (const [key, value] of Object.entries(payTransData)) {
    await mysql.execute("UPDATE tbl_buyer_transaction SET " + key + "= ? WHERE signature = ?", [value, receiveData.signature])
  }
  insertData = [payTransData.userId, payTransData.businessId, payTransData.amountGross, payTransData.fundType, payTransData.rate, payTransData.frequency]
  await mysql.execute("INSERT `tbl_history` (u_id, business_id, amount, fundtype, rate, frequency) VALUES (?, ?, ?, ?, ?, ?)", insertData)
  res.status(200).send()
}

function stripslashes (str) {
    return (str + '')
    .replace(/\\(.?)/g, function (s, n1) {
      switch (n1) {
        case '\\':
          return '\\'
        case '0':
          return '\u0000'
        case '':
          return ''
        case ' ':
          return '+'
        default:
          return n1
      }
    })
}

function empty (mixedVar) {
    var undef
    var key
    var i
    var len
    var emptyValues = [undef, null, false, 0, '', '0']
  
    for (i = 0, len = emptyValues.length; i < len; i++) {
      if (mixedVar === emptyValues[i]) {
        return true
      }
    }
  
    if (typeof mixedVar === 'object') {
      for (key in mixedVar) {
        if (mixedVar.hasOwnProperty(key)) {
          return false
        }
      }
      return true
    }
  
    return false
}