'use server';

import { addDoc, collection, Firestore } from "firebase/firestore";

type UserAction = 'login' | 'logout';

/**
 * Logs a user activity event to Firestore.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user performing the action.
 * @param action - The type of action ('login' or 'logout').
 */
export async function logUserActivity(firestore: Firestore, userId: string, action: UserAction): Promise<void> {
  if (!userId) {
    console.error("User activity logging failed: userId is missing.");
    return;
  }
  try {
    const activityLog = {
      userId,
      action,
      timestamp: new Date().toISOString(),
    };
    const logCollectionRef = collection(firestore, `users/${userId}/activity_logs`);
    await addDoc(logCollectionRef, activityLog);
  } catch (error) {
    console.error(`Failed to log user '${action}' activity for user ${userId}:`, error);
  }
}
