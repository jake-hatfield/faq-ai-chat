
/// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { OpenAI } from "langchain/llms";
import { loadQAChain } from "langchain/chains";
import { Document } from "langchain/document";
import puppeteer from 'puppeteer'


export default async function handler(req, res) {
  const browser = await puppeteer.launch({ headless: true});
  const page = await browser.newPage();


  try {
    const model = new OpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, temperature: 0.9, concurrency: 10, cache: true });
    const body = JSON.parse(req.body)
    const websiteResponse = await fetch(body.website)

    if (websiteResponse.ok) {
      const chain = loadQAChain(model);

      await page.goto(body.website, { timeout: 180000 });
      const text = await page.$eval(('*'), (el) => el.innerText)
      const filteredText = text.match(/(.+?\.)|(.+?\?)/g);
      
      const docs = filteredText.map(sentence => new Document({ pageContent: sentence }))

      res.json(await chain.call({ question: body.question, input_documents: docs }))
    } else {
      res.status(404).json('Website not found')
    }

  } catch (error) {
    res.json(error)
  }

  await browser.close();
}

