const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
const sample = require("../samples/sample_issue");

const createIssue = async (z, bundle) => {
	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
		})
	);

	const newData = await defaultPixelBinClient.billing.getUsageV2();
	return newData;
};

module.exports = {
	key: "createReport",
	noun: "createReport",

	display: {
		label: "Create Usage Report",
		description: "Generates your PixelBin.io's storage report",
	},

	operation: {
		inputFields: [],
		perform: createIssue,
		sample: sample,
	},
};
