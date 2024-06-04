const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
const sample = require("../samples/sample_issue");
const zapier = require("zapier-platform-core");
const createIssue = async (z, bundle) => {
	zapier.tools.env.inject();
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
		description: "Generates your PixelBin.io's storage reports",
	},

	operation: {
		inputFields: [],
		perform: createIssue,
		sample: {
			storage: {
				total: 16106127360,
				used: 7774632,
			},
			credits: {
				total: 1000,
				used: 55.98050216973573,
			},
		},
	},
};
