import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { AppNotification } from '../types';

export const createNotification = async (notification: Omit<AppNotification, 'id' | 'read' | 'created'>) => {
  await addDoc(collection(db, 'notifications'), {
    ...notification,
    read: false,
    created: new Date().toISOString(),
  });
};

export const subscribeToNotifications = (userId: string, callback: (notifications: AppNotification[]) => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', 'in', [userId, 'all'])
  );
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AppNotification));
    callback(notifications);
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), {
    read: true,
  });
};
