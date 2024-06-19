const zapier = require("zapier-platform-core");
zapier.tools.env.inject();

class Util {
	static async fetchEvents(z, eventsToReturn) {
		const fetchEventsRequest = {
			url: `${process.env.BASE_URL}/service/platform/notification/v1.0/events`,
			method: "GET",
		};
		const eventIds = [];

		try {
			let response = await z.request(fetchEventsRequest);

			if (response.status === 200) {
				const tempResponse = [...response.data];

				eventsToReturn.forEach((elementToFind) => {
					const temp = tempResponse.find(
						(item) =>
							item.name === elementToFind.name &&
							item.type === elementToFind.type
					);
					eventIds.push(temp._id);
				});

				return eventIds;
			} else {
				throw new Error(
					`Failed to retrieve events. Status: ${response.status}`
				);
			}
		} catch (error) {
			console.log("Error fetching events: " + error.message);
			throw error;
		}
	}
}

module.exports = Util;
