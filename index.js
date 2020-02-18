const mongoose = require('mongoose')
 const app = require('./app')

 mongoose
		.connect(process.env.MONGO_URI)
		.then(result => {
			app.listen(8080)
		})
		.catch(err => console.log(err))
