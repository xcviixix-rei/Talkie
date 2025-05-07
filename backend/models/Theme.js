import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase.js";

export class Theme {
  constructor({ theme_name, ui_color, other_ui_color, header_color, url }) {
    this.theme_name = theme_name; // Unique identifier for the theme
    this.ui_color = ui_color;
    this.other_ui_color = other_ui_color;
    this.header_color = header_color;
    this.url = url;
  }

  // Returns a reference to the "themes" collection.
  static collectionRef() {
    return collection(db, "themes");
  }

  // Create a new theme document with theme_name as the document ID.
  static async create(data) {
    if (!data.theme_name) {
      throw new Error("theme_name is required");
    }
    // Use theme_name as the document id so that it's unique.
    await setDoc(doc(db, "themes", data.theme_name), data);
    return new Theme(data);
  }

  // Retrieve a theme by its theme_name.
  static async get(theme_name) {
    const docSnap = await getDoc(doc(db, "themes", theme_name));
    if (docSnap.exists()) {
      return new Theme(docSnap.data());
    }
    return null;
  }

  // Update an existing theme by theme_name.
  static async update(theme_name, newData) {
    await updateDoc(doc(db, "themes", theme_name), newData);
    return true;
  }

  // Delete a theme by its theme_name.
  static async delete(theme_name) {
    await deleteDoc(doc(db, "themes", theme_name));
    return true;
  }

  // List all themes.
  static async list() {
    const querySnapshot = await getDocs(Theme.collectionRef());
    const themes = [];
    querySnapshot.forEach((docSnap) => {
      themes.push(new Theme(docSnap.data()));
    });
    return themes;
  }
}