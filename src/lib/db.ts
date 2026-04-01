
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  where,
  limit,
  doc,
  updateDoc,
  increment,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Interfaces
export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
  likes: number;
  comments: number;
  shares: number;
}

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Chat {
  id?: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
}

export interface Story {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  createdAt: any;
  expiresAt: any;
}

export interface MarketItem {
  id?: string;
  sellerId: string;
  title: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
  location: string;
  createdAt: any;
}

// Post Functions
export const createPost = async (postData: Omit<Post, 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'posts'), {
    ...postData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Post[];
    callback(posts);
  });
};

// Chat & Messaging Functions
export const sendMessage = async (chatId: string, senderId: string, text: string) => {
  await addDoc(collection(db, 'messages'), {
    chatId,
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const q = query(
    collection(db, 'messages'), 
    where('chatId', '==', chatId),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};

export const subscribeToUserChats = (userId: string, callback: (chats: any[]) => void) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(chats);
  });
};

// Stories Functions
export const createStory = async (authorId: string, authorName: string, authorAvatar: string, imageUrl: string) => {
  const now = Timestamp.now();
  const expiresAt = new Timestamp(now.seconds + (24 * 60 * 60), now.nanoseconds);
  
  await addDoc(collection(db, 'stories'), {
    authorId,
    authorName,
    authorAvatar,
    imageUrl,
    createdAt: serverTimestamp(),
    expiresAt,
  });
};

export const subscribeToActiveStories = (callback: (stories: Story[]) => void) => {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'stories'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc')
  );
  return onSnapshot(q, (snapshot) => {
    const stories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Story[];
    callback(stories);
  });
};

// Marketplace Functions
export const listMarketItem = async (item: Omit<MarketItem, 'createdAt'>) => {
  await addDoc(collection(db, 'marketplace'), {
    ...item,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToMarketplace = (callback: (items: MarketItem[]) => void) => {
  const q = query(collection(db, 'marketplace'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MarketItem[];
    callback(items);
  });
};
