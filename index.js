const { Telegraf } = require('telegraf');
const axios = require('axios');
const cc = require('currency-codes');

// Init .env params
require('dotenv').config();
const { BOT_TOKEN, URL, PORT = 5000 } = process.env;


const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => ctx.reply('Bot started on heroku'));

bot.help((ctx) => {
  return ctx.reply('Help there heroku');
});

bot.hears(/^[A-Z]+$/i, async (ctx) => {
  const clientCurrencyName = ctx.message.text;
  const currency = cc.code(clientCurrencyName);

  // check for existing currency
  if (!currency) {
    return ctx.reply('Currency not found');
  }

  try {
    const { data } = await axios.get('https://api.monobank.ua/bank/currency');
    const foundCurrency = data.find(
      (cur) => String(cur.currencyCodeA) === currency.number
    );

    if (!foundCurrency || !foundCurrency.rateBuy || !foundCurrency.rateSell) {
      return ctx.reply('Currency dint found in Monobank API');
    }

    return ctx.replyWithMarkdown(`
      *CURRENCY:* ${currency.code}
      *RATE BUY:* ${foundCurrency.rateBuy}
      *RATE SELL:* ${foundCurrency.rateSell}
    `);
  } catch (err) {
    return ctx.reply(err.message);
  }
});

bot.telegram.setWebhook(`${URL}/bot${BOT_TOKEN}`);
bot.startWebhook(`/bot${BOT_TOKEN}}`, null, PORT);
console.log('started with webhook');