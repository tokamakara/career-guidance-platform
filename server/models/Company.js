const { db } = require('../config/firebaseAdmin');

class Company {
  static collection = db.collection('companies');

  static async create(companyData) {
    const companyRef = await this.collection.add({
      ...companyData,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'pending'
    });
    return companyRef.id;
  }

  static async findById(companyId) {
    const doc = await this.collection.doc(companyId).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  }

  static async findByUserId(userId) {
    const snapshot = await this.collection.where('userId', '==', userId).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  static async update(companyId, updateData) {
    await this.collection.doc(companyId).update({
      ...updateData,
      updatedAt: new Date()
    });
  }

  static async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async updateStatus(companyId, status) {
    await this.collection.doc(companyId).update({
      status,
      updatedAt: new Date()
    });
  }
}

module.exports = Company;