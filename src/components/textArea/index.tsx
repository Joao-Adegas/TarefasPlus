import { HTMLProps } from "react";
import styles from "../textArea/styles.module.css";

export function TextArea({...rest}:HTMLProps<HTMLTextAreaElement>){
    return <textarea className={styles.textarea} {...rest}/>
}