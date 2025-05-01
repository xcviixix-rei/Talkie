import {
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase.js";
import { query, where } from "firebase/firestore";

export class Message {
  constructor({
    id,
    conversation_id,
    sender,
    text,
    attachments,
    timestamp,
    seen_by,
    hidden_to, // new field
  }) {
    this.id = id;
    this.conversation_id = conversation_id;
    this.sender = sender;
    this.text = text;
    this.attachments = attachments;
    this.timestamp = timestamp;
    this.seen_by = seen_by;
    this.hidden_to = hidden_to || []; // default to empty array
  }

  static collectionRef() {
    return collection(db, "messages");
  }

  static async create(data) {
    const { id, ...rest } = data;
    const timeoutMs = 5000; // Timeout after 5 seconds

    // Ensure hidden_to is set to an empty array if not provided.
    if (!rest.hidden_to) rest.hidden_to = [];

    const operation = (async () => {
      if (!id) {
        await addDoc(collection(db, "messages"), rest);
        return new Message(data);
      }
      await setDoc(doc(db, "messages", id), rest);
      return new Message(data);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    );

    // Return whichever completes first: the Firestore operation or the timeout.
    return Promise.race([operation, timeoutPromise]);
  }

  static async get(id) {
    const docSnap = await getDoc(doc(db, "messages", id));
    if (docSnap.exists()) {
      return new Message({ id, ...docSnap.data() });
    }
    return null;
  }

  static async update(id, newData) {
    await updateDoc(doc(db, "messages", id), newData);
    return true;
  }

  static async delete(id) {
    await deleteDoc(doc(db, "messages", id));
    return true;
  }

  /**
   * Hide a message for a given user.
   */
  static async hideMessage(messageId, uid) {
    await updateDoc(doc(db, "messages", messageId), {
      hidden_to: arrayUnion(uid)
    });
    return true;
  }

  static async list() {
    const querySnapshot = await getDocs(Message.collectionRef());
    const messages = [];
    querySnapshot.forEach((docSnap) => {
      messages.push(new Message({ id: docSnap.id, ...docSnap.data() }));
    });
    return messages;
  }
}
