import Head from "next/head";
import styles from "../task/styles.module.css"

import { GetServerSideProps } from "next";
import { db } from "@/services/firestoneConnection";
import { collection, doc, getDoc, query, where, addDoc, getDocs, Timestamp, deleteDoc } from "firebase/firestore";
import { TextArea } from "@/components/textArea";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, useState } from "react";
import { FaTrash } from "react-icons/fa";

interface TaslProps {
    item: {
        tarefa: string,
        created: string,
        public: boolean,
        user: string,
        taskId: string
    }
    allComment: CommentsProp[]
}

interface CommentsProp {
    id: string,
    coment: string,
    user: string,
    email: string,
    taskId: string,
}

export default function Task({ item, allComment }: TaslProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [coment, setComent] = useState<CommentsProp[]>(allComment || []);

    async function handleregisteroment(event: FormEvent) {
        event.preventDefault();

        if (input == "" || !session?.user?.email || !session?.user?.name) return;

        try {
            const docRef = await addDoc(collection(db, "coments"), {
                coment: input,
                created: new Date(),
                user: session?.user?.name,
                email: session?.user?.email,
                taskId: item?.taskId,
            });

            const data ={
                id: docRef.id,
                coment: input,
                user: session?.user.name,
                email: session?.user?.email,
                taskId: item?.taskId
            };
            setComent((oldItems) => [...oldItems, data])
            alert("Comentário enviado com sucesso");
            setInput("");
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteComment(id:string) {
        try{
            const docRef = doc(db,"coments",id);
            alert("Documento deletado com sucesso"); 
            await deleteDoc(docRef);
            const deleteComents = coment.filter((a) => a.id !== id);
            setComent(deleteComents);
        }catch(err){
            console.error(err);
        }
    }

    return (
        <div className={styles.container}>

            <Head>
                <title>Tarefa - {item?.tarefa}</title>
            </Head>

            <main className={styles.main}>

                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>

            </main>

            <section className={styles.comentsContainer}>
                <h2>Deixar comentário</h2>

                <form onSubmit={handleregisteroment}>
                    <TextArea placeholder="Deixe seu comentário..." value={input} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setInput(event.target.value)} />
                    <button className={styles.button} disabled={!session?.user} >Comentar</button>
                </form>
            </section>

            <section className={styles.listComments}>
                <h2>Todos os comentários</h2>
                {coment.length > 0 && (
                    coment.map((a) => (

                        <article key={a.id} className={styles.containerComment}>
                            <div className={styles.topContainerComment}>
                                <span className={styles.userContainer}> {a.user} </span>
                                {a.email === session?.user?.email && (
                                    <button onClick={() => deleteComment(a.id)} className={styles.deleteComent}>
                                        <FaTrash color="red" size={20} />
                                    </button>
                                )}
                            </div>
                            <div className={styles.bottomContainerComment}>
                                <p className={styles.commentParagrah}> {a.coment} </p>
                            </div>
                        </article>
                    ))
                )}
            </section>

        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {

    const id = params?.id as string;
    const docRef = doc(db, "tarefas", id);
    const snapshot = await getDoc(docRef);

    const q = query(collection(db, "coments"), where("taskId", "==", id));
    const snapshotComment = await getDocs(q);

    let allComment: CommentsProp[] = [];

    snapshotComment.forEach((doc) => {
        allComment.push({
            id: doc.id,
            coment: doc.data().coment,
            user: doc.data().user,
            email: doc.data().email,
            taskId: doc.data().taskId,
        })
    })

    console.log(allComment);

    if (snapshot.data() == undefined || !snapshot.data()?.public) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            },
        }
    }

    const miliseconds = snapshot.data()?.created.seconds * 1000;
    const task = {
        tarefa: snapshot.data()?.tarefa,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    };

    return {
        props: {
            item: task,
            allComment: allComment,
        },
    };

};