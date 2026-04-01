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
  arrayRemove,
  FirestoreError
} from 'firebase/firestore';
import { db } from './firebase';

// --- INTERFACES ---

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
  birthday?: string;
  gender?: string;
  followersCount: number;
  followingCount: number;
  isVerified?: boolean;
  createdAt: any;
}

export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export interface Story {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  imageUrl?: string;
  title?: string;
  content?: string;
  upvotes?: number;
  downvotes?: number;
  createdAt: any;
  expiresAt: Timestamp;
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

export interface Group {
  id?: string;
  name: string;
  description: string;
  avatar: string;
  ownerId: string;
  membersCount: number;
  createdAt: any;
}

export interface Channel {
  id?: string;
  groupId: string;
  name: string;
  type: 'text' | 'voice';
  createdAt: any;
}

// --- FUNCIONES DE USUARIO ---

export const isUsernameAvailable = async (username: string) => {
  if (!username) return true;
  const q = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  return snapshot.empty;
};

export const updateProfileData = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

export const searchUserByPin = async (pin: string) => {
  if (!pin) return null;
  const pinClean = pin.replace('#', '').toUpperCase();
  const q = query(collection(db, 'users'));
  const snap = await getDocs(q);
  const userDoc = snap.docs.find(doc => doc.id.substring(0, 6).toUpperCase() === pinClean);
  if (!userDoc) return null;
  return { uid: userDoc.id, ...userDoc.data() } as unknown as UserProfile;
};

export const followUser = async (currentUserId: string, targetUserId: string) => {
  if (currentUserId === targetUserId) return;
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  const relationId = currentUserId + "_" + targetUserId;
  await setDoc(doc(db, 'followers', relationId), {
    followerId: currentUserId,
    followedId: targetUserId,
    createdAt: serverTimestamp()
  });
  await updateDoc(currentUserRef, { followingCount: increment(1) });
  await updateDoc(targetUserRef, { followersCount: increment(1) });
};

export const getUserFriends = async (userId: string) => {
  const q = query(collection(db, 'followers'), where('followerId', '==', userId));
  const snap = await getDocs(q);
  const followedIds = snap.docs.map(doc => doc.data().followedId);
  if (followedIds.length === 0) return [];
  // Simulating fetching profiles of friends (in production use batch or multi-query)
  const pals = await Promise.all(followedIds.map(async (fid) => {
    const d = await getDoc(doc(db, 'users', fid));
    return d.exists() ? { uid: d.id, ...d.data() } as unknown as UserProfile : null;
  }));
  return pals.filter(p => p !== null) as UserProfile[];
};

// --- FUNCIONES DE POSTS ---

export const createPost = async (postData: Omit<Post, 'createdAt'>) => {
  return await addDoc(collection(db, 'posts'), {
    ...postData,
    likedBy: [],
    createdAt: serverTimestamp(),
  });
};

export const updatePost = async (postId: string, newContent: string) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, { content: newContent });
};

export const deletePost = async (postId: string) => {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
};

export const subscribeToPosts = (callback: (posts: Post[]) => void, errorCallback?: (error: FirestoreError) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
  }, (error) => {
    console.warn("Permission issue or query failed in posts:", error);
    if (errorCallback) errorCallback(error);
  });
};

export const toggleLikePost = async (postId: string, userId: string, isLiked: boolean) => {
  const postRef = doc(db, 'posts', postId);
  try {
    await updateDoc(postRef, {
      likes: increment(isLiked ? -1 : 1),
      likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId)
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
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
  if (!postId) return () => {};
  const q = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[]);
  }, (error) => {
    console.warn("Permission issue in comments:", error);
  });
};

// --- FUNCIONES DE CHAT ---

export const startDirectChat = async (user1: UserProfile, user2: UserProfile) => {
  // Check if chat exists
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', user1.uid));
  const snap = await getDocs(q);
  const existingChat = snap.docs.find(doc => {
    const p = doc.data().participants;
    return p.includes(user1.uid) && p.includes(user2.uid) && p.length === 2;
  });
  
  if (existingChat) {
    return existingChat.id;
  }
  
  // Create new chat
  const newChat = await addDoc(collection(db, 'chats'), {
    participants: [user1.uid, user2.uid],
    participantData: {
      [user1.uid]: { name: user1.displayName, avatar: user1.photoURL },
      [user2.uid]: { name: user2.displayName, avatar: user2.photoURL }
    },
    updatedAt: serverTimestamp(),
    lastMessage: 'Chat iniciado'
  });
  
  return newChat.id;
};

export const subscribeToUserChats = (userId: string, callback: (chats: any[]) => void) => {
  if (!userId) return () => {};
  try {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenamiento local para evadir error de Índice no creado en Firestore
      chats.sort((a: any, b: any) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });
      callback(chats);
    }, (error) => {
      console.warn("Error subscribing to user chats:", error);
    });
  } catch (e) {
    console.error("Query formation error in chats:", e);
    return () => {};
  }
};

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
  if (!chatId) return () => {};
  const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]);
  }, (error) => {
    console.warn("Error subscribing to messages:", error);
  });
};

// --- OTRAS FUNCIONES ---

export const subscribeToMarketplace = (callback: (items: MarketItem[]) => void) => {
  const q = query(collection(db, 'marketplace'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketItem[]);
  }, (error) => {
    console.warn("Marketplace permissions issue:", error);
  });
};

export const listMarketItem = async (item: Omit<MarketItem, 'createdAt'>) => {
  await addDoc(collection(db, 'marketplace'), {
    ...item,
    createdAt: serverTimestamp(),
  });
};

export const createStory = async (authorId: string, authorName: string, authorAvatar: string, title?: string, content?: string) => {
  const now = Timestamp.now();
  const expiresAt = new Timestamp(now.seconds + (24 * 60 * 60), now.nanoseconds);
  await addDoc(collection(db, 'stories'), { authorId, authorName, authorAvatar, title: title || '', content: content || '', upvotes: 0, downvotes: 0, createdAt: serverTimestamp(), expiresAt });
};

export const updateStoryVote = async (storyId: string, type: 'up' | 'down') => {
  const storyRef = doc(db, 'stories', storyId);
  await updateDoc(storyRef, {
    [type === 'up' ? 'upvotes' : 'downvotes']: increment(1)
  });
};

export const subscribeToActiveStories = (callback: (stories: Story[]) => void) => {
  const now = Timestamp.now();
  const q = query(collection(db, 'stories'), where('expiresAt', '>', now));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Story[]);
  }, (error) => {
    console.warn("Stories permissions issue:", error);
  });
};

export const subscribeToReels = (callback: (reels: Reel[]) => void) => {
  const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reel[]);
  }, (error) => {
    console.warn("Reels permissions issue:", error);
  });
};

// --- FUNCIONES DE GRUPOS (DISCORD CLONE) ---

export const createGroup = async (name: string, description: string, avatar: string, ownerId: string) => {
  // Crear Grupo
  const groupRef = await addDoc(collection(db, 'groups'), {
    name, description, avatar, ownerId, membersCount: 1, createdAt: serverTimestamp()
  });
  
  // Añadir Owner como miembro
  await addDoc(collection(db, 'group_members'), {
    groupId: groupRef.id,
    userId: ownerId,
    role: 'owner',
    joinedAt: serverTimestamp()
  });

  // Crear canal principal
  await addDoc(collection(db, 'channels'), {
    groupId: groupRef.id,
    name: 'general',
    type: 'text',
    createdAt: serverTimestamp()
  });

  return groupRef.id;
};

export const subscribeToUserGroups = (userId: string, callback: (groups: Group[]) => void) => {
  if (!userId) return () => {};
  const q = query(collection(db, 'group_members'), where('userId', '==', userId));
  return onSnapshot(q, async (membershipSnap) => {
    const groupIds = membershipSnap.docs.map(doc => doc.data().groupId);
    if (groupIds.length === 0) { callback([]); return; }
    
    // Chunk constraints (in cases of >10 we should chunk, but for Nova 10 is enough for a demo)
    const gQuery = query(collection(db, 'groups'), where(documentId(), 'in', groupIds.slice(0, 10)));
    const gSnap = await getDocs(gQuery);
    const groups = gSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Group[];
    callback(groups);
  }, e => console.warn(e));
};

export const subscribeToGroupChannels = (groupId: string, callback: (channels: Channel[]) => void) => {
  if (!groupId) return () => {};
  const q = query(collection(db, 'channels'), where('groupId', '==', groupId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Channel[]);
  }, e => console.warn(e));
};

export const subscribeToGroupMembers = (groupId: string, callback: (members: any[]) => void) => {
  if (!groupId) return () => {};
  const q = query(collection(db, 'group_members'), where('groupId', '==', groupId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, e => console.warn(e));
};

export const sendChannelMessage = async (channelId: string, groupId: string, senderId: string, text: string) => {
  await addDoc(collection(db, 'messages'), {
    channelId, groupId, senderId, text, createdAt: serverTimestamp()
  });
};

export const subscribeToChannelMessages = (channelId: string, callback: (messages: Message[]) => void) => {
  if (!channelId) return () => {};
  const q = query(collection(db, 'messages'), where('channelId', '==', channelId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[]);
  }, e => console.warn(e));
};

// --- FUNCIONES DE MARKETPLACE (TIENDA NOVA) ---

export interface MarketItem {
  id?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  category: string;
  imageUrl: string;
  status: 'active' | 'sold';
  createdAt?: any;
}

export const addMarketItem = async (item: Omit<MarketItem, 'id' | 'createdAt'>) => {
  return await addDoc(collection(db, 'market'), {
    ...item,
    createdAt: serverTimestamp()
  });
};

export const subscribeToMarketItems = (callback: (items: MarketItem[]) => void) => {
  const q = query(collection(db, 'market'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketItem[]);
  }, e => console.warn(e));
};