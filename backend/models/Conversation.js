import {
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { query, where } from "firebase/firestore";

export class Conversation {
  constructor({
    id,
    conver_pic,
    name,
    type,
    participants,
    last_message,
    created_at,
    conver_theme,
    hidden_to,
  }) {
    this.id = id;
    this.name = name;
    this.conver_pic = conver_pic;
    this.type = type;
    this.participants = participants || [];
    this.last_message = last_message;
    this.created_at = created_at;
    this.conver_theme = conver_theme || "default";
    this.hidden_to = hidden_to || [];
  }

  static collectionRef() {
    return collection(db, "conversations");
  }

  static async create(data) {
    const { id, ...rest } = data;
    if (!rest.conver_theme) rest.conver_theme = "default";
    if (!rest.hidden_to) rest.hidden_to = [];
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
      conversations.push(
        new Conversation({ id: docSnap.id, ...docSnap.data() })
      );
    });
    return conversations;
  }
}