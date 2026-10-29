import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Conversation } from '../types';

export async function saveConversationToFirestore(
  userId: string,
  conversation: Conversation
): Promise<void> {
  if (!userId || !conversation.id) return;
  const path = `users/${userId}/conversations/${conversation.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'conversations', conversation.id);
    await setDoc(
      docRef,
      {
        id: conversation.id,
        userId,
        title: conversation.title || 'New Chat',
        messages: conversation.messages || [],
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt || Date.now(),
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadUserConversationsFromFirestore(
  userId: string
): Promise<Conversation[]> {
  if (!userId) return [];
  const path = `users/${userId}/conversations`;
  try {
    const colRef = collection(db, 'users', userId, 'conversations');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    const conversations: Conversation[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      conversations.push({
        id: data.id || docSnap.id,
        title: data.title || 'Untitled',
        messages: data.messages || [],
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
        userId,
      });
    });
    return conversations;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteConversationFromFirestore(
  userId: string,
  conversationId: string
): Promise<void> {
  if (!userId || !conversationId) return;
  const path = `users/${userId}/conversations/${conversationId}`;
  try {
    const docRef = doc(db, 'users', userId, 'conversations', conversationId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllConversationsFromFirestore(userId: string): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}/conversations`;
  try {
    const colRef = collection(db, 'users', userId, 'conversations');
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
