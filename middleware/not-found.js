

const notFound = async (req, res) =>  {

    return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "Page Not Found"
    })
}

module.exports = notFound
