
/// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { OpenAI } from "langchain/llms";
import { loadQAChain } from "langchain/chains";
import { Document } from "langchain/document";
import * as cheerio from 'cheerio'
import axios from 'axios'

export default async function handler(req, res) {

  const body = JSON.parse(req.body)
  const websiteResponse = await fetch(body.website)

  if(!websiteResponse.ok) {

    res.status(404).json('Website not found')

  }

  try {
    const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.9, concurrency: 10, cache: true });
    const chain = loadQAChain(model);

    const website = await axios.get(body.website)
    const html = website.data;

    const $ = cheerio.load(html, { ignoreWhitespace: true, scriptingEnabled: false });

    $('script').remove()
    $('style').remove()

    const text = $('body *').contents().map(function() {
      return (this.type === 'text') ? $(this).text().trim()+' ' : '';
    }).get().join('');
    // const text = await $.$eval(('*'), (el) => el.innerText)
    console.log(text)

    const filteredText = text.match(/(.+?\.)|(.+?\?)/g);
    // console.log(filteredText)

    const docs = filteredText.map(sentence => new Document({ pageContent: sentence }))

    res.json(await chain.call({ question: body.question, input_documents: docs }))

  } catch (error) {
    res.json(error)
  }

}

  // let chrome = {};
  // let puppeteer;

  // if(process.env.AWS_LAMBDA_FUNCTION_VERSION) {

  //   chrome = require("chrome-aws-lambda");
  //   puppeteer = require("puppeteer-core");

  // }else {

  //   puppeteer = require("puppeteer")

  // }

  // let options = {};

  // if(process.env.AWS_LAMBDA_FUNCTION_VERSION) {

  //   options = {
  //     args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
  //     defaultViewport: chrome.defaultViewport,
  //     executablePath: await chrome.executablePath,
  //     headless: true,
  //     ignoreHTTPSErrors: true,
  //   }

  // }

  // const browser = await puppeteer.launch(options);
  // const page = await browser.newPage();

  // await browser.close();

