import { doc, getDoc, collection, query, where } from "firebase/firestore";
import { db } from "../../../config/firebase";

const getTasks = async (email, setTasks, setNoTask) => {
    // console.log("in getTasks", email)
    
    let task;
    let tasks = [];

    const tasksIDs = await getTasksIDs(email);
    // const Query = query(collection(db, "Tasks"), where("id", "in", tasksIDs));
    // const querySnapshot = await getDoc(Query);
    
    for(let taskID of tasksIDs) {
        const docRef = doc(db, "Tasks", taskID);
        const docSnap = await getDoc(docRef);
        // console.log("DOC SNAP", docSnap.data())
        task = docSnap.data();
        task.id = taskID;          

        tasks.push(task);
    }

    // console.log("Tasks", typeof tasks, tasks)
    // console.log(tasks)
    if (tasks.length === 0) {
        setTasks(null);
        setNoTask(true);
        return;
    } 
    setNoTask(false);   
    setTasks(tasks);
}

const getTasksIDs = async (email) => {
    // console.log("in getTasksIDs", email)

    const docRef = doc(db, "Users", email);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()) {
        // console.log(docSnap.data().tasks);
        return docSnap.data().tasks    
    } else {
        return [];
    }     
}

export { getTasks }