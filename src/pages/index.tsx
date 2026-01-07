import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { getDocs } from "firebase/firestore";
import { collection,  } from "firebase/firestore";
import { db } from "@/services/firestoneConnection";
import { GetStaticProps } from "next";

interface HomeProps {
  posts: number,
  coments: number
}

export default function Home({ posts,coments }: HomeProps) {
  return (
    <div className={styles.container}>

      <Head>
        <title> Tarefas+ | Organize duas tarefas de forma fácil</title>
      </Head>

      <main className={styles.main}>

        <div className={styles.logoContent}>

          <Image
            width={700}
            height={200}
            priority
            alt="hero image"
            src="/images/hero.png"
            className={styles.hero}
          />
        </div>

        <h1 className={styles.title}>Sistema feito para você organizar seus estudos e tarefas</h1>


        <div className={styles.cardsInfo}>
          <div className={styles.cardInfo_posts}>
            <span>+ {posts}  tarefas criadas</span>
          </div>

          <div className={styles.cardInfo_comentarios}>
            <span>+ {coments} comentários</span>
          </div>
        </div>
      </main>
    </div>
  );
} 

export const getStaticProps: GetStaticProps = async () =>{
  
  const comentSnapshot = await getDocs(collection(db,"coments"));
  const postsSnapshot = await getDocs(collection(db,"tarefas"));
  return{
    props:{
      posts: postsSnapshot.size || 0,
      coments: comentSnapshot.size || 0
    },
    revalidate: 60 // seria revaliodada a cada 60 segundos
  }
}