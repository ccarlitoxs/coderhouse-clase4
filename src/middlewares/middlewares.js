const joi = require('joi')

const dataVerification = joi.object({
	title: joi.string().required(),
	price: joi.number().min(0).required(),
	thumbnail: joi.string().required(),
})

async function validateData(req, res, next) {
	const { body } = req
	try {
		await dataVerification.validateAsync(body)
		next()
	} catch (error) {
		next(error)
	}
}

module.exports = validateData
