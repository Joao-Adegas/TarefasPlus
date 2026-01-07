import styles from "../header/styles.module.css";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react"

export function Header() {

    const { data: session, status } = useSession();
    return (
        <header className={styles.header}>
            <section className={styles.content}>
                <nav className={styles.nav}>

                    <Link href={"/"} className={styles.span}>
                        <h1>Tarefas<span className={`${styles.plus}`}>+</span></h1>
                    </Link>

                    {session?.user && (
                        <Link href={"/dashboard"} className={`${styles.span}`}>
                            <span className={styles.painel}>Meu painel</span>
                        </Link>

                    )}
                </nav>

                {status === "loading" ? (
                    <></>
                ) : session ? (
                    <button className={styles.acessarBtn} onClick={() => signOut()}>
                        Olá {session?.user?.name}
                    </button>
                ) : (
                    <button className={styles.acessarBtn} onClick={() => signIn("google")}>Acessar</button>
                )}

            </section>

        </header>
    )
}