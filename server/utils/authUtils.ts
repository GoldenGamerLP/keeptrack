import { Lucia, TimeSpan, generateId, LegacyScrypt } from "lucia";

import { MongodbAdapter } from "@lucia-auth/adapter-mongodb";
import { Collection, ObjectId } from "mongodb";
import database from "~/server/utils/mongodbUtils";

const users = database.collection("users") as Collection<UserDoc>;
const sessions = database.collection("sessions") as Collection<SessionDoc>;

const astro = new LegacyScrypt();
const adapter = new MongodbAdapter(sessions, users);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    UserId: string;
  }
}

interface DatabaseSessionAttributes {
  ip: string;
  loggedin: string;
}

interface DatabaseUserAttributes {
  mail: string;
  last_login: string;
  _id: string;
  displayname: string;
}

interface UserDoc {
  _id: string;
  mail: string;
  password_hash: string;
  last_login: string;
  displayname: string;
}

interface SessionDoc {
  _id: string;
  expires_at: string;
  user_id: string;
}

export interface SafeUser {
  mail: string;
  displayname: string;
  last_login: string;
  _id: string;
}

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "w"),
  getSessionAttributes: (attributes) => {
    return {
      ip: attributes.ip,
      loggedin: attributes.loggedin,
    };
  },
  getUserAttributes: (attributes) => {
    return {
      mail: attributes.mail,
      displayname: attributes.displayname,
      last_login: attributes.last_login,
    };
  },
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  },
});

export function userNameToId(userMail: string) {
  return users.findOne({
    mail: userMail,
  });
}

export async function registerLogin(userId: string, ip: string) {
  await setLastLogin(userId, ip, new Date());
  return createSession(userId, ip);
}

function setLastLogin(userId: string, ip: string, date: Date) {
  return users.updateOne(
    { _id: getObjectID(userId) },
    { $set: { last_login: date.toUTCString(), last_IP: ip } }
  );
}

export async function createUser(
  email: string,
  password: string,
  displayname: string
) {
  const user = {
    _id: generateId(16),
    mail: email.toLowerCase(),
    displayname: displayname,
    password_hash: await hashPassword(password),
    last_login: new Date().toUTCString(),
    last_IP: "unknown",
  };

  const response = await users.insertOne(user);
  return { insertedId: response.insertedId, user };
}

export async function verifyPassword(userId: string, password: string) {
  const currentHash = await users.findOne(
    { _id: getObjectID(userId) },
    { projection: { password_hash: 1 } }
  );
  if (!currentHash) return false;

  return await verifyHash(currentHash.password_hash, password);
}

export async function resolveIdToUsername(userId: string) {
  return (
    (
      await users.findOne(
        { _id: getObjectID(userId) },
        { projection: { mail: 1 } }
      )
    )?.mail ?? null
  );
}

export async function invalidateSession(sessionId: string) {
  return lucia.invalidateSession(sessionId);
}

function getObjectID(id: string) {
  return id;
}

function verifyHash(hashedPassword: string, password: string) {
  return astro.verify(hashedPassword, password);
}

function hashPassword(password: string) {
  return astro.hash(password);
}

export function findSimilarUsers(username: string) {
  return users
    .find(
      {
        $or: [
          { mail: { $regex: username, $options: "i" } },
          { name: { $regex: username, $options: "i" } },
        ],
      },
      { limit: 2 }
    )
    .toArray() as Promise<SafeUser[]>;
}

export async function createSession(userIdentity: string, currentIp: string) {
  return lucia.createSession(getObjectID(userIdentity), {
    ip: currentIp,
    loggedin: new Date().toUTCString(),
  });
}

export async function createSessionCookie(sessionId: string) {
  return lucia.createSessionCookie(sessionId);
}

export function usernameToUserIdentity(mail: string) {
  return users.findOne({ mail: mail.toLowerCase() });
}

export async function lookupUsers(ids: string[]) {
  return (
    await users.find({ _id: { $in: ids.map(getObjectID) } }).toArray()
  ).map((user) => {
    return {
      _id: user._id,
      mail: user.mail,
      last_login: user.last_login,
      displayname: user.displayname,
    } as SafeUser;
  });
}
