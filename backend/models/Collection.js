import { collection, addDoc, setDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase.js";

export class CollectionModel {
  constructor({ _id, user_id, name, icon, conversations, created_at }) {
    this._id = _id; // Unique collection ID
    this.user_id = user_id; // Owner's user ID
    this.name = name; // Collection's display name
    this.icon = icon; // Icon URL or identifier
    this.conversations = conversations || []; // Array of conversation IDs
    this.created_at = created_at;
  }

  // Returns the reference to the "collections" collection in Firestore.
  static collectionRef() {
    return collection(db, "collections");
  }

  // Create a new collection document.
  // If _id is not provided, a new document is created and its id is assigned.
  static async create(data) {
    // Set created_at to current ISO time if not provided.
    if (!data.created_at) {
      data.created_at = new Date().toISOString();
    }
    const { _id, ...rest } = data;
    if (!_id) {
      const docRef = await addDoc(CollectionModel.collectionRef(), rest);
      return new CollectionModel({ _id: docRef.id, ...rest });
    }
    await setDoc(doc(db, "collections", _id), rest);
    return new CollectionModel(data);
  }

  // Retrieve a collection document by its id.
  static async get(id) {
    const docSnap = await getDoc(doc(db, "collections", id));
    if (docSnap.exists()) {
      return new CollectionModel({ _id: docSnap.id, ...docSnap.data() });
    }
    return null;
  }

  // Update a collection by its id with newData (an object containing updated fields).
  static async update(id, newData) {
    await updateDoc(doc(db, "collections", id), newData);
    return true;
  }

  // Delete a collection by its id.
  static async delete(id) {
    await deleteDoc(doc(db, "collections", id));
    return true;
  }

  // List all collections for a specific user.
  static async listByUser(user_id) {
    const q = query(CollectionModel.collectionRef(), where("user_id", "==", user_id));
    const querySnapshot = await getDocs(q);
    const collections = [];
    querySnapshot.forEach((docSnap) => {
      collections.push(new CollectionModel({ _id: docSnap.id, ...docSnap.data() }));
    });
    return collections;
  }
}