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
  getDoc,
  getDocs,
  documentId,
  deleteDoc,
  setDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
  FirestoreError
} from 'firebase/firestore';
import { db } from './firebase';

// --- INTERFACES ---

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL: string;
  bio?: string;
  bannerURL?: string;
  location?: string;
  website?: string;
  birthday?: string;
  gender?: string;
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
  statusEmoji?: string;
  statusExpiresAt?: any;
  createdAt?: any;
}

export interface PollOption {
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  votedBy: string[]; // uids
  expiresAt?: any;
}

export interface Post {
  id?: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  poll?: Poll; // Nuevo: Encuestas funcionales
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
  stickerUrl?: string;
  createdAt: any;
}

export interface Channel {
  id?: string;
  groupId: string;
  name: string;
  type: 'text' | 'voice' | 'announcement';
  description?: string;
  isLocked?: boolean;
  createdAt: any;
}

export interface Message {
  id?: string;
  channelId: string;
  groupId: string;
  senderId: string;
  text: string;
  type?: 'text' | 'image' | 'sticker' | 'audio' | 'video';
  mediaUrl?: string;
  reactions?: { [emoji: string]: string[] }; // emoji -> array de uids
  createdAt: any;
}

export interface Chat {
  id?: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
  createdAt: any;
  typing?: Record<string, number>;
}

export interface Notification {
  id?: string;
  userId: string;
  type: 'message' | 'like' | 'follow' | 'mention';
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  link: string;
  read: boolean;
  createdAt: any;
}

export interface MarketItem {
  id?: string;
  ownerId: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
  location: string;
  condition?: 'new' | 'used' | 'refurbished'; // Nuevo v15
  delivery?: 'shipping' | 'pickup' | 'digital'; // Nuevo v15
  isFeatured?: boolean; // Nuevo v15
  status?: 'active' | 'sold' | 'archived';
  views?: number;
  favorites?: string[];
  createdAt: any;
}

export interface Story {
  id?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  title?: string;
  content: string; // URL del medio o texto del cuerpo
  type: 'image' | 'video' | 'text' | 'poll' | 'qna';
  likes: number; 
  likedBy: string[];
  upvotes: number; // Para foros
  downvotes: number; // Para foros
  pollOptions?: string[]; // Para encuestas
  pollVotes?: { [index: string]: number }; // index_opcion -> cantidad
  votedBy?: string[]; // uids para prevenir doble voto
  createdAt: any;
  expiresAt: any;
}

export interface StoryResponse {
  id?: string;
  storyId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: any;
}

export interface Reel {
  id?: string;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  musicName: string;
  likes: number;
  comments: number;
  videoUrl: string;
  description: string;
  createdAt?: any;
}

export interface Group {
  id?: string;
  name: string;
  description: string;
  avatar: string;
  bannerUrl?: string; // Nuevo
  themeColor?: string; // Nuevo
  inviteCode?: string; // Nuevo para URLs cortas
  ownerId: string;
  membersCount: number;
  createdAt: any;
}

// --- FUNCIONES DE USUARIO ---

export const getUserProfile = async (uid: string) => {
  if (!uid) return null;
  const docRef = doc(db, 'users', uid);
  const snap = await getDoc(docRef);
  return snap.exists() ? { uid: snap.id, ...snap.data() } as UserProfile : null;
};

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

export const setUserStatus = async (uid: string, emoji: string) => {
  const userRef = doc(db, 'users', uid);
  const now = Timestamp.now();
  const expiresAt = new Timestamp(now.seconds + (12 * 60 * 60), now.nanoseconds);
  await updateDoc(userRef, {
    statusEmoji: emoji,
    statusExpiresAt: expiresAt
  });
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

export const getDiscoverUsers = async (limitNum: number = 5) => {
  const q = query(collection(db, 'users'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
};

export const getAllUsers = async (limitNum: number = 200) => {
  const q = query(collection(db, 'users'), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
};

export const followUser = async (currentUserId: string, targetUserId: string) => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
  await updateDoc(targetUserRef, { followers: arrayUnion(currentUserId) });
  
  // Notificar al objetivo
  const me = await getUserProfile(currentUserId);
  if (me) {
    await createNotification({
      userId: targetUserId,
      type: 'follow',
      senderId: currentUserId,
      senderName: me.displayName,
      senderAvatar: me.photoURL,
      content: 'ha comenzado a seguir tu frecuencia cuántica.',
      link: `/profile?uid=${currentUserId}`,
      read: false
    });
  }
};

export const unfollowUser = async (currentUserId: string, targetUserId: string) => {
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetUserId);
  await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
  await updateDoc(targetUserRef, { followers: arrayRemove(currentUserId) });
};

export const checkFollowStatus = async (currentUserId: string, targetUserId: string) => {
  if (!currentUserId || !targetUserId) return false;
  const userRef = doc(db, 'users', currentUserId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return false;
  const following = snap.data().following || [];
  return following.includes(targetUserId);
};

export const subscribeToUserFollowers = (userId: string, callback: (followers: UserProfile[]) => void) => {
  const q = query(collection(db, 'users'), where('following', 'array-contains', userId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[]);
  });
};

export const subscribeToUserFollowing = (userId: string, callback: (following: UserProfile[]) => void) => {
  const q = query(collection(db, 'users'), where('followers', 'array-contains', userId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[]);
  });
};

export const getUserFriends = async (userId: string) => {
  const q = query(collection(db, 'users'), where('followers', 'array-contains', userId));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserProfile[];
};

// --- FUNCIONES DE NOTIFICACIONES ---

export const createNotification = async (notif: Omit<Notification, 'id' | 'createdAt'>) => {
  await addDoc(collection(db, 'notifications'), {
    ...notif,
    createdAt: serverTimestamp(),
  });
};

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Notification[];
    // Ordenar en memoria por createdAt desc
    notifications.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(notifications);
  }, (error) => {
    console.error("Notifications error:", error);
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};

// --- FUNCIONES DE POSTS ---

export const createPost = async (postData: Omit<Post, 'id' | 'createdAt'>) => {
  return await addDoc(collection(db, 'posts'), {
    ...postData,
    createdAt: serverTimestamp(),
    likes: 0,
    likedBy: [],
    comments: 0,
    shares: 0
  });
};

export const subscribeToPosts = (callback: (posts: Post[]) => void, onError?: (error: FirestoreError) => void) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
  }, (error) => {
    console.error("Error subscribing to posts:", error);
    if (onError) onError(error);
  });
};
export const toggleLikePost = async (postId: string, userId: string, isLiked: boolean) => {
  const postRef = doc(db, 'posts', postId);
  if (isLiked) {
    await updateDoc(postRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    });
  } else {
    await updateDoc(postRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    });
    
    // Notificar al autor (si no soy yo mismo)
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const post = postSnap.data() as Post;
      if (post.authorId !== userId) {
        const me = await getUserProfile(userId);
        if (me) {
          await createNotification({
            userId: post.authorId,
            type: 'like',
            senderId: userId,
            senderName: me.displayName,
            senderAvatar: me.photoURL,
            content: 'ha reaccionado a tu post cósmico.',
            link: `/profile/${post.authorId}?postId=${postId}`,
            read: false,
          });
        }
      }
    }
  }
};

export const votePoll = async (postId: string, optionIndex: number, userId: string) => {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (!postSnap.exists()) return;
  
  const post = postSnap.data() as Post;
  if (!post.poll) return;
  
  const votedByArray = post.poll.votedBy || [];
  if (votedByArray.includes(userId)) return;
  
  const newOptions = [...post.poll.options];
  if (newOptions[optionIndex]) {
    newOptions[optionIndex].votes = (newOptions[optionIndex].votes || 0) + 1;
  }
  
  await updateDoc(postRef, {
    'poll.options': newOptions,
    'poll.votedBy': arrayUnion(userId)
  });
};
;

export const deletePost = async (postId: string) => {
  await deleteDoc(doc(db, 'posts', postId));
};

export const updatePost = async (postId: string, content: string) => {
  await updateDoc(doc(db, 'posts', postId), { content });
};

// --- FUNCIONES DE COMENTARIOS ---

export const addComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
  await addDoc(collection(db, 'comments'), {
    ...commentData,
    createdAt: serverTimestamp(),
  });
  const postRef = doc(db, 'posts', commentData.postId);
  await updateDoc(postRef, { comments: increment(1) });
};

export const deleteComment = async (commentId: string, postId: string) => {
  await deleteDoc(doc(db, 'comments', commentId));
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, { comments: increment(-1) });
};

export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
  // Evadimos Firebase Index bloqueando el orderBy cronológico y delegando el ordenamiento al nodo cliente.
  const q = query(collection(db, 'comments'), where('postId', '==', postId));
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
    
    comments.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeA - timeB;
    });

    callback(comments);
  }, (error) => {
    console.warn("Error subscribing to comments:", error);
  });
};

// --- FUNCIONES DE CHAT ---

export const createOrGetChat = async (userId1: string, userId2: string) => {
  const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId1));
  const snapshot = await getDocs(q);
  const existingChat = snapshot.docs.find(doc => doc.data().participants.includes(userId2));
  
  if (existingChat) return existingChat.id;
  
  const newChat = await addDoc(collection(db, 'chats'), {
    participants: [userId1, userId2],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return newChat.id;
};

export const startDirectChat = createOrGetChat;

export const subscribeToUserChats = (userId: string, callback: (chats: any[]) => void) => {
  try {
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
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

export const sendMessage = async (chatId: string, senderId: string, text: string, type: 'text'|'audio'|'image'|'sticker'|'video' = 'text', mediaUrl?: string) => {
  try {
    // 1. Añadir mensaje a la colección global
    await addDoc(collection(db, 'messages'), {
      chatId,
      senderId,
      text,
      type,
      mediaUrl: mediaUrl || null,
      createdAt: serverTimestamp(),
    });
    
    // 2. Intentar actualizar metadatos del chat
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data() as Chat;
        const recipientId = chatData.participants.find(id => id !== senderId);
        
        await updateDoc(chatRef, {
          lastMessage: text,
          updatedAt: serverTimestamp(),
        });

        // 3. Notificar al destinatario
        if (recipientId) {
          const sender = await getUserProfile(senderId);
          if (sender) {
            await createNotification({
              userId: recipientId,
              type: 'message',
              senderId: senderId,
              senderName: sender.displayName,
              senderAvatar: sender.photoURL,
              content: `te ha enviado un mensaje: "${text.substring(0, 30)}..."`,
              link: '/messages',
              read: false
            });
          }
        }
      }
    } catch (metaError) {
      console.warn("No se pudieron actualizar los metadatos del chat:", metaError);
    }
  } catch (error) {
    console.error("Error crítico en sendMessage:", error);
    throw new Error("Falla de transmisión. Asegúrate de estar vinculado a este nodo de chat.");
  }
};

export const setTypingStatus = async (chatId: string, userId: string, isTyping: boolean) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            [`typing.${userId}`]: isTyping ? Date.now() : 0
        });
    } catch (e) {
        console.warn("Error updating typing status", e);
    }
};

export const deleteMessage = async (messageId: string) => {
  await deleteDoc(doc(db, 'messages', messageId));
};

export const subscribeToMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  if (!chatId) return () => {};
  // Quitamos orderBy para evadir el error de Index requerido. Ordenaremos de forma local.
  const q = query(collection(db, 'messages'), where('chatId', '==', chatId));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
    
    // Sort local exacto
    msgs.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeA - timeB;
    });
    
    callback(msgs);
  }, (error) => {
    console.warn("Error subscribing to messages:", error);
  });
};

// --- FUNCIONES DE MARKETPLACE ---

export const subscribeToMarketplace = (callback: (items: MarketItem[]) => void, onError?: (error: FirestoreError) => void) => {
  const q = query(collection(db, 'marketplace'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketItem[];
    // Ordenar en memoria por createdAt desc
    items.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    callback(items);
  }, (error) => {
    console.warn("Marketplace permissions issue:", error);
    if (onError) onError(error);
  });
};

export const addMarketItem = async (item: Omit<MarketItem, 'id' | 'createdAt'>) => {
  return await addDoc(collection(db, 'marketplace'), {
    ...item,
    condition: item.condition || 'used',
    delivery: item.delivery || 'pickup',
    isFeatured: item.isFeatured || false,
    status: 'active',
    views: 0,
    favorites: [],
    createdAt: serverTimestamp()
  });
};

export const purchaseItem = async (itemId: string, buyerId: string) => {
  const itemRef = doc(db, 'marketplace', itemId);
  const snap = await getDoc(itemRef);
  if (!snap.exists()) throw new Error("Item no encontrado.");
  if (snap.data().status === 'sold') throw new Error("Este item ya ha sido adquirido por otro ciudadano.");
  
  await updateDoc(itemRef, { 
    status: 'sold',
    buyerId // Guardar quién lo compró
  });
  
  // Enviar notificación al vendedor
  await createNotification({
    userId: snap.data().ownerId,
    type: 'message',
    senderId: buyerId,
    senderName: "Mercado Nova",
    senderAvatar: "https://cdn3d.iconscout.com/3d/premium/thumb/shopping-cart-4438914-3686566.png",
    content: `¡Tu item "${snap.data().name}" ha sido adquirido! Sincroniza la entrega.`,
    link: '/marketplace',
    read: false
  });
};

export const getFeaturedItems = async (limitNum: number = 3) => {
  const q = query(collection(db, 'marketplace'), where('isFeatured', '==', true), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketItem[];
};

export const updateMarketItem = async (itemId: string, data: Partial<MarketItem>) => {
  const itemRef = doc(db, 'marketplace', itemId);
  await updateDoc(itemRef, data);
};

export const deleteMarketItem = async (itemId: string) => {
  await deleteDoc(doc(db, 'marketplace', itemId));
};

// --- FUNCIONES DE HISTORIAS ---

export const createStory = async (authorId: string, authorName: string, authorAvatar: string, content: string, type: 'image' | 'video' | 'text' | 'poll' | 'qna' = 'image', title?: string, pollOptions?: string[]) => {
  const now = Timestamp.now();
  const expiresAt = new Timestamp(now.seconds + (12 * 60 * 60), now.nanoseconds);
  await addDoc(collection(db, 'stories'), { 
    authorId, authorName, authorAvatar, content, type, title: title || '',
    likes: 0, likedBy: [], upvotes: 0, downvotes: 0, 
    pollOptions: pollOptions || [],
    pollVotes: type === 'poll' ? (pollOptions?.reduce((acc: any, _, i) => ({ ...acc, [i.toString()]: 0 }), {}) || {}) : {},
    votedBy: [],
    createdAt: serverTimestamp(), expiresAt 
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

export const updateStoryVote = async (storyId: string, type: 'up' | 'down', incrementValue: number) => {
  const storyRef = doc(db, 'stories', storyId);
  if (type === 'up') {
    await updateDoc(storyRef, { upvotes: increment(incrementValue) });
  } else {
    await updateDoc(storyRef, { downvotes: increment(incrementValue) });
  }
};

export const voteStoryPoll = async (storyId: string, optionIndex: number, userId: string) => {
  const storyRef = doc(db, 'stories', storyId);
  await updateDoc(storyRef, {
    [`pollVotes.${optionIndex.toString()}`]: increment(1),
    votedBy: arrayUnion(userId)
  });
};

export const addStoryResponse = async (response: Omit<StoryResponse, 'id' | 'createdAt'>) => {
  return await addDoc(collection(db, 'story_responses'), {
    ...response,
    createdAt: serverTimestamp()
  });
};

export const subscribeToStoryResponses = (storyId: string, callback: (responses: StoryResponse[]) => void) => {
  const q = query(collection(db, 'story_responses'), where('storyId', '==', storyId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StoryResponse[]);
  });
};

// --- FUNCIONES DE REELS ---

export const subscribeToReels = (callback: (reels: Reel[]) => void) => {
  const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reel[]);
  }, (error) => {
    console.warn("Reels permissions issue:", error);
  });
};

// --- FUNCIONES DE GRUPOS ---

export const createGroup = async (name: string, description: string, avatar: string, ownerId: string) => {
  if (!ownerId) throw new Error("ID de autor no detectado. Reintente tras conectar la señal.");
  
  // Generar Código de Invitación Corto (6 chars)
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Banners espaciales por defecto
  const banners = [
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1465101162946-4377e57745c3?auto=format&fit=crop&q=80'
  ];
  const bannerUrl = banners[Math.floor(Math.random() * banners.length)];

  try {
    // Crear Grupo
    const groupRef = await addDoc(collection(db, 'groups'), {
      name, 
      description, 
      avatar, 
      ownerId, 
      inviteCode,
      bannerUrl,
      themeColor: '#8B5CF6',
      membersCount: 1, 
      createdAt: serverTimestamp()
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
  } catch (error: any) {
    console.error("Fallo Galáctico en createGroup:", error);
    throw error;
  }
};

export const subscribeToUserGroups = (userId: string, callback: (groups: Group[]) => void) => {
  if (!userId) { callback([]); return () => {}; }
  
  const q = query(collection(db, 'group_members'), where('userId', '==', userId));
  
  return onSnapshot(q, async (membershipSnap) => {
    try {
      const groupIds = membershipSnap.docs.map(doc => doc.data().groupId);
      if (groupIds.length === 0) { callback([]); return; }
      
      // Batch de ids (límite de 10 por Firestore IN query)
      const validGroupIds = groupIds.slice(0, 10);
      const gQuery = query(collection(db, 'groups'), where(documentId(), 'in', validGroupIds));
      
      const gSnap = await getDocs(gQuery);
      const groupsList = gSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Group[];
      callback(groupsList);
    } catch (error) {
      console.error("Fallo al suscribir a grupos del usuario:", error);
      callback([]);
    }
  }, (error) => {
    console.warn("Fallo real-time en group_members:", error);
    callback([]);
  });
};

export const subscribeToAllGroups = (callback: (groups: Group[]) => void) => {
  const q = query(collection(db, 'groups'), orderBy('name', 'asc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Group[]);
  }, (error) => {
    console.error("Fallo al listar todas las comunidades:", error);
  });
};

export const joinGroup = async (groupId: string, userId: string) => {
  const memberQuery = query(
    collection(db, 'group_members'), 
    where('groupId', '==', groupId), 
    where('userId', '==', userId)
  );
  const existing = await getDocs(memberQuery);
  if (!existing.empty) return;

  await addDoc(collection(db, 'group_members'), {
    groupId,
    userId,
    role: 'member',
    joinedAt: serverTimestamp()
  });

  const groupRef = doc(db, 'groups', groupId);
  await updateDoc(groupRef, {
    membersCount: increment(1)
  });
};

export const deleteGroup = async (groupId: string, ownerId: string) => {
  const groupRef = doc(db, 'groups', groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (!groupSnap.exists() || groupSnap.data().ownerId !== ownerId) {
    throw new Error("No tienes autorización galáctica para desintegrar este núcleo.");
  }

  // Cascada de limpieza
  // 1. Canales
  const qCh = query(collection(db, 'channels'), where('groupId', '==', groupId));
  const snapCh = await getDocs(qCh);
  for (const c of snapCh.docs) {
    // 1.1 Mensajes del canal
    const qMsg = query(collection(db, 'messages'), where('channelId', '==', c.id));
    const snapMsg = await getDocs(qMsg);
    for (const m of snapMsg.docs) await deleteDoc(doc(db, 'messages', m.id));
    await deleteDoc(doc(db, 'channels', c.id));
  }

  // 2. Miembros
  const qMem = query(collection(db, 'group_members'), where('groupId', '==', groupId));
  const snapMem = await getDocs(qMem);
  for (const m of snapMem.docs) await deleteDoc(doc(db, 'group_members', m.id));

  // 3. El grupo en sí
  await deleteDoc(groupRef);
};

export const getGroupByInviteCode = async (code: string) => {
  // 1. Check legacy/default group inviteCodes
  const q = query(collection(db, 'groups'), where('inviteCode', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Group;
  }
  
  // 2. Check unique group_invites
  const inviteRef = doc(db, 'group_invites', code.toUpperCase());
  const inviteSnap = await getDoc(inviteRef);
  if (inviteSnap.exists()) {
    const groupId = inviteSnap.data().groupId;
    const groupRef = doc(db, 'groups', groupId);
    const groupSnap = await getDoc(groupRef);
    if (groupSnap.exists()) {
      return { id: groupSnap.id, ...groupSnap.data() } as Group;
    }
  }

  return null;
};

export const generateUniqueInvite = async (groupId: string, creatorId: string) => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  await setDoc(doc(db, 'group_invites', code), {
    groupId,
    creatorId,
    createdAt: serverTimestamp(),
    usedBy: []
  });
  return code;
};

export const subscribeToGroupChannels = (groupId: string, callback: (channels: Channel[]) => void) => {
  if (!groupId) return () => {};
  const q = query(collection(db, 'channels'), where('groupId', '==', groupId));
  return onSnapshot(q, snap => {
    const chs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Channel[];
    chs.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    callback(chs);
  }, e => console.warn(e));
};

export const subscribeToGroupMembers = (groupId: string, callback: (members: any[]) => void) => {
  if (!groupId) return () => {};
  const q = query(collection(db, 'group_members'), where('groupId', '==', groupId));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, e => console.warn(e));
};

export const sendChannelMessage = async (
  channelId: string, 
  groupId: string, 
  senderId: string, 
  text: string, 
  type: 'text' | 'image' | 'sticker' | 'audio' | 'video' = 'text',
  mediaUrl?: string
) => {
  await addDoc(collection(db, 'messages'), {
    channelId, 
    groupId, 
    senderId, 
    text, 
    type,
    mediaUrl: mediaUrl || null,
    reactions: {},
    createdAt: serverTimestamp()
  });
};

export const toggleMessageReaction = async (messageId: string, emoji: string, userId: string) => {
  const msgRef = doc(db, 'messages', messageId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;
  
  const reactions = snap.data().reactions || {};
  const currentUids = reactions[emoji] || [];
  
  if (currentUids.includes(userId)) {
    await updateDoc(msgRef, {
      [`reactions.${emoji}`]: arrayRemove(userId)
    });
  } else {
    await updateDoc(msgRef, {
      [`reactions.${emoji}`]: arrayUnion(userId)
    });
  }
};

export const createChannel = async (groupId: string, name: string, type: 'text' | 'voice' | 'announcement' = 'text') => {
  const channelRef = await addDoc(collection(db, 'channels'), {
    groupId,
    name: name.toLowerCase().replace(/\s+/g, '-'),
    type,
    createdAt: serverTimestamp()
  });
  return channelRef.id;
};

export const deleteChannel = async (channelId: string, ownerId: string) => {
  const channelRef = doc(db, 'channels', channelId);
  const chSnap = await getDoc(channelRef);
  if (!chSnap.exists()) return;
  
  // Verificar que el usuario sea el dueño del grupo
  const groupRef = doc(db, 'groups', chSnap.data().groupId);
  const groupSnap = await getDoc(groupRef);
  if (groupSnap.data()?.ownerId !== ownerId) throw new Error("No tienes permisos para purgar este terminal.");

  // Borrar mensajes
  const qMsg = query(collection(db, 'messages'), where('channelId', '==', channelId));
  const snapMsg = await getDocs(qMsg);
  for (const m of snapMsg.docs) await deleteDoc(doc(db, 'messages', m.id));
  
  await deleteDoc(channelRef);
};

export const subscribeToChannelMessages = (channelId: string, callback: (messages: Message[]) => void) => {
  if (!channelId) return () => {};
  const q = query(collection(db, 'messages'), where('channelId', '==', channelId));
  return onSnapshot(q, snap => {
    const msgs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
    msgs.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
    callback(msgs);
  }, e => console.warn(e));
};

// Gestionar likes en historias/destellos
export const toggleLikeStory = async (storyId: string, userId: string, alreadyLiked: boolean) => {
  const storyRef = doc(db, 'stories', storyId);
  await updateDoc(storyRef, {
    likes: alreadyLiked ? increment(-1) : increment(1),
    likedBy: alreadyLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
};

export const deleteStory = async (storyId: string) => {
  await deleteDoc(doc(db, 'stories', storyId));
};

export const updateStory = async (storyId: string, content: string, title?: string) => {
  await updateDoc(doc(db, 'stories', storyId), { content, title: title || '' });
};