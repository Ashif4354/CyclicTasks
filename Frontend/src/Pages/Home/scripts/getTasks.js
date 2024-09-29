import { doc, getDoc, collection, query, where } from "firebase/firestore";
import { db } from "../../../config/firebase";

import { analytics } from "../../../config/firebase";
import { logEvent } from "firebase/analytics";

const getTasks = async (email, setTasks, setNoTask) => {
    logEvent(analytics, 'get-tasks', {
        method: 'get-tasks'
    });
    
    let task;
    let tasks = [];

    const tasksIDs = await getTasksIDs(email);
    
    for(let taskID of tasksIDs) {
        const docRef = doc(db, "Tasks", taskID);
        const docSnap = await getDoc(docRef);

        task = docSnap.data();
        task.id = taskID;          

        tasks.push(task);
    }

    if (tasks.length === 0) {
        setTasks(null);
        setNoTask(true);
        return;
    } 

    setNoTask(false);   
    setTasks(tasks);
}

const getTasksIDs = async (email) => {

    const docRef = doc(db, "Users", email);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
        return docSnap.data().tasks    
    } else {
        return [];
    }     
}

export { getTasks }