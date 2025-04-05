import { doc, addDoc, setDoc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { db } from "../firebase.js";
import { query, getDocs, where } from "firebase/firestore";

export class User {
  constructor({ id, username, full_name, profile_pic, status, contacts, created_at }) {
    this.id = id;
    this.username = username;
    this.full_name = full_name;
    this.profile_pic = profile_pic;
    this.status = status;
    this.contacts = contacts;
    this.created_at = created_at;
  }

  static collectionRef() {
    return collection(db, "users");
  }

  static async create(data) {
    const { id, username, ...rest } = data;
    console.log(data);
    
    // Check if a user with the same username already exists
    const q = query(User.collectionRef(), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("Username already exists");
    }
    
    const timeoutMs = 5000; // Timeout after 5 seconds

    const operation = (async () => {
      if (!id) {
        await addDoc(collection(db, "users"), rest);
        return new User(data);
      }
      await setDoc(doc(db, "users", id), rest);
      return new User(data);
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    );

    // Return whichever completes first: the Firestore operation or the timeout.
    return Promise.race([operation, timeoutPromise]);
  }

  static async get(id) {
    const docSnap = await getDoc(doc(db, "users", id));
    if (docSnap.exists()) {
      return new User({ id, ...docSnap.data() });
    }
    return null;
  }

  static async update(id, newData) {
    await updateDoc(doc(db, "users", id), newData);
    return true;
  }

  static async delete(id) {
    await deleteDoc(doc(db, "users", id));
    return true;
  }

  static async list() {
    const querySnapshot = await getDocs(User.collectionRef());
    const users = [];
    querySnapshot.forEach((docSnap) => {
      users.push(new User({ id: docSnap.id, ...docSnap.data() }));
    });
    return users;
  }
}
