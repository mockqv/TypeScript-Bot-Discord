import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import { IConfig } from "../interfaces/IConfig";
import Handler from "./Handler";
import Command from "./Command";
import Subcommand from "./SubCommand";
import { connect } from "mongoose";
import dotenv from "dotenv"
dotenv.config()

const config = {
    token: process.env.TOKEN!,
    discordClientId: process.env.DISCORD_CLIENT_ID!,
    mongoUrl: process.env.MONGO_URL!,

    devToken: process.env.DEV_TOKEN!,
    devDiscordClientId: process.env.DEV_DISCORD_CLIENT_ID!,
    devGuildId: process.env.DEV_GUILD_ID!,
    devMongoUrl: process.env.DEV_MONGO_URL!,

    developerUserIds: process.env.DEVELOPER_USER_IDS
        ? process.env.DEVELOPER_USER_IDS.split(",")
        : []
};

export default class CustomClient extends Client implements ICustomClient {

    handler: Handler;
    config: IConfig;
    commands: Collection<string, Command>;
    subCommands: Collection<string, Subcommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    developmentMode: boolean;

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds] });

        // this.config = require(`${process.cwd()}/data/config.json`);
        this.config = config;
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
        this.developmentMode = (process.argv.slice(2).includes("--development"))
    };


    Init(): void {
        console.log(`Startting the bot in ${this.developmentMode ? "development" : "production"} mode.`)
        this.LoadHandlers();

        this.login(this.developmentMode ? this.config.devToken : this.config.token)
            .catch((err) => console.error(err));

        connect(this.developmentMode ? this.config.devMongoUrl : this.config.mongoUrl)
            .then(() => console.log("Connected to MongoDB."))
            .catch((err) => console.error(err))
    };

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    };
};