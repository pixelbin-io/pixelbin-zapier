/* globals describe, it */

// require("should");

const zapier = require("zapier-platform-core");
const App = require("../index");

const appTester = zapier.createAppTester(App);

describe("triggers", () => {
	describe("web hook trigger", () => {
		zapier.tools.env.inject();
		it("should create a new webhook", async () => {
			const bundle = {
				authData: {
					apiKey: process.env.API_TOKEN,
				},
				targetUrl: "https://github.com/zapier/zapier-platform-cli",
			};

			const response = await appTester(
				App.triggers.createFile.operation.performSubscribe,
				bundle
			);
			expect(response.message).toBe("Created new webhook config");
			expect(response).toHaveProperty("webhookConfigId");
		});

		it("should delete webhook", async () => {
			const bundle = {
				authData: {
					apiKey: process.env.API_TOKEN,
				},
			};

			const response = await appTester(
				App.triggers.createFile.operation.performUnsubscribe,
				bundle
			);

			expect(response.message).toBe(
				"Successfully deleted webhook config and all related data"
			);
		});
	});
});
