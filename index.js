const pixelbinEvents = require("./triggers/pixelbinEvents");
const createFileTrigger = require("./triggers/createFile");
const deleteFileTrigger = require("./triggers/deleteFile");
const createFolderTrigger = require("./triggers/createFolder");
const createReport = require("./creates/createReport");
const transform = require("./creates/transform");
const upload = require("./creates/upload");
const {
	config: authentication,
	befores = [],
	afters = [],
} = require("./authentication");

const App = {
	version: require("./package.json").version,
	platformVersion: require("zapier-platform-core").version,
	authentication,

	// beforeRequest & afterResponse are optional hooks into the provided HTTP client
	beforeRequest: [...befores],

	afterResponse: [...afters],

	// If you want to define optional resources to simplify creation of triggers, searches, creates - do that here!
	resources: {},

	// If you want your trigger to show up, you better include it here!
	triggers: {
		[pixelbinEvents.key]: pixelbinEvents,
		[createFileTrigger.key]: createFileTrigger,
		[deleteFileTrigger.key]: deleteFileTrigger,
		[createFolderTrigger.key]: createFolderTrigger,
	},
	searches: {},

	// If you want your creates to show up, you better include it here!
	creates: {
		[transform.key]: transform,
		[upload.key]: upload,
		[createReport.key]: createReport,
	},
};

module.exports = App;
