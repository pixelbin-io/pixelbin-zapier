const zapier = require("zapier-platform-core");

const App = require("../index");
const appTester = zapier.createAppTester(App);

describe("custom auth", () => {
	zapier.tools.env.inject();
	it("passes authentication and returns json", async () => {
		const bundle = {
			authData: {
				apiKey: "9410ee81-fcaa-4532-a18a-8d7bd4e3686c",
			},
		};

		const response = await appTester(App.authentication.test, bundle);
		expect(response.status).toBe(200);
		expect(response.data).toHaveProperty("app");
	});

	it("fails on bad auth", async () => {
		const bundle = {
			authData: {
				apiKey: "bad",
			},
		};

		try {
			await appTester(App.authentication.test, bundle);
		} catch (error) {
			expect(error.message).toContain("The API Key you supplied is incorrect");
			return;
		}
		throw new Error("appTester should have thrown");
	});
});
