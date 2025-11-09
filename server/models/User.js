const { db } = require('../config/firebaseAdmin');

class User {
  static collection = db.collection('users');

  static async create(userData) {
    const userRef = await this.collection.doc(userData.uid).set({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return userData.uid;
  }

  static async findById(userId) {
    const doc = await this.collection.doc(userId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async update(userId, updateData) {
    await this.collection.doc(userId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  static async updateRole(userId, role) {
    await this.collection.doc(userId).update({
      role,
      updatedAt: new Date()
    });
  }

  static async findByEmail(email) {
    const snapshot = await this.collection.where('email', '==', email).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
}

module.exports = User;