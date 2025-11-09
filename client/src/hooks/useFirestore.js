import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot 
} from '../services/firebase/firestore';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all documents from a collection
  const getCollection = async (collectionName, constraints = []) => {
    setLoading(true);
    setError(null);
    
    try {
      const q = query(collection(collectionName), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get a single document
  const getDocument = async (collectionName, docId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(collectionName, docId);
      const snapshot = await getDoc(docRef);
      
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      } else {
        throw new Error('Document not found');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add a new document
  const addDocument = async (collectionName, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = await addDoc(collection(collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...data };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const updateDocument = async (collectionName, docId, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return { id: docId, ...data };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName, docId) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(collectionName, docId);
      await deleteDoc(docRef);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription to a collection
  const useCollection = (collectionName, constraints = []) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      setLoading(true);
      
      const q = query(collection(collectionName), ...constraints);
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(documents);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    }, [collectionName, ...constraints]);

    return { data, loading, error };
  };

  return {
    loading,
    error,
    getCollection,
    getDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    useCollection
  };
};