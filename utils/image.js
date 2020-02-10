const fs = require('fs')
const path = require('path')

module.exports = imagePath => {
	let filePath = path.join(__dirname, '..', imagePath)
	fs.existsSync(filePath) &&
		fs.unlink(filePath, err => {
			if (err) {
				throw err
			}
		})
}
