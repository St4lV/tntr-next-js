require('dotenv').config();

const backend_server=process.env.BACKEND_SERVER

async function getPlanning(){
	const planning = await get_request(`${backend_server}/radio/schedule`)
	return planning.log
}

async function get_request(address) {
	try {
		const response = await fetch(address);

		const isJson = response.headers
			.get("content-type")
			?.includes("application/json");

		if (!response.ok) {
			const errorBody = isJson ? await response.json() : await response.text();
			return { code: response.status, type: "Error", log: errorBody };
		}

		const data = isJson ? await response.json() : await response.text();
		return { code: 200, type: "Success", log: data };

	} catch (error) {
		return { code: 500, type: "Internal Server Error", log: error.message };
	}
}

module.exports = { getPlanning }