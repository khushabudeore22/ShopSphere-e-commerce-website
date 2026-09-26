import { Schema, model } from 'mongoose';

const wishlistSchema = new Schema({});

const Wishlist = model('Wishlist', wishlistSchema);
export default Wishlist;