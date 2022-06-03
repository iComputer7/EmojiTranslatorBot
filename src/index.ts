import * as Discord from "discord.js";
const emoji_bot = new Discord.Client({
	intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.DIRECT_MESSAGES, Discord.Intents.FLAGS.GUILD_MESSAGES]
});

import { IResult, VarChar, BigInt } from "mssql";
import { iC7MSSQLDriver } from "./db_driver";

const test_mode = (process.env.TEST_MODE == "true"); //increases verbosity of logging
const admin_id = process.env.ADMIN_ID; //some commands are only for the admin
const bot_prefix = process.env.BOT_PREFIX || "emoji"; //command prefix
const log_channel_id = process.env.LOG_CHANNEL; //id of the channel where some logs are put
const support_invite = process.env.support_invite || "9JXxUm6"; //invite code to the support server

const db = new iC7MSSQLDriver({
	server: process.env.SQL_HOST, //ip address or dns hostname of your sql server
	user: process.env.SQL_USER, //sql username
	password: process.env.SQL_PASS, //sql password
	database: process.env.SQL_DB, //sql database that the bot will use
	options: {
		trustServerCertificate: true, //lets the bot connect to a sql server with a self-signed certificate
		enableArithAbort: true //don't really know what this does but setting it to true cleans up the logs
	}
}); 

function general_log(db: iC7MSSQLDriver, e_type: string, e_details: string, callback?: () => void): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		let timestamp = new Date(); //getting a timestamp
		db.insert("emojibot.general_log", [
			{
				name: "event_type",
				value: e_type,
				type: VarChar()
			}, {
				name: "event_details",
				value: e_details,
				type: VarChar()
			}, {
				name: "timestamp",
				value: timestamp.getTime(),
				type: BigInt()
			}
		]).then(() => {
			if (typeof callback === "function") callback();
			resolve();
		}).catch((err) => { if (err) reject(err); });
	});
}

function simpleCommand(message: Discord.Message, command: string, func: (m?: Discord.Message) => void): void { 
	if (message.content.toLowerCase().startsWith(`${bot_prefix} ${command}`)) func();
}

//sends message to log channel, putting this here so I don't go crazy
function log_channel(log_msg: string): void {
	console.log(log_msg);
	//don't want to spam the log channel with garbage 
	let _channel = emoji_bot.channels.cache.get(log_channel_id);
	(_channel as Discord.TextChannel).send(log_msg);
}

//checks if the server is in the deletion complaining blacklist
function delete_blacklist_check(server_id: string, callback: (inBlacklist: boolean) => void): void {
	if (test_mode) console.log("Querying database for delete complaining blacklist.");
	db.query(`SELECT server_id FROM ${db.settings.database}.no_delete_complaining WHERE server_id='${server_id}'`).then((res: IResult<any>) => {
		if (test_mode) console.log(`Query successful.`);
		if (res.recordset.length > 0) {
			//server is in the blacklist.
			callback(true);
			return true;
		} else {
			//server is not in the blacklist.
			callback(false);
			return false;
		}
	});
}

//command deletion logic
function command_delete(message: Discord.Message): void {
	//this is so ridiculously overengineered, i'm leaving it for now but this will likely be removed in the future
	if (message.channel.type == "DM") return;
	message.delete()
		.then(() => { //command successfully deleted, only need verbosity in test mode
			if (test_mode) console.log(`Command deleted: message ID ${message.id} in channel #${(message.channel as Discord.TextChannel).name}`);
		})
		.catch((e) => { //no permissions or other error
			//double checking that bot doesn't have manage message perms
			let perm = (message.channel as Discord.TextChannel).permissionsFor(emoji_bot.user).has("MANAGE_MESSAGES");
			if (test_mode) console.log(`Bot does ${(perm) ? "" : "not"} have manage message permissions.`);
			if (!perm) { //bot does not have manage message perms
				delete_blacklist_check(message.guild.id, (dbc) => {
					if (dbc) {
						//server is in blacklist, so don't complain about it.
						if (test_mode) console.log(`Server ${message.guild.id} is in the delete complaining blacklist.`);
					} else {
						//server is not in blacklist, so complain about it.
						message.channel.send("I don't have manage message permissions to delete the command! If you can't give them to me then use `emoji stopcomplaining` to stop this warning.");
						if (test_mode) console.log(`Server ${message.guild.id} is not in the delete complaining blacklist.`);
					}
				});
			} else { //bot has perms but can't delete for some reason
				log_channel(`Tried to delete message ID ${message.id} with adequate permissions. Got this error: ${e}`);
				general_log(db, "delete_failed", `Can't delete message ID ${message.id} because of error: ${e}`);
			}
		});
}

//translation logic
function translate(message: Discord.Message, library: string, db: iC7MSSQLDriver, len: number) {
	command_delete(message);
	let parsed = message.cleanContent.substring(len).toLowerCase(), translated = `${message.author} said: ${require(library).translateMessage(parsed)}`;
	if (translated.length > 2000) translated = `${message.author}, The message is too long (${translated.length} characters).`;
	message.channel.send(translated).catch((err) => {
		general_log(db, "send_failed", `Failed to send message in ${message.guild.name} (ID: ${message.guild.id}). Error: ${err}`);
		log_channel(`Failed to send message in ${message.guild.name} (ID: ${message.guild.id}). Error: ${err}`);
	});
}

emoji_bot.on("ready", () => {
	console.log(`(EmojiBot) Logged in as ${emoji_bot.user.tag}!`); //logging bot user's username+discrim to the console
	if (test_mode) console.log("WARNING: TEST MODE ACTIVE");
	emoji_bot.user.setPresence({activities: [{name: bot_prefix + " help"}]}) //setting bot's status to "Playing emoji help"
});

emoji_bot.on("messageCreate", (message) => {
	//ignoring all bot messages
	if (message.author.bot) return;

	//----------------------------Admin only commands
	simpleCommand(message, "servers", (m) => { //this command lists all the servers that the bot is in
		if (message.author.id != admin_id) return;
		let formatted_guilds = [];
		for (let g of emoji_bot.guilds.cache.values()) {
			formatted_guilds.push(`${g.name} (ID: ${g.id}) `);
		}
		m.channel.send(formatted_guilds.join("\n"));
	});

	simpleCommand(message, "kill", (m) => {
		if (message.author.id != admin_id) return;
		general_log(db, "killed", "Bot killed in chat.", () => {
			console.log("Killed in chat. Exiting.");
			emoji_bot.destroy();
			process.exit();
		});
	});

	simpleCommand(message, "stats", (m) => {
		if (message.author.id != admin_id) return;
		let servers = [...emoji_bot.guilds.cache.values()].length, members = [...emoji_bot.users.cache.values()].length;
		message.channel.send(`I am in ${servers} server(s) with a combined total of ${members} members.`);
	});

	simpleCommand(message, "blackliststats", () => {
		if (message.author.id != admin_id) return;
		db.query(`SELECT server_id FROM ${db.settings.database}.no_delete_complaining`).then((res: IResult<any>) => {
			if (test_mode) console.log(`Query successful. MSSQL returned ${res.recordset.length} result(s).`);
			message.channel.send(`${res.recordset.length} server(s) have disabled the manage messages warning.`);
		});
	});
	//----------------------------------------------

	//----------------------------------------------Translation commands
	simpleCommand(message, "translate", (m) => translate(message, "./emotify.js", db, bot_prefix.length + 11));

	simpleCommand(message, "unown", (m) => translate(message, "./unownify.js", db, bot_prefix.length + 7));

	simpleCommand(message, "rgb", () => translate(message, "./rgbify.js", db, bot_prefix.length + 5));
	//---------------------------------------

	simpleCommand(message, "help", (m) => {
		message.channel.send("Hi, I'm an emoji translator! I take regular text and convert it to emojis. If you need help, please join the support server. \nPlease keep in mind that I can only translate English characters. \n`emoji support` - DMs you an invite to the support server.\n`emoji translate` - Translates to standard discord emojis.\n`emoji unown` - Translates to forms of the Pokemon Unown. Hard to read on the Discord dark theme.\n`emoji rgb` - Translates to text with flashing and pulsating colors.")
			.catch((err) => {
				general_log(db, "send_failed", `Failed to send message in ${message.guild.name} (ID: ${message.guild.id}). Error: ${err}`);
				log_channel(`Failed to send message in ${message.guild.name} (ID: ${message.guild.id}). Error: ${err}`);
			});
	});

	simpleCommand(message, "support", () => {
		log_channel(`User ${message.author.tag} has invoked the emoji support command.`);
		message.author.send("Here is the invite to the support server: https://discord.gg/" + support_invite)
			.then(() => message.channel.send("An invite link to the support server has been sent over DM!"))
			.catch(() => message.reply("I cannot DM you so here is the invite link to the support server: https://discord.gg/" + support_invite));
	});

	simpleCommand(message, "stopcomplaining", () => {
		//avoiding duplicate rows by checking if the server is already in the blacklist
		delete_blacklist_check(message.guild.id, (dbc: boolean) => {
			if (dbc) {
				//already in blacklist
				log_channel(`Server ${message.guild.id} tried to add themselves to the blacklist, but they're already in it.`);
				message.reply("Someone on this server already told me to shut up about manage message permissions.");
			} else {
				//not in blacklist, so add them
				db.query(`INSERT INTO emojibot.no_delete_complaining (server_id) VALUES (${message.guild.id})`).catch((err) => {
					console.error("There was an error submitting the data to SQL: " + err); //if there is an error, log it
					message.reply("Unfortunately, I'm having database issues at the moment. Please try again later.");
				}).then((res: IResult<any>) => {
					log_channel(`Added server ${message.guild.id} to the deletion complaining blacklist.`);
					message.channel.send("Okay. I will shut up about not having manage message permissions now. If you want me to delete commands in the future, then give me manage message permissions at any time.");
				});
			}
		});
	});
});

emoji_bot.on("guildCreate", (g) => {
	log_channel(`I have been added to a new server! It is called ${g.name} and its ID is ${g.id}`);
	general_log(db, "guild_create", `${g.name} (ID: ${g.id})`);
});

emoji_bot.on("guildDelete", (g) => {
	log_channel(`I have been removed from a server! It is called ${g.name} and its ID is ${g.id}`);
	general_log(db, "guild_delete", `${g.name} (ID: ${g.id})`);
});

emoji_bot.on("guildUnavailable", (g) => {
	console.log(`${g.name} (ID: ${g.id}) has become unavailable.`);
	general_log(db, "guild_unavailable", `${g.name} (ID: ${g.id})`);
});

emoji_bot.on("reconnecting", () => {
	console.log("I have lost connection with Discord servers. Reconnecting....");
	general_log(db, "reconnecting", "Reconnecting to Discord servers");
})

emoji_bot.login(process.env.BOT_TOKEN);

process.on("SIGINT", () => {
	general_log(db, "sigint", "Ctrl+C has been recieved on the terminal. Exiting.", () => {
		emoji_bot.destroy();
		process.exit();
	});
});
