export const getConstrainsError = (constraint) => {
	if (constraint) {
		const code = Object.keys(constraint)[0]
		return {
			code,
			message: constraint[code]
		}
	}
	return null;
}

export const getDefaultError = () => {
	return {
		code: "Unexpected",
		message: "Unexpected error"
	}
}

export const animalBreeds = () => {
	return [
		''
	]
}
