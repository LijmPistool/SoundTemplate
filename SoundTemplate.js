/**
 * @name broodje
 * @invite 8p3Ar9JhuB
 * @authorLink https://www.youtube.com/channel/UC7s8zO5S_-I7_f4hw4JYAuw
 * @donate https://www.paypal.me/LijmPistool
 * @website https://www.youtube.com/channel/UC7s8zO5S_-I7_f4hw4JYAuw
 * @source https://github.com/LijmPistool/SoundTemplate/blob/main/SoundTemplate.js
 */

module.exports = (() => {
	const config =
	{
		info: {
			name: "broodje",
			authors: [{
				name: "LijmPistool",
				discord_id: "609500763827470355",
				//github_username: "niks",
				//twitter_username: "niks"
			}],
			version: "1",
			description: "speelt een geluidje af wanneer iemand broodje zegt",
			github: "https://github.com/LijmPistool/SoundTemplate/blob/main/SoundTemplate.js",
			github_raw: "https://raw.githubusercontent.com/LijmPistool/SoundTemplate/main/SoundTemplate.js"
		},
		defaultConfig: [{
			id: "general",
			name: "general settings",
			type: "category",
			collapsible: true,
			shown: false,
			settings: [{
				id: "onlyCur",
				name: "Current channel only",
				note: "When this is enabled, the bruh sound effect will only play when a bruh is found in the selected channel.",
				type: "switch",
				value: true
			}, {
				id: "delay",
				name: "Delay between each bruh (ms)",
				note: "The amount of milliseconds to wait between each bruh when multiple bruhs are found within the same message.",
				type: "slider",
				value: 200,
				min: 10,
				max: 1000,
				renderValue: v => Math.round(v) + "ms"
			}]
		}]
	};

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
						if (err) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}

		start() { }
		stop() { }
	} : (([Plugin, Api]) => {

		const plugin = (Plugin, Api) => { try {
			const {
				DiscordModules: { Dispatcher, SelectedChannelStore }
			} = Api;

			const audio = new Audio();

			return class Bruh extends Plugin {
				constructor() {
					super();
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
	
				onStart() {
					Dispatcher.subscribe("MESSAGE_CREATE", this.messageEvent);
				}
				
				messageEvent = async ({ channelId, message, optimistic }) => {
					if (this.settings.general.onlyCur && channelId != SelectedChannelStore.getChannelId())
						return;

					if (!optimistic) {
						const count = (message.content.match(/broodje/gmi) || []).length;
				
						for (let i = 0; i < count; i++) {
							this.playBruh();

							await new Promise(r => setTimeout(r, this.settings.general.delay));
						}
					}
				};
				
				playBruh() {
					audio.src = "audisource";
					audio.play();
				}
				
				onStop() {
					Dispatcher.unsubscribe("MESSAGE_CREATE", this.messageEvent);
				}
			}
		} catch (e) { console.error(e); }};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
