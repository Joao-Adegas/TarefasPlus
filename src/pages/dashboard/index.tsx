import Head from "next/head"
import styles from "../dashboard/dashboard.module.css"
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { TextArea } from "@/components/textArea";
import { FiShare2 } from "react-icons/fi"
import { FaTrash } from "react-icons/fa"
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { db } from "@/services/firestoneConnection";
import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

interface HomeProps {
    user: {
        email: string;
    }
}

interface TasksProps {
    id: string;
    created: Date;
    public: boolean;
    tarefa: string;
    user: string;
}

export default function Dashboard({ user }: HomeProps) {

    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);
    const [tasks, setTasks] = useState<TasksProps[]>([]);

    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        console.log(event.target.checked);
        setPublicTask(event.target.checked);
    }

    async function handleRegisterTask(event: FormEvent) {
        event.preventDefault()
        if (input === "") return;

        try {
            await addDoc(collection(db, "tarefas"), {
                tarefa: input,
                created: new Date(),
                user: user?.email,
                public: publicTask
            })

            setInput("");
            setPublicTask(false);
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        async function loadTarefasname() {
            const tarefasref = collection(db, "tarefas");
            const q = query(
                tarefasref,
                orderBy("created", "desc"),
                where("user", "==", user?.email)
            )
            onSnapshot(q, (snapshot => {
                let lista = [] as TasksProps[];
                snapshot.forEach((doc) => {
                    lista.push({
                        id: doc.id,
                        tarefa: doc.data().tarefa,
                        created: doc.data().created,
                        user: doc.data().user,
                        public: doc.data().public
                    })
                })
                setTasks(lista);
            }));

        }


        loadTarefasname()
    }, [user?.email])

    async function handleShare(id: string) {
        await navigator.clipboard.writeText(`http://${process.env.NEXT_PUBLIC_URL}/task/${id}`)
        alert("Copiada com sucesso")
    }

    async function handleDeletetask(id: string) {
        const a = window.confirm("Certeza de que deseja deletar essa tarefa?");
        if (a.valueOf() == false) {
            return;
        }
        else {
            const docRef = doc(db, "tarefas", id);
            await deleteDoc(docRef);
        }
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>Meu painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.content_form}>
                        <h1>Qual sua tarefa?</h1>
                        <form onSubmit={handleRegisterTask}>
                            <TextArea
                                placeholder="Digite qual sua tarefa"
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                                    setInput(event.target.value)} />

                            <div className={styles.checkBoxArea}>
                                <input type="checkbox"
                                    className={styles.checkbox}
                                    checked={publicTask}
                                    onChange={handleChangePublic}
                                />
                                <label htmlFor="">deixar tarefa publica</label>
                            </div>

                            <button type="submit" className={styles.button}>Registrar</button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas Tarefas</h1>

                    {tasks.length > 0 ? (
                        tasks.map((a) => (

                            <article className={styles.task} key={a.id}>
                                <div className={styles.taskContent}>
                                    {a.public == true && (
                                        <>
                                            <label htmlFor="" className={styles.tag}>Publico</label>
                                            <button className={`${styles.shareButton} ${styles.action}`} onClick={() => handleShare(a.id)}>
                                                <FiShare2 size={22} color="blue" />
                                            </button>
                                        </>
                                    )}
                                </div>

                                <div className={styles.taskContent}>
                                    {a.public ? (
                                        <Link href={`/task/${a.id}`}>
                                            <p>{a.tarefa}</p>
                                        </Link>
                                    ) : (
                                        <p>{a.tarefa}</p>
                                    )}
                                    <button className={`${styles.trashButton} ${styles.action}`} onClick={() => handleDeletetask(a.id)}>
                                        <FaTrash size={22} color="red" />
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <p>Nenhuma Tarefa encontrada</p>
                    )}

                </section>
            </main>

        </div>
    );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({ req });;

    if (!session?.user) {
        return {
            redirect: {
                destination: "/",
                permanent: false
            }
        }
    }

    return {
        props: {
            user: {
                email: session?.user?.email
            }
        }
    }
}