import { doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";
import { query, where } from "firebase/firestore";

export class Conversation {
  constructor({ id, type, participants, last_message, created_at }) {
    this.id = id;
    this.type = type;
    this.participants = participants;
    this.last_message = last_message;
    this.created_at = created_at;
  }

  static collectionRef() {
    return collection(db, "conversations");
  }

  static async create(data) {
    const { id, ...rest } = data;
    if (!id) {
      const docRef = await addDoc(collection(db, "conversations"), rest);
      return new Conversation({ id: docRef.id, ...rest });
    }
    await setDoc(doc(db, "conversations", id), rest);
    return new Conversation(data);
  }

  static async get(id) {
    const docSnap = await getDoc(doc(db, "conversations", id));
    if (docSnap.exists()) {
      return new Conversation({ id, ...docSnap.data() });
    }
    return null;
  }

  static async update(id, newData) {
    await updateDoc(doc(db, "conversations", id), newData);
    return true;
  }

  static async delete(id) {
    await deleteDoc(doc(db, "conversations", id));
    return true;
  }

  static async list() {
    const querySnapshot = await getDocs(Conversation.collectionRef());
    const conversations = [];
    querySnapshot.forEach((docSnap) => {
      conversations.push(new Conversation({ id: docSnap.id, ...docSnap.data() }));
    });
    return conversations;
  }
}