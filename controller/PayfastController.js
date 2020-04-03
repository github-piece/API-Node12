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
            passPhrase = ''
            if (!empty(passPhrase)) {
                pfTempParamString += '&passphrase=' + urlencode(passPhrase)
            }
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