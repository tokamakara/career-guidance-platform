import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment 
} from 'firebase/firestore';
import { db } from './index';

export const firestoreService = {
  // Generic document operations
  async getDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw new Error('Failed to fetch document');
    }
  },

  async createDocument(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  },

  async updateDocument(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { id: docId, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error('Failed to update document');
    }
  },

  async deleteDocument(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  },

  // Query operations
  async queryDocuments(collectionName, conditions = [], options = {}) {
    try {
      let q = collection(db, collectionName);
      
      // Add where conditions
      conditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
      
      // Add ordering
      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
      }
      
      // Add limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      return documents;
    } catch (error) {
      console.error('Error querying documents:', error);
      throw new Error('Failed to query documents');
    }
  },

  // Collection-specific operations
  async getUserApplications(userId, type = 'education') {
    try {
      const applicationsRef = collection(db, `${type}Applications`);
      const q = query(
        applicationsRef, 
        where('studentId', '==', userId),
        orderBy('appliedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const applications = [];
      
      querySnapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() });
      });
      
      return applications;
    } catch (error) {
      console.error('Error getting user applications:', error);
      throw new Error('Failed to fetch applications');
    }
  },

  async getInstitutionCourses(institutionId) {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(
        coursesRef, 
        where('institutionId', '==', institutionId),
        where('status', '==', 'active'),
        orderBy('name', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const courses = [];
      
      querySnapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
      });
      
      return courses;
    } catch (error) {
      console.error('Error getting institution courses:', error);
      throw new Error('Failed to fetch courses');
    }
  },

  async getActiveJobs(filters = {}) {
    try {
      const jobsRef = collection(db, 'jobs');
      let q = query(
        jobsRef, 
        where('status', '==', 'active'),
        orderBy('postedAt', 'desc')
      );
      
      // Add additional filters
      if (filters.industry) {
        q = query(q, where('industry', '==', filters.industry));
      }
      if (filters.jobType) {
        q = query(q, where('type', '==', filters.jobType));
      }
      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }
      
      const querySnapshot = await getDocs(q);
      const jobs = [];
      
      querySnapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() });
      });
      
      return jobs;
    } catch (error) {
      console.error('Error getting active jobs:', error);
      throw new Error('Failed to fetch jobs');
    }
  },

  // Batch operations
  async updateUserApplications(userId, updates) {
    try {
      // Get all user applications
      const educationApps = await this.getUserApplications(userId, 'education');
      const jobApps = await this.getUserApplications(userId, 'job');
      
      const allApps = [...educationApps, ...jobApps];
      const updatePromises = allApps.map(app => 
        this.updateDocument(`${app.type}Applications`, app.id, updates)
      );
      
      await Promise.all(updatePromises);
      return { success: true, updated: allApps.length };
    } catch (error) {
      console.error('Error updating user applications:', error);
      throw new Error('Failed to update applications');
    }
  },

  // Count operations
  async getCollectionCount(collectionName, conditions = []) {
    try {
      const documents = await this.queryDocuments(collectionName, conditions);
      return documents.length;
    } catch (error) {
      console.error('Error counting documents:', error);
      throw new Error('Failed to count documents');
    }
  },

  // Array operations
  async addToArray(collectionName, docId, field, elements) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [field]: arrayUnion(...elements),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error adding to array:', error);
      throw new Error('Failed to update array');
    }
  },

  async removeFromArray(collectionName, docId, field, elements) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [field]: arrayRemove(...elements),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error removing from array:', error);
      throw new Error('Failed to update array');
    }
  },

  // Increment operations
  async incrementField(collectionName, docId, field, amount = 1) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [field]: increment(amount),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error incrementing field:', error);
      throw new Error('Failed to increment field');
    }
  }
};

export default firestoreService;