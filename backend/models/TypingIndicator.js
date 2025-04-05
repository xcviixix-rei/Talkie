import { doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { query, where } from "firebase/firestore";

export class TypingIndicator {
  constructor({ id, conversation_id, typing_users }) {
    this.id = id;
    this.conversation_id = conversation_id;
    this.typing_users = typing_users;
  }

  static collectionRef() {
    return collection(db, "typingIndicators");
  }

  static async create(data) {
    const { id, ...rest } = data;
    
    const timeoutMs = 5000; // Timeout after 5 seconds

    const operation = (async () => {
      if (!id) {
        await addDoc(collection(db, "typingIndicators"), rest);
        return new TypingIndicator(data);
      }
      await setDoc(doc(db, "typingIndicators", id), rest);
      return new TypingIndicator(data);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    );

    // Return whichever completes first: the Firestore operation or the timeout.
    return Promise.race([operation, timeoutPromise]);
  }

  static async get(id) {
    const docSnap = await getDoc(doc(db, "typingIndicators", id));
    if (docSnap.exists()) {
      return new TypingIndicator({ id, ...docSnap.data() });
    }
    return null;
  }

  static async update(id, newData) {
    await updateDoc(doc(db, "typingIndicators", id), newData);
    return true;
  }

  static async delete(id) {
    await deleteDoc(doc(db, "typingIndicators", id));
    return true;
  }

  static async list() {
    const querySnapshot = await getDocs(TypingIndicator.collectionRef());
    const indicators = [];
    querySnapshot.forEach((docSnap) => {
      indicators.push(new TypingIndicator({ id: docSnap.id, ...docSnap.data() }));
    });
    return indicators;
  }
}