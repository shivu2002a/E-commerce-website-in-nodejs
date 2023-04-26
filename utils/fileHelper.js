const fs = require('fs')

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if(err) throw(err)
        console.log(filePath + ' was deleted')
    })
}
exports.deleteFile = deleteFile