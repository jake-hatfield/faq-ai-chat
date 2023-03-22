// install node.js 18.12.1 version
import Head from 'next/head'
import Display from '../comps/Display'
import styles from '@/styles/Home.module.css'
import { useEffect, useState } from 'react'
import formSchema from '@/utilities/formSchema'
import * as Yup from "yup";
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
const initialState = { answer: '', question: 'What will I learn?', website: 'https://www.verywellfit.com/tips-for-walking-technique-3435093' }


export default function Experiment() {
  const { register, handleSubmit, watch, resetField, formState: { errors } } = useForm({
    defaultValues: {
      question: initialState.question,
      website: initialState.website,
    }, resolver: yupResolver(formSchema)
  });

  const [answer, setAnswer] = useState(initialState.answer)
  // const [question, setQuestion] = useState(initialState.question)
  // const [website, setWebsite] = useState(initialState.website)
  const [log, setLog] = useState([])
  const [sendQuestion, setSendQuestion] = useState(false)

  async function onSubmit(formData) {
    try {
      const question = formData.question
      const website = formData.website
      const res = await fetch("api/answer", {
        method: 'POST',
        body: JSON.stringify({ question: question, website: website })
      })

      console.log(res.status)

      if(res.status !== 404) {
        const data = await res.json();
        setLog([...log, { question: formData.question, answer: data.text }])
      }

    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    resetField("question")
  }, [log])

  return (
    <>
      <Head>
        <title>Grammerhub</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='nav_bar'>
        <img src="./images/grammerhub.png"></img>

        <div className='pages'>
          <ul>home</ul>
          <ul>find talent</ul>
          <ul>about</ul>
          <ul>join</ul>
        </div>
      </div>

      <Display style={styles} log={log} />


      <section className={styles.form_container}>
        <form className={styles.question_form} onSubmit={handleSubmit((data) => onSubmit(data))}>
          <label htmlFor="question-input">Ask grammerhub a question:</label>
          <input id="question-input" className={styles.question_input} {...register("question")} type="text" />
          <span>{errors.question?.message}</span><br />
          <label htmlFor="website-input">What website:</label>
          <input id="website-input" className={styles.question_input} {...register("website")} type="text" />
          <span>{errors.website?.message}</span><br />
          <input type="button" value="Submit" onClick={handleSubmit((data) => onSubmit(data))} />
        </form>
      </section>
      <footer>
        <section>

        </section>
        <div className='footer_title'>g r a m m e r h u b</div>
        <div className='footer_info'>KEEP IN TOUCH</div>

        <div className='follow_us'>Follow us at:
          <box-icon type='logo' name='facebook'></box-icon>
          <box-icon type='logo' name='discord-alt'></box-icon>
          <box-icon name='linkedin' type='logo' ></box-icon>
        </div>

        <div className='acknowledgements'>
          <p>Built by: Zephyr, Steve & Andrea</p>
        </div>
      </footer>
    </>
  )
}