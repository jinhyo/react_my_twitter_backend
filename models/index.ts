import User, { associate as associateUser } from "./user";
import Tweet, { associate as associateTweet } from "./tweet";
import Image, { associate as associateImage } from "./image";
import Hashtag, { associate as associateHashtag } from "./hashtag";

const db = { User, Tweet, Image, Hashtag };

associateUser(db);
associateTweet(db);
associateImage(db);
associateHashtag(db);

export type dbType = typeof db;
