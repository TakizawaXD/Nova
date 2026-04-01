
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
  deleteDoc,
  setDoc,
  getDoc,
  Timestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';

// Interfaces extendidas
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
  likedBy?: string[];
  comments: number;
  shares: number;
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: any;
}

export interface Reel {
  id?: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  videoUrl: string;
  description: string;
  musicName: string;
  likes: number;
  comments: number;
  createdAt: any;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL: string;
  bannerURL?: string;
  bio: string;
  location?: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  isVerified?: boolean;
  createdAt: any;
}

// Funciones de Posts & Interacción
export const createPost = async (postData: Omit<Post, 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'posts'), {
    ...postData,
    likedBy: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const toggleLikePost = async (postId: string, userId: string, isLiked: boolean) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: increment(isLiked ? -1 : 1),
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
};

export const addComment = async (commentData: Omit<Comment, 'createdAt'>) => {
  await addDoc(collection(db, 'comments'), {
    ...commentData,
    createdAt: serverTimestamp(),
  });
  const postRef = doc(db, 'posts', commentData.postId);
  await updateDoc(postRef, { comments: increment(1) });
};

export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
  const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
  });
};

// Funciones de Perfil & Seguidores
export const updateProfileData = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

export const followUser = async (followerId: string, followedId: string) => {
  // Crear relación en followers
  await setDoc(doc(db, 'followers', `${followerId}_${followedId}`), {
    followerId,
    followedId,
    createdAt: serverTimestamp()
  });
  // Actualizar contadores
  await updateDoc(doc(db, 'users', followerId), { followingCount: increment(1) });
  await updateDoc(doc(db, 'users', followedId), { followersCount: increment(1) });
};

// Funciones de Reels
export const createReel = async (reelData: Omit<Reel, 'createdAt'>) => {
  await addDoc(collection(db, 'reels'), {
    ...reelData,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToReels = (callback: (reels: Reel[]) => void) => {
  const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reel[]);
  });
};

// Funciones de Chat & Mensajes
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
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]);
  });
};

// Marketplace
export const listMarketItem = async (item: Omit<MarketItem, 'createdAt'>) => {
  await addDoc(collection(db, 'marketplace'), {
    ...item,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToMarketplace = (callback: (items: MarketItem[]) => void) => {
  const q = query(collection(db, 'marketplace'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketItem[]);
  });
};

export const subscribeToPosts = (callback: (posts: Post[]) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
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
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[]);
  });
};

export const subscribeToUserChats = (userId: string, callback: (chats: any[]) => void) => {
  const q = query(
    collection(db, 'chats'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
};

export const createStory = async (authorId: string, authorName: string, authorAvatar: string, imageUrl: string) => {
  const now = Timestamp.now();
  const expiresAt = new Timestamp(now.seconds + (24 * 60 * 60), now.nanoseconds);
  await addDoc(collection(db, 'stories'), { authorId, authorName, authorAvatar, imageUrl, createdAt: serverTimestamp(), expiresAt });
};
