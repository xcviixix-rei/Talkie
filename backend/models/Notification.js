import { doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { query,where } from "firebase/firestore";

export class Notification {
  constructor({ id, user_id, device_tokens }) {
    this.id = id;
    this.user_id = user_id;
    this.device_tokens = device_tokens;
  }

  static collectionRef() {
    return collection(db, "notifications");
  }

  static async create(data) {
    const { id, ...rest } = data;
    
    const timeoutMs = 5000; // Timeout after 5 seconds

    const operation = (async () => {
      if (!id) {
        await addDoc(collection(db, "notifications"), rest);
        return new Notification(data);
      }
      await setDoc(doc(db, "notifications", id), rest);
      return new Notification(data);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    );

    // Return whichever completes first: the Firestore operation or the timeout.
    return Promise.race([operation, timeoutPromise]);
  }

  static async get(id) {
    const docSnap = await getDoc(doc(db, "notifications", id));
    if (docSnap.exists()) {
      return new Notification({ id, ...docSnap.data() });
    }
    return null;
  }

  static async update(id, newData) {
    await updateDoc(doc(db, "notifications", id), newData);
    return true;
  }

  static async delete(id) {
    await deleteDoc(doc(db, "notifications", id));
    return true;
  }

  static async list() {
    const querySnapshot = await getDocs(Notification.collectionRef());
    const notifications = [];
    querySnapshot.forEach((docSnap) => {
      notifications.push(new Notification({ id: docSnap.id, ...docSnap.data() }));
    });
    return notifications;
  }
}