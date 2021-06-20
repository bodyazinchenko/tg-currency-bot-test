const { Telegraf } = require('telegraf');
const axios = require('axios');
const cc = require('currency-codes');

// Init .env params
require('dotenv').config();
const { BOT_TOKEN } = process.env;


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

bot.launch().then(() => console.log('launched heroku bot')).catch(console.error);