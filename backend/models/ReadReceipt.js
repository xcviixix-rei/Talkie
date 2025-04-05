import { doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { query, where } from "firebase/firestore";

export class ReadReceipt {
  constructor({ id, message_id, user_id, timestamp }) {
    this.id = id;
    this.message_id = message_id;
    this.user_id = user_id;
    this.timestamp = timestamp;
  }

  static collectionRef() {
    return collection(db, "readReceipts");
  }

  static async create(data) {
    const { id, ...rest } = data;
    
    const timeoutMs = 5000; // Timeout after 5 seconds

    const operation = (async () => {
      if (!id) {
        await addDoc(collection(db, "readReceipts"), rest);
        return new ReadReceipt(data);
      }
      await setDoc(doc(db, "readReceipts", id), rest);
      return new ReadReceipt(data);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    );

    // Return whichever completes first: the Firestore operation or the timeout.
    return Promise.race([operation, timeoutPromise]);
  }

  static async get(id) {
    const docSnap = await getDoc(doc(db, "readReceipts", id));
    if (docSnap.exists()) {
      return new ReadReceipt({ id, ...docSnap.data() });
    }
    return null;
  }

  static async update(id, newData) {
    await updateDoc(doc(db, "readReceipts", id), newData);
    return true;
  }

  static async delete(id) {
    await deleteDoc(doc(db, "readReceipts", id));
    return true;
  }

  static async list() {
    const querySnapshot = await getDocs(ReadReceipt.collectionRef());
    const receipts = [];
    querySnapshot.forEach((docSnap) => {
      receipts.push(new ReadReceipt({ id: docSnap.id, ...docSnap.data() }));
    });
    return receipts;
  }
}