const { PixelbinConfig, PixelbinClient } = require("@pixelbin/admin");
const zapier = require("zapier-platform-core");
const INTEGRATION_PLATFORM = require("../constants");

const createReport = async (z, bundle) => {
	zapier.tools.env.inject();
	let defaultPixelBinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${process.env.BASE_URL}`,
			apiSecret: bundle.authData.apiKey,
			integrationPlatform: INTEGRATION_PLATFORM,
		})
	);

	const newData = await defaultPixelBinClient.billing.getUsageV2();
	return newData;
};

module.exports = {
	key: "createUsageReport",
	noun: "createUsageReport",

	display: {
		label: "Create Usage Report",
		description: "Generates your PixelBin.io's usage report",
	},

	operation: {
		inputFields: [],
		perform: createReport,
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
