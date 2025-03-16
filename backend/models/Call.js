import { doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase.js";

export class Call {
  constructor({ id, type, participants, initiator_id, status, started_at, ended_at, duration, recording_url }) {
    this.id = id;
    this.type = type;
    this.participants = participants;
    this.initiator_id = initiator_id;
    this.status = status;
    this.started_at = started_at;
    this.ended_at = ended_at;
    this.duration = duration;
    this.recording_url = recording_url;
  }

  static collectionRef() {
    return collection(db, "calls");
  }

  static async create(data) {
    const { id, ...rest } = data;
    
    const timeoutMs = 5000; // Timeout after 5 seconds

    const operation = (async () => {
      if (!id) {
        await addDoc(collection(db, "calls"), rest);
        return new Call(data);
      }
      await setDoc(doc(db, "calls", id), rest);
      return new Call(data);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    );

    // Return whichever completes first: the Firestore operation or the timeout.
    return Promise.race([operation, timeoutPromise]);
  }

  static async get(id) {
    const docSnap = await getDoc(doc(db, "calls", id));
    if (docSnap.exists()) {
      return new Call({ id, ...docSnap.data() });
    }
    return null;
  }

  static async update(id, newData) {
    await updateDoc(doc(db, "calls", id), newData);
    return true;
  }

  static async delete(id) {
    await deleteDoc(doc(db, "calls", id));
    return true;
  }

  static async list() {
    const querySnapshot = await getDocs(Call.collectionRef());
    const calls = [];
    querySnapshot.forEach((docSnap) => {
      calls.push(new Call({ id: docSnap.id, ...docSnap.data() }));
    });
    return calls;
  }
}