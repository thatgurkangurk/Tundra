const { glob } = require('glob');
const { promisify } = require('util');
const { Client } = require('discord.js');
const mongoose = require('mongoose');
const { testGuild, global } = require('../config.json');

const globPromise = promisify(glob);

/**
 * @param {Client} client
 */
module.exports = async (client) => {
  // Commands
  const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`);
  commandFiles.map((value) => {
    const file = require(value);
    const splitted = value.split('/');
    const directory = splitted[splitted.length - 2];

    if (file.name) {
      const properties = { directory, ...file };
      client.commands.set(file.name, properties);
    }
  });

  // Events
  const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
  eventFiles.map((value) => require(value));

  // Slash Commands
  const slashCommands = await globPromise(
    `${process.cwd()}/SlashCommands/*/*.js`
  );

  const arrayOfSlashCommands = [];
  slashCommands.map((value) => {
    const file = require(value);
    if (!file?.name) return;
    client.slashCommands.set(file.name, file);

    if (['MESSAGE', 'USER'].includes(file.type)) delete file.description;
    arrayOfSlashCommands.push(file);
  });
  client.on('ready', async () => {
    if (global) {
      console.log('Starting in global mode.');
      await client.application.commands.set(arrayOfSlashCommands);
    } else {
      console.log(
        'Starting in local mode. Test guild is ' +
          client.guilds.cache.get(testGuild).name
      );
      await client.guilds.cache
        .get(testGuild)
        .commands.set(arrayOfSlashCommands);
    }
    // Register for a single guild

    // Register for all the guilds the bot is in
    //
  });

  // mongoose
  const { mongooseConnectionString } = require('../config.json');
  if (!mongooseConnectionString) return;

  mongoose
    .connect(mongooseConnectionString)
    .then(() => console.log('Connected to mongodb'));
};
