exports.generateSignature = async function(req, res) {
    try {
        res.status(200).send(req.body)
    } catch (error) {
        res.status(200).send()
    }
}